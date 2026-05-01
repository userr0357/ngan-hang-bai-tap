const db = require('../db-sql');
(async () => {
  const pool = await db.getPool();
  const r = await pool.request().query("SELECT TOP 5 * FROM AI_LichSuLamBai ORDER BY NgayLam DESC");
  console.log(r.recordset);
  process.exit();
})();
