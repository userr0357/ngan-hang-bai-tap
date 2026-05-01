const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Admin', 'Downloads', 'PTUD', 'PTUD', 'public', 'app.js');

function finalPolish(file) {
    let content = fs.readFileSync(file, 'utf-8');
    
    const fixes = [
        ['⚖️ï¸ ', '⚖️'],
        ['🗑️ï¸ ', '🗑️'],
        ['✏️ï¸ ', '✏️'],
        ['📝ï¸ ', '📝'],
        ['⚠️ï¸ ', '⚠️'],
        ['📥 ', '📥'],
        ['📌 ', '📌'],
        ['⚖️ ', '⚖️'],
        ['🗑️ ', '🗑️']
    ];

    for (const [bad, good] of fixes) {
        content = content.split(bad).join(good);
    }

    fs.writeFileSync(file, content, 'utf-8');
    console.log('Successfully polished app.js');
}

finalPolish(filePath);
