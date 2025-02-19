const express = require("express");
const { syncSpotifyData } = require("../controllers/sync");

const router = express.Router();

router.get("/", (req, res) => res.send("Spotify Backend is Running!"));

//New Sync Route
router.post("/api/sync", syncSpotifyData);

module.exports = router;
