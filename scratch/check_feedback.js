require('dotenv').config();
const mssql = require('mssql');
mssql.connect({
  user: process.env.DB_USER, password: process.env.DB_PASS,
  server: process.env.DB_HOST, database: process.env.DB_NAME,
  port: 1433, options: { encrypt: false, trustServerCertificate: true }
}).then(async pool => {
  // Check FEEDBACKS table
  const cols = await pool.request().query(`SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='FEEDBACKS' ORDER BY ORDINAL_POSITION`);
  console.log('FEEDBACKS columns:');
  cols.recordset.forEach(c => console.log(`  ${c.COLUMN_NAME} (${c.DATA_TYPE})`));

  const count = await pool.request().query(`SELECT COUNT(*) AS c FROM FEEDBACKS`);
  console.log('Count:', count.recordset[0].c);

  const sample = await pool.request().query(`SELECT TOP 5 * FROM FEEDBACKS ORDER BY Id DESC`);
  console.log('\nSample:', JSON.stringify(sample.recordset, null, 2));

  await mssql.close();
}).catch(e => console.error(e.message));
