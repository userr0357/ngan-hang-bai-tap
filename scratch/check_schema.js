const {getPool} = require('../db-sql');
async function run() {
  const p = await getPool();
  let r = await p.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME='grading_history'");
  console.log(r.recordset);
  process.exit(0);
}
run();
run();
run();
run();
run();
run();
run();
run();
