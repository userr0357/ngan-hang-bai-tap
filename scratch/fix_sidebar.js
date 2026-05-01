const fs = require('fs');

// ═══ 1. Fix duplicate menu in admin.html ═══
let h = fs.readFileSync('public/admin.html', 'utf8');

// Find all occurrences of feedback-history menu items
const menuStr = 'data-section="feedback-history"';
let count = 0;
let idx = 0;
let positions = [];
while ((idx = h.indexOf(menuStr, idx)) !== -1) {
  positions.push(idx);
  idx += menuStr.length;
  count++;
}
console.log('Found', count, 'feedback-history menu items at positions:', positions);

if (count > 1) {
  // Remove the FIRST one (the duplicate we injected earlier), keep the second
  const firstPos = positions[0];
  // Find the <li that contains it
  const liStart = h.lastIndexOf('<li', firstPos);
  // Find the closing </li>
  const liEnd = h.indexOf('</li>', firstPos) + 5;
  console.log('Removing duplicate from', liStart, 'to', liEnd);
  h = h.substring(0, liStart) + h.substring(liEnd);
  console.log('✅ Removed duplicate menu item');
}

// ═══ 2. Add sidebar toggle button to admin.html ═══
// Find the sidebar nav
const sidebarBrand = h.indexOf('Admin Panel');
if (sidebarBrand > -1) {
  // Find the parent div of Admin Panel text
  const brandLineStart = h.lastIndexOf('<', sidebarBrand);
  const brandLineEnd = h.indexOf('\n', sidebarBrand);
  const brandLine = h.substring(brandLineStart, brandLineEnd);
  console.log('Brand line:', brandLine.substring(0, 80));
  
  // Add toggle button after the brand line
  const toggleBtn = `
      <button id="sidebar-toggle" onclick="toggleSidebar()" style="width:32px;height:32px;border-radius:8px;border:1px solid var(--border-color);background:var(--card-bg);color:var(--text-main);cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:transform .2s" title="Thu gọn menu">☰</button>
    </div>`;
  
  // Wrap brand + toggle in a flex row
  // Find the element containing "Admin Panel" and modify
  const adminPanelDiv = h.indexOf('>Admin Panel<');
  if (adminPanelDiv > -1) {
    const divStart = h.lastIndexOf('<div', adminPanelDiv);
    const divEnd = h.indexOf('</div>', adminPanelDiv) + 6;
    const originalBrand = h.substring(divStart, divEnd);
    
    const newBrand = `<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;padding:0 4px">
        ${originalBrand}
        <button id="sidebar-toggle" onclick="toggleSidebar()" style="width:32px;height:32px;border-radius:8px;border:1px solid var(--border-color);background:var(--card-bg);color:var(--text-muted);cursor:pointer;font-size:16px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s" title="Thu gọn menu">◀</button>
      </div>`;
    
    h = h.substring(0, divStart) + newBrand + h.substring(divEnd);
    console.log('✅ Admin sidebar toggle added');
  }
}

// Add sidebar collapse CSS and JS to admin.html
const adminStyleEnd = h.lastIndexOf('</style>');
if (adminStyleEnd > -1) {
  const collapseCSS = `
    /* Sidebar collapse */
    .admin-sidebar { transition: width .25s ease, min-width .25s ease, padding .25s ease; overflow: hidden; }
    .admin-sidebar.collapsed { width: 60px !important; min-width: 60px !important; padding: 12px 8px !important; }
    .admin-sidebar.collapsed .menu-item span:last-child,
    .admin-sidebar.collapsed .menu-label,
    .admin-sidebar.collapsed .admin-user-name,
    .admin-sidebar.collapsed .admin-user-name-avatar + div,
    .admin-sidebar.collapsed nav > div,
    .admin-sidebar.collapsed #sidebar-toggle + div { display: none; }
    .admin-sidebar.collapsed .menu-item { justify-content: center; padding: 10px 8px !important; }
    .admin-sidebar.collapsed .menu-item span:first-child { margin: 0; }
    .admin-sidebar.collapsed #sidebar-toggle { transform: rotate(180deg); }
  `;
  h = h.substring(0, adminStyleEnd) + collapseCSS + h.substring(adminStyleEnd);
  console.log('✅ Admin collapse CSS added');
}

// Add toggleSidebar function
const adminScriptEnd = h.lastIndexOf('</script>');
if (adminScriptEnd > -1) {
  const toggleJS = `
function toggleSidebar() {
  const sidebar = document.querySelector('.admin-sidebar');
  if (!sidebar) return;
  sidebar.classList.toggle('collapsed');
  const btn = document.getElementById('sidebar-toggle');
  if (btn) btn.title = sidebar.classList.contains('collapsed') ? 'Mở menu' : 'Thu gọn menu';
  try { localStorage.setItem('admin-sidebar-collapsed', sidebar.classList.contains('collapsed')); } catch(e){}
}
// Restore sidebar state
try { if (localStorage.getItem('admin-sidebar-collapsed') === 'true') { const s=document.querySelector('.admin-sidebar'); if(s) s.classList.add('collapsed'); }} catch(e){}
`;
  h = h.substring(0, adminScriptEnd) + toggleJS + h.substring(adminScriptEnd);
  console.log('✅ Admin toggle JS added');
}

