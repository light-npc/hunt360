const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function run() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  const dbName = process.env.DB_NAME || 'hunt360';
  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
  await connection.query(`USE \`${dbName}\``);

  // Create tables
  await connection.query(`
    CREATE TABLE IF NOT EXISTS reports (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      value INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS hrhunt (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      role VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS corporate (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255),
      company VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  await connection.query(`
    CREATE TABLE IF NOT EXISTS campus (
      id INT AUTO_INCREMENT PRIMARY KEY,
      college VARCHAR(255),
      stream VARCHAR(255),
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create users table for demo auth
  await connection.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(255) UNIQUE,
      email VARCHAR(255) UNIQUE,
      password VARCHAR(255),
      role VARCHAR(50) DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Insert sample data
  await connection.query("INSERT INTO reports (name, value) VALUES ('sample report', 42) ON DUPLICATE KEY UPDATE name = name");
  await connection.query("INSERT INTO hrhunt (name, role) VALUES ('Alice', 'HR Manager') ON DUPLICATE KEY UPDATE name = name");
  await connection.query("INSERT INTO corporate (name, company) VALUES ('Bob', 'Acme Corp') ON DUPLICATE KEY UPDATE name = name");
  await connection.query("INSERT INTO campus (college, stream) VALUES ('State University', 'Computer Science') ON DUPLICATE KEY UPDATE college = college");

  // Insert demo user (username: admin, password: password)
  await connection.query("INSERT INTO users (username, email, password) VALUES ('admin', 'admin@example.com', 'password') ON DUPLICATE KEY UPDATE username = username");

  console.log('Seeding complete');
  await connection.end();
}

run().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
