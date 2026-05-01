const db = require('../db-sql');
(async () => {
  try {
    const pool = await db.getPool();
    await pool.request().query(`
      UPDATE grading_history
      SET student_name = students.name
      FROM grading_history
      INNER JOIN students ON grading_history.student_id = CAST(students.student_id AS VARCHAR)
      WHERE grading_history.student_id != 'student1'
    `);
    console.log('Fixed Mojibake in grading_history!');
  } catch (e) {
    console.error(e);
  }
  process.exit();
})();
