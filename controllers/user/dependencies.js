const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const pool = require("../../db/db");
const moment = require("moment");
const path = require("path");
const multer = require("multer");
const fs = require("fs");
const ejs = require("ejs");
const nodemailer = require("nodemailer");
const { EMAIL_USER, EMAIL_PASSWORD, WEB_URL, YOUR_EMAIL } = process.env;

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

// Function to check if a rating with the given orderId already exists
const checkOrderExistence = (orderId) => {
  return new Promise((resolve, reject) => {
    const query = "SELECT * FROM Rating WHERE orderId = ?";
    pool.query(query, [orderId], (error, results) => {
      if (error) {
        console.error("Error checking order existence:", error);
        reject(error);
      } else {
        resolve(results.length > 0);
      }
    });
  });
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
  YOUR_EMAIL,
  WEB_URL,
  moment,
  express,
  bodyParser,
  bcrypt,
  uuidv4,
  pool,
  moment,
  nodemailer,
  path,
  multer,
  checkEvAdminExistence,
  hashPassword,
  fs,
  checkUserExistence,
  checkOrderExistence,
  transporter,
  ejs,
};
