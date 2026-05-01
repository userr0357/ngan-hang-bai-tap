const db = require('../db-sql');
(async () => {
  const pool = await db.getPool();
  try {
    const r = await pool.request().query("SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME IN ('rubrics', 'TIEUCHI_DANGBAI', 'exercise_details')");
    console.log(r.recordset);
  } catch(e) {}
  process.exit();
})();
