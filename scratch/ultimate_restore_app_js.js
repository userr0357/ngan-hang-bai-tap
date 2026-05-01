const fs = require('fs');
const path = require('path');

const filePath = path.join('c:', 'Users', 'Admin', 'Downloads', 'PTUD', 'PTUD', 'public', 'app.js');

function ultimateRestore(file) {
    let content = fs.readFileSync(file, 'utf-8');
    
    // Icons & Symbols
    const fixes = [
        ['ðŸ“ ', '📌'], ['ðŸ“', '📌'], ['📌„', '📌'],
        ['âš–ï¸ ', '⚖️'], ['âš–', '⚖️'],
        ['ðŸ—‘ï¸ ', '🗑️'], ['ðŸ—‘', '🗑️'],
        ['âœ ï¸ ', '📝'], ['âœ', '📝'],
        ['ðŸ“¤', '📤'], ['ðŸ“¥', '📥'], ['📥 ', '📥'],
        ['ðŸ’¬', '💬'], ['ðŸ …', '🏆'], ['ðŸ“Ž', '📎'],
        ['ðŸ—‚', '📁'], ['ðŸ”—', '🔗'], ['ðŸ“Š', '📊'],
        ['âœ¨', '✨'], ['â ³', '⏳'], ['Â·', '·'],
        ['ðŸ‘¤', '👤'], ['ðŸ’¡', '💡'], ['ðŸ” ', '🔍'],
        ['ðŸ”’', '🔒'], ['ðŸ‘‹', '👋'], ['ðŸ§ ', '🧠'],
        
        // Corrupted Vietnamese text patterns
        ['nỨ™p', 'nộp'],
        ['đưỨ ng dẫn', 'đường dẫn'],
        ['Văn bản trỨ±c tiẼ¿p', 'Văn bản trực tiếp'],
        ['Tài liỨ‡u', 'Tài liệu'],
        ['điỨƒm', 'điểm'],
        ['đỨƒ xuất', 'để xuất'],
        ['ĐỨ™ khó', 'Độ khó'],
        ['Môn hỨ c', 'Môn học'],
        ['Hành đỨ™ng', 'Hành động'],
        ['không thỨƒ', 'không thể'],
        ['lỨ‹ch sỨ­', 'lịch sử'],
        ['sẼ½', 'sẽ'],
        ['xuất hiỨ‡n', 'xuất hiện'],
        ['Tạo mỨ›i', 'Tạo mới'],
        ['DỨ…', 'Dễ'],
        ['LuỨ“ng rẼ½ nhánh', 'Luồng rẽ nhánh'],
        ['Vòng lẼ·p', 'Vòng lặp'],
        ['LuỨ“ng', 'Luồng'],
        ['rẼ½', 'rẽ'],
        ['lẼ·p', 'lặp'],
        ['tiẼ¿p', 'tiếp'],
        ['thỨ i gian', 'thời gian'],
        ['di?m', 'điểm'],
        ['T?ng', 'Tổng'],
        ['yu c?u', 'yêu cầu'],
        ['tiu ch', 'tiêu chí'],
        ['d? kh', 'độ khó'],
        ['d?nh d?ng', 'định dạng'],
        ['chnh t?', 'chính tả'],
        ['ki?n th?c', 'kiến thức'],
        ['h?ng', 'hỏng'],
        ['khc', 'khác'],
        ['yu c?u', 'yêu cầu'],
        ['Mn', 'Môn'],
        ['D?ng', 'Dạng'],
        ['Tn bi', 'Tên bài'],
        ['D? kh', 'Độ khó'],
        ['Tiu ch', 'Tiêu chí'],
        ['ging vin', 'giảng viên'],
        ['?ng nh-p', 'Đăng nhập'],
        ['?ang ti', 'Đang tải'],
        ['l<ch s-', 'lịch sử'],
        ['o"', '✨'],
        ['o?,?', '📝'],
        ['dY-`,?', '🗑️'],
        ['dY"s', '👋'],
        ['dY"?', '📌'],
        ['dY?.', '🏆'],
        ['dY",', '📎']
    ];

    for (const [bad, good] of fixes) {
        content = content.split(bad).join(good);
    }

    fs.writeFileSync(file, content, 'utf-8');
    console.log('Successfully applied ULTIMATE restoration to app.js');
}

ultimateRestore(filePath);
