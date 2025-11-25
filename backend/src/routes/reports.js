// backend/src/routes/reports.js
const express = require("express");
const router = express.Router();
const pool = require("../db");

/**
 * GET /api/reports/attendance-summary
 *
 * Returns per-student, per-subject summary:
 * [
 *   {
 *     student_id, roll_no, student_name,
 *     subject_id, code, subject_name,
 *     total_classes, present_count, percent
 *   }, ...
 * ]
 */
router.get("/attendance-summary", async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
         st.id                   AS student_id,
         st.roll_no              AS roll_no,
         st.name                 AS student_name,
         s.id                    AS subject_id,
         s.code                  AS code,
         s.name                  AS subject_name,
         COUNT(ar.id)            AS total_classes,
         SUM(ar.status = 'present') AS present_count
       FROM attendance_records ar
       JOIN attendance_sessions ses ON ar.session_id = ses.id
       JOIN students st           ON ar.student_id = st.id
       JOIN subjects s           ON ses.subject_id = s.id
       GROUP BY st.id, s.id
       ORDER BY st.roll_no, s.code`
    );

    // add percentage on the fly
    const data = rows.map((r) => ({
      ...r,
      percent:
        r.total_classes > 0
          ? Math.round((r.present_count / r.total_classes) * 100)
          : 0,
    }));

    res.json(data);
  } catch (err) {
    console.error("Error in /api/reports/attendance-summary:", err);
    res.status(500).json({ error: "Failed to fetch attendance summary" });
  }
});

module.exports = router;
