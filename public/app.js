const API = '';

async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const state = { subjects: [], currentSubject: null, expandedForms: {}, searchQuery: '', currentPage: 1, formsPerPage: 2 }; 

// difficulty order mapping (lowercased keys)
const DIFF_ORDER = { 'dễ': 0, 'de': 0, 'dễ': 0, 'trung bình': 1, 'trung': 1, 'trung binh': 1, 'khó': 2, 'kho': 2 };

function normalizeDifficultyLabel(raw) {
  if (!raw) return '';
  const s = String(raw).toLowerCase().trim();
  if (s.includes('dễ') || s.includes('de')) return 'Dễ';
  if (s.includes('khó') || s.includes('kho')) return 'Khó';
  if (s.includes('trung')) return 'Trung bình';
  // also handle bracketed forms like "[Trung bình]"
  const m = raw.match(/\[(.*?)\]/);
  if (m && m[1]) {
    const inner = m[1].toLowerCase();
    if (inner.includes('dễ') || inner.includes('de')) return 'Dễ';
    if (inner.includes('khó') || inner.includes('kho')) return 'Khó';
    if (inner.includes('trung')) return 'Trung bình';
  }
  return '';
}

// restore expandedForms state (which form cards were expanded)
try {
  const ef = localStorage.getItem('expandedForms');
  if (ef) state.expandedForms = JSON.parse(ef);
} catch (e) { /* ignore */ }


async function loadSubjects() {
  state.subjects = await fetchJSON('/api/subjects');
  renderSidebar();
  // try to get current lecturer info (if authed)
  try {
    const r = await fetch('/api/lecturer/me', { credentials: 'include' });
    if (r.ok) state.lecturer = await r.json(); else state.lecturer = null;
  } catch (e) { state.lecturer = null; }
  populateLecturerSelects();
  // refresh login button (in case lecturer restored earlier)
  try { updateLoginButton(); } catch (e) {}
  // auto-select first subject when opening student page (so students see exercises immediately)
  try {
    const hash = (location.hash || '').replace(/^#/, '');
    if (!hash && state.subjects && state.subjects.length) {
      await selectSubject(state.subjects[0].subject_id);
    }
  } catch (e) { /* ignore */ }
  // If we are on the lecturer management page (has #manage-list), render its list now
  try {
    if (document.getElementById('manage-list')) {
      renderManageList();
      if (state.lecturer) {
        const info = document.getElementById('lecturer-info');
        if (info) info.textContent = `Giảng viên: ${state.lecturer.name} (${state.lecturer.lecturer_id || ''})`;
      }
    }
  } catch (err) { /* ignore */ }
  // if URL fragment present (e.g. #CS101), select that subject automatically
  // fragment handling kept earlier but we already handled no-fragment case above
}

function renderSidebar() {
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
}

async function selectSubject(id) {
  const subject = await fetchJSON(`/api/subject/${id}`);
  state.currentSubject = subject;
  // normalize grading_criteria shapes for exercises and forms
  try {
    normalizeSubjectCriteria(state.currentSubject);
  } catch (e) {}
  // reset form page when switching subjects
  state.currentPage = 1;
  renderSubject();
  renderSidebar();
  // update URL fragment without adding a history entry
  try { history.replaceState(null, '', '#' + id); } catch (e) { location.hash = '#' + id; }
}

function normalizeCriteria(raw) {
  // returns an array of criteria objects { name, points?, note? } or []
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(g => {
      if (typeof g === 'string') return { name: g, points: 0 };
      if (typeof g === 'object') {
        // if object has tieu_chi key (API legacy), map those
        if (g.tieu_chi && Array.isArray(g.tieu_chi)) return g.tieu_chi.map(s => ({ name: s, points: 0 }));
        return { name: g.name || g.tieu_chi || '(Không tên)', points: g.points || 0, note: g.note || '' };
      }
      return { name: String(g), points: 0 };
    }).flat();
  }
  if (typeof raw === 'object') {
    if (raw.tieu_chi && Array.isArray(raw.tieu_chi)) {
      return raw.tieu_chi.map(s => ({ name: s, points: 0 }));
    }
    // unknown object shape — try to extract name/points
    if (raw.name) return [{ name: raw.name, points: raw.points || 0 }];
    return [];
  }
  return [];
}

function normalizeSubjectCriteria(subject) {
  if (!subject || !subject.forms) return;
  subject.forms.forEach(f => {
    if (f.grading_criteria) f.grading_criteria = normalizeCriteria(f.grading_criteria);
    if (f.exercises && Array.isArray(f.exercises)) {
      f.exercises.forEach(ex => {
        ex.grading_criteria = normalizeCriteria(ex.grading_criteria);
      });
    }
  });
}

