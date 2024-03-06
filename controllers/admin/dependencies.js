const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const pool = require("../../db/db");
const moment = require("moment");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const { nodemailer } = require("../user/dependencies");
const { EMAIL_USER, EMAIL_PASSWORD, WEB_URL, YOUR_EMAIL } = process.env;

// Function to hash password
const hashPassword = async (password) => {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
};

//checking that ev admin exist or not
const checkEvAdminExistence = (userid) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM ev_registration WHERE userid = ?";
    pool.query(query, [userid], (error, results) => {
      if (error) {
        console.error("Error checking EV admin existence:", error);
        reject(error);
      } else {
        resolve(results.length > 0);
      }
    });
  });
};

//checking that user exist or not in user_registration
const checkUserExistence = (userid) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM user_registration WHERE userid = ?";
    pool.query(query, [userid], (error, results) => {
      if (error) {
        console.error("Error checking user existence:", error);
        reject(error);
      } else {
        resolve(results.length > 0);
      }
    });
  });
};

// Function to generate unique evid (EV ID)
const generateUniqueEvid = async () => {
  try {
    let evid;
    do {
      // Generate a random 4-digit number
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      evid = `EV-${randomDigits}`;
      console.log("Generated EVID:", evid);

      // Check if the generated evid already exists
      const evidExistsQuery = "SELECT * FROM ev_profile WHERE evid = ?";
      const queryResult = await pool.query(evidExistsQuery, [evid]);
      //   console.log("Query result:", queryResult);

      const rows = queryResult[0]; // Assuming the result is an array in the first element
      if (!Array.isArray(rows) || rows.length === 0) {
        // If the evid does not exist or the query result is not iterable, break the loop
        break;
      }
      // If the evid already exists, generate a new one
    } while (true);

    return evid;
  } catch (error) {
    console.error("Error generating unique evid:", error);
    throw error;
  }
};

// Configure nodemailer with your email transport settings
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASSWORD,
  },
});

module.exports = {
  express,
  bodyParser,
  bcrypt,
  uuidv4,
  pool,
  moment,
  nodemailer,
  WEB_URL,
  transporter,
  path,
  multer,
  hashPassword,
  generateUniqueEvid,
  fs,
  checkUserExistence,
  checkEvAdminExistence,
};
