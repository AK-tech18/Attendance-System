// backend/src/routes/attendance.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

// ===========================================
// GET /api/attendance/faculty-sessions?faculty_id=2
// -> list subjects taught by this faculty
// ===========================================
router.get("/faculty-sessions", async (req, res) => {
  try {
    const facultyId = req.query.faculty_id;
    if (!facultyId) {
      return res.status(400).json({ error: "faculty_id is required" });
    }

    const [rows] = await pool.query(
      `SELECT 
         s.id          AS subject_id,
         s.code,
         s.name        AS subject_name,
         s.year,
         s.dept_id
       FROM faculty_subjects fs
       JOIN subjects s ON fs.subject_id = s.id
       WHERE fs.faculty_id = ?`,
      [facultyId]
    );

    res.json(rows);
  } catch (err) {
    console.error("Error in /attendance/faculty-sessions:", err);
    res.status(500).json({ error: "Failed to load faculty subjects" });
  }
});

// Helper: get any faculty id (for simple UI where we don't send faculty_id)
async function getAnyFacultyId() {
  const [rows] = await pool.query(
    "SELECT id FROM faculties ORDER BY id ASC LIMIT 1"
  );
  if (rows.length > 0) return rows[0].id;
  return 1; // fallback
}

// ===========================================
// POST /api/attendance/mark
//
// MODE 1 (complex - not used by your current UI)
// body: { faculty_id, subject_id, section_id?, date, records: [{student_id,status}] }
//
// MODE 2 (simple - used by your TakeAttendance.jsx)
// body: { student_id, subject_id, date, status }
// ===========================================
router.post("/mark", async (req, res) => {
  try {
    const body = req.body;

    // ---------- MODE 1: complex (records array) ----------
    if (Array.isArray(body.records)) {
      const { faculty_id, subject_id, section_id, date, records } = body;

      if (!faculty_id || !subject_id || !date || !Array.isArray(records)) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      // 1) Find existing session or create a new one
      let session_id;

      const [existing] = await pool.query(
        `SELECT id FROM attendance_sessions
         WHERE subject_id = ? AND faculty_id = ? AND session_date = ?
         LIMIT 1`,
        [subject_id, faculty_id, date]
      );

      if (existing.length > 0) {
        session_id = existing[0].id;
      } else {
        const [sessionRes] = await pool.query(
          `INSERT INTO attendance_sessions (subject_id, faculty_id, session_date)
           VALUES (?, ?, ?)`,
          [subject_id, faculty_id, date]
        );
        session_id = sessionRes.insertId;
      }

      // 2) Upsert each student's attendance for this session
      for (const rec of records) {
        if (!rec.student_id) continue;

        const status = rec.status === "present" ? "present" : "absent";

        await pool.query(
          `INSERT INTO attendance_records (student_id, session_id, status)
           VALUES (?, ?, ?)
           ON DUPLICATE KEY UPDATE status = VALUES(status)`,
          [rec.student_id, session_id, status]
        );
      }

      return res.json({ success: true, session_id });
    }

    // ---------- MODE 2: simple (single student) ----------
    const { student_id, subject_id, date, status } = body;

    if (!student_id || !subject_id || !date || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const faculty_id = await getAnyFacultyId();
    let session_id;

    const [existing] = await pool.query(
      `SELECT id FROM attendance_sessions
       WHERE subject_id = ? AND faculty_id = ? AND session_date = ?
       LIMIT 1`,
      [subject_id, faculty_id, date]
    );

    if (existing.length > 0) {
      session_id = existing[0].id;
    } else {
      const [sessionRes] = await pool.query(
        `INSERT INTO attendance_sessions (subject_id, faculty_id, session_date)
         VALUES (?, ?, ?)`,
        [subject_id, faculty_id, date]
      );
      session_id = sessionRes.insertId;
    }

    const finalStatus = status === "present" ? "present" : "absent";

    await pool.query(
      `INSERT INTO attendance_records (student_id, session_id, status)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE status = VALUES(status)`,
      [student_id, session_id, finalStatus]
    );

    return res.json({ success: true, session_id });
  } catch (err) {
    console.error("Error in /attendance/mark:", err);
    res.status(500).json({ error: "Failed to mark attendance" });
  }
});

// ===========================================
// POST /api/attendance/bulk-mark
// body: { student_ids: [..], subject_id, date, status }
// ===========================================
router.post("/bulk-mark", async (req, res) => {
  try {
    const { student_ids, subject_id, date, status } = req.body;

    if (!Array.isArray(student_ids) || student_ids.length === 0) {
      return res.status(400).json({ error: "student_ids required" });
    }
    if (!subject_id || !date || !status) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const faculty_id = await getAnyFacultyId();

    let session_id;
    const [existing] = await pool.query(
      `SELECT id FROM attendance_sessions
       WHERE subject_id = ? AND faculty_id = ? AND session_date = ?
       LIMIT 1`,
      [subject_id, faculty_id, date]
    );

    if (existing.length > 0) {
      session_id = existing[0].id;
    } else {
      const [sessionRes] = await pool.query(
        `INSERT INTO attendance_sessions (subject_id, faculty_id, session_date)
         VALUES (?, ?, ?)`,
        [subject_id, faculty_id, date]
      );
      session_id = sessionRes.insertId;
    }

    const finalStatus = status === "present" ? "present" : "absent";

    for (const sid of student_ids) {
      await pool.query(
        `INSERT INTO attendance_records (student_id, session_id, status)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE status = VALUES(status)`,
        [sid, session_id, finalStatus]
      );
    }

    res.json({ success: true, session_id });
  } catch (err) {
    console.error("Error in /attendance/bulk-mark:", err);
    res.status(500).json({ error: "Failed to bulk mark attendance" });
  }
});

module.exports = router;
