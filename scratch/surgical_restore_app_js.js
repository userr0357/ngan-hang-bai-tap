const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Admin', 'Downloads', 'PTUD', 'PTUD', 'public', 'app.js');

function surgicalRestore(file) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Replace the specific junk sequence found: ï (U+00ef) + ¸ (U+00b8) + (U+008f)
    const junk = String.fromCharCode(0x00ef) + String.fromCharCode(0x00b8) + String.fromCharCode(0x008f);
    
    content = content.split(junk).join('');
    
    // Also remove any other U+008f characters that might be lingering
    content = content.split(String.fromCharCode(0x008f)).join('');

    fs.writeFileSync(file, content, 'utf-8');
    console.log('Successfully applied surgical restoration to app.js');
}

surgicalRestore(filePath);
