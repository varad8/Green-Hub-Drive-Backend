const {
  pool,
  checkUserExistence,
  transporter,
  YOUR_EMAIL,
} = require("./dependencies");

// Get All Notification
const getAllNotification = async (req, res) => {
  try {
    const userid = req.params.userid;

    // Check if userid exists in user_registration table
    const userExists = await checkUserExistence(userid);
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get notifications by userid
    const query = `
      SELECT * FROM notifications
      WHERE userid = ?
    `;
    pool.query(query, [userid], (error, results) => {
      if (error) {
        console.error("Error fetching notifications:", error);
        return res.status(500).json({ error: "Internal server error" });
      } else {
        res.status(200).json(results);
      }
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//Get Notification by userid and notification id
const getNotificationByUserId = async (req, res) => {
  try {
    const userid = req.params.userid;
    const notificationId = req.params.notificationId;

    // Check if userid exists in user_registration table
    const userExists = await checkUserExistence(userid);
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Get notification by userid and notificationId
    const query = `
      SELECT * FROM notifications
      WHERE userid = ? AND id = ?
    `;
    pool.query(query, [userid, notificationId], (error, results) => {
      if (error) {
        console.error("Error fetching notification:", error);
        return res.status(500).json({ error: "Internal server error" });
      } else {
        if (results.length === 0) {
          return res.status(404).json({ error: "Notification not found" });
        } else {
          res.status(200).json(results[0]);
        }
      }
    });
  } catch (error) {
    console.error("Error fetching notification:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

//send Email to Admin
const sendEmailMessage = async (req, res) => {
  const { username, email, mobileno, message } = req.body;

  if (!username || !email || !mobileno || !message) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const htmlBody = `
  <h4>Name :- ${username}</h4>
  <p>Email :- ${email}</p>
  <p>Mobile No :- ${mobileno}</p>
  <hr />

  <b>Message,</b><br/>
  ${message}
  `;

  // Email options
  const mailOptions = {
    from: email,
    to: YOUR_EMAIL,
    subject: "Contact Us",
    html: htmlBody,
  };

  // Send the email
  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.error("Error sending email:", error);
      return res.status(500).json({ error: "Error sending email" });
    } else {
      console.log("Email sent:", info.response);
      return res.status(200).json({
        message: "Thanks for contacting we will contact as soon as possible",
      });
    }
  });
};

module.exports = {
  getAllNotification,
  getNotificationByUserId,
  sendEmailMessage,
};
