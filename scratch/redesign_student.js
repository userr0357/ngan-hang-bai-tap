const fs = require('fs');

// ═══ 1. Redesign index.html ═══
const newIndex = `<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Ngân hàng Bài tập</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <style>
    body { font-family: 'Inter', sans-serif; }
    /* Dark mode */
    body.dark-mode { --bg-main:#0f172a; --bg-sidebar:#1e293b; --bg-card:#1e293b; --border:#334155; --text-main:#e2e8f0; --text-muted:#94a3b8; --text-heading:#f1f5f9; }
    body:not(.dark-mode) { --bg-main:#f8fafc; --bg-sidebar:#fff; --bg-card:#fff; --border:#e2e8f0; --text-main:#1e293b; --text-muted:#64748b; --text-heading:#0f172a; }
    #app { display:flex; min-height:100vh; background:var(--bg-main); }
    .sidebar { width:260px; background:var(--bg-sidebar); border-right:1px solid var(--border); padding:20px 16px; overflow-y:auto; flex-shrink:0; }
    .sidebar .brand { font-size:18px; font-weight:800; color:#6366f1; margin-bottom:20px; padding:0 8px; }
    #subject-list { list-style:none; padding:0; margin:0; }
    #subject-list li { padding:10px 14px; border-radius:10px; cursor:pointer; font-size:14px; font-weight:500; color:var(--text-main); margin-bottom:4px; transition:all .15s; }
    #subject-list li:hover { background:#6366f120; }
    #subject-list li.active { background:linear-gradient(135deg,#6366f1,#818cf8); color:#fff; font-weight:700; }
    .main { flex:1; padding:24px 32px; overflow-y:auto; }
    #main-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:8px; }
    #subject-title { font-size:24px; font-weight:800; color:var(--text-heading); margin:0; }
    #header-controls { display:flex; gap:8px; align-items:center; flex-wrap:wrap; }
    #header-controls input, #header-controls select {
      padding:9px 14px; border:1.5px solid var(--border); border-radius:10px; font-size:13px;
      font-family:inherit; background:var(--bg-card); color:var(--text-main); outline:none;
    }
    #header-controls input { min-width:220px; }
    #theme-toggle { width:38px; height:38px; border-radius:10px; border:1.5px solid var(--border); background:var(--bg-card); color:var(--text-main); font-size:18px; cursor:pointer; }
    .subject-summary { display:flex; gap:12px; margin-bottom:20px; flex-wrap:wrap; }
    .stat-card { flex:1; min-width:120px; border-radius:12px; padding:14px 16px; color:#fff; }
    .form-card { background:var(--bg-card); border:1px solid var(--border); border-radius:14px; margin-bottom:20px; overflow:hidden; }
    .form-card h3 { margin:0; padding:16px 20px; font-size:15px; font-weight:700; color:var(--text-heading); border-bottom:1px solid var(--border); background:var(--bg-main); }
    .exercise-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(320px,1fr)); gap:14px; padding:16px 20px; }
    .exercise-card {
      background:var(--bg-card); border:1px solid var(--border); border-radius:12px; padding:16px; cursor:pointer;
      transition:all .2s; position:relative; overflow:hidden;
    }
    .exercise-card:hover { border-color:#6366f1; box-shadow:0 4px 16px rgba(99,102,241,.15); transform:translateY(-2px); }
    .exercise-title { font-size:15px; font-weight:700; color:var(--text-heading); line-height:1.4; margin-bottom:6px; }
    .exercise-meta-line { display:flex; gap:6px; flex-wrap:wrap; margin-bottom:8px; }
    .meta-badge { font-size:11px; font-weight:600; padding:3px 8px; border-radius:6px; }
    .exercise-desc { font-size:13px; color:var(--text-muted); line-height:1.5; margin-bottom:10px; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; }
    .exercise-footer { display:flex; justify-content:space-between; align-items:center; font-size:12px; color:var(--text-muted); }
    .exercise-footer .counts { display:flex; gap:10px; }
    .badge-easy { background:#dcfce7; color:#166534; }
    .badge-medium { background:#fef9c3; color:#854d0e; }
    .badge-hard { background:#fee2e2; color:#991b1b; }
    .badge-level { border:1px solid; font-weight:800; }
    .badge-l1 { background:#10b98120; color:#10b981; border-color:#10b98144; }
    .badge-l2 { background:#06b6d420; color:#06b6d4; border-color:#06b6d444; }
    .badge-l3 { background:#f59e0b20; color:#f59e0b; border-color:#f59e0b44; }
    .badge-l4 { background:#f9731620; color:#f97316; border-color:#f9731644; }
    .badge-l5 { background:#8b5cf620; color:#8b5cf6; border-color:#8b5cf644; }
    .badge-format { background:#ede9fe; color:#7c3aed; }
    /* Detail panel overlay */
    #exercise-overlay { display:none; position:fixed; inset:0; background:rgba(0,0,0,.5); z-index:1098; backdrop-filter:blur(4px); }
    #exercise-overlay.show { display:block; }
    #exercise-detail { position:fixed; top:50%; left:50%; transform:translate(-50%,-50%) scale(.95); opacity:0; z-index:1099; width:680px; max-width:95vw; max-height:90vh; overflow-y:auto; background:var(--bg-card); border-radius:16px; border:1px solid var(--border); box-shadow:0 20px 60px rgba(0,0,0,.3); transition:all .2s; }
    #exercise-detail.open { transform:translate(-50%,-50%) scale(1); opacity:1; }
    #exercise-detail.hidden { display:none; }
    #exercise-detail .close-ex { position:absolute; top:12px; right:12px; background:none; border:none; font-size:24px; cursor:pointer; color:var(--text-muted); width:36px; height:36px; border-radius:8px; display:flex; align-items:center; justify-content:center; }
    #exercise-detail .close-ex:hover { background:var(--border); }
    #exercise-detail h2 { margin:0; padding:20px 24px 0; font-size:20px; font-weight:800; color:var(--text-heading); }
    #exercise-detail .meta-row { display:flex; flex-wrap:wrap; gap:8px; padding:12px 24px; }
    #exercise-detail .meta-item { font-size:13px; color:var(--text-muted); }
    #exercise-detail .meta-item strong { color:var(--text-main); }
    #exercise-detail .section { padding:12px 24px; border-top:1px solid var(--border); }
    #exercise-detail .section h3 { font-size:15px; font-weight:700; margin:0 0 8px; color:var(--text-heading); }
    #exercise-detail .section ul, #exercise-detail .section ol { margin:0; padding-left:20px; }
    #exercise-detail .section li { font-size:14px; line-height:1.6; color:var(--text-main); margin-bottom:4px; }
    .accent { padding:8px 16px; background:#6366f1; color:#fff; border:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; }
    .accent:hover { background:#4f46e5; }
  </style>
</head>
<body>
  <div id="app">
    <aside class="sidebar">
      <div class="brand">📚 Ngân hàng Bài tập</div>
      <ul id="subject-list"></ul>
    </aside>
    <main class="main">
      <div id="main-header">
        <h1 id="subject-title">Chọn môn học</h1>
        <div id="header-controls">
          <input id="search-input" placeholder="🔍 Tìm bài tập..." />
          <select id="difficulty-filter" title="Lọc theo độ khó">
            <option value="all">Tất cả độ khó</option>
            <option value="easy">Dễ</option>
            <option value="medium">Trung bình</option>
            <option value="hard">Khó</option>
          </select>
          <select id="level-filter" title="Lọc theo level">
            <option value="all">Tất cả level</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
            <option value="5">Level 5</option>
          </select>
          <button id="theme-toggle" title="Chuyển dark/light mode">◐</button>
        </div>
      </div>

      <div id="subject-desc" style="margin-bottom:4px;color:var(--text-muted);font-size:14px"></div>
      <div id="subject-summary" class="subject-summary"></div>

      <div id="forms-container"></div>
      <div id="pagination-control"></div>

      <div id="exercise-detail" class="hidden"></div>
    </main>
  </div>

  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/dompurify@2.4.0/dist/purify.min.js"></script>
  <script src="/app.js"></script>
</body>
</html>`;

