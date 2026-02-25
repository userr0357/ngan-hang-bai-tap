const API = '';

async function fetchJSON(url, opts) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

const state = { 
  subjects: [], 
  currentSubject: null, 
  expandedForms: {}, 
  searchQuery: '', 
  difficultyFilter: '',
  currentPage: 1,
  itemsPerPage: 10,
  sortBy: 'id',
  sortOrder: 'asc',
  viewMode: 'grid',
  selectedExercise: null
};

// difficulty order mapping
const DIFF_ORDER = { 'dễ': 0, 'de': 0, 'trung bình': 1, 'trung': 1, 'trung binh': 1, 'khó': 2, 'kho': 2 };

function normalizeDifficultyLabel(raw) {
  if (!raw) return '';
  const s = String(raw).toLowerCase().trim();
  if (s.includes('dễ') || s.includes('de')) return 'Dễ';
  if (s.includes('khó') || s.includes('kho')) return 'Khó';
  if (s.includes('trung')) return 'Trung bình';
  const m = raw.match(/\[(.*?)\]/);
  if (m && m[1]) {
    const inner = m[1].toLowerCase();
    if (inner.includes('dễ') || inner.includes('de')) return 'Dễ';
    if (inner.includes('khó') || inner.includes('kho')) return 'Khó';
    if (inner.includes('trung')) return 'Trung bình';
  }
  return '';
}

function criteriaCount(g) {
  if (!g) return 0;
  if (Array.isArray(g)) return g.length;
  if (g.tieu_chi && Array.isArray(g.tieu_chi)) return g.tieu_chi.length;
  return 0;
}

function getCriteriaArray(g) {
  if (!g) return [];
  if (Array.isArray(g)) return g;
  if (g.tieu_chi && Array.isArray(g.tieu_chi)) return g.tieu_chi;
  return [];
}

// Dynamic form helpers for requirements and grading criteria
function addRequirementField(container, value) {
  const row = document.createElement('div');
  row.className = 'req-row';
  row.style.display = 'flex';
  row.style.gap = '8px';
  row.style.marginBottom = '6px';
  const inp = document.createElement('input');
  inp.type = 'text';
  inp.value = value || '';
  inp.style.flex = '1';
  inp.placeholder = 'Yêu cầu';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = '-';
  btn.style.width = '36px';
  btn.onclick = () => row.remove();
  row.appendChild(inp);
  row.appendChild(btn);
  container.appendChild(row);
  return row;
}

function addGradingField(container, item) {
  const row = document.createElement('div');
  row.className = 'grade-row';
  row.style.display = 'flex';
  row.style.gap = '8px';
  row.style.marginBottom = '6px';
  const name = document.createElement('input');
  name.type = 'text';
  name.className = 'grade-name';
  name.placeholder = 'Tên tiêu chí';
  name.style.flex = '1';
  const points = document.createElement('input');
  points.type = 'number';
  points.className = 'grade-points';
  points.placeholder = 'Điểm';
  points.style.width = '80px';
  const note = document.createElement('input');
  note.type = 'text';
  note.className = 'grade-note';
  note.placeholder = 'Ghi chú (tuỳ chọn)';
  note.style.width = '180px';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = '-';
  btn.style.width = '36px';
  btn.onclick = () => row.remove();
  if (typeof item === 'string') {
    name.value = item;
  } else if (item) {
    name.value = item.name || '';
    points.value = item.points != null ? item.points : '';
    note.value = item.note || '';
  }
  row.appendChild(name);
  row.appendChild(points);
  row.appendChild(note);
  row.appendChild(btn);
  container.appendChild(row);
  return row;
}

try {
  const ef = localStorage.getItem('expandedForms');
  if (ef) state.expandedForms = JSON.parse(ef);
} catch (e) { }

