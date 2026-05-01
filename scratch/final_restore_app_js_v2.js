const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Admin', 'Downloads', 'PTUD', 'PTUD', 'public', 'app.js');

function deepTextRestore(file) {
    let content = fs.readFileSync(file, 'utf-8');
    
    const fixes = [
        ['ðŸ“ ', '📌'], ['ðŸ“', '📌'],
        ['ðŸ—‚', '📁'], ['ðŸ—¹', '🗳️'], ['ðŸ—‘', '🗑️'],
        ['ðŸ‘¤', '👤'], ['ðŸ’¬', '💬'], ['ðŸ …', '🏆'],
        ['ðŸ“Ž', '📎'], ['âœ ï¸ ', '✍️'], ['ðŸ§ ', '🧠'],
        ['ðŸ”—', '🔗'], ['ðŸ“Š', '📊'], ['ðŸ“±', '📱'],
        ['ðŸŒ ', '🌐'], ['âœ✨', '✨'], ['âœ¨', '✨'],
        ['â ³', '⏳'], ['âš ï¸ ', '⚠️'], ['Ã—', '×'], ['â€¦', '...'],
        ['âœ…', '✅'], ['âœ”', '✔'], ['â Œ', '❌'],
        ['ï¸ ', ''],
        
        ['lỨ‹ch sỨ­', 'lịch sử'],
        ['sẼ½', 'sẽ'],
        ['xuất hiỨ‡n', 'xuất hiện'],
        ['Tạo mỨ›i', 'Tạo mới'],
        ['Hành đỨ™ng', 'Hành động'],
        ['không thỨƒ', 'không thể'],
        ['thỨ i gian', 'thời gian'],
        ['di?m', 'điểm'],
        ['T?ng', 'Tổng'],
        ['Môn hỨ c', 'Môn học'],
        ['điỨƒm', 'điểm'],
        ['ĐỨ™ khó', 'Độ khó'],
        ['LuỨ“ng rẼ½ nhánh', 'Luồng rẽ nhánh'],
        ['Vòng lẼ·p', 'Vòng lặp']
    ];

    for (const [bad, good] of fixes) {
        // Use split/join for global replacement if replaceAll isn't available
        content = content.split(bad).join(good);
    }

    fs.writeFileSync(file, content, 'utf-8');
    console.log('Successfully applied global text restoration to app.js');
}

deepTextRestore(filePath);
