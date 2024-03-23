const {
  path,
  pool,
  moment,
  ejs,
  checkEvAdminExistence,
  checkUserExistence,
} = require("./dependencies");

// Checking slot availability
const checkSlotAvailablity = async (req, res) => {
  try {
    // Extracting required data from the request body
    const { date, slot, slothours, time, city, state } = req.body;

    if (!date || !slot || !slothours || !time || !city || !state) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate date format
    if (!moment(date, "YYYY-MM-DD", true).isValid()) {
      return res.status(400).json({
        error: "Invalid date format. Date must be in yyyy-mm-dd format",
      });
    }

    // Check if the provided date is in the past
    const currentDate = moment().format("YYYY-MM-DD");
    if (date < currentDate) {
      return res.status(400).json({ error: "Selected date is in the past" });
    }

    // If the date is today, check if the provided time is in the past
    if (date === currentDate) {
      const currentTime = moment().format("HH:mm");
      if (time < currentTime) {
        return res.status(400).json({ error: "Selected time is in the past" });
      }
    }

    // Query to fetch all EV profiles
    const evQuery = `SELECT * FROM ev_profile;`;

    // Execute the query to get EV profiles
    pool.query(evQuery, async (error, evStations) => {
      if (error) {
        console.error("Error fetching ev_profiles:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Filter stations with accountStatus.status === 'ACTIVE'
      evStations = evStations.filter((station) => {
        const accountStatus = JSON.parse(station.accountStatus);
        return accountStatus?.status === "ACTIVE";
      });

      // Parse JSON strings and convert evTimings format
      evStations = evStations.map((station) => {
        const formattedEvTimings = {};
        try {
          const timings = JSON.parse(station.evTimings);
          for (const day in timings) {
            const openingTime = timings[day].openingTime.split(":");
            const closingTime = timings[day].closingTime.split(":");
            formattedEvTimings[day] = {
              openingTime: {
                hours: parseInt(openingTime[0]),
                minutes: parseInt(openingTime[1]),
              },
              closingTime: {
                hours: parseInt(closingTime[0]),
                minutes: parseInt(closingTime[1]),
              },
            };
          }
        } catch (error) {
          console.error(
            `Error parsing evTimings for station with id ${station.id}:`,
            error
          );
          formattedEvTimings = {}; // Set empty object if parsing fails
        }

        return {
          id: station.id,
          evid: station.evid,
          title: station.title,
          description: station.description,
          location: JSON.parse(station.location),
          coordinates: JSON.parse(station.coordinates),
          address: station.address,
          rate: station.rate,
          evTimings: formattedEvTimings,
          imageUrl: station.imageUrl,
          profile: JSON.parse(station.profile),
          updatedAt: station.updatedAt,
          accountType: station.accountType,
          userid: station.userid,
          accountStatus: JSON.parse(station.accountStatus),
        };
      });

      // Filter EV stations based on the provided city and state
      evStations = evStations.filter((station) => {
        const stationLocation = station.location;
        // Check if stationLocation is not null and contains city and state properties
        return (
          stationLocation &&
          stationLocation.city === city &&
          stationLocation.state === state
        );
      });

      // Query to fetch all bookings
      const bookingsQuery = `SELECT * FROM booking;`;

      // Execute the query to get all bookings
      pool.query(bookingsQuery, async (error, bookings) => {
        if (error) {
          console.error("Error fetching bookings:", error);
          return res.status(500).json({ error: "Internal server error" });
        }

        // Call getBookingData function to generate time suggestions and return response of time suggestions
        getBookingData(evStations, bookings, date, slot, slothours, time, res);
      });
    });
  } catch (error) {
    console.error("Error in checkAvailability route:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

function getBookingData(
  evStationProfile,
  evBookingData,
  selectedDate,
  selectedSlot,
  selectedHours,
  selectedTime,
  res
) {
  if (
    !selectedDate ||
    !selectedSlot ||
    !evStationProfile ||
    !selectedHours ||
    !evBookingData ||
    !selectedTime
  ) {
    console.error("Missing required parameters.");
    return;
  }

  const currentDate = new Date();
  const selectedDateTime = new Date(selectedDate + "T" + selectedTime);

  // Check if the selected date and time are in the past
  if (selectedDateTime < currentDate) {
    return res
      .status(409)
      .json({ error: "Selected date or time is in the past." });
  }

  generateTimeSuggestions(
    evStationProfile,
    evBookingData,
    selectedHours,
    selectedDate,
    selectedSlot,
    res
  );
}

function getDateOfWeek(dateString) {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const date = new Date(dateString);
  const dayOfWeek = days[date.getDay()];
  return dayOfWeek;
}

function generateTimeSuggestions(
  evStationProfile,
  evBookingData,
  hours,
  date,
  slot,
  res
) {
  console.log(evStationProfile, evBookingData, hours, date, slot);

  const selectedHours = parseInt(hours, 10);
  const allTimeSuggestions = []; // Array to accumulate time suggestions for all stations

  evStationProfile.forEach((station) => {
    const dayOfWeek = getDateOfWeek(date);

    const openingTime = station.evTimings[dayOfWeek].openingTime;
    const closingTime = station.evTimings[dayOfWeek].closingTime;

    const openingDateTime = new Date(date);
    openingDateTime.setHours(openingTime.hours, openingTime.minutes, 0, 0);

    const closingDateTime = new Date(date);
    closingDateTime.setHours(closingTime.hours, closingTime.minutes, 0, 0);

    const stationBookings = evBookingData.filter(
      (booking) =>
        booking.stationId === station.userid &&
        booking.bookedForDate === date &&
        booking.bookingSlot === slot
    );

    let currentSlotStart = new Date();
    const currentDate = new Date();

    if (currentDate.toDateString() === openingDateTime.toDateString()) {
      const openingDateTimeWithCurrentDate = new Date(currentDate);
      openingDateTimeWithCurrentDate.setHours(
        openingTime.hours,
        openingTime.minutes,
        0,
        0
      );

      if (currentDate >= openingDateTimeWithCurrentDate) {
        currentSlotStart = new Date(currentDate);
      } else {
        currentSlotStart = new Date(openingDateTimeWithCurrentDate.getTime());
      }
    } else {
      currentSlotStart = new Date(openingDateTime.getTime());
    }

    const suggestions = [];

    while (currentSlotStart < closingDateTime) {
      const currentSlotEnd = new Date(currentSlotStart.getTime());
      currentSlotEnd.setHours(currentSlotEnd.getHours() + selectedHours);

      if (currentSlotEnd > closingDateTime) {
        break;
      }

      const overlappingBooking = stationBookings.some((booking) => {
        const bookingStart = new Date(
          booking.bookedForDate + "T" + booking.timeForBooked
        );
        const bookingEnd = new Date(bookingStart.getTime());
        bookingEnd.setHours(
          bookingEnd.getHours() + parseInt(booking.totalHoursEvBooking, 10)
        );

        return (
          (currentSlotStart >= bookingStart && currentSlotStart < bookingEnd) ||
          (currentSlotEnd > bookingStart && currentSlotEnd <= bookingEnd) ||
          (currentSlotStart <= bookingStart && currentSlotEnd >= bookingEnd)
        );
      });

      if (!overlappingBooking) {
        suggestions.push({
          start: currentSlotStart.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          end: currentSlotEnd.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        });
      }

      currentSlotStart.setHours(currentSlotStart.getHours() + selectedHours);
    }

    allTimeSuggestions.push({
      station: station,
      suggestions: suggestions,
      slot: slot,
      hours: selectedHours,
    });
  });

  // Send the accumulated time suggestions after the loop
  res.status(200).json(allTimeSuggestions);
}

// function generateTimeSuggestions(
//   evStationProfile,
//   evBookingData,
//   hours,
//   date,
//   slot,
//   res
// ) {
//   console.log(evStationProfile, evBookingData, hours, date, slot);

//   const selectedHours = parseInt(hours, 10);

//   evStationProfile.forEach((station) => {
//     const dayOfWeek = getDateOfWeek(date);

//     const openingTime = station.evTimings[dayOfWeek].openingTime;
//     const closingTime = station.evTimings[dayOfWeek].closingTime;

//     const openingDateTime = new Date(date);
//     openingDateTime.setHours(openingTime.hours, openingTime.minutes, 0, 0);

//     const closingDateTime = new Date(date);
//     closingDateTime.setHours(closingTime.hours, closingTime.minutes, 0, 0);

//     const stationBookings = evBookingData.filter(
//       (booking) =>
//         booking.stationId === station.userid &&
//         booking.bookedForDate === date &&
//         booking.bookingSlot === slot
//     );

//     let currentSlotStart = new Date();
//     const currentDate = new Date();

//     if (currentDate.toDateString() === openingDateTime.toDateString()) {
//       const openingDateTimeWithCurrentDate = new Date(currentDate);
//       openingDateTimeWithCurrentDate.setHours(
//         openingTime.hours,
//         openingTime.minutes,
//         0,
//         0
//       );

//       if (currentDate >= openingDateTimeWithCurrentDate) {
//         currentSlotStart = new Date(currentDate);
//       } else {
//         currentSlotStart = new Date(openingDateTimeWithCurrentDate.getTime());
//       }
//     } else {
//       currentSlotStart = new Date(openingDateTime.getTime());
//     }

//     const suggestions = [];

//     while (currentSlotStart < closingDateTime) {
//       const currentSlotEnd = new Date(currentSlotStart.getTime());
//       currentSlotEnd.setHours(currentSlotEnd.getHours() + selectedHours);

//       if (currentSlotEnd > closingDateTime) {
//         break;
//       }

//       const overlappingBooking = stationBookings.some((booking) => {
//         const bookingStart = new Date(
//           booking.bookedForDate + "T" + booking.timeForBooked
//         );
//         const bookingEnd = new Date(bookingStart.getTime());
//         bookingEnd.setHours(
//           bookingEnd.getHours() + parseInt(booking.totalHoursEvBooking, 10)
//         );

//         return (
//           (currentSlotStart >= bookingStart && currentSlotStart < bookingEnd) ||
//           (currentSlotEnd > bookingStart && currentSlotEnd <= bookingEnd) ||
//           (currentSlotStart <= bookingStart && currentSlotEnd >= bookingEnd)
//         );
//       });

//       if (!overlappingBooking) {
//         suggestions.push({
//           start: currentSlotStart.toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//           }),
//           end: currentSlotEnd.toLocaleTimeString([], {
//             hour: "2-digit",
//             minute: "2-digit",
//           }),
//         });
//       }

//       currentSlotStart.setHours(currentSlotStart.getHours() + selectedHours);
//     }
//     const timeSuggestion = [];

//     timeSuggestion.push({
//       station: station,
//       suggestions: suggestions,
//       slot: slot,
//       hours: selectedHours,
//     });

//     res.status(200).json(timeSuggestion);
//   });
// }

//Check slot avialability of according slot,hours,date and time
const checkSlotAvailabilityForStation = async (req, res) => {
  try {
    const userId = req.params.userid;

    // Extracting required data from the request body
    const { date, slot, slothours, time } = req.body;

    console.log("Im Call", date, slot, slothours, time, userId);

    if (!userId || !date || !slot || !slothours || !time) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    // Validate date format
    if (!moment(date, "YYYY-MM-DD", true).isValid()) {
      return res.status(400).json({
        error: "Invalid date format. Date must be in yyyy-mm-dd format",
      });
    }

    // Check if the provided date is in the past
    const currentDate = moment().format("YYYY-MM-DD");
    if (date < currentDate) {
      return res.status(400).json({ error: "Selected date is in the past" });
    }

    // If the date is today, check if the provided time is in the past
    if (date === currentDate) {
      const currentTime = moment().format("HH:mm");
      if (time < currentTime) {
        return res.status(400).json({ error: "Selected time is in the past" });
      }
    }

    // Query to check if the station ID exists
    const stationQuery = `SELECT * FROM ev_profile WHERE userid = ?;`;

    // Execute the query to check if the station ID exists
    pool.query(stationQuery, [userId], async (error, stations) => {
      if (error) {
        console.error("Error checking station ID:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Check if the station ID exists
      if (stations.length === 0) {
        return res.status(404).json({ error: "Station ID does not exist" });
      }

      // Extract opening and closing times for the station
      const station = stations[0];
      const evTimings = JSON.parse(station.evTimings);
      const dayOfWeek = moment(date).format("dddd");
      const openingTime = moment(
        `${date} ${evTimings[dayOfWeek].openingTime}`,
        "YYYY-MM-DD HH:mm"
      );
      const closingTime = moment(
        `${date} ${evTimings[dayOfWeek].closingTime}`,
        "YYYY-MM-DD HH:mm"
      );

      // Calculate start and end time based on the provided time and hours
      const selectedStartTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm");
      const selectedEndTime = selectedStartTime.clone().add(slothours, "hours");

      // Check if selected time falls within the operating hours
      if (
        selectedStartTime.isBefore(openingTime) ||
        selectedEndTime.isAfter(closingTime)
      ) {
        return res
          .status(400)
          .json({ error: "Selected slot is outside operating hours" });
      }

      // Query to fetch existing bookings for the provided date, slot, and station ID
      const bookingsQuery = `SELECT * FROM booking WHERE stationId = ? AND bookedForDate = ? AND bookingSlot = ?;`;

      // Execute the query to get existing bookings
      pool.query(
        bookingsQuery,
        [userId, date, slot],
        async (error, bookings) => {
          if (error) {
            console.error("Error fetching bookings:", error);
            return res.status(500).json({ error: "Internal server error" });
          }

          // Check for overlapping bookings
          const overlappingBooking = bookings.some((booking) => {
            const bookingStartTime = moment(
              `${booking.bookedForDate} ${booking.timeForBooked}`,
              "YYYY-MM-DD HH:mm"
            );
            const bookingEndTime = bookingStartTime
              .clone()
              .add(booking.totalHoursEvBooking, "hours");
            return (
              (selectedStartTime.isSameOrAfter(bookingStartTime) &&
                selectedStartTime.isBefore(bookingEndTime)) ||
              (selectedEndTime.isAfter(bookingStartTime) &&
                selectedEndTime.isSameOrBefore(bookingEndTime)) ||
              (selectedStartTime.isBefore(bookingStartTime) &&
                selectedEndTime.isAfter(bookingEndTime))
            );
          });

          if (overlappingBooking) {
            // If overlapping booking found, return error response
            return res
              .status(400)
              .json({ error: "Selected slot is already booked" });
          } else {
            // If no overlapping booking found, return success response
            return res.status(200).json({ message: "Slot is available" });
          }
        }
      );
    });
  } catch (error) {
    console.error("Error in checkSlotAvailabilityForStation:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Booking data of that particular userid
const getBookingDataByUserId = async (req, res) => {
  try {
    const userId = req.params.userid;
    const userExist = await checkUserExistence(userId);
    if (!userExist) {
      return res.status(404).json({ error: "User not found" });
    }
    // Query to fetch booking data by userId
    const query = `SELECT * FROM booking WHERE userId = ?;`;
    // Execute the query
    pool.query(query, [userId], (error, results) => {
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
    console.error("Error in getBookingDataByUserId:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get Booking data by stationid
const getBookingDataByStationId = async (req, res) => {
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

//Get Booking Data By Id
const getBookingDataById = async (req, res) => {
  try {
    const bookingRefId = req.params.bookingRefId;

    // Query to fetch booking data by bookingId
    const query = `SELECT * FROM booking WHERE bookingRefId = ?;`;

    // Execute the query
    pool.query(query, [bookingRefId], (error, results) => {
      if (error) {
        console.error("Error fetching booking data:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

      // Check if booking exists
      if (results.length === 0) {
        return res.status(404).json({ error: "Booking not found" });
      }

      // Map results to the desired format
      const formattedResult = {
        userId: results[0].userId,
        evid: results[0].evid,
        stationId: results[0].stationId,
        bookingSlot: results[0].bookingSlot,
        timeForBooked: results[0].timeForBooked,
        totalHoursEvBooking: results[0].totalHoursEvBooking,
        bookedForDate: results[0].bookedForDate,
        currentTimestamp: results[0].currentTimestamp,
        totalPayable: results[0].totalPayable,
        bookingStatus: results[0].bookingStatus,
        remark: results[0].remark,
        visitingStatus: results[0].visitingStatus,
        visitingTimeStamp: results[0].visitingTimeStamp,
        paymentDetails: JSON.parse(results[0].paymentDetails),
        bookingRefId: results[0].bookingRefId,
      };

      // Send the formatted result as JSON response
      res.status(200).json(formattedResult);
    });
  } catch (error) {
    console.error("Error in getBookingDataById:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

//Get Booking Chart data by userid
const getChartOfBookingDataByUserId = async (req, res) => {
  try {
    const userId = req.params.userid;
    const userExist = await checkUserExistence(userId);
    if (!userExist) {
      return res.status(404).json({ error: "User not found" });
    }
    // Query to fetch booking data by userId
    const query = `SELECT * FROM booking WHERE userId = ?;`;
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
const getBookingPaymentData = async (req, res) => {
  try {
    const userId = req.params.userid;
    const userExist = await checkUserExistence(userId);
    if (!userExist) {
      return res.status(404).json({ error: "User not found" });
    }
    // Query to fetch booking data by userId
    const query = `SELECT * FROM booking WHERE userId = ?;`;
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

//Get Counting Data
const getBookingCountsByUserId = async (req, res) => {
  try {
    const userId = req.params.userid;
    const userExist = await checkUserExistence(userId);
    if (!userExist) {
      return res.status(404).json({ error: "User not found" });
    }

    // Query to fetch booking data by userId
    const query = `SELECT * FROM booking WHERE userId = ?;`;

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

// const checkSlotAvailabilityForStation = async (req, res) => {
//   try {
//     const userId = req.params.userid;

//     // Extracting required data from the request body
//     const { date, slot, slothours, time } = req.body;

//     if (!userId || !date || !slot || !slothours || !time) {
//       return res.status(400).json({ error: "Missing required fields" });
//     }

//     // Validate date format
//     if (!moment(date, "YYYY-MM-DD", true).isValid()) {
//       return res.status(400).json({
//         error: "Invalid date format. Date must be in yyyy-mm-dd format",
//       });
//     }

//     // Check if the provided date is in the past
//     const currentDate = moment().format("YYYY-MM-DD");
//     if (date < currentDate) {
//       return res.status(400).json({ error: "Selected date is in the past" });
//     }

//     // If the date is today, check if the provided time is in the past
//     if (date === currentDate) {
//       const currentTime = moment().format("HH:mm");
//       if (time < currentTime) {
//         return res.status(400).json({ error: "Selected time is in the past" });
//       }
//     }

//     // Query to check if the station ID exists
//     const stationQuery = `SELECT * FROM ev_profile WHERE userid = ?;`;

//     // Execute the query to check if the station ID exists
//     pool.query(stationQuery, [userId], async (error, stations) => {
//       if (error) {
//         console.error("Error checking station ID:", error);
//         return res.status(500).json({ error: "Internal server error" });
//       }

//       // Check if the station ID exists
//       if (stations.length === 0) {
//         return res.status(404).json({ error: "Station ID does not exist" });
//       }

//       // Query to fetch existing bookings for the provided date, slot, and station ID
//       const bookingsQuery = `SELECT * FROM booking WHERE stationId = ? AND bookedForDate = ? AND bookingSlot = ?;`;

//       // Execute the query to get existing bookings
//       pool.query(
//         bookingsQuery,
//         [userId, date, slot],
//         async (error, bookings) => {
//           if (error) {
//             console.error("Error fetching bookings:", error);
//             return res.status(500).json({ error: "Internal server error" });
//           }

//           // Convert slothours to integer
//           const selectedHours = parseInt(slothours, 10);

//           // Calculate start and end time based on the provided time and hours
//           const selectedStartTime = new Date(date + "T" + time);
//           const selectedEndTime = new Date(
//             selectedStartTime.getTime() + selectedHours * 60 * 60 * 1000
//           );

//           // Check for overlapping bookings
//           const overlappingBooking = bookings.some((booking) => {
//             const bookingStartTime = new Date(
//               booking.bookedForDate + "T" + booking.timeForBooked
//             );
//             const bookingEndTime = new Date(
//               bookingStartTime.getTime() +
//                 parseInt(booking.totalHoursEvBooking, 10) * 60 * 60 * 1000
//             );

//             return (
//               (selectedStartTime >= bookingStartTime &&
//                 selectedStartTime < bookingEndTime) ||
//               (selectedEndTime > bookingStartTime &&
//                 selectedEndTime <= bookingEndTime) ||
//               (selectedStartTime <= bookingStartTime &&
//                 selectedEndTime >= bookingEndTime)
//             );
//           });

//           if (overlappingBooking) {
//             // If overlapping booking found, return error response
//             return res
//               .status(400)
//               .json({ error: "Selected slot is already booked" });
//           } else {
//             // If no overlapping booking found, return success response
//             return res.status(200).json({ message: "Slot is available" });
//           }
//         }
//       );
//     });
//   } catch (error) {
//     console.error("Error in checkSlotAvailabilityForStation:", error);
//     res.status(500).json({ error: "Internal server error" });
//   }
// };

module.exports = {
  checkSlotAvailablity,
  checkSlotAvailabilityForStation,
  getBookingDataByStationId,
  getBookingDataByUserId,
  getBookingDataById,
  getChartOfBookingDataByUserId,
  getBookingPaymentData,
  getBookingCountsByUserId,
};
