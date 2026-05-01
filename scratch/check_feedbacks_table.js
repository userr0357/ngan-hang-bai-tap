// Check FEEDBACKS table schema and sample data
require('dotenv').config();
const mssql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 1433),
  options: { encrypt: false, trustServerCertificate: true }
};

async function main() {
  const pool = await mssql.connect(config);
  
  // Get columns
  const cols = await pool.request().query(`
    SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, IS_NULLABLE
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_NAME = 'FEEDBACKS'
    ORDER BY ORDINAL_POSITION
  `);
  console.log('\n=== FEEDBACKS COLUMNS ===');
  cols.recordset.forEach(c => console.log(`  ${c.COLUMN_NAME} (${c.DATA_TYPE}${c.CHARACTER_MAXIMUM_LENGTH?'('+c.CHARACTER_MAXIMUM_LENGTH+')':''}) ${c.IS_NULLABLE==='NO'?'NOT NULL':''}`));

  // Sample rows
  const rows = await pool.request().query('SELECT TOP 3 * FROM FEEDBACKS');
  console.log('\n=== SAMPLE ROWS ===');
  console.log(JSON.stringify(rows.recordset, null, 2));

  // Row count
  const cnt = await pool.request().query('SELECT COUNT(*) as total FROM FEEDBACKS');
  console.log('\nTotal rows:', cnt.recordset[0].total);

  await pool.close();
}
main().catch(e => console.error('ERROR:', e.message));
