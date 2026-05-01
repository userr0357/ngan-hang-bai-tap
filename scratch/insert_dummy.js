const db = require('../db-sql');

async function insertDummyData() {
  const pool = await db.getPool();
  
  // Get some real student IDs
  const r = await pool.request().query('SELECT TOP 5 student_id FROM students ORDER BY student_id');
  const students = r.recordset.map(s => s.student_id);
  
  if (students.length > 0) {
    const s1 = students[0];
    const s2 = students[1];
    const s3 = students[2];
    
    // Insert some grading_history for them
    await pool.request().query(`
      INSERT INTO grading_history (job_id, student_id, student_name, assignment_code, filename, total_score, status, submitted_at, code, language, is_manual_grade)
      VALUES 
      ('j1', '${s1}', 'Dummy', 'KTLT_D1_01', 'main.py', 8.5, 'AC', GETDATE(), 'print(1)', 'python', 0),
      ('j2', '${s1}', 'Dummy', 'KTLT_D1_02', 'main.py', 9.0, 'AC', DATEADD(day, -1, GETDATE()), 'print(2)', 'python', 0),
      ('j3', '${s2}', 'Dummy', 'KTLT_D1_01', 'main.py', 7.0, 'WA', GETDATE(), 'print(3)', 'python', 0),
      ('j4', '${s3}', 'Dummy', 'KTLT_D1_03', 'main.py', 10.0, 'AC', GETDATE(), 'print(4)', 'python', 0)
    `);
    
    // Update assignment_completion in students table for these 3
    await pool.request().query(`UPDATE students SET assignment_completion = 0.5 WHERE student_id = ${s1}`);
    await pool.request().query(`UPDATE students SET assignment_completion = 0.3 WHERE student_id = ${s2}`);
    await pool.request().query(`UPDATE students SET assignment_completion = 0.8 WHERE student_id = ${s3}`);

    console.log('Inserted dummy data for students:', s1, s2, s3);
  } else {
    console.log('No students found');
  }
  process.exit();
}

insertDummyData();
