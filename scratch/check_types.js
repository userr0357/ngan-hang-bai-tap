const db = require('../db-sql');
(async () => {
  const pool = await db.getPool();
  const r1 = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='students' AND COLUMN_NAME='student_id'");
  console.log('students.student_id:', r1.recordset[0].DATA_TYPE);
  const r2 = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='grading_history' AND COLUMN_NAME='student_id'");
  console.log('grading_history.student_id:', r2.recordset[0].DATA_TYPE);
  process.exit();
})();
