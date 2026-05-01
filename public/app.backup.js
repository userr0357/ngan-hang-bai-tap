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
  
  // Get or create modal container
  let modalContainer = document.getElementById('exercise-modal-detail');
  if (!modalContainer) {
    modalContainer = document.createElement('div');
    modalContainer.id = 'exercise-modal-detail';
    document.body.appendChild(modalContainer);
  }
  
  // Build modal HTML
  modalContainer.innerHTML = `
    <div class="exercise-modal-backdrop"></div>
    <div class="exercise-modal-box">
      <div class="exercise-modal-header">
        <h2>${escapeHtml(ex.title || '')}</h2>
        <button type="button" class="exercise-modal-close">×</button>
      </div>
      <div class="exercise-modal-body">
        <div class="exercise-modal-meta">
          <div class="exercise-modal-item"><strong>ID:</strong> ${escapeHtml(ex.id || '')}</div>
          <div class="exercise-modal-item"><strong>Dạng:</strong> ${escapeHtml((parentForm && parentForm.name) ? parentForm.name + ' (' + parentForm.form_id + ')' : '')}</div>
          <div class="exercise-modal-item"><strong>Độ khó:</strong> <span class="badge ${diffLabel === 'Khó' ? 'hard' : (diffLabel === 'Trung bình' ? 'medium' : 'easy')}">${escapeHtml(diffLabel || ex.difficulty || '')}</span></div>
          <div class="exercise-modal-item"><strong>Định dạng nộp:</strong> ${escapeHtml(ex.submission_format || '(Không có)')}</div>
        </div>
        <div class="exercise-modal-section"><h3>Mô tả</h3><div>${safeHtml}</div></div>
        <div class="exercise-modal-section"><h3>Yêu cầu (${(ex.requirements||[]).length})</h3><ol>${(ex.requirements||[]).map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ol></div>
        <div class="exercise-modal-section"><h3>Tiêu chí chấm (${(finalCriteria||[]).length})</h3>${renderGradingHtml(finalCriteria)}</div>
        <div class="exercise-modal-section"><h3>File đính kèm</h3><div>${escapeHtml(attached)}</div></div>
      </div>
    </div>
  `;
  
  // Show modal
  modalContainer.classList.add('show');
  
  // Attach close handlers
  const backdrop = modalContainer.querySelector('.exercise-modal-backdrop');
  const closeBtn = modalContainer.querySelector('.exercise-modal-close');
  
  const closeHandler = () => {
    modalContainer.classList.remove('show');
  };
  
  if (backdrop) backdrop.addEventListener('click', closeHandler);
  if (closeBtn) closeBtn.addEventListener('click', closeHandler);
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
    // Clear state cache to prevent data leak between accounts
    state.subjects = [];
    state.currentSubject = null;
    state.lecturer = null;
    state.expandedForms = {};
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

