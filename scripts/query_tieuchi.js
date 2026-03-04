const sql = require('mssql');

const config = {
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  server: process.env.DB_HOST,
  database: process.env.DB_NAME,
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true
  },
  pool: { max: 5, min: 0, idleTimeoutMillis: 30000 }
};

(async () => {
  try {
    console.log('Connecting to', process.env.DB_HOST, 'database', process.env.DB_NAME);
    await sql.connect(config);
    const req = new sql.Request();

    const cols = await req.query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='TIEUCHI_DANGBAI'");
    console.log('--- COLUMNS ---');
    console.log(JSON.stringify(cols.recordset, null, 2));

    const rows = await req.query('SELECT TOP 50 * FROM TIEUCHI_DANGBAI');
    console.log('--- SAMPLE ROWS (TOP 50) ---');
    console.log(JSON.stringify(rows.recordset, null, 2));

    const keys = await req.query("SELECT TOP 50 ID, TenTieuChi, TrongSo FROM TIEUCHI_DANGBAI");
    console.log('--- ID / TenTieuChi / TrongSo ---');
    console.log(JSON.stringify(keys.recordset, null, 2));

  } catch (err) {
    console.error('ERROR', err && err.message ? err.message : err);
    if (err && err.code) console.error('CODE:', err.code);
  } finally {
    try { await sql.close(); } catch(e){}
  }
})();
