const {
  express,
  bcrypt,
  uuidv4,
  hashPassword,
  generateUniqueEvid,
  pool,
  path,
  checkUserExistence,
  checkEvAdminExistence,
  multer,
  moment,
  fs,
} = require("./dependencies");

// Define multer storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Set the destination folder for file uploads
    cb(null, path.join(__dirname, "../../uploads"));
  },
  filename: function (req, file, cb) {
    // Generate a timestamp
    const timestamp = Date.now();
    // Get the file extension
    const ext = path.extname(file.originalname);
    // Set the filename to be the timestamp, underscore, and file extension
    const filename = `${timestamp}_${file.originalname}`;
    cb(null, filename);
  },
});

// Initialize multer with the storage configuration
const upload = multer({ storage: storage }).single("file");

//Admin  Registration [Super Admin]
const superAdminRegister = async (req, res) => {
  const { email, password, confirmpassword, createdBy } = req.body;

  if (!createdBy) {
    return res.status(400).json({ error: "Created By required" });
  }

  // Check if email or password is empty
  if (!email) {
    return res.status(400).json({ error: "Email required" });
  }
  if (!password) {
    return res.status(400).json({ error: "Password required" });
  }

  if (!confirmpassword) {
    return res.status(400).json({ error: "Confirm Password required" });
  }

  // Password validation
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{6,}$/;
  if (!passwordRegex.test(password) || !passwordRegex.test(confirmpassword)) {
    return res.status(400).json({
      error:
        "Password must be at least 6 characters long and contain at least one uppercase letter, one number, and one special symbol",
    });
  }

  if (password !== confirmpassword) {
    return res.status(400).json({
      error: "Password and Confirm Password does not march",
    });
  }

  try {
    // Check if the email is already registered
    const emailExistsQuery =
      "SELECT * FROM superadmin_registration  WHERE email = ?";
    pool.query(emailExistsQuery, [email], async (error, results) => {
      if (error) {
        console.error("Error checking email existence:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (results.length > 0) {
        return res.status(409).json({ error: "Email is already registered" });
      }

      // Generate unique admin (Admin ID)
      const adminId = await generateUniqueEvid();

      const hashedPassword = await hashPassword(password);
      const insertUserQuery =
        "INSERT INTO superadmin_registration  (email, password, adminId,createdBy) VALUES (?, ?, ?, ?)";
      const insertProfileQuery =
        "INSERT INTO superadmin_profile (adminId, accountType,registeredAs) VALUES (?, ?, ?)";

      // Insert super admin registration
      pool.query(
        insertUserQuery,
        [email, hashedPassword, adminId, createdBy],
        (error, results) => {
          if (error) {
            console.error("Error registering super admin:", error);
            return res.status(500).json({ error: "Internal server error" });
          }

          // Insert super admin
          pool.query(
            insertProfileQuery,
            [adminId, "Owner", "Owner"],
            (error, results) => {
              if (error) {
                console.error("Error creating super admin profile:", error);
                return res.status(500).json({ error: "Internal server error" });
              }
              res.status(201).json({
                message: "Super Admin registered successfully",
                adminId,
              });
            }
          );
        }
      );
    });
  } catch (error) {
    console.error("Error registering super admin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Admin Login [Super Admin]
const superadminLogin = async (req, res) => {
  const { email, password } = req.body;

  console.log("Im Call");

  // Check if email or password is empty
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  try {
    const query = "SELECT * FROM superadmin_registration WHERE email = ?";
    pool.query(query, [email], async (error, results, fields) => {
      if (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = results[0];
      const passwordMatch = await bcrypt.compare(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ error: "Invalid password" });
      }

      // User found, now fetch corresponding profile data
      const adminId = user.adminId;
      const profileQuery = "SELECT * FROM superadmin_profile WHERE adminId = ?";
      pool.query(profileQuery, [adminId], (profileError, profileResults) => {
        if (profileError) {
          console.error("Error fetching profile:", profileError);
          return res.status(500).json({ error: "Internal server error" });
        }
        const adminProfile = profileResults[0];

        res.json({
          message: "Login successful",
          profile: adminProfile,
        });
      });
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Get Admin Profile
//Get Profile Using Admin Id
const getSuperAdminProfile = async (req, res) => {
  const { adminId } = req.params;
  if (!adminId) {
    return res.status(400).json({ error: "AdminId required" });
  }

  try {
    const query = "SELECT * FROM superadmin_profile WHERE adminId = ?";
    pool.query(query, [adminId], async (error, results, fields) => {
      if (error) {
        console.error("Error logging in:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      if (results.length === 0) {
        return res.status(404).json({ error: "User not found" });
      }

      const user = results[0];

      // User found, now fetch corresponding profile data
      const adminId = user.adminId;
      const profileQuery = "SELECT * FROM superadmin_profile WHERE adminId = ?";
      pool.query(profileQuery, [adminId], (profileError, profileResults) => {
        if (profileError) {
          console.error("Error fetching user profile:", profileError);
          return res.status(500).json({ error: "Internal server error" });
        }
        const userProfile = profileResults[0];

        // Combine user and profile data and send as response
        res.json({
          profile: userProfile,
        });
      });
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Owner Update profile --> Super Admin Profile
const updateSuperAdminProfile = async (req, res) => {
  const { adminId } = req.params;
  const { firstname, lastname, mobile, dob, address } = req.body;

  // Check if profileData is empty
  if (!firstname || !lastname || !mobile || !dob || !address || !adminId) {
    return res.status(400).json({ error: "All profile fields are required" });
  }

  // Validate mobile number format
  const mobileRegex = /^\d{10}$/;
  if (!mobileRegex.test(mobile)) {
    return res.status(400).json({ error: "Mobile number must be 10 digits" });
  }

  // Validate date of birth format (yyyy-mm-dd)
  if (!moment(dob, "YYYY-MM-DD", true).isValid()) {
    return res
      .status(400)
      .json({ error: "Invalid date of birth format. Please use yyyy-mm-dd" });
  }

  const profileData = {
    firstName: firstname,
    lastName: lastname,
    mobileNo: mobile,
    dob: dob,
    address: address,
  };

  try {
    // Check if the user profile already exists
    const profileExistsQuery =
      "SELECT * FROM superadmin_profile WHERE adminId = ?";
    pool.query(
      profileExistsQuery,
      [adminId],
      async (error, results, fields) => {
        if (error) {
          console.error("Error checking profile existence:", error);
          return res.status(500).json({ error: "Internal server error" });
        }

        // If profile exists, update it
        if (results.length > 0) {
          const updateQuery =
            "UPDATE superadmin_profile SET ? WHERE adminId = ?";
          pool.query(
            updateQuery,
            [profileData, adminId],
            (error, results, fields) => {
              if (error) {
                console.error("Error updating profile:", error);
                return res.status(500).json({ error: "Internal server error" });
              }
              res
                .status(200)
                .json({ message: "Admin profile updated successfully" });
            }
          );
        } else {
          // If profile does not exist, return error as profile should be created first
          return res.status(400).json({
            error:
              "Admin profile does not exist. Please create a profile first.",
          });
        }
      }
    );
  } catch (error) {
    console.error("Error saving or updating profile:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Update Admin Profile
// Update profile image and delete profile image
const uploadAdminProfileImage = async (req, res) => {
  try {
    // Check if userid is provided
    if (!req.params.adminId) {
      return res.status(400).json({ error: "Admin ID is required" });
    }

    upload(req, res, (err) => {
      if (err) {
        console.error("Error uploading file:", err);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Check if a file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: "File is required" });
      }

      const fileName = req.file.filename;
      const adminId = req.params.adminId;

      // Check if the adminID exists in the superadmin_profile table
      const userQuery = "SELECT * FROM superadmin_profile WHERE adminId = ?";
      pool.query(userQuery, [adminId], (error, results) => {
        if (error) {
          console.error("Error checking user:", error);
          return res.status(500).json({ error: "Internal server error" });
        }

        // Check if user exists
        if (!results || results.length === 0) {
          return res.status(404).json({ error: "User not found" });
        }

        // Get the user's profile pic from the superadmin_profile table
        const profilePicQuery =
          "SELECT profilepic FROM superadmin_profile WHERE adminId = ?";
        pool.query(profilePicQuery, [adminId], (error, profileResults) => {
          if (error) {
            console.error("Error getting admin profile:", error);
            return res.status(500).json({ error: "Internal server error" });
          }

          // Delete previous profile picture if it exists
          const previousProfilePic = profileResults[0].profilepic;
          if (previousProfilePic) {
            fs.unlink(
              path.join(__dirname, `../../uploads/${previousProfilePic}`),
              (err) => {
                if (err) {
                  console.error(
                    "Error deleting previous profile picture:",
                    err
                  );
                }
              }
            );
          }

          // Update profilepic field in user_profile table
          const updateProfilePicQuery =
            "UPDATE superadmin_profile SET profilepic = ? WHERE adminId = ?";
          pool.query(
            updateProfilePicQuery,
            [fileName, adminId],
            (error, updateResults) => {
              if (error) {
                console.error("Error updating admin picture:", error);
                return res.status(500).json({ error: "Internal server error" });
              }

              // Construct the URL of the uploaded file
              const fileUrl = `${req.protocol}://${req.get(
                "host"
              )}/uploads/${fileName}`;

              // Send the response with the file URL
              res.json({
                message: "File uploaded successfully",
                fileName,
                fileUrl,
              });
            }
          );
        });
      });
    });
  } catch (error) {
    console.error("Error uploading file:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Get Profile image by filename
const getSuperAdminProfileImage = async (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, `../../uploads/${filename}`);

  // Check if the file exists
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      console.error("Error retrieving file:", err);
      return res.status(404).json({ error: "File not found" });
    }

    // Send the file as a response
    res.sendFile(filePath);
  });
};

module.exports = {
  superAdminRegister,
  superadminLogin,
  updateSuperAdminProfile,
  getSuperAdminProfile,
  uploadAdminProfileImage,
  getSuperAdminProfileImage,
};
