const fs = require('fs');
let h = fs.readFileSync('public/lecturer.html', 'utf8');

// ═══ 1. Fix: Show expand button when sidebar is collapsed ═══
// The toggle button div (child 2) is hidden. Keep it visible but change content.
// Remove the rule that hides toggle button div
const hideToggle = ".lec-sidebar.collapsed > div:nth-child(2) { display: none !important; }";
if (h.includes(hideToggle)) {
  h = h.replace(hideToggle, `.lec-sidebar.collapsed > div:nth-child(2) {
      padding: 4px 6px !important;
    }
    .lec-sidebar.collapsed #lec-sidebar-toggle {
      font-size: 0 !important;
      height: 32px !important;
      border-radius: 8px !important;
      background: var(--bg-color, #f0f4ff) !important;
      border-color: var(--border-color, #e2e8f0) !important;
    }
    .lec-sidebar.collapsed #lec-sidebar-toggle::after {
      content: '▶'; font-size: 14px; color: var(--text-muted, #64748b);
    }`);
  console.log('✅ Sidebar expand button visible when collapsed');
}

// Also update toggleLecSidebar to change button text
const oldToggleFn = `function toggleLecSidebar() {
  const sidebar = document.querySelector('.lec-sidebar');
  if (!sidebar) return;
  sidebar.classList.toggle('collapsed');
  const btn = document.getElementById('lec-sidebar-toggle');
  if (btn) btn.title = sidebar.classList.contains('collapsed') ? 'Mở menu' : 'Thu gọn menu';
  try { localStorage.setItem('lec-sidebar-collapsed', sidebar.classList.contains('collapsed')); } catch(e){}
}`;

const newToggleFn = `function toggleLecSidebar() {
  const sidebar = document.querySelector('.lec-sidebar');
  if (!sidebar) return;
  sidebar.classList.toggle('collapsed');
  const btn = document.getElementById('lec-sidebar-toggle');
  const isCollapsed = sidebar.classList.contains('collapsed');
  if (btn) {
    btn.title = isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu';
    btn.innerHTML = isCollapsed ? '' : '◀ Thu gọn';
  }
  // Also adjust main margin
  const main = document.querySelector('.main-lecturer');
  if (main) main.style.marginLeft = isCollapsed ? '64px' : '240px';
  try { localStorage.setItem('lec-sidebar-collapsed', isCollapsed ? 'true' : ''); } catch(e){}
}`;

if (h.includes(oldToggleFn)) {
  h = h.replace(oldToggleFn, newToggleFn);
  console.log('✅ Toggle function updated');
}

// Fix restore state to also adjust main margin
const oldRestore = "try { if (localStorage.getItem('lec-sidebar-collapsed') === 'true') { const s=document.querySelector('.lec-sidebar'); if(s) s.classList.add('collapsed'); }} catch(e){}";
const newRestore = `try {
  if (localStorage.getItem('lec-sidebar-collapsed') === 'true') {
    const s=document.querySelector('.lec-sidebar');
    if(s) { s.classList.add('collapsed'); }
    const m=document.querySelector('.main-lecturer');
    if(m) m.style.marginLeft='64px';
    const b=document.getElementById('lec-sidebar-toggle');
    if(b) b.innerHTML='';
  }
} catch(e){}`;

if (h.includes(oldRestore)) {
  h = h.replace(oldRestore, newRestore);
  console.log('✅ Restore state updated');
}

// ═══ 2. Fix exercise list header hierarchy ═══
// Find the exercises section header area and add better spacing
const exercisesSectionStart = h.indexOf('id="section-exercises"');
if (exercisesSectionStart > -1) {
  const sectionContent = h.substring(exercisesSectionStart, exercisesSectionStart + 1500);
  console.log('\nExercise section header area (first 500 chars):');
  console.log(sectionContent.substring(0, 500));
}

// Improve the header-lecturer area and lecturer-info-text spacing
// Find and improve the header 
const oldHeader = '<h1 id="page-title">Quản lý bài tập</h1>';
if (h.includes(oldHeader)) {
  // Keep the h1 but style it better via CSS
}

