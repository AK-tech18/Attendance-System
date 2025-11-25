// backend/scripts/create-faculty.js
require("dotenv").config();
const pool = require("../src/db");
const bcrypt = require("bcrypt");

async function main() {
  try {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10", 10);

    // 1) Find CSE dept (or null)
    const [deptRows] = await pool.query(
      "SELECT id FROM departments WHERE code = ? LIMIT 1",
      ["CSE"]
    );
    const deptId = deptRows.length ? deptRows[0].id : null;

    // 2) Create / update faculty row
    const facultyEmail = "faculty1@example.com";
    const facultyName = "Demo Faculty";

    await pool.query(
      `INSERT INTO faculties (name, email, dept_id)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE
         name = VALUES(name),
         dept_id = VALUES(dept_id)`,
      [facultyName, facultyEmail, deptId]
    );

    const [facRow] = await pool.query(
      "SELECT id FROM faculties WHERE email = ? LIMIT 1",
      [facultyEmail]
    );
    const facultyId = facRow[0].id;

    // 3) Hash password and create / update user row
    const password = "faculty123";
    const password_hash = await bcrypt.hash(password, saltRounds);

    await pool.query(
      `INSERT INTO users (email, password_hash, role, faculty_id)
       VALUES (?, ?, 'faculty', ?)
       ON DUPLICATE KEY UPDATE
         password_hash = VALUES(password_hash),
         role          = VALUES(role),
         faculty_id    = VALUES(faculty_id)`,
      [facultyEmail, password_hash, facultyId]
    );

    console.log("=====================================");
    console.log("Faculty user created / updated:");
    console.log("Email   :", facultyEmail);
    console.log("Password: faculty123");
    console.log("Role    : faculty");
    console.log("=====================================");
    process.exit(0);
  } catch (err) {
    console.error("Error creating faculty user:", err);
    process.exit(1);
  }
}

main();
