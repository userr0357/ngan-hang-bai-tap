const db = require('../db-sql');

async function insertAllDummyData() {
  const pool = await db.getPool();
  
  // Lấy toàn bộ danh sách sinh viên
  const r = await pool.request().query('SELECT student_id, name FROM students');
  const students = r.recordset;
  
  if (students.length === 0) {
    console.log('Không có sinh viên nào trong CSDL.');
    process.exit();
  }

  // Lấy danh sách mã bài tập có sẵn
  const r2 = await pool.request().query('SELECT TOP 10 MaBaiTap FROM BAITAP');
  const baiTapList = r2.recordset.map(b => b.MaBaiTap);
  const defaultEx = baiTapList.length > 0 ? baiTapList : ['KTLT_D1_01', 'KTLT_D1_02', 'CTDL_01'];

  console.log(`Bắt đầu tạo dữ liệu cho ${students.length} sinh viên...`);

  // Xóa dữ liệu cũ (nếu muốn) để tránh trùng lặp
  await pool.request().query("DELETE FROM grading_history WHERE student_id NOT IN ('student1')");

  for (let i = 0; i < students.length; i++) {
    const s = students[i];
    const sid = s.student_id;
    const sName = s.name.replace(/'/g, "''"); // Tránh lỗi dấu nháy đơn trong SQL
    
    // Tạo số lượt nộp ngẫu nhiên từ 1 đến 15
    const submissionsCount = Math.floor(Math.random() * 15) + 1;
    let queries = '';
    
    for (let j = 0; j < submissionsCount; j++) {
      const score = (Math.random() * 5 + 5).toFixed(1); // Điểm từ 5.0 đến 10.0
      const status = score > 9 ? 'AC' : (score > 7 ? 'WA' : 'TLE');
      const exCode = defaultEx[Math.floor(Math.random() * defaultEx.length)];
      // Ngày nộp trong vòng 30 ngày qua
      const daysAgo = Math.floor(Math.random() * 30);
      
      queries += `
        INSERT INTO grading_history (job_id, student_id, student_name, assignment_code, filename, total_score, status, submitted_at, code, language, is_manual_grade)
        VALUES (
          'job_${sid}_${j}', '${sid}', N'${sName}', '${exCode}', 'main.py', ${score}, '${status}', DATEADD(day, -${daysAgo}, GETDATE()), 'print(${j})', 'python', 0
        );
      `;
    }

    // Thực thi chèn lịch sử nộp bài
    await pool.request().query(queries);
    
    // Cập nhật ngẫu nhiên mức độ hoàn thành cho sinh viên
    const completion = (Math.random() * 0.8 + 0.2).toFixed(2); // 20% đến 100%
    await pool.request().query(`UPDATE students SET assignment_completion = ${completion} WHERE student_id = ${sid}`);
    
    if (i % 50 === 0 && i > 0) {
      console.log(`Đã tạo xong cho ${i} sinh viên...`);
    }
  }

  console.log('Hoàn tất tạo dữ liệu mô phỏng cho toàn bộ sinh viên!');
  process.exit();
}

insertAllDummyData();
