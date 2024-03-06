const {
  express,
  bcrypt,
  uuidv4,
  pool,
  path,
  moment,
  nodemailer,
  checkUserExistence,
  checkEvAdminExistence,
  multer,
  hashPassword,
  fs,
  transporter,
} = require("./dependencies");

const Razorpay = require("razorpay");
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY, EMAIL_USER, EMAIL_PASSWORD } =
  process.env;

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
    const bookingSlot = req.body.bookingSlot;
    const totalHoursEvBooking = req.body.totalHoursEvBooking;
    const timeForBooked = req.body.timeForBooked;
    const bookForDate = req.body.bookedForDate;
    const stationid = req.body.stationid;

    console.log(
      amount,
      email,
      name,
      mobile,
      userId,
      evid,
      bookingSlot,
      timeForBooked,
      totalHoursEvBooking,
      bookForDate,
      stationid
    );

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
          mobile: mobile,
          userId: userId,
          evid: evid,
          bookingSlot: bookingSlot,
          timeForBooked: timeForBooked,
          totalHoursEvBooking: totalHoursEvBooking,
          bookForDate: bookForDate,
          stationid: stationid,
          createdAt: order.created_at,
        });
      } else {
        res.status(400).send({ success: false, msg: "Something went wrong!" });
      }
    });
  } catch (error) {
    console.log(error.message);
  }
};

