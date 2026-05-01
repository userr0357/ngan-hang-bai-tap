import re, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ─── 1. Fix styles.css ─────────────────────────────────────────
with open('public/styles.css', 'r', encoding='utf-8') as f:
    css = f.read()

# Replace sidebar-info-card CSS — high contrast solid design
old_card_css = '''.sidebar-info-card {
  background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
  border-radius: 12px; padding: 14px 12px; margin: 0 12px 20px 12px;
  color: white; box-shadow: 0 4px 12px rgba(99,102,241,0.2);
  display: flex; flex-direction: column; gap: 12px;
}
.sidebar-info-card .avatar {
  width: 40px; height: 40px; border-radius: 50%;
  background: rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: bold; border: 2px solid rgba(255,255,255,0.4);
}
.sidebar-info-card .name { font-weight: 600; font-size: 15px; margin-bottom: 2px; }
.sidebar-info-card .id { font-size: 13px; opacity: 0.9; }
.sidebar-info-card .stats { display: flex; flex-direction: column; gap: 6px; font-size: 13px; margin-top: 8px; }
.sidebar-info-card .stat-item { display: flex; align-items: center; gap: 8px; }'''

new_card_css = '''.sidebar-info-card {
  background: #1e1b4b;
  border-radius: 14px; padding: 16px 14px; margin: 0 0 16px 0;
  color: white; box-shadow: 0 6px 20px rgba(79,70,229,0.35);
  display: flex; flex-direction: column; gap: 0;
  border: 1px solid rgba(99,102,241,0.4);
}
.sidebar-info-card .avatar {
  width: 44px; height: 44px; border-radius: 12px;
  background: linear-gradient(135deg,#818cf8,#a78bfa);
  display: flex; align-items: center; justify-content: center;
  font-size: 20px; font-weight: 800; color: white;
  box-shadow: 0 4px 12px rgba(99,102,241,0.5);
}
.sidebar-info-card .name { font-weight: 700; font-size: 14px; color: #ffffff; line-height: 1.3; }
.sidebar-info-card .id { font-size: 11px; color: #a5b4fc; font-family: monospace; }
.sidebar-info-card .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 14px; }
.sidebar-info-card .stat-item {
  background: rgba(255,255,255,0.08); border-radius: 10px;
  padding: 10px 8px; text-align: center;
  border: 1px solid rgba(255,255,255,0.1);
}
.sidebar-info-card .stat-value { font-size: 22px; font-weight: 800; color: #ffffff; line-height: 1; display: block; }
.sidebar-info-card .stat-label { font-size: 10px; font-weight: 600; color: #a5b4fc; margin-top: 3px; display: block; text-transform: uppercase; letter-spacing: 0.05em; }
.sidebar-info-card .stat-status {
  grid-column: 1/-1; background: rgba(16,185,129,0.15);
  border: 1px solid rgba(16,185,129,0.35); border-radius: 8px;
  padding: 6px 12px; display: flex; align-items: center; gap: 7px;
  margin-top: 4px;
}
.sidebar-info-card .stat-dot { width: 7px; height: 7px; background: #10b981; border-radius: 50%; box-shadow: 0 0 6px #10b981; flex-shrink: 0; }
.sidebar-info-card .stat-status-text { font-size: 12px; font-weight: 600; color: #6ee7b7; }'''

if old_card_css in css:
    css = css.replace(old_card_css, new_card_css)
    print('✅ CSS sidebar card redesigned')
else:
    print('❌ CSS sidebar card not found - appending')
    css += '\n' + new_card_css

# Increase base font sizes across lecturer page
# Make body font-size bigger (currently no explicit base size except form elements at 14px)
# Add lecturer-specific font overrides
lecturer_font_css = '''
/* ═══ LECTURER PAGE FONT SIZE UPGRADES ═══ */
#app-lecturer .main-lecturer { font-size: 15px; }
#app-lecturer .exercise-item .exercise-title { font-size: 15px; }
#app-lecturer .exercise-item .small-muted { font-size: 13px; }
#app-lecturer .subject-title { font-size: 16px !important; }
#app-lecturer .menu-item { font-size: 15px !important; }
#app-lecturer .header-lecturer h1 { font-size: 26px; }
#app-lecturer .manage-table td { font-size: 14px; }
#app-lecturer select, #app-lecturer input[type="text"] { font-size: 14px; }
#app-lecturer .btn { font-size: 14px; }
#app-lecturer h2 { font-size: 22px; }
#app-lecturer h3 { font-size: 17px; }
'''

