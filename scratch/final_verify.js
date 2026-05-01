const fs = require('fs');

console.log('=== ADMIN PAGE VERIFICATION ===');
const ah = fs.readFileSync('public/admin.html', 'utf8');

// Count feedback-history menu items  
const menuMatches = ah.match(/data-section="feedback-history"/g);
console.log('Feedback menu items:', menuMatches ? menuMatches.length : 0, '(should be 1)');

// Check toggle button
console.log('Has sidebar-toggle btn:', ah.includes('id="sidebar-toggle"'));
console.log('Has toggleSidebar fn:', ah.includes('function toggleSidebar'));
console.log('Has admin-sidebar class on aside:', ah.includes('class="sidebar-lecturer admin-sidebar"'));
console.log('Has collapse CSS:', ah.includes('.admin-sidebar.collapsed'));

console.log('\n=== LECTURER PAGE VERIFICATION ===');
const lh = fs.readFileSync('public/lecturer.html', 'utf8');
console.log('Has lec-sidebar-toggle btn:', lh.includes('id="lec-sidebar-toggle"'));
console.log('Has toggleLecSidebar fn:', lh.includes('function toggleLecSidebar'));
console.log('Has lec-sidebar class on aside:', lh.includes('class="lec-sidebar sidebar-lecturer"'));
console.log('Has lec collapse CSS:', lh.includes('.lec-sidebar.collapsed'));

console.log('\n=== API VERIFICATION ===');
const srv = fs.readFileSync('server.js', 'utf8');
console.log('Has /api/admin/feedbacks:', srv.includes('/api/admin/feedbacks'));

console.log('\n✅ All verifications complete');
