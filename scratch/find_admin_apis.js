const fs = require('fs');
const a = fs.readFileSync('public/admin.js', 'utf8');
const apis = new Set();
const re = /fetch\(['"`](\/api\/[^'"`\s]+)/g;
let m;
while ((m = re.exec(a)) !== null) apis.add(m[1]);
console.log('Admin API endpoints:');
[...apis].sort().forEach(u => console.log(' ', u));
