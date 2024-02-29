-- Table for booking
CREATE TABLE booking (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userId VARCHAR(36) NOT NULL,
    evid VARCHAR(36) NOT NULL,
    stationId VARCHAR(36) NOT NULL,
    bookingSlot VARCHAR(255) NOT NULL,
    timeForBooked VARCHAR(255) NOT NULL,
    totalHoursEvBooking VARCHAR(255) NOT NULL,
    bookedForDate VARCHAR(36) NOT NULL,
    currentTimestamp BIGINT NOT NULL,
    totalPayable DECIMAL(10, 2) NOT NULL,
    bookingStatus VARCHAR(50) NOT NULL,
    remark TEXT,
    visitingStatus VARCHAR(50) NOT NULL,
    visitingTimeStamp BIGINT,
    paymentDetails JSON,
    bookingRefId VARCHAR(36) NOT NULL,
    FOREIGN KEY (stationId) REFERENCES ev_registration(userid)
)