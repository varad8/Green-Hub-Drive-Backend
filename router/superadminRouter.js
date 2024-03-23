// superadminRouter.js
const express = require("express");
const router = express.Router();

const {
  superAdminRegister,
  superadminLogin,
  updateSuperAdminProfile,
  getSuperAdminProfile,
  uploadAdminProfileImage,
  getSuperAdminProfileImage,
} = require("../controllers/superadmin/auth");

const {
  updateEvAccountStatus,
  disapproveEvAccountStatus,
} = require("../controllers/superadmin/approve");

const {
  getChartOfBookingData,
  getAllBookingPaymentData,
  getBookingCounts,
} = require("../controllers/superadmin/chartData");

// Define routes for superadmin
router.get("/", (req, res) => {
  res.send("UNAUTHORIZED");
});

/**--------------------[Super Admin Registration]------------- */

// Owner Registration --> Super Admin Registration
router.route("/register").post(superAdminRegister);

// Owner Registration --> Super Admin Login
router.route("/login").post(superadminLogin);

// Update Owner Profile --> Super Admin Profile Details Update
router.route("/:adminId/profile/update").put(updateSuperAdminProfile);

router.route("/:adminId/profile").get(getSuperAdminProfile);

router.route("/:adminId/profilepic/update").put(uploadAdminProfileImage);

router.route("/image/:filename").get(getSuperAdminProfileImage);

/**--------------------[Approve / Disapprove Ev]------------- */

router.route("/approve/:adminId/:stationid").put(updateEvAccountStatus);
router.route("/disapprove/:adminId/:stationid").put(disapproveEvAccountStatus);

/**-------------------------[Charts]-------------------------------- */
router.route("/chart/booking").get(getChartOfBookingData);
router.route("/chart/payment").get(getAllBookingPaymentData);
router.route("/chart/counts").get(getBookingCounts);

module.exports = router;