function renderSubject() {
  const s = state.currentSubject;
  document.getElementById('subject-title').textContent = s.subject_name;
  const descEl = document.getElementById('subject-desc');
  if (descEl) descEl.textContent = s.description || '';
  // subject summary: total and counts by difficulty
  try {
    const summaryEl = document.getElementById('subject-summary');
    if (summaryEl) {
      const allExercises = (s.forms || []).reduce((acc, f) => acc.concat(f.exercises || []), []);
      const totals = { total: allExercises.length, easy: 0, medium: 0, hard: 0 };
      allExercises.forEach(ex => {
        const lab = normalizeDifficultyLabel(ex.difficulty) || '';
        if (lab === 'Dễ') totals.easy++;
        else if (lab === 'Trung bình') totals.medium++;
        else if (lab === 'Khó') totals.hard++;
      });
      summaryEl.innerHTML = `<div class="summary-item"><span class="key">Tổng bài:</span> ${totals.total}</div><div class="summary-item"><span class="key">Dễ:</span> ${totals.easy}</div><div class="summary-item"><span class="key">TB:</span> ${totals.medium}</div><div class="summary-item"><span class="key">Khó:</span> ${totals.hard}</div>`;
    }
  } catch (e) { /* ignore summary errors */ }
  const container = document.getElementById('forms-container');
  container.innerHTML = '';
  // sort forms by difficulty (easy -> medium -> hard) then by name
  s.forms.sort((a,b) => {
    const da = DIFF_ORDER[(normalizeDifficultyLabel(a.difficulty)||a.difficulty||'').toLowerCase()] ?? 1;
    const db = DIFF_ORDER[(normalizeDifficultyLabel(b.difficulty)||b.difficulty||'').toLowerCase()] ?? 1;
    if (da !== db) return da - db;
    return (a.name||'').localeCompare(b.name||'');
  });

  // paginate forms: show `formsPerPage` forms per page
  const formsPerPage = state.formsPerPage || 2;
  const totalFormPages = Math.max(1, Math.ceil((s.forms||[]).length / formsPerPage));
  if (!state.currentPage || state.currentPage < 1) state.currentPage = 1;
  if (state.currentPage > totalFormPages) state.currentPage = totalFormPages;
  const startIdx = (state.currentPage - 1) * formsPerPage;
  const pageForms = (s.forms || []).slice(startIdx, startIdx + formsPerPage);

  pageForms.forEach((form, formIndex) => {
    const card = document.createElement('div');
    card.className = 'form-card';
    const h = document.createElement('h3');
    // display name as: Dạng <globalIndex> - <form.name>
    const globalIndex = startIdx + formIndex + 1;
    h.textContent = `Dạng ${globalIndex} - ${form.name} (${form.exercise_count})`;
    card.appendChild(h);
    // (Removed) do not display form-level grading criteria here — show per-exercise criteria in modal only

    // create grid for exercise cards (student-facing)
    const grid = document.createElement('div');
    grid.className = 'exercise-grid';

    // apply search filter
    const q = state.searchQuery && state.searchQuery.toLowerCase();
    const filtered = (form.exercises || []).filter(ex => {
      if (state.difficultyFilter && state.difficultyFilter !== 'all') {
        const lab = (normalizeDifficultyLabel(ex.difficulty) || '').toLowerCase();
        if (state.difficultyFilter === 'easy' && lab !== 'dễ') return false;
        if (state.difficultyFilter === 'medium' && lab !== 'trung bình') return false;
        if (state.difficultyFilter === 'hard' && lab !== 'khó') return false;
      }
      if (!q) return true;
      return (ex.title || '').toLowerCase().includes(q) || (ex.description || '').toLowerCase().includes(q);
    });
    // sort by difficulty (easy -> medium -> hard), then by numeric order extracted from title (e.g. "Bài 10")
    // fall back to localeCompare when no numeric prefix is found
    filtered.sort((a, b) => {
      const daLabel = normalizeDifficultyLabel(a.difficulty) || a.difficulty || '';
      const dbLabel = normalizeDifficultyLabel(b.difficulty) || b.difficulty || '';
      const da = DIFF_ORDER[(daLabel).toLowerCase()] ?? 1;
      const db = DIFF_ORDER[(dbLabel).toLowerCase()] ?? 1;
      if (da !== db) return da - db;

      const titleA = (a.title || '').trim();
      const titleB = (b.title || '').trim();

      // try to extract the first integer that appears in the title (handles "Bài 1", "Exercise 10", etc.)
      const numA = (() => { const m = titleA.match(/(\d+)/); return m ? parseInt(m[1], 10) : null; })();
      const numB = (() => { const m = titleB.match(/(\d+)/); return m ? parseInt(m[1], 10) : null; })();

      if (numA != null && numB != null) {
        if (numA !== numB) return numA - numB;
        // if numbers equal, fall through to text compare of the rest
      } else if (numA != null) {
        // put numeric-prefixed titles before non-numeric
        return -1;
      } else if (numB != null) {
        return 1;
      }

      return titleA.localeCompare(titleB);
    });

    const key = `${s.subject_id}-${form.form_id}`;
    const expanded = !!state.expandedForms[key];
    const SHOW_COUNT = 8; // more cards visible in grid by default
    const toShow = expanded ? filtered : filtered.slice(0, SHOW_COUNT);

    toShow.forEach(ex => {
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
    });

    card.appendChild(grid);

    if (filtered.length > SHOW_COUNT) {
      const moreBtn = document.createElement('button');
      moreBtn.className = 'accent';
      moreBtn.style.marginTop = '8px';
      moreBtn.textContent = expanded ? 'Thu gọn' : `Xem thêm (${filtered.length - SHOW_COUNT})`;
      moreBtn.onclick = () => {
        state.expandedForms[key] = !state.expandedForms[key];
        try { localStorage.setItem('expandedForms', JSON.stringify(state.expandedForms)); } catch (e) {}
        renderSubject();
      };
      card.appendChild(moreBtn);
    }

    container.appendChild(card);
  });

  // render form-level pagination controls
  const pagination = document.getElementById('pagination-control');
  if (pagination) {
    if ((s.forms||[]).length <= formsPerPage) { pagination.innerHTML = ''; }
    else {
      const total = totalFormPages;
      let html = `<div style="text-align:center; margin:18px 0;">`;
      if (state.currentPage > 1) html += `<button onclick="changeFormPage(${state.currentPage-1})" style="margin-right:8px">← Trước</button>`;
      html += `<span style="margin:0 8px">Trang ${state.currentPage} / ${total}</span>`;
      if (state.currentPage < total) html += `<button onclick="changeFormPage(${state.currentPage+1})" style="margin-left:8px">Tiếp →</button>`;
      html += `</div>`;
      pagination.innerHTML = html;
    }
  }
}

