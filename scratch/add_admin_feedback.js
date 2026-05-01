const fs = require('fs');

// ═══ 1. Add API route for all feedbacks ═══
let srv = fs.readFileSync('server.js', 'utf8');
const apiMarker = "// Get feedbacks sent (MY feedback about other lecturers' exercises)";
const apiIdx = srv.indexOf(apiMarker);
if (apiIdx > -1) {
  // Add admin API right before
  const adminFbAPI = `// Get ALL feedbacks (admin view)
app.get('/api/admin/feedbacks', auth, async (req, res) => {
  try {
    const pool = await db.getPool();
    const r = await pool.request()
      .query(\`SELECT f.Id, f.BaiTapId, f.SenderId, f.ReceiverId, f.Category, f.Title, f.Content,
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
        ORDER BY f.CreatedAt DESC\`);
    res.json(r.recordset);
  } catch(e) { res.json([]); }
});

`;
  srv = srv.substring(0, apiIdx) + adminFbAPI + srv.substring(apiIdx);
  fs.writeFileSync('server.js', srv, 'utf8');
  console.log('✅ Admin feedbacks API added');
}

// ═══ 2. Add menu item in admin.html ═══
let h = fs.readFileSync('public/admin.html', 'utf8');
const menuInsertPoint = `<li class="menu-item" data-section="exercise-history" onclick="switchSection('exercise-history')"`;
const menuIdx = h.indexOf(menuInsertPoint);
if (menuIdx > -1) {
  const feedbackMenuItem = `<li class="menu-item" data-section="feedback-history" onclick="switchSection('feedback-history')"
              style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:8px; cursor:pointer; font-size:14px; font-weight:500; color:#374151; margin-bottom:2px;">
            <span style="font-size:17px; flex-shrink:0;">💬</span> Lịch Sử Góp Ý
          </li>
          `;
  h = h.substring(0, menuIdx) + feedbackMenuItem + h.substring(menuIdx);
  console.log('✅ Menu item added');
}

// ═══ 3. Add section HTML ═══
// Find the last admin-section div closing tag before the modals
const lastSectionMarker = '<!-- Modal';
let lastSecIdx = h.indexOf(lastSectionMarker);
if (lastSecIdx === -1) {
  // Try to find the edit lecturer modal
  lastSecIdx = h.indexOf('id="edit-lecturer-modal"');
  if (lastSecIdx > -1) lastSecIdx = h.lastIndexOf('<', lastSecIdx);
}
if (lastSecIdx === -1) {
  // Just find the closing </main> tag
  lastSecIdx = h.indexOf('</main>');
}

if (lastSecIdx > -1) {
  const feedbackSection = `
  <!-- Feedback History Section -->
  <div id="feedback-history" class="admin-section" style="display:none">
    <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="width:48px;height:48px;background:linear-gradient(135deg,#f59e0b,#fbbf24);border-radius:14px;display:flex;align-items:center;justify-content:center;font-size:24px;box-shadow:0 4px 12px rgba(245,158,11,.25)">💬</div>
        <div>
          <h2 style="margin:0;font-size:22px;font-weight:800;color:var(--text-main)">Lịch Sử Góp Ý</h2>
          <p style="margin:2px 0 0;font-size:13px;color:var(--text-muted)">Tất cả góp ý giữa các giảng viên trong hệ thống</p>
        </div>
      </div>
      <button onclick="loadAllFeedbacks()" style="padding:9px 18px;background:linear-gradient(135deg,#6366f1,#818cf8);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(99,102,241,.25)">🔄 Tải lại</button>
    </div>

    <!-- Stats -->
    <div id="fb-admin-stats" style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap"></div>

    <!-- Filters -->
    <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
      <input type="text" id="fb-admin-search" placeholder="🔍 Tìm kiếm theo tên bài tập, giảng viên..." oninput="filterAdminFeedbacks()" style="flex:1;min-width:200px;padding:9px 14px;border:1.5px solid var(--border-color);border-radius:9px;font-size:13px;font-family:inherit;background:var(--bg-color);color:var(--text-main);outline:none">
      <select id="fb-admin-status" onchange="filterAdminFeedbacks()" style="padding:8px 12px;border:1.5px solid var(--border-color);border-radius:9px;font-size:13px;font-family:inherit;background:var(--card-bg);color:var(--text-main);cursor:pointer;outline:none">
        <option value="">Tất cả trạng thái</option>
        <option value="0">⏳ Chờ xử lý</option>
        <option value="1">✅ Đã xử lý</option>
        <option value="2">❌ Từ chối</option>
      </select>
    </div>

    <!-- Feedback List -->
    <div id="fb-admin-list" style="display:flex;flex-direction:column;gap:12px">
      <div style="text-align:center;padding:40px;color:var(--text-muted)">Đang tải dữ liệu...</div>
    </div>
  </div>

  `;
  h = h.substring(0, lastSecIdx) + feedbackSection + h.substring(lastSecIdx);
  console.log('✅ Section HTML added');
}

