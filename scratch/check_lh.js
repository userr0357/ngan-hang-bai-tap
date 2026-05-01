const db = require('../db-sql');
(async () => {
  const pool = await db.getPool();
  try {
    const r = await pool.request().query(`SELECT TOP 1 * FROM LOGIN_HISTORY`);
    console.log(r.recordset);
  } catch(e) {}
  process.exit();
})();
