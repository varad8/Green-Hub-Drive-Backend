CREATE TABLE Rating (
    ratingId INT AUTO_INCREMENT PRIMARY KEY,
    stationId VARCHAR(255) NOT NULL,
    userId VARCHAR(255) NOT NULL,
    rating INT NOT NULL,
    feedbackMsg TEXT,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    orderid VARCHAR(255) NOT NULL,
    FOREIGN KEY (stationId) REFERENCES ev_registration(userid),
    FOREIGN KEY (userId) REFERENCES user_registration(userid)
);


ALTER TABLE `rating` ADD `orderid` VARCHAR(255) NOT NULL AFTER `createdAt`;
