require("dotenv").config();
const axios = require("axios");
const db = require("../db");

// Function to sync playlists and songs
async function syncPlaylistsAndSongs(userId) {
  try {
    // ✅ Step 1: Get User's Access Token from DB
    const { rows } = await db.query("SELECT access_token FROM users WHERE id = $1", [userId]);
    if (rows.length === 0) throw new Error("User not found");
    
    const accessToken = rows[0].access_token;

    // ✅ Step 2: Fetch User's Playlists from Spotify
    const playlistsResponse = await axios.get("https://api.spotify.com/v1/me/playlists", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const playlists = playlistsResponse.data.items;

    for (const playlist of playlists) {
      // ✅ Step 3: Store Playlist in Database
      const playlistQuery = `
        INSERT INTO playlists (spotify_id, name, owner, is_public, total_tracks)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (spotify_id) DO UPDATE SET total_tracks = $5
        RETURNING id;
      `;
      const playlistValues = [
        playlist.id,
        playlist.name,
        playlist.owner.display_name,
        playlist.public,
        playlist.tracks.total,
      ];
      const { rows: playlistRows } = await db.query(playlistQuery, playlistValues);
      const playlistId = playlistRows[0].id;

      // ✅ Step 4: Fetch Songs from Each Playlist
      const songsResponse = await axios.get(`https://api.spotify.com/v1/playlists/${playlist.id}/tracks`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      for (const track of songsResponse.data.items) {
        const song = track.track;
        if (!song) continue;

        // ✅ Step 5: Fetch Audio Features for Additional Metadata
        const featuresResponse = await axios.get(`https://api.spotify.com/v1/audio-features/${song.id}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const features = featuresResponse.data || {};

        // ✅ Step 6: Store Song in Database
        const songQuery = `
          INSERT INTO songs (
            spotify_id, name, artist, album, duration_ms, popularity, explicit, preview_url, release_date, 
            bpm, energy, instrumentalness, key, loudness, mode, track_href, valence
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, 
            $10, $11, $12, $13, $14, $15, $16, $17
          )
          ON CONFLICT (spotify_id) DO NOTHING
          RETURNING id;
        `;
        const songValues = [
          song.id,
          song.name,
          song.artists.map(a => a.name).join(", "),
          song.album.name,
          song.duration_ms,
          song.popularity,
          song.explicit,
          song.preview_url,
          song.album.release_date,
          features.tempo || null,
          features.energy || null,
          features.instrumentalness || null,
          features.key || null,
          features.loudness || null,
          features.mode || null,
          song.href,
          features.valence || null,
        ];
        const { rows: songRows } = await db.query(songQuery, songValues);
        const songId = songRows.length > 0 ? songRows[0].id : null;

        // ✅ Step 7: Store Relationship in playlist_songs Table
        if (songId) {
          await db.query(`
            INSERT INTO playlist_songs (playlist_id, song_id)
            VALUES ($1, $2)
            ON CONFLICT DO NOTHING;
          `, [playlistId, songId]);
        }
      }
    }

    return { message: "Sync complete!" };
  } catch (error) {
    console.error("Sync error:", error);
    throw error;
  }
}

module.exports = { syncPlaylistsAndSongs };
