const db = require('../db-sql');
(async () => {
  const pool = await db.getPool();
  const r = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='GIANGVIEN'");
  console.log(r.recordset);
  process.exit();
})();
