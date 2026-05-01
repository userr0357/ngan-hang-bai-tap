const fs = require('fs');
let a = fs.readFileSync('public/admin.js', 'utf8');

// 1. Replace handleChartClick with enhanced version
const oldHandler = `function handleChartClick(type, value, displayLabel) {
  const modal = document.getElementById('lecturer-exercises-detail-modal');
  const tbody = document.getElementById('gv-detail-exercises-tbody');
  const title = document.getElementById('gv-detail-title');
  
  title.textContent = \`Danh sách bài tập: \${displayLabel}\`;
  modal.classList.add('show');
  tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;"><div class="spinner"></div> Đang lọc dữ liệu...</td></tr>';

  try {
    const res = await fetch(\`/api/admin/exercises/filter?type=\${type}&value=\${encodeURIComponent(value)}\`, { credentials: 'include' });
    currentDetailExercises = await res.json();
    renderDetailExercisesTable();
  } catch (err) { tbody.innerHTML = '<tr><td colspan="4">Lỗi: ' + err.message + '</td></tr>'; }
}`;

const newHandler = `function handleChartClick(type, value, displayLabel) {
  const modal = document.getElementById('lecturer-exercises-detail-modal');
  const tbody = document.getElementById('gv-detail-exercises-tbody');
  const title = document.getElementById('gv-detail-title');
  const statsEl = document.getElementById('gv-detail-stats');
  
  const typeLabels = { subject: '📚 Môn học', level: '⚡ Cấp độ', form: '📋 Dạng bài', difficulty: '🎯 Độ khó', lecturer: '👨‍🏫 Giảng viên' };
  title.textContent = (typeLabels[type]||'📊 Phân loại') + ': ' + displayLabel;
  modal.classList.add('show');
  tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;"><div class="spinner"></div> Đang lọc dữ liệu...</td></tr>';
  if (statsEl) statsEl.innerHTML = '';

  try {
    const res = await fetch(\`/api/admin/exercises/filter?type=\${type}&value=\${encodeURIComponent(value)}\`, { credentials: 'include' });
    currentDetailExercises = await res.json();
    // Render stats header
    if (statsEl) {
      const total = currentDetailExercises.length;
      const subjects = [...new Set(currentDetailExercises.map(e=>e.TenMon).filter(Boolean))];
      const lecturers = [...new Set(currentDetailExercises.map(e=>e.TenGiangVien||e.MaGiangVien).filter(Boolean))];
      const levels = [...new Set(currentDetailExercises.map(e=>e.SkillLevel).filter(Boolean))];
      statsEl.innerHTML = \`
        <div style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap">
          <div style="flex:1;min-width:120px;background:linear-gradient(135deg,#6366f1,#818cf8);border-radius:12px;padding:14px 16px;color:#fff">
            <div style="font-size:11px;font-weight:600;opacity:.8">Tổng bài tập</div>
            <div style="font-size:28px;font-weight:800">\${total}</div>
          </div>
          <div style="flex:1;min-width:120px;background:linear-gradient(135deg,#10b981,#34d399);border-radius:12px;padding:14px 16px;color:#fff">
            <div style="font-size:11px;font-weight:600;opacity:.8">Môn học</div>
            <div style="font-size:28px;font-weight:800">\${subjects.length}</div>
          </div>
          <div style="flex:1;min-width:120px;background:linear-gradient(135deg,#f59e0b,#fbbf24);border-radius:12px;padding:14px 16px;color:#fff">
            <div style="font-size:11px;font-weight:600;opacity:.8">Giảng viên</div>
            <div style="font-size:28px;font-weight:800">\${lecturers.length}</div>
          </div>
          <div style="flex:1;min-width:120px;background:linear-gradient(135deg,#ef4444,#f87171);border-radius:12px;padding:14px 16px;color:#fff">
            <div style="font-size:11px;font-weight:600;opacity:.8">Skill Levels</div>
            <div style="font-size:28px;font-weight:800">\${levels.length}</div>
          </div>
        </div>\`;
    }
    renderDetailExercisesTable();
  } catch (err) { tbody.innerHTML = '<tr><td colspan="6">Lỗi: ' + err.message + '</td></tr>'; }
}`;

