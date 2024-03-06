const {
  YOUR_EMAIL,
  WEB_URL,
  express,
  bcrypt,
  uuidv4,
  pool,
  path,
  nodemailer,
  transporter,
  moment,
  checkUserExistence,
  multer,
  hashPassword,
  fs,
} = require("./dependencies");

// Generate unique token
const generateToken = () => {
  return uuidv4();
};

// Send email with password reset link
const sendResetEmail = async (email, token) => {
  const resetLink = `${WEB_URL}/api/admin/forgot/reset-password?token=${token}`;

  const mailOptions = {
    from: YOUR_EMAIL,
    to: email,
    subject: "Password Reset",
    text: `Click the following link to reset your password: ${resetLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Reset email sent successfully");
  } catch (error) {
    console.error("Error sending reset email:", error);
    throw new Error("Error sending reset email");
  }
};

// Store reset token in database
const storeTokenInDatabase = async (userId, token, expiresAt) => {
  const selectQuery =
    "SELECT id, expires_at, token FROM password_reset_tokens WHERE user_id = ?";
  const insertQuery =
    "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)";
  const updateQuery =
    "UPDATE password_reset_tokens SET token = ?, expires_at = ? WHERE user_id = ?";

  try {
    // Check if a reset token exists for the user
    pool.query(selectQuery, [userId], (error, results) => {
      if (error) {
        console.error("Error checking token existence:", error);
        return;
      }

      if (results.length > 0) {
        // If a reset token exists, update it
        pool.query(updateQuery, [token, expiresAt, userId], (updateError) => {
          if (updateError) {
            console.error("Error updating token in database:", updateError);
          } else {
            console.log("Token updated in database");
          }
        });
      } else {
        // If no reset token exists, insert a new one
        pool.query(insertQuery, [userId, token, expiresAt], (insertError) => {
          if (insertError) {
            console.error("Error storing new token in database:", insertError);
          } else {
            console.log("New token stored in database");
          }
        });
      }
    });
  } catch (error) {
    console.error("Error storing/updating token in database:", error);
  }
};

//Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  console.log(email);

  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }

  try {
    const query = "SELECT * FROM ev_registration WHERE email = ?";
    pool.query(query, [email], async (error, results, fields) => {
      if (error) {
        console.error("Error fetching user:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = results[0];
      const userid = user.id;

      const token = generateToken();
      const expiresAt = moment().add(1, "hours").format("YYYY-MM-DD HH:mm:ss");

      await storeTokenInDatabase(userid, token, expiresAt);
      await sendResetEmail(email, token);

      res.status(200).json({ message: "Reset email sent successfully" });
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Reset password route
const FormRestPassword = async (req, res) => {
  res.sendFile(path.join(__dirname, "reset-password.html"));
};

// Reset password route
const RestPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{6,}$/;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      error:
        "Password must be at least 6 characters long and contain at least one uppercase letter, one number, and one special symbol",
    });
  }

  try {
    const userId = await validateToken(token);
    if (!userId) {
      return res.status(400).json({ error: "Invalid or expired token" });
    }

    // Reset password for the user
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query("UPDATE ev_registration SET password = ? WHERE id = ?", [
      hashedPassword,
      userId,
    ]);

    // Delete the reset token from the database
    await deleteTokenFromDatabase(token);

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    console.error("Error processing reset password request:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Validate reset token
const validateToken = (token) => {
  console.log("Token to validate:", token);

  const query = `
    SELECT user_id FROM password_reset_tokens
    WHERE token = ? AND expires_at > NOW();
  `;

  return new Promise((resolve, reject) => {
    pool.query(query, [token], (error, rows, fields) => {
      if (error) {
        console.error("Error executing query:", error);
        return reject(error);
      }

      console.log("Query result:", rows); // Log the query result

      if (rows.length === 1) {
        console.log("Token is valid");
        resolve(rows[0].user_id);
      } else {
        console.log("Token is invalid or expired");
        resolve(null);
      }
    });
  });
};

// Delete reset token from database
const deleteTokenFromDatabase = async (token) => {
  const query = `
    DELETE FROM password_reset_tokens
    WHERE token = ?;
  `;

  try {
    await pool.query(query, [token]);
    console.log("Token deleted from database");
  } catch (error) {
    console.error("Error deleting token from database:", error);
    throw new Error("Error deleting token from database");
  }
};

module.exports = { forgotPassword, FormRestPassword, RestPassword };
