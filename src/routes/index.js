const express = require("express");
const db = require("../db");
const { syncPlaylists } = require("../controllers/sync");

const router = express.Router();

// 🎵 Get All Playlists
router.get("/playlists", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM playlists");
    res.json(result.rows);
  } catch (error) {
    console.error("❌ Error fetching playlists:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// 🔄 Sync Playlists with Spotify API
router.post("/sync", syncPlaylists);

module.exports = router;
