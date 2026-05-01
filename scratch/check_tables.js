const db = require('../db-sql');
(async () => {
  const pool = await db.getPool();
  const r = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%MON%' OR TABLE_NAME LIKE '%GIANGVIEN%'");
  console.log('Tables:', r.recordset);
  
  // also check how the subjects are assigned
  const r2 = await pool.request().query("SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='GIANGVIEN_MONHOC'");
  console.log('GIANGVIEN_MONHOC:', r2.recordset);
  
  process.exit();
})();
