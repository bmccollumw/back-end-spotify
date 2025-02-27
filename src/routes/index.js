const express = require("express");
const { syncPlaylists } = require("../controllers/sync");

const router = express.Router();

router.post("/api/sync", async (req, res) => {
  try {
    console.log("📥 Received Sync Request Body:", req.body);

    if (!req.body.userId) {
      console.error("❌ No user ID received!");
      return res.status(400).json({ error: "User ID is required." });
    }

    if (!req.body.playlists || req.body.playlists.length === 0) {
      return res.status(400).json({ error: "No playlists provided." });
    }

    console.log(`✅ Received ${req.body.playlists.length} playlists for syncing for user ${req.body.userId}`);
    const result = await syncPlaylists(req.body.playlists, req.body.userId);
    res.json({ message: "Playlists synced!", result });

  } catch (error) {
    console.error("❌ Error syncing playlists:", error);
    res.status(500).json({ message: "Server Error" });
  }
});


module.exports = router;
