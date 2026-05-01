const fs = require('fs');
const path = require('path');

// ─────────────────────────────────────────────
// 1. Inject Profile Modal vào admin.html
// ─────────────────────────────────────────────
const htmlPath = path.join(__dirname, '..', 'public', 'admin.html');
let html = fs.readFileSync(htmlPath, 'utf8');

const profileModal = `
  <!-- MODAL: HỒ SƠ GIẢNG VIÊN -->
  <div id="gv-profile-modal" style="display:none; position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:9100; align-items:center; justify-content:center; backdrop-filter:blur(3px);">
    <div style="background:white; border-radius:16px; width:620px; max-width:95vw; max-height:90vh; overflow:hidden; display:flex; flex-direction:column; box-shadow:0 24px 64px rgba(0,0,0,0.2);">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#0f172a,#1e293b); padding:20px 24px; display:flex; justify-content:space-between; align-items:center; flex-shrink:0;">
        <div style="display:flex; align-items:center; gap:12px;">
          <div id="profile-avatar" style="width:48px; height:48px; border-radius:50%; background:rgba(255,255,255,0.2); display:flex; align-items:center; justify-content:center; font-size:20px; font-weight:700; color:white;"></div>
          <div>
            <h3 id="profile-name" style="margin:0; color:white; font-size:17px;">Đang tải...</h3>
            <p id="profile-sub" style="margin:3px 0 0; font-size:12px; color:rgba(255,255,255,0.6);"></p>
          </div>
        </div>
        <button onclick="closeProfileModal()" style="background:rgba(255,255,255,0.15); border:none; color:white; width:32px; height:32px; border-radius:50%; cursor:pointer; font-size:16px;">✕</button>
      </div>
      <!-- Stats row -->
      <div id="profile-stats" style="display:grid; grid-template-columns:repeat(4,1fr); gap:0; border-bottom:1px solid #f1f5f9; flex-shrink:0;"></div>
      <!-- Body -->
      <div style="overflow-y:auto; flex:1; padding:20px 24px;">
        <!-- 2 columns -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px;">
          <!-- Đăng nhập gần đây -->
          <div>
            <div style="font-size:13px; font-weight:700; color:#374151; margin-bottom:10px; display:flex; align-items:center; gap:6px;">🔑 Đăng Nhập Gần Đây</div>
            <div id="profile-logins" style="display:flex; flex-direction:column; gap:6px;"></div>
          </div>
          <!-- Bài tập gần đây -->
          <div>
            <div style="font-size:13px; font-weight:700; color:#374151; margin-bottom:10px; display:flex; align-items:center; gap:6px;">📝 Bài Tập Gần Đây</div>
            <div id="profile-exercises" style="display:flex; flex-direction:column; gap:6px;"></div>
          </div>
        </div>
      </div>
      <!-- Footer -->
      <div style="padding:14px 24px; border-top:1px solid #f1f5f9; display:flex; gap:8px; justify-content:flex-end; background:#fafafa; flex-shrink:0;">
        <button onclick="openEditLecturerModal(document.getElementById('profile-modal-gv-id').value)"
          style="padding:9px 18px; background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer;">✏️ Sửa Thông Tin</button>
        <button onclick="closeProfileModal()"
          style="padding:9px 18px; background:#f1f5f9; color:#64748b; border:none; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer;">Đóng</button>
        <input type="hidden" id="profile-modal-gv-id">
      </div>
    </div>
  </div>
`;

// Inject trước </body>
html = html.replace(
  `  <script src="/admin.js?v=61"></script>`,
  profileModal + `  <script src="/admin.js?v=62"></script>`
);

fs.writeFileSync(htmlPath, html, 'utf8');
console.log('✅ HTML updated. Size:', fs.statSync(htmlPath).size);
