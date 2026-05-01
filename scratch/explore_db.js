require('dotenv').config();
const mssql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 1433),
  options: { encrypt: false, trustServerCertificate: true },
  connectionTimeout: 10000
};

async function run() {
  const pool = await mssql.connect(config);
  const q = async (sql) => (await pool.request().query(sql)).recordset;
  const cols = async (tbl) => {
    const r = await pool.request().input('t', mssql.VarChar, tbl)
      .query('SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME=@t ORDER BY ORDINAL_POSITION');
    return r.recordset.map(c => c.COLUMN_NAME + '(' + c.DATA_TYPE + ')').join(', ');
  };

  console.log('\n=== GIANGVIEN ===');
  console.log('Cols:', await cols('GIANGVIEN'));
  const gv = await q('SELECT * FROM GIANGVIEN');
  console.log('Data:', JSON.stringify(gv));

  console.log('\n=== TAIKHOAN ===');
  try {
    console.log('Cols:', await cols('TAIKHOAN'));
    const tk = await q('SELECT TOP 3 * FROM TAIKHOAN');
    console.log('Data:', JSON.stringify(tk));
  } catch(e) { console.log('Skip:', e.message); }

  console.log('\n=== MONHOC ===');
  console.log('Cols:', await cols('MONHOC'));
  const mh = await q('SELECT * FROM MONHOC');
  console.log('Data:', JSON.stringify(mh));

  console.log('\n=== DANGBAI ===');
  console.log('Cols:', await cols('DANGBAI'));
  const dangbai = await q('SELECT * FROM DANGBAI');
  console.log('Data:', JSON.stringify(dangbai));

  console.log('\n=== DOKHO ===');
  console.log('Cols:', await cols('DOKHO'));
  const dokho = await q('SELECT * FROM DOKHO');
  console.log('Data:', JSON.stringify(dokho));

  console.log('\n=== BAITAP cols ===');
  console.log('Cols:', await cols('BAITAP'));
  const bt = await q('SELECT TOP 2 * FROM BAITAP');
  console.log('Sample:', JSON.stringify(bt).substring(0, 800));

  console.log('\n=== GIANGVIEN_MONHOC ===');
  console.log('Cols:', await cols('GIANGVIEN_MONHOC'));
  const gvm = await q('SELECT TOP 10 * FROM GIANGVIEN_MONHOC');
  console.log('Data:', JSON.stringify(gvm));

  console.log('\n=== EXERCISE_SKILL_METADATA ===');
  try {
    console.log('Cols:', await cols('EXERCISE_SKILL_METADATA'));
    const esm = await q('SELECT TOP 2 * FROM EXERCISE_SKILL_METADATA');
    console.log('Sample:', JSON.stringify(esm).substring(0, 400));
  } catch(e) { console.log('Skip:', e.message); }

  console.log('\n=== BAITAP_DINHDANG ===');
  try {
    console.log('Cols:', await cols('BAITAP_DINHDANG'));
    const bd = await q('SELECT TOP 3 * FROM BAITAP_DINHDANG');
    console.log('Data:', JSON.stringify(bd));
  } catch(e) { console.log('Skip:', e.message); }

  await mssql.close();
  console.log('\nDone.');
}

run().catch(e => console.error('ERROR:', e.message));
