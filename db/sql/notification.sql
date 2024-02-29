CREATE TABLE notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    userid VARCHAR(36) NOT NULL,
    stationuserid VARCHAR(36) NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    notificationTitle VARCHAR(255),
    notificationMessage TEXT
);