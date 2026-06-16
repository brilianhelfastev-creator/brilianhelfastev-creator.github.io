const mysql = require("mysql2/promise");
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'profile_db',
  port: process.env.DB_PORT || 3306,
  ssl: { rejectUnauthorized: false }, // Wajib untuk Aiven / Cloud DB
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true
});
module.exports = pool;
