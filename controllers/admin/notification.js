const {
  pool,
  checkUserExistence,
  checkEvAdminExistence,
} = require("./dependencies");

//Send Notification to user
const sendNotificationUser = async (req, res) => {
  try {
    // Extract data from the request body
    const { stationuserid, notificationTitle, notificationMessage } = req.body;
    const userid = req.params.userid;

    // Check if any of the fields are empty
    if (
      !userid ||
      !stationuserid ||
      !notificationTitle ||
      !notificationMessage
    ) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if userid exists in user_registration table
    const userExists = await checkUserExistence(userid);
    if (!userExists) {
      return res.status(404).json({ error: "User not found" });
    }

    // Check if stationuserid exists in ev_registration table
    const stationExists = await checkEvAdminExistence(stationuserid);
    if (!stationExists) {
      return res.status(404).json({ error: "Station user not found" });
    }

    // Insert a notification into the notifications table
    const notificationQuery = `
      INSERT INTO notifications (userid, stationuserid, notificationTitle, notificationMessage)
      VALUES (?, ?, ?, ?)
    `;
    const notificationValues = [
      userid,
      stationuserid,
      notificationTitle,
      notificationMessage,
    ];
    pool.query(notificationQuery, notificationValues, (error, results) => {
      if (error) {
        console.error("Error creating notification:", error);
        return res.status(500).json({ error: "Internal server error" });
      } else {
        res.status(200).json({ message: "Notification sent successfully" });
      }
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get All notification from notification using stationuserid
const getAllNotificationByStationUserId = async (req, res) => {
  try {
    const stationuserid = req.params.stationuserid;

    if (!stationuserid) {
      return res.status(409).json({ error: "Station id cant entered" });
    }

    // Check if stationuserid exists in ev_registration table
    const stationExists = await checkEvAdminExistence(stationuserid);
    if (!stationExists) {
      return res.status(404).json({ error: "Station user not found" });
    }

    // Query to retrieve all notifications for the given stationuserid
    const query = "SELECT * FROM notifications WHERE stationuserid = ?";
    pool.query(query, [stationuserid], (error, results) => {
      if (error) {
        console.error("Error retrieving notifications:", error);
        return res.status(500).json({ error: "Internal server error" });
      } else {
        res.status(200).json(results);
      }
    });
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete Notification from notifications by using stationuserid and notification id
const deleteNotificationByNotificationId = async (req, res) => {
  try {
    const id = req.params.id;
    const stationuserid = req.params.stationuserid;

    if (!id || !stationuserid) {
      return res.status(409).json({ error: "Id and station id cant entered" });
    }

    // Check if stationuserid exists in ev_registration table
    const stationExists = await checkEvAdminExistence(stationuserid);
    if (!stationExists) {
      return res.status(404).json({ error: "Station user not found" });
    }

    // Delete the notification with the given id and stationuserid
    const query =
      "DELETE FROM notifications WHERE id = ? AND stationuserid = ?";
    pool.query(query, [id, stationuserid], (error, results) => {
      if (error) {
        console.error("Error deleting notification:", error);
        return res.status(500).json({ error: "Internal server error" });
      } else {
        if (results.affectedRows === 0) {
          return res.status(404).json({ error: "Notification not found" });
        }
        res.status(200).json({ message: "Notification deleted successfully" });
      }
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Also Update notification by using notification id and stationuserid
const updateNotificationByNotificationId = async (req, res) => {
  try {
    const id = req.params.id;
    const stationuserid = req.params.stationuserid;
    const { notificationTitle, notificationMessage } = req.body;

    if (!id || !stationuserid || !notificationTitle || !notificationMessage) {
      return res
        .status(409)
        .json({ error: "Id,stationid,ntitle,nmessage cant entered" });
    }

    // Check if stationuserid exists in ev_registration table
    const stationExists = await checkEvAdminExistence(stationuserid);
    if (!stationExists) {
      return res.status(404).json({ error: "Station user not found" });
    }

    // Update the notification with the given id and stationuserid
    const query = `
      UPDATE notifications
      SET notificationTitle = ?, notificationMessage = ?
      WHERE id = ? AND stationuserid = ?
    `;
    pool.query(
      query,
      [notificationTitle, notificationMessage, id, stationuserid],
      (error, results) => {
        if (error) {
          console.error("Error updating notification:", error);
          return res.status(500).json({ error: "Internal server error" });
        } else {
          if (results.affectedRows === 0) {
            return res.status(404).json({ error: "Notification not found" });
          }
          res
            .status(200)
            .json({ message: "Notification updated successfully" });
        }
      }
    );
  } catch (error) {
    console.error("Error updating notification:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Get notification by using notificationid and stationuserid
const getNotificationByNotificationId = async (req, res) => {
  try {
    const stationid = req.params.stationid;
    const notificationId = req.params.notificationId;

    // Check if stationid exists in ev_registration table
    const stationExists = await checkEvAdminExistence(stationid);
    if (!stationExists) {
      return res.status(404).json({ error: "Station not found" });
    }

    // Get notification by stationid and notificationId
    const query = `
      SELECT * FROM notifications
      WHERE stationuserid = ? AND id = ?
    `;
    pool.query(query, [stationid, notificationId], (error, results) => {
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
  sendNotificationUser,
  getAllNotificationByStationUserId,
  deleteNotificationByNotificationId,
  updateNotificationByNotificationId,
  getNotificationByNotificationId,
};
