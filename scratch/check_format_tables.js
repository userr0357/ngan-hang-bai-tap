require('dotenv').config();
const mssql = require('mssql');
mssql.connect({
  user: process.env.DB_USER, password: process.env.DB_PASS,
  server: process.env.DB_HOST, database: process.env.DB_NAME,
  port: 1433, options: { encrypt: false, trustServerCertificate: true }
}).then(async pool => {
  // DINHDANG_NOPBAI
  const cols1 = await pool.request().query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='DINHDANG_NOPBAI'`);
  console.log('DINHDANG_NOPBAI cols:', cols1.recordset.map(c => c.COLUMN_NAME+'('+c.DATA_TYPE+')').join(', '));
  const d1 = await pool.request().query(`SELECT * FROM DINHDANG_NOPBAI`);
  console.log('Data:', JSON.stringify(d1.recordset));

  // BAITAP_DINHDANG  
  const cols2 = await pool.request().query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='BAITAP_DINHDANG'`);
  console.log('\nBAITAP_DINHDANG cols:', cols2.recordset.map(c => c.COLUMN_NAME+'('+c.DATA_TYPE+')').join(', '));
  const d2 = await pool.request().query(`SELECT TOP 10 * FROM BAITAP_DINHDANG`);
  console.log('Data:', JSON.stringify(d2.recordset));
  const cnt = await pool.request().query(`SELECT COUNT(*) AS c FROM BAITAP_DINHDANG`);
  console.log('Count:', cnt.recordset[0].c);

  // GV names
  const gv = await pool.request().query(`SELECT MaGiangVien, TenGiangVien FROM GIANGVIEN`);
  console.log('\nGiangVien:', JSON.stringify(gv.recordset));

  await mssql.close();
}).catch(e => console.error(e.message));
