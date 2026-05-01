const fs = require('fs');

// Verify admin.html
const h = fs.readFileSync('public/admin.html', 'utf8');
const menuCount = (h.match(/feedback-history/g) || []).length;
console.log('Admin feedback-history occurrences:', menuCount, '(should be ~3: 1 menu + 1 section + 1 switchSection ref)');
console.log('Has admin-sidebar class:', h.includes('admin-sidebar'));
console.log('Has sidebar-toggle btn:', h.includes('sidebar-toggle'));
console.log('Has toggleSidebar fn:', h.includes('toggleSidebar'));
console.log('Has menu-label class:', h.includes('menu-label'));
console.log('Has collapse CSS:', h.includes('.admin-sidebar.collapsed'));

// Verify lecturer.html
const lh = fs.readFileSync('public/lecturer.html', 'utf8');
console.log('\nLecturer has lec-sidebar class:', lh.includes('lec-sidebar'));
console.log('Has lec-sidebar-toggle btn:', lh.includes('lec-sidebar-toggle'));
console.log('Has toggleLecSidebar fn:', lh.includes('toggleLecSidebar'));
console.log('Has lec collapse CSS:', lh.includes('.lec-sidebar.collapsed'));

// Check admin sidebar element structure
const sidebarIdx = h.indexOf('admin-sidebar');
console.log('\nAdmin sidebar context:', h.substring(sidebarIdx - 20, sidebarIdx + 50));
