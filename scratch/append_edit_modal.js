const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '..', 'public', 'admin.html');

let content = fs.readFileSync(filePath, 'utf8');

const oldEnd = `  <script src="/admin.js?v=60"></script>\n  <script src="/ai-features.js"></script>\n</body>\n</html>`;
const newEnd = `
  <!-- MODAL: SỬA THÔNG TIN GIẢNG VIÊN (2 Tab) -->
  <div id="edit-lecturer-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:9000; align-items:center; justify-content:center; backdrop-filter:blur(3px);">
    <div style="background:white; border-radius:16px; width:680px; max-width:95vw; max-height:90vh; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 24px 64px rgba(0,0,0,0.2);">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#1e293b,#334155); padding:20px 24px; display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div id="edit-modal-avatar" style="width:44px; height:44px; border-radius:50%; background:rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; font-size:18px; font-weight:700; color:white;"></div>
          <div>
            <h3 style="margin:0; color:white; font-size:16px;" id="edit-modal-title">Chỉnh Sửa Thông Tin</h3>
            <p style="margin:2px 0 0; font-size:12px; color:rgba(255,255,255,0.6);" id="edit-modal-subtitle">Mã: —</p>
          </div>
        </div>
        <button onclick="closeEditLecturerModal()" style="background:rgba(255,255,255,0.15); border:none; color:white; width:32px; height:32px; border-radius:50%; cursor:pointer; font-size:16px;">✕</button>
      </div>
      <!-- Tabs -->
      <div style="display:flex; border-bottom:2px solid #f1f5f9; background:#fafafa; flex-shrink:0;">
        <button id="edit-tab-info-btn" onclick="switchEditTab('info')" style="padding:14px 24px; border:none; background:transparent; font-size:14px; font-weight:600; cursor:pointer; color:#6366f1; border-bottom:2px solid #6366f1; margin-bottom:-2px;">👤 Thông Tin Cơ Bản</button>
        <button id="edit-tab-subjects-btn" onclick="switchEditTab('subjects')" style="padding:14px 24px; border:none; background:transparent; font-size:14px; font-weight:600; cursor:pointer; color:#94a3b8; border-bottom:2px solid transparent; margin-bottom:-2px;">📚 Môn Học &amp; Quyền</button>
      </div>
      <!-- Body -->
      <div style="overflow-y:auto; flex:1; padding:24px;">
        <!-- Tab 1: Thông tin cơ bản -->
        <div id="edit-tab-info">
          <input type="hidden" id="edit-gv-id">
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
            <div>
              <label style="font-size:13px; font-weight:600; color:#374151; display:block; margin-bottom:6px;">Mã Giảng Viên</label>
              <input id="edit-gv-code" disabled style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; box-sizing:border-box; background:#f8fafc; color:#94a3b8; font-family:monospace;">
              <div style="font-size:11px; color:#94a3b8; margin-top:3px;">Không thể thay đổi mã GV</div>
            </div>
            <div>
              <label style="font-size:13px; font-weight:600; color:#374151; display:block; margin-bottom:6px;">Quyền Hệ Thống</label>
              <select id="edit-gv-quyen" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; box-sizing:border-box; background:white; cursor:pointer;" onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#e2e8f0'">
                <option value="lecturer">👨‍🏫 Giảng Viên</option>
                <option value="admin">🛡 Quản Trị Viên</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom:16px;">
            <label style="font-size:13px; font-weight:600; color:#374151; display:block; margin-bottom:6px;">Họ và Tên <span style="color:#ef4444;">*</span></label>
            <input id="edit-gv-name" type="text" placeholder="Nguyễn Văn A" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; box-sizing:border-box;" onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#e2e8f0'">
          </div>
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:16px;">
            <div>
              <label style="font-size:13px; font-weight:600; color:#374151; display:block; margin-bottom:6px;">Tên Đăng Nhập <span style="color:#ef4444;">*</span></label>
              <input id="edit-gv-username" type="text" placeholder="GV01" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; box-sizing:border-box; font-family:monospace;" onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#e2e8f0'">
              <div style="font-size:11px; color:#94a3b8; margin-top:3px;">Dùng để đăng nhập vào hệ thống</div>
            </div>
            <div>
              <label style="font-size:13px; font-weight:600; color:#374151; display:block; margin-bottom:6px;">Email</label>
              <input id="edit-gv-email" type="email" placeholder="gv@school.edu.vn" style="width:100%; padding:10px 12px; border:1.5px solid #e2e8f0; border-radius:8px; font-size:14px; box-sizing:border-box;" onfocus="this.style.borderColor='#6366f1'" onblur="this.style.borderColor='#e2e8f0'">
            </div>
          </div>
          <div style="background:#fffbeb; border:1.5px solid #fde68a; border-radius:10px; padding:16px;">
            <div style="font-size:13px; font-weight:600; color:#92400e; margin-bottom:10px;">🔑 Đổi Mật Khẩu <span style="font-weight:400; color:#a16207;">(để trống nếu không đổi)</span></div>
            <div style="position:relative;">
              <input id="edit-gv-pass" type="password" placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)" style="width:100%; padding:10px 12px; border:1.5px solid #fde68a; border-radius:8px; font-size:14px; box-sizing:border-box; padding-right:42px; background:white;" onfocus="this.style.borderColor='#f59e0b'" onblur="this.style.borderColor='#fde68a'">
              <span onclick="togglePwdVisibility('edit-gv-pass',this)" style="position:absolute; right:10px; top:50%; transform:translateY(-50%); cursor:pointer; font-size:15px; color:#94a3b8;">👁</span>
            </div>
          </div>
        </div>
        <!-- Tab 2: Môn học & Quyền -->
        <div id="edit-tab-subjects" style="display:none;">
          <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
            <div style="font-size:14px; font-weight:600; color:#374151;">Danh sách môn đang phụ trách</div>
            <button onclick="showAddSubjectToGV()" style="padding:7px 14px; background:#6366f1; color:white; border:none; border-radius:7px; font-size:13px; font-weight:600; cursor:pointer;">+ Thêm môn</button>
          </div>
          <div id="edit-subjects-list" style="margin-bottom:16px;"></div>
          <div id="edit-add-subject-picker" style="display:none; border:1.5px dashed #e2e8f0; border-radius:10px; padding:14px; background:#f8fafc;">
            <div style="font-size:13px; color:#64748b; margin-bottom:10px;">Chọn môn học để thêm:</div>
            <div id="edit-add-subject-tags" style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:12px;"></div>
            <button onclick="confirmAddSubjectsToGV()" style="padding:8px 16px; background:#10b981; color:white; border:none; border-radius:7px; font-size:13px; font-weight:600; cursor:pointer;">✅ Xác nhận thêm</button>
            <button onclick="document.getElementById('edit-add-subject-picker').style.display='none'" style="padding:8px 14px; background:transparent; color:#94a3b8; border:none; font-size:13px; cursor:pointer; margin-left:6px;">Hủy</button>
          </div>
        </div>
      </div>
      <!-- Footer -->
      <div style="padding:16px 24px; border-top:1px solid #f1f5f9; display:flex; gap:10px; justify-content:flex-end; background:#fafafa; flex-shrink:0;">
        <button onclick="closeEditLecturerModal()" style="padding:10px 20px; border:1.5px solid #e2e8f0; border-radius:8px; background:white; color:#64748b; font-size:14px; font-weight:600; cursor:pointer;">Hủy</button>
        <button id="save-edit-info-btn" onclick="saveEditLecturerInfo()" style="padding:10px 24px; background:linear-gradient(135deg,#6366f1,#818cf8); color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; box-shadow:0 4px 12px rgba(99,102,241,0.3);">💾 Lưu Thay Đổi</button>
      </div>
    </div>
  </div>

  <script src="/admin.js?v=61"></script>
  <script src="/ai-features.js"></script>
</body>
</html>`;

// Try both CRLF and LF
let replaced = false;
for (const ending of [
  `  <script src="/admin.js?v=60"></script>\r\n  <script src="/ai-features.js"></script>\r\n</body>\r\n</html>`,
  `  <script src="/admin.js?v=60"></script>\n  <script src="/ai-features.js"></script>\n</body>\n</html>`
]) {
  if (content.includes(ending)) {
    content = content.replace(ending, newEnd);
    replaced = true;
    console.log('Replaced successfully');
    break;
  }
}
if (!replaced) {
  // Force append before </body>
  content = content.replace('</body>', newEnd.replace('  <script src="/admin.js?v=61"></script>\n  <script src="/ai-features.js"></script>\n</body>\n</html>', '') + '</body>');
  // update script version
  content = content.replace('/admin.js?v=60"', '/admin.js?v=61"');
  console.log('Force appended modal');
}
fs.writeFileSync(filePath, content, 'utf8');
console.log('Done. File size:', fs.statSync(filePath).size);