// helper to change form page (exposed to inline onclick above)
function changeFormPage(p) {
  state.currentPage = p;
  renderSubject();
}

async function showExercise(ex, parentForm) {
  // helper: escape HTML to avoid XSS when building innerHTML
  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function renderGradingHtml(criteria, fallback) {
    // if exercise criteria empty and fallback (form-level) present, use fallback
    if ((!criteria || !criteria.length) && (fallback && fallback.length)) {
      criteria = fallback;
    }
    if (!criteria || !criteria.length) return '<div class="small muted">(Không có tiêu chí)</div>';
    return '<ul>' + criteria.map(g => {
      if (!g) return '<li>(Không xác định)</li>';
      if (typeof g === 'string') return `<li>${escapeHtml(g)}</li>`;
      const name = escapeHtml(g.name || '(Không tên)');
      const pts = (typeof g.points === 'number') ? ` <span class="small muted">(${g.points} điểm)</span>` : '';
      const note = g.note ? ` — ${escapeHtml(g.note)}` : '';
      return `<li><strong>${name}</strong>${pts}${note}</li>`;
    }).join('') + '</ul>';
  }
  const d = document.getElementById('exercise-detail');
  // determine grading criteria to show: prefer exercise -> parent form -> snapshot cache
  let finalCriteria = (ex.grading_criteria && ex.grading_criteria.length) ? ex.grading_criteria : ((parentForm && parentForm.grading_criteria && parentForm.grading_criteria.length) ? parentForm.grading_criteria : []);
  if ((!finalCriteria || !finalCriteria.length) && !state.snapshotTried) {
    // try to load subjects_merged.json as fallback
    try {
      state.snapshot = await fetchJSON('/subjects_merged.json');
      state.snapshotTried = true;
      // find exercise by id
      const allSnapExercises = (state.snapshot || []).flatMap(s => s.forms || []).flatMap(f => f.exercises || []);
      const exIdStr = String(ex.id || ex.exercise_id || '').trim();
      const exTitle = String(ex.title || '').trim().toLowerCase();
      const found = allSnapExercises.find(x => {
        const xid = String(x.id || x.exercise_id || '').trim();
        if (xid && exIdStr && xid === exIdStr) return true;
        // match by title as fallback (case-insensitive)
        const xt = String(x.title || '').trim().toLowerCase();
        if (xt && exTitle && xt === exTitle) return true;
        return false;
      });
      if (found && found.grading_criteria && found.grading_criteria.length) finalCriteria = found.grading_criteria;
    } catch (err) {
      state.snapshotTried = true;
    }
  }
  // render markdown then sanitize
  const rawHtml = (typeof marked !== 'undefined') ? marked.parse(ex.description || '') : (ex.description || '');
  const safeHtml = (typeof DOMPurify !== 'undefined') ? DOMPurify.sanitize(rawHtml) : rawHtml;
  const attached = (ex.attached_files||[]).map(f=>f.originalname || f.filename).join(', ') || '(Không có)';
  // difficulty badge class
  const diffLabel = normalizeDifficultyLabel(ex.difficulty) || ex.difficulty || '';
  const badgeClass = (diffLabel === 'Khó') ? 'badge hard' : (diffLabel === 'Trung bình' ? 'badge medium' : 'badge easy');
  d.innerHTML = `
    <button class="close-ex" id="exercise-close-btn">×</button>
    <h2>${ex.title}</h2>
    <div class="meta-row">
      <div class="meta-item"><strong>ID:</strong> ${escapeHtml(ex.id || '')}</div>
      <div class="meta-item"><strong>Dạng:</strong> ${escapeHtml((parentForm && parentForm.name) ? parentForm.name + ' (' + parentForm.form_id + ')' : '')}</div>
      <div class="meta-item"><strong>Độ khó:</strong> <span class="badge ${diffLabel === 'Khó' ? 'hard' : (diffLabel === 'Trung bình' ? 'medium' : 'easy')}">${escapeHtml(diffLabel || ex.difficulty || '')}</span></div>
      <div class="meta-item"><strong>Định dạng nộp:</strong> ${escapeHtml(ex.submission_format || '(Không có)')}</div>
    </div>
    <div class="section"><h3>Mô tả</h3><div>${safeHtml}</div></div>
    <div class="section"><h3>Yêu cầu (${(ex.requirements||[]).length})</h3><ol>${(ex.requirements||[]).map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ol></div>
    <div class="section"><h3>Tiêu chí chấm (${(finalCriteria||[]).length})</h3>${renderGradingHtml(finalCriteria)}</div>
    <div class="section"><h3>File đính kèm</h3><div>${escapeHtml(attached)}</div></div>
  `;
  // ensure overlay exists at document level (not inside modal) and show it
  let overlay = document.getElementById('exercise-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'exercise-overlay';
    document.body.appendChild(overlay);
  }
  // show overlay and panel (panel slides in from right)
  overlay.style.position = 'fixed'; overlay.style.inset = '0'; overlay.style.zIndex = '1098';
  overlay.classList.add('show');
  // show centered modal (use the .open styles in CSS)
  d.classList.remove('hidden');
  // ensure we trigger modal open transition
  d.classList.remove('open');
  requestAnimationFrame(()=> d.classList.add('open'));

  // close handler shared
  function closePanel(){
    d.classList.remove('open');
    overlay.classList.remove('show');
    // wait for transition before fully hiding
    d.addEventListener('transitionend', function handler(){ d.classList.add('hidden'); d.removeEventListener('transitionend', handler); }, { once: true });
  }

  overlay.onclick = closePanel;
  const closeBtn = document.getElementById('exercise-close-btn');
  if (closeBtn) closeBtn.onclick = closePanel;
}