// lightweight weights editor (opens inline modal) and saves via new API
async function renderWeightsEditor(ex, form) {
  // build editor overlay
  let overlay = document.getElementById('weights-editor-overlay');
  if (!overlay) {
    overlay = document.createElement('div'); overlay.id = 'weights-editor-overlay'; overlay.style.position='fixed'; overlay.style.inset='0'; overlay.style.zIndex='1200'; overlay.style.background='rgba(0,0,0,0.4)';
    document.body.appendChild(overlay);
  }
  overlay.innerHTML = '';

  const panel = document.createElement('div');
  panel.style.width='760px'; panel.style.maxWidth='96%'; panel.style.margin='40px auto'; panel.style.background='#fff'; panel.style.padding='18px'; panel.style.borderRadius='8px'; panel.style.boxShadow='0 8px 32px rgba(0,0,0,0.2)'; panel.style.maxHeight='80vh'; panel.style.overflow='auto';
  const title = document.createElement('h3'); title.textContent = `Chỉnh trọng số: ${ex.title || ex.id || ''}`;
  panel.appendChild(title);

  const list = document.createElement('div'); list.style.display='flex'; list.style.flexDirection='column'; list.style.gap='8px'; list.style.marginTop='8px';

  const initial = (ex.grading_criteria && Array.isArray(ex.grading_criteria) && ex.grading_criteria.length) ? ex.grading_criteria.map(g => (typeof g==='string'?{name:g,points:0,note:''}:{ name: g.name||'', points: g.points||0, note: g.note||'' })) : ((form && form.grading_criteria && form.grading_criteria.length) ? form.grading_criteria.map(g => ({ name: g.name||'', points: g.points||0, note: g.note||'' })) : []);
  const rows = [];
  initial.forEach((g, idx) => {
    const row = document.createElement('div'); row.style.display='flex'; row.style.gap='8px'; row.style.alignItems='center';
    const name = document.createElement('input'); name.type='text'; name.value = g.name || ''; name.style.flex='1';
    const pts = document.createElement('input'); pts.type='number'; pts.min='0'; pts.value = (g.points!=null?g.points:0); pts.style.width='96px';
    const del = document.createElement('button'); del.type='button'; del.textContent='-'; del.onclick = () => { const i = rows.indexOf(row); if (i>=0) { rows.splice(i,1); list.removeChild(row); } };
    row.appendChild(name); row.appendChild(pts); row.appendChild(del);
    list.appendChild(row); rows.push(row);
  });

  const addBtn = document.createElement('button'); addBtn.type='button'; addBtn.textContent='Thêm tiêu chí'; addBtn.onclick = () => {
    const row = document.createElement('div'); row.style.display='flex'; row.style.gap='8px'; row.style.alignItems='center';
    const name = document.createElement('input'); name.type='text'; name.placeholder='Tiêu chí'; name.style.flex='1';
    const pts = document.createElement('input'); pts.type='number'; pts.min='0'; pts.value='0'; pts.style.width='96px';
    const del = document.createElement('button'); del.type='button'; del.textContent='-'; del.onclick = () => { const i = rows.indexOf(row); if (i>=0) { rows.splice(i,1); list.removeChild(row); } };
    row.appendChild(name); row.appendChild(pts); row.appendChild(del);
    list.appendChild(row); rows.push(row);
  };

  panel.appendChild(list);
  panel.appendChild(addBtn);

  const actions = document.createElement('div'); actions.style.display='flex'; actions.style.justifyContent='flex-end'; actions.style.gap='8px'; actions.style.marginTop='12px';
  const btnCancel = document.createElement('button'); btnCancel.type='button'; btnCancel.textContent='Hủy'; btnCancel.onclick = () => { overlay.remove(); };
  const btnSave = document.createElement('button'); btnSave.type='button'; btnSave.textContent='Lưu'; btnSave.onclick = async () => {
    // collect values
    const out = rows.map(r => { const inputs = r.querySelectorAll('input'); return { name: inputs[0].value || '(Không tên)', points: Number(inputs[1].value||0) }; });
    try {
      const resp = await fetch(`/api/exercise/${encodeURIComponent(ex.id)}/criteria`, { method: 'PUT', credentials: 'include', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ criteria: out }) });
      if (!resp.ok) throw new Error('Không lưu được');
      await loadSubjects(); renderManageList(); overlay.remove(); alert('Lưu th công');
    } catch (err) { console.error(err); alert('Lỗi khi lưu trọng số'); }
  };
  actions.appendChild(btnCancel); actions.appendChild(btnSave);
  panel.appendChild(actions);

  overlay.appendChild(panel);
};

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
      // PUT (Update) - call new database API
      const updatePayload = {
        subject_id: fd.get('subject_id'),
        form_id: fd.get('form_id'),
        title: fd.get('title'),
        difficulty: fd.get('difficulty'),
        description: fd.get('description'),
        requirements: (Array.isArray(currentRequirements) ? currentRequirements.slice().map(s=>String(s).trim()).filter(Boolean) : (fd.get('requirements')||'').split('\n').map(s=>s.trim()).filter(Boolean))
      };
      res = await fetch(`/api/exercise-to-db/${encodeURIComponent(orig)}`, { 
        method: 'PUT', 
        credentials: 'include', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      });
    } else {
      // POST (Create) - call new database API
      const createPayload = {
        subject_id: fd.get('subject_id'),
        form_id: fd.get('form_id'),
        title: fd.get('title'),
        difficulty: fd.get('difficulty'),
        description: fd.get('description'),
        requirements: (Array.isArray(currentRequirements) ? currentRequirements.slice().map(s=>String(s).trim()).filter(Boolean) : (fd.get('requirements')||'').split('\n').map(s=>s.trim()).filter(Boolean))
      };
      res = await fetch('/api/exercise-to-db', { 
        method: 'POST', 
        credentials: 'include', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createPayload)
      });
    }
    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.error || 'Failed');
    }
    const data = await res.json();
    alert('Lưu th công');
    // Reload page to fetch updated data from database
    window.location.reload();
  } catch (err) { console.error(err); alert('Lỗi lưu bài tập: ' + err.message); }
};

