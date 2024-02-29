-- evadmin registration
CREATE TABLE ev_registration (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    userid VARCHAR(36) UNIQUE NOT NULL
);


CREATE TABLE ev_profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    evid VARCHAR(36) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    location JSON,
    coordinates JSON,
    address VARCHAR(255),
    rate DECIMAL(10, 2),
    evTimings JSON, -- Store evTimings as JSON object
    imageUrl VARCHAR(255),
    profile JSON,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    accountType VARCHAR(50),
    userid VARCHAR(36) UNIQUE NOT NULL,
    accountStatus JSON,
    FOREIGN KEY (userid) REFERENCES ev_registration(userid)
);


-- evadmin profile
-- CREATE TABLE ev_profile (
--     evid VARCHAR(36) NOT NULL,
--     id INT AUTO_INCREMENT PRIMARY KEY,
--     title VARCHAR(255),
--     description TEXT,
--     location_city VARCHAR(255),
--     location_state VARCHAR(255),
--     coordinates_latitude VARCHAR(255),
--     coordinates_longitude VARCHAR(255),
--     address VARCHAR(255),
--     rate DECIMAL(10, 2),
--     evTimings_Monday_openingTime TIME,
--     evTimings_Monday_closingTime TIME,
--     evTimings_Tuesday_openingTime TIME,
--     evTimings_Tuesday_closingTime TIME,
--     evTimings_Wednesday_openingTime TIME,
--     evTimings_Wednesday_closingTime TIME,
--     evTimings_Thursday_openingTime TIME,
--     evTimings_Thursday_closingTime TIME,
--     evTimings_Friday_openingTime TIME,
--     evTimings_Friday_closingTime TIME,
--     evTimings_Saturday_openingTime TIME,
--     evTimings_Saturday_closingTime TIME,
--     evTimings_Sunday_openingTime TIME,
--     evTimings_Sunday_closingTime TIME,
--     imageUrl VARCHAR(255),
--     profile_firstname VARCHAR(255),
--     profile_lastname VARCHAR(255),
--     profile_dob DATE,
--     profile_mobile VARCHAR(20),
--     profile_email VARCHAR(255),
--     profile_dateofjoining DATE,
--     profile_profilepic VARCHAR(255),
--     profile_gender VARCHAR(50),
--     updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     accountType VARCHAR(50),
--     userid VARCHAR(36) UNIQUE NOT NULL,
--     accountStatus_approvedBy VARCHAR(255),
--     accountStatus_updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
--     accountStatus_adminID VARCHAR(36),
--     accountStatus_status VARCHAR(50),
--     accountStatus_remark TEXT,
--     FOREIGN KEY (userid) REFERENCES ev_registration(userid) -- Assuming userid is a foreign key referencing the ev_registration table
-- );
