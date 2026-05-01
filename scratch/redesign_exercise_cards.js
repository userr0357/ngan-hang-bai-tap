const fs = require('fs');
let h = fs.readFileSync('public/lecturer.html', 'utf8');

// ═══ 1. Replace exercise-item CSS with professional card design ═══
const oldCSS = `    /* ── Exercise item ── */
    .exercise-item { display: flex; justify-content: space-between; align-items: flex-start; padding: 12px 14px; border: 1px solid var(--border-color,#e2e8f0); border-radius: 10px; margin: 8px 0; background: var(--bg-color,#f8fafc); transition: box-shadow .15s; }
    .exercise-item:hover { box-shadow: 0 4px 12px rgba(99,102,241,.1); background: #fff; }
    .exercise-left { flex: 1; min-width: 0; }
    .exercise-title { font-weight: 600; color: #2563eb; cursor: pointer; font-size: 15px; margin-bottom: 4px; }
    .exercise-title:hover { text-decoration: underline; }
    .exercise-badge { display: inline-block; font-size: 11px; padding: 2px 8px; border-radius: 20px; margin-left: 8px; font-weight: 700; }
    .badge.easy { background: #dcfce7; color: #166534; }
    .badge.medium { background: #fef9c3; color: #854d0e; }
    .badge.hard { background: #fee2e2; color: #991b1b; }
    .small-muted { font-size: 12px; color: var(--text-muted,#64748b); margin-top: 4px; }
    .exercise-controls { display: flex; gap: 6px; flex-shrink: 0; margin-left: 12px; }
    .btn-edit { padding: 6px 12px; background: #2563eb; color: #fff; border: none; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer; }
    .btn-edit:hover { background: #1d4ed8; }
    .btn-delete { padding: 6px 12px; background: #dc2626; color: #fff; border: none; border-radius: 7px; font-size: 12px; font-weight: 600; cursor: pointer; }
    .btn-delete:hover { background: #b91c1c; }`;

