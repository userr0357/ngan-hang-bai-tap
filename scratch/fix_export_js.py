import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('public/admin.js', 'r', encoding='utf-8') as f:
    js = f.read()

# ── Fix 1: undefined-undefined bug in initExportSection
OLD_INIT = """async function initExportSection() {
  // Populate môn học dropdowns
  try {
    const res  = await fetch('/api/subjects', { credentials: 'include' });
    const subs = await res.json();
    ['exp-ex-mamon', 'exp-gr-mamon'].forEach(id => {
      const sel = document.getElementById(id);
      if (!sel) return;
      sel.innerHTML = '<option value="">— Tất cả môn —</option>';
      subs.forEach(s => {
        const o = document.createElement('option');
        o.value = s.MaMon; o.textContent = `${s.MaMon} – ${s.TenMon}`;
        sel.appendChild(o);
      });
    });
  } catch (_) {}
  loadExportLog();
}"""

NEW_INIT = """// Store admin subjects globally for export picker
window._adminExportSubjects = [];
window._adminExportAllExercises = []; // flat list of all exercises in selected subject

async function initExportSection() {
  try {
    const res  = await fetch('/api/subjects', { credentials: 'include' });
    const subs = await res.json();
    window._adminExportSubjects = subs;
    ['exp-ex-mamon', 'exp-gr-mamon'].forEach(id => {
      const sel = document.getElementById(id);
      if (!sel) return;
      sel.innerHTML = '<option value="">— Chọn môn —</option>';
      subs.forEach(s => {
        const o = document.createElement('option');
        // Support both field naming conventions
        const code = s.subject_id || s.MaMon || '';
        const name = s.subject_name || s.TenMon || '';
        o.value = code;
        o.textContent = name ? `${code} – ${name}` : code;
        sel.appendChild(o);
      });
    });
  } catch (_) {}
  loadExportLog();
}

async function loadAdminExportList() {
  const mamon = document.getElementById('exp-ex-mamon')?.value || '';
  const container = document.getElementById('exp-ex-list-container');
  if (!container) return;

  if (!mamon) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);font-size:14px;">← Chọn môn học để xem danh sách bài tập</div>';
    window._adminExportAllExercises = [];
    updateAdminExportCount();
    return;
  }

  container.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted);">⏳ Đang tải...</div>';
  try {
    const res = await fetch(`/api/subject/${mamon}`, { credentials: 'include' });
    if (!res.ok) throw new Error('Not found');
    const subj = await res.json();
    const forms = subj.forms || [];

    // Flatten exercises with form info
    const all = [];
    forms.forEach(f => (f.exercises || []).forEach(ex => {
      all.push({ ...ex, _formName: f.name || f.form_id, _formId: f.form_id });
    }));
    window._adminExportAllExercises = all;

    // Populate form filter
    const formSel = document.getElementById('exp-ex-form');
    if (formSel) {
      formSel.innerHTML = '<option value="">Tất cả dạng</option>';
      forms.forEach(f => {
        const o = document.createElement('option');
        o.value = f.form_id; o.textContent = f.name || f.form_id;
        formSel.appendChild(o);
      });
    }

    applyAdminExportFilters();
  } catch(e) {
    container.innerHTML = `<div style="text-align:center;padding:30px;color:var(--danger);">❌ Lỗi: ${e.message}</div>`;
  }
}

function applyAdminExportFilters() {
  const formId = document.getElementById('exp-ex-form')?.value || '';
  const diff   = document.getElementById('exp-ex-diff')?.value  || '';
  const level  = document.getElementById('exp-ex-level')?.value || '';

  const all = window._adminExportAllExercises || [];
  const filtered = all.filter(ex => {
    if (formId && String(ex._formId) !== formId) return false;
    if (diff && (ex.difficulty || '') !== diff) return false;
    if (level && String(ex.skill_level) !== level) return false;
    return true;
  });

  renderAdminExportList(filtered);
}

function renderAdminExportList(exercises) {
  const container = document.getElementById('exp-ex-list-container');
  if (!container) return;

  if (!exercises.length) {
    container.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted);">Không có bài tập phù hợp với bộ lọc</div>';
    updateAdminExportCount();
    return;
  }

  // Group by form
  const byForm = {};
  exercises.forEach(ex => {
    const key = ex._formId;
    if (!byForm[key]) byForm[key] = { name: ex._formName, items: [] };
    byForm[key].items.push(ex);
  });

  const diffBadge = d => {
    const cls = d === 'Khó' ? '#ef4444' : (d === 'Trung bình' ? '#f59e0b' : '#10b981');
    return `<span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;background:${cls}22;color:${cls};">${d||'—'}</span>`;
  };

  let html = '';
  Object.entries(byForm).forEach(([fid, grp]) => {
    html += `
      <div style="margin-bottom:16px;">
        <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--primary-light);border-radius:8px 8px 0 0;border:1px solid var(--border-color);border-bottom:none;">
          <div style="font-size:13px;font-weight:700;color:var(--primary);">📁 ${grp.name}</div>
          <label style="font-size:12px;font-weight:600;color:var(--text-muted);cursor:pointer;display:flex;align-items:center;gap:5px;">
            <input type="checkbox" class="grp-chk" data-form="${fid}" onchange="selectGroupExport(this)" style="width:14px;height:14px;accent-color:var(--primary);"> Chọn cả nhóm
          </label>
        </div>
        <div style="border:1px solid var(--border-color);border-radius:0 0 8px 8px;overflow:hidden;">`;

    grp.items.forEach((ex, i) => {
      const sl = ex.skill_level;
      const lvlColors = {1:'#10b981',2:'#3b82f6',3:'#f59e0b',4:'#8b5cf6',5:'#ef4444'};
      const lvlColor = lvlColors[sl] || '#94a3b8';
      html += `
          <div class="exp-ex-row" style="display:flex;align-items:center;gap:12px;padding:10px 14px;${i%2===0?'background:var(--card-bg)':'background:var(--bg-color)'};border-bottom:1px solid var(--border-color);" onmouseover="this.style.background='var(--primary-light)'" onmouseout="this.style.background='${i%2===0?'var(--card-bg)':'var(--bg-color)'}'">
            <input type="checkbox" class="exp-ex-chk" data-id="${ex.id}" onchange="updateAdminExportCount()" style="width:15px;height:15px;accent-color:var(--primary);flex-shrink:0;">
            <div style="flex:1;min-width:0;">
              <div style="font-size:13px;font-weight:600;color:var(--text-main);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${ex.title||'—'}</div>
              <div style="font-size:11px;color:var(--text-muted);margin-top:2px;font-family:monospace;">${ex.name||''}</div>
            </div>
            ${diffBadge(ex.difficulty)}
            ${sl ? `<span style="font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px;background:${lvlColor}22;color:${lvlColor};">L${sl}</span>` : ''}
          </div>`;
    });
    html += `</div></div>`;
  });

  container.innerHTML = html;
  updateAdminExportCount();
}

function selectGroupExport(chk) {
  const fid = chk.dataset.form;
  const rows = document.querySelectorAll(`#exp-ex-list-container .exp-ex-chk`);
  // Find exercises in this form group
  const formExIds = (window._adminExportAllExercises || [])
    .filter(ex => String(ex._formId) === String(fid))
    .map(ex => String(ex.id));
  rows.forEach(c => {
    if (formExIds.includes(String(c.dataset.id))) c.checked = chk.checked;
  });
  updateAdminExportCount();
}

function selectAllAdminExport(val) {
  document.querySelectorAll('#exp-ex-list-container .exp-ex-chk').forEach(c => c.checked = val);
  document.querySelectorAll('#exp-ex-list-container .grp-chk').forEach(c => c.checked = val);
  updateAdminExportCount();
}

function updateAdminExportCount() {
  const n = document.querySelectorAll('#exp-ex-list-container .exp-ex-chk:checked').length;
  const el = document.getElementById('exp-ex-selected-count');
  if (el) el.textContent = n;
}

async function doExportSelected() {
  const ids = [...document.querySelectorAll('#exp-ex-list-container .exp-ex-chk:checked')]
    .map(c => c.dataset.id);
  if (!ids.length) { alert('Vui lòng chọn ít nhất 1 bài tập!'); return; }

  const format = document.querySelector('input[name="exp-ex-fmt"]:checked')?.value || 'xlsx';
  const mamon  = document.getElementById('exp-ex-mamon')?.value || '';
  const btn    = document.querySelector('button[onclick="doExportSelected()"]');
  const orig   = btn?.textContent;
  if (btn) { btn.textContent = '⏳ Đang xuất...'; btn.disabled = true; }

  try {
    const res = await fetch('/api/admin/export/exercises', {
      method: 'POST', credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format, mamon, exercise_ids: ids })
    });
    if (!res.ok) { const e = await res.json(); throw new Error(e.error || 'Lỗi xuất file'); }
    const blob = await res.blob();
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url; a.download = `BaiTap_ChonLoc.${format === 'csv' ? 'csv' : 'xlsx'}`;
    document.body.appendChild(a); a.click();
    document.body.removeChild(a); URL.revokeObjectURL(url);
    loadExportLog();
  } catch(e) {
    alert('❌ ' + e.message);
  } finally {
    if (btn) { btn.textContent = orig; btn.disabled = false; }
  }
}"""

if OLD_INIT in js:
    js = js.replace(OLD_INIT, NEW_INIT)
    print('✅ initExportSection fixed + new functions added')
else:
    print('❌ initExportSection not found')

with open('public/admin.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('Done admin.js')