const idx1 = a.indexOf('function handleChartClick');
if (idx1 === -1) { console.log('handleChartClick NOT FOUND'); process.exit(1); }
// Find the end of the function (next function declaration or closing brace pattern)
const endSearch = a.indexOf('\n// ====', idx1 + 100);
const oldBlock = a.substring(idx1, endSearch);
console.log('Replacing handleChartClick, length:', oldBlock.length);
a = a.substring(0, idx1) + newHandler + a.substring(endSearch);

// 2. Replace renderDetailExercisesTable with enhanced version
const oldRender = a.indexOf('function renderDetailExercisesTable');
if (oldRender === -1) { console.log('renderDetailExercisesTable NOT FOUND'); process.exit(1); }
const endRender = a.indexOf('\nfunction closeLecturerExercisesModal', oldRender);
const oldRenderBlock = a.substring(oldRender, endRender);
console.log('Replacing renderDetailExercisesTable, length:', oldRenderBlock.length);

const newRender = `function renderDetailExercisesTable(query = '') {
  const tbody = document.getElementById('gv-detail-exercises-tbody');
  tbody.innerHTML = '';
  const filtered = currentDetailExercises.filter(ex =>
    (ex.TenBaiTap||'').toLowerCase().includes(query) ||
    (ex.MaBaiTap||'').toLowerCase().includes(query) ||
    (ex.TenMon||'').toLowerCase().includes(query)
  );
  const lvlColors = {1:'#10b981',2:'#06b6d4',3:'#f59e0b',4:'#f97316',5:'#8b5cf6'};
  const lvlNames = {1:'Lắp ghép cú pháp',2:'Luồng rẽ nhánh',3:'Vòng lặp & Mảng',4:'Hàm & Cấu trúc',5:'Tư duy giải thuật'};
  const diffColors = {'Dễ':['#dcfce7','#166534'],'Trung bình':['#fef9c3','#854d0e'],'Khó':['#fee2e2','#991b1b']};
  filtered.forEach(ex => {
    const row = document.createElement('tr');
    row.style.cssText = 'transition:background 0.15s;cursor:default;border-bottom:1px solid var(--border-color,#e2e8f0);';
    row.onmouseenter = () => row.style.background = '#f8fafc';
    row.onmouseleave = () => row.style.background = '';
    const lvl = ex.SkillLevel || 1;
    const col = lvlColors[lvl] || '#94a3b8';
    const dc = diffColors[ex.TenDoKho] || ['#f1f5f9','#475569'];
    const fmt = ex.UpdatedAt ? new Date(ex.UpdatedAt).toLocaleDateString('vi-VN') : '—';
    row.innerHTML = \`
      <td style="padding:12px 14px;font-family:monospace;font-size:13px;color:#6366f1;font-weight:600;">\${ex.MaBaiTap}</td>
      <td style="padding:12px 14px;">
        <div style="font-weight:600;color:var(--text-main);margin-bottom:2px;">\${ex.TenBaiTap}</div>
        <div style="font-size:12px;color:var(--text-muted);">\${ex.TenMon||'—'}</div>
      </td>
      <td style="padding:12px 14px;">
        <span style="background:\${dc[0]};color:\${dc[1]};padding:3px 10px;border-radius:20px;font-size:12px;font-weight:600;">\${ex.TenDoKho||'—'}</span>
      </td>
      <td style="padding:12px 14px;text-align:center;">
        <span title="\${lvlNames[lvl]||''}" style="display:inline-flex;align-items:center;justify-content:center;width:30px;height:30px;border-radius:8px;background:\${col}20;color:\${col};font-size:13px;font-weight:800;border:1px solid \${col}44;">L\${lvl}</span>
      </td>
      <td style="padding:12px 14px;font-size:13px;color:var(--text-muted);">\${ex.TenGiangVien||ex.MaGiangVien||'—'}</td>
      <td style="padding:12px 14px;font-size:12px;color:var(--text-muted);">\${fmt}</td>
    \`;
    tbody.appendChild(row);
  });
  if (filtered.length === 0) tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;padding:30px;color:var(--text-muted);">Không tìm thấy bài tập nào</td></tr>';
}
`;

a = a.substring(0, oldRender) + newRender + a.substring(endRender);

fs.writeFileSync('public/admin.js', a, 'utf8');
console.log('✅ Chart click handler + detail table upgraded!');