async function loadSubjects() {
  state.subjects = await fetchJSON('/api/subjects');
  // attempt to fetch current lecturer (if logged in via cookie)
  try {
    const me = await fetchJSON('/api/lecturer/me', { credentials: 'include' });
    state.lecturer = me;
  } catch (e) {
    state.lecturer = null;
  }
  renderSidebar();
  populateLecturerSelects();
  try { updateLoginButton(); } catch (e) {}
  try {
    const hash = (location.hash || '').replace(/^#/, '');
    const visible = getVisibleSubjects();
    if (!hash && visible && visible.length) {
      await selectSubject(visible[0].subject_id);
    }
  } catch (e) { }
}

function getVisibleSubjects() {
  if (!state.lecturer) return state.subjects || [];
  if (state.lecturer.is_admin) return state.subjects || [];
  const allowed = state.lecturer.allowed_subjects || [];
  return (state.subjects || []).filter(s => allowed.includes(s.subject_id));
}

function renderSidebar() {
  const ul = document.getElementById('subject-list');
  if (!ul) return;
  ul.innerHTML = '';
  const subjectsToShow = getVisibleSubjects();
  subjectsToShow.forEach(s => {
    const li = document.createElement('li');
    li.textContent = `${s.subject_name} (${s.total_exercises})`;
    li.onclick = async () => { 
      state.currentPage = 1;
      await selectSubject(s.subject_id); 
      renderSidebar(); 
    };
    if (state.currentSubject && state.currentSubject.subject_id === s.subject_id) li.classList.add('active');
    ul.appendChild(li);
  });
}

async function selectSubject(id) {
  const subject = await fetchJSON(`/api/subject/${id}`);
  state.currentSubject = subject;
  renderSubject();
  renderSidebar();
  try { history.replaceState(null, '', '#' + id); } catch (e) { location.hash = '#' + id; }
}

function getFilteredExercises() {
  if (!state.currentSubject) return [];
  const searchLower = state.searchQuery.toLowerCase();
  const allExercises = [];

  state.currentSubject.forms.forEach(form => {
    (form.exercises || []).forEach(ex => {
      const matchSearch = !searchLower || (ex.title && ex.title.toLowerCase().includes(searchLower)) || (ex.id && ex.id.toLowerCase().includes(searchLower));
      const matchDiff = !state.difficultyFilter || ex.difficulty === state.difficultyFilter;
      if (matchSearch && matchDiff) {
        allExercises.push({ form, exercise: ex });
      }
    });
  });

  allExercises.sort((a, b) => {
    let aVal, bVal;
    if (state.sortBy === 'title') {
      aVal = (a.exercise.title || '').toLowerCase();
      bVal = (b.exercise.title || '').toLowerCase();
    } else if (state.sortBy === 'difficulty') {
      const diffOrder = { 'Dễ': 0, 'Trung bình': 1, 'Khó': 2 };
      aVal = diffOrder[a.exercise.difficulty] || 999;
      bVal = diffOrder[b.exercise.difficulty] || 999;
    } else {
      aVal = (a.exercise.id || '').toLowerCase();
      bVal = (b.exercise.id || '').toLowerCase();
    }
    
    if (aVal < bVal) return state.sortOrder === 'asc' ? -1 : 1;
    if (aVal > bVal) return state.sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return allExercises;
}

function getPaginatedExercises() {
  const all = getFilteredExercises();
  const start = (state.currentPage - 1) * state.itemsPerPage;
  const end = start + state.itemsPerPage;
  return {
    exercises: all.slice(start, end),
    totalCount: all.length,
    totalPages: Math.ceil(all.length / state.itemsPerPage),
    currentPage: state.currentPage
  };
}

function updateStats() {
  const exercises = getFilteredExercises().map(e => e.exercise);
  const total = exercises.length;
  const easy = exercises.filter(e => e.difficulty === 'Dễ').length;
  const medium = exercises.filter(e => e.difficulty === 'Trung bình').length;
  const hard = exercises.filter(e => e.difficulty === 'Khó').length;
  
  const st = document.getElementById('stat-total');
  const se = document.getElementById('stat-easy');
  const sm = document.getElementById('stat-medium');
  const sh = document.getElementById('stat-hard');
  
  if (st) st.textContent = total;
  if (se) se.textContent = easy;
  if (sm) sm.textContent = medium;
  if (sh) sh.textContent = hard;
}

function renderPagination() {
  const container = document.getElementById('pagination-control');
  if (!container) return;
  
  const { totalPages, currentPage } = getPaginatedExercises();
  if (totalPages <= 1) {
    container.innerHTML = '';
    return;
  }
  
  let html = '<div class="pagination" style="text-align:center; margin:20px 0; padding:10px; border-top:1px solid #ddd;">';
  html += `<span style="margin:0 5px;">Trang ${currentPage} / ${totalPages}</span> `;
  
  if (currentPage > 1) {
    html += `<button onclick="changePage(${currentPage - 1})" style="padding:5px 10px; margin:0 3px;">← Trước</button>`;
  }
  
  for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
    if (i === currentPage) {
      html += `<button onclick="changePage(${i})" style="padding:5px 10px; margin:0 3px; font-weight:bold; background:#007bff; color:white;">${i}</button>`;
    } else {
      html += `<button onclick="changePage(${i})" style="padding:5px 10px; margin:0 3px;">${i}</button>`;
    }
  }
  
  if (currentPage < totalPages) {
    html += `<button onclick="changePage(${currentPage + 1})" style="padding:5px 10px; margin:0 3px;">Tiếp →</button>`;
  }
  
  html += '</div>';
  container.innerHTML = html;
}

function changePage(page) {
  const { totalPages } = getPaginatedExercises();
  if (page >= 1 && page <= totalPages) {
    state.currentPage = page;
    renderSubject();
  }
}

function changeSortBy(field) {
  if (state.sortBy === field) {
    state.sortOrder = state.sortOrder === 'asc' ? 'desc' : 'asc';
  } else {
    state.sortBy = field;
    state.sortOrder = 'asc';
  }
  state.currentPage = 1;
  renderSubject();
}

function renderSubject() {
  const s = state.currentSubject;
  if (!s) return;
  
  const titleEl = document.getElementById('subject-title');
  const descEl = document.getElementById('subject-desc');
  const container = document.getElementById('forms-container');
  
  if (!container) return;
  
  if (titleEl) titleEl.textContent = s.subject_name;
  if (descEl) descEl.textContent = s.description || '';
  
  container.innerHTML = '';

  const sortedForms = [...s.forms].sort((a,b) => {
    const da = DIFF_ORDER[(normalizeDifficultyLabel(a.difficulty)||a.difficulty||'').toLowerCase()] ?? 1;
    const db = DIFF_ORDER[(normalizeDifficultyLabel(b.difficulty)||b.difficulty||'').toLowerCase()] ?? 1;
    if (da !== db) return da - db;
    return (a.name||'').localeCompare(b.name||'');
  });

  sortedForms.forEach(form => {
    const filtered = getFilteredExercises().filter(e => e.form.form_id === form.form_id);
    if (filtered.length === 0) return;

    const group = document.createElement('div');
    group.className = 'subject-group';

    const header = document.createElement('div');
    header.className = 'subject-header';
    header.style.cursor = 'pointer';

    const toggle = document.createElement('span');
    toggle.className = 'subject-toggle';
    
    const title = document.createElement('span');
    title.className = 'subject-title';
    title.textContent = `${form.name} — ${form.difficulty || ''}`;
    
    const count = document.createElement('span');
    count.className = 'subject-count';
    count.textContent = `${filtered.length} bài`;

    header.appendChild(toggle);
    header.appendChild(title);
    header.appendChild(count);

    const grid = document.createElement('div');
    grid.className = 'exercises-grid show';

    filtered.forEach(({form: f, exercise: ex}) => {
      const card = document.createElement('div');
      card.className = 'exercise-card';
      card.onclick = () => showExerciseDetail(ex, f);

      const cardTitle = document.createElement('div');
      cardTitle.className = 'exercise-card-title';
      cardTitle.textContent = ex.title || '';

      const badge = document.createElement('span');
      badge.className = 'exercise-card-badge';
      if (ex.difficulty === 'Dễ') badge.classList.add('badge-easy');
      else if (ex.difficulty === 'Trung bình') badge.classList.add('badge-medium');
      else if (ex.difficulty === 'Khó') badge.classList.add('badge-hard');
      badge.textContent = ex.difficulty || '';

      const meta = document.createElement('div');
      meta.className = 'exercise-card-meta';
      meta.textContent = `ID: ${ex.id}`;

      const footer = document.createElement('div');
      footer.className = 'exercise-card-footer';
      footer.innerHTML = `📋 ${ex.requirements?.length || 0} yêu cầu | 📊 ${criteriaCount(ex.grading_criteria)} tiêu chí`;

      card.appendChild(cardTitle);
      card.appendChild(badge);
      card.appendChild(meta);
      card.appendChild(footer);
      grid.appendChild(card);
    });

    header.onclick = () => {
      toggle.classList.toggle('collapsed');
      grid.classList.toggle('show');
      const isCollapsed = toggle.classList.contains('collapsed');
      localStorage.setItem(`form-${form.form_id}`, isCollapsed ? 'collapsed' : 'expanded');
    };

    const savedState = localStorage.getItem(`form-${form.form_id}`);
    if (savedState === 'collapsed') {
      toggle.classList.add('collapsed');
      grid.classList.remove('show');
    }

    group.appendChild(header);
    group.appendChild(grid);
    container.appendChild(group);
  });

  updateStats();
  renderPagination();
}

function showExerciseDetail(exercise, form) {
  const modal = document.getElementById('detail-modal');
  if (!modal) return;
  
  const titleEl = document.getElementById('detail-title');
  const bodyEl = document.getElementById('detail-body');
  
  if (titleEl) titleEl.innerHTML = `${exercise.title} <span class="modal-badge">${exercise.difficulty}</span>`;
  
  if (bodyEl) {
    bodyEl.innerHTML = `
      <div class="modal-section">
        <div class="modal-section-title">Thông tin bài tập</div>
        <p><strong>ID:</strong> ${exercise.id}</p>
        <p><strong>Dạng:</strong> ${form.name}</p>
        <p><strong>Độ khó:</strong> ${exercise.difficulty}</p>
        <p><strong>Định dạng nộp:</strong> ${exercise.submission_format || '(không xác định)'}</p>
      </div>
      ${exercise.description ? `<div class="modal-section">
        <div class="modal-section-title">Mô tả</div>
        <div>${DOMPurify.sanitize(marked.parse(exercise.description))}</div>
      </div>` : ''}
      ${exercise.requirements && exercise.requirements.length ? `<div class="modal-section">
        <div class="modal-section-title">Yêu cầu (${exercise.requirements.length})</div>
        <ul>${exercise.requirements.map(r => `<li>${DOMPurify.sanitize(marked.parse(r))}</li>`).join('')}</ul>
      </div>` : ''}
      ${criteriaCount(exercise.grading_criteria) ? (() => {
        const arr = getCriteriaArray(exercise.grading_criteria);
        return `<div class="modal-section">
        <div class="modal-section-title">Tiêu chí chấm (${arr.length})</div>
        <ul>${arr.map(g => `<li>${DOMPurify.sanitize(marked.parse(typeof g === 'string' ? g : g.name || ''))}</li>`).join('')}</ul>
      </div>`;
      })() : ''}
    `;
  }

  modal.classList.add('show');
}

function showExercise(ex) {
  function escapeHtml(s) {
    if (s == null) return '';
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function renderGradingHtml(criteria) {
    console.log('Rendering grading criteria:', criteria);
    let items = [];
    if (!criteria) {
      return '<div class="small muted">(Không có tiêu chí)</div>';
    }
    if (criteria.tieu_chi && Array.isArray(criteria.tieu_chi)) {
      items = criteria.tieu_chi;
    } else if (Array.isArray(criteria)) {
      items = criteria;
    } else {
      return '<div class="small muted">(Không có tiêu chí)</div>';
    }

    if (!items.length) return '<div class="small muted">(Không có tiêu chí)</div>';
    return '<ul>' + items.map(g => {
      if (!g) return '<li>(Không xác định)</li>';
      if (typeof g === 'string') return `<li>${escapeHtml(g)}</li>`;
      const name = escapeHtml(g.name || '(Không tên)');
      const note = g.note ? ` — ${escapeHtml(g.note)}` : '';
      return `<li><strong>${name}</strong>${note}</li>`;
    }).join('') + '</ul>';
  }

  const d = document.getElementById('exercise-detail');
  if (!d) return;
  
  const rawHtml = (typeof marked !== 'undefined') ? marked.parse(ex.description || '') : (ex.description || '');
  const safeHtml = (typeof DOMPurify !== 'undefined') ? DOMPurify.sanitize(rawHtml) : rawHtml;
  const sampleIn = ex.example_input ? `<pre class="sample">${ex.example_input}</pre>` : '<div class="small muted">(Không có ví dụ đầu vào)</div>';
  const sampleOut = ex.example_output ? `<pre class="sample">${ex.example_output}</pre>` : '<div class="small muted">(Không có ví dụ đầu ra)</div>';
  const attached = (ex.attached_files||[]).map(f=>f.originalname || f.filename).join(', ') || '(Không có)';
  const diffLabel = normalizeDifficultyLabel(ex.difficulty) || ex.difficulty || '';
  const badgeClass = (diffLabel === 'Khó') ? 'badge hard' : (diffLabel === 'Trung bình' ? 'badge medium' : 'badge easy');
  
  d.innerHTML = `
    <button class="close-ex" id="exercise-close-btn">×</button>
    <h2>${ex.title} <span class="${badgeClass}" style="margin-left:12px">${diffLabel || ex.difficulty || ''}</span></h2>
    <div><strong>Mô tả chi tiết:</strong><div>${safeHtml}</div></div>
    <div><strong>Yêu cầu:</strong><ol>${(ex.requirements||[]).map(r => `<li>${r}</li>`).join('')}</ol></div>
    <div><strong>Đầu vào (ví dụ):</strong>${sampleIn}</div>
    <div><strong>Đầu ra (ví dụ):</strong>${sampleOut}</div>
    <div><strong>Tiêu chí chấm:</strong>${renderGradingHtml(ex.grading_criteria)}</div>
    <div><strong>Cách nộp / Định dạng:</strong> ${ex.submission_format || '(Không có)'}</div>
    <div><strong>File đính kèm:</strong> ${attached}</div>
  `;
  
  let overlay = document.getElementById('exercise-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'exercise-overlay';
    document.body.appendChild(overlay);
  }
  overlay.classList.add('show');
  overlay.style.position = 'fixed'; 
  overlay.style.inset = '0'; 
  overlay.style.zIndex = '1098';
  setTimeout(()=> overlay.classList.add('show'), 10);
  
  d.classList.remove('hidden');
  d.classList.remove('open');
  requestAnimationFrame(()=> d.classList.add('open'));

  function closePanel(){
    d.classList.remove('open');
    overlay.classList.remove('show');
    d.addEventListener('transitionend', function handler(){ d.classList.add('hidden'); d.removeEventListener('transitionend', handler); }, { once: true });
  }

  overlay.onclick = closePanel;
  const closeBtn = document.getElementById('exercise-close-btn');
  if (closeBtn) closeBtn.onclick = closePanel;
}

// Theme
function applyTheme(theme) {
  if (theme === 'dark') document.body.classList.add('dark-mode'); else document.body.classList.remove('dark-mode');
}
try { const saved = localStorage.getItem('theme'); if (saved) applyTheme(saved); } catch (e) {}
const themeToggle = document.getElementById('theme-toggle'); 
if (themeToggle) themeToggle.onclick = () => { 
  try { 
    const cur = document.body.classList.contains('dark-mode') ? 'dark' : 'light'; 
    const next = cur === 'dark' ? 'light' : 'dark'; 
    applyTheme(next); 
    localStorage.setItem('theme', next); 
  } catch (e) {} 
};

// Lecturer flow
const btnLogin = document.getElementById('btn-login');

function updateLoginButton() {
  if (!btnLogin) return;
  btnLogin.textContent = 'Đăng nhập giảng viên';
  btnLogin.onclick = () => { window.location.href = '/login'; };
}

updateLoginButton();

const loginCancelEl = document.getElementById('login-cancel');
if (loginCancelEl) loginCancelEl.onclick = () => {
  const m = document.getElementById('lecturer-modal'); 
  if (m) m.classList.add('hidden');
};

const searchInput = document.getElementById('search-input');
const filterDiff = document.getElementById('filter-difficulty');
const modalClose = document.getElementById('modal-close');
const detailModal = document.getElementById('detail-modal');

if (searchInput) searchInput.addEventListener('input', (e) => {
  state.searchQuery = e.target.value;
  state.currentPage = 1;
  renderSubject();
});

if (filterDiff) filterDiff.addEventListener('change', (e) => {
  state.difficultyFilter = e.target.value;
  state.currentPage = 1;
  renderSubject();
});

if (modalClose) modalClose.addEventListener('click', () => {
  if (detailModal) detailModal.classList.remove('show');
});

if (detailModal) detailModal.addEventListener('click', (e) => {
  if (e.target === detailModal) detailModal.classList.remove('show');
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && detailModal && detailModal.classList.contains('show')) {
    detailModal.classList.remove('show');
  }
});

const panelModal = document.getElementById('lecturer-panel');
const loginCloseBtn = document.getElementById('login-close');
const panelCloseBtn = document.getElementById('panel-close');
const loginCloseText = document.getElementById('login-close-text');
const panelCloseText = document.getElementById('panel-close-text');

if (loginCloseBtn) loginCloseBtn.onclick = () => { if (loginModal) loginModal.classList.add('hidden'); };
if (panelCloseBtn) panelCloseBtn.onclick = () => { if (panelModal) panelModal.classList.add('hidden'); };
if (loginCloseText) loginCloseText.onclick = () => { if (loginModal) loginModal.classList.add('hidden'); };
if (panelCloseText) panelCloseText.onclick = () => { if (panelModal) panelModal.classList.add('hidden'); };

const loginModal = document.getElementById('lecturer-modal');
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
    window.location.href = '/lecturer';
  } catch (err) {
    alert('Đăng nhập thất bại');
  }
};

