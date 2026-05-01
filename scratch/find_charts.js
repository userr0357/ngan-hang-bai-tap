const fs = require('fs');
const a = fs.readFileSync('public/admin.js', 'utf8');
const terms = ['pie', 'chart', 'donut', 'canvas', 'Chart', 'drawPie', 'loadDashboard', 'PieChart', 'doughnut', 'pieChart', 'drawChart', 'renderChart', 'ctx', 'getContext'];
terms.forEach(t => {
  let idx = -1;
  while ((idx = a.indexOf(t, idx + 1)) > -1) {
    const line = a.substring(a.lastIndexOf('\n', idx) + 1, a.indexOf('\n', idx));
    console.log(`[${t}] line: ${line.trim().substring(0, 100)}`);
    break; // first occurrence only
  }
});

// Find all function names that have "chart" or "pie" or "graph" 
const fnRe = /function\s+(\w*(?:chart|pie|graph|donut|distribution)\w*)/gi;
let m;
while ((m = fnRe.exec(a)) !== null) {
  console.log(`\nFunction: ${m[1]} at offset ${m.index}`);
  console.log(a.substring(m.index, m.index + 200));
}

// Find canvas elements
const canvasRe = /getElementById\(['"]([^'"]*(?:chart|pie|canvas|graph)[^'"]*)['"]\)/gi;
while ((m = canvasRe.exec(a)) !== null) {
  console.log(`\nCanvas element: ${m[1]}`);
}
