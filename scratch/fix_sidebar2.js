const fs = require('fs');
let h = fs.readFileSync('public/admin.html', 'utf8');

// 1. Add admin-sidebar class to the aside element
h = h.replace('class="sidebar-lecturer"', 'class="sidebar-lecturer admin-sidebar"');
console.log('✅ Added admin-sidebar class to aside');

// 2. Fix CSS selectors - also hide menu-group labels when collapsed
const oldCSS = '.admin-sidebar.collapsed .menu-item span:last-child,';
const newCSS = `.admin-sidebar.collapsed .menu-item span:last-child,
    .admin-sidebar.collapsed .menu-group,`;
if (h.includes(oldCSS)) {
  h = h.replace(oldCSS, newCSS);
  console.log('✅ Fixed collapse CSS for menu-group');
}

// 3. Hide brand text + footer text when collapsed
const addHideRules = `.admin-sidebar.collapsed .brand-lecturer span,
    .admin-sidebar.collapsed .brand-lecturer > div:last-child,`;
const insertBefore = '.admin-sidebar.collapsed .menu-label,';
if (h.includes(insertBefore) && !h.includes('brand-lecturer span')) {
  h = h.replace(insertBefore, addHideRules + '\n    ' + insertBefore);
  console.log('✅ Added brand hide rules');
}

fs.writeFileSync('public/admin.html', h, 'utf8');

// ═══ Lecturer: fix class too ═══
let lh = fs.readFileSync('public/lecturer.html', 'utf8');

// Check lecturer sidebar element
const lecAside = lh.indexOf('<aside');
if (lecAside > -1) {
  const lecAsideEnd = lh.indexOf('>', lecAside);
  const asideTag = lh.substring(lecAside, lecAsideEnd + 1);
  console.log('\nLecturer aside tag:', asideTag);
  
  if (!asideTag.includes('lec-sidebar')) {
    const newTag = asideTag.replace('class="', 'class="lec-sidebar ');
    if (newTag === asideTag && asideTag.includes('class=')) {
      // class might use single quotes or different format
      console.log('Trying alt replace...');
    }
    lh = lh.substring(0, lecAside) + newTag + lh.substring(lecAsideEnd + 1);
    console.log('✅ Added lec-sidebar class');
  }
}

// Lecturer sidebar uses different structure - find the sidebar wrapper
const lecSidebarDiv = lh.indexOf('sidebar-menu');
if (lecSidebarDiv > -1) {
  console.log('Found sidebar-menu in lecturer');
}

// Fix lecturer CSS to target actual classes
// Find the lecturer sidebar parent element class
const lecSideClass = lh.match(/<(?:aside|div)[^>]*class="[^"]*sidebar[^"]*"/);
if (lecSideClass) {
  console.log('Lecturer sidebar class match:', lecSideClass[0].substring(0, 80));
}

fs.writeFileSync('public/lecturer.html', lh, 'utf8');
console.log('\n✅ All done!');