function renderManageList() {
  const container = document.getElementById('manage-list');
  if (!container) return;
  container.innerHTML = '';

  const q = (document.getElementById('search-box') && document.getElementById('search-box').value) ? document.getElementById('search-box').value.toLowerCase().trim() : '';
  const diffSel = (document.getElementById('filter-difficulty') && document.getElementById('filter-difficulty').value) ? document.getElementById('filter-difficulty').value : '';

  // Get allowed subjects for auto-expand
  const allowedSubjects = Array.isArray(state.lecturer && state.lecturer.allowed_subjects) ? (state.lecturer.allowed_subjects || []) : (state.lecturer && state.lecturer.allowed_subjects) || [];
  const isAdmin = !!(state.lecturer && state.lecturer.is_admin);

  // Render per-subject groups, with forms inside and exercises inside forms
  state.subjects.forEach((s) => {
    const subjectGroup = document.createElement('div'); subjectGroup.className = 'subject-group';
    const header = document.createElement('div'); header.className = 'subject-header';
    // Auto-expand if lecturer has allowed access to this subject
    const isAllowedSubject = isAdmin || allowedSubjects.indexOf(s.subject_id) !== -1 || allowedSubjects.indexOf(String(s.subject_id)) !== -1;
    const toggle = document.createElement('div'); toggle.className = isAllowedSubject ? 'subject-toggle' : 'subject-toggle collapsed';
    const title = document.createElement('div'); title.className = 'subject-title'; title.textContent = `${s.subject_name} — ${s.subject_id}`;
    const count = document.createElement('div'); count.className = 'subject-count'; count.textContent = `${(s.total_exercises||0)} bài`;
    header.appendChild(toggle); header.appendChild(title); header.appendChild(count);
    subjectGroup.appendChild(header);

    const formsWrap = document.createElement('div'); formsWrap.className = 'subject-exercises'; formsWrap.style.marginLeft = '12px'; formsWrap.style.marginTop = '8px'; formsWrap.style.display = isAllowedSubject ? 'block' : 'none';

    // toggle handler
    header.onclick = () => {
      const collapsed = toggle.classList.contains('collapsed');
      if (collapsed) { toggle.classList.remove('collapsed'); formsWrap.style.display = 'block'; }
      else { toggle.classList.add('collapsed'); formsWrap.style.display = 'none'; }
    };

    // For each form within subject, render a form header and its exercises
    (s.forms || []).forEach((f) => {
      const formCard = document.createElement('div'); formCard.style.marginBottom = '12px';
      const formHeader = document.createElement('div'); formHeader.style.display = 'flex'; formHeader.style.justifyContent = 'space-between'; formHeader.style.alignItems = 'center';
      const fn = document.createElement('div'); fn.style.fontWeight = '600'; fn.textContent = `${f.name} (${f.form_id}) — ${f.exercise_count || (f.exercises && f.exercises.length) || 0} bài`;
      const fd = document.createElement('div'); fd.className = 'small-muted'; fd.textContent = `${f.difficulty || ''}`;
      formHeader.appendChild(fn); formHeader.appendChild(fd);
      formCard.appendChild(formHeader);

      // exercises list
      const list = document.createElement('div'); list.style.marginTop = '8px';

      (f.exercises || []).forEach((ex) => {
        // apply search & difficulty filters
        if (diffSel && ((ex.difficulty || '').toLowerCase() !== diffSel.toLowerCase())) return;
        if (q && !((ex.title||'').toLowerCase().includes(q) || String(ex.id||'').toLowerCase().includes(q) || (ex.description||'').toLowerCase().includes(q))) return;

        const item = document.createElement('div'); item.className = 'exercise-item';
        const left = document.createElement('div'); left.className = 'exercise-left';
        const t = document.createElement('div'); t.className = 'exercise-title'; t.style.cursor = 'pointer'; t.onclick = () => showExercise(ex, f);
        // Display title with difficulty badge
        const diffLabel = normalizeDifficultyLabel(ex.difficulty) || ex.difficulty || '';
        const badgeClass = (diffLabel === 'Khó') ? 'badge hard' : (diffLabel === 'Trung bình' ? 'badge medium' : 'badge easy');
        t.innerHTML = `${ex.title || ''} <span class="exercise-badge ${badgeClass}">${diffLabel}</span>`;
        const meta = document.createElement('div'); meta.className = 'small-muted'; meta.style.marginTop = '6px'; meta.style.fontSize = '14px'; meta.style.color = '#333'; meta.style.fontWeight = '500'; meta.textContent = `ID: ${ex.id || ''} — Giảng viên: ${ex.lecturer_name || ex.owner || '(không rõ)'} `;
        left.appendChild(t); left.appendChild(meta);

        const controls = document.createElement('div'); controls.className = 'exercise-controls';

        // compute total points
        let totalPoints = 0; try { if (Array.isArray(ex.grading_criteria)) totalPoints = ex.grading_criteria.reduce((s,g)=>s+(g&&typeof g.points==='number'?g.points:0),0); } catch(e) { totalPoints=0; }

        const totalEl = document.createElement('div'); totalEl.className = 'small-muted'; totalEl.textContent = (typeof totalPoints === 'number' && totalPoints>0) ? `${totalPoints} điểm` : `${totalPoints} điểm`;

        // permission: admin can edit all; lecturers can edit their owned exercises or those within their allowed subjects
        const isAdmin = !!(state.lecturer && state.lecturer.is_admin);
        const isOwner = !!(state.lecturer && ex.owner && state.lecturer.lecturer_id && ex.owner === state.lecturer.lecturer_id);
        const allowedSubjects = Array.isArray(state.lecturer && state.lecturer.allowed_subjects) ? (state.lecturer.allowed_subjects || []) : (state.lecturer && state.lecturer.allowed_subjects) || [];
        const isAllowedSubject = !!(state.lecturer && allowedSubjects && (allowedSubjects.indexOf(s.subject_id) !== -1 || allowedSubjects.indexOf(String(s.subject_id)) !== -1));
        const canEdit = isAdmin || isOwner || isAllowedSubject;

        if (canEdit) {
          const btnE = document.createElement('button'); btnE.textContent='Sửa'; btnE.className = 'btn-edit'; btnE.onclick = () => {
            // reuse prior edit flow
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
          const btnD = document.createElement('button'); btnD.textContent='Xóa'; btnD.className = 'btn-delete'; btnD.onclick = async () => { if (!confirm('Xóa bài tập?')) return; const resp = await fetch(`/api/exercise-to-db/${ex.id}`, { method:'DELETE', headers:{'Content-Type':'application/json'}, credentials:'include', body:JSON.stringify({subject_id:s.subject_id}) }); if (!resp.ok) { const err=await resp.text(); alert('Không thể xóa: ' + err); return; } window.location.reload(); };
          controls.appendChild(btnE); controls.appendChild(btnD);
        } else {
          const btnV = document.createElement('button'); btnV.textContent='Xem'; btnV.onclick = () => showExercise(ex, f);
          controls.appendChild(btnV);
        }

        item.appendChild(left);
        const right = document.createElement('div'); right.style.display='flex'; right.style.flexDirection='column'; right.style.alignItems='flex-end'; right.style.gap='6px';
        right.appendChild(totalEl); right.appendChild(controls);
        item.appendChild(right);

        list.appendChild(item);
      });

      formCard.appendChild(list);
      formsWrap.appendChild(formCard);
    });

    subjectGroup.appendChild(formsWrap);
    container.appendChild(subjectGroup);
  });
}

// Export button removed from lecturer UI; export handled elsewhere when needed

// ==================================================
// ADMIN FUNCTIONS - SIDEBAR MANAGEMENT
// ==================================================
function initAdminUI() {
  console.log('initAdminUI called, lecturer:', state.lecturer);
  
  // Show admin menu items if user is admin
  if (state.lecturer && state.lecturer.is_admin) {
    console.log('User is admin, showing admin menus');
    // Show admin menu items (users, history)
    document.querySelectorAll('.menu-item[data-section="users"]').forEach(item => {
      item.style.display = 'block';
    });
    document.querySelectorAll('.menu-item[data-section="history"]').forEach(item => {
      item.style.display = 'block';
    });
  } else {
    console.log('User is not admin or not logged in');
  }
  
  // Attach menu item click handlers for sidebar navigation
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      switchAdminTab(item.dataset.section);
    });
  });
  
  // Attach logout button handler
  const logoutBtn = document.getElementById('btn-logout-sidebar');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      fetch('/api/lecturer/logout', { method: 'POST', credentials: 'include' }).finally(() => {
        try { localStorage.removeItem('lecturer'); } catch(e) {}
        // Clear state cache to prevent data leak between accounts
        state.subjects = [];
        state.currentSubject = null;
        state.lecturer = null;
        state.expandedForms = {};
        window.location.href = '/login';
      });
    });
  }
}

