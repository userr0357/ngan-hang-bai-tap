const fs = require('fs');
let h = fs.readFileSync('public/admin.html', 'utf8');

// Find where to insert menu item - before exercise-history
const menuTarget = 'data-section="exercise-history"';
const menuIdx = h.indexOf(menuTarget);
console.log('Menu target at:', menuIdx);

if (menuIdx > -1) {
  // Go back to start of this <li>
  const liStart = h.lastIndexOf('<li', menuIdx);
  console.log('Li starts at:', liStart);
  
  const menuItem = `<li class="menu-item" data-section="feedback-history" onclick="switchSection('feedback-history')"
              style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:8px; cursor:pointer; font-size:14px; font-weight:500; color:#374151; margin-bottom:2px;">
            <span style="font-size:17px; flex-shrink:0;">💬</span> Lịch Sử Góp Ý
          </li>
          `;
  h = h.substring(0, liStart) + menuItem + h.substring(liStart);
  console.log('✅ Menu item inserted');
}

// Find where to insert section - look for </main>
const mainClose = h.indexOf('</main>');
console.log('</main> at:', mainClose);

if (mainClose > -1) {
  const section = `
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
      <div id="fb-admin-stats" style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap"></div>
      <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;padding:12px 16px;margin-bottom:16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <input type="text" id="fb-admin-search" placeholder="🔍 Tìm kiếm theo tên bài tập, giảng viên..." oninput="filterAdminFeedbacks()" style="flex:1;min-width:200px;padding:9px 14px;border:1.5px solid var(--border-color);border-radius:9px;font-size:13px;font-family:inherit;background:var(--bg-color);color:var(--text-main);outline:none">
        <select id="fb-admin-status" onchange="filterAdminFeedbacks()" style="padding:8px 12px;border:1.5px solid var(--border-color);border-radius:9px;font-size:13px;font-family:inherit;background:var(--card-bg);color:var(--text-main);cursor:pointer;outline:none">
          <option value="">Tất cả trạng thái</option>
          <option value="0">⏳ Chờ xử lý</option>
          <option value="1">✅ Đã xử lý</option>
          <option value="2">❌ Từ chối</option>
        </select>
      </div>
      <div id="fb-admin-list" style="display:flex;flex-direction:column;gap:12px">
        <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;padding:40px;text-align:center;color:var(--text-muted)"><div style="font-size:40px;margin-bottom:12px">📭</div><div style="font-size:15px;font-weight:600">Chưa có góp ý nào</div><div style="font-size:13px;margin-top:4px">Giảng viên chưa gửi góp ý nào trong hệ thống</div></div>
      </div>
    </div>
  `;
  h = h.substring(0, mainClose) + section + h.substring(mainClose);
  console.log('✅ Section HTML inserted');
}

fs.writeFileSync('public/admin.html', h, 'utf8');

// ═══ Update admin.js ═══
let a = fs.readFileSync('public/admin.js', 'utf8');

// Check if switchSection already has feedback-history
if (!a.includes('feedback-history')) {
  // Add to switchSection
  const switchTarget = "if (sectionId === 'export')           initExportSection();";
  const sIdx = a.indexOf(switchTarget);
  if (sIdx > -1) {
    a = a.substring(0, sIdx + switchTarget.length) +
      "\n  if (sectionId === 'feedback-history') loadAllFeedbacks();" +
      a.substring(sIdx + switchTarget.length);
    console.log('✅ switchSection updated');
  }
}

