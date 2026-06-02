// ============================================
// BACKEND SERVER - Express.js for Railway + Aiven Cloud MySQL
// Production-ready configuration with full CRUD APIs
// ============================================

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");
const db = require("./src/config/db");

const app = express();

// ============================================
// PORT Configuration - FIXED with default fallback
// ============================================
const PORT = process.env.PORT || 5001;

// ============================================
// CORS Configuration - Dynamic for GitHub Pages + Local Development
// ============================================
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : [
      "https://brilianhelfastev-creator.github.io",
      "http://127.0.0.1:5500",
      "http://localhost:5500",
      "http://localhost:3000",
      "http://127.0.0.1:3000",
    ];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without origin (like mobile apps or curl requests)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn(`CORS blocked origin: ${origin}`);
        callback(new Error("CORS policy violation"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ============================================
// Body Parser Middleware
// ============================================
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ============================================
// Request Logging Middleware (Production)
// ============================================
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(
    `[${timestamp}] ${req.method} ${req.path} - IP: ${req.ip || "unknown"}`,
  );
  next();
});

// ============================================
// Authentication Routes
// ============================================
app.use("/api/auth", authRoutes);

// ============================================
// Articles CRUD API Routes
// ============================================

/**
 * GET /api/articles - Retrieve all articles
 */
app.get("/api/articles", async (req, res) => {
  try {
    console.log("📖 Fetching all articles from Aiven Cloud...");
    const [articles] = await db.query(
      "SELECT * FROM articles ORDER BY created_at DESC, id DESC LIMIT 100",
    );
    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles,
    });
  } catch (error) {
    console.error("❌ Error fetching articles:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch articles from database",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Database error",
    });
  }
});

/**
 * POST /api/articles - Create new article
 * Body: { judul, konten }
 */
app.post("/api/articles", async (req, res) => {
  const { judul, konten } = req.body;

  // Validation
  if (!judul || !konten) {
    return res.status(400).json({
      success: false,
      message: "Judul dan konten tidak boleh kosong",
    });
  }

  try {
    console.log("📝 Creating new article...");
    const [result] = await db.query(
      "INSERT INTO articles (judul, konten, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
      [judul, konten],
    );

    res.status(201).json({
      success: true,
      message: "Artikel berhasil dibuat",
      data: {
        id: result.insertId,
        judul,
        konten,
      },
    });
  } catch (error) {
    console.error("❌ Error creating article:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create article",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Database error",
    });
  }
});

/**
 * GET /api/articles/:id - Retrieve single article by ID
 */
app.get("/api/articles/:id", async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`📖 Fetching article ${id}...`);
    const [articles] = await db.query(
      "SELECT * FROM articles WHERE id = ?",
      [id],
    );

    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      data: articles[0],
    });
  } catch (error) {
    console.error("❌ Error fetching article:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch article",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Database error",
    });
  }
});

/**
 * PUT /api/articles/:id - Update article
 * Body: { judul, konten }
 */
app.put("/api/articles/:id", async (req, res) => {
  const { id } = req.params;
  const { judul, konten } = req.body;

  // Validation
  if (!judul || !konten) {
    return res.status(400).json({
      success: false,
      message: "Judul dan konten tidak boleh kosong",
    });
  }

  try {
    console.log(`✏️ Updating article ${id}...`);
    const [result] = await db.query(
      "UPDATE articles SET judul = ?, konten = ?, updated_at = NOW() WHERE id = ?",
      [judul, konten, id],
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Artikel berhasil diperbarui",
      data: { id, judul, konten },
    });
  } catch (error) {
    console.error("❌ Error updating article:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update article",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Database error",
    });
  }
});

/**
 * DELETE /api/articles/:id - Delete article
 */
app.delete("/api/articles/:id", async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`🗑️ Deleting article ${id}...`);
    const [result] = await db.query("DELETE FROM articles WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan",
      });
    }

    res.status(200).json({
      success: true,
      message: "Artikel berhasil dihapus",
    });
  } catch (error) {
    console.error("❌ Error deleting article:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete article",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Database error",
    });
  }
});

