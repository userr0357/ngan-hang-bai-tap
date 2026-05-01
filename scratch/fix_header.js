const fs = require('fs');
let h = fs.readFileSync('public/lecturer.html', 'utf8');

// Update the "Danh sách bài tập" header with accent bar + better spacing
const old = '<h2 style="margin:0;font-size:20px;font-weight:800;color:var(--text-main,#1e293b)">Danh sách bài tập</h2>';
const nw = '<h2 style="margin:0;font-size:22px;font-weight:800;color:var(--text-main,#1e293b);display:flex;align-items:center;gap:10px"><span style="width:4px;height:24px;background:linear-gradient(135deg,#6366f1,#818cf8);border-radius:3px;flex-shrink:0"></span>Danh sách bài tập</h2>';

if (h.includes(old)) {
  h = h.replace(old, nw);
  console.log('✅ Header accent bar added');
}

// Also add more spacing between page title, lecturer info, and section
// Find the header area
const pageTitle = h.indexOf('id="page-title"');
if (pageTitle > -1) {
  console.log('page-title found');
}

// Increase spacing of lecturer-info-text
const lecInfo = h.indexOf('id="lecturer-info"');
if (lecInfo > -1) {
  const tag = h.substring(h.lastIndexOf('<', lecInfo), h.indexOf('>', lecInfo) + 1);
  console.log('lecturer-info tag:', tag);
}

fs.writeFileSync('public/lecturer.html', h, 'utf8');
console.log('✅ Done');
