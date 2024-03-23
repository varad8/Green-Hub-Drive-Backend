CREATE TABLE superadmin_registration (
    id INT AUTO_INCREMENT PRIMARY KEY,
    adminId VARCHAR(36) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    dateOfCreation TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    createdBy VARCHAR(36),
    UNIQUE KEY (adminId)
);

CREATE TABLE superadmin_profile (
    id INT AUTO_INCREMENT PRIMARY KEY,
    adminId VARCHAR(36) NOT NULL, 
    firstName VARCHAR(255),
    lastName VARCHAR(255),
    dob DATE,
    address VARCHAR(255),
    registeredAs VARCHAR(255),
    mobileNo VARCHAR(20),
    accountType VARCHAR(50),
    profilepic VARCHAR(255),
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (adminId) REFERENCES superadmin_registration(adminId)
);
