const { pool, checkUserExistence } = require("./dependencies");

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

module.exports = {
  getAllNotification,
  getNotificationByUserId,
};