const newCSS = `    /* ── Exercise Card (Professional) ── */
    .ex-card {
      border: 1px solid var(--border-color,#e2e8f0); border-radius: 14px;
      margin-bottom: 12px; background: var(--card-bg,#fff); overflow: hidden;
      transition: all .2s ease; position: relative;
    }
    .ex-card:hover {
      box-shadow: 0 8px 24px rgba(99,102,241,.12);
      border-color: #c7d2fe;
      transform: translateY(-1px);
    }
    .ex-card-top {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 16px 18px 10px; gap: 12px;
    }
    .ex-card-title {
      font-size: 15px; font-weight: 700; color: var(--text-main,#1e293b);
      cursor: pointer; line-height: 1.4; transition: color .15s;
    }
    .ex-card-title:hover { color: #6366f1; }
    .ex-card-badges {
      display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px;
    }
    .ex-badge {
      display: inline-flex; align-items: center; gap: 3px;
      font-size: 11px; font-weight: 700; padding: 3px 9px; border-radius: 6px;
      white-space: nowrap;
    }
    .ex-badge-easy { background: #dcfce7; color: #166534; }
    .ex-badge-medium { background: #fef9c3; color: #854d0e; }
    .ex-badge-hard { background: #fee2e2; color: #991b1b; }
    .ex-badge-level { background: #ede9fe; color: #7c3aed; }
    .ex-badge-id { background: #e0f2fe; color: #0369a1; font-family: monospace; }
    .ex-card-desc {
      font-size: 13px; color: var(--text-muted,#64748b); line-height: 1.5;
      padding: 0 18px 10px; display: -webkit-box; -webkit-line-clamp: 2;
      -webkit-box-orient: vertical; overflow: hidden;
    }
    .ex-card-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 18px; border-top: 1px solid var(--border-color,#e2e8f0);
      background: var(--bg-color,#f8fafc);
    }
    .ex-card-stats {
      display: flex; gap: 14px; font-size: 12px; color: var(--text-muted,#64748b);
    }
    .ex-card-stats span { display: flex; align-items: center; gap: 4px; }
    .ex-card-actions { display: flex; gap: 6px; }
    .ex-btn {
      display: inline-flex; align-items: center; gap: 4px;
      padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700;
      cursor: pointer; border: none; transition: all .15s;
    }
    .ex-btn-view { background: var(--card-bg,#fff); border: 1.5px solid var(--border-color,#e2e8f0) !important; color: var(--text-main,#374151); }
    .ex-btn-view:hover { border-color: #6366f1 !important; color: #6366f1; background: #eef2ff; }
    .ex-btn-edit { background: linear-gradient(135deg,#6366f1,#818cf8); color: #fff; box-shadow: 0 2px 6px rgba(99,102,241,.25); }
    .ex-btn-edit:hover { background: linear-gradient(135deg,#4f46e5,#6366f1); transform: translateY(-1px); }
    .ex-btn-delete { background: linear-gradient(135deg,#ef4444,#f87171); color: #fff; box-shadow: 0 2px 6px rgba(239,68,68,.25); }
    .ex-btn-delete:hover { background: linear-gradient(135deg,#dc2626,#ef4444); transform: translateY(-1px); }
    .ex-btn-feedback { background: #fef3c7; color: #92400e; border: 1px solid #fde68a !important; }
    .ex-btn-feedback:hover { background: #fde68a; }
    .ex-card-points {
      font-size: 14px; font-weight: 800; color: #6366f1;
      background: #eef2ff; padding: 4px 12px; border-radius: 8px;
      white-space: nowrap;
    }
    .exercise-title { font-weight: 600; color: #2563eb; cursor: pointer; font-size: 15px; }
    .exercise-title:hover { text-decoration: underline; }
    .badge.easy { background: #dcfce7; color: #166534; }
    .badge.medium { background: #fef9c3; color: #854d0e; }
    .badge.hard { background: #fee2e2; color: #991b1b; }
    .small-muted { font-size: 12px; color: var(--text-muted,#64748b); margin-top: 4px; }

    /* Dark mode exercise cards */
    body.dark-mode .ex-card { background: #1e293b; border-color: #334155; }
    body.dark-mode .ex-card:hover { box-shadow: 0 8px 24px rgba(99,102,241,.15); border-color: #6366f1; }
    body.dark-mode .ex-card-footer { background: #0f172a; border-color: #334155; }
    body.dark-mode .ex-card-points { background: rgba(99,102,241,.15); }`;

if (h.includes(oldCSS)) {
  h = h.replace(oldCSS, newCSS);
  console.log('✅ CSS replaced');
} else {
  console.log('❌ Old CSS not found exactly, trying partial...');
  const partialOld = '/* ── Exercise item ── */';
  const partialEnd = '.btn-delete:hover { background: #b91c1c; }';
  const pStart = h.indexOf(partialOld);
  const pEnd = h.indexOf(partialEnd);
  if (pStart > -1 && pEnd > -1) {
    h = h.substring(0, pStart) + newCSS + h.substring(pEnd + partialEnd.length);
    console.log('✅ CSS replaced (partial match)');
  }
}

// Remove old dark-mode exercise-item rules
h = h.replace('body.dark-mode .exercise-item { background: #1e293b; border-color: #334155; }', '');
h = h.replace('body.dark-mode .exercise-item:hover { background: #253350; }', '');

fs.writeFileSync('public/lecturer.html', h, 'utf8');

// ═══ 2. Replace the exercise card HTML template in renderManageList ═══
// Find the old card creation code and replace with new professional card
const cardStart = "card.style.cssText = 'border:1px solid var(--border-color,#e2e8f0);border-radius:10px;padding:14px;margin-bottom:10px;background:var(--bg-color,#f8fafc);transition:box-shadow .15s,background .15s;cursor:default';";
const cardStartIdx = h.indexOf(cardStart);

