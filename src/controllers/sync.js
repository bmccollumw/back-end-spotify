const db = require("../db");

const syncPlaylists = async (req, res) => {
  try {
    const { playlists } = req.body;
    if (!playlists || playlists.length === 0) {
      return res.status(400).json({ error: "No playlists provided" });
    }

    for (const playlist of playlists) {
      await db.query(
        `INSERT INTO playlists (spotify_id, name, owner, is_public, total_tracks)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (spotify_id) DO NOTHING`,
        [playlist.id, playlist.name, playlist.owner.display_name, playlist.public, playlist.tracks.total]
      );
    }

    res.json({ message: "Playlists synced successfully!" });
  } catch (error) {
    console.error("Error syncing playlists:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = { syncPlaylists };