// ============================================
// Health Check & Status Endpoints
// ============================================

/**
 * GET /api/health - Server health check
 */
app.get("/api/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    message: "Backend server is running",
    environment: process.env.NODE_ENV || "production",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/db-test - Database connection test
 */
app.get("/api/db-test", async (req, res) => {
  try {
    console.log("🧪 Testing database connection...");
    const [rows] = await db.query("SELECT 1 as test, NOW() as server_time");

    res.status(200).json({
      success: true,
      message: "Database connection successful",
      database: process.env.DB_NAME || "defaultdb",
      host: process.env.DB_HOST || "localhost",
      serverTime: rows[0]?.server_time,
    });
  } catch (error) {
    console.error("❌ Database connection test failed:", error.message);
    res.status(503).json({
      success: false,
      message: "Database connection failed",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Database unavailable",
    });
  }
});

// ============================================
// 404 Error Handler
// ============================================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.path,
  });
});

// ============================================
// Global Error Handler
// ============================================
app.use((err, req, res, next) => {
  console.error("💥 Unhandled error:", err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

// ============================================
// Server Startup with Retry Logic
// ============================================
const startServer = async () => {
  try {
    let connected = false;
    let attempts = 0;
    const maxAttempts = parseInt(process.env.DB_RETRY_ATTEMPTS) || 3;
    const retryDelay = parseInt(process.env.DB_RETRY_DELAY) || 2000;

    console.log("\n========================================");
    console.log("📝 Starting Backend Server");
    console.log("========================================\n");
    console.log(`Environment: ${process.env.NODE_ENV || "production"}`);
    console.log(`Database: ${process.env.DB_NAME || "defaultdb"}`);
    console.log(`Host: ${process.env.DB_HOST || "localhost"}`);
    console.log(`Port: ${PORT}\n`);

    // Attempt database connection with retry
    while (!connected && attempts < maxAttempts) {
      try {
        attempts++;
        console.log(
          `🔄 Database connection attempt ${attempts}/${maxAttempts}...`,
        );
        const [rows] = await db.query("SELECT 1 as connection_test");
        console.log("✅ Database connected successfully!\n");
        connected = true;
      } catch (error) {
        console.error(`❌ Connection attempt ${attempts} failed:`, error.message);
        if (attempts < maxAttempts) {
          console.log(`⏳ Retrying in ${retryDelay}ms...\n`);
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
        } else {
          throw new Error(
            `Failed to connect to database after ${maxAttempts} attempts`,
          );
        }
      }
    }

    // Start Express server
    app.listen(PORT, "0.0.0.0", () => {
      console.log("========================================");
      console.log("✅ Backend Server Started Successfully!");
      console.log("========================================\n");
      console.log(
        `🌐 Server running at: http://0.0.0.0:${PORT}`,
      );
      console.log(`🏥 Health Check: http://0.0.0.0:${PORT}/api/health`);
      console.log(
        `🗄️  DB Test: http://0.0.0.0:${PORT}/api/db-test`,
      );
      console.log(`📚 Articles API: http://0.0.0.0:${PORT}/api/articles\n`);
      console.log(`✨ CORS Origins allowed:`);
      allowedOrigins.forEach((origin) => console.log(`   - ${origin}`));
      console.log("\n========================================\n");
    });
  } catch (error) {
    console.error("\n❌ SERVER STARTUP FAILED!");
    console.error("========================================");
    console.error("Error:", error.message);
    console.error("========================================\n");
    process.exit(1);
  }
};

// Start the server
startServer();

// Handle graceful shutdown
process.on("SIGTERM", () => {
  console.log("\n📛 SIGTERM signal received: closing HTTP server");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("\n📛 SIGINT signal received: closing HTTP server");
  process.exit(0);
});

