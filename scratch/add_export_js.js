const fs = require('fs');
let h = fs.readFileSync('public/lecturer.html', 'utf8');

// Find the spot right before "// Auto-load dashboard on page load"
const marker = '// Auto-load dashboard on page load';
const idx = h.indexOf(marker);
if (idx === -1) { console.log('Marker not found'); process.exit(1); }

const exportJS = `
    // ═══════════════════ EXPORT SECTION ═══════════════════
    let allExportExercises = [];
    let filteredExportExercises = [];
    let selectedExportIds = new Set();

    async function loadExportExercises() {
      try {
        const res = await fetch('/api/subjects', { credentials: 'include' });
        const subjects = await res.json();
        allExportExercises = [];
        const formSet = new Set();
        subjects.forEach(s => {
          (s.forms||[]).forEach(f => {
            formSet.add(f.name);
            (f.exercises||[]).forEach(ex => {
              allExportExercises.push({
                ...ex, subject_name: s.subject_name, subject_id: s.subject_id,
                form_name: f.name, form_id: f.form_id
              });
            });
          });
        });
        // Populate form filter
        const formSelect = document.getElementById('export-filter-form');
        if (formSelect) {
          formSelect.innerHTML = '<option value="">Tất cả dạng bài</option>';
          [...formSet].sort().forEach(f => { const o=document.createElement('option'); o.value=f; o.textContent=f; formSelect.appendChild(o); });
        }
        // Update stats
        const el = id => document.getElementById(id);
        if (el('export-stat-total')) el('export-stat-total').textContent = allExportExercises.length;
        if (el('export-stat-forms')) el('export-stat-forms').textContent = formSet.size;
        if (el('export-stat-subjects')) el('export-stat-subjects').textContent = subjects.length;
        
        filterExportList();
      } catch(e) { console.error('Load export:', e); }
    }

    function filterExportList() {
      const search = (document.getElementById('export-search')?.value||'').toLowerCase();
      const form = document.getElementById('export-filter-form')?.value||'';
      const diff = document.getElementById('export-filter-diff')?.value||'';
      const level = document.getElementById('export-filter-level')?.value||'';

      filteredExportExercises = allExportExercises.filter(ex => {
        if (search && !ex.title.toLowerCase().includes(search) && !ex.id.toLowerCase().includes(search) && !(ex.subject_name||'').toLowerCase().includes(search)) return false;
        if (form && ex.form_name !== form) return false;
        if (diff && ex.difficulty !== diff) return false;
        if (level && String(ex.level) !== level) return false;
        return true;
      });

      renderExportTable();
    }

    function renderExportTable() {
      const tbody = document.getElementById('export-exercises-tbody');
      if (!tbody) return;
      const lvlColors = {1:'#10b981',2:'#06b6d4',3:'#f59e0b',4:'#f97316',5:'#8b5cf6'};
      const diffColors = {'Dễ':['#dcfce7','#166534'],'Trung bình':['#fef9c3','#854d0e'],'Khó':['#fee2e2','#991b1b']};

      if (filteredExportExercises.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Không tìm thấy bài tập phù hợp</td></tr>';
        updateExportSelectionInfo();
        return;
      }

      tbody.innerHTML = filteredExportExercises.map(ex => {
        const checked = selectedExportIds.has(ex.id) ? 'checked' : '';
        const lvl = ex.level || 1;
        const col = lvlColors[lvl] || '#94a3b8';
        const dc = diffColors[ex.difficulty] || ['#f1f5f9','#475569'];
        return \`<tr style="border-bottom:1px solid var(--border-color,#e2e8f0);transition:background .1s" onmouseenter="this.style.background='#f8fafc'" onmouseleave="this.style.background=''">
          <td style="padding:10px 14px;text-align:center">
            <input type="checkbox" \${checked} data-exid="\${ex.id}" onchange="toggleExportItem(this)" style="width:17px;height:17px;accent-color:#6366f1;cursor:pointer">
          </td>
          <td style="padding:10px 14px;font-family:monospace;font-size:12px;color:#6366f1;font-weight:600">\${ex.id}</td>
          <td style="padding:10px 14px">
            <div style="font-weight:600;font-size:14px;color:var(--text-main)">\${ex.title}</div>
          </td>
          <td style="padding:10px 14px">
            <span style="font-size:12px;font-weight:600;color:#7c3aed;background:#ede9fe;padding:3px 10px;border-radius:20px">\${ex.form_name||'—'}</span>
          </td>
          <td style="padding:10px 14px">
            <span style="font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px;background:\${dc[0]};color:\${dc[1]}">\${ex.difficulty||'—'}</span>
          </td>
          <td style="padding:10px 14px;text-align:center">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:8px;background:\${col}20;color:\${col};font-size:12px;font-weight:800;border:1px solid \${col}44">L\${lvl}</span>
          </td>
          <td style="padding:10px 14px;font-size:13px;color:var(--text-muted)">\${ex.subject_name||'—'}</td>
        </tr>\`;
      }).join('');
      updateExportSelectionInfo();
    }

    function toggleExportItem(cb) {
      const exId = cb.dataset.exid;
      if (cb.checked) selectedExportIds.add(exId);
      else selectedExportIds.delete(exId);
      updateExportSelectionInfo();
    }

    function toggleSelectAllExport(checked) {
      if (checked) {
        filteredExportExercises.forEach(ex => selectedExportIds.add(ex.id));
      } else {
        filteredExportExercises.forEach(ex => selectedExportIds.delete(ex.id));
      }
      renderExportTable();
    }

    function updateExportSelectionInfo() {
      const info = document.getElementById('export-selection-info');
      const stat = document.getElementById('export-stat-selected');
      const count = selectedExportIds.size;
      if (info) info.textContent = count + ' bài đã chọn';
      if (stat) stat.textContent = count;
      // Update select-all checkbox
      const sa = document.getElementById('export-select-all');
      if (sa) {
        const allVisible = filteredExportExercises.every(ex => selectedExportIds.has(ex.id));
        sa.checked = filteredExportExercises.length > 0 && allVisible;
        sa.indeterminate = !allVisible && filteredExportExercises.some(ex => selectedExportIds.has(ex.id));
      }
    }

    function clearExportFilters() {
      const el = id => document.getElementById(id);
      if (el('export-search')) el('export-search').value = '';
      if (el('export-filter-form')) el('export-filter-form').value = '';
      if (el('export-filter-diff')) el('export-filter-diff').value = '';
      if (el('export-filter-level')) el('export-filter-level').value = '';
      filterExportList();
    }

    function getSelectedExercises() {
      if (selectedExportIds.size === 0) return allExportExercises;
      return allExportExercises.filter(ex => selectedExportIds.has(ex.id));
    }

    async function exportSelectedExcel() {
      const exercises = getSelectedExercises();
      const status = document.getElementById('export-status');
      if (status) status.innerHTML = '<span style="color:#f59e0b">⏳ Đang xuất ' + exercises.length + ' bài tập...</span>';
      try {
        const res = await fetch('/api/export-inline', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ exercises, format: 'excel' })
        });
        if (res.ok) {
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'bai_tap_export.xlsx'; a.click();
          URL.revokeObjectURL(url);
          if (status) status.innerHTML = '<span style="color:#16a34a">✅ Đã xuất thành công ' + exercises.length + ' bài tập!</span>';
        } else {
          if (status) status.innerHTML = '<span style="color:#ef4444">❌ Lỗi xuất file</span>';
        }
      } catch(e) {
        if (status) status.innerHTML = '<span style="color:#ef4444">❌ ' + e.message + '</span>';
      }
    }

    function exportSelectedJSON() {
      const exercises = getSelectedExercises();
      const blob = new Blob([JSON.stringify(exercises, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'bai_tap_export.json'; a.click();
      URL.revokeObjectURL(url);
      const status = document.getElementById('export-status');
      if (status) status.innerHTML = '<span style="color:#16a34a">✅ Đã xuất ' + exercises.length + ' bài tập dạng JSON!</span>';
    }

    `;

h = h.substring(0, idx) + exportJS + h.substring(idx);

// Also update the menu click handler to load export exercises
const exportMenuTrigger = "if (sec === 'exercises' && typeof initPage === 'function') initPage();";
const exportMenuTriggerIdx = h.indexOf(exportMenuTrigger);
if (exportMenuTriggerIdx > -1) {
  h = h.substring(0, exportMenuTriggerIdx + exportMenuTrigger.length) + 
      "\n        if (sec === 'export') loadExportExercises();" + 
      h.substring(exportMenuTriggerIdx + exportMenuTrigger.length);
  console.log('Added export menu trigger');
}

fs.writeFileSync('public/lecturer.html', h, 'utf8');
console.log('✅ Export JS logic added!');
