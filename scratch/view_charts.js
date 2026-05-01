const fs = require('fs');
const a = fs.readFileSync('public/admin.js', 'utf8');

// renderPieChart function
let idx = a.indexOf('function renderPieChart');
console.log('=== renderPieChart ===');
console.log(a.substring(idx, idx + 2500));

// handleChartClick function
idx = a.indexOf('function handleChartClick');
console.log('\n=== handleChartClick ===');
console.log(a.substring(idx, idx + 2000));

// loadDashboardPieCharts
idx = a.indexOf('function loadDashboardPieCharts');
console.log('\n=== loadDashboardPieCharts ===');
console.log(a.substring(idx, idx + 1500));
