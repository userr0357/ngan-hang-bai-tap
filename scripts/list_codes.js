const sql = require('mssql');

const config = {
  user: process.env.DB_USER || 'userPersonalizedSystem',
  password: process.env.DB_PASS || '123456789',
  server: process.env.DB_HOST || '118.69.126.49',
  database: process.env.DB_NAME || 'Data_PersonalizedSystem',
  options: { encrypt: false, trustServerCertificate: true }
};

(async () => {
  try {
    const pool = await sql.connect(config);
    console.log('Connected to SQL, querying DINHDANG_NOPBAI...');
    const r1 = await pool.request().query('SELECT TOP 20 MaDinhDang, TenDinhDang FROM dbo.DINHDANG_NOPBAI');
    console.log('DINHDANG_NOPBAI rows:', r1.recordset);
    const r2 = await pool.request().query('SELECT TOP 20 MaDoKho, TenDoKho FROM dbo.DOKHO');
    console.log('DOKHO rows:', r2.recordset);
    await sql.close();
  } catch (e) {
    console.error('SQL error', e.message);
  }
})();