// Check if loadAllFeedbacks exists
if (!a.includes('function loadAllFeedbacks')) {
  const feedbackJS = `

// ═══════════════════ ADMIN FEEDBACK HISTORY ═══════════════════
let allAdminFeedbacks = [];

async function loadAllFeedbacks() {
  const list = document.getElementById('fb-admin-list');
  const stats = document.getElementById('fb-admin-stats');
  if (list) list.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted)">⏳ Đang tải...</div>';

  try {
    const res = await fetch('/api/admin/feedbacks', { credentials: 'include' });
    allAdminFeedbacks = await res.json();

    if (stats) {
      const total = allAdminFeedbacks.length;
      const pending = allAdminFeedbacks.filter(f => f.Status === 0).length;
      const resolved = allAdminFeedbacks.filter(f => f.Status === 1).length;
      const rejected = allAdminFeedbacks.filter(f => f.Status === 2).length;
      const senders = [...new Set(allAdminFeedbacks.map(f => f.SenderId))].length;
      stats.innerHTML = [
        ['Tổng góp ý', total, '#6366f1', '#818cf8'],
        ['Chờ xử lý', pending, '#f59e0b', '#fbbf24'],
        ['Đã xử lý', resolved, '#10b981', '#34d399'],
        ['Từ chối', rejected, '#ef4444', '#f87171'],
        ['Giảng viên', senders, '#8b5cf6', '#a78bfa']
      ].map(([label, val, c1, c2]) =>
        '<div style="flex:1;min-width:120px;background:linear-gradient(135deg,'+c1+','+c2+');border-radius:12px;padding:14px 16px;color:#fff"><div style="font-size:11px;font-weight:600;opacity:.8">'+label+'</div><div style="font-size:28px;font-weight:800">'+val+'</div></div>'
      ).join('');
    }
    filterAdminFeedbacks();
  } catch(e) {
    if (list) list.innerHTML = '<div style="color:#ef4444;padding:20px">Lỗi: ' + e.message + '</div>';
  }
}

function filterAdminFeedbacks() {
  const search = (document.getElementById('fb-admin-search') ? document.getElementById('fb-admin-search').value : '').toLowerCase();
  const status = document.getElementById('fb-admin-status') ? document.getElementById('fb-admin-status').value : '';
  const filtered = allAdminFeedbacks.filter(function(fb) {
    if (status !== '' && String(fb.Status) !== status) return false;
    if (search) {
      var hay = [fb.TenBaiTap||'', fb.MaBaiTap||'', fb.SenderName||'', fb.ReceiverName||'', fb.Category||'', fb.Content||'', fb.TenMon||''].join(' ').toLowerCase();
      if (hay.indexOf(search) === -1) return false;
    }
    return true;
  });
  renderAdminFeedbacks(filtered);
}

function renderAdminFeedbacks(filtered) {
  const list = document.getElementById('fb-admin-list');
  if (!list) return;
  if (!filtered || filtered.length === 0) {
    list.innerHTML = '<div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;padding:40px;text-align:center;color:var(--text-muted)"><div style="font-size:40px;margin-bottom:12px">📭</div><div style="font-size:15px;font-weight:600">Không tìm thấy góp ý nào</div></div>';
    return;
  }
  var statusMap = {0:['⏳','Chờ xử lý','#f59e0b','#fef9c3'], 1:['✅','Đã xử lý','#16a34a','#dcfce7'], 2:['❌','Từ chối','#ef4444','#fee2e2']};
  var lvlColors = {1:'#10b981',2:'#06b6d4',3:'#f59e0b',4:'#f97316',5:'#8b5cf6'};
  var diffColors = {'Dễ':['#dcfce7','#166534'],'Trung bình':['#fef9c3','#854d0e'],'Khó':['#fee2e2','#991b1b']};

  list.innerHTML = filtered.map(function(fb) {
    var st = statusMap[fb.Status] || statusMap[0];
    var date = fb.CreatedAt ? new Date(fb.CreatedAt).toLocaleString('vi-VN') : '—';
    var lc = lvlColors[fb.SkillLevel||1] || '#94a3b8';
    var dc = diffColors[fb.TenDoKho] || ['#f1f5f9','#475569'];

    return '<div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:14px;overflow:hidden;transition:box-shadow .15s" onmouseenter="this.style.boxShadow=\\'0 4px 16px rgba(0,0,0,.08)\\'" onmouseleave="this.style.boxShadow=\\'\\'">'+
      '<div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:var(--bg-color);border-bottom:1px solid var(--border-color)">'+
        '<div style="display:flex;align-items:center;gap:10px;flex:1;min-width:0">'+
          '<div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,#f59e0b,#fbbf24);display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0">💬</div>'+
          '<div style="min-width:0">'+
            '<div style="font-size:14px;font-weight:700;color:var(--text-main);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+(fb.TenBaiTap||'(Không xác định)')+'</div>'+
            '<div style="font-size:12px;color:var(--text-muted)">Mã: '+(fb.MaBaiTap||'—')+' · '+(fb.TenMon||'—')+'</div>'+
          '</div>'+
        '</div>'+
        '<div style="display:flex;align-items:center;gap:8px;flex-shrink:0">'+
          '<span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;background:'+dc[0]+';color:'+dc[1]+'">'+(fb.TenDoKho||'—')+'</span>'+
          '<span style="font-size:11px;font-weight:700;padding:3px 8px;border-radius:8px;background:'+lc+'20;color:'+lc+';border:1px solid '+lc+'44">L'+(fb.SkillLevel||1)+'</span>'+
          '<span style="font-size:11px;font-weight:600;padding:3px 10px;border-radius:20px;background:'+st[3]+';color:'+st[2]+'">'+st[0]+' '+st[1]+'</span>'+
        '</div>'+
      '</div>'+
      '<div style="padding:14px 18px">'+
        '<div style="display:flex;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px">'+
          '<div style="display:flex;gap:16px;font-size:13px">'+
            '<span style="color:var(--text-muted)">📤 Người gửi: <b style="color:var(--text-main)">'+(fb.SenderName||fb.SenderId||'—')+'</b></span>'+
            '<span style="color:var(--text-muted)">📥 Người nhận: <b style="color:var(--text-main)">'+(fb.ReceiverName||fb.ReceiverId||'—')+'</b></span>'+
          '</div>'+
          '<span style="font-size:12px;color:var(--text-muted)">🕐 '+date+'</span>'+
        '</div>'+
        '<div style="font-size:13px;font-weight:600;color:#6366f1;margin-bottom:6px">📌 '+(fb.Category||'Góp ý chung')+'</div>'+
        '<div style="font-size:14px;color:var(--text-main);line-height:1.6;background:var(--bg-color);padding:10px 14px;border-radius:8px;border-left:3px solid #6366f1">'+(fb.Content||'(Không có nội dung)')+'</div>'+
        (fb.TenDangBai ? '<div style="margin-top:8px;font-size:12px;color:var(--text-muted)">📋 Dạng bài: <b>'+fb.TenDangBai+'</b></div>' : '')+
      '</div>'+
    '</div>';
  }).join('');
}
`;
  a += feedbackJS;
  console.log('✅ Feedback JS functions added');
}

fs.writeFileSync('public/admin.js', a, 'utf8');
console.log('✅ All done!');
