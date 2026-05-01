const db = require('../db-sql');

async function updateEmails() {
  const pool = await db.getPool();
  try {
    await pool.request().query("UPDATE GIANGVIEN SET Email='nguyentrantrungkien10ta7@gmail.com' WHERE MaGiangVien='GV01'");
    await pool.request().query("UPDATE GIANGVIEN SET Email='nguyentrantrungkien2003@gmail.com' WHERE MaGiangVien='GV02'");
    await pool.request().query("UPDATE GIANGVIEN SET Email='nguyentrantrungkien1901@gmail.com' WHERE MaGiangVien='GV03'");
    console.log('Emails updated successfully.');
  } catch(e) {
    console.error(e);
  }
  process.exit();
}

updateEmails();
