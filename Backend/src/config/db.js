const mysql = require("mysql2/promise");

// Konfigurasi MySQL Connection Pool dengan SSL Support untuk Aiven
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "defaultdb",
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT) || 10,
  queueLimit: 0,
  enableKeepAlive: true,
  // SSL Configuration untuk Aiven Cloud MySQL - Allow any certificate
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: false,
        }
      : false,
});

// Handle pool errors
pool.on("error", (err) => {
  console.error("❌ Unexpected database pool error:", err);
  if (err.code === "PROTOCOL_CONNECTION_LOST") {
    console.error("Database connection was closed.");
  }
  if (err.code === "PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR") {
    console.error("Fatal error encountered prior to query execution.");
  }
  if (err.code === "PROTOCOL_ENQUEUE_AFTER_CLOSE") {
    console.error("Connection was closed before the query could execute.");
  }
});

module.exports = pool;