function openLecturerPanel() {
  const panel = document.getElementById('lecturer-panel');
  if (!panel) return;
  panel.classList.remove('hidden');
  const infoEl = document.getElementById('lecturer-info');
  if (infoEl && state.lecturer) infoEl.textContent = `Giảng viên: ${state.lecturer.name} (${state.lecturer.lecturer_id || ''})`;
  populateLecturerSelects();
  renderManageList();
  setTimeout(() => {
    const first = panel.querySelector('#form-subject');
    if (first) first.focus();
  }, 50);
}

const btnLogout = document.getElementById('btn-logout');
if (btnLogout) btnLogout.onclick = () => {
  fetch('/api/lecturer/logout', { method: 'POST', credentials: 'include' }).finally(()=>{
    try { localStorage.removeItem('lecturer'); } catch(e){}
    try { localStorage.removeItem('theme'); } catch(e){}
    // ensure client redirects to login page after logout
    window.location.href = '/login';
  });
};

function populateLecturerSelects() {
  const selSub = document.getElementById('form-subject');
  const selForm = document.getElementById('form-form');
  if (!selSub) return;
  selSub.innerHTML = '';
  const subjectsToShow = state.lecturer && !state.lecturer.is_admin ? getVisibleSubjects() : state.subjects;
  (subjectsToShow || []).forEach(s => {
    const o = document.createElement('option'); 
    o.value = s.subject_id; 
    o.textContent = s.subject_name; 
    selSub.appendChild(o);
  });
  selSub.onchange = () => {
    const sub = state.subjects.find(x => x.subject_id === selSub.value);
    if (!selForm) return;
    selForm.innerHTML = '';
    if (sub && sub.forms) {
      sub.forms.forEach(f => { 
        const o = document.createElement('option'); 
        o.value = f.form_id; 
        o.textContent = `${f.name} (${f.difficulty})`; 
        selForm.appendChild(o); 
      });
    }
  };
  if (state.subjects.length) selSub.onchange();
}

