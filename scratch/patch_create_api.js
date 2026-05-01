const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'server.js');
const lines = fs.readFileSync(filePath, 'utf8').split('\r\n');

// Lines 1761-1792 are index 1760-1791
const newBlock = `app.post('/api/admin/lecturer/create', auth, adminOnly, async (req, res) => {
  const { magv, ten, pass, email, subjects, permXem, permSua, permXoa } = req.body;

  if (!magv || !ten || !pass) return res.status(400).json({ error: 'Thiếu thông tin bắt buộc (Mã GV, Họ tên, Mật khẩu)' });

  const pool = await getPool();
  const transaction = new mssql.Transaction(pool);
  try {
    await transaction.begin();

    // Kiểm tra trùng MaGiangVien
    const existing = await transaction.request()
      .input('MaGV', mssql.VarChar, magv)
      .query('SELECT 1 FROM GIANGVIEN WHERE MaGiangVien = @MaGV');
    if (existing.recordset.length > 0) {
      await transaction.rollback();
      return res.status(409).json({ error: \`Mã giảng viên "\${magv}" đã tồn tại trong hệ thống\` });
    }

    // 1. INSERT vào GIANGVIEN - đúng cấu trúc bảng thực tế
    const finalEmail = email || \`\${magv}@school.edu.vn\`;
    await transaction.request()
      .input('MaGV',  mssql.VarChar,  magv)
      .input('Ten',   mssql.NVarChar, ten)
      .input('Pass',  mssql.NVarChar, pass)
      .input('Email', mssql.NVarChar, finalEmail)
      .query(\`
        INSERT INTO GIANGVIEN
          (MaGiangVien, TenGiangVien, TenDangNhap, MatKhau, Email, Quyen, IsBlocked)
        VALUES
          (@MaGV, @Ten, @MaGV, @Pass, @Email, 'lecturer', 0)
      \`);

    // 2. INSERT vào GIANGVIEN_MONHOC với đầy đủ các cột theo schema thực tế
    if (Array.isArray(subjects) && subjects.length > 0) {
      for (const mamon of subjects) {
        await transaction.request()
          .input('MaGV',     mssql.VarChar, magv)
          .input('MaMon',    mssql.VarChar, mamon)
          .input('QuyenXem', mssql.Bit, permXem ? 1 : 0)
          .input('QuyenSua', mssql.Bit, permSua ? 1 : 0)
          .input('QuyenXoa', mssql.Bit, permXoa ? 1 : 0)
          .query(\`
            INSERT INTO GIANGVIEN_MONHOC
              (MaGiangVien, MaMon, VaiTro, NgayThem, QuyenXem, QuyenSua, QuyenXoa)
            VALUES
              (@MaGV, @MaMon, N'Giảng viên', GETDATE(), @QuyenXem, @QuyenSua, @QuyenXoa)
          \`);
      }
    }

    await transaction.commit();
    res.json({ success: true, message: \`Tài khoản \${magv} đã được tạo thành công\` });
  } catch (err) {
    await transaction.rollback();
    console.error('Create lecturer error:', err);
    res.status(500).json({ error: err.message });
  }
});`;

const before = lines.slice(0, 1760);      // lines 1-1760
const after  = lines.slice(1792);          // lines 1793+
const newLines = [...before, ...newBlock.split('\n'), ...after];

fs.writeFileSync(filePath, newLines.join('\r\n'), 'utf8');
console.log('Done! API updated successfully.');
console.log('Before lines:', before.length);
console.log('After lines:', after.length);
