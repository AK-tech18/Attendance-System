// scripts/create-admin.js
require('dotenv').config();
const pool = require('../src/db');
const bcrypt = require('bcrypt');

async function main() {
  try {
    const email = 'admin@example.com';
    const password = 'admin123';
    const password_hash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10));
    const [res] = await pool.query('INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)', [email, password_hash, 'admin']);
    console.log('Admin created:', email, 'id=', res.insertId);
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}
main();