const exerciseCancel = document.getElementById('exercise-cancel');
if (exerciseCancel) exerciseCancel.onclick = () => {
  const p = document.getElementById('lecturer-panel'); 
  if (p) p.classList.add('hidden');
};

const exerciseForm = document.getElementById('exercise-form');

function parseCriteriaText(text) {
  const lines = (text || '').split('\n').map(s=>s.trim()).filter(Boolean);
  const out = [];
  for (const line of lines) {
    const m = line.match(/(\d+)\s*p?\b/i);
    if (m) {
      const pts = parseInt(m[1], 10);
      const idx = line.indexOf(m[0]);
      const namePart = line.substring(0, idx).replace(/[-–—|:]+$/,'').trim();
      const notePart = line.substring(idx + m[0].length).replace(/^[-–—|:]+/,'').trim();
      out.push({ name: namePart || '(Không tên)', points: pts, note: notePart || '' });
    } else {
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
    requirements: (fd.get('requirements')||'').split('\n').map(s=>s.trim()).filter(Boolean),
    grading_criteria: parseCriteriaText(fd.get('grading_criteria')||''),
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
  
  const subjectsToShow = state.lecturer && !state.lecturer.is_admin ? getVisibleSubjects() : state.subjects;
  (subjectsToShow || []).forEach(s => {
    const h = document.createElement('h4'); 
    h.textContent = s.subject_name; 
    h.style.marginTop = '20px';
    container.appendChild(h);
    
    s.forms.forEach(f => {
      const formDiv = document.createElement('div'); 
      formDiv.innerHTML = `<strong style="display:block; margin:10px 0 5px 0;">${f.name} (${f.difficulty})</strong>`;
      
      // Table view
      const table = document.createElement('table');
      table.style.width = '100%';
      table.style.borderCollapse = 'collapse';
      table.style.marginBottom = '20px';
      table.style.fontSize = '14px';
      
      const thead = document.createElement('thead');
      thead.innerHTML = `
        <tr style="background-color: #f0f0f0; border-bottom: 2px solid #ddd;">
          <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">ID</th>
          <th style="padding: 8px; text-align: left; border: 1px solid #ddd;">Tiêu đề</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Độ khó</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Yêu cầu</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Tiêu chí</th>
          <th style="padding: 8px; text-align: center; border: 1px solid #ddd;">Hành động</th>
        </tr>
      `;
      table.appendChild(thead);
      
      const tbody = document.createElement('tbody');
      f.exercises.forEach(ex => {
        const row = document.createElement('tr');
        row.style.borderBottom = '1px solid #ddd';
        row.style.cursor = 'pointer';
        row.onmouseover = () => row.style.backgroundColor = '#f9f9f9';
        row.onmouseout = () => row.style.backgroundColor = 'transparent';
        
        const diffBadgeClass = ex.difficulty === 'Khó' ? 'badge hard' : (ex.difficulty === 'Trung bình' ? 'badge medium' : 'badge easy');
        
        row.innerHTML = `
          <td style="padding: 8px; border: 1px solid #ddd; max-width: 80px; word-break: break-word;">${ex.id}</td>
          <td style="padding: 8px; border: 1px solid #ddd; max-width: 200px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${ex.title}">${ex.title}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">
            <span class="${diffBadgeClass}" style="padding: 3px 8px; border-radius: 3px; color: white; font-size: 12px;">${ex.difficulty}</span>
          </td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${ex.requirements?.length || 0}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${criteriaCount(ex.grading_criteria)}</td>
          <td style="padding: 8px; border: 1px solid #ddd; text-align: center;"></td>
        `;
        
        // Click row to view details (remove separate detail button)
        const viewBtn = row.cells[5];
        viewBtn.innerHTML = '';
        row.onclick = () => showExerciseLecturerDetail(ex, f, s);
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.textContent = 'Sửa';
        editBtn.style.padding = '4px 8px';
        editBtn.style.marginRight = '4px';
        editBtn.style.background = '#28a745';
        editBtn.style.color = 'white';
        editBtn.style.border = 'none';
        editBtn.style.borderRadius = '3px';
        editBtn.style.cursor = 'pointer';
        editBtn.onclick = (e) => {
          e.stopPropagation();
          const formEl = document.getElementById('exercise-form');
          const original_id = document.getElementById('original_id');
          if (original_id) original_id.value = ex.id;
          if (formEl && formEl.querySelector('[name=id]')) {
            formEl.querySelector('[name=id]').value = ex.id;
            formEl.querySelector('[name=title]').value = ex.title;
            formEl.querySelector('[name=difficulty]').value = ex.difficulty;
            formEl.querySelector('[name=description]').value = ex.description || '';
            // populate dynamic requirements list
            const reqContainer = document.getElementById('requirements-list');
            if (reqContainer) {
              reqContainer.innerHTML = '';
              (ex.requirements||[]).forEach(r => addRequirementField(reqContainer, r));
            }
            // populate dynamic grading list
            const gradeContainer = document.getElementById('grading-list');
            if (gradeContainer) {
              gradeContainer.innerHTML = '';
              getCriteriaArray(ex.grading_criteria||[]).forEach(g => addGradingField(gradeContainer, g));
            }
            formEl.querySelector('[name=submission_format]').value = ex.submission_format || '';
            const selSub = document.getElementById('form-subject');
            selSub.value = s.subject_id;
            selSub.onchange && selSub.onchange();
            const formSelect = document.getElementById('form-form');
            if (formSelect) formSelect.value = f.form_id;
            try { localStorage.setItem('editTarget', JSON.stringify({ subject_id: s.subject_id, form_id: f.form_id, id: ex.id })); } catch (e) {}
            // Show exercise modal after filling form
            const modalEl = document.getElementById('exercise-modal');
            if (modalEl) {
              modalEl.classList.add('show');
              setTimeout(() => {
                const titleField = formEl.querySelector('[name=title]');
                if (titleField) titleField.focus();
              }, 100);
            }
          }
        };
        viewBtn.appendChild(editBtn);
        
        // Delete button
        const delBtn = document.createElement('button');
        delBtn.textContent = 'Xóa';
        delBtn.style.padding = '4px 8px';
        delBtn.style.background = '#dc3545';
        delBtn.style.color = 'white';
        delBtn.style.border = 'none';
        delBtn.style.borderRadius = '3px';
        delBtn.style.cursor = 'pointer';
        delBtn.onclick = async (e) => {
          e.stopPropagation();
          if (!confirm('Xóa bài tập?')) return; 
          await fetch(`/api/exercise/${ex.id}`, { method: 'DELETE', credentials: 'include' }); 
          await loadSubjects(); 
          renderManageList();
        };
        viewBtn.appendChild(delBtn);
        
        tbody.appendChild(row);
      });
      table.appendChild(tbody);
      formDiv.appendChild(table);
      container.appendChild(formDiv);
    });
  });
}

function showExerciseLecturerDetail(exercise, form, subject) {
  let modal = document.getElementById('exercise-detail-modal');
  if (!modal) {
    const newModal = document.createElement('div');
    newModal.id = 'exercise-detail-modal';
    newModal.style.cssText = 'position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.5); display:flex; align-items:center; justify-content:center; z-index:2000;';
    document.body.appendChild(newModal);
    modal = newModal;
  }
  
  const content = document.createElement('div');
  content.style.cssText = 'background:white; padding:30px; border-radius:8px; max-width:600px; max-height:80vh; overflow-y:auto; position:relative;';
  content.innerHTML = `
    <h2>${exercise.title}</h2>
    <p><strong>ID:</strong> ${exercise.id}</p>
    <p><strong>Dạng:</strong> ${form.name}</p>
    <p><strong>Môn:</strong> ${subject.subject_name}</p>
    <p><strong>Độ khó:</strong> <span class="badge ${exercise.difficulty === 'Khó' ? 'hard' : (exercise.difficulty === 'Trung bình' ? 'medium' : 'easy')}" style="padding:3px 8px; border-radius:3px; color:white;">${exercise.difficulty}</span></p>
    <hr>
    <h3>Mô tả</h3>
    <p>${exercise.description || '(Không có)'}</p>
    <h3>Yêu cầu</h3>
    <ol>${(exercise.requirements || []).map(r => `<li>${r}</li>`).join('') || '<li>(Không có)</li>'}</ol>
    <h3>Tiêu chí chấm</h3>
    <ul>${getCriteriaArray(exercise.grading_criteria).map(g => {
      if (typeof g === 'string') return `<li>${g}</li>`;
      return `<li><strong>${g.name}</strong> (${g.points}p) ${g.note ? ` — ${g.note}` : ''}</li>`;
    }).join('') || '<li>(Không có)</li>'}</ul>
    <h3>Định dạng nộp</h3>
    <p>${exercise.submission_format || '(Không có)'}</p>
  `;
  
  const closeBtn = document.createElement('button');
  closeBtn.textContent = '×';
  closeBtn.style.cssText = 'position:absolute; top:10px; right:10px; background:none; border:none; font-size:28px; cursor:pointer; color:#999;';
  closeBtn.onmouseover = () => closeBtn.style.color = '#000';
  closeBtn.onmouseout = () => closeBtn.style.color = '#999';
  closeBtn.onclick = () => modal.style.display = 'none';
  content.appendChild(closeBtn);
  
  modal.innerHTML = '';
  modal.appendChild(content);
  modal.style.display = 'flex';
  
  modal.onclick = (e) => {
    if (e.target === modal) modal.style.display = 'none';
  };
}

// init
loadSubjects().then(() => {
  // Check if this is lecturer page or student page
  const manageList = document.getElementById('manage-list');
  if (manageList) {
    // This is lecturer page - render management list after loading subjects
    renderManageList();
    
    // Setup lecturer page handlers
    const btnCreateNew = document.getElementById('btn-create-new');
    if (btnCreateNew) {
      btnCreateNew.onclick = () => {
        const form = document.getElementById('exercise-form');
        if (form) form.reset();
        const originalId = document.getElementById('original_id');
        if (originalId) originalId.value = '';
        // reset dynamic lists
        const reqContainer = document.getElementById('requirements-list');
        if (reqContainer) { reqContainer.innerHTML = ''; addRequirementField(reqContainer, ''); }
        const gradeContainer = document.getElementById('grading-list');
        if (gradeContainer) { gradeContainer.innerHTML = ''; addGradingField(gradeContainer, { name: '', points: 0, note: '' }); }
        const modal = document.getElementById('exercise-modal');
        if (modal) modal.classList.add('show');
      };
    }
    
    const modalClose = document.getElementById('modal-close');
    if (modalClose) {
      modalClose.onclick = () => {
        const modal = document.getElementById('exercise-modal');
        if (modal) modal.classList.remove('show');
      };
    }
    
    const exerciseCancel = document.getElementById('exercise-cancel');
    if (exerciseCancel) {
      exerciseCancel.onclick = () => {
        const modal = document.getElementById('exercise-modal');
        if (modal) modal.classList.remove('show');
      };
    }
    
    // Exercise form submit
    const exerciseForm = document.getElementById('exercise-form');
    if (exerciseForm) {
        exerciseForm.onsubmit = async (e) => {
          e.preventDefault();
          const formEl = e.target;
          const fd = new FormData(formEl);
          const orig = fd.get('original_id');
          // read requirements from dynamic list if present, fallback to textarea value
          const requirements = (function() {
            const rows = Array.from(formEl.querySelectorAll('.req-row input'));
            if (rows.length) return rows.map(i=>i.value.trim()).filter(Boolean);
            return (fd.get('requirements')||'').split('\n').map(s=>s.trim()).filter(Boolean);
          })();

          const grading_criteria = (function(){
            const rows = Array.from(formEl.querySelectorAll('.grade-row'));
            if (rows.length) return rows.map(r=>{
              const name = (r.querySelector('.grade-name')||{value:''}).value.trim();
              const points = (r.querySelector('.grade-points')||{value:''}).value.trim();
              const note = (r.querySelector('.grade-note')||{value:''}).value.trim();
              if (!name) return null;
              return { name, points: points?Number(points):0, note };
            }).filter(Boolean);
            // fallback: parse free text
            return parseCriteriaText(fd.get('grading_criteria')||'');
          })();

          const exercise = {
            id: fd.get('id'),
            title: fd.get('title'),
            difficulty: fd.get('difficulty'),
            description: fd.get('description'),
            requirements,
            grading_criteria,
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
          await loadSubjects();
          renderManageList();
          alert('Lưu thành công');
          formEl.reset();
          document.getElementById('original_id').value = '';
          const modal = document.getElementById('exercise-modal');
          if (modal) modal.classList.remove('show');
        } catch (err) { console.error(err); alert('Lỗi lưu bài tập'); }
      };

    // setup add/remove handlers for dynamic lists
    const reqAdd = document.getElementById('req-add');
    if (reqAdd) reqAdd.onclick = () => { const c = document.getElementById('requirements-list'); if (c) addRequirementField(c, ''); };
    const gradeAdd = document.getElementById('grade-add');
    if (gradeAdd) gradeAdd.onclick = () => { const c = document.getElementById('grading-list'); if (c) addGradingField(c, { name: '', points: 0, note: '' }); };
    }
  }
}).catch(err=>console.error(err));
