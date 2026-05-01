const db = require('../db-sql');
(async () => {
  try {
    const pool = await db.getPool();
    const r = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%OTP%' OR TABLE_NAME LIKE '%Reset%'");
    console.log('OTP Tables:', r.recordset);
  } catch (e) {
    console.error(e);
  }
  process.exit();
})();
