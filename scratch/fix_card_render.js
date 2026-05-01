const fs = require('fs');
let a = fs.readFileSync('public/app.js', 'utf8');

// Find the toShow.forEach block that renders exercise cards
const startMarker = 'toShow.forEach(ex => {';
const endMarker = 'grid.appendChild(cardEl);\r\n    });';
const endMarker2 = 'grid.appendChild(cardEl);\n    });';

const startIdx = a.indexOf(startMarker);
let endIdx = a.indexOf(endMarker, startIdx);
let endLen = endMarker.length;
if (endIdx === -1) { endIdx = a.indexOf(endMarker2, startIdx); endLen = endMarker2.length; }

console.log('Start:', startIdx, 'End:', endIdx);
if (startIdx === -1 || endIdx === -1) {
  console.log('Searching alt...');
  // Show what's around there
  const area = a.substring(startIdx, startIdx + 100);
  console.log('After start:', JSON.stringify(area));
  process.exit(1);
}

const newBlock = `toShow.forEach(ex => {
      const cardEl = document.createElement('div');
      cardEl.className = 'exercise-card';

      const diffLabel = normalizeDifficultyLabel(ex.difficulty) || ex.difficulty || '';
      const diffClass = diffLabel === 'Khó' ? 'badge-hard' : (diffLabel === 'Trung bình' ? 'badge-medium' : 'badge-easy');
      const lvl = ex.level || 1;
      const reqCount = (ex.requirements || []).length;
      const critCount = (ex.grading_criteria || []).length;
      let totalPts = 0;
      try { if (Array.isArray(ex.grading_criteria)) totalPts = ex.grading_criteria.reduce((s,g) => s + (g&&typeof g.points==='number'?g.points:0), 0); } catch(e){}
      const fmtText = ex.submission_format || '';
      const escH = s => String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

      cardEl.innerHTML = \`
        <div class="exercise-title">\${escH(ex.title||'')}</div>
        <div class="exercise-meta-line">
          <span class="meta-badge" style="background:#e0f2fe;color:#0369a1;font-family:monospace;font-size:11px">\${escH(ex.id||'')}</span>
          <span class="meta-badge" style="background:#ede9fe;color:#7c3aed;font-size:11px">ID: \${ex.numeric_id||ex.pk||''}</span>
          <span class="meta-badge \${diffClass}" style="font-size:11px">\${escH(diffLabel)}</span>
          <span class="meta-badge badge-level badge-l\${lvl}" style="font-size:11px">Lv.\${lvl}</span>
          \${fmtText ? '<span class="meta-badge badge-format" style="font-size:11px">' + escH(fmtText) + '</span>' : ''}
        </div>
        <div class="exercise-desc">\${escH(ex.description ? (ex.description.length > 120 ? ex.description.substring(0,120)+'...' : ex.description) : '')}</div>
        <div class="exercise-footer">
          <div class="counts">
            <span>📄 \${reqCount} yêu cầu</span>
            <span>⚖️ \${critCount} tiêu chí</span>
            \${totalPts > 0 ? '<span>🎯 ' + totalPts + ' điểm</span>' : ''}
          </div>
          <span style="font-weight:600;color:var(--text-muted,#64748b);font-size:12px">\${escH(ex.lecturer_name||ex.owner||'')}</span>
        </div>\`;

      cardEl.onclick = () => showExercise(ex, form);
      grid.appendChild(cardEl);
    });`;

a = a.substring(0, startIdx) + newBlock + a.substring(endIdx + endLen);
fs.writeFileSync('public/app.js', a, 'utf8');
console.log('✅ Exercise card rendering upgraded!');
