require('dotenv').config();
const mssql = require('mssql');

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 1433),
  options: { encrypt: false, trustServerCertificate: true }
};

async function run() {
  const pool = await mssql.connect(dbConfig);

  // 1. Cột của bảng GIANGVIEN
  const cols = await pool.request().query(`
    SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'GIANGVIEN'
    ORDER BY ORDINAL_POSITION
  `);
  console.log('=== GIANGVIEN columns ===');
  cols.recordset.forEach(c => console.log(`  ${c.COLUMN_NAME} (${c.DATA_TYPE}) nullable:${c.IS_NULLABLE}`));

  // 2. Sample rows (bỏ mật khẩu)
  const sample = await pool.request().query(`
    SELECT TOP 2 MaGiangVien, TenGiangVien, TenDangNhap, Email, Quyen, IsBlocked
    FROM GIANGVIEN
  `);
  console.log('\n=== GIANGVIEN sample ===');
  console.log(JSON.stringify(sample.recordset, null, 2));

  // 3. Cột GIANGVIEN_MONHOC
  const gvmh = await pool.request().query(`
    SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'GIANGVIEN_MONHOC' ORDER BY ORDINAL_POSITION
  `);
  console.log('\n=== GIANGVIEN_MONHOC columns ===');
  gvmh.recordset.forEach(c => console.log(`  ${c.COLUMN_NAME} (${c.DATA_TYPE})`));

  await pool.close();
}
run().catch(console.error);
