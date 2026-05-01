const db = require('./db-sql');
const mssql = require('mssql');

async function runMigration() {
  try {
    console.log('Đang kết nối Database...');
    const pool = await db.getPool();
    console.log('Kết nối thành công. Đang lấy danh sách bài tập...');

    const result = await pool.request().query("SELECT MaBaiTap, TieuChiChamDiem FROM BAITAP WHERE TieuChiChamDiem IS NOT NULL AND TieuChiChamDiem != ''");
    const exercises = result.recordset;
    
    console.log(`Tìm thấy ${exercises.length} bài tập có tiêu chí chấm điểm. Bắt đầu rà soát...`);
    
    let updatedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const ex of exercises) {
      try {
        const raw = ex.TieuChiChamDiem;
        const parsed = JSON.parse(raw);
        
        // Chuẩn hóa sang mảng các object
        let criteria = [];
        const toItem = c => {
          if (typeof c === 'string') return { name: c, points: 0 };
          return { 
            name: c.name || c.tieu_chi || c.criterion || c.ten || '', 
            points: c.points || c.diem || c.trong_so || 0,
            note: c.note || ''
          };
        };

        if (parsed.tieu_chi && Array.isArray(parsed.tieu_chi)) criteria = parsed.tieu_chi.map(toItem);
        else if (parsed.criteria && Array.isArray(parsed.criteria)) criteria = parsed.criteria.map(toItem);
        else if (parsed.grading_criteria && Array.isArray(parsed.grading_criteria)) criteria = parsed.grading_criteria.map(toItem);
        else if (Array.isArray(parsed)) criteria = parsed.map(toItem);
        
        // Loại bỏ các tiêu chí rỗng
        criteria = criteria.filter(c => c.name.trim() !== '');

        const totalPts = criteria.reduce((sum, c) => sum + (c.points || 0), 0);

        // Chỉ xử lý những bài có tiêu chí nhưng TỔNG ĐIỂM = 0
        if (criteria.length > 0 && totalPts === 0) {
          const N = criteria.length;
          const baseWeight = Math.floor(100 / N);
          let remainder = 100 - (baseWeight * N);

          // Cưa đều trọng số
          criteria = criteria.map((c, index) => {
            let weight = baseWeight;
            if (remainder > 0) {
              weight += 1;
              remainder -= 1;
            }
            return { name: c.name, points: weight };
          });

          // Cập nhật lại vào CSDL
          const newJson = JSON.stringify(criteria);
          await pool.request()
            .input('json', mssql.NVarChar, newJson)
            .input('id', mssql.VarChar, ex.MaBaiTap)
            .query("UPDATE BAITAP SET TieuChiChamDiem = @json WHERE MaBaiTap = @id");
            
          updatedCount++;
        } else {
          skippedCount++; // Bài đã có điểm hợp lệ hoặc không có tiêu chí hợp lệ
        }
      } catch (err) {
        errorCount++;
        console.error(`Lỗi phân tích JSON ở bài tập ${ex.MaBaiTap}:`, err.message);
      }
    }

    console.log('-----------------------------------');
    console.log('CẬP NHẬT HOÀN TẤT!');
    console.log(`✅ Đã cưa đều % thành công cho: ${updatedCount} bài tập.`);
    console.log(`⏭ Bỏ qua (Đã có điểm từ trước hoặc rỗng): ${skippedCount} bài tập.`);
    console.log(`❌ Lỗi định dạng JSON không thể đọc: ${errorCount} bài tập.`);
    console.log('-----------------------------------');
    
    process.exit(0);
  } catch (err) {
    console.error('Lỗi nghiêm trọng:', err);
    process.exit(1);
  }
}

runMigration();