// Theme (light/dark) handling
function applyTheme(theme) {
  if (theme === 'dark') document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode');
}
try { const saved = localStorage.getItem('theme'); if (saved) applyTheme(saved); } catch (e) {}
const themeToggle = document.getElementById('theme-toggle'); if (themeToggle) themeToggle.onclick = () => { try { const cur = document.body.classList.contains('dark-mode') ? 'dark' : 'light'; const next = cur === 'dark' ? 'light' : 'dark'; applyTheme(next); localStorage.setItem('theme', next); } catch (e) {} };

// Lecturer flow
const btnLogin = document.getElementById('btn-login');
const loginCancelEl = document.getElementById('login-cancel');
if (loginCancelEl) loginCancelEl.onclick = () => {
  const m = document.getElementById('lecturer-modal'); if (m) m.classList.add('hidden');
};

function updateLoginButton() {
  if (!btnLogin) return;
  // Student page's login button now redirects to a separate login page.
  btnLogin.textContent = 'Đăng nhập giảng viên';
  btnLogin.onclick = () => { window.location.href = '/login'; };
}

function showLoginModal() {
  const m = document.getElementById('lecturer-modal');
  if (!m) return;
  m.classList.remove('hidden');
  // autofocus first input
  setTimeout(() => {
    const first = m.querySelector('input[name="name"]');
    if (first) first.focus();
  }, 50);
}

