// backend/src/routes/sections.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/sections -> list sections
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT id, name FROM sections ORDER BY name"
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching sections:", err);
    res.status(500).json({ error: "Failed to fetch sections" });
  }
});

module.exports = router;
