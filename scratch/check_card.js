const fs = require('fs');
const h = fs.readFileSync('public/lecturer.html', 'utf8');

// Find the new card template in JS
const marker = "card.className = 'ex-card'";
const idx = h.indexOf(marker);
if (idx > -1) {
  // Show the full card template  
  const end = h.indexOf('formCard.appendChild(card)', idx);
  console.log('Card template:');
  console.log(h.substring(idx, end));
} else {
  console.log('ex-card className not found');
}
