  // backend/src/routes/faculties.js
  const express = require("express");
  const router = express.Router();
  const pool = require("../db");

  // GET /api/faculties -> list with dept name
  router.get("/", async (req, res) => {
    try {
      const [rows] = await pool.query(
        `SELECT f.id, f.name, f.email, f.dept_id, d.name AS dept_name
        FROM faculties f
        LEFT JOIN departments d ON f.dept_id = d.id
        ORDER BY f.id DESC`
      );
      res.json(rows);
    } catch (err) {
      console.error("Error fetching faculties:", err);
      res.status(500).json({ error: "Failed to fetch faculties" });
    }
  });

  // POST /api/faculties
  router.post("/", async (req, res) => {
    try {
      const { name, email, dept_id } = req.body;
      if (!name || !email) {
        return res.status(400).json({ error: "name and email are required" });
      }

      const dept = dept_id ? Number(dept_id) : null;

      // 1️⃣ Create faculty
      const [result] = await pool.query(
        `INSERT INTO faculties (name, email, dept_id)
        VALUES (?, ?, ?)`,
        [name, email, dept]
      );
      const faculty_id = result.insertId;

      // 2️⃣ Create user login
      const defaultPassword = "faculty123";
      const password_hash = await bcrypt.hash(defaultPassword, 10);

      await pool.query(
        `INSERT INTO users (email, password_hash, role, faculty_id)
        VALUES (?, ?, 'faculty', ?)`,
        [email, password_hash, faculty_id]
      );

      res.json({
        id: faculty_id,
        name,
        email,
        dept_id: dept,
        login_password: defaultPassword
      });

    } catch (err) {
      console.error("Error creating faculty:", err);
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({ error: "email already exists" });
      }
      res.status(500).json({ error: "Failed to create faculty" });
    }
  });


  // PUT /api/faculties/:id
  router.put("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const { name, email, dept_id } = req.body;
      const dept = dept_id ? Number(dept_id) : null;

      await pool.query(
        `UPDATE faculties
        SET name = ?, email = ?, dept_id = ?
        WHERE id = ?`,
        [name, email || null, dept, id]
      );

      res.json({ success: true });
    } catch (err) {
      console.error("Error updating faculty:", err);
      res.status(500).json({ error: "Failed to update faculty" });
    }
  });

  // DELETE /api/faculties/:id
  router.delete("/:id", async (req, res) => {
    try {
      const { id } = req.params;
      await pool.query("DELETE FROM faculties WHERE id = ?", [id]);
      res.json({ success: true });
    } catch (err) {
      console.error("Error deleting faculty:", err);
      res.status(500).json({ error: "Failed to delete faculty" });
    }
  });

  module.exports = router;
