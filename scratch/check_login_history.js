const mssql=require('mssql');
require('dotenv').config();
const cfg={user:process.env.DB_USER,password:process.env.DB_PASS,server:process.env.DB_HOST,database:process.env.DB_NAME,port:Number(process.env.DB_PORT||1433),options:{encrypt:false,trustServerCertificate:true}};
mssql.connect(cfg).then(async p=>{
  const r1 = await p.request().query('SELECT GETDATE() as ServerTime, CAST(GETDATE() AS DATE) as ServerDate');
  console.log('Server time:', JSON.stringify(r1.recordset[0]));

  const r2 = await p.request().query('SELECT TOP 5 Id, LecturerId, LoginTime, IsOnline FROM LOGIN_HISTORY ORDER BY LoginTime DESC');
  console.log('Latest 5 records:');
  r2.recordset.forEach(r => console.log(' ', JSON.stringify(r)));

  const r3 = await p.request().query("SELECT COUNT(*) as cnt FROM LOGIN_HISTORY WHERE CAST(LoginTime AS DATE) = CAST(GETDATE() AS DATE)");
  console.log('Records today (server date):', r3.recordset[0].cnt);

  const r4 = await p.request().query("SELECT COUNT(*) as cnt FROM LOGIN_HISTORY WHERE CAST(LoginTime AS DATE) = '2026-04-27'");
  console.log('Records on 2026-04-27:', r4.recordset[0].cnt);

  const r5 = await p.request().query("SELECT COUNT(*) as cnt FROM LOGIN_HISTORY WHERE CAST(LoginTime AS DATE) = '2026-04-28'");
  console.log('Records on 2026-04-28:', r5.recordset[0].cnt);

  p.close();
}).catch(e=>console.error(e.message));
