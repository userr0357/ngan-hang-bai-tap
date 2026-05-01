require('dotenv').config();
const mssql = require('mssql');
mssql.connect({
  user: process.env.DB_USER, password: process.env.DB_PASS,
  server: process.env.DB_HOST, database: process.env.DB_NAME,
  port: 1433, options: { encrypt: false, trustServerCertificate: true }
}).then(async pool => {
  // Check BAITAP columns for submission format
  const cols = await pool.request().query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='BAITAP' ORDER BY ORDINAL_POSITION`);
  console.log('BAITAP columns:');
  cols.recordset.forEach(c => console.log(`  ${c.COLUMN_NAME} (${c.DATA_TYPE})`));

  // Check for submission format related tables
  const tables = await pool.request().query(`SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME LIKE '%nop%' OR TABLE_NAME LIKE '%submit%' OR TABLE_NAME LIKE '%format%' OR TABLE_NAME LIKE '%dinh%' ORDER BY TABLE_NAME`);
  console.log('\nSubmission-related tables:', tables.recordset.map(t => t.TABLE_NAME));

  // Sample BAITAP to see submission_format column
  const sample = await pool.request().query(`SELECT TOP 3 Id, MaBaiTap, TenBaiTap, MaGiangVien, submission_format FROM BAITAP WHERE submission_format IS NOT NULL`);
  console.log('\nSample with submission_format:', JSON.stringify(sample.recordset, null, 2));

  // Get distinct submission formats
  try {
    const formats = await pool.request().query(`SELECT DISTINCT submission_format FROM BAITAP WHERE submission_format IS NOT NULL AND submission_format != ''`);
    console.log('\nDistinct formats:', formats.recordset.map(f => f.submission_format));
  } catch(e) { console.log('No submission_format column:', e.message.substring(0,80)); }

  // Get GIANGVIEN names
  const gv = await pool.request().query(`SELECT MaGiangVien, TenGiangVien FROM GIANGVIEN`);
  console.log('\nGiangVien:', JSON.stringify(gv.recordset));

  await mssql.close();
}).catch(e => console.error(e.message));
