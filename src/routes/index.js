const express = require("express");
const { syncPlaylists } = require("../controllers/sync");

const router = express.Router();

router.post("/api/sync", async (req, res) => {
  try {
    console.log("📥 Received Sync Request Body:", req.body);

    const { accessToken, userId, playlists } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }

    console.log(`✅ Received ${playlists.length} playlists from user ${userId}`);

    const result = await syncPlaylists(userId, playlists);
    res.json({ message: "Playlists synced!", result });

  } catch (error) {
    console.error("❌ Error syncing playlists:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;
