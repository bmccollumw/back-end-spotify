require("dotenv").config();
const { Pool } = require("pg");

console.log("🔍 Checking DB Connection...");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "spotify_music_bank",
  password: process.env.DB_PASSWORD,
  port: 5432,
});

pool.connect()
  .then(() => console.log("✅ Connected to PostgreSQL!"))
  .catch((err) => console.error("❌ PostgreSQL Connection Error:", err));

module.exports = pool;
