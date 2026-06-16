-- Script untuk membuat tabel di database Aiven (MySQL)

-- 1. Buat tabel users
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert data dummy untuk admin (password disarankan dihash dengan bcrypt nantinya)
INSERT IGNORE INTO users (username, password) VALUES ('admin', 'admin123');

-- 2. Buat tabel articles
-- Menggunakan kolom judul dan konten sesuai dengan kode di script.js
CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  konten TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert data dummy artikel
INSERT IGNORE INTO articles (judul, konten, created_at, updated_at) VALUES 
('Selamat Datang di Blog Saya', 'Ini adalah artikel pertama saya.', NOW(), NOW());
