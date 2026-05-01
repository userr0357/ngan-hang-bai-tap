require('dotenv').config();
const mssql = require('mssql');
mssql.connect({
  user: process.env.DB_USER, password: process.env.DB_PASS,
  server: process.env.DB_HOST, database: process.env.DB_NAME,
  port: 1433, options: { encrypt: false, trustServerCertificate: true }
}).then(async pool => {
  const q = async (sql) => (await pool.request().query(sql)).recordset;
  const cols = async (t) => {
    const r = await pool.request().input('t', mssql.VarChar, t)
      .query('SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME=@t ORDER BY ORDINAL_POSITION');
    return r.recordset.map(c => c.COLUMN_NAME + '(' + c.DATA_TYPE + ')').join(', ');
  };

  // Check student-related tables
  const tables = ['students', 'class', 'student_csv_data', 'users', 'TAIKHOAN', 'AI_LichSuLamBai', 'run_results'];
  for (const t of tables) {
    try {
      console.log(`\n=== ${t} ===`);
      console.log('Cols:', await cols(t));
      const cnt = await q(`SELECT COUNT(*) AS c FROM [${t}]`);
      console.log('Count:', cnt[0].c);
      if (cnt[0].c > 0) {
        const sample = await q(`SELECT TOP 2 * FROM [${t}]`);
        console.log('Sample:', JSON.stringify(sample).substring(0, 400));
      }
    } catch (e) { console.log('Error:', e.message.substring(0, 80)); }
  }
  await mssql.close();
}).catch(e => console.error(e.message));
