const db = require('../db-sql');
(async () => {
  const pool = await db.getPool();
  try {
    const r = await pool.request().query(`
      SELECT 
        g.MaGiangVien, g.TenGiangVien, g.Quyen, g.TenDangNhap, g.Email, g.IsBlocked,
        (SELECT COUNT(*) FROM BAITAP WHERE MaGiangVien=g.MaGiangVien AND (IsDeleted=0 OR IsDeleted IS NULL)) AS ExerciseCount,
        (SELECT TOP 1 LoginTime FROM LOGIN_HISTORY WHERE UserId=g.MaGiangVien ORDER BY LoginTime DESC) AS LastLogin,
        (SELECT STRING_AGG(m.TenMon, ', ') FROM GIANGVIEN_MONHOC gm JOIN MONHOC m ON gm.MaMon = m.MaMon WHERE gm.MaGiangVien=g.MaGiangVien) AS SubjectList
      FROM GIANGVIEN g 
      ORDER BY g.MaGiangVien
    `);
    console.log("SUCCESS");
  } catch(e) {
    console.log("ERROR:", e.message);
  }
  process.exit();
})();
