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

//checking that user exist or not in superadmin_registration
const checkSuperAdminExistence = (userid) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM superadmin_registration WHERE adminId = ?";
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
    let adminId;
    do {
      // Generate a random 4-digit number
      const randomDigits = Math.floor(1000 + Math.random() * 9000);
      adminId = `AD-${randomDigits}`;
      console.log("Generated ADMIN ID:", adminId);

      // Check if the generated evid already exists
      const evidExistsQuery =
        "SELECT * FROM superadmin_registration WHERE adminId = ?";
      const queryResult = await pool.query(evidExistsQuery, [adminId]);
      const rows = queryResult[0];
      if (!Array.isArray(rows) || rows.length === 0) {
        break;
      }
    } while (true);

    return adminId;
  } catch (error) {
    console.error("Error generating unique superadmin id:", error);
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
  checkSuperAdminExistence,
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