// set initial button state after defining btnLogin and update function
updateLoginButton();

// close buttons (added in HTML)
const loginModal = document.getElementById('lecturer-modal');
const panelModal = document.getElementById('lecturer-panel');
const loginCloseBtn = document.getElementById('login-close');
const panelCloseBtn = document.getElementById('panel-close');
const loginCloseText = document.getElementById('login-close-text');
const panelCloseText = document.getElementById('panel-close-text');
if (loginCloseBtn) loginCloseBtn.onclick = () => loginModal.classList.add('hidden');
if (panelCloseBtn) panelCloseBtn.onclick = () => panelModal.classList.add('hidden');
if (loginCloseText) loginCloseText.onclick = () => loginModal.classList.add('hidden');
if (panelCloseText) panelCloseText.onclick = () => panelModal.classList.add('hidden');

// exercise modal close (lecturer page)
const exerciseModalClose = document.getElementById('modal-close');
if (exerciseModalClose) exerciseModalClose.onclick = () => { const m = document.getElementById('exercise-modal'); if (m) m.classList.remove('show'); };

// clicking on overlay (outside modal-content) closes modal
if (loginModal) {
  loginModal.addEventListener('click', (ev) => {
    if (ev.target === loginModal) loginModal.classList.add('hidden');
  });
}
if (panelModal) {
  panelModal.addEventListener('click', (ev) => {
    if (ev.target === panelModal) panelModal.classList.add('hidden');
  });
}

// ESC key closes any open modal
document.addEventListener('keydown', (ev) => {
  if (ev.key === 'Escape' || ev.key === 'Esc') {
    if (loginModal && !loginModal.classList.contains('hidden')) loginModal.classList.add('hidden');
    if (panelModal && !panelModal.classList.contains('hidden')) panelModal.classList.add('hidden');
  }
});

const loginForm = document.getElementById('login-form');
if (loginForm) loginForm.onsubmit = async (e) => {
  e.preventDefault();
  const form = new FormData(e.target);
  const payload = { name: form.get('name'), password: form.get('password'), lecturer_id: form.get('lecturer_id') };
  try {
    const res = await fetch('/api/lecturer/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' });
    if (!res.ok) throw new Error('Login failed');
    // server sets HttpOnly cookie; redirect to /lecturer (protected page)
    window.location.href = '/lecturer';
  } catch (err) {
    alert('Đăng nhập thất bại');
  }
};

function openLecturerPanel() {
  const panel = document.getElementById('lecturer-panel');
  if (!panel) return;
  panel.classList.remove('hidden');
  document.getElementById('lecturer-info').textContent = `Giảng viên: ${state.lecturer.name} (${state.lecturer.lecturer_id || ''})`;
  populateLecturerSelects();
  renderManageList();
  // autofocus first field inside panel
  setTimeout(() => {
    const first = panel.querySelector('#form-subject');
    if (first) first.focus();
  }, 50);
}

const btnLogout = document.getElementById('btn-logout');
if (btnLogout) btnLogout.onclick = () => {
  // call logout endpoint to clear server cookie
  fetch('/api/lecturer/logout', { method: 'POST', credentials: 'include' }).finally(()=>{
    try { localStorage.removeItem('lecturer'); } catch(e){}
    // if we are on the lecturer management page, redirect to login
    try {
      if (location && location.pathname && location.pathname.startsWith('/lecturer')) {
        window.location.href = '/login';
        return;
      }
    } catch (e) {}
    updateLoginButton();
  });
};

// Create new exercise button (opens modal with empty form)
const btnCreateNew = document.getElementById('btn-create-new');
if (btnCreateNew) btnCreateNew.onclick = () => {
  const formEl = document.getElementById('exercise-form');
  if (!formEl) { window.location.href = '/lecturer'; return; }
  formEl.reset();
  const original = document.getElementById('original_id'); if (original) original.value = '';
  const selSub = document.getElementById('form-subject'); if (selSub) { selSub.selectedIndex = 0; selSub.onchange && selSub.onchange(); }
  const selForm = document.getElementById('form-form'); if (selForm) selForm.selectedIndex = 0;
  // initialize dynamic lists
  currentRequirements = [];
  currentGrades = [];
  renderRequirements(); renderGradingList();
  const modal = document.getElementById('exercise-modal'); if (modal) modal.classList.add('show');
  setTimeout(()=> { const t = formEl.querySelector('[name=title]'); if (t) t.focus(); }, 50);
};

