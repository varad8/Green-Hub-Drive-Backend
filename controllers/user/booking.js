const { pool } = require("./dependencies");

// Checking slot availability
const checkSlotAvailablity = async (req, res) => {
  try {
    // Extracting required data from the request body
    const { date, slot, slothours, time } = req.body;

    // Query to fetch all EV profiles
    const evQuery = `SELECT * FROM ev_profile;`;

    // Execute the query to get EV profiles
    pool.query(evQuery, async (error, evStations) => {
      if (error) {
        console.error("Error fetching ev_profiles:", error);
        return res.status(500).json({ error: "Internal server error" });
      }

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
  const dayOfWeek = getDateOfWeek(selectedDate);

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
    alert("Selected date or time is in the past.");
    console.error("Selected date or time is in the past.");
    return;
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
  const selectedHours = parseInt(hours, 10);

  evStationProfile.forEach((station) => {
    const dayOfWeek = getDateOfWeek(date);
    const openingTime = station.evTimings[dayOfWeek].openingTime;
    const closingTime = station.evTimings[dayOfWeek].closingTime;

    const openingDateTime = new Date(date);
    openingDateTime.setHours(openingTime.hours, openingTime.minutes, 0, 0);

    const closingDateTime = new Date(date);
    closingDateTime.setHours(closingTime.hours, closingTime.minutes, 0, 0);

    console.log(evBookingData);

    const stationBookings = evBookingData.filter(
      (booking) =>
        booking.stationId === station.id &&
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
    const timeSuggestion = [];

    timeSuggestion.push({
      station: station,
      suggestions: suggestions,
      slot: slot,
      hours: selectedHours,
    });

    res.status(200).json(timeSuggestion);
  });
}

module.exports = {
  checkSlotAvailablity,
};
