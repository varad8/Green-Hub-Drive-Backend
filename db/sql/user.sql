-- Table for user registration
CREATE TABLE user_registration (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    userid VARCHAR(36) UNIQUE NOT NULL,
    INDEX (userid) -- Adding index on userid for better performance
);

-- Table for user profile
CREATE TABLE user_profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    firstname VARCHAR(255),
    lastname VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    mobile VARCHAR(20),
    dob DATE,
    updatedDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    createdDate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    address VARCHAR(255),
    profilepic VARCHAR(255),
    city VARCHAR(255),
    state VARCHAR(255),
    userid VARCHAR(36) UNIQUE NOT NULL,
    accountType VARCHAR(50),
    gender VARCHAR(50),
    INDEX (email),
    FOREIGN KEY (userid) REFERENCES user_registration(userid)
);

--Reset Password
CREATE TABLE password_reset_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES user_registration(id)
);
