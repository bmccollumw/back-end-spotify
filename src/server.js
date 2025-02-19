require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes/index"); // <-- Import routes

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(routes); // <-- Use the routes

app.listen(port, () => console.log(`✅ Backend running on port ${port}`));
