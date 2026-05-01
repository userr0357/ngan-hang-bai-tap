const db = require('../db-sql');
(async () => {
  try {
    const pool = await db.getPool();
    const r = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='PasswordResetOTP'");
    console.log('PasswordResetOTP Schema:', r.recordset);
  } catch (e) {
    console.error(e);
  }
  process.exit();
})();
