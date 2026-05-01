const fs = require('fs');
const h = fs.readFileSync('public/admin.html', 'utf8');

// Check section div
const sectionDiv = 'id="feedback-history" class="admin-section"';
const secIdx = h.indexOf(sectionDiv);
console.log('Section div at:', secIdx);

const fbList = h.indexOf('fb-admin-list');
console.log('fb-admin-list at:', fbList);

if (fbList > -1) {
  console.log('Context around fb-admin-list:');
  console.log(h.substring(fbList - 100, fbList + 50));
}

// Check switchSection in admin.js
const a = fs.readFileSync('public/admin.js', 'utf8');
const swIdx = a.indexOf("'feedback-history'");
console.log('\nadmin.js feedback-history at:', swIdx);
if (swIdx > -1) {
  console.log(a.substring(swIdx - 60, swIdx + 60));
}

const fnIdx = a.indexOf('function loadAllFeedbacks');
console.log('loadAllFeedbacks at:', fnIdx);