function populateLecturerSelects() {
  const selSub = document.getElementById('form-subject');
  const selForm = document.getElementById('form-form');
  if (!selSub) return;
  selSub.innerHTML = '';
  state.subjects.forEach(s => {
    const o = document.createElement('option'); o.value = s.subject_id; o.textContent = s.subject_name; selSub.appendChild(o);
  });
  selSub.onchange = () => {
    const sub = state.subjects.find(x => x.subject_id === selSub.value);
    if (!selForm) return;
    selForm.innerHTML = '';
    sub.forms.forEach(f => { const o = document.createElement('option'); o.value = f.form_id; o.textContent = `${f.name} (${f.difficulty})`; selForm.appendChild(o); });
  };
  if (state.subjects.length) selSub.onchange();
}

// search handling
const searchInput = document.getElementById('search-input');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    state.searchQuery = e.target.value || '';
    if (state.currentSubject) renderSubject();
  });
}

// lecturer page search box (manage list)
const lecturerSearch = document.getElementById('search-box');
if (lecturerSearch) lecturerSearch.addEventListener('input', () => { renderManageList(); });

const lecturerFilter = document.getElementById('filter-difficulty');
if (lecturerFilter) lecturerFilter.addEventListener('change', () => { renderManageList(); });

// difficulty filter handling
const diffFilter = document.getElementById('difficulty-filter');
if (diffFilter) {
  diffFilter.addEventListener('change', (e) => {
    state.difficultyFilter = e.target.value || 'all';
    if (state.currentSubject) renderSubject();
  });
}

const exerciseCancel = document.getElementById('exercise-cancel');
if (exerciseCancel) exerciseCancel.onclick = () => {
  const p = document.getElementById('lecturer-panel'); if (p) p.classList.add('hidden');
  const modal = document.getElementById('exercise-modal'); if (modal) modal.classList.remove('show');
};

const exerciseForm = document.getElementById('exercise-form');
// Dynamic lists state for modal editor
let currentRequirements = null;
let currentGrades = null;

function renderRequirements() {
  const container = document.getElementById('requirements-list');
  if (!container) return;
  container.innerHTML = '';
  if (!Array.isArray(currentRequirements)) currentRequirements = [];
  currentRequirements.forEach((v, idx) => {
    const row = document.createElement('div');
    row.style.display = 'flex'; row.style.gap = '8px'; row.style.marginBottom = '6px';
    const input = document.createElement('input'); input.type = 'text'; input.value = v || ''; input.style.flex = '1';
    input.oninput = (e) => { currentRequirements[idx] = e.target.value; };
    const del = document.createElement('button'); del.type = 'button'; del.textContent = '-'; del.title = 'Xóa yêu cầu';
    del.onclick = () => { currentRequirements.splice(idx,1); renderRequirements(); };
    row.appendChild(input); row.appendChild(del);
    container.appendChild(row);
  });
}

function renderGradingList() {
  const container = document.getElementById('grading-list');
  if (!container) return;
  container.innerHTML = '';
  if (!Array.isArray(currentGrades)) currentGrades = [];
  currentGrades.forEach((g, idx) => {
    const row = document.createElement('div');
    row.style.display = 'flex'; row.style.gap = '8px'; row.style.marginBottom = '6px';
    const name = document.createElement('input'); name.type='text'; name.placeholder='Tiêu chí'; name.value = g.name || ''; name.style.flex='1';
    name.oninput = (e) => { currentGrades[idx].name = e.target.value; };
    const pts = document.createElement('input'); pts.type='number'; pts.min='0'; pts.placeholder='điểm'; pts.value = (g.points!=null?g.points:''); pts.style.width='86px';
    pts.oninput = (e) => { currentGrades[idx].points = parseInt(e.target.value || 0, 10); };
    const note = document.createElement('input'); note.type='text'; note.placeholder='Ghi chú (tùy chọn)'; note.value = g.note || ''; note.style.width='180px';
    note.oninput = (e) => { currentGrades[idx].note = e.target.value; };
    const del = document.createElement('button'); del.type='button'; del.textContent='-'; del.title='Xóa tiêu chí';
    del.onclick = () => { currentGrades.splice(idx,1); renderGradingList(); };
    row.appendChild(name); row.appendChild(pts); row.appendChild(note); row.appendChild(del);
    container.appendChild(row);
  });
}

