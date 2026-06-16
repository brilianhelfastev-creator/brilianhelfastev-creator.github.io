require('dotenv').config();
const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: process.env.DB_HOST || 'mysql-1a6ff4a2-brilianhelfastev-e4bb.e.aivencloud.com',
  port: process.env.DB_PORT || 15769,
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'defaultdb',
  ssl: { rejectUnauthorized: false }
});

const sql = `
ALTER TABLE users 
ADD COLUMN latitude DECIMAL(10, 8) DEFAULT -6.200000,
ADD COLUMN longitude DECIMAL(11, 8) DEFAULT 106.816666;
`;

connection.query(sql, (err, results) => {
  if (err) {
    console.error('❌ Gagal mengubah tabel users:', err);
    throw err;
  }
  console.log('✅ Kolom latitude dan longitude berhasil ditambahkan ke tabel users!');
  connection.end();
});
