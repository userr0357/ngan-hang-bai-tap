const db = require('../db-sql');
(async () => {
  const pool = await db.getPool();
  const r = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME");
  r.recordset.forEach(t => console.log(t.TABLE_NAME));
  process.exit(0);
})().catch(e => { console.log('Error:', e.message); process.exit(1); });
