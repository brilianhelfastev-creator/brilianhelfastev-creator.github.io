require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'mysql-1a6ff4a2-brilianhelfastev-e4bb.e.aivencloud.com',
  port: process.env.DB_PORT || 15769,
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD, // Password dihapus dari kode demi keamanan, gunakan .env
  database: process.env.DB_NAME || 'defaultdb',
  ssl: { rejectUnauthorized: false },
  multipleStatements: true // Penting untuk menjalankan beberapa query sekaligus
});

const sql = `
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

INSERT IGNORE INTO users (username, password) VALUES ('admin', 'admin123');

CREATE TABLE IF NOT EXISTS articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  judul VARCHAR(255) NOT NULL,
  konten TEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO articles (judul, konten, created_at, updated_at) VALUES 
('Selamat Datang di Blog Saya', 'Ini adalah artikel pertama saya.', NOW(), NOW());
`;

connection.query(sql, (err, results) => {
  if (err) {
    console.error('❌ Gagal membuat tabel:', err);
    throw err;
  }
  console.log('✅ Tabel users dan articles berhasil dibuat!');
  console.log('✅ Data dummy admin dan artikel telah ditambahkan!');
  connection.end();
});
