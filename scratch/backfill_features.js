require('dotenv').config();
const { getPool } = require('../db-sql');
const { syncExerciseFeature } = require('../duplicate-service');

async function backfill() {
  try {
    const pool = await getPool();
    
    console.log('Fetching exercises that need backfill...');
    const r = await pool.request().query(`
      SELECT b.Id, b.MaBaiTap, b.TenBaiTap, b.MoTa, b.YeuCau
      FROM BAITAP b
      WHERE b.Id NOT IN (SELECT BaiTapId FROM EXERCISE_FEATURES)
        AND (b.IsDeleted = 0 OR b.IsDeleted IS NULL)
    `);
    
    const exercises = r.recordset;
    if (exercises.length === 0) {
      console.log('All exercises already have AI features! Nothing to do.');
      process.exit(0);
    }
    
    console.log(`Found ${exercises.length} exercises to backfill.\nStarting...`);
    
    let successCount = 0;
    let failCount = 0;
    
    // Process them sequentially to avoid Groq rate limit
    for (let i = 0; i < exercises.length; i++) {
      const ex = exercises[i];
      console.log(`[${i+1}/${exercises.length}] Processing: ${ex.MaBaiTap} - ${ex.TenBaiTap}`);
      try {
        await syncExerciseFeature(
            ex.Id, 
            ex.TenBaiTap || '', 
            ex.MoTa || '', 
            ex.YeuCau || ''
        );
        successCount++;
        // Throttling to respect Groq limits (~30 RPM usually, so 2s delay)
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (err) {
        console.error(`  -> Failed:`, err.message);
        failCount++;
      }
    }
    
    console.log(`\nBackfill completed! Success: ${successCount}, Failed: ${failCount}`);
    process.exit(0);
  } catch(e) {
    console.error('Fatal Error:', e);
    process.exit(1);
  }
}

backfill();
