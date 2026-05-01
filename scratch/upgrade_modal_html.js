const fs = require('fs');
let h = fs.readFileSync('public/admin.html', 'utf8');

// Find the modal and update it
const modalStart = h.indexOf('<div class="admin-modal" id="lecturer-exercises-detail-modal">');
if (modalStart === -1) { console.log('Modal not found'); process.exit(1); }

// Find end of this modal div
let depth = 0;
let modalEnd = -1;
for (let i = modalStart; i < h.length; i++) {
  if (h.substring(i, i+4) === '<div') depth++;
  if (h.substring(i, i+6) === '</div>') {
    depth--;
    if (depth === 0) { modalEnd = i + 6; break; }
  }
}
console.log('Modal from', modalStart, 'to', modalEnd, 'length:', modalEnd - modalStart);

const newModal = `<div class="admin-modal" id="lecturer-exercises-detail-modal">
    <div class="admin-modal-content" style="max-width:900px;width:95%;padding:0;overflow:hidden;border-radius:16px;">
      <!-- Header -->
      <div style="background:linear-gradient(135deg,#8b5cf6,#6d28d9);padding:20px 24px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;">
          <div style="display:flex;align-items:center;gap:14px;">
            <div style="width:44px;height:44px;background:rgba(255,255,255,0.2);border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;">📊</div>
            <div>
              <h2 id="gv-detail-title" style="margin:0;font-size:17px;font-weight:700;color:white;">Chi Tiết Phân Loại</h2>
              <p id="gv-detail-subtitle" style="margin:3px 0 0;font-size:12px;color:rgba(255,255,255,0.75);">Bấm vào biểu đồ để xem chi tiết</p>
            </div>
          </div>
          <button onclick="closeLecturerExercisesModal()" style="background:rgba(255,255,255,0.15);border:none;color:white;width:34px;height:34px;border-radius:8px;font-size:18px;cursor:pointer;flex-shrink:0;">&times;</button>
        </div>
        <!-- Search inside header -->
        <div style="margin-top:14px;position:relative;">
          <span style="position:absolute;left:12px;top:50%;transform:translateY(-50%);font-size:14px;">🔍</span>
          <input type="text" id="gv-detail-search" placeholder="Tìm kiếm bài tập theo tên, mã, môn học..." oninput="filterLecturerExercises()" style="width:100%;padding:9px 14px 9px 36px;border:none;border-radius:9px;font-size:13px;background:rgba(255,255,255,0.15);color:white;backdrop-filter:blur(4px);box-sizing:border-box;outline:none;" onfocus="this.style.background='rgba(255,255,255,0.22)'" onblur="this.style.background='rgba(255,255,255,0.15)'">
        </div>
      </div>
      <!-- Stats cards -->
      <div id="gv-detail-stats" style="padding:16px 20px 0;"></div>
      <!-- Table -->
      <div style="max-height:380px;overflow-y:auto;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          <thead style="position:sticky;top:0;background:var(--card-bg);z-index:1;">
            <tr style="border-bottom:2px solid var(--border-color);">
              <th style="padding:11px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Mã Bài</th>
              <th style="padding:11px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Bài Tập / Môn</th>
              <th style="padding:11px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Độ Khó</th>
              <th style="padding:11px 14px;text-align:center;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Level</th>
              <th style="padding:11px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Giảng Viên</th>
              <th style="padding:11px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.5px;">Cập Nhật</th>
            </tr>
          </thead>
          <tbody id="gv-detail-exercises-tbody">
            <tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);">Bấm vào biểu đồ để xem chi tiết</td></tr>
          </tbody>
        </table>
      </div>
      <!-- Footer -->
      <div style="padding:12px 20px;border-top:1px solid var(--border-color);display:flex;justify-content:space-between;align-items:center;">
        <span id="gv-detail-count" style="font-size:13px;color:var(--text-muted);"></span>
        <button onclick="closeLecturerExercisesModal()" style="padding:8px 20px;background:#6366f1;color:#fff;border:none;border-radius:8px;font-size:13px;font-weight:600;cursor:pointer;">Đóng</button>
      </div>
    </div>
  </div>`;

h = h.substring(0, modalStart) + newModal + h.substring(modalEnd);
fs.writeFileSync('public/admin.html', h, 'utf8');
console.log('✅ Modal HTML upgraded!');
