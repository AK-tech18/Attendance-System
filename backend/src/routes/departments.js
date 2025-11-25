// backend/src/routes/departments.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/departments -> list departments
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, code, name FROM departments ORDER BY name"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching departments:", err);
    res.status(500).json({ error: "Failed to fetch departments" });
  }
});

module.exports = router;