// Add CSS for better header hierarchy
const styleInsertPoint = '@media (max-width: 800px)';
const styleIdx = h.indexOf(styleInsertPoint);
if (styleIdx > -1) {
  const headerCSS = `
    /* Header hierarchy improvements */
    .header-lecturer { margin-bottom: 6px; }
    .header-lecturer h1 { font-size: 26px; }
    .lecturer-info-text {
      font-size: 14px; color: var(--text-muted,#64748b);
      margin-bottom: 6px; padding-bottom: 6px;
    }
    .section-lecturer h3.section-subtitle {
      font-size: 18px; font-weight: 800; color: var(--text-main,#1e293b);
      margin: 0 0 16px; display: flex; align-items: center; gap: 10px;
      padding-bottom: 12px; border-bottom: 2px solid var(--border-color,#e2e8f0);
    }
    .section-lecturer h3.section-subtitle::before {
      content: ''; width: 4px; height: 22px; background: linear-gradient(135deg,#6366f1,#818cf8);
      border-radius: 3px; flex-shrink: 0;
    }
    /* Subject group headers */
    .subject-group-header {
      display: flex; align-items: center; gap: 10px; padding: 16px 20px;
      cursor: pointer; user-select: none;
      background: linear-gradient(90deg,var(--bg-color,#f8faff),var(--card-bg,#f0f4ff));
      border-bottom: 1px solid var(--border-color,#e2e8f0);
      transition: background .15s;
    }
    .subject-group-header:hover { background: #e8effe; }
    body.dark-mode .subject-group-header { background: linear-gradient(90deg,#1e293b,#1e2a3a); }
    body.dark-mode .subject-group-header:hover { background: #253350; }
    /* Form header within subject */
    .form-section-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 0; margin: 0 0 12px;
      border-bottom: 1px dashed var(--border-color,#e2e8f0);
    }
    .form-section-header .form-name {
      font-weight: 700; font-size: 14px; color: var(--text-main,#1e293b);
      display: flex; align-items: center; gap: 8px;
    }
    .form-section-header .form-name::before {
      content: '📂'; font-size: 15px;
    }
    .form-section-header .form-count {
      font-size: 12px; color: var(--text-muted,#64748b);
      background: #e0e7ff; padding: 3px 10px; border-radius: 20px; font-weight: 600;
    }

    `;
  h = h.substring(0, styleIdx) + headerCSS + h.substring(styleIdx);
  console.log('✅ Header hierarchy CSS added');
}

// Now update the "Danh sách bài tập" HTML to use section-subtitle
const oldDanhSach = '<h3 style="font-size:18px;font-weight:800;margin:0 0 14px;color:var(--text-main,#1e293b)">Danh sách bài tập</h3>';
if (h.includes(oldDanhSach)) {
  h = h.replace(oldDanhSach, '<h3 class="section-subtitle">Danh sách bài tập</h3>');
  console.log('✅ Section subtitle updated');
} else {
  // Try to find alternative
  const alt = h.indexOf('Danh sách bài tập');
  if (alt > -1) {
    console.log('Danh sach at:', alt);
    console.log('Context:', h.substring(alt - 100, alt + 100));
  }
}

// Update renderManageList JS to use better subject and form headers
// Find subject header creation and form header creation in JS
const oldSubHeader = "subHeader.style.cssText = 'display:flex;align-items:center;gap:10px;padding:14px 18px;cursor:pointer;background:linear-gradient(90deg,#f8faff,#f0f4ff);user-select:none';";
if (h.includes(oldSubHeader)) {
  h = h.replace(oldSubHeader, "subHeader.className = 'subject-group-header';");
  console.log('✅ Subject header styled via class');
}

// Find form header creation
const oldFormHeader = "formHeader.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--border-color,#e2e8f0);margin-bottom:10px";
if (h.includes(oldFormHeader)) {
  const endIdx = h.indexOf("';", h.indexOf(oldFormHeader)) + 2;
  const oldLine = h.substring(h.indexOf(oldFormHeader), endIdx);
  h = h.replace(oldLine, "formHeader.className = 'form-section-header';");
  console.log('✅ Form header styled via class');
}

// Update form header innerHTML to use .form-name and .form-count
const oldFormInner = 'formHeader.innerHTML = `<span style="font-weight:700;font-size:14px;color:var(--text-main,#1e293b)">';
if (h.includes(oldFormInner)) {
  const formInnerEnd = h.indexOf('`;', h.indexOf(oldFormInner)) + 2;
  const oldFormInnerFull = h.substring(h.indexOf(oldFormInner), formInnerEnd);
  
  const newFormInner = 'formHeader.innerHTML = `<span class="form-name">${escH(f.name)} (${escH(f.form_id)})</span><span class="form-count">${exercises.length} bài</span>`;';
  h = h.replace(oldFormInnerFull, newFormInner);
  console.log('✅ Form header innerHTML updated');
}

fs.writeFileSync('public/lecturer.html', h, 'utf8');
console.log('\n✅ All fixes applied!');
