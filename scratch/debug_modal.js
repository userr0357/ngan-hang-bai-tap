const fs = require('fs');
let h = fs.readFileSync('public/lecturer.html', 'utf8');

const startMarker = "const infoCards = [";
const startIdx = h.indexOf(startMarker);
console.log('Start at:', startIdx);

// Find the end by looking for the closing of .join
const afterStart = h.substring(startIdx);
// Look for the pattern: </div>`).join('');
const candidates = ["join('')", "join('');\n", "join('');"];
for (const c of candidates) {
  const i = afterStart.indexOf(c);
  if (i > -1) console.log(`Found "${c}" at offset ${i}, abs ${startIdx + i + c.length}`);
}

// Manual search for end
const lines = afterStart.split('\n');
for (let i = 0; i < Math.min(20, lines.length); i++) {
  console.log(i, JSON.stringify(lines[i].substring(0, 80)));
}