function switchAdminTab(sectionName) {
  console.log('switchAdminTab called:', sectionName);
  
  // Hide all sections by setting style.display
  document.querySelectorAll('.section-lecturer').forEach(s => {
    s.style.display = 'none';
  });
  
  // Show selected section by forcing display:block
  const section = document.getElementById(`section-${sectionName}`);
  if (section) {
    section.style.display = 'block';
    console.log('Showing section:', sectionName);
  }
  
  // Update active menu item styling
  document.querySelectorAll('.menu-item').forEach(item => {
    if (item.dataset.section === sectionName) {
      item.classList.add('active');
    } else {
      item.classList.remove('active');
    }
  });
  
  // Update page title
  const pageTitle = document.getElementById('page-title');
  if (pageTitle) {
    if (sectionName === 'exercises') pageTitle.textContent = 'Quản lý bài tập';
    if (sectionName === 'users') pageTitle.textContent = 'Quản Lí Người Dùng';
    if (sectionName === 'history') pageTitle.textContent = 'Lịch Sử Hệ Thống';
  }
  
  // Load data
  if (sectionName === 'users') loadLecturersData();
  if (sectionName === 'history') loadHistoryData();
}

async function loadLecturersData() {
  try {
    const lecturers = await fetchJSON('/api/admin/lecturers', { credentials: 'include' });
    const tbody = document.getElementById('lecturers-tbody');
    tbody.innerHTML = '';
    
    lecturers.forEach(lec => {
      const subjects = (lec.allowed_subjects || []).join(', ') || '-';
      const row = document.createElement('tr');
      row.style.borderBottom = '1px solid #eee';
      row.innerHTML = `
        <td style="padding:10px">${lec.lecturer_id}</td>
        <td style="padding:10px">${lec.name}</td>
        <td style="padding:10px">${subjects}</td>
        <td style="padding:10px">${lec.exercise_count || 0}</td>
        <td style="padding:10px">${lec.is_admin ? '<span style="background:#d4edda;color:#155724;padding:2px 6px;border-radius:3px;font-size:12px;font-weight:600">Admin</span>' : '<span style="background:#dbeafe;color:#1e40af;padding:2px 6px;border-radius:3px;font-size:12px;font-weight:600">GV</span>'}</td>
        <td style="padding:10px">
          <button onclick="editLecturer('${lec.lecturer_id}')" style="padding:6px 12px;background:#2563eb;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px">Sửa</button>
          <button onclick="deleteLecturer('${lec.lecturer_id}')" style="padding:6px 12px;background:#dc2626;color:white;border:none;border-radius:4px;cursor:pointer;font-size:12px;margin-left:6px">Xoá</button>
        </td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error('Error loading lecturers:', err);
    alert('Lỗi tải dữ liệu');
  }
}

async function loadHistoryData() {
  try {
    const type = document.getElementById('history-type').value;
    const head = document.getElementById('history-head');
    const tbody = document.getElementById('history-tbody');
    tbody.innerHTML = '';
    
    if (type === 'login') {
      head.innerHTML = `
        <th style="padding:10px;text-align:left">Mã GV</th>
        <th style="padding:10px;text-align:left">Tên</th>
        <th style="padding:10px;text-align:left">Đăng Nhập</th>
        <th style="padding:10px;text-align:left">Đăng Xuất</th>
        <th style="padding:10px;text-align:left">Thời Lượng</th>
      `;
      const history = await fetchJSON('/api/admin/login-history', { credentials: 'include' });
      history.forEach(h => {
        const loginTime = new Date(h.login_time).toLocaleString('vi-VN');
        const logoutTime = h.logout_time ? new Date(h.logout_time).toLocaleString('vi-VN') : 'Đang hoạt động';
        const duration = h.duration ? `${h.duration}m` : '--';
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #eee';
        row.innerHTML = `
          <td style="padding:10px">${h.lecturer_id}</td>
          <td style="padding:10px">${h.name}</td>
          <td style="padding:10px;font-size:12px">${loginTime}</td>
          <td style="padding:10px;font-size:12px">${logoutTime}</td>
          <td style="padding:10px">${duration}</td>
        `;
        tbody.appendChild(row);
      });
    } else {
      head.innerHTML = `
        <th style="padding:10px;text-align:left">Mã GV</th>
        <th style="padding:10px;text-align:left">Bài Tập</th>
        <th style="padding:10px;text-align:left">Hành Động</th>
        <th style="padding:10px;text-align:left">Thời Gian</th>
      `;
      const audit = await fetchJSON('/api/admin/exercise-audit', { credentials: 'include' });
      audit.forEach(a => {
        const time = new Date(a.timestamp).toLocaleString('vi-VN');
        const actionBadge = a.action === 'create' ? '<span style="background:#d4edda;padding:2px 6px;border-radius:3px;font-size:11px;font-weight:600">Tạo</span>' :
                           a.action === 'update' ? '<span style="background:#fff3cd;padding:2px 6px;border-radius:3px;font-size:11px;font-weight:600">Sửa</span>' :
                           '<span style="background:#f8d7da;padding:2px 6px;border-radius:3px;font-size:11px;font-weight:600">Xoá</span>';
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #eee';
        row.innerHTML = `
          <td style="padding:10px">${a.lecturer_id}</td>
          <td style="padding:10px">${a.exercise_title}</td>
          <td style="padding:10px">${actionBadge}</td>
          <td style="padding:10px;font-size:12px">${time}</td>
        `;
        tbody.appendChild(row);
      });
    }
  } catch (err) {
    console.error('Error loading history:', err);
  }
}

function openAddLecturerModal() {
  document.getElementById('lecturer-modal-title').textContent = 'Thêm Giảng Viên';
  document.getElementById('lecturer-id').value = '';
  document.getElementById('lecturer-name').value = '';
  document.getElementById('lecturer-password').value = '';
  document.getElementById('lecturer-admin').checked = false;
  document.getElementById('lecturer-id').disabled = false;
  document.getElementById('lecturer-modal').classList.add('show');
}

function closeLecturerModal() {
  document.getElementById('lecturer-modal').classList.remove('show');
}

async function editLecturer(lecturerId) {
  try {
    const lec = await fetchJSON(`/api/admin/lecturer/${lecturerId}`, { credentials: 'include' });
    document.getElementById('lecturer-modal-title').textContent = 'Chỉnh Sửa Giảng Viên';
    document.getElementById('lecturer-id').value = lec.lecturer_id;
    document.getElementById('lecturer-name').value = lec.name;
    document.getElementById('lecturer-password').value = '';
    document.getElementById('lecturer-password').placeholder = 'Để trống để giữ mật khẩu hiện tại';
    document.getElementById('lecturer-admin').checked = lec.is_admin;
    document.getElementById('lecturer-id').disabled = true;
    document.getElementById('lecturer-modal').classList.add('show');
  } catch (err) {
    alert('Lỗi: ' + err.message);
  }
}

async function saveLecturer(ev) {
  ev.preventDefault();
  const lecturerId = document.getElementById('lecturer-id').value;
  const name = document.getElementById('lecturer-name').value;
  const password = document.getElementById('lecturer-password').value;
  const isAdmin = document.getElementById('lecturer-admin').checked;
  
  if (!lecturerId || !name) {
    alert('Vui lòng điền đầy đủ thông tin');
    return;
  }
  
  try {
    const method = document.getElementById('lecturer-id').disabled ? 'PUT' : 'POST';
    const res = await fetch('/api/admin/lecturer', {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ lecturer_id: lecturerId, name, password, is_admin: isAdmin })
    });
    if (!res.ok) throw new Error('Failed to save');
    alert('Lưu th công');
    closeLecturerModal();
    loadLecturersData();
  } catch (err) {
    alert('Lỗi: ' + err.message);
  }
}

async function deleteLecturer(lecturerId) {
  if (!confirm(`Xoá giảng viên ${lecturerId}?`)) return;
  try {
    const res = await fetch(`/api/admin/lecturer/${lecturerId}`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (!res.ok) throw new Error('Failed to delete');
    alert('Xoá th công');
    loadLecturersData();
  } catch (err) {
    alert('Lỗi: ' + err.message);
  }
}

function closePermissionsModal() {
  document.getElementById('permissions-modal').classList.remove('show');
}

async function openPermissionsModal() {
  // Load lecturers into dropdown
  try {
    const lecturers = await fetchJSON('/api/admin/lecturers', { credentials: 'include' });
    const select = document.getElementById('permissions-lecturer');
    select.innerHTML = '<option value="">-- Chọn --</option>';
    lecturers.forEach(lec => {
      const option = document.createElement('option');
      option.value = lec.lecturer_id;
      option.textContent = `${lec.lecturer_id} - ${lec.name}`;
      select.appendChild(option);
    });
    document.getElementById('permissions-modal').classList.add('show');
  } catch (err) {
    alert('Lỗi: ' + err.message);
  }
}

async function loadLecturerPermissions() {
  const lecturerId = document.getElementById('permissions-lecturer').value;
  if (!lecturerId) return;
  
  try {
    const res = await fetchJSON(`/api/admin/lecturer/${lecturerId}/permissions`, { credentials: 'include' });
    const permList = document.getElementById('permissions-list');
    permList.innerHTML = '';
    
    state.subjects.forEach(subject => {
      const isAllowed = res.allowed_subjects && res.allowed_subjects.includes(subject.subject_id);
      const label = document.createElement('label');
      label.style.display = 'block';
      label.style.marginBottom = '8px';
      label.innerHTML = `
        <input type="checkbox" class="subject-perm" value="${subject.subject_id}" ${isAllowed ? 'checked' : ''} />
        ${subject.subject_name}
      `;
      permList.appendChild(label);
    });
  } catch (err) {
    alert('Lỗi: ' + err.message);
  }
}

async function savePermissions() {
  const lecturerId = document.getElementById('permissions-lecturer').value;
  if (!lecturerId) {
    alert('Vui lòng chọn giảng viên');
    return;
  }
  
  const allowedSubjects = Array.from(document.querySelectorAll('.subject-perm:checked')).map(el => el.value);
  
  try {
    const res = await fetch(`/api/admin/lecturer/${lecturerId}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ allowed_subjects: allowedSubjects })
    });
    if (!res.ok) throw new Error('Failed to save');
    alert('Cập nhật th công');
    closePermissionsModal();
  } catch (err) {
    alert('Lỗi: ' + err.message);
  }
}

// Init: Load subjects and setup admin UI
loadSubjects().then(() => {
  console.log('loadSubjects completed, state.lecturer:', state.lecturer);
  initAdminUI();
  
  // Setup history type filter
  const historyType = document.getElementById('history-type');
  if (historyType) {
    historyType.addEventListener('change', loadHistoryData);
  }
}).catch(err => console.error('Error initializing admin UI:', err));
