const db = require('../db-sql');
(async () => {
  const pool = await db.getPool();
  const r = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='AI_LichSuLamBai'");
  console.log(r.recordset.map(c => c.COLUMN_NAME).join(', '));
  process.exit();
})();
