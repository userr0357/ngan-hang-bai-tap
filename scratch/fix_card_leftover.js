const fs = require('fs');
let h = fs.readFileSync('public/lecturer.html', 'utf8');

// The new template ends with `</div>` then there's leftover old template.
// Find the end of new template and the start of formCard.appendChild
const newEnd = '</div>`\n              <div style="display:flex;justify-content:space-between;';
const appendCall = "formCard.appendChild(card)";

const newEndIdx = h.indexOf(newEnd);
const appendIdx = h.indexOf(appendCall, newEndIdx);

if (newEndIdx > -1 && appendIdx > -1) {
  // Find the real end of new template (the backtick after </div>)
  const backtickPos = newEndIdx + '</div>`'.length;
  // Find the semicolon after old innerHTML closing
  const oldClose = h.indexOf('`;', newEndIdx + 10);
  
  console.log('New template end:', newEndIdx);
  console.log('Old template close:', oldClose);
  console.log('AppendChild:', appendIdx);
  
  // Remove everything between backtick end of new template and the ; of old template
  // New template should end: </div>\`; then formCard.appendChild(card)
  h = h.substring(0, backtickPos) + ';\n            ' + h.substring(oldClose + 2);
  console.log('✅ Removed leftover old template');
}

fs.writeFileSync('public/lecturer.html', h, 'utf8');
console.log('✅ Done!');
