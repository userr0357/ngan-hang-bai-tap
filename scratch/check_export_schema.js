const mssql = require('mssql');
require('dotenv').config();
const cfg = {
  user: process.env.DB_USER, password: process.env.DB_PASS,
  server: process.env.DB_HOST, database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT||1433),
  options: { encrypt: false, trustServerCertificate: true }
};

(async () => {
  const pool = await mssql.connect(cfg);

  // 1. All tables
  const tables = await pool.request().query(
    "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE='BASE TABLE' ORDER BY TABLE_NAME"
  );
  console.log('\n=== ALL TABLES ===');
  tables.recordset.forEach(t => console.log(' -', t.TABLE_NAME));

  // 2. Check for export-related tables/columns
  const exportCheck = await pool.request().query(`
    SELECT TABLE_NAME, COLUMN_NAME, DATA_TYPE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE COLUMN_NAME LIKE '%export%' OR COLUMN_NAME LIKE '%xuat%' 
       OR COLUMN_NAME LIKE '%report%' OR COLUMN_NAME LIKE '%bao_cao%'
       OR TABLE_NAME LIKE '%export%' OR TABLE_NAME LIKE '%report%'
  `);
  console.log('\n=== EXPORT-RELATED COLS ===');
  if (!exportCheck.recordset.length) console.log(' (none found)');
  exportCheck.recordset.forEach(r => console.log(` - ${r.TABLE_NAME}.${r.COLUMN_NAME} [${r.DATA_TYPE}]`));

  // 3. BAITAP columns
  const baitap = await pool.request().query(
    "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='BAITAP' ORDER BY ORDINAL_POSITION"
  );
  console.log('\n=== BAITAP COLUMNS ===');
  baitap.recordset.forEach(r => console.log(` - ${r.COLUMN_NAME} [${r.DATA_TYPE}]`));

  // 4. grading_history columns
  const gh = await pool.request().query(
    "SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='grading_history' ORDER BY ORDINAL_POSITION"
  );
  console.log('\n=== grading_history COLUMNS ===');
  gh.recordset.forEach(r => console.log(` - ${r.COLUMN_NAME} [${r.DATA_TYPE}]`));

  // 5. Sample exercise count
  const cnt = await pool.request().query('SELECT COUNT(*) as total FROM BAITAP WHERE ISNULL(IsDeleted,0)=0');
  console.log('\n=== EXERCISE COUNT ===', cnt.recordset[0].total);

  process.exit(0);
})().catch(e => { console.error(e.message); process.exit(1); });
