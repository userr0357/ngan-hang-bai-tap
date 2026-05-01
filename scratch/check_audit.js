const db = require('../db-sql');
(async () => {
  const pool = await db.getPool();
  // Get columns
  const r = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='EXERCISE_AUDIT_LOG' ORDER BY ORDINAL_POSITION");
  console.log('EXERCISE_AUDIT_LOG columns:');
  r.recordset.forEach(c => console.log(' ', c.COLUMN_NAME, '-', c.DATA_TYPE));
  
  // Get sample data
  const r2 = await pool.request().query("SELECT TOP 5 * FROM EXERCISE_AUDIT_LOG ORDER BY 1 DESC");
  console.log('\nSample data:', JSON.stringify(r2.recordset, null, 2));
  
  const r3 = await pool.request().query("SELECT COUNT(*) as cnt FROM EXERCISE_AUDIT_LOG");
  console.log('\nTotal rows:', r3.recordset[0].cnt);
  
  process.exit(0);
})().catch(e => { console.log('Error:', e.message); process.exit(1); });
