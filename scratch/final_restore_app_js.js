const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Admin', 'Downloads', 'PTUD', 'PTUD', 'public', 'app.js');

function deepTextRestore(file) {
    let content = fs.readFileSync(file, 'utf-8');
    
    const fixes = {
        'ðŸ“ ': '📌', 'ðŸ“': '📌',
        'ðŸ—‚': '📁', 'ðŸ—¹': '🗳️', 'ðŸ—‘': '🗑️',
        'ðŸ‘¤': '👤', 'ðŸ’¬': '💬', 'ðŸ …': '🏆',
        'ðŸ“Ž': '📎', 'âœ ï¸ ': '✍️', 'ðŸ§ ': '🧠',
        'ðŸ”—': '🔗', 'ðŸ“Š': '📊', 'ðŸ“±': '📱',
        'ðŸŒ ': '🌐', 'âœ¨': '✨', 'â ³': '⏳',
        'âš ï¸ ': '⚠️', 'Ã—': '×', 'â€¦': '...',
        'âœ…': '✅', 'âœ”': '✔', 'â Œ': '❌',
        'ï¸ ': '', // Variation selector junk
        
        // Complex Mojibake characters
        'lỨ‹ch sỨ­': 'lịch sử',
        'sẼ½': 'sẽ',
        'xuất hiỨ‡n': 'xuất hiện',
        'Tạo mỨ›i': 'Tạo mới',
        'Hành đỨ™ng': 'Hành động',
        'không thỨƒ': 'không thể',
        'hoàn tác': 'hoàn tác',
        'thỨ i gian': 'thời gian',
        'Dạng bi': 'Dạng bài',
        'di?m': 'điểm',
        'T?ng': 'Tổng',
        'Môn hỨ c': 'Môn học',
        'điỨƒm': 'điểm',
        'ĐỨ™ khó': 'Độ khó',
        'Lắp ghép cú pháp': 'Lắp ghép cú pháp',
        'LuỨ“ng rẼ½ nhánh': 'Luồng rẽ nhánh',
        'Vòng lẼ·p': 'Vòng lặp',
        'Hàm & Cấu trúc': 'Hàm & Cấu trúc',
        'Tư duy giải thuật': 'Tư duy giải thuật'
    };

    for (const [bad, good] of Object.entries(fixes)) {
        while (content.includes(bad)) {
            content = content.replace(bad, good);
        }
    }

    fs.writeFileSync(file, content, 'utf-8');
    console.log('Successfully applied deep text restoration to app.js');
}

deepTextRestore(filePath);
