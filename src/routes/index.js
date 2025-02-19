const express = require("express");
const { syncPlaylists } = require("../controllers/sync");

const router = express.Router();

router.post("/sync-playlists", syncPlaylists);

module.exports = router;
