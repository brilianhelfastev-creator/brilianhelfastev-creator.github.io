require("dotenv").config();
const express = require("express");
const cors = require("cors");
const authRoutes = require("./src/routes/authRoutes");
const db = require("./src/config/db");
const app = express();
const PORT = 5001;

const allowedOrigins = [
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "https://brilianhelfastev-creator.github.io",
  process.env.CORS_ORIGIN
].filter(Boolean); // Filter out undefined values

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin) || origin.startsWith("https://brilianhelfastev-creator.github.io")) {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(new Error("CORS policy violation"));
    }
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);

// ============================================
// Articles CRUD API Routes
// ============================================

app.get("/api/articles", async (req, res) => {
  try {
    console.log("📖 Fetching all articles from database...");
    const [articles] = await db.query(
      "SELECT * FROM articles ORDER BY created_at DESC, id DESC LIMIT 100"
    );
    res.status(200).json({
      success: true,
      count: articles.length,
      data: articles
    });
  } catch (error) {
    console.error("❌ Error fetching articles:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch articles from database",
      error: error.message
    });
  }
});

app.post("/api/articles", async (req, res) => {
  const { judul, konten } = req.body;

  if (!judul || !konten) {
    return res.status(400).json({
      success: false,
      message: "Judul dan konten tidak boleh kosong"
    });
  }

  try {
    console.log("📝 Creating new article...");
    const [result] = await db.query(
      "INSERT INTO articles (judul, konten, created_at, updated_at) VALUES (?, ?, NOW(), NOW())",
      [judul, konten]
    );

    res.status(201).json({
      success: true,
      message: "Artikel berhasil dibuat",
      data: {
        id: result.insertId,
        judul,
        konten
      }
    });
  } catch (error) {
    console.error("❌ Error creating article:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to create article",
      error: error.message
    });
  }
});

app.get("/api/articles/:id", async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`📖 Fetching article ${id}...`);
    const [articles] = await db.query("SELECT * FROM articles WHERE id = ?", [id]);

    if (articles.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      data: articles[0]
    });
  } catch (error) {
    console.error("❌ Error fetching article:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to fetch article",
      error: error.message
    });
  }
});

app.put("/api/articles/:id", async (req, res) => {
  const { id } = req.params;
  const { judul, konten } = req.body;

  if (!judul || !konten) {
    return res.status(400).json({
      success: false,
      message: "Judul dan konten tidak boleh kosong"
    });
  }

  try {
    console.log(`✏️ Updating article ${id}...`);
    const [result] = await db.query(
      "UPDATE articles SET judul = ?, konten = ?, updated_at = NOW() WHERE id = ?",
      [judul, konten, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      message: "Artikel berhasil diperbarui",
      data: { id, judul, konten }
    });
  } catch (error) {
    console.error("❌ Error updating article:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to update article",
      error: error.message
    });
  }
});

app.delete("/api/articles/:id", async (req, res) => {
  const { id } = req.params;

  try {
    console.log(`🗑️ Deleting article ${id}...`);
    const [result] = await db.query("DELETE FROM articles WHERE id = ?", [id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Artikel tidak ditemukan"
      });
    }

    res.status(200).json({
      success: true,
      message: "Artikel berhasil dihapus"
    });
  } catch (error) {
    console.error("❌ Error deleting article:", error.message);
    res.status(500).json({
      success: false,
      message: "Failed to delete article",
      error: error.message
    });
  }
});

app.listen(PORT, async () => {
  console.log("\n========================================");
  console.log("✅ BACKEND SERVER STARTED SUCCESSFULLY!");
  console.log("========================================");
  console.log(`Environment : ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database    : ${process.env.DB_NAME || 'profile_db'}`);
  console.log(`Host        : ${process.env.DB_HOST || 'localhost'}`);
  console.log(`URL Server  : http://localhost:${PORT}`);
  console.log("========================================\n");
  try {
    await db.query("SELECT 1");
    console.log("📌 [Database]: Sukses terhubung ke database MySQL.");
  } catch (err) {
    console.error("❌ [Database]: Gagal! Pastikan konfigurasi database benar.");
  }
});

// Wajib diexport untuk Vercel Serverless Functions
module.exports = app;