fs.writeFileSync('public/index.html', newIndex, 'utf8');
console.log('✅ index.html redesigned!');

// ═══ 2. Update app.js exercise card rendering ═══
let a = fs.readFileSync('public/app.js', 'utf8');

// 2a. Update summary rendering with stat cards
const oldSummary = `summaryEl.innerHTML = \`<div class="summary-item"><span class="key">Tổng bài:</span> \${totals.total}</div><div class="summary-item"><span class="key">Dễ:</span> \${totals.easy}</div><div class="summary-item"><span class="key">TB:</span> \${totals.medium}</div><div class="summary-item"><span class="key">Khó:</span> \${totals.hard}</div>\`;`;
const newSummary = `// count levels
          const lvlCounts = {};
          allExercises.forEach(ex => { const l = ex.level||1; lvlCounts[l]=(lvlCounts[l]||0)+1; });
          summaryEl.innerHTML = \`
            <div class="stat-card" style="background:linear-gradient(135deg,#6366f1,#818cf8)"><div style="font-size:11px;font-weight:600;opacity:.8">Tổng bài</div><div style="font-size:28px;font-weight:800">\${totals.total}</div></div>
            <div class="stat-card" style="background:linear-gradient(135deg,#10b981,#34d399)"><div style="font-size:11px;font-weight:600;opacity:.8">Dễ</div><div style="font-size:28px;font-weight:800">\${totals.easy}</div></div>
            <div class="stat-card" style="background:linear-gradient(135deg,#f59e0b,#fbbf24)"><div style="font-size:11px;font-weight:600;opacity:.8">TB</div><div style="font-size:28px;font-weight:800">\${totals.medium}</div></div>
            <div class="stat-card" style="background:linear-gradient(135deg,#ef4444,#f87171)"><div style="font-size:11px;font-weight:600;opacity:.8">Khó</div><div style="font-size:28px;font-weight:800">\${totals.hard}</div></div>\`;`;

