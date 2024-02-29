const mysql = require("mysql");

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "",
  database: "greenhubdrive",
};

const pool = mysql.createPool(dbConfig);

module.exports = pool;
