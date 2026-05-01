const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Admin', 'Downloads', 'PTUD', 'PTUD', 'public', 'app.js');

function fixByteMojibake(file) {
    let buffer = fs.readFileSync(file);
    
    // Mapping of Mojibake byte sequences to correct UTF-8 byte sequences
    // F0 9F 93 8C is 📌
    // F0 9F 93 81 is 📁
    
    // Let's find sequences like ðŸ“ (C3 B0 C5 B8 E2 gS) -- no, Latin-1 mapping is:
    // ð = 0xF0
    // Ÿ = 0x9F
    // “ = 0x93
    
    const replacements = [
        { bad: Buffer.from([0xF0, 0x9F, 0x93, 0x8C]), good: '📌' },
        { bad: Buffer.from([0xF0, 0x9F, 0x93, 0x81]), good: '📁' },
        { bad: Buffer.from([0xF0, 0x9F, 0x93, 0x94]), good: '📔' },
        { bad: Buffer.from([0xF0, 0x9F, 0x93, 0x8A]), good: '📊' },
        { bad: Buffer.from([0xF0, 0x9F, 0x93, 0x8B]), good: '📋' },
        { bad: Buffer.from([0xF0, 0x9F, 0x93, 0x9D]), good: '📝' },
        { bad: Buffer.from([0xF0, 0x9F, 0x93, 0xA4]), good: '📤' },
        { bad: Buffer.from([0xF0, 0x9F, 0x93, 0xA5]), good: '📥' },
        { bad: Buffer.from([0xF0, 0x9F, 0x97, 0x91]), good: '🗑️' }
    ];

    let content = buffer.toString('utf-8'); // Read it as UTF-8 first
    
    // Actually, if the file is ALREADY UTF-8 but contains these characters, 
    // it's just a matter of string replacement. 
    // The issue is that some editors/tools interpret these bytes as individual characters.
    
    // I will replace common Mojibake strings
    const stringReplacements = {
        'ðŸ“ ': '📌',
        'ðŸ“': '📌',
        'ðŸ—‚': '📁',
        'ðŸ—¹': '🗳️',
        'ðŸ—‘': '🗑️',
        'ðŸ‘¤': '👤',
        'ðŸ’¬': '💬',
        'ðŸ …': '🏆',
        'ðŸ“Ž': '📎',
        'âœ ï¸ ': '✍️',
        'ðŸ§ ': '🧠',
        'ðŸ”—': '🔗',
        'ðŸ“Š': '📊',
        'ðŸ“±': '📱',
        'ðŸŒ ': '🌐',
        'âœ✨': '✨',
        'âœ¨': '✨',
        'â ³': '⏳',
        'âš ï¸ ': '⚠️',
        'Ã—': '×',
        'â€¦': '...',
        'âœ…': '✅',
        'âœ”': '✔',
        'â Œ': '❌'
    };

    for (const [bad, good] of Object.entries(stringReplacements)) {
        while (content.includes(bad)) {
            content = content.replace(bad, good);
        }
    }

    fs.writeFileSync(file, content, 'utf-8');
    console.log('Fixed Mojibake in app.js');
}

fixByteMojibake(filePath);
