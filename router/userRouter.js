const express = require("express");
const bodyParser = require("body-parser");

const {
  userLogin,
  userRegister,
  updateUserProfile,
  uploadProfileImage,
  getProfileImage,
  deleteProfileImage,
  getUserProfileByUserId,
  getAllEvStations,
  getEvStationByUserid,
} = require("../controllers/user/auth");

const {
  checkSlotAvailablity,
  checkSlotAvailabilityForStation,
} = require("../controllers/user/booking");
const {
  getAllNotification,
  getNotificationByUserId,
} = require("../controllers/user/notification");

const router = express.Router();

router.use(bodyParser.json());

// Define routes for user
router.get("/", (req, res) => {
  res.send("User Home Page");
});

/** ------------------------ [ User Registration and Login] ------------------------------*/
// User Registration
router.route("/register").post(userRegister);

// User Login
router.route("/login").post(userLogin);

// Update user profile
router.route("/:userid").put(updateUserProfile);

// Get user profile by userid
router.route("/:userid").get(getUserProfileByUserId);

/** ------------------------ [ Booking slot Availability checking] ------------------------------*/

router.route("/checkAvailability").post(checkSlotAvailablity);
router
  .route("/checkAvailability/:userid")
  .post(checkSlotAvailabilityForStation);

/** ------------------------ [Image Uploading using Multer and fs ] ------------------------------*/
//Upload profile image
router.route("/upload/:userid").post(uploadProfileImage);

//get Profile image
router.route("/image/:filename").get(getProfileImage);

//Delete Profile Image
router.route("/image/:userid/:filename").delete(deleteProfileImage);

/** ------------------------ [ Get Notification ] ------------------------------*/
//Get all Notification by userid
router.route("/notifications/:userid").get(getAllNotification);

//Get notification by userid and notification id
router
  .route("/notifications/:userid/:notificationId")
  .get(getNotificationByUserId);

/** ------------------------ [ Get  EvStations ] ------------------------------*/

//Get All Evstations
router.route("/evstations/all").get(getAllEvStations);

//Get EvStation by userid
router.route("/evstation/:userid").get(getEvStationByUserid);

module.exports = router;
