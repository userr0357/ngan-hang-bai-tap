require('dotenv').config();
const mssql = require('mssql');
const dbConfig = {
  user: process.env.DB_USER, password: process.env.DB_PASS,
  server: process.env.DB_HOST, database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 1433),
  options: { encrypt: false, trustServerCertificate: true }
};

async function run() {
  const pool = await mssql.connect(dbConfig);

  // Tất cả các bảng có tên liên quan đến môn/subject/course
  const tables = await pool.request().query(`
    SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES
    WHERE TABLE_TYPE='BASE TABLE'
    AND (TABLE_NAME LIKE '%MON%' OR TABLE_NAME LIKE '%SUBJECT%' OR TABLE_NAME LIKE '%COURSE%')
    ORDER BY TABLE_NAME
  `);
  console.log('=== Tables related to subjects ===');
  tables.recordset.forEach(t => console.log(' -', t.TABLE_NAME));

  // Chi tiết từng bảng
  for (const t of tables.recordset) {
    const cols = await pool.request().query(`
      SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, CHARACTER_MAXIMUM_LENGTH
      FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = '${t.TABLE_NAME}'
      ORDER BY ORDINAL_POSITION
    `);
    console.log(`\n=== ${t.TABLE_NAME} ===`);
    cols.recordset.forEach(c => console.log(`  ${c.COLUMN_NAME} (${c.DATA_TYPE}) nullable:${c.IS_NULLABLE} maxlen:${c.CHARACTER_MAXIMUM_LENGTH}`));
  }

  // Lấy vài dòng mẫu từ MONHOC
  const sample = await pool.request().query('SELECT TOP 3 * FROM MONHOC');
  console.log('\n=== MONHOC sample ===');
  console.log(JSON.stringify(sample.recordset, null, 2));

  await pool.close();
}
run().catch(console.error);
