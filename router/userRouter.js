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
  forgotPassword,
  RestPassword,
  FormRestPassword,
} = require("../controllers/user/passwordReset");

const {
  checkSlotAvailablity,
  checkSlotAvailabilityForStation,
  getBookingDataByStationId,
  getBookingDataByUserId,
  getBookingDataById,
  getChartOfBookingDataByUserId,
  getBookingPaymentData,
  getBookingCountsByUserId,
} = require("../controllers/user/booking");
const {
  getAllNotification,
  getNotificationByUserId,
  sendEmailMessage,
} = require("../controllers/user/notification");

const {
  createOrder,
  fetchPaymentsForOrder,
  saveBookings,
  sendInvoice,
} = require("../controllers/user/paymentController");

const {
  getAllRatingsByUserId,
  getRatingByOrderId,
  saveRating,
  updateRating,
  getRatingsofStation,
} = require("../controllers/user/rating");

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

//Forgot Password
router.route("/forgot-password").post(forgotPassword);

//Reset Password
router.route("/forgot/reset-password").get(FormRestPassword);
router.route("/forgot/reset-password").post(RestPassword);

/** ------------------------ [ Booking slot Availability checking] ------------------------------*/

router.route("/checkAvailability").post(checkSlotAvailablity);
router
  .route("/checkAvailability/:userid")
  .post(checkSlotAvailabilityForStation);

//save booking
router.route("/savebooking").post(saveBookings);

//Get Booking data by userid
router.route("/bookings/u/:userid").get(getBookingDataByUserId);

//Get Booking data by stationid
router.route("/bookings/s/:stationid").get(getBookingDataByStationId);

//Get Booking Data by bookingRefId
router.route("/bookings/bid/:bookingRefId").get(getBookingDataById);

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

//Send Email Message
router.route("/contact").post(sendEmailMessage);

/** ------------------------ [ Get  EvStations ] ------------------------------*/

//Get All Evstations
router.route("/evstations/all").get(getAllEvStations);

//Get EvStation by userid
router.route("/evstation/:userid").get(getEvStationByUserid);

/** ------------------------ [ Payment  ] ------------------------------*/
router.route("/payments").post(createOrder);
router.route("/payments/:orderId").get(fetchPaymentsForOrder);
router.route("/invoice/sendinvoice/:userid").post(sendInvoice);

/** ------------------------ [ Ratings  ] ------------------------------*/
router.route("/ratings/get/all/:userid").get(getAllRatingsByUserId);
router.route("/ratings/get/single/:orderid").get(getRatingByOrderId);
router.route("/ratings/save").post(saveRating);
router.route("/ratings/updateRating").put(updateRating);
router.route("/ratings/get/:stationid").get(getRatingsofStation);

/** ------------------------ [ Visualise  ] ------------------------------*/
router.route("/chart/:userid/getbooking").get(getChartOfBookingDataByUserId);
router.route("/chart/:userid/getpayment").get(getBookingPaymentData);
router.route("/chart/:userid/getcount").get(getBookingCountsByUserId);

module.exports = router;
