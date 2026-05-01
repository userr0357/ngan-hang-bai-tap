const db = require('../db-sql');
(async () => {
  const pool = await db.getPool();
  
  const r1 = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='grading_history'");
  console.log('grading_history:', r1.recordset.map(c => c.COLUMN_NAME).join(', '));
  
  const r2 = await pool.request().query("SELECT TOP 2 * FROM grading_history");
  console.log('Sample grading_history:', r2.recordset);

  process.exit();
})();
