const db = require('./db-sql');

async function test() {
  try {
    const exercise = {
      id: "CTDL_1.99",
      title: "Bài tập test 1 GV01",
      difficulty: "Trung bình",
      description: "test dữ liệu",
      requirements: ["req 1"],
      grading_criteria: [{name: "crit 1", points: 10}],
      level: 1,
      skill_sub: 0
    };
    const res = await db.createExercise("CTDL", 1, exercise, "GV01");
    console.log("Result:", res);
  } catch (err) {
    console.error("Error calling createExercise:", err.message);
  }
  process.exit(0);
}
test();
