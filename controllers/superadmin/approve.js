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
  checkSuperAdminExistence,
  multer,
  moment,
  fs,
} = require("./dependencies");

//Get Profile Using Admin Id
const updateEvAccountStatus = async (req, res) => {
  const { adminId, stationid } = req.params;
  if (!adminId) {
    return res.status(400).json({ error: "AdminId required" });
  }
  if (!stationid) {
    return res.status(400).json({ error: "Station Id required" });
  }

  try {
    // Check if the station exists and the admin is a super admin
    const stationExist = await checkEvAdminExistence(stationid);
    const adminExist = await checkSuperAdminExistence(adminId);
    if (!stationExist) {
      return res.status(404).json({ error: "Station Not Found" });
    }
    if (!adminExist) {
      return res.status(404).json({ error: "Admin Not Found" });
    }

    // Fetch the EV station profile details
    const query = "SELECT * FROM superadmin_profile WHERE adminId = ?";
    pool.query(query, [adminId], (error, results) => {
      if (error) {
        console.error("Error fetching Admin Profile:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Admin Profile Not Found" });
      }

      const adminProfile = results[0];

      const newAccountStatus = {
        status: "ACTIVE",
        approvedBy: adminProfile.firstName + " " + adminProfile.lastName,
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        adminID: adminProfile.adminId,
        remark: "Approved",
      };

      const updateQuery =
        "UPDATE ev_profile SET accountStatus = ? WHERE userid = ?";
      pool.query(
        updateQuery,
        [JSON.stringify(newAccountStatus), stationid],
        (updateError) => {
          if (updateError) {
            console.error("Error updating account status:", updateError);
            return res.status(500).json({ error: "Internal server error" });
          }

          res
            .status(200)
            .json({ message: "Account status updated successfully" });
        }
      );
    });
  } catch (error) {
    console.error("Error updating account status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Disapprove
const disapproveEvAccountStatus = async (req, res) => {
  const { adminId, stationid } = req.params;
  if (!adminId) {
    return res.status(400).json({ error: "AdminId required" });
  }
  if (!stationid) {
    return res.status(400).json({ error: "Station Id required" });
  }

  try {
    // Check if the station exists and the admin is a super admin
    const stationExist = await checkEvAdminExistence(stationid);
    const adminExist = await checkSuperAdminExistence(adminId);
    if (!stationExist) {
      return res.status(404).json({ error: "Station Not Found" });
    }
    if (!adminExist) {
      return res.status(404).json({ error: "Admin Not Found" });
    }

    // Fetch the EV station profile details
    const query = "SELECT * FROM superadmin_profile WHERE adminId = ?";
    pool.query(query, [adminId], (error, results) => {
      if (error) {
        console.error("Error fetching Admin Profile:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: "Admin Profile Not Found" });
      }

      const adminProfile = results[0];

      const newAccountStatus = {
        status: "NOT ACTIVE",
        approvedBy: adminProfile.firstName + " " + adminProfile.lastName,
        updatedAt: moment().format("YYYY-MM-DD HH:mm:ss"),
        adminID: adminProfile.adminId,
        remark: "Not Approved",
      };

      const updateQuery =
        "UPDATE ev_profile SET accountStatus = ? WHERE userid = ?";
      pool.query(
        updateQuery,
        [JSON.stringify(newAccountStatus), stationid],
        (updateError) => {
          if (updateError) {
            console.error("Error updating account status:", updateError);
            return res.status(500).json({ error: "Internal server error" });
          }

          res
            .status(200)
            .json({ message: "Account status updated successfully" });
        }
      );
    });
  } catch (error) {
    console.error("Error updating account status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

module.exports = {
  updateEvAccountStatus,
  disapproveEvAccountStatus,
};
