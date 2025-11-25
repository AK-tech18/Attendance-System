// backend/src/routes/students.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/students  -> all students with dept/section names
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT 
         s.id,
         s.roll_no,
         s.name,
         s.email,
         s.dept_id,
         d.name AS dept_name,
         s.year,
         s.section_id,
         sec.name AS section_name,
         s.active
       FROM students s
       LEFT JOIN departments d ON s.dept_id = d.id
       LEFT JOIN sections sec ON s.section_id = sec.id
       ORDER BY s.id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching students:", err);
    res.status(500).json({ error: "Server error while fetching students" });
  }
});

// POST /api/students  -> add student
router.post("/", async (req, res) => {
  try {
    const { roll_no, name, email, dept_id, year, section_id } = req.body;

    if (!roll_no || !name) {
      return res.status(400).json({ error: "roll_no and name are required" });
    }

    const dept = dept_id ? Number(dept_id) : null;
    const yr = year ? Number(year) : null;
    const section = section_id ? Number(section_id) : null;

    const [result] = await pool.query(
      `INSERT INTO students
         (roll_no, name, email, dept_id, year, section_id, active)
       VALUES (?, ?, ?, ?, ?, ?, 1)`,
      [roll_no, name, email || null, dept, yr, section]
    );

    res.json({
      id: result.insertId,
      roll_no,
      name,
      email,
      dept_id: dept,
      year: yr,
      section_id: section,
      active: 1,
    });
  } catch (err) {
    console.error("Error adding student:", err);

    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "roll_no already exists" });
    }

    if (err.code === "ER_NO_REFERENCED_ROW_2") {
      return res
        .status(400)
        .json({ error: "Invalid dept_id or section_id (no such row)" });
    }

    res.status(500).json({ error: "Failed to add student" });
  }
});

// DELETE /api/students/:id
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM students WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting student:", err);
    res.status(500).json({ error: "Failed to delete student" });
  }
});

module.exports = router;