//Fetch Payments of that order according orderid
const fetchPaymentsForOrder = async (req, res) => {
  try {
    // Retrieve the orderId from the request parameters
    const orderId = req.params.orderId;

    // Check if orderId is provided
    if (!orderId) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Call the fetchPayments method
    razorpayInstance.orders.fetchPayments(orderId, (err, data) => {
      if (err) {
        console.error("Error fetching payments:", err);
        return res.status(500).json({ error: "Error fetching payments" });
      } else {
        console.log("Payments:", data.items);
        // Send the fetched payment data in the response
        return res.status(200).json({ payments: data.items });
      }
    });
  } catch (error) {
    console.error("Error fetching payments:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//save the booking
const saveBookings = async (req, res) => {
  try {
    // Extract payment data from the request body
    const payData = req.body;

    const stationExists = await checkEvAdminExistence(payData.stationId);
    if (!stationExists) {
      return res.status(404).json({ error: "Station user not found" });
    }

    const userExist = await checkUserExistence(payData.userId);
    if (!userExist) {
      return res.status(404).json({ error: "User not found" });
    }

    // Save the payment data to the database
    const query = `
      INSERT INTO booking (
        userId, 
        evid, 
        stationId, 
        bookingSlot, 
        timeForBooked, 
        totalHoursEvBooking, 
        bookedForDate, 
        currentTimestamp, 
        totalPayable, 
        bookingStatus, 
        remark, 
        visitingStatus, 
        bookingRefId, 
        paymentDetails
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
    `;

    // Execute the SQL query with the payment data
    await pool.query(query, [
      payData.userId,
      payData.evid,
      payData.stationId,
      payData.bookingSlot,
      payData.timeForBooked,
      payData.totalHoursEvBooking,
      payData.bookedForDate,
      Date.now(), // Use current timestamp
      payData.totalPayable,
      payData.bookingStatus,
      payData.remark || null,
      payData.visitingStatus,
      payData.bookingRefId,
      JSON.stringify(payData.paymentDetails),
    ]);

    // Send a success response
    res
      .status(200)
      .json({ success: true, message: "Payment data saved successfully" });
  } catch (error) {
    // Handle errors
    console.error("Error saving payment data:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
};

// Generate the Invoice and Send Via Email
const sendInvoice = async (req, res) => {
  const userid = req.params.userid;
  const bookingData = req.body.bookingDetails;

  console.log(userid, bookingData);

  if (!userid || !bookingData) {
    return res.status(400).json({ error: "Userid And data required" });
  }

  const userExist = await checkUserExistence(userid);
  if (!userExist) {
    return res.status(404).json({ error: "User not found" });
  }

  console.log("Received request body:", bookingData);

  // HTML template for the email body
  const htmlBody = `
    <h1 style="font-family: Arial, sans-serif;text-align:center">Invoice</h1>
<p style="font-family: Arial, sans-serif; margin-bottom: 10px;">
    <strong>Invoice Number:</strong>
    INV-${generateInvoiceNumber()}
</p>
<p style="font-family: Arial, sans-serif; margin-bottom: 10px;"><strong>Invoice Date:</strong> ${getCurrentDate()}</p>

<p style="font-family: Arial, sans-serif; margin-bottom: 10px;">
    <strong>From :</strong>
    ${bookingData.stationId} | ${bookingData.evid}
</p>

<p style="font-family: Arial, sans-serif; margin-bottom: 10px;">
    <strong>To :</strong>
    ${bookingData.userId}
</p>


<hr style="margin-bottom: 20px;">
<table style="border-collapse: collapse; width: 100%; margin-bottom: 20px;" border="1">
    <tr>
        <th style="padding: 8px; text-align: left; background-color: #f2f2f2;">Description</th>
        <th style="padding: 8px; text-align: left; background-color: #f2f2f2;">Hours</th>
        <th style="padding: 8px; text-align: left; background-color: #f2f2f2;">Total</th>
    </tr>
    <tr>
        <td style="padding: 8px; text-align: left;">EV Station Booking [ St.Id :- ${
          bookingData.stationId
        }<br />
            Ev Id :- ${bookingData.evid}]</td>
        <td style="padding: 8px; text-align: left;">${
          bookingData.totalHoursEvBooking
        }</td>
        <td style="padding: 8px; text-align: left;">₹ ${
          bookingData.totalPayable
        }</td>
    </tr>
</table>


<h3 style="font-family: Arial, sans-serif;">Booking Details</h3>
<table border="1" style="border-collapse: collapse; width: 100%;">
    <tr>
        <th style="padding: 8px; text-align: left; background-color: #f2f2f2;">Booking Slot</th>
        <td style="padding: 8px; text-align: left;">${
          bookingData.bookingSlot
        }</td>
    </tr>
    <tr>
        <th style="padding: 8px; text-align: left; background-color: #f2f2f2;">Time for Booked</th>
        <td style="padding: 8px; text-align: left;">${
          bookingData.timeForBooked
        }</td>
    </tr>
    <tr>
        <th style="padding: 8px; text-align: left; background-color: #f2f2f2;">Total Hours for EV Booking</th>
        <td style="padding: 8px; text-align: left;">${
          bookingData.totalHoursEvBooking
        }</td>
    </tr>
    <tr>
        <th style="padding: 8px; text-align: left; background-color: #f2f2f2;">Booked For Date</th>
        <td style="padding: 8px; text-align: left;">${
          bookingData.bookedForDate
        }</td>
    </tr>
    <tr>
        <th style="padding: 8px; text-align: left; background-color: #f2f2f2;">Current Timestamp</th>
        <td style="padding: 8px; text-align: left;">${new Date(
          bookingData.currentTimestamp
        ).toLocaleString()}</td>
    </tr>

    <tr>
        <th style="padding: 8px; text-align: left; background-color: #f2f2f2;">Booking Status</th>
        <td style="padding: 8px; text-align: left;">${
          bookingData.bookingStatus
        }</td>
    </tr>
    <tr>
        <th style="padding: 8px; text-align: left; background-color: #f2f2f2;">Remark</th>
        <td style="padding: 8px; text-align: left;">${bookingData.remark}</td>
    </tr>
    <tr>
        <th style="padding: 8px; text-align: left; background-color: #f2f2f2;">Total Payable</th>
        <td style="padding: 8px; text-align: left;">₹ ${bookingData.totalPayable.toFixed(
          2
        )}</td>
    </tr>
</table>

<h3 style="font-family: Arial, sans-serif;">Payment Details</h3>
<table border="1" style="border-collapse: collapse; width: 100%;">

    <tr>
        <th style="padding: 8px; text-align: left; background-color: #f2f2f2;">Payment Type</th>
        <td style="padding: 8px; text-align: left;">${
          bookingData.paymentDetails.paymentType
        }</td>
    </tr>
    <tr>
        <th style="padding: 8px; text-align: left; background-color: #f2f2f2;">Payment Status</th>
        <td style="padding: 8px; text-align: left;">${
          bookingData.paymentDetails.paymentStatus
        }</td>
    </tr>
    <tr>
        <th style="padding: 8px; text-align: left; background-color: #f2f2f2;">Amount</th>
        <td style="padding: 8px; text-align: left;">$${bookingData.paymentDetails.amount.toFixed(
          2
        )}</td>
    </tr>
    <tr>
        <th style="padding: 8px; text-align: left; background-color: #f2f2f2;">Created Date</th>
        <td style="padding: 8px; text-align: left;">${new Date(
          bookingData.paymentDetails.createdDate
        ).toLocaleString()}
        </td>
    </tr>
</table>

<br />
<hr />
<p style="font-family: Arial, sans-serif;">This is a computer-generated invoice and does not require a signature.</p>
<p style="font-family: Arial, sans-serif;">Thank you for using our service!</p>
<p style="font-family: Arial, sans-serif;"><b>EvGlob</b> - Your EV Booking Solution</p>
`;

  // Function to generate a random invoice number (for demonstration purposes)
  function generateInvoiceNumber() {
    return Math.floor(Math.random() * 10000) + 1;
  }

  // Function to mask card number
  // function maskCardNumber(cardNumber) {
  //   const lastDigit = cardNumber.slice(-4);
  //   const maskedDigits = "X".repeat(cardNumber.length - 4);
  //   return maskedDigits + lastDigit;
  // }

  // Function to get the current date
  function getCurrentDate() {
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, "0");
    const mm = String(today.getMonth() + 1).padStart(2, "0"); // January is 0!
    const yyyy = today.getFullYear();
    return `${mm}/${dd}/${yyyy}`;
  }

  // Email options
  const mailOptions = {
    from: "varadnikharage201@gmail.com",
    to: bookingData.email,
    subject: "Booking Details",
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
        message:
          "Invoice Generated,Email Sent Successfully on email address " +
          bookingData.email,
      });
    }
  });
};

module.exports = {
  createOrder,
  fetchPaymentsForOrder,
  saveBookings,
  sendInvoice,
};
