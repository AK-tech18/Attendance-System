// backend/app.js
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();

// ---- IMPORT ROUTES ----
const authRoutes = require("./src/routes/auth");
const studentRoutes = require("./src/routes/students");
const departmentRoutes = require("./src/routes/departments");
const sectionRoutes = require("./src/routes/sections");
const attendanceRoutes = require("./src/routes/attendance");
const facultyRoutes = require("./src/routes/faculties");
const subjectRoutes = require("./src/routes/subjects");
const reportsRoutes = require("./src/routes/reports");

// ---- CORS ----
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
  })
);

// ---- BODY PARSER ----
app.use(express.json());

// ---- ROUTES ----
app.use("/api/auth", authRoutes);

app.use("/api/students", studentRoutes);
app.use("/api/departments", departmentRoutes);
app.use("/api/sections", sectionRoutes);

app.use("/api/attendance", attendanceRoutes);

// IMPORTANT: these two must match what the frontend calls
// api("/faculties") -> /api/faculties
// api("/subjects")  -> /api/subjects
app.use("/api/faculties", facultyRoutes);
app.use("/api/subjects", subjectRoutes);

app.use("/api/reports", reportsRoutes);

// health check
app.get("/", (req, res) => {
  res.send("Attendance backend is running");
});

module.exports = app;
