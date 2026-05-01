require('dotenv').config();
const mssql = require('mssql');
mssql.connect({
  user: process.env.DB_USER, password: process.env.DB_PASS,
  server: process.env.DB_HOST, database: process.env.DB_NAME,
  port: 1433, options: { encrypt: false, trustServerCertificate: true }
}).then(async pool => {
  const r = await pool.request().query(`
    SELECT TOP 1 b.MaBaiTap, b.TenBaiTap, b.MoTa, b.YeuCau, b.TieuChiChamDiem, 
    d.TenDangBai, d.MaDangBai
    FROM BAITAP b LEFT JOIN DANGBAI d ON d.MaDangBai=b.MaDangBai
    WHERE b.MaBaiTap = 'KTLT_D1_01'
  `);
  console.log(JSON.stringify(r.recordset[0], null, 2));
  await mssql.close();
}).catch(e => console.error(e.message));
