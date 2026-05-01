const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Admin', 'Downloads', 'PTUD', 'PTUD', 'public', 'app.js');

function debugChars(file) {
    const content = fs.readFileSync(file, 'utf-8');
    const lines = content.split('\n');
    const target = lines[1994]; // line 1995 (0-indexed)
    console.log(`Line 1995: ${target}`);
    for (let i = 0; i < target.length; i++) {
        console.log(`Char ${i}: ${target[i]} (U+${target.charCodeAt(i).toString(16).padStart(4, '0')})`);
    }
}

debugChars(filePath);
