import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('public/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# ──────────────────────────────────────────────────────────
# 1. Replace renderSidebar — add exercise count badge per subject
# ──────────────────────────────────────────────────────────
OLD_SIDEBAR = '''function renderSidebar() {
  const ul = document.getElementById('subject-list');
  if (!ul) return; // some pages (lecturer panel) don't include the student sidebar
  ul.innerHTML = '';
  state.subjects.forEach(s => {
    const li = document.createElement('li');
    li.textContent = `${s.subject_name} (${s.total_exercises})`;
    li.onclick = async () => { await selectSubject(s.subject_id); renderSidebar(); };
    if (state.currentSubject && state.currentSubject.subject_id === s.subject_id) li.classList.add('active');
    ul.appendChild(li);
  });
}'''

NEW_SIDEBAR = '''function renderSidebar() {
  const ul = document.getElementById('subject-list');
  if (!ul) return;
  ul.innerHTML = '';
  state.subjects.forEach(s => {
    const li = document.createElement('li');
    const nameSpan = document.createElement('span');
    nameSpan.className = 'subj-name';
    nameSpan.textContent = s.subject_name;
    const countSpan = document.createElement('span');
    countSpan.className = 'subj-count';
    countSpan.textContent = s.total_exercises || 0;
    li.appendChild(nameSpan);
    li.appendChild(countSpan);
    li.onclick = async () => { await selectSubject(s.subject_id); renderSidebar(); };
    if (state.currentSubject && state.currentSubject.subject_id === s.subject_id) li.classList.add('active');
    ul.appendChild(li);
  });
}'''

if OLD_SIDEBAR in js:
    js = js.replace(OLD_SIDEBAR, NEW_SIDEBAR)
    print('✅ renderSidebar updated')
else:
    print('❌ renderSidebar not found')

# ──────────────────────────────────────────────────────────
# 2. Replace subject summary rendering (inside renderSubject)
# ──────────────────────────────────────────────────────────
OLD_SUMMARY = "      summaryEl.innerHTML = `<div class=\"summary-item\"><span class=\"key\">Tổng bài:</span> ${totals.total}</div><div class=\"summary-item\"><span class=\"key\">Dễ:</span> ${totals.easy}</div><div class=\"summary-item\"><span class=\"key\">TB:</span> ${totals.medium}</div><div class=\"summary-item\"><span class=\"key\">Khó:</span> ${totals.hard}</div>`;"

NEW_SUMMARY = """      const levelCounts = [0,0,0,0,0];
      allExercises.forEach(ex => { if(ex.skill_level>=1&&ex.skill_level<=5) levelCounts[ex.skill_level-1]++; });
      summaryEl.innerHTML = `
        <div class="summary-chip"><span class="chip-dot" style="background:#6366f1"></span><span class="chip-num">${totals.total}</span> Bài tập</div>
        <div class="summary-chip"><span class="chip-dot" style="background:#10b981"></span><span class="chip-num">${totals.easy}</span> Dễ</div>
        <div class="summary-chip"><span class="chip-dot" style="background:#f59e0b"></span><span class="chip-num">${totals.medium}</span> Trung bình</div>
        <div class="summary-chip"><span class="chip-dot" style="background:#ef4444"></span><span class="chip-num">${totals.hard}</span> Khó</div>
        ${s.forms ? `<div class="summary-chip"><span class="chip-dot" style="background:#8b5cf6"></span><span class="chip-num">${s.forms.length}</span> Dạng bài</div>` : ''}
      `;\n"""

if OLD_SUMMARY in js:
    js = js.replace(OLD_SUMMARY, NEW_SUMMARY)
    print('✅ subject summary updated')
else:
    print('❌ subject summary not found')

# ──────────────────────────────────────────────────────────
# 3. Replace exercise card rendering (toShow.forEach block)
# ──────────────────────────────────────────────────────────
OLD_CARD_BLOCK = '''    toShow.forEach(ex => {
      const cardEl = document.createElement('div');
      cardEl.className = 'exercise-card';
      const title = document.createElement('div');
      title.className = 'exercise-title';
      title.textContent = ex.title;

      // small id line under title (matches screenshot)
      const idLine = document.createElement('div');
      idLine.className = 'small muted';
      idLine.style.marginTop = '6px';
      idLine.textContent = `ID: ${ex.id || ex.exercise_id || ''}`;

      const desc = document.createElement('div');
      desc.className = 'exercise-desc';
      desc.textContent = ex.description ? (ex.description.length > 140 ? ex.description.substring(0,140) + '...' : ex.description) : '';

      // meta area: left = counts (requirements, criteria), right = difficulty badge + format
      const meta = document.createElement('div');
      meta.className = 'exercise-meta';

      const countsWrap = document.createElement('div');
      countsWrap.className = 'exercise-counts';
      countsWrap.style.display = 'flex';
      countsWrap.style.gap = '12px';
      countsWrap.style.alignItems = 'center';

      const reqCount = (ex.requirements || []).length || 0;
      const critCount = (ex.grading_criteria || []).length || 0;
      // show as small muted labels like: 📄 1 yêu cầu  ⚖️ 2 tiêu chí
      const reqEl = document.createElement('span'); reqEl.className = 'small muted'; reqEl.textContent = `📄 ${reqCount} yêu cầu`;
      const critEl = document.createElement('span'); critEl.className = 'small muted'; critEl.textContent = `⚖️ ${critCount} tiêu chí`;
      countsWrap.appendChild(reqEl);
      countsWrap.appendChild(critEl);

      const rightWrap = document.createElement('div');
      rightWrap.style.display = 'flex'; rightWrap.style.alignItems = 'center'; rightWrap.style.gap = '8px';

      const diff = document.createElement('div');
      // normalize difficulty label for consistent badges
      const diffLabel = normalizeDifficultyLabel(ex.difficulty) || ex.difficulty || '';
      diff.className = 'difficulty-tag ' + (diffLabel === 'Khó' ? 'hard' : (diffLabel === 'Trung bình' ? 'medium' : 'easy'));
      diff.textContent = diffLabel;

      const format = document.createElement('span');
      format.className = 'small';
      format.textContent = ex.submission_format || '';

      rightWrap.appendChild(diff);
      rightWrap.appendChild(format);

      meta.appendChild(countsWrap);
      meta.appendChild(rightWrap);

      cardEl.appendChild(title);
      cardEl.appendChild(idLine);
      cardEl.appendChild(desc);
      cardEl.appendChild(meta);
      cardEl.onclick = () => showExercise(ex, form);
      grid.appendChild(cardEl);
    });'''

NEW_CARD_BLOCK = '''    const skillNames = {1:'L1',2:'L2',3:'L3',4:'L4',5:'L5'};
    toShow.forEach(ex => {
      const cardEl = document.createElement('div');
      cardEl.className = 'exercise-card';
      const diffLabel = normalizeDifficultyLabel(ex.difficulty) || ex.difficulty || '';
      const diffClass = diffLabel === 'Khó' ? 'hard' : (diffLabel === 'Trung bình' ? 'medium' : 'easy');
      const sl = ex.skill_level;
      const slLabel = skillNames[sl] || '';
      const slClass = sl ? 'level-' + sl : '';
      const totalPts = Array.isArray(ex.grading_criteria) ? ex.grading_criteria.reduce((s,g)=>s+(g&&typeof g.points==='number'?g.points:0),0) : 0;
      const descTxt = ex.description ? (ex.description.length > 110 ? ex.description.substring(0,110)+'…' : ex.description) : '';
      cardEl.innerHTML = `
        <div class="ex-card-top">
          <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;margin-bottom:6px;">
            <div class="ex-card-title">${ex.title || '—'}</div>
            <span class="badge ${diffClass}" style="flex-shrink:0;margin-top:2px;">${diffLabel}</span>
          </div>
          ${ex.name ? `<div class="ex-card-code">${ex.name}</div>` : ''}
          <div class="ex-card-desc">${descTxt}</div>
        </div>
        <div class="ex-card-footer">
          <div class="ex-card-meta">
            <span>📋 ${(ex.requirements||[]).length} yêu cầu</span>
            <span>⚖️ ${(ex.grading_criteria||[]).length} tiêu chí</span>
            ${totalPts > 0 ? `<span style="font-weight:700;color:var(--primary)">🏅 ${totalPts}đ</span>` : ''}
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            ${slLabel ? `<span class="ex-level-pill ${slClass}">${slLabel}</span>` : ''}
          </div>
        </div>
      `;
      cardEl.onclick = () => showExercise(ex, form);
      grid.appendChild(cardEl);
    });'''

if OLD_CARD_BLOCK in js:
    js = js.replace(OLD_CARD_BLOCK, NEW_CARD_BLOCK)
    print('✅ exercise cards updated')
else:
    print('❌ exercise card block not found')

# ──────────────────────────────────────────────────────────
# 4. Replace pagination rendering
# ──────────────────────────────────────────────────────────
OLD_PAGINATION = '''      let html = `<div style="text-align:center; margin:18px 0;">`;
      if (state.currentPage > 1) html += `<button onclick="changeFormPage(${state.currentPage-1})" style="margin-right:8px">← Trước</button>`;
      html += `<span style="margin:0 8px">Trang ${state.currentPage} / ${total}</span>`;
      if (state.currentPage < total) html += `<button onclick="changeFormPage(${state.currentPage+1})" style="margin-left:8px">Tiếp →</button>`;
      html += `</div>`;
      pagination.innerHTML = html;'''

NEW_PAGINATION = '''      let html = `<div class="pagination-bar">`;
      if (state.currentPage > 1) html += `<button class="pg-btn" onclick="changeFormPage(${state.currentPage-1})">← Trước</button>`;
      html += `<span class="pg-info">Trang ${state.currentPage} / ${total}</span>`;
      if (state.currentPage < total) html += `<button class="pg-btn" onclick="changeFormPage(${state.currentPage+1})">Tiếp →</button>`;
      html += `</div>`;
      pagination.innerHTML = html;'''

if OLD_PAGINATION in js:
    js = js.replace(OLD_PAGINATION, NEW_PAGINATION)
    print('✅ pagination updated')
else:
    print('❌ pagination not found')

# ──────────────────────────────────────────────────────────
# 5. Add welcome state when no subject selected
# ──────────────────────────────────────────────────────────
OLD_RENDER_HEAD = '''function renderSubject() {
  const s = state.currentSubject;
  document.getElementById('subject-title').textContent = s.subject_name;'''

NEW_RENDER_HEAD = '''function renderSubject() {
  const s = state.currentSubject;
  if (!s) {
    // Show welcome state
    const titleEl = document.getElementById('subject-title');
    if (titleEl) titleEl.textContent = 'Ngân Hàng Bài Tập';
    const cont = document.getElementById('forms-container');
    if (cont) {
      const totalEx = state.subjects.reduce((sum, subj) => sum + (subj.total_exercises || 0), 0);
      cont.innerHTML = `<div class="welcome-state">
        <div class="welcome-icon">📚</div>
        <h2 class="welcome-title">Hệ Thống Ngân Hàng Bài Tập</h2>
        <p class="welcome-sub">Chọn môn học từ thanh bên trái để xem danh sách bài tập theo dạng bài và mức độ kỹ năng.</p>
        <div class="welcome-stats">
          <div class="welcome-stat"><div class="welcome-stat-num">${state.subjects.length}</div><div class="welcome-stat-label">Môn học</div></div>
          <div class="welcome-stat"><div class="welcome-stat-num">${totalEx}</div><div class="welcome-stat-label">Bài tập</div></div>
        </div>
      </div>`;
    }
    return;
  }
  document.getElementById('subject-title').textContent = s.subject_name;'''

if OLD_RENDER_HEAD in js:
    js = js.replace(OLD_RENDER_HEAD, NEW_RENDER_HEAD)
    print('✅ welcome state added')
else:
    print('❌ renderSubject head not found')

# ──────────────────────────────────────────────────────────
# 6. Replace form card header rendering
# ──────────────────────────────────────────────────────────
OLD_FORM_HEADER = '''    const card = document.createElement('div');
    card.className = 'form-card';
    const h = document.createElement('h3');
    // display name as: Dạng <globalIndex> - <form.name>
    const globalIndex = startIdx + formIndex + 1;
    h.textContent = `Dạng ${globalIndex} - ${form.name} (${form.exercise_count})`;
    card.appendChild(h);
    // (Removed) do not display form-level grading criteria here — show per-exercise criteria in modal only'''

NEW_FORM_HEADER = '''    const card = document.createElement('div');
    card.className = 'form-card';
    const globalIndex = startIdx + formIndex + 1;
    const formHdr = document.createElement('div');
    formHdr.className = 'form-card-header';
    formHdr.innerHTML = `
      <div class="form-icon-box">📁</div>
      <div style="flex:1;min-width:0;">
        <div class="form-title">Dạng ${globalIndex} — ${form.name}</div>
      </div>
      <span class="form-count-badge">${form.exercise_count || (form.exercises||[]).length} bài tập</span>
    `;
    card.appendChild(formHdr);'''

if OLD_FORM_HEADER in js:
    js = js.replace(OLD_FORM_HEADER, NEW_FORM_HEADER)
    print('✅ form card header updated')
else:
    print('❌ form card header not found')

# ──────────────────────────────────────────────────────────
# 7. Replace "Xem thêm" button
# ──────────────────────────────────────────────────────────
OLD_MORE = '''      const moreBtn = document.createElement('button');
      moreBtn.className = 'accent';
      moreBtn.style.marginTop = '8px';
      moreBtn.textContent = expanded ? 'Thu gọn' : `Xem thêm (${filtered.length - SHOW_COUNT})`;'''

NEW_MORE = '''      const moreBtn = document.createElement('button');
      moreBtn.className = 'btn btn-secondary';
      moreBtn.style.cssText = 'margin-top:12px; font-size:13px; padding:8px 18px; border-radius:8px;';
      moreBtn.textContent = expanded ? '↑ Thu gọn' : `↓ Xem thêm ${filtered.length - SHOW_COUNT} bài`;'''

if OLD_MORE in js:
    js = js.replace(OLD_MORE, NEW_MORE)
    print('✅ more button updated')
else:
    print('❌ more button not found')

with open('public/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('\nDone writing app.js')
