const fs = require('fs');
let a = fs.readFileSync('public/app.js', 'utf8');

// ═══ 1. Replace showExercise modal rendering ═══
const oldModalStart = `d.innerHTML = \`\r\n    <button class="close-ex" id="exercise-close-btn">×</button>`;
const oldModalEnd = `  \`;\r\n  // ensure overlay exists`;

const startIdx = a.indexOf(oldModalStart);
let endIdx = a.indexOf(oldModalEnd, startIdx);

if (startIdx === -1) {
  // try LF
  const altStart = `d.innerHTML = \`\n    <button class="close-ex" id="exercise-close-btn">×</button>`;
  const sIdx = a.indexOf(altStart);
  if (sIdx > -1) {
    endIdx = a.indexOf('  `;\n  // ensure overlay exists', sIdx);
    if (endIdx > -1) {
      const endLen = '  `;'.length;
      const newModal = buildNewModal();
      a = a.substring(0, sIdx) + newModal + a.substring(endIdx + endLen);
      console.log('✅ Modal replaced (LF)');
    }
  } else {
    console.log('❌ Could not find modal start');
  }
} else {
  const endLen = '  `;'.length;
  const newModal = buildNewModal();
  a = a.substring(0, startIdx) + newModal + '\r\n' + a.substring(endIdx + endLen);
  console.log('✅ Modal replaced (CRLF)');
}

function buildNewModal() {
  return `d.innerHTML = \`
    <div class="detail-header">
      <button class="close-ex" id="exercise-close-btn">&times;</button>
      <h2>\${escapeHtml(ex.title)}</h2>
      <div class="detail-sub">\${escapeHtml((parentForm && parentForm.name) ? parentForm.name : '')} · \${escapeHtml(ex.submission_format || '')}</div>
    </div>
    <div class="detail-meta-grid">
      <div class="detail-meta-card" style="background:linear-gradient(135deg,#e0f2fe,#bae6fd)">
        <div class="dmc-label" style="color:#0369a1">Mã bài tập</div>
        <div class="dmc-value" style="color:#0369a1;font-family:monospace">\${escapeHtml(ex.id || '')}</div>
      </div>
      <div class="detail-meta-card" style="background:linear-gradient(135deg,#ede9fe,#ddd6fe)">
        <div class="dmc-label" style="color:#7c3aed">ID hệ thống</div>
        <div class="dmc-value" style="color:#7c3aed">#\${ex.numeric_id||ex.pk||''}</div>
      </div>
      <div class="detail-meta-card" style="background:\${diffLabel==='Khó'?'linear-gradient(135deg,#fee2e2,#fecaca)':(diffLabel==='Trung bình'?'linear-gradient(135deg,#fef9c3,#fde68a)':'linear-gradient(135deg,#dcfce7,#bbf7d0)')}">
        <div class="dmc-label" style="color:\${diffLabel==='Khó'?'#991b1b':(diffLabel==='Trung bình'?'#854d0e':'#166534')}">Độ khó</div>
        <div class="dmc-value" style="color:\${diffLabel==='Khó'?'#991b1b':(diffLabel==='Trung bình'?'#854d0e':'#166534')}">\${escapeHtml(diffLabel || ex.difficulty || '')}</div>
      </div>
      <div class="detail-meta-card" style="background:linear-gradient(135deg,#fdf4ff,#f5d0fe)">
        <div class="dmc-label" style="color:#86198f">Level</div>
        <div class="dmc-value" style="color:#86198f">Lv.\${ex.level||1}</div>
      </div>
      <div class="detail-meta-card" style="background:linear-gradient(135deg,#fff7ed,#fed7aa)">
        <div class="dmc-label" style="color:#c2410c">Dạng bài</div>
        <div class="dmc-value" style="color:#c2410c">\${escapeHtml((parentForm && parentForm.name) || '')}</div>
      </div>
      <div class="detail-meta-card" style="background:linear-gradient(135deg,#f0fdfa,#99f6e4)">
        <div class="dmc-label" style="color:#0d9488">Định dạng nộp</div>
        <div class="dmc-value" style="color:#0d9488">\${escapeHtml(ex.submission_format || '(Không có)')}</div>
      </div>
    </div>
    <div class="section"><h3>📝 Mô tả</h3><div class="desc-content">\${safeHtml}</div></div>
    <div class="section"><h3>📋 Yêu cầu (\${(ex.requirements||[]).length})</h3><ol>\${(ex.requirements||[]).map(r => \`<li>\${escapeHtml(r)}</li>\`).join('')}</ol></div>
    <div class="section"><h3>⚖️ Tiêu chí chấm (\${(finalCriteria||[]).length})</h3>\${renderGradingHtml(finalCriteria)}</div>
    <div class="section" style="border-bottom:none;padding-bottom:20px"><h3>📎 File đính kèm</h3><div style="color:var(--text-muted);font-size:14px">\${escapeHtml(attached)}</div></div>
  \``;
}

// ═══ 2. Replace stat cards HTML in renderSubject ═══
const oldStatCards = a.match(/summaryEl\.innerHTML = `\s*\n\s*<div class="stat-card".*?`;/s);
if (oldStatCards) {
  const newStatCards = `summaryEl.innerHTML = \`
            <div class="stat-card" style="background:linear-gradient(135deg,#6366f1,#818cf8)"><div class="stat-label">Tổng bài</div><div class="stat-value">\${totals.total}</div></div>
            <div class="stat-card" style="background:linear-gradient(135deg,#10b981,#34d399)"><div class="stat-label">Dễ</div><div class="stat-value">\${totals.easy}</div></div>
            <div class="stat-card" style="background:linear-gradient(135deg,#f59e0b,#fbbf24)"><div class="stat-label">Trung bình</div><div class="stat-value">\${totals.medium}</div></div>
            <div class="stat-card" style="background:linear-gradient(135deg,#ef4444,#f87171)"><div class="stat-label">Khó</div><div class="stat-value">\${totals.hard}</div></div>\`;`;
  a = a.replace(oldStatCards[0], newStatCards);
  console.log('✅ Stat cards upgraded');
} else {
  console.log('⚠️ Stat cards pattern not found, trying manual...');
  // Try to find and replace by substring
  const marker = 'font-size:28px;font-weight:800">${totals.total}';
  const mIdx = a.indexOf(marker);
  if (mIdx > -1) {
    // Find start of innerHTML assignment
    const startStr = a.lastIndexOf('summaryEl.innerHTML', mIdx);
    const endStr = a.indexOf('`;', mIdx) + 2;
    const newStatCards = `summaryEl.innerHTML = \`
            <div class="stat-card" style="background:linear-gradient(135deg,#6366f1,#818cf8)"><div class="stat-label">Tổng bài</div><div class="stat-value">\${totals.total}</div></div>
            <div class="stat-card" style="background:linear-gradient(135deg,#10b981,#34d399)"><div class="stat-label">Dễ</div><div class="stat-value">\${totals.easy}</div></div>
            <div class="stat-card" style="background:linear-gradient(135deg,#f59e0b,#fbbf24)"><div class="stat-label">Trung bình</div><div class="stat-value">\${totals.medium}</div></div>
            <div class="stat-card" style="background:linear-gradient(135deg,#ef4444,#f87171)"><div class="stat-label">Khó</div><div class="stat-value">\${totals.hard}</div></div>\``;
    a = a.substring(0, startStr) + newStatCards + a.substring(endStr);
    console.log('✅ Stat cards upgraded (manual)');
  }
}

fs.writeFileSync('public/app.js', a, 'utf8');
console.log('✅ app.js modal + stats updated!');
