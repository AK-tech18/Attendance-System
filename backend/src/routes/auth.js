// backend/src/routes/auth.js
const express = require('express');
const router = express.Router();
const pool = require('../db');
//const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { authenticateToken, requireRole } = require('../middleware/auth');

const jwtSecret = process.env.JWT_SECRET || 'secret';
const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '7d';
const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10);

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'email & password required' });
    }

    const [rows] = await pool.query(
      'SELECT id, email, password_hash, role, faculty_id FROM users WHERE email = ?',
      [email]
    );

    const user = rows[0];
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const ok = password === user.password_hash;
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
      faculty_id: user.faculty_id,
    };

    const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

    res.json({ token, user: payload });
  } catch (err) {
    next(err);
  }
});
// POST /api/auth/change-password
router.post("/change-password", authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user.id; // comes from JWT via authenticateToken
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "oldPassword & newPassword required" });
    }

    // Get current user record
    const [rows] = await pool.query(
      "SELECT id, password_hash FROM users WHERE id = ?",
      [userId]
    );
    const user = rows[0];
    if (!user) return res.status(404).json({ error: "User not found" });

    // ⚠ We are using plain-text passwords in this project
    const ok = oldPassword === user.password_hash;
    if (!ok) return res.status(401).json({ error: "Current password is incorrect" });

    // Update to new password
    await pool.query(
      "UPDATE users SET password_hash = ? WHERE id = ?",
      [newPassword, userId]
    );

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register (admin only)
router.post(
  '/register',
  authenticateToken,
  requireRole('admin'),
  async (req, res, next) => {
    try {
      const { email, password, role = 'faculty', faculty_id = null } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: 'email & password required' });
      }

      const password_hash = password; // store as plain text for this project


      const [result] = await pool.query(
        'INSERT INTO users (email, password_hash, role, faculty_id) VALUES (?, ?, ?, ?)',
        [email, password_hash, role, faculty_id]
      );

      res
        .status(201)
        .json({ id: result.insertId, email, role, faculty_id });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ error: 'Email already exists' });
      }
      next(err);
    }
  }
);

module.exports = router;
