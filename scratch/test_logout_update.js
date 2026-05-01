const mssql = require('mssql');
require('dotenv').config();
const cfg = {
  user: process.env.DB_USER, password: process.env.DB_PASS,
  server: process.env.DB_HOST, database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 1433),
  options: { encrypt: false, trustServerCertificate: true }
};

mssql.connect(cfg).then(async p => {
  // Test: xem record nào IsOnline=1 của ADMIN00
  const r1 = await p.request().query(`
    SELECT TOP 3 Id, LecturerId, LoginTime, LogoutTime, IsOnline, DurationMinutes
    FROM LOGIN_HISTORY
    WHERE LecturerId = 'ADMIN00' AND IsOnline = 1
    ORDER BY LoginTime DESC
  `);
  console.log('Records IsOnline=1:', JSON.stringify(r1.recordset, null, 2));

  // Test: thử UPDATE manually giống logLogoutToSql
  const r2 = await p.request()
    .input('LecturerId', mssql.NVarChar, 'ADMIN00')
    .query(`
      SELECT TOP 1 Id FROM LOGIN_HISTORY
      WHERE LecturerId = @LecturerId AND IsOnline = 1
      ORDER BY LoginTime DESC
    `);
  console.log('UPDATE target Id:', r2.recordset[0]?.Id);

  // Thực sự UPDATE
  if (r2.recordset[0]?.Id) {
    const id = r2.recordset[0].Id;
    await p.request().input('id', mssql.Int, id).query(`
      UPDATE LOGIN_HISTORY
      SET LogoutTime = GETDATE(), IsOnline = 0, DurationMinutes = DATEDIFF(minute, LoginTime, GETDATE())
      WHERE Id = @id
    `);
    console.log('✅ UPDATE success for Id:', id);

    // Verify
    const r3 = await p.request().input('id', mssql.Int, id).query(
      'SELECT Id, LogoutTime, IsOnline, DurationMinutes FROM LOGIN_HISTORY WHERE Id = @id'
    );
    console.log('After UPDATE:', JSON.stringify(r3.recordset[0]));
  }

  p.close();
}).catch(e => console.error('Error:', e.message));
