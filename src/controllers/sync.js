const db = require("../db");

async function syncPlaylists(playlists, userId) {
  try {
    console.log("📀 Saving Playlists to Database:", playlists, "👤 User ID:", userId);

    const insertQuery = `
      INSERT INTO playlists (spotify_id, name, owner, is_public, total_tracks, last_updated, user_id)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6)
      ON CONFLICT (spotify_id) DO UPDATE
      SET name = EXCLUDED.name, 
          owner = EXCLUDED.owner, 
          is_public = EXCLUDED.is_public,
          total_tracks = EXCLUDED.total_tracks,
          last_updated = CURRENT_TIMESTAMP
      RETURNING *;
    `;

    for (let playlist of playlists) {
      await db.none(insertQuery, [
        playlist.id,
        playlist.name,
        playlist.owner.display_name,
        playlist.public,
        playlist.tracks.total,
        userId, // ✅ Now saving user ID
      ]);
    }

    return { success: true, message: "Playlists synced successfully!" };
  } catch (error) {
    console.error("❌ Database Error:", error);
    throw error;
  }
}

module.exports = { syncPlaylists };
