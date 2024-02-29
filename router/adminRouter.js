const express = require("express");
const bodyParser = require("body-parser");

const {
  adminRegister,
  adminLogin,
  updateAdminProfile,
  getAdminProfile,
  updateAdminProfilePic,
  getAdminProfilePic,
  deleteAdminProfilePic,
  updateImageUrl,
  getImageUrl,
  deleteImageUrl,
} = require("../controllers/admin/auth");

const {
  sendNotificationUser,
  getAllNotificationByStationUserId,
  deleteNotificationByNotificationId,
  updateNotificationByNotificationId,
  getNotificationByNotificationId,
} = require("../controllers/admin/notification");

const router = express.Router();

router.use(bodyParser.json());

// Define routes for admin
router.get("/", (req, res) => {
  console.log(generateUniqueEvid());
  res.send("Admin Home Page");
});

/**--------------------------[ Owner Registration / Login ]---------------------------------------- */

// Owner Registration --> EV User Registration
router.route("/register").post(adminRegister);

// Owner Login --> EV User Login
router.route("/login").post(adminLogin);

// Owner update profile --> Ev User
router.route("/:userid").post(updateAdminProfile);

//Owner get profile --> Ev user
router.route("/:userid").get(getAdminProfile);

/** ------------------------ [Image Uploading using Multer and fs ] ------------------------------*/
//update profilepic of owener
router.route("/upload/:userid").post(updateAdminProfilePic);

//get admin profilepic
router.route("/image/:filename").get(getAdminProfilePic);

// Route for deleting an image based on the user's userid
router.route("/image/:userid/:filename").delete(deleteAdminProfilePic);

// Update ImageUrl for cover image
router.route("/uploadImageUrl/:userid").post(updateImageUrl);

// Route for getting an image by imageUrl
router.route("/imageByUrl/:filename").get(getImageUrl);

// Route for deleting an image by imageUrl
router.route("/imageByUrl/:userid/:filename").delete(deleteImageUrl);

/** ------------------------ [ Send Notification to that User ] ------------------------------*/
// Define the route to send a notification
router.route("/sendnotification/:userid").post(sendNotificationUser);

// Get All notification from notification using stationuserid
router
  .route("/notifications/:stationuserid")
  .get(getAllNotificationByStationUserId);

// Delete Notification from notifications by using stationuserid and notification id
router
  .route("/notification/:id/:stationuserid")
  .delete(deleteNotificationByNotificationId);

// Also Update notification by using notification id and stationuserid
router
  .route("/notification/:id/:stationuserid")
  .put(updateNotificationByNotificationId);

// Get notification by using notificationid and stationuserid
router
  .route("/notifications/:stationid/:notificationId")
  .get(getNotificationByNotificationId);

module.exports = router;
