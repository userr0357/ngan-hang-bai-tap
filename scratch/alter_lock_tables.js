const mssql = require('mssql');
require('dotenv').config();

const cfg = {
  user: process.env.DB_USER, password: process.env.DB_PASS,
  server: process.env.DB_HOST, database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT || 1433),
  options: { encrypt: false, trustServerCertificate: true }
};

mssql.connect(cfg).then(async pool => {
  try {
    // 1. GIANGVIEN — thêm BlockReason, BlockUntil
    await pool.request().query([
      "IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='GIANGVIEN' AND COLUMN_NAME='BlockReason')",
      "  ALTER TABLE GIANGVIEN ADD BlockReason NVARCHAR(500) NULL"
    ].join(' '));
    console.log('✅ GIANGVIEN.BlockReason');

    await pool.request().query([
      "IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='GIANGVIEN' AND COLUMN_NAME='BlockUntil')",
      "  ALTER TABLE GIANGVIEN ADD BlockUntil DATETIME NULL"
    ].join(' '));
    console.log('✅ GIANGVIEN.BlockUntil');

    // 2. LECTURER_BLOCK_LOG — thêm Reason, BlockUntil, Duration, UnlockedAt
    const logCols = [
      ["Reason",     "NVARCHAR(500)"],
      ["BlockUntil", "DATETIME"],
      ["Duration",   "NVARCHAR(50)"],
      ["UnlockedAt", "DATETIME"],
    ];
    for (const [col, type] of logCols) {
      await pool.request().query([
        `IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='LECTURER_BLOCK_LOG' AND COLUMN_NAME='${col}')`,
        `  ALTER TABLE LECTURER_BLOCK_LOG ADD ${col} ${type} NULL`
      ].join(' '));
      console.log(`✅ LECTURER_BLOCK_LOG.${col}`);
    }

    // 3. Verify
    const r = await pool.request().query(
      "SELECT TABLE_NAME, COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS " +
      "WHERE TABLE_NAME IN ('GIANGVIEN','LECTURER_BLOCK_LOG') " +
      "AND COLUMN_NAME IN ('BlockReason','BlockUntil','Reason','Duration','UnlockedAt','IsBlocked','BlockedAt') " +
      "ORDER BY TABLE_NAME, COLUMN_NAME"
    );
    console.log('\n=== Verified columns ===');
    r.recordset.forEach(x => console.log(`  ${x.TABLE_NAME}.${x.COLUMN_NAME}`));
    console.log('\n✅ Migration complete!');
  } catch (e) {
    console.error('❌ Error:', e.message);
  }
  await pool.close();
}).catch(e => console.error('❌ DB connect error:', e.message));
