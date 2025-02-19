require("dotenv").config();
const db = require("../db");
const axios = require("axios");

async function syncSpotifyData(req, res) {
  try {
    const accessToken = req.headers.authorization?.split(" ")[1]; // Get Bearer token
    if (!accessToken) {
      return res.status(401).json({ message: "Missing access token" });
    }

    // 1️⃣ Fetch user's playlists from Spotify API
    const { data: playlistsData } = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    for (const playlist of playlistsData.items) {
      // Insert playlist if it doesn't exist
      await db.query(
        `INSERT INTO playlists (spotify_id, name, owner, is_public, total_tracks)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (spotify_id) DO UPDATE SET name = EXCLUDED.name, total_tracks = EXCLUDED.total_tracks`,
        [playlist.id, playlist.name, playlist.owner.display_name, playlist.public, playlist.tracks.total]
      );

      // 2️⃣ Fetch all songs for this playlist
      const { data: tracksData } = await axios.get(playlist.tracks.href, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      for (const item of tracksData.items) {
        const track = item.track;
        if (!track) continue; // Skip if no track data

        // Insert song if it doesn't exist
        await db.query(
          `INSERT INTO songs (spotify_id, name, artist, album, duration_ms, explicit)
           VALUES ($1, $2, $3, $4, $5, $6)
           ON CONFLICT (spotify_id) DO NOTHING`,
          [track.id, track.name, track.artists.map(a => a.name).join(", "), track.album.name, track.duration_ms, track.explicit]
        );

        // Link song to playlist in `playlist_songs`
        await db.query(
          `INSERT INTO playlist_songs (playlist_id, song_id)
           SELECT playlists.id, songs.id FROM playlists, songs
           WHERE playlists.spotify_id = $1 AND songs.spotify_id = $2
           ON CONFLICT DO NOTHING`,
          [playlist.id, track.id]
        );
      }
    }

    res.status(200).json({ message: "Sync successful" });
  } catch (error) {
    console.error("Sync error:", error);
    res.status(500).json({ message: "Error syncing Spotify data" });
  }
}

module.exports = { syncSpotifyData };
