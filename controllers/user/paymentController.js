const Razorpay = require("razorpay");
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

const razorpayInstance = new Razorpay({
  key_id: RAZORPAY_ID_KEY,
  key_secret: RAZORPAY_SECRET_KEY,
});

const createOrder = async (req, res) => {
  try {
    const amount = req.body.amount * 100;
    const email = req.body.email;
    const name = req.body.name;
    const mobile = req.body.mobile;
    const userId = req.body.userid;
    const evid = req.body.evid;
    const bookingSlot = req.body.slot;
    const totalHoursEvBooking = req.body.hours;
    const timeForBooked = req.body.timeforbooked;
    const bookForDate = req.body.bookedForDate;

    const options = {
      amount: amount,
      currency: "INR",
      receipt: email,
    };

    razorpayInstance.orders.create(options, (err, order) => {
      if (!err) {
        res.status(200).send({
          success: true,
          msg: "Order Created",
          order_id: order.id,
          amount: amount,
          key_id: RAZORPAY_ID_KEY,
          product_name: req.body.name,
          description: req.body.description,
          contact: mobile,
          name: name,
          email: email,
        });
      } else {
        res.status(400).send({ success: false, msg: "Something went wrong!" });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  createOrder,
};
