const db = require('../db-sql');
async function run() {
  try {
    const pool = await db.getPool();
    const r = await pool.request().query(`
      SELECT COLUMN_NAME
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_NAME = 'EXPORT_LOG'
    `);
    console.log(r.recordset);
  } catch(e) { console.error(e); }
}
run();
