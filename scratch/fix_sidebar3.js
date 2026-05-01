const fs = require('fs');
let h = fs.readFileSync('public/lecturer.html', 'utf8');

// Fix: The toggle button was injected wrong in the brand div.
// Current: <div class="brand-lecturer"><div class="brand-icon">📚</div><button ...>◀</button></div> <span class="brand-text">...</span></div>
// Need: <div class="brand-lecturer"><div class="brand-icon">📚</div><span class="brand-text">...</span><button>◀</button></div>

// Remove the misplaced button
const badBtn = `<button id="lec-sidebar-toggle" onclick="toggleLecSidebar()" style="width:30px;height:30px;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:rgba(255,255,255,.08);color:rgba(255,255,255,.7);cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all .2s" title="Thu gọn menu">◀</button>`;
if (h.includes(badBtn)) {
  h = h.replace(badBtn + '\n      </div>', '</div>');
  console.log('✅ Removed misplaced toggle button');
}

// Now find the brand-lecturer closing div and add button before it  
const brandText = h.indexOf('brand-text');
const brandClose = h.indexOf('</div>', h.indexOf('</span>', brandText) + 7);
// Insert the toggle button right before the menu-nav
const menuNav = h.indexOf('<nav class="menu-nav">');
if (menuNav > -1) {
  const toggleBtn = `<div style="display:flex;justify-content:center;padding:8px 0;margin-bottom:4px">
        <button id="lec-sidebar-toggle" onclick="toggleLecSidebar()" style="width:100%;max-width:200px;height:30px;border-radius:8px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:rgba(255,255,255,.5);cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;gap:6px;transition:all .2s" title="Thu gọn menu">◀ Thu gọn</button>
      </div>
      `;
  // Only add if not already there
  if (!h.includes('lec-sidebar-toggle')) {
    h = h.substring(0, menuNav) + toggleBtn + h.substring(menuNav);
    console.log('✅ Added toggle button before menu-nav');
  }
}

// Update collapse CSS for lecturer sidebar
const oldLecCSS = `/* Lecturer sidebar collapse */
    .lec-sidebar { transition: width .25s ease, min-width .25s ease, padding .25s ease; overflow: hidden; }
    .lec-sidebar.collapsed { width: 56px !important; min-width: 56px !important; padding: 12px 6px !important; }
    .lec-sidebar.collapsed .sidebar-menu li span:last-child,
    .lec-sidebar.collapsed .sidebar-menu li a span:not(:first-child),
    .lec-sidebar.collapsed .sidebar-label,
    .lec-sidebar.collapsed .user-info span,
    .lec-sidebar.collapsed .user-info > div:last-child { display: none; }
    .lec-sidebar.collapsed .sidebar-menu li,
    .lec-sidebar.collapsed .sidebar-menu li a { justify-content: center; padding-left: 4px !important; padding-right: 4px !important; }
    .lec-sidebar.collapsed #lec-sidebar-toggle { transform: rotate(180deg); }`;

const newLecCSS = `/* Lecturer sidebar collapse */
    .lec-sidebar { transition: width .25s ease, min-width .25s ease, padding .25s ease; overflow: hidden; }
    .lec-sidebar.collapsed { width: 56px !important; min-width: 56px !important; padding: 10px 4px !important; }
    .lec-sidebar.collapsed .brand-text,
    .lec-sidebar.collapsed .menu-group-label,
    .lec-sidebar.collapsed .menu-item::after,
    .lec-sidebar.collapsed .user-details,
    .lec-sidebar.collapsed .user-stats,
    .lec-sidebar.collapsed .user-status { display: none !important; }
    .lec-sidebar.collapsed .menu-lecturer .menu-item { padding: 10px 0 !important; justify-content: center; font-size: 0; }
    .lec-sidebar.collapsed .menu-lecturer .menu-item .mi-icon { font-size: 18px; margin: 0; }
    .lec-sidebar.collapsed .brand-lecturer { justify-content: center; }
    .lec-sidebar.collapsed .brand-icon { margin: 0; }
    .lec-sidebar.collapsed #lec-sidebar-toggle { transform: rotate(180deg); font-size: 0; width: 36px; }
    .lec-sidebar.collapsed #lec-sidebar-toggle::before { content: '▶'; font-size: 12px; }
    .lec-sidebar.collapsed .sidebar-footer { padding: 8px 4px !important; }
    .lec-sidebar.collapsed .sidebar-footer .user-avatar + div { display: none; }
    .lec-sidebar.collapsed .sidebar-footer button { font-size: 0; padding: 6px !important; }
    .lec-sidebar.collapsed .sidebar-footer button::before { font-size: 14px; }`;

if (h.includes(oldLecCSS)) {
  h = h.replace(oldLecCSS, newLecCSS);
  console.log('✅ Updated lecturer collapse CSS');
}

fs.writeFileSync('public/lecturer.html', h, 'utf8');

// ═══ Admin: also improve the collapse CSS ═══
let ah = fs.readFileSync('public/admin.html', 'utf8');

const oldAdminCSS = `/* Sidebar collapse */
    .admin-sidebar { transition: width .25s ease, min-width .25s ease, padding .25s ease; overflow: hidden; }
    .admin-sidebar.collapsed { width: 60px !important; min-width: 60px !important; padding: 12px 8px !important; }`;

const newAdminCSS = `/* Sidebar collapse */
    .admin-sidebar { transition: width .25s ease, min-width .25s ease, padding .25s ease; overflow: hidden; }
    .admin-sidebar.collapsed { width: 58px !important; min-width: 58px !important; padding: 10px 6px !important; }
    .admin-sidebar.collapsed > div:first-child > div:first-child span { display: none; }`;

if (ah.includes(oldAdminCSS)) {
  ah = ah.replace(oldAdminCSS, newAdminCSS);
  console.log('✅ Updated admin collapse CSS');
}

// Make sure the menu-group labels are hidden
if (!ah.includes('.admin-sidebar.collapsed .menu-group')) {
  // Already added via previous fix
}

fs.writeFileSync('public/admin.html', ah, 'utf8');
console.log('✅ All done!');
