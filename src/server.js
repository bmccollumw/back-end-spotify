require("dotenv").config();
const express = require("express");
const cors = require("cors");
const routes = require("./routes/index"); // ✅ Import Routes

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: "10mb" })); // ✅ Increase request size limit
app.use(routes); // ✅ Attach routes

app.listen(port, () => console.log(`✅ Backend running on port ${port}`));
