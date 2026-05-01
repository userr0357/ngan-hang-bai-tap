const db = require('../db-sql');
(async () => {
  const pool = await db.getPool();
  const r = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='LOGIN_HISTORY' ORDER BY ORDINAL_POSITION");
  console.log('LOGIN_HISTORY columns:', r.recordset.map(c => c.COLUMN_NAME).join(', '));
  
  const r2 = await pool.request().query("SELECT TOP 2 * FROM LOGIN_HISTORY ORDER BY 1 DESC");
  if (r2.recordset.length) console.log('Sample:', JSON.stringify(r2.recordset[0], null, 2));
  
  process.exit(0);
})().catch(e => { console.log('Error:', e.message); process.exit(1); });
