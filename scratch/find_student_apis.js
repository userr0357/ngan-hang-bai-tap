const fs = require('fs');
const a = fs.readFileSync('public/admin.js', 'utf8');

// Find all student-related API calls
const re = /fetch\([`'"](\/api\/[^`'"]+)/g;
let m;
const apis = new Set();
while ((m = re.exec(a)) !== null) {
  if (m[1].includes('student') || m[1].includes('sv') || m[1].includes('class')) apis.add(m[1]);
}
console.log('Student APIs:');
[...apis].sort().forEach(u => console.log(' ', u));

// Find initStudentsSection
const idx = a.indexOf('function initStudentsSection');
if (idx > -1) console.log('\n' + a.substring(idx, idx + 1500));

// Find loadStudents
const idx2 = a.indexOf('function loadStudents');
if (idx2 > -1) console.log('\n' + a.substring(idx2, idx2 + 1500));
