const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/faculty-sessions?faculty_id=#
router.get("/faculty-sessions", async (req, res) => {
  try {
    const faculty_id = req.query.faculty_id;

    if (!faculty_id) {
      return res.status(400).json({ error: "faculty_id missing" });
    }

    const [rows] = await pool.query(
      `SELECT s.id, s.code, s.name, s.year, s.dept_id
       FROM subjects s
       JOIN faculty_subjects fs ON fs.subject_id = s.id
       WHERE fs.faculty_id = ?`,
      [faculty_id]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error loading faculty sessions:", err);
    res.status(500).json({ error: "Failed to load faculty sessions" });
  }
});

module.exports = router;
