const db = require('../db-sql');
(async () => {
  const pool = await db.getPool();
  
  const r1 = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='run_results'");
  console.log('run_results:', r1.recordset.map(c => c.COLUMN_NAME).join(', '));
  
  const r2 = await pool.request().query("SELECT TOP 2 * FROM run_results");
  console.log('Sample run_results:', r2.recordset);

  // Check course_scores
  const r3 = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='course_scores'");
  console.log('\ncourse_scores:', r3.recordset.map(c => c.COLUMN_NAME).join(', '));
  
  process.exit();
})();
