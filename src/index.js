const express = require("express");
const mongoose = require("mongoose");
const app = express();
const dbUrl = process.env.DB_URL;

// connect DB

function ConnectToMongoDB() {
  try {
    mongoose.connect(dbUrl);
    console.log("Connected to DB");
  } catch (err) {
    console.log("Cannot connect to DB");
  }
}

ConnectToMongoDB();

// Middleware to handle JSON request body
app.use(express.json());

// end points

app.get("/", (req, res) => {
  console.log("/ called");
  res.send("Server is running");
});

// Routes  =>
// 1. auth - login ,signup, getuser
// 2. blog - crud

const PORT = process.env.PORT || 8080;

app.listen(PORT, (req, res) => {
  console.log(`Server is running on port: ${PORT}`);
});