// wire add buttons if present
const reqAddBtn = document.getElementById('req-add');
if (reqAddBtn) reqAddBtn.onclick = () => { if (!Array.isArray(currentRequirements)) currentRequirements = []; currentRequirements.push(''); renderRequirements(); };
const gradeAddBtn = document.getElementById('grade-add');
if (gradeAddBtn) gradeAddBtn.onclick = () => { if (!Array.isArray(currentGrades)) currentGrades = []; currentGrades.push({ name: '', points: 0, note: '' }); renderGradingList(); };
// parse grading criteria textarea into structured objects
function parseCriteriaText(text) {
  const lines = (text || '').split('\n').map(s=>s.trim()).filter(Boolean);
  const out = [];
  for (const line of lines) {
    // try to find first number as points
    const m = line.match(/(\d+)\s*p?\b/i);
    if (m) {
      const pts = parseInt(m[1], 10);
      // name is text before the number
      const idx = line.indexOf(m[0]);
      const namePart = line.substring(0, idx).replace(/[-–—|:]+$/,'').trim();
      // note is text after the number
      const notePart = line.substring(idx + m[0].length).replace(/^[-–—|:]+/,'').trim();
      out.push({ name: namePart || '(Không tên)', points: pts, note: notePart || '' });
    } else {
      // no points found — keep as simple object with 0 points
      out.push({ name: line, points: 0, note: '' });
    }
  }
  return out;
}
if (exerciseForm) exerciseForm.onsubmit = async (e) => {
  e.preventDefault();
  const formEl = e.target;
  const fd = new FormData(formEl);
  const orig = fd.get('original_id');
  const exercise = {
    id: fd.get('id'),
    title: fd.get('title'),
    difficulty: fd.get('difficulty'),
    description: fd.get('description'),
    requirements: (Array.isArray(currentRequirements) ? currentRequirements.slice().map(s=>String(s).trim()).filter(Boolean) : (fd.get('requirements')||'').split('\n').map(s=>s.trim()).filter(Boolean)),
    grading_criteria: (Array.isArray(currentGrades) ? currentGrades.map(g=>({ name: g.name||'', points: Number(g.points)||0, note: g.note||'' })) : parseCriteriaText(fd.get('grading_criteria')||'')),
    submission_format: fd.get('submission_format')
  };
  const multipart = new FormData();
  multipart.append('exercise', JSON.stringify(exercise));
  const fileInput = formEl.querySelector('input[type=file]');
  if (fileInput && fileInput.files.length) {
    for (const f of fileInput.files) multipart.append('files', f);
  }
  multipart.append('subject_id', fd.get('subject_id'));
  multipart.append('form_id', fd.get('form_id'));

  try {
    let res;
    if (orig) {
      res = await fetch(`/api/exercise/${encodeURIComponent(orig)}`, { method: 'PUT', credentials: 'include', body: multipart });
    } else {
      res = await fetch('/api/exercise', { method: 'POST', credentials: 'include', body: multipart });
    }
    if (!res.ok) throw new Error('Failed');
    const data = await res.json();
    await loadSubjects();
    if (state.currentSubject && state.currentSubject.subject_id === data.subject.subject_id) state.currentSubject = data.subject;
    renderSubject();
    // close modal if present
    try { const modal = document.getElementById('exercise-modal'); if (modal) modal.classList.remove('show'); } catch (e) {}
    alert('Lưu thành công');
    formEl.reset();
    document.getElementById('original_id').value = '';
    renderManageList();
  } catch (err) { console.error(err); alert('Lỗi lưu bài tập'); }
};