css += lecturer_font_css
with open('public/styles.css', 'w', encoding='utf-8') as f:
    f.write(css)
print('✅ CSS font sizes added')

# ─── 2. Fix app.js ─────────────────────────────────────────────
with open('public/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# 2a. Fix renderSidebarInfoCard to use new HTML structure (stat-value/stat-label/stat-status)
old_card_js = '''function renderSidebarInfoCard(lecturer, subjectsObj) {
  const card = document.getElementById('sidebar-info-card');
  if (!card) return;
  const initChar = (lecturer.name || '?').charAt(0).toUpperCase();

  const avatarEl = card.querySelector('.user-avatar-mini');
  const nameEl   = card.querySelector('.admin-user-name');
  const idEl     = card.querySelector('.sidebar-lecturer-id');
  if (avatarEl) avatarEl.textContent = initChar;
  if (nameEl)   nameEl.textContent   = lecturer.name || 'Giảng Viên';
  if (idEl)     idEl.textContent     = lecturer.lecturer_id || lecturer.id || '';

  // Fetch real counts from API (JWT has no subjects list)
  fetch('/api/lecturer/stats', { credentials: 'include' })
    .then(r => r.json())
    .then(stats => {
      const subEl = card.querySelector('.stat-count-subjects');
      const exEl  = card.querySelector('.stat-count-exercises');
      if (subEl) subEl.textContent = stats.SubjectCount ?? 0;
      if (exEl)  exEl.textContent  = stats.ExerciseCount ?? 0;
    })
    .catch(() => {});
}'''

new_card_js = '''function renderSidebarInfoCard(lecturer, subjectsObj) {
  const card = document.getElementById('sidebar-info-card');
  if (!card) return;
  const initChar = (lecturer.name || '?').charAt(0).toUpperCase();

  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
      <div class="avatar">${initChar}</div>
      <div style="min-width:0;">
        <div class="name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${lecturer.name || 'Giảng Viên'}</div>
        <div class="id">${lecturer.lecturer_id || ''}</div>
      </div>
    </div>
    <div class="stats">
      <div class="stat-item">
        <span class="stat-value stat-count-subjects">—</span>
        <span class="stat-label">Môn quản lý</span>
      </div>
      <div class="stat-item">
        <span class="stat-value stat-count-exercises">—</span>
        <span class="stat-label">Bài tập</span>
      </div>
      <div class="stat-status">
        <span class="stat-dot"></span>
        <span class="stat-status-text">Đang hoạt động</span>
      </div>
    </div>
  `;

  fetch('/api/lecturer/stats', { credentials: 'include' })
    .then(r => r.json())
    .then(stats => {
      const s = card.querySelector('.stat-count-subjects');
      const e = card.querySelector('.stat-count-exercises');
      if (s) s.textContent = stats.SubjectCount  ?? 0;
      if (e) e.textContent = stats.ExerciseCount ?? 0;
    })
    .catch(() => {});
}'''

if old_card_js in js:
    js = js.replace(old_card_js, new_card_js)
    print('✅ renderSidebarInfoCard updated')
else:
    print('❌ renderSidebarInfoCard not found')

# 2b. Fix subject group expansion — auto-expand ALL groups on lecturer page
# Find the line: const isAllowedSubject = isAdmin || ...
old_expand = "    const isAllowedSubject = isAdmin || allowedSubjects.indexOf(s.subject_id) !== -1 || allowedSubjects.indexOf(String(s.subject_id)) !== -1;"
new_expand = "    // On lecturer page: always expand (GV sees only their subjects)\n    const isAllowedSubject = true;"

if old_expand in js:
    js = js.replace(old_expand, new_expand)
    print('✅ Subject groups now auto-expand')
else:
    print('❌ isAllowedSubject line not found')

with open('public/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('Done - app.js written')