fs.writeFileSync('public/admin.html', h, 'utf8');

// ═══ 4. Add JS logic in admin.js ═══
let a = fs.readFileSync('public/admin.js', 'utf8');

// Add to switchSection
const switchInsert = "if (sectionId === 'export')           initExportSection();";
const switchIdx = a.indexOf(switchInsert);
if (switchIdx > -1) {
  a = a.substring(0, switchIdx + switchInsert.length) +
    "\n  if (sectionId === 'feedback-history') loadAllFeedbacks();" +
    a.substring(switchIdx + switchInsert.length);
  console.log('✅ switchSection updated');
}

// Add feedback functions at the end
const feedbackJS = `

// ═══════════════════ ADMIN FEEDBACK HISTORY ═══════════════════
let allAdminFeedbacks = [];
let filteredAdminFeedbacks = [];

async function loadAllFeedbacks() {
  const list = document.getElementById('fb-admin-list');
  const stats = document.getElementById('fb-admin-stats');
  if (list) list.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted)">⏳ Đang tải...</div>';

  try {
    const res = await fetch('/api/admin/feedbacks', { credentials: 'include' });
    allAdminFeedbacks = await res.json();

    // Render stats
    if (stats) {
      const total = allAdminFeedbacks.length;
      const pending = allAdminFeedbacks.filter(f => f.Status === 0).length;
      const resolved = allAdminFeedbacks.filter(f => f.Status === 1).length;
      const rejected = allAdminFeedbacks.filter(f => f.Status === 2).length;
      const senders = [...new Set(allAdminFeedbacks.map(f => f.SenderId))].length;
      stats.innerHTML = \`
        <div style="flex:1;min-width:130px;background:linear-gradient(135deg,#6366f1,#818cf8);border-radius:12px;padding:14px 16px;color:#fff">
          <div style="font-size:11px;font-weight:600;opacity:.8">Tổng góp ý</div>
          <div style="font-size:28px;font-weight:800">\${total}</div>
        </div>
        <div style="flex:1;min-width:130px;background:linear-gradient(135deg,#f59e0b,#fbbf24);border-radius:12px;padding:14px 16px;color:#fff">
          <div style="font-size:11px;font-weight:600;opacity:.8">Chờ xử lý</div>
          <div style="font-size:28px;font-weight:800">\${pending}</div>
        </div>
        <div style="flex:1;min-width:130px;background:linear-gradient(135deg,#10b981,#34d399);border-radius:12px;padding:14px 16px;color:#fff">
          <div style="font-size:11px;font-weight:600;opacity:.8">Đã xử lý</div>
          <div style="font-size:28px;font-weight:800">\${resolved}</div>
        </div>
        <div style="flex:1;min-width:130px;background:linear-gradient(135deg,#ef4444,#f87171);border-radius:12px;padding:14px 16px;color:#fff">
          <div style="font-size:11px;font-weight:600;opacity:.8">Từ chối</div>
          <div style="font-size:28px;font-weight:800">\${rejected}</div>
        </div>
        <div style="flex:1;min-width:130px;background:linear-gradient(135deg,#8b5cf6,#a78bfa);border-radius:12px;padding:14px 16px;color:#fff">
          <div style="font-size:11px;font-weight:600;opacity:.8">Giảng viên</div>
          <div style="font-size:28px;font-weight:800">\${senders}</div>
        </div>\`;
    }

    filterAdminFeedbacks();
  } catch(e) {
    if (list) list.innerHTML = '<div style="color:#ef4444;padding:20px">Lỗi: ' + e.message + '</div>';
  }
}

function filterAdminFeedbacks() {
  const search = (document.getElementById('fb-admin-search')?.value || '').toLowerCase();
  const status = document.getElementById('fb-admin-status')?.value || '';

  filteredAdminFeedbacks = allAdminFeedbacks.filter(fb => {
    if (status !== '' && String(fb.Status) !== status) return false;
    if (search) {
      const haystack = [fb.TenBaiTap, fb.MaBaiTap, fb.SenderName, fb.ReceiverName, fb.Category, fb.Content, fb.TenMon].join(' ').toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  renderAdminFeedbacks();
}

function renderAdminFeedbacks() {
  const list = document.getElementById('fb-admin-list');
  if (!list) return;

  if (filteredAdminFeedbacks.length === 0) {
    list.innerHTML = '<div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;padding:40px;text-align:center;color:var(--text-muted)"><div style="font-size:40px;margin-bottom:12px">📭</div><div style="font-size:15px;font-weight:600">Không tìm thấy góp ý nào</div></div>';
    return;
  }

  const statusMap = {0:['⏳','Chờ xử lý','#f59e0b','#fef9c3'], 1:['✅','Đã xử lý','#16a34a','#dcfce7'], 2:['❌','Từ chối','#ef4444','#fee2e2']};
  const lvlColors = {1:'#10b981',2:'#06b6d4',3:'#f59e0b',4:'#f97316',5:'#8b5cf6'};
  const diffColors = {'Dễ':['#dcfce7','#166534'],'Trung bình':['#fef9c3','#854d0e'],'Khó':['#fee2e2','#991b1b']};

  list.innerHTML = filteredAdminFeedbacks.map((fb, idx) => {
    const st = statusMap[fb.Status] || statusMap[0];
    const date = fb.CreatedAt ? new Date(fb.CreatedAt).toLocaleString('vi-VN') : '—';
    const lc = lvlColors[fb.SkillLevel||1] || '#94a3b8';
    const dc = diffColors[fb.TenDoKho] || ['#f1f5f9','#475569'];

    return \`<div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:14px;overflow:hidden;transition:box-shadow .15s" onmouseenter="this.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'" onmouseleave="this.style.boxShadow=''">
      <!-- Card Header -->
      <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:var(--bg-color);border-bottom:1px solid var(--border-color)">
        <div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">
          <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#f59e0b,#fbbf24);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">💬</div>
          <div style="min-width:0">
            <div style="font-size:14px;font-weight:700;color:var(--text-main);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">\${fb.TenBaiTap||'(Không xác định)'}</div>
            <div style="font-size:12px;color:var(--text-muted)">Mã: \${fb.MaBaiTap||'—'} · \${fb.TenMon||'—'}</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:8px;flex-shrink:0">
          <span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;background:\${dc[0]};color:\${dc[1]}">\${fb.TenDoKho||'—'}</span>
          <span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:8px;background:\${lc}20;color:\${lc};border:1px solid \${lc}44">L\${fb.SkillLevel||1}</span>
          <span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;background:\${st[3]};color:\${st[2]}">\${st[0]} \${st[1]}</span>
        </div>
      </div>
      <!-- Card Body -->
      <div style="padding:14px 18px">
        <div style="display:flex;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px">
          <div style="display:flex;gap:16px;font-size:13px">
            <span style="color:var(--text-muted)">📤 Người gửi: <b style="color:var(--text-main)">\${fb.SenderName||fb.SenderId||'—'}</b></span>
            <span style="color:var(--text-muted)">📥 Người nhận: <b style="color:var(--text-main)">\${fb.ReceiverName||fb.ReceiverId||'—'}</b></span>
          </div>
          <span style="font-size:12px;color:var(--text-muted)">🕐 \${date}</span>
        </div>
        <div style="font-size:13px;font-weight:600;color:#6366f1;margin-bottom:6px">📌 \${fb.Category||'Góp ý chung'}</div>
        <div style="font-size:14px;color:var(--text-main);line-height:1.6;background:var(--bg-color);padding:10px 14px;border-radius:8px;border-left:3px solid #6366f1">\${fb.Content||'(Không có nội dung)'}</div>
        \${fb.TenDangBai ? '<div style="margin-top:8px;font-size:12px;color:var(--text-muted)">📋 Dạng bài: <b>' + fb.TenDangBai + '</b></div>' : ''}
      </div>
    </div>\`;
  }).join('');
}
`;

a += feedbackJS;
fs.writeFileSync('public/admin.js', a, 'utf8');
console.log('✅ Admin feedback JS added');
console.log('✅ All done!');