// Also need to add class "admin-sidebar" to the sidebar element
const sidebarEl = h.indexOf('class="sidebar"');
if (sidebarEl > -1) {
  // Check if there's already admin-sidebar
  if (!h.includes('admin-sidebar')) {
    h = h.substring(0, sidebarEl) + 'class="sidebar admin-sidebar"' + h.substring(sidebarEl + 'class="sidebar"'.length);
    console.log('✅ Added admin-sidebar class');
  }
}

// Find all menu group labels (QUẢN LÝ, DANH MỤC, etc.) and add menu-label class
const labelPatterns = ['QUẢN LÝ', 'DANH MỤC', 'NGƯỜI DÙNG', 'BÁO CÁO'];
labelPatterns.forEach(label => {
  const lIdx = h.indexOf('>' + label + '<');
  if (lIdx > -1) {
    // Find the parent div
    const pStart = h.lastIndexOf('<div', lIdx);
    const tagEnd = h.indexOf('>', pStart);
    const existingTag = h.substring(pStart, tagEnd + 1);
    if (!existingTag.includes('menu-label')) {
      const newTag = existingTag.replace('>', ' class="menu-label">');
      h = h.substring(0, pStart) + newTag + h.substring(tagEnd + 1);
      console.log('✅ Added menu-label class to', label);
    }
  }
});

fs.writeFileSync('public/admin.html', h, 'utf8');
console.log('✅ Admin HTML updated!');

// ═══ 3. Add sidebar toggle to lecturer.html ═══
let lh = fs.readFileSync('public/lecturer.html', 'utf8');

// Find the sidebar
const lecSidebar = lh.indexOf('Quản Lý Giảng Viên');
if (lecSidebar > -1) {
  console.log('\n--- Lecturer sidebar ---');
  // Find the brand div
  const brandDiv = lh.lastIndexOf('<div', lecSidebar);
  const brandDivEnd = lh.indexOf('</div>', lecSidebar) + 6;
  const brandContent = lh.substring(brandDiv, brandDivEnd);
  
  const newLecBrand = `<div style="display:flex;align-items:center;justify-content:space-between;padding:0 4px;margin-bottom:6px">
        ${brandContent}
        <button id="lec-sidebar-toggle" onclick="toggleLecSidebar()" style="width:30px;height:30px;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s" title="Thu gọn menu">◀</button>
      </div>`;
  
  lh = lh.substring(0, brandDiv) + newLecBrand + lh.substring(brandDivEnd);
  console.log('✅ Lecturer toggle button added');
}

// Add lecturer sidebar collapse CSS
const lecStyleEnd = lh.lastIndexOf('</style>');
if (lecStyleEnd > -1) {
  const lecCSS = `
    /* Lecturer sidebar collapse */
    .lec-sidebar { transition: width .25s ease, min-width .25s ease, padding .25s ease; overflow: hidden; }
    .lec-sidebar.collapsed { width: 56px !important; min-width: 56px !important; padding: 12px 6px !important; }
    .lec-sidebar.collapsed .sidebar-menu li span:last-child,
    .lec-sidebar.collapsed .sidebar-menu li a span:not(:first-child),
    .lec-sidebar.collapsed .sidebar-label,
    .lec-sidebar.collapsed .user-info span,
    .lec-sidebar.collapsed .user-info > div:last-child { display: none; }
    .lec-sidebar.collapsed .sidebar-menu li,
    .lec-sidebar.collapsed .sidebar-menu li a { justify-content: center; padding-left: 4px !important; padding-right: 4px !important; }
    .lec-sidebar.collapsed #lec-sidebar-toggle { transform: rotate(180deg); }
  `;
  lh = lh.substring(0, lecStyleEnd) + lecCSS + lh.substring(lecStyleEnd);
  console.log('✅ Lecturer collapse CSS added');
}

// Add lecturer toggle JS
const lecScriptEnd = lh.lastIndexOf('</script>');
if (lecScriptEnd > -1) {
  const lecToggleJS = `
function toggleLecSidebar() {
  const sidebar = document.querySelector('.lec-sidebar');
  if (!sidebar) return;
  sidebar.classList.toggle('collapsed');
  const btn = document.getElementById('lec-sidebar-toggle');
  if (btn) btn.title = sidebar.classList.contains('collapsed') ? 'Mở menu' : 'Thu gọn menu';
  try { localStorage.setItem('lec-sidebar-collapsed', sidebar.classList.contains('collapsed')); } catch(e){}
}
try { if (localStorage.getItem('lec-sidebar-collapsed') === 'true') { const s=document.querySelector('.lec-sidebar'); if(s) s.classList.add('collapsed'); }} catch(e){}
`;
  lh = lh.substring(0, lecScriptEnd) + lecToggleJS + lh.substring(lecScriptEnd);
  console.log('✅ Lecturer toggle JS added');
}

// Add lec-sidebar class to the sidebar element
const lecSidebarClass = lh.indexOf('class="sidebar"');
if (lecSidebarClass > -1 && !lh.includes('lec-sidebar')) {
  lh = lh.substring(0, lecSidebarClass) + 'class="sidebar lec-sidebar"' + lh.substring(lecSidebarClass + 'class="sidebar"'.length);
  console.log('✅ Added lec-sidebar class');
}

fs.writeFileSync('public/lecturer.html', lh, 'utf8');
console.log('✅ Lecturer HTML updated!');
console.log('\n✅ All done!');
