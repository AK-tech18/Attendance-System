// check-DB.js
require('dotenv').config();
const pool = require('./src/db');

async function test() {
  try {
    const [rows] = await pool.query('SELECT DATABASE() AS db, NOW() AS now');
    console.log('DB connected:', rows[0]);
    process.exit(0);
  } catch (err) {
    console.error('DB connection failed:', err.message || err);
    process.exit(1);
  }
}
test();
    