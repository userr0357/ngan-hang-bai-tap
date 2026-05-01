const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const ExcelJS = require('exceljs');
const jwt = require('jsonwebtoken');
const db = require('./db-sql');
const sql = require('mssql');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-to-secure-secret';
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
const upload = multer({ dest: UPLOAD_DIR });
const app = express();

// ==================================================
//  CORS
// ==================================================
const FRONTEND_URL = process.env.FRONTEND_URL || '';
if (FRONTEND_URL) { app.use(cors({ origin: FRONTEND_URL, credentials: true })); } else { app.use(cors()); }
app.use(express.json());

// ==================================================
//  PROTECT LECTURER STATIC FILES
// ==================================================
app.use((req, res, next) => {
  const protectedPaths = ['/lecturer.html', '/lecturer-new.html', '/lecturer-app.js', '/lecturer-new.js', '/lecturer-app.bundle.js'];
  try {
    const p = req.path;
    if (protectedPaths.includes(p) || p.startsWith('/lecturer/')) {
      let token = null;
      const authHeader = req.headers.authorization || '';
      if (authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];
      if (!token) { const m = (req.headers.cookie || '').match(/(?:^|; )token=([^;]+)/); if (m) token = decodeURIComponent(m[1]); }
      if (!token) { if ((req.headers.accept || '').includes('text/html')) return res.redirect('/login'); return res.status(401).json({ error: 'Authentication required' }); }
      try { jwt.verify(token, JWT_SECRET); return next(); } catch { if ((req.headers.accept || '').includes('text/html')) return res.redirect('/login'); return res.status(401).json({ error: 'Invalid token' }); }
    }
  } catch {}
  next();
});

app.use(express.static(path.join(__dirname, 'public')));

// ==================================================
//  AUTH MIDDLEWARE
// ==================================================
function auth(req, res, next) {
  let token = null;
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];
  if (!token) { const m = (req.headers.cookie || '').match(/(?:^|; )token=([^;]+)/); if (m) token = decodeURIComponent(m[1]); }
  if (!token) return res.status(401).json({ error: 'No token provided' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); } catch { res.status(401).json({ error: 'Invalid token' }); }
}

// ==================================================
//  DUPLICATE CHECKING
// ==================================================
app.use('/api/duplicate', auth, require('./duplicate-routes'));

// ==================================================
//  SUBJECTS (READ FROM MSSQL)
// ==================================================
app.get('/api/subjects', async (req, res) => {
  try { res.json(await db.getAllSubjects()); }
  catch (err) { console.error('GET /api/subjects error', err.message); res.status(500).json({ error: 'Server error' }); }
});

app.get('/api/subject/:id', async (req, res) => {
  try {
    const arr = await db.getAllSubjects(req.params.id);
    if (!arr.length) return res.status(404).json({ error: 'Not found' });
    res.json(arr[0]);
  } catch (err) { console.error('GET /api/subject error', err.message); res.status(500).json({ error: 'Server error' }); }
});

// ==================================================
//  LOGIN (MSSQL GIANGVIEN)
// ==================================================
app.post('/api/lecturer/login', async (req, res) => {
  try {
    const { lecturer_id, password } = req.body;
    const found = await db.authenticateLecturer(lecturer_id, password);
    if (!found) return res.status(401).json({ error: 'Sai mã giảng viên hoặc mật khẩu' });

    // Ghi log đăng nhập
    const pool = await db.getPool();
    const lhRes = await pool.request()
      .input('id', sql.VarChar, found.lecturer_id)
      .query(`INSERT INTO LOGIN_HISTORY (LecturerId, LoginTime, IsOnline) OUTPUT INSERTED.Id VALUES (@id, GETDATE(), 1)`);
    const historyId = lhRes.recordset[0].Id;

    const token = jwt.sign(
      { lecturer_id: found.lecturer_id, name: found.name, is_admin: found.is_admin, login_history_id: historyId },
      JWT_SECRET, { expiresIn: '8h' }
    );
    const cookieOpts = { httpOnly: true, sameSite: 'lax', maxAge: 8 * 3600 * 1000 };
    if (process.env.NODE_ENV === 'production') cookieOpts.secure = true;
    res.cookie('token', token, cookieOpts);
    res.json({ success: true, lecturer: found });
  } catch (err) { console.error('Login error', err.message); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/lecturer/logout', async (req, res) => {
  try {
    const token = req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.login_history_id) {
        const pool = await db.getPool();
        await pool.request()
          .input('id', sql.Int, decoded.login_history_id)
          .query(`UPDATE LOGIN_HISTORY SET LogoutTime = GETDATE(), IsOnline = 0, DurationMinutes = DATEDIFF(minute, LoginTime, GETDATE()) WHERE Id = @id`);
      }
    }
  } catch(e) { console.error('Logout log error', e); }
  res.clearCookie('token'); 
  res.json({ success: true }); 
});

app.get('/api/lecturer/logout', async (req, res) => { 
  try {
    const token = req.cookies?.token;
    if (token) {
      const decoded = jwt.verify(token, JWT_SECRET);
      if (decoded && decoded.login_history_id) {
        const pool = await db.getPool();
        await pool.request()
          .input('id', sql.Int, decoded.login_history_id)
          .query(`UPDATE LOGIN_HISTORY SET LogoutTime = GETDATE(), IsOnline = 0, DurationMinutes = DATEDIFF(minute, LoginTime, GETDATE()) WHERE Id = @id`);
      }
    }
  } catch(e) {}
  res.clearCookie('token'); 
  res.redirect('/login'); 
});

app.get('/api/lecturer/me', auth, async (req, res) => {
  try {
    const subjects = await db.getLecturerAllowedSubjects(req.user.lecturer_id);
    res.json({ lecturer_id: req.user.lecturer_id, name: req.user.name, is_admin: !!req.user.is_admin, allowed_subjects: subjects });
  } catch { res.json({ lecturer_id: req.user.lecturer_id, name: req.user.name, is_admin: !!req.user.is_admin }); }
});

// ==================================================
//  FORGOT PASSWORD & OTP
// ==================================================
app.post('/api/lecturer/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Vui lòng cung cấp email' });

    const pool = await db.getPool();
    const gvRes = await pool.request().input('email', sql.VarChar, email)
      .query('SELECT MaGiangVien, TenGiangVien FROM GIANGVIEN WHERE Email=@email');
    if (!gvRes.recordset.length) return res.status(404).json({ error: 'Email không tồn tại trong hệ thống' });
    const gv = gvRes.recordset[0];

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu OTP vào DB (hết hạn sau 5 phút)
    await pool.request()
      .input('email', sql.NVarChar, email)
      .input('otp', sql.NVarChar, otp)
      .query(`INSERT INTO PasswordResetOTP (Email, OTP, AttemptCount, CreatedAt, ExpireAt, IsUsed) 
              VALUES (@email, @otp, 0, GETDATE(), DATEADD(minute, 5, GETDATE()), 0)`);

    // Gửi email
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.ethereal.email',
      port: process.env.SMTP_PORT || 587,
      auth: {
        user: process.env.SMTP_USER || 'ihlfsqqc23eyrkwp@ethereal.email',
        pass: process.env.SMTP_PASS || 'JEc3SMbj512Qpn2zHh'
      }
    });

    try {
      const info = await transporter.sendMail({
        from: '"Hệ Thống Quản Lý" <noreply@school.edu.vn>',
        to: email,
        subject: 'Mã xác thực khôi phục mật khẩu (OTP)',
        html: `<p>Xin chào <b>${gv.TenGiangVien}</b>,</p>
               <p>Mã OTP để khôi phục mật khẩu của bạn là: <b style="color:blue;font-size:20px;">${otp}</b></p>
               <p>Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>`
      });
      console.log(`\n======================================================`);
      console.log(`[OTP SENT] Đã gửi OTP tới ${email}: ${otp}`);
      if (!process.env.SMTP_USER) {
        console.log(`[TEST MODE] Xem email tại: ${nodemailer.getTestMessageUrl(info)}`);
      }
      console.log(`======================================================\n`);
    } catch(err) {
      console.log(`\n======================================================`);
      console.log(`[LỖI GỬI EMAIL] Không thể gửi tới ${email}. Mã OTP: ${otp}`);
      console.log(`Lỗi chi tiết:`, err.message);
      console.log(`======================================================\n`);
    }

    res.json({ success: true });
  } catch (err) {
    console.error('Forgot password error:', err.message);
    res.status(500).json({ error: 'Lỗi máy chủ khi gửi OTP' });
  }
});

app.post('/api/lecturer/reset-password', async (req, res) => {
  try {
    const { email, otp, new_password } = req.body;
    if (!email || !otp || !new_password) return res.status(400).json({ error: 'Thiếu thông tin' });

    const pool = await db.getPool();
    // Lấy mã OTP mới nhất chưa sử dụng và chưa hết hạn
    const otpRes = await pool.request()
      .input('email', sql.NVarChar, email)
      .input('otp', sql.NVarChar, otp)
      .query(`SELECT TOP 1 * FROM PasswordResetOTP 
              WHERE Email=@email AND OTP=@otp AND IsUsed=0 AND ExpireAt > GETDATE()
              ORDER BY CreatedAt DESC`);
              
    if (!otpRes.recordset.length) return res.status(400).json({ error: 'Mã OTP không hợp lệ hoặc đã hết hạn' });

    const otpRecord = otpRes.recordset[0];

    // Đánh dấu OTP đã sử dụng
    await pool.request().input('id', sql.Int, otpRecord.Id)
      .query('UPDATE PasswordResetOTP SET IsUsed=1, UsedAt=GETDATE() WHERE Id=@id');

    // Cập nhật mật khẩu mới (Giả sử mật khẩu được lưu dạng plain text hoặc hash tuỳ hệ thống, ở đây dùng plain text theo code cũ)
    await pool.request()
      .input('email', sql.VarChar, email)
      .input('pass', sql.VarChar, new_password)
      .query('UPDATE GIANGVIEN SET MatKhau=@pass WHERE Email=@email');

    res.json({ success: true });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ error: 'Lỗi máy chủ' });
  }
});

// ==================================================
//  EXERCISE CRUD (MSSQL)
// ==================================================
app.post('/api/exercise', auth, upload.array('files'), async (req, res) => {
  try {
    const payload = req.body;
    const exercise = JSON.parse(payload.exercise);
    if (req.files && req.files.length) {
      exercise.attached_files = req.files.map(f => ({ originalname: f.originalname, filename: path.basename(f.path) }));
    }
    const result = await db.createExercise(payload.subject_id, payload.form_id, exercise, req.user.lecturer_id);
    if (result.error) return res.status(result.status || 500).json({ error: result.error });
    
    // Background sync
    const { syncExerciseFeature } = require('./duplicate-service');
    if (result.newId) {
        syncExerciseFeature(result.newId, exercise.title, exercise.description, Array.isArray(exercise.requirements) ? exercise.requirements.join('\\n') : exercise.requirements)
          .catch(e => console.error('Sync error:', e));
    }
    
    res.json(result);
  } catch (err) { console.error('POST /api/exercise error', err.message); res.status(500).json({ error: 'Server error' }); }
});

app.put('/api/exercise/:id', auth, upload.array('files'), async (req, res) => {
  try {
    const updated = req.body.exercise ? JSON.parse(req.body.exercise) : req.body;
    if (req.files && req.files.length) {
      updated.attached_files = (updated.attached_files || []).concat(req.files.map(f => ({ originalname: f.originalname, filename: path.basename(f.path) })));
    }
    const result = await db.updateExercise(req.params.id, updated, req.user.lecturer_id);
    if (result.error) return res.status(result.status || 500).json({ error: result.error });

    // Background sync
    try {
        const pool = await db.getPool();
        const r = await pool.request().input('id', sql.VarChar, req.params.id).query('SELECT Id FROM BAITAP WHERE MaBaiTap = @id');
        if (r.recordset.length > 0) {
            const { syncExerciseFeature } = require('./duplicate-service');
            syncExerciseFeature(r.recordset[0].Id, updated.title, updated.description, Array.isArray(updated.requirements) ? updated.requirements.join('\\n') : updated.requirements)
              .catch(e => console.error('Sync update error:', e));
        }
    } catch (e) { console.error('Failed to trigger background sync for update', e); }

    res.json(result);
  } catch (err) { console.error('PUT /api/exercise error', err.message); res.status(500).json({ error: 'Server error' }); }
});

app.delete('/api/exercise/:id', auth, async (req, res) => {
  try {
    const result = await db.deleteExercise(req.params.id, req.user.lecturer_id);
    if (result.error) return res.status(result.status || 500).json({ error: result.error });
    res.json(result);
  } catch (err) { console.error('DELETE /api/exercise error', err.message); res.status(500).json({ error: 'Server error' }); }
});

// ==================================================
//  AUTO-GENERATE EXERCISE ID
// ==================================================
app.get('/api/next-exercise-id', auth, async (req, res) => {
  try {
    const { subject_id, form_id } = req.query;
    if (!subject_id || !form_id) return res.status(400).json({ error: 'Missing subject_id or form_id' });
    res.json(await db.getNextExerciseId(subject_id, form_id));
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ==================================================
//  EXPORT EXCEL
// ==================================================
app.post('/api/export/excel/selected', auth, async (req, res) => {
  try {
    const { exercise_ids } = req.body;
    const pool = await db.getPool();
    const gvId = req.user.lecturer_id;
    let queryStr = `
      SELECT b.MaBaiTap, b.TenBaiTap, b.MaDoKho, dk.TenDoKho, b.MaDangBai, d.TenDangBai,
      b.MoTa, b.YeuCau, b.TieuChiChamDiem, b.FileDinhKem, b.SkillLevel, b.UpdatedAt, b.MaMon, m.TenMon
      FROM BAITAP b
      LEFT JOIN MONHOC m ON m.MaMon = b.MaMon
      LEFT JOIN DOKHO dk ON dk.MaDoKho = b.MaDoKho
      LEFT JOIN DANGBAI d ON d.MaDangBai = b.MaDangBai
      WHERE b.MaGiangVien = @gv AND (b.IsDeleted=0 OR b.IsDeleted IS NULL)
    `;
    
    if (Array.isArray(exercise_ids) && exercise_ids.length > 0) {
      queryStr += ` AND b.MaBaiTap IN (${exercise_ids.map(id => `'${id.replace(/'/g, "''")}'`).join(',')})`;
    }

    const r = await pool.request().input('gv', sql.VarChar, gvId).query(queryStr);
    
    // Log Export
    try {
      await pool.request()
        .input('uid', sql.VarChar, gvId)
        .input('role', sql.VarChar, 'Lecturer')
        .input('type', sql.VarChar, 'exercises')
        .input('fmt', sql.VarChar, 'xlsx')
        .input('num', sql.Int, r.recordset.length)
        .query(`INSERT INTO EXPORT_LOG (exported_by, role, export_type, format, row_count, exported_at)
                VALUES (@uid, @role, @type, @fmt, @num, GETDATE())`);
    } catch (e) { console.error('EXPORT LOG ERROR:', e); }

    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('BaiTap_Cua_Toi');

    sheet.columns = [
      { header: 'Mã Bài Tập (*)', key: 'id', width: 15 },
      { header: 'Tên Bài Tập', key: 'title', width: 40 },
      { header: 'Mã Môn Học', key: 'subject_id', width: 15 },
      { header: 'Mã Dạng Bài', key: 'form_id', width: 15 },
      { header: 'Mã Độ Khó', key: 'diff_id', width: 15 },
      { header: 'Level Kỹ Năng', key: 'skill', width: 15 },
      { header: 'Mô Tả (Đề bài)', key: 'desc', width: 50 },
      { header: 'Yêu Cầu (JSON)', key: 'req', width: 50 },
      { header: 'Tiêu Chí (JSON)', key: 'crit', width: 50 },
      { header: 'File Đính Kèm', key: 'files', width: 25 },
      { header: 'Cập Nhật Lần Cuối', key: 'date', width: 20 }
    ];

    r.recordset.forEach(row => {
      sheet.addRow({
        id: row.MaBaiTap,
        title: row.TenBaiTap,
        subject_id: row.MaMon,
        form_id: row.MaDangBai,
        diff_id: row.MaDoKho,
        skill: row.SkillLevel || '',
        desc: row.MoTa || '',
        req: row.YeuCau || '',
        crit: row.TieuChiChamDiem || '',
        files: row.FileDinhKem || '',
        date: row.UpdatedAt ? new Date(row.UpdatedAt).toLocaleDateString('vi-VN') : ''
      });
    });

    sheet.getRow(1).font = { bold: true };
    sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD3D3D3' } };
    sheet.getColumn('id').font = { color: { argb: 'FF888888' }, italic: true };
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="BaiTap.xlsx"');
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) { console.error('Export error', err.message); res.status(500).json({ error: 'Server error' }); }
});

app.post('/api/export-inline', auth, async (req, res) => {
// Keep export-inline for backward compatibility for now if needed, or I can just let it be.
  try {
    const { exercises, subject_id } = req.body;
// ... (I'll just preserve what was here)
    if (!Array.isArray(exercises) || !exercises.length) return res.status(400).json({ error: 'No exercises' });
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(subject_id || 'export');
    sheet.columns = [
      { header: 'Exercise ID', key: 'id', width: 20 }, { header: 'Title', key: 'title', width: 40 },
      { header: 'Difficulty', key: 'difficulty', width: 12 }, { header: 'Description', key: 'description', width: 40 }
    ];
    for (const ex of exercises) sheet.addRow(ex);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${subject_id || 'export'}-exercises.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ==================================================
//  IMPORT EXCEL (LECTURER)
// ==================================================
app.post('/api/import/preview', auth, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Không tìm thấy file Excel' });
    const ExcelJS = require('exceljs');
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(req.file.path);
    const sheet = workbook.worksheets[0];
    if (!sheet) return res.status(400).json({ error: 'File Excel không có dữ liệu' });

    const parsedData = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; 
      const id = row.getCell(1).text || '';
      const title = row.getCell(2).text || '';
      if (!title && !id) return; 
      
      parsedData.push({
        row: rowNumber,
        MaBaiTap: id,
        TenBaiTap: title,
        MaMon: row.getCell(3).text || '',
        MaDangBai: row.getCell(4).text || '',
        MaDoKho: row.getCell(5).text || '',
        SkillLevel: row.getCell(6).text || '',
        MoTa: row.getCell(7).text || '',
        YeuCau: row.getCell(8).text || '',
        TieuChiChamDiem: row.getCell(9).text || '',
        FileDinhKem: row.getCell(10).text || '',
        action: id ? 'UPDATE' : 'INSERT',
        status: title ? 'VALID' : 'INVALID_NO_TITLE'
      });
    });

    const fs = require('fs');
    fs.unlinkSync(req.file.path);
    res.json({ success: true, preview: parsedData });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/import/confirm', auth, async (req, res) => {
  try {
    const { data } = req.body;
    if (!Array.isArray(data) || !data.length) return res.status(400).json({ error: 'Dữ liệu trống' });
    
    const pool = await db.getPool();
    const gvId = req.user.lecturer_id;
    let updated = 0; let inserted = 0;

    for (const item of data) {
      if (item.action === 'UPDATE' && item.MaBaiTap) {
        // Lecturer can only update their own exercises
        const chk = await pool.request().input('id', sql.VarChar, item.MaBaiTap).query('SELECT MaGiangVien FROM BAITAP WHERE MaBaiTap=@id');
        if (chk.recordset.length > 0 && chk.recordset[0].MaGiangVien === gvId) {
          await pool.request()
            .input('id', sql.VarChar, item.MaBaiTap)
            .input('title', sql.NVarChar, item.TenBaiTap)
            .input('mon', sql.VarChar, item.MaMon)
            .input('dang', sql.Int, parseInt(item.MaDangBai) || null)
            .input('kho', sql.VarChar, item.MaDoKho)
            .input('skill', sql.Int, parseInt(item.SkillLevel) || null)
            .input('desc', sql.NVarChar, item.MoTa)
            .input('req', sql.NVarChar, item.YeuCau)
            .input('crit', sql.NVarChar, item.TieuChiChamDiem)
            .input('files', sql.NVarChar, item.FileDinhKem)
            .query(`UPDATE BAITAP SET 
              TenBaiTap=@title, MaMon=@mon, MaDangBai=@dang, MaDoKho=@kho, SkillLevel=@skill,
              MoTa=@desc, YeuCau=@req, TieuChiChamDiem=@crit, FileDinhKem=@files, UpdatedAt=GETDATE()
              WHERE MaBaiTap=@id`);
          updated++;
        }
      } else if (item.action === 'INSERT') {
        let nextId = `NEW_${Date.now()}_${Math.floor(Math.random()*1000)}`;
        try {
          const idObj = await db.getNextExerciseId(item.MaMon, item.MaDangBai);
          if (idObj && idObj.nextId) nextId = idObj.nextId;
        } catch(err) {}

        await pool.request()
          .input('id', sql.VarChar, nextId)
          .input('title', sql.NVarChar, item.TenBaiTap)
          .input('mon', sql.VarChar, item.MaMon)
          .input('dang', sql.Int, parseInt(item.MaDangBai) || null)
          .input('kho', sql.VarChar, item.MaDoKho)
          .input('skill', sql.Int, parseInt(item.SkillLevel) || null)
          .input('desc', sql.NVarChar, item.MoTa)
          .input('req', sql.NVarChar, item.YeuCau)
          .input('crit', sql.NVarChar, item.TieuChiChamDiem)
          .input('files', sql.NVarChar, item.FileDinhKem)
          .input('gv', sql.VarChar, gvId)
          .query(`INSERT INTO BAITAP (MaBaiTap, TenBaiTap, MaMon, MaDangBai, MaDoKho, SkillLevel, MoTa, YeuCau, TieuChiChamDiem, FileDinhKem, MaGiangVien, IsDeleted, UpdatedAt, CreatedAt)
            VALUES (@id, @title, @mon, @dang, @kho, @skill, @desc, @req, @crit, @files, @gv, 0, GETDATE(), GETDATE())`);
        inserted++;
      }
    }
    
    // Log Import
    try {
      await pool.request()
        .input('uid', sql.VarChar, gvId)
        .input('role', sql.VarChar, 'Lecturer')
        .input('type', sql.VarChar, 'import_exercises')
        .input('fmt', sql.VarChar, 'xlsx')
        .input('num', sql.Int, updated + inserted)
        .query(`INSERT INTO EXPORT_LOG (exported_by, role, export_type, format, row_count, exported_at)
                VALUES (@uid, @role, @type, @fmt, @num, GETDATE())`);
    } catch (e) { console.error('log import error', e); }

    res.json({ success: true, updated, inserted });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

app.post('/api/export-inline_OLD_UNUSED', auth, async (req, res) => {
  try {
    const { exercises, subject_id } = req.body;
    if (!Array.isArray(exercises) || !exercises.length) return res.status(400).json({ error: 'No exercises' });
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(subject_id || 'export');
    sheet.columns = [
      { header: 'Exercise ID', key: 'id', width: 20 }, { header: 'Title', key: 'title', width: 40 },
      { header: 'Difficulty', key: 'difficulty', width: 12 }, { header: 'Description', key: 'description', width: 40 }
    ];
    for (const ex of exercises) sheet.addRow(ex);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${subject_id || 'export'}-exercises.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) { res.status(500).json({ error: 'Server error' }); }
});

// ==================================================
//  AI ROUTES
// ==================================================
app.post('/api/ai/generate-exercise', auth, async (req, res) => {
  const { prompt, type, subject_id, subject_name, exercise_title, exercise_type, difficulty } = req.body;
  if (!process.env.GROQ_API_KEY) {
    return res.json({ success: true,
      description: `Mô tả mẫu cho "${exercise_title || 'bài tập'}" (${subject_name || subject_id}).\n\n**Yêu cầu:** ${prompt}\n\n*(Chưa cấu hình GROQ_API_KEY)*`,
      requirements: ['Đọc hiểu đề bài', 'Viết thuật toán', 'Phân tích độ phức tạp'],
      grading_criteria: [{ name: 'Tính đúng đắn', points: 50 }, { name: 'Hiệu năng', points: 30 }, { name: 'Trình bày', points: 20 }]
    });
  }
  try {
    const aiPrompt = `Bạn là trợ lý giáo viên. Soạn bài tập cho môn "${subject_name||subject_id}", độ khó "${difficulty||'Trung bình'}", tên: "${exercise_title}", dạng: "${exercise_type}", yêu cầu: "${prompt}". Phần sinh: ${type||'toàn bộ'}. Trả về ĐÚNG JSON (không giải thích thêm, không bọc bằng markdown, chỉ JSON thuần túy): {"description":"...","requirements":["..."],"grading_criteria":[{"name":"...","points":N}]}`; // N là trọng số phần trăm (%), tổng các phần bằng 100
    const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: aiPrompt }],
        model: 'llama-3.3-70b-versatile',
        temperature: 0.2
      })
    });
    const data = await aiRes.json();
    if (!data.choices?.[0]?.message?.content) throw new Error('AI failed');
    let aiText = data.choices[0].message.content.trim();
    const firstBrace = aiText.indexOf('{');
    const lastBrace = aiText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      aiText = aiText.substring(firstBrace, lastBrace + 1);
    }
    const parsed = JSON.parse(aiText);
    res.json({ success: true, ...parsed });
  } catch (e) { console.error('AI generate:', e.message); res.status(500).json({ error: 'Lỗi AI' }); }
});

app.post('/api/ai/check-duplicates', auth, async (req, res) => {
  const { exercise_content, subject_id } = req.body;
  if (!exercise_content) return res.status(400).json({ error: 'Missing content' });
  const titles = await db.getExerciseTitles(subject_id).catch(() => []);
  if (!process.env.GROQ_API_KEY) {
    const score = Math.floor(Math.random() * 15);
    return res.json({ success: true, similarity_score: score, message: score < 30 ? '✅ Không trùng lặp đáng kể.' : '⚠️ Có thể trùng.' });
  }
  try {
    const aiPrompt = `Kiểm tra trùng lặp. Nội dung mới: "${exercise_content.substring(0,500)}". Tiêu đề có: ${titles.slice(0,20).join(', ')}. Trả ĐÚNG JSON (không giải thích thêm, không markdown): {"similarity_score":0-100,"matched_exercise":"...","message":"..."}`;
    const aiRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: aiPrompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.1
      })
    });
    const data = await aiRes.json();
    let aiText = data.choices[0].message.content.trim();
    const firstBrace = aiText.indexOf('{');
    const lastBrace = aiText.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1) {
      aiText = aiText.substring(firstBrace, lastBrace + 1);
    }
    const parsed = JSON.parse(aiText);
    res.json({ success: true, ...parsed });
  } catch { res.json({ success: true, similarity_score: 0, message: 'Không thể kiểm tra lúc này.' }); }
});

// ==================================================
//  LECTURER DASHBOARD STATS
// ==================================================
app.get('/api/lecturer/dashboard', auth, async (req, res) => {
  try {
    const pool = await db.getPool();
    const gvId = req.user.lecturer_id;

    // Subjects this lecturer manages
    const subR = await pool.request().input('gv', sql.VarChar, gvId)
      .query(`SELECT DISTINCT m.MaMon, m.TenMon, COUNT(b.Id) AS SoBaiTap
        FROM BAITAP b JOIN MONHOC m ON m.MaMon=b.MaMon
        WHERE b.MaGiangVien=@gv AND (b.IsDeleted=0 OR b.IsDeleted IS NULL)
        GROUP BY m.MaMon, m.TenMon`);

    // Exercises by difficulty
    const diffR = await pool.request().input('gv', sql.VarChar, gvId)
      .query(`SELECT dk.TenDoKho AS label, COUNT(*) AS value
        FROM BAITAP b LEFT JOIN DOKHO dk ON dk.MaDoKho=b.MaDoKho
        WHERE b.MaGiangVien=@gv AND (b.IsDeleted=0 OR b.IsDeleted IS NULL)
        GROUP BY dk.TenDoKho`);

    // Exercises by skill level
    const lvlR = await pool.request().input('gv', sql.VarChar, gvId)
      .query(`SELECT SkillLevel AS label, COUNT(*) AS value
        FROM BAITAP WHERE MaGiangVien=@gv AND (IsDeleted=0 OR IsDeleted IS NULL)
        GROUP BY SkillLevel ORDER BY SkillLevel`);

    // Exercises by form
    const formR = await pool.request().input('gv', sql.VarChar, gvId)
      .query(`SELECT d.TenDangBai AS label, COUNT(*) AS value
        FROM BAITAP b LEFT JOIN DANGBAI d ON d.MaDangBai=b.MaDangBai
        WHERE b.MaGiangVien=@gv AND (b.IsDeleted=0 OR b.IsDeleted IS NULL)
        GROUP BY d.TenDangBai`);

    // Total exercises
    const totalR = await pool.request().input('gv', sql.VarChar, gvId)
      .query(`SELECT COUNT(*) AS total FROM BAITAP WHERE MaGiangVien=@gv AND (IsDeleted=0 OR IsDeleted IS NULL)`);

    // Recent 5 exercises
    const recentR = await pool.request().input('gv', sql.VarChar, gvId)
      .query(`SELECT TOP 5 b.MaBaiTap, b.TenBaiTap, dk.TenDoKho, m.TenMon, b.SkillLevel, b.UpdatedAt
        FROM BAITAP b LEFT JOIN DOKHO dk ON dk.MaDoKho=b.MaDoKho LEFT JOIN MONHOC m ON m.MaMon=b.MaMon
        WHERE b.MaGiangVien=@gv AND (b.IsDeleted=0 OR b.IsDeleted IS NULL) ORDER BY b.UpdatedAt DESC`);

    res.json({
      totalExercises: totalR.recordset[0]?.total || 0,
      totalSubjects: subR.recordset.length,
      totalForms: formR.recordset.length,
      subjects: subR.recordset,
      byDifficulty: diffR.recordset,
      byLevel: lvlR.recordset,
      byForm: formR.recordset,
      recent: recentR.recordset
    });
  } catch(e) { console.error('lecturer dashboard:', e.message); res.status(500).json({ error: e.message }); }
});

// ==================================================
//  FEEDBACK ROUTES
// ==================================================
// Send feedback
app.post('/api/feedback', auth, async (req, res) => {
  try {
    const pool = await db.getPool();
    const { baiTapId, receiverId, category, content } = req.body;
    const senderId = req.user.lecturer_id;
    await pool.request()
      .input('bt', sql.Int, baiTapId)
      .input('s', sql.VarChar, senderId)
      .input('r', sql.VarChar, receiverId)
      .input('cat', sql.NVarChar, category || '')
      .input('title', sql.NVarChar, category || 'Góp ý')
      .input('c', sql.NVarChar, content)
      .query(`INSERT INTO FEEDBACKS (BaiTapId, SenderId, ReceiverId, Category, Title, Content, Status, CreatedAt, IsRead)
        VALUES (@bt, @s, @r, @cat, @title, @c, 0, GETDATE(), 0)`);
    res.json({ success: true });
  } catch(e) { res.status(500).json({ error: e.message }); }
});

// Get feedbacks received (other lecturers' feedback about MY exercises)
app.get('/api/feedback/received', auth, async (req, res) => {
  try {
    const pool = await db.getPool();
    const r = await pool.request().input('id', sql.VarChar, req.user.lecturer_id)
      .query(`SELECT f.*, b.MaBaiTap, b.TenBaiTap, b.SkillLevel,
        dk.TenDoKho, m.TenMon, d.TenDangBai,
        gs.TenGiangVien AS SenderName
        FROM FEEDBACKS f
        LEFT JOIN BAITAP b ON b.Id = f.BaiTapId
        LEFT JOIN DOKHO dk ON dk.MaDoKho = b.MaDoKho
        LEFT JOIN MONHOC m ON m.MaMon = b.MaMon
        LEFT JOIN DANGBAI d ON d.MaDangBai = b.MaDangBai
        LEFT JOIN GIANGVIEN gs ON gs.MaGiangVien = f.SenderId
        WHERE f.ReceiverId = @id ORDER BY f.CreatedAt DESC`);
    res.json(r.recordset);
  } catch(e) { res.json([]); }
});

// Get ALL feedbacks (admin view)
app.get('/api/admin/feedbacks', auth, async (req, res) => {
  try {
    const pool = await db.getPool();
    const r = await pool.request()
      .query(`SELECT f.Id, f.BaiTapId, f.SenderId, f.ReceiverId, f.Category, f.Title, f.Content,
        f.Status, f.CreatedAt, f.UpdatedAt, f.IsRead,
        b.MaBaiTap, b.TenBaiTap, b.SkillLevel, dk.TenDoKho, m.TenMon, d.TenDangBai,
        gs.TenGiangVien AS SenderName, gr.TenGiangVien AS ReceiverName
        FROM FEEDBACKS f
        LEFT JOIN BAITAP b ON b.Id = f.BaiTapId
        LEFT JOIN DOKHO dk ON dk.MaDoKho = b.MaDoKho
        LEFT JOIN MONHOC m ON m.MaMon = b.MaMon
        LEFT JOIN DANGBAI d ON d.MaDangBai = b.MaDangBai
        LEFT JOIN GIANGVIEN gs ON gs.MaGiangVien = f.SenderId
        LEFT JOIN GIANGVIEN gr ON gr.MaGiangVien = f.ReceiverId
        ORDER BY f.CreatedAt DESC`);
    res.json(r.recordset);
  } catch(e) { res.json([]); }
});

// Get feedbacks sent (MY feedback about other lecturers' exercises)
app.get('/api/feedback/sent', auth, async (req, res) => {
  try {
    const pool = await db.getPool();
    const r = await pool.request().input('id', sql.VarChar, req.user.lecturer_id)
      .query(`SELECT f.*, b.MaBaiTap, b.TenBaiTap, b.SkillLevel,
        dk.TenDoKho, m.TenMon, d.TenDangBai,
        gr.TenGiangVien AS ReceiverName
        FROM FEEDBACKS f
        LEFT JOIN BAITAP b ON b.Id = f.BaiTapId
        LEFT JOIN DOKHO dk ON dk.MaDoKho = b.MaDoKho
        LEFT JOIN MONHOC m ON m.MaMon = b.MaMon
        LEFT JOIN DANGBAI d ON d.MaDangBai = b.MaDangBai
        LEFT JOIN GIANGVIEN gr ON gr.MaGiangVien = f.ReceiverId
        WHERE f.SenderId = @id ORDER BY f.CreatedAt DESC`);
    res.json(r.recordset);
  } catch(e) { res.json([]); }
});

// ==================================================
//  ADMIN ROUTES (from admin-routes.js)
// ==================================================
require('./admin-routes')(app, auth);

// ==================================================
//  STATIC PAGES
// ==================================================
app.get('/lecturer', auth, (req, res) => { res.sendFile(path.join(__dirname, 'public', 'lecturer.html')); });
app.get('/login', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'login.html')); });
app.get('/register', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'register.html')); });
app.get('/forgot', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'forgot.html')); });
app.get('*', (req, res) => { res.sendFile(path.join(__dirname, 'public', 'index.html')); });

// ==================================================
//  START
// ==================================================
module.exports = app;
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server started on port ${PORT} (100% MSSQL mode)`));
}
