const express = require("express");
const bodyParser = require("body-parser");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");
const pool = require("../../db/db");
const moment = require("moment");
const path = require("path");
const multer = require("multer");
const fs = require("fs");

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

module.exports = {
  express,
  bodyParser,
  bcrypt,
  uuidv4,
  pool,
  moment,
  path,
  multer,
  hashPassword,
  fs,
  checkUserExistence,
};