function renderManageList() {
  const container = document.getElementById('manage-list');
  if (!container) return;
  container.innerHTML = '';
  // render as table with columns: STT, Mã bài tập, Tên bài tập, Độ khó, Hành động
  const table = document.createElement('table');
  table.className = 'manage-table';
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th style="width:60px">STT</th><th style="width:160px">Mã bài tập</th><th>Tên bài tập</th><th style="width:120px">Độ khó</th><th style="width:120px">Tổng trọng số</th><th style="width:160px">Hành động</th></tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');

  // collect all exercises across subjects/forms into flat list for table
  let rows = [];
  state.subjects.forEach(s => {
    s.forms.forEach(f => {
      (f.exercises || []).forEach(ex => rows.push({ subject: s, form: f, ex }));
    });
  });

  // apply search and difficulty filter (lecturer page inputs)
  const searchBox = document.getElementById('search-box');
  const filterDiff = document.getElementById('filter-difficulty');
  const q = searchBox && searchBox.value ? searchBox.value.toLowerCase().trim() : '';
  const diffSel = filterDiff && filterDiff.value ? filterDiff.value : '';

  rows = rows.filter(r => {
    const ex = r.ex;
    if (diffSel) {
      if ((ex.difficulty || '').toLowerCase() !== diffSel.toLowerCase()) return false;
    }
    if (!q) return true;
    return (String(ex.title||'')+ ' ' + String(ex.id||'') + ' ' + (ex.description||'')).toLowerCase().includes(q);
  });

  rows.forEach((r, idx) => {
    const ex = r.ex; const s = r.subject; const f = r.form;
    const tr = document.createElement('tr');
    const tdIndex = document.createElement('td'); tdIndex.textContent = String(idx+1);
    const tdId = document.createElement('td'); tdId.textContent = ex.id || '';
    const tdTitle = document.createElement('td'); tdTitle.textContent = ex.title || '';
    tdTitle.style.cursor = 'pointer'; tdTitle.onclick = () => showExercise(ex, f);
    const tdDiff = document.createElement('td'); tdDiff.textContent = ex.difficulty || '';
    const tdTotal = document.createElement('td');
    // compute total points from grading_criteria if numeric points available
    let totalPoints = 0;
    try {
      if (Array.isArray(ex.grading_criteria)) {
        totalPoints = ex.grading_criteria.reduce((s, g) => s + (g && typeof g.points === 'number' ? g.points : 0), 0);
      }
    } catch (e) { totalPoints = 0; }
    tdTotal.textContent = (typeof totalPoints === 'number' && totalPoints > 0) ? `${totalPoints} điểm` : (totalPoints === 0 ? `0 điểm` : '-');
    const tdActions = document.createElement('td'); tdActions.style.display = 'flex'; tdActions.style.gap = '8px'; tdActions.style.justifyContent = 'flex-end';

    // determine if current user may edit/delete: allow if no owner set or owner === current lecturer
    const canEdit = (!ex.owner) || (state.lecturer && ex.owner === state.lecturer.lecturer_id);

    if (canEdit) {
      const btnEdit = document.createElement('button'); btnEdit.className='btn-edit'; btnEdit.textContent='Sửa'; btnEdit.onclick = () => {
        // reuse existing edit logic: populate form and open modal
        const ev = new Event('click');
        // call the edit flow inline
        const formEl = document.getElementById('exercise-form');
        const originalInp = document.getElementById('original_id');
        if (!formEl || !originalInp) { try { localStorage.setItem('editTarget', JSON.stringify({ subject_id: s.subject_id, form_id: f.form_id, id: ex.id })); } catch(e){}; location.href='/lecturer'; return; }
        originalInp.value = ex.id || '';
        const setIf = (selector, value) => { const el = formEl.querySelector(selector); if (el) el.value = value || ''; };
        setIf('[name=id]', ex.id); setIf('[name=title]', ex.title); setIf('[name=difficulty]', ex.difficulty); setIf('[name=description]', ex.description || '');
        currentRequirements = (ex.requirements && Array.isArray(ex.requirements)) ? ex.requirements.slice() : [];
        renderRequirements();
        currentGrades = (ex.grading_criteria || []).map(g => (typeof g==='string'?{name:g,points:0,note:''}:{ name: g.name||g.tieu_chi||'', points: g.points||0, note: g.note||'' }));
        renderGradingList();
        setIf('[name=submission_format]', ex.submission_format || '');
        const selSub = document.getElementById('form-subject'); if (selSub) { selSub.value = s.subject_id; selSub.onchange && selSub.onchange(); const selForm = document.getElementById('form-form'); if (selForm) selForm.value = f.form_id; }
        try { localStorage.setItem('editTarget', JSON.stringify({ subject_id: s.subject_id, form_id: f.form_id, id: ex.id })); } catch (e) {}
        const modal = document.getElementById('exercise-modal'); if (modal) modal.classList.add('show');
      };
      tdActions.appendChild(btnEdit);

      const btnDel = document.createElement('button'); btnDel.className='btn-delete'; btnDel.textContent='Xóa'; btnDel.onclick = async () => {
        if (!confirm('Xóa bài tập?')) return;
        const resp = await fetch(`/api/exercise/${ex.id}`, { method: 'DELETE', credentials: 'include' });
        if (!resp.ok) {
          alert('Không thể xóa (không có quyền hoặc lỗi)');
          return;
        }
        await loadSubjects(); renderManageList();
      };
      tdActions.appendChild(btnDel);
    } else {
      // view-only: show a View button
      const btnView = document.createElement('button'); btnView.textContent='Xem'; btnView.onclick = () => showExercise(ex, f);
      tdActions.appendChild(btnView);
    }

    tr.appendChild(tdIndex); tr.appendChild(tdId); tr.appendChild(tdTitle); tr.appendChild(tdDiff); tr.appendChild(tdTotal); tr.appendChild(tdActions);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  container.appendChild(table);
}

// Export button removed from lecturer UI; export handled elsewhere when needed

// init
loadSubjects().catch(err=>console.error(err));
