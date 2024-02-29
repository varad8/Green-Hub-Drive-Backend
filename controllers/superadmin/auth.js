//Admin Registration
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const pool = require("../db/db");

// Route for inserting a new superadmin
router.post("/superadmin", async (req, res) => {
  try {
    // Extract data from the request body
    const {
      firstName,
      lastName,
      email,
      password,
      dob,
      address,
      mobileNo,
      profilepic,
    } = req.body;

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into superadmin_registration table
    const registrationQuery = `
      INSERT INTO superadmin_registration (adminId, email, password, createdBy)
      VALUES (?, ?, ?, ?)
    `;
    const registrationValues = [email, email, hashedPassword, null];
    await pool.query(registrationQuery, registrationValues);

    // Insert into superadmin_profile table
    const profileQuery = `
      INSERT INTO superadmin_profile (adminId, firstName, lastName, dob, address, registeredAs, mobileNo, accountType, profilepic)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const profileValues = [
      email,
      firstName,
      lastName,
      dob,
      address,
      "Superadmin",
      mobileNo,
      "Admin",
      profilepic,
    ];
    await pool.query(profileQuery, profileValues);

    // Send success response
    res.status(201).json({ message: "Superadmin created successfully" });
  } catch (error) {
    console.error("Error creating superadmin:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
