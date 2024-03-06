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
  multer,
  moment,
  fs,
} = require("./dependencies");

// Get Booking data by stationid
const getBookingDataUsingStationId = async (req, res) => {
  try {
    const stationId = req.params.stationid;

    const stationExists = await checkEvAdminExistence(stationId);
    if (!stationExists) {
      return res.status(404).json({ error: "Station user not found" });
    }

    // Query to fetch booking data by stationId
    const query = `SELECT * FROM booking WHERE stationId = ?;`;
    // Execute the query
    pool.query(query, [stationId], (error, results) => {
      if (error) {
        console.error("Error fetching booking data:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      // Map results to the desired format
      const formattedResults = results.map((booking) => {
        return {
          userId: booking.userId,
          evid: booking.evid,
          stationId: booking.stationId,
          bookingSlot: booking.bookingSlot,
          timeForBooked: booking.timeForBooked,
          totalHoursEvBooking: booking.totalHoursEvBooking,
          bookedForDate: booking.bookedForDate,
          currentTimestamp: booking.currentTimestamp,
          totalPayable: booking.totalPayable,
          bookingStatus: booking.bookingStatus,
          remark: booking.remark,
          visitingStatus: booking.visitingStatus,
          visitingTimeStamp: booking.visitingTimeStamp,
          paymentDetails: JSON.parse(booking.paymentDetails),
          bookingRefId: booking.bookingRefId,
        };
      });
      res.status(200).json(formattedResults);
    });
  } catch (error) {
    console.error("Error in getBookingDataByStationId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//update booking status and visiting status [visitingStatus,bookingStatus]
const updateBookingStatusByOrderId = async (req, res) => {
  try {
    const orderId = req.params.orderid;

    const bookingUpdatingData = {
      visitingStatus: "Visited",
      bookingStatus: "Visited",
    };

    // Check if the user profile already exists
    const bookigExistQuery = "SELECT * FROM booking WHERE bookingRefId = ?";
    pool.query(bookigExistQuery, [orderId], async (error, results, fields) => {
      if (error) {
        console.error("Error checking booking existence:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

      // If profile exists, update it
      if (results.length > 0) {
        const updateQuery = "UPDATE booking SET ? WHERE bookingRefId = ?";
        pool.query(
          updateQuery,
          [bookingUpdatingData, orderId],
          (error, results, fields) => {
            if (error) {
              console.error("Error updating booking Status:", error);
              return res.status(500).json({ error: "Internal server error" });
            }
            res.status(200).json({ message: "Mark as Visited Successfully" });
          }
        );
      } else {
        // If profile does not exist, return error as profile should be created first
        return res.status(400).json({
          error: "Booking data does not exist try again later",
        });
      }
    });
  } catch (error) {
    console.error("Error saving or updating visitng status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Visualize chart data
const getChartOfBookingDataByUserId = async (req, res) => {
  try {
    const userId = req.params.userid;
    const userExist = await checkEvAdminExistence(userId);
    if (!userExist) {
      return res.status(404).json({ error: "User not found" });
    }
    // Query to fetch booking data by userId
    const query = `SELECT * FROM booking WHERE stationId = ?;`;
    // Execute the query
    pool.query(query, [userId], (error, results) => {
      if (error) {
        console.error("Error fetching booking data:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      // Create an object to store counts of bookings by month and year
      const bookingsCountByMonthYear = {};
      // Loop through the results and count bookings by month and year
      results.forEach((booking) => {
        const { bookedForDate } = booking;
        const [year, month] = bookedForDate.split("-");
        const monthYear = `${getMonthName(Number(month))} ${year}`;
        if (!bookingsCountByMonthYear[monthYear]) {
          bookingsCountByMonthYear[monthYear] = { count: 0, label: monthYear };
        }
        bookingsCountByMonthYear[monthYear].count++;
      });
      // Convert the object into an array of chart data
      const chartData = Object.values(bookingsCountByMonthYear);
      // Send the chart data as the response
      res.status(200).json(chartData);
    });
  } catch (error) {
    console.error("Error in getBookingDataByUserId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Get Payment Data by User Id
const getBookingPaymentDataByUserId = async (req, res) => {
  try {
    const userId = req.params.userid;
    const userExist = await checkEvAdminExistence(userId);
    if (!userExist) {
      return res.status(404).json({ error: "User not found" });
    }
    // Query to fetch booking data by userId
    const query = `SELECT * FROM booking WHERE stationId = ?;`;
    // Execute the query
    pool.query(query, [userId], (error, results) => {
      if (error) {
        console.error("Error fetching booking data:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      // Initialize an object to store aggregated data
      const aggregatedData = {};
      // Loop through the results and aggregate data by month and year
      results.forEach((booking) => {
        const paymentDetails = JSON.parse(booking.paymentDetails);
        const createdDate = new Date(paymentDetails.createdDate * 1000); // Convert UNIX timestamp to milliseconds
        const monthYear = `${createdDate.toLocaleString("default", {
          month: "long",
        })} ${createdDate.getFullYear()}`;
        if (!aggregatedData[monthYear]) {
          aggregatedData[monthYear] = 0;
        }
        // Add payment amount to aggregated data
        aggregatedData[monthYear] += paymentDetails.amount;
      });
      // Format the aggregated data as required
      const formattedResults = Object.keys(aggregatedData).map((key) => ({
        data: aggregatedData[key].toString(),
        label: key,
      }));
      res.status(200).json(formattedResults);
    });
  } catch (error) {
    console.error("Error in getBookingDataByUserId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Get Counting Data
const getBookingCountsByUserId = async (req, res) => {
  try {
    const userId = req.params.userid;
    const userExist = await checkEvAdminExistence(userId);
    if (!userExist) {
      return res.status(404).json({ error: "User not found" });
    }

    // Query to fetch booking data by userId
    const query = `SELECT * FROM booking WHERE stationId = ?;`;

    // Execute the query
    pool.query(query, [userId], (error, results) => {
      if (error) {
        console.error("Error fetching booking data:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Initialize counts
      let todaysBookingCount = 0;
      let notVisitedCount = 0;
      let visitedCount = 0;
      let totalBookingCount = results.length;

      // Get today's date
      const today = new Date().toISOString().split("T")[0];

      // Loop through the results and count bookings
      results.forEach((booking) => {
        const { bookedForDate, visitingStatus } = booking;

        // Count today's bookings
        if (bookedForDate === today) {
          todaysBookingCount++;
        }

        // Count visited and not visited bookings
        if (visitingStatus === "Visited") {
          visitedCount++;
        } else {
          notVisitedCount++;
        }
      });

      // Prepare response data
      const responseData = {
        todaysBookingCount,
        notVisitedCount,
        visitedCount,
        totalBookingCount,
      };

      // Send the response
      res.status(200).json(responseData);
    });
  } catch (error) {
    console.error("Error in getBookingCountsByUserId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Function to get month name from month number
const getMonthName = (monthNumber) => {
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  return months[monthNumber - 1];
};

module.exports = {
  getBookingDataUsingStationId,
  updateBookingStatusByOrderId,
  getBookingPaymentDataByUserId,
  getChartOfBookingDataByUserId,
  getBookingCountsByUserId,
};
