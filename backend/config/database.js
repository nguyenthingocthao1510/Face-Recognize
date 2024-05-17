require("dotenv").config();
const mysql = require("mysql2");

const db = mysql.createPool({
  host: "www.db4free.net",
  user: "duongquocvu",
  password: "admin123",
  database: "projectlong",
});

module.exports = db;
