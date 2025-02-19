require("dotenv").config();
const { Pool } = require("pg");

// PostgreSQL Connection
const db = new Pool({
  user: "postgres",
  host: "localhost",
  database: "spotify_music_bank",
  password: process.env.DB_PASSWORD, // Stored in .env
  port: 5432,
});

module.exports = db;

