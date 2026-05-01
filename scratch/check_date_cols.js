const db = require('../db-sql');
(async () => {
  const pool = await db.getPool();
  const r = await pool.request().query(`
    SELECT TABLE_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE COLUMN_NAME LIKE '%date%' OR COLUMN_NAME LIKE '%time%' OR COLUMN_NAME LIKE '%ngay%' OR COLUMN_NAME LIKE '%created%'
  `);
  console.log(Array.from(new Set(r.recordset.map(c => c.TABLE_NAME))).join(', '));
  process.exit();
})();
