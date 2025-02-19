require("dotenv").config();
const express = require("express");
const cors = require("cors");
const db = require("./db"); // Import the database connection
const userRoutes = require("./routes/userRoutes"); // Import user-related routes
const syncRoutes = require("./routes/syncRoutes"); // Import sync-related routes

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("🎧 Spotify Backend is Running!");
});

// Use Routes
app.use("/api", userRoutes);
app.use("/api", syncRoutes);

// Start Server
app.listen(port, () => console.log(`✅ Backend running on port ${port}`));
