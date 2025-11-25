// backend/src/routes/subjects.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

// GET /api/subjects -> list with dept name
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.code, s.name, s.dept_id, d.name AS dept_name,
              s.year, s.created_at
       FROM subjects s
       LEFT JOIN departments d ON s.dept_id = d.id
       ORDER BY s.id DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching subjects:", err);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

// CREATE subject
router.post("/", async (req, res) => {
  try {
    const { code, name, dept_id, year } = req.body;
    if (!code || !name) {
      return res.status(400).json({ error: "code and name are required" });
    }
    const dept = dept_id ? Number(dept_id) : null;
    const yr = year ? Number(year) : null;

    const [result] = await pool.query(
      `INSERT INTO subjects (code, name, dept_id, year)
       VALUES (?, ?, ?, ?)`,
      [code, name, dept, yr]
    );

    res.json({ id: result.insertId, code, name, dept_id: dept, year: yr });
  } catch (err) {
    console.error("Error creating subject:", err);
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ error: "code already exists" });
    }
    res.status(500).json({ error: "Failed to create subject" });
  }
});

// UPDATE subject
router.put("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { code, name, dept_id, year } = req.body;
    const dept = dept_id ? Number(dept_id) : null;
    const yr = year ? Number(year) : null;

    await pool.query(
      `UPDATE subjects
       SET code = ?, name = ?, dept_id = ?, year = ?
       WHERE id = ?`,
      [code, name, dept, yr, id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error updating subject:", err);
    res.status(500).json({ error: "Failed to update subject" });
  }
});

// DELETE subject
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM subjects WHERE id = ?", [id]);
    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting subject:", err);
    res.status(500).json({ error: "Failed to delete subject" });
  }
});

// ===== faculty_subjects mapping =====

// GET /api/subjects/mappings -> which faculty teaches which subject
router.get("/mappings", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT fs.id,
              fs.faculty_id,
              f.name AS faculty_name,
              s.id AS subject_id,
              s.code AS subject_code,
              s.name AS subject_name
       FROM faculty_subjects fs
       JOIN faculties f ON fs.faculty_id = f.id
       JOIN subjects s ON fs.subject_id = s.id
       ORDER BY f.name, s.code`
    );
    res.json(rows);
  } catch (err) {
    console.error("Error fetching mappings:", err);
    res.status(500).json({ error: "Failed to fetch mappings" });
  }
});

// POST /api/subjects/assign {faculty_id, subject_id}
router.post("/assign", async (req, res) => {
  try {
    const { faculty_id, subject_id } = req.body;
    if (!faculty_id || !subject_id) {
      return res
        .status(400)
        .json({ error: "faculty_id and subject_id required" });
    }

    await pool.query(
      `INSERT INTO faculty_subjects (faculty_id, subject_id)
       VALUES (?, ?)
       ON DUPLICATE KEY UPDATE faculty_id = faculty_id`,
      [faculty_id, subject_id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error assigning subject:", err);
    res.status(500).json({ error: "Failed to assign subject" });
  }
});


// DELETE /api/subjects/mappings/:id  -> delete mapping by its id
// DELETE /api/subjects/mappings/:id  -> delete one faculty_subjects row by id
router.delete("/mappings/:id", async (req, res) => {
  try {
    const { id } = req.params;

    await pool.query(
      "DELETE FROM faculty_subjects WHERE id = ?",
      [id]
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Error unassigning subject:", err);
    res.status(500).json({ error: "Failed to unassign subject" });
  }
});



module.exports = router;
