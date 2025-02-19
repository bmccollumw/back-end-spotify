require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes/index"); // <-- Import routes
const db = require("./db");

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(routes); // <-- Use the routes

app.listen(port, () => console.log(`✅ Backend running on port ${port}`));

app.get("/api/playlists", async (req, res) => {
    try {
      const result = await db.query("SELECT * FROM playlists");
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching playlists:", error);
      res.status(500).json({ message: "Server Error" });
    }
  });
  