const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const multer = require("multer");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 8080;

// Connect to MongoDB
mongoose.connect(
  "mongodb+srv://duongquocvu1309:abc123456@cluster0.hqa2jcz.mongodb.net/",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => console.log("Connected to MongoDB"));

// Define schema for the data
const attendanceSchema = new mongoose.Schema({
  name: String,
  time: String,
  image: Buffer,
});
const Attendance = mongoose.model("Attendance", attendanceSchema);

// Configure multer to store uploaded images
const upload = multer({ dest: "uploads/" });

// Middleware for handling JSON data and image data
app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors());

// Route to handle POST requests
app.post("/upload", upload.single("image"), async (req, res) => {
  // Get data from the request
  const { name, time, image } = req.body;

  try {
    // Save the data to MongoDB
    const newAttendance = new Attendance({
      name: name,
      time: time,
      image: Buffer.from(image, "base64"), // Convert base64 string to buffer
    });

    await newAttendance.save(); // Use async/await to wait for the save operation

    res.status(201).send("Attendance data uploaded successfully.");
  } catch (err) {
    console.error("Error saving attendance data:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Route to fetch all attendance data
app.get("/", async (req, res) => {
  try {
    const allAttendance = await Attendance.find({}); // Retrieve all documents from the Attendance collection
    res.json(allAttendance); // Send the retrieved data as JSON response
  } catch (err) {
    console.error("Error fetching attendance data:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Log the name of the file that failed to post
app.use((err, req, res, next) => {
  console.error("File upload error:", err.message);
  res.status(500).send("File upload error");
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
