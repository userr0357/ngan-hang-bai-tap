require('dotenv').config();
const mssql = require('mssql');
const cfg = {
  user: process.env.DB_USER, password: process.env.DB_PASS,
  server: process.env.DB_HOST, database: process.env.DB_NAME,
  port: +(process.env.DB_PORT||1433),
  options: { encrypt: false, trustServerCertificate: true }
};
mssql.connect(cfg).then(async pool => {
  const r = await pool.request().query(
    "SELECT TOP 3 MaGiangVien, TenDangNhap, LEFT(MatKhau,25) as PwdHint FROM GIANGVIEN WHERE ISNULL(IsBlocked,0)=0"
  );
  console.log(JSON.stringify(r.recordset, null, 2));
  pool.close();
}).catch(e => console.error(e.message));
