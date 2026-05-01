const fs = require('fs');
let h = fs.readFileSync('public/admin.html', 'utf8');

// Replace ALL old collapse CSS with new professional version
const oldCSSStart = '/* Sidebar collapse */';
const oldCSSEnd = '.admin-sidebar.collapsed #sidebar-toggle { transform: rotate(180deg); }';

const startIdx = h.indexOf(oldCSSStart);
const endIdx = h.indexOf(oldCSSEnd);

if (startIdx > -1 && endIdx > -1) {
  const newCSS = `/* Sidebar collapse */
    .admin-sidebar {
      transition: width .3s cubic-bezier(.4,0,.2,1), min-width .3s cubic-bezier(.4,0,.2,1);
      overflow: hidden;
    }
    .admin-sidebar.collapsed {
      width: 64px !important;
      min-width: 64px !important;
    }
    .admin-sidebar.collapsed .menu-group.menu-label { display: none; }
    .admin-sidebar.collapsed .menu-item {
      font-size: 0 !important;
      padding: 10px 0 !important;
      justify-content: center !important;
      border-radius: 10px !important;
      margin: 2px 6px !important;
      position: relative;
    }
    .admin-sidebar.collapsed .menu-item span:first-child {
      font-size: 20px !important;
      margin: 0 !important;
    }
    .admin-sidebar.collapsed .menu-item:hover::after {
      content: attr(data-section);
      position: absolute;
      left: calc(100% + 8px);
      top: 50%;
      transform: translateY(-50%);
      background: #1e293b;
      color: #fff;
      padding: 5px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      z-index: 9999;
      pointer-events: none;
      box-shadow: 0 4px 12px rgba(0,0,0,.2);
    }
    .admin-sidebar.collapsed .brand-lecturer span:last-child { display: none; }
    .admin-sidebar.collapsed .brand-lecturer {
      justify-content: center !important;
      padding: 16px 8px 12px !important;
    }
    .admin-sidebar.collapsed > div:first-child {
      flex-direction: column;
      align-items: center;
      gap: 6px;
      padding: 0 !important;
    }
    .admin-sidebar.collapsed #sidebar-toggle {
      width: 28px; height: 28px;
      transform: rotate(180deg);
    }
    .admin-sidebar.collapsed nav { padding: 8px 0 !important; }
    .admin-sidebar.collapsed .menu-lecturer { padding: 0 !important; }
    /* Footer when collapsed */
    .admin-sidebar.collapsed > div:last-child {
      padding: 8px 4px !important;
    }
    .admin-sidebar.collapsed > div:last-child > div:first-child > div:last-child { display: none; }
    .admin-sidebar.collapsed > div:last-child button {
      font-size: 0 !important;
      padding: 8px !important;
      justify-content: center;
    }
    .admin-sidebar.collapsed > div:last-child button span { font-size: 14px !important; }`;

  h = h.substring(0, startIdx) + newCSS + h.substring(endIdx + oldCSSEnd.length);
  console.log('✅ Admin collapse CSS replaced');
} else {
  console.log('❌ Could not find old CSS. Start:', startIdx, 'End:', endIdx);
  // Try to find what's there
  if (startIdx > -1) {
    console.log('CSS start context:', h.substring(startIdx, startIdx + 200));
  }
}

fs.writeFileSync('public/admin.html', h, 'utf8');

// ═══ Do same for lecturer ═══
let lh = fs.readFileSync('public/lecturer.html', 'utf8');

const lecOldStart = '/* Lecturer sidebar collapse */';
const lecOldEnd = ".lec-sidebar.collapsed .sidebar-footer button::before { font-size: 14px; }";

const lecStartIdx = lh.indexOf(lecOldStart);
let lecEndIdx = lh.indexOf(lecOldEnd);

if (lecStartIdx === -1) {
  console.log('No lecturer collapse CSS found');
} else {
  if (lecEndIdx === -1) {
    // Try alternate ending
    lecEndIdx = lh.indexOf('.lec-sidebar.collapsed #lec-sidebar-toggle', lecStartIdx);
    const lineEnd = lh.indexOf('}', lecEndIdx) + 1;
    lecEndIdx = lineEnd;
  } else {
    lecEndIdx = lecEndIdx + lecOldEnd.length;
  }

  const lecNewCSS = `/* Lecturer sidebar collapse */
    .lec-sidebar {
      transition: width .3s cubic-bezier(.4,0,.2,1), min-width .3s cubic-bezier(.4,0,.2,1);
      overflow: hidden;
    }
    .lec-sidebar.collapsed {
      width: 64px !important;
      min-width: 64px !important;
    }
    .lec-sidebar.collapsed .menu-group-label { display: none !important; }
    .lec-sidebar.collapsed .brand-text { display: none !important; }
    .lec-sidebar.collapsed .brand-lecturer {
      justify-content: center !important;
      padding: 16px 8px 12px !important;
    }
    .lec-sidebar.collapsed .menu-lecturer .menu-item {
      font-size: 0 !important;
      padding: 10px 0 !important;
      justify-content: center !important;
      border-radius: 10px !important;
      margin: 2px 6px !important;
    }
    .lec-sidebar.collapsed .menu-lecturer .menu-item .mi-icon,
    .lec-sidebar.collapsed .menu-lecturer .menu-item span:first-child {
      font-size: 20px !important;
      margin: 0 !important;
    }
    .lec-sidebar.collapsed .menu-nav { padding: 8px 0 !important; }
    .lec-sidebar.collapsed .menu-lecturer { padding: 0 !important; }
    .lec-sidebar.collapsed #lec-sidebar-toggle {
      font-size: 0 !important;
      width: 36px;
      height: 24px;
    }
    .lec-sidebar.collapsed #lec-sidebar-toggle::after {
      content: '▶';
      font-size: 12px;
    }
    /* Footer */
    .lec-sidebar.collapsed .sidebar-footer {
      padding: 8px 4px !important;
    }
    .lec-sidebar.collapsed .sidebar-footer .user-details,
    .lec-sidebar.collapsed .sidebar-footer .user-stats,
    .lec-sidebar.collapsed .sidebar-footer .user-status { display: none !important; }
    .lec-sidebar.collapsed .sidebar-footer button {
      font-size: 0 !important;
      padding: 8px !important;
    }`;

  lh = lh.substring(0, lecStartIdx) + lecNewCSS + lh.substring(lecEndIdx);
  console.log('✅ Lecturer collapse CSS replaced');
}

fs.writeFileSync('public/lecturer.html', lh, 'utf8');
console.log('✅ All done!');
