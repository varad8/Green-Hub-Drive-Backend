const { pool } = require("./dependencies");
const getChartOfBookingData = async (req, res) => {
  try {
    // Query to fetch all booking data along with EV titles
    const query = `
      SELECT booking.*, ev_profile.title AS evTitle
      FROM booking
      INNER JOIN ev_profile ON booking.stationId = ev_profile.userid;
    `;
    // Execute the query
    pool.query(query, (error, results) => {
      if (error) {
        console.error("Error fetching booking data:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      try {
        // Create an object to store counts of bookings by station and month-year
        const bookingsCountByStationMonthYear = {};
        // Loop through the results and count bookings by station and month-year
        results.forEach((booking) => {
          const { bookedForDate, stationId, evTitle } = booking;
          const [year, month] = bookedForDate.split("-");
          const monthYear = `${getMonthName(Number(month))} ${year}`;
          if (!bookingsCountByStationMonthYear[stationId]) {
            bookingsCountByStationMonthYear[stationId] = {};
          }
          if (!bookingsCountByStationMonthYear[stationId][monthYear]) {
            bookingsCountByStationMonthYear[stationId][monthYear] = {
              count: 0,
              label: monthYear,
              title: evTitle, // Store the EV title
            };
          }
          bookingsCountByStationMonthYear[stationId][monthYear].count++;
        });
        // Convert the object into an array of chart data
        const chartData = Object.entries(bookingsCountByStationMonthYear).map(
          ([stationId, data]) => {
            const stationData = Object.values(data);
            return { stationId, data: stationData };
          }
        );
        // Send the chart data as the response
        res.status(200).json(chartData);
      } catch (err) {
        console.error("Error processing booking data:", err);
        res.status(500).json({ error: "Internal server error" });
      }
    });
  } catch (error) {
    console.error("Error in getChartOfBookingData:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getAllBookingPaymentData = async (req, res) => {
  try {
    // Query to fetch all booking data with payment details and EV title
    const query = `
      SELECT booking.*, ev_profile.title AS evTitle
      FROM booking
      INNER JOIN ev_profile ON booking.stationId = ev_profile.userid;
    `;
    // Execute the query
    pool.query(query, (error, results) => {
      if (error) {
        console.error("Error fetching booking data:", error);
        return res.status(500).json({ error: "Internal server error" });
      }
      // Initialize an object to store aggregated data
      const aggregatedData = {};
      // Loop through the results and aggregate data by month, year, and stationId
      results.forEach((booking) => {
        const paymentDetails = JSON.parse(booking.paymentDetails);
        const createdDate = new Date(paymentDetails.createdDate * 1000); // Convert UNIX timestamp to milliseconds
        const monthYear = `${createdDate.toLocaleString("default", {
          month: "long",
        })} ${createdDate.getFullYear()}`;
        if (!aggregatedData[booking.stationId]) {
          aggregatedData[booking.stationId] = {
            title: booking.evTitle, // Add the EV title to the aggregated data
            data: {},
          };
        }
        if (!aggregatedData[booking.stationId].data[monthYear]) {
          aggregatedData[booking.stationId].data[monthYear] = 0;
        }
        // Add payment amount to aggregated data
        aggregatedData[booking.stationId].data[monthYear] +=
          paymentDetails.amount;
      });
      // Format the aggregated data as required
      const formattedResults = Object.keys(aggregatedData).map((stationId) => ({
        stationId,
        title: aggregatedData[stationId].title, // Include the EV title in the result
        data: Object.keys(aggregatedData[stationId].data).map((key) => ({
          data: aggregatedData[stationId].data[key].toString(),
          label: key,
        })),
      }));
      res.status(200).json(formattedResults);
    });
  } catch (error) {
    console.error("Error in getAllBookingPaymentData:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

const getBookingCounts = async (req, res) => {
  try {
    // Query to fetch all booking data
    const query = `SELECT * FROM booking;`;

    // Execute the query
    pool.query(query, (error, results) => {
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
    console.error("Error in getBookingCounts:", error);
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
  getChartOfBookingData,
  getAllBookingPaymentData,
  getBookingCounts,
};