if (a.includes(oldSummary)) {
  a = a.replace(oldSummary, newSummary);
  console.log('✅ Summary stat cards updated');
}

// 2b. Add level filter to filter logic
const oldFilter = `if (state.difficultyFilter && state.difficultyFilter !== 'all') {`;
const newFilter = `// level filter
      if (state.levelFilter && state.levelFilter !== 'all') {
        if (String(ex.level||1) !== state.levelFilter) return false;
      }
      if (state.difficultyFilter && state.difficultyFilter !== 'all') {`;
if (a.includes(oldFilter) && !a.includes('levelFilter')) {
  a = a.replace(oldFilter, newFilter);
  console.log('✅ Level filter logic added');
}

// 2c. Replace exercise card rendering (lines 233-292) with enhanced version
const oldCardStart = `toShow.forEach(ex => {
      const cardEl = document.createElement('div');
      cardEl.className = 'exercise-card';
      const title = document.createElement('div');
      title.className = 'exercise-title';
      title.textContent = ex.title;`;

const oldCardEnd = `cardEl.onclick = () => showExercise(ex, form);
      grid.appendChild(cardEl);
    });`;

const startCard = a.indexOf(oldCardStart);
const endCard = a.indexOf(oldCardEnd);

if (startCard > -1 && endCard > -1) {
  const newCardBlock = `toShow.forEach(ex => {
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

      cardEl.innerHTML = \`
        <div class="exercise-title">\${ex.title||''}</div>
        <div class="exercise-meta-line">
          <span class="meta-badge" style="background:#e0f2fe;color:#0369a1;font-family:monospace">\${ex.id||''}</span>
          <span class="meta-badge" style="background:#ede9fe;color:#7c3aed">ID: \${ex.numeric_id||ex.pk||''}</span>
          <span class="meta-badge \${diffClass}">\${diffLabel}</span>
          <span class="meta-badge badge-level badge-l\${lvl}">Lv.\${lvl}</span>
          \${fmtText ? '<span class="meta-badge badge-format">' + fmtText + '</span>' : ''}
        </div>
        <div class="exercise-desc">\${ex.description ? (ex.description.length > 120 ? ex.description.substring(0,120)+'...' : ex.description) : ''}</div>
        <div class="exercise-footer">
          <div class="counts">
            <span>📄 \${reqCount} yêu cầu</span>
            <span>⚖️ \${critCount} tiêu chí</span>
            \${totalPts > 0 ? '<span>🎯 ' + totalPts + ' điểm</span>' : ''}
          </div>
          <span style="font-weight:600;color:var(--text-muted);font-size:12px">\${ex.lecturer_name||ex.owner||''}</span>
        </div>\`;

      cardEl.onclick = () => showExercise(ex, form);
      grid.appendChild(cardEl);
    });`;

  a = a.substring(0, startCard) + newCardBlock + a.substring(endCard + oldCardEnd.length);
  console.log('✅ Exercise card rendering upgraded');
}

// 2d. Update showExercise detail panel to include level, numeric ID
const oldDetailMeta = `<div class="meta-item"><strong>ID:</strong> \${escapeHtml(ex.id || '')}</div>`;
const newDetailMeta = `<div class="meta-item"><strong>Mã:</strong> \${escapeHtml(ex.id || '')}</div>
      <div class="meta-item"><strong>ID:</strong> #\${escapeHtml(String(ex.numeric_id||ex.pk||''))}</div>
      <div class="meta-item"><strong>Level:</strong> <span style="font-weight:700;color:#6366f1">Lv.\${ex.level||1}</span></div>`;
if (a.includes(oldDetailMeta)) {
  a = a.replace(oldDetailMeta, newDetailMeta);
  console.log('✅ Detail panel ID + level added');
}

// 2e. Add level filter event listener
const oldDiffFilterSetup = `const diffFilter = document.getElementById('difficulty-filter');`;
const addLevelFilter = `const levelFilterEl = document.getElementById('level-filter');
if (levelFilterEl) {
  levelFilterEl.addEventListener('change', (e) => {
    state.levelFilter = e.target.value || 'all';
    if (state.currentSubject) renderSubject();
  });
}
const diffFilter = document.getElementById('difficulty-filter');`;
if (a.includes(oldDiffFilterSetup) && !a.includes('level-filter')) {
  a = a.replace(oldDiffFilterSetup, addLevelFilter);
  console.log('✅ Level filter event listener added');
}

fs.writeFileSync('public/app.js', a, 'utf8');
console.log('✅ app.js updated!');
