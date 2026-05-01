const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Admin', 'Downloads', 'PTUD', 'PTUD', 'public', 'app.js');

function residualFix(file) {
    let content = fs.readFileSync(file, 'utf-8');
    
    const fixes = [
        ['NỨ™i', 'Nội'],
        ['hỨ£p', 'hợp'],
        ['đưỨ ng', 'đường'],
        ['trỨ±c tiẼ¿p', 'trực tiếp'],
        ['điỨƒm', 'điểm'],
        ['nỨ™p', 'nộp'],
        ['DỨ…', 'Dễ']
    ];

    for (const [bad, good] of fixes) {
        content = content.split(bad).join(good);
    }

    fs.writeFileSync(file, content, 'utf-8');
    console.log('Successfully applied residual fix to app.js');
}

residualFix(filePath);
