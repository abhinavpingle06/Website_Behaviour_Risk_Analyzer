require('dotenv').config({ path: './.env' });
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});

(async () => {
  try {
    const res = await pool.query('SELECT 1 as ok');
    console.log('DB test result:', res.rows);
  } catch (err) {
    console.error('DB test error:', err);
  } finally {
    await pool.end();
  }
})();