if (cardStartIdx > -1) {
  console.log('Found old card style at:', cardStartIdx);
  
  // Find the card.innerHTML start
  const innerHTMLStart = h.indexOf("card.innerHTML = `", cardStartIdx);
  // Find the matching closing backtick  
  let depth = 0;
  let innerHTMLEnd = -1;
  for (let i = innerHTMLStart + 17; i < h.length; i++) {
    if (h[i] === '`' && h[i-1] !== '\\') {
      innerHTMLEnd = i + 1;
      break;
    }
  }
  
  if (innerHTMLEnd > -1) {
    // Replace card styling + hover + innerHTML
    const hoverStart = h.indexOf('card.onmouseenter', cardStartIdx);
    const oldBlock = h.substring(cardStartIdx, innerHTMLEnd);
    
    const newBlock = `card.className = 'ex-card';

            card.innerHTML = \`
              <div class="ex-card-top">
                <div style="flex:1;min-width:0">
                  <div class="ex-card-title" onclick="showExerciseModal(\${JSON.stringify(ex).replace(/"/g,'&quot;')}, \${JSON.stringify(f).replace(/"/g,'&quot;')}, \${JSON.stringify(s).replace(/"/g,'&quot;')})">\${escH(ex.title)}</div>
                  <div class="ex-card-badges">
                    <span class="ex-badge ex-badge-id">ID \${escH(ex.id||'---')}</span>
                    <span class="ex-badge ex-badge-\${diff==='Khó'?'hard':(diff==='Trung bình'?'medium':'easy')}">\${escH(diff)}</span>
                    \${levelNum ? \`<span class="ex-badge ex-badge-level">Lv.\${levelNum}</span>\` : ''}
                    \${ex.submission_format ? \`<span class="ex-badge" style="background:#f0fdf4;color:#15803d">📎 \${escH(ex.submission_format)}</span>\` : ''}
                  </div>
                </div>
                <div class="ex-card-points">\${totalPts} điểm</div>
              </div>
              \${descSnippet ? \`<div class="ex-card-desc">\${escH(descSnippet)}\${ex.description&&ex.description.length>120?'...':''}</div>\` : ''}
              <div class="ex-card-footer">
                <div class="ex-card-stats">
                  <span>📋 \${reqCount} yêu cầu</span>
                  <span>⚖️ \${critCount} tiêu chí</span>
                  <span>👤 \${escH(ex.lecturer_name||ex.owner||'Hệ thống')}</span>
                </div>
                <div class="ex-card-actions">
                  \${isOwner ? \`
                    <button class="ex-btn ex-btn-edit" onclick="editExercise(\${JSON.stringify(ex).replace(/"/g,'&quot;')},\${JSON.stringify(f).replace(/"/g,'&quot;')},\${JSON.stringify(s).replace(/"/g,'&quot;')})">✏️ Sửa</button>
                    <button class="ex-btn ex-btn-delete" onclick="deleteExercise('\${escH(ex.id)}','\${escH(s.subject_id)}')">🗑️ Xóa</button>
                  \` : \`
                    <button class="ex-btn ex-btn-view" onclick="showExerciseModal(\${JSON.stringify(ex).replace(/"/g,'&quot;')},\${JSON.stringify(f).replace(/"/g,'&quot;')},\${JSON.stringify(s).replace(/"/g,'&quot;')})">👁️ Xem</button>
                    <button class="ex-btn ex-btn-feedback" onclick="openFeedbackModal(\${JSON.stringify(ex).replace(/"/g,'&quot;')},\${JSON.stringify(f).replace(/"/g,'&quot;')},\${JSON.stringify(s).replace(/"/g,'&quot;')})">💬 Góp ý</button>
                  \`}
                </div>
              </div>\``;

    h = h.substring(0, cardStartIdx) + newBlock + h.substring(innerHTMLEnd);
    console.log('✅ Card HTML template replaced');
  }
}

// Also remove the old hover handlers if they still exist after our card replacement
h = h.replace(/card\.onmouseenter\s*=\s*\(\)\s*=>\s*\{[^}]*\};\s*\n?\s*card\.onmouseleave\s*=\s*\(\)\s*=>\s*\{[^}]*\};\s*/g, '');

fs.writeFileSync('public/lecturer.html', h, 'utf8');
console.log('✅ All done!');
