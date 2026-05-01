const fs = require('fs');
let h = fs.readFileSync('public/lecturer.html', 'utf8');

// Add toggle button between brand-lecturer and menu-nav
const menuNavTag = '<nav class="menu-nav">';
const menuNavIdx = h.indexOf(menuNavTag);

if (menuNavIdx > -1 && !h.includes('id="lec-sidebar-toggle"')) {
  const toggleBtn = `<div style="display:flex;justify-content:center;padding:6px 8px;margin-bottom:2px">
        <button id="lec-sidebar-toggle" onclick="toggleLecSidebar()" style="width:100%;height:28px;border-radius:6px;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.06);color:rgba(255,255,255,.5);cursor:pointer;font-size:11px;display:flex;align-items:center;justify-content:center;gap:4px;transition:all .2s" title="Thu gọn menu">◀ Thu gọn</button>
      </div>
      `;
  h = h.substring(0, menuNavIdx) + toggleBtn + h.substring(menuNavIdx);
  console.log('✅ Lecturer toggle button added');
} else if (h.includes('id="lec-sidebar-toggle"')) {
  console.log('Toggle button already exists');
} else {
  console.log('menu-nav not found');
}

fs.writeFileSync('public/lecturer.html', h, 'utf8');

// Same for admin - check toggle button exists in HTML
let ah = fs.readFileSync('public/admin.html', 'utf8');
if (ah.includes('id="sidebar-toggle"')) {
  console.log('✅ Admin toggle button already exists');
} else {
  console.log('⚠️ Admin toggle button missing');
}

console.log('✅ Done!');
