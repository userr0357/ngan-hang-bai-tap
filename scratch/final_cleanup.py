import os
import re

def super_clean_app_js(file_path):
    print(f"Super cleaning {file_path}...")
    with open(file_path, 'rb') as f:
        raw_data = f.read()
    
    # Try to decode
    try:
        text = raw_data.decode('utf-8')
    except:
        text = raw_data.decode('utf-8', errors='replace')
    
    # 1. Normalize line endings and remove double-spacing
    text = text.replace('\r\r\n', '\n').replace('\r\n', '\n').replace('\r', '\n')
    
    # 2. Fix Mojibake (targeted replacements)
    replacements = {
        'Ã ': 'à', 'Ã¡': 'á', 'Ã¢': 'â', 'Ã£': 'ã', 'Ã¨': 'è', 'Ã©': 'é', 'Ãª': 'ê',
        'Ã¬': 'ì', 'Ã­': 'í', 'Ã²': 'ò', 'Ã³': 'ó', 'Ã´': 'ô', 'Ãµ': 'õ', 'Ã¹': 'ù',
        'Ãº': 'ú', 'Ã½': 'ý', 'Äƒ': 'ă', 'Ä‘': 'đ', 'Ä ': 'Đ', 'Ä©': 'ĩ', 'Å©': 'ũ',
        'Æ°': 'ư', 'Æ¡': 'ơ', 'â€”': '—', 'âœ…': '✅', 'âœ”': '✔', 'â Œ': '❌',
        'â ³': '⏳', 'ðŸ“ ': '📌', 'ðŸ—¹': '🗳️', 'ðŸ“¤': '📤', 'ðŸ“¥': '📥',
        'ðŸ“‹': '📋', 'ðŸ’¬': '💬', 'ðŸ—‘ï¸ ': '🗑️', 'ðŸ‘¤': '👤', 'ðŸ—‚': '📁',
        'âš–ï¸ ': '⚖️', 'ðŸ“Ž': '📎', 'âœ ï¸ ': '✍️', 'ðŸ§ ': '🧠', 'ðŸ”—': '🔗',
        'ðŸ“Š': '📊', 'ðŸ …': '🏆', 'Ã—': '×', 'â€¦': '...',
        'LuỨ“ng rẼ½ nhánh': 'Luồng rẽ nhánh',
        'Vòng lẼ·p': 'Vòng lặp',
        'kỨ¹ thuật': 'kỹ thuật',
        'điỨƒm': 'điểm',
        'TỨ•ng': 'Tổng',
        'HỨ‡ thỨ‘ng': 'Hệ thống',
        'Hình thỨ©c nỨ™p': 'Hình thức nộp',
        'đỨƒ xuất': 'để xuất',
        'ĐỨ™ khó': 'Độ khó',
        'môn hỨ c': 'môn học',
        'lỨ‹ch sỨ­': 'lịch sử',
        'sẼ½': 'sẽ',
        'xuất hiỨ‡n': 'xuất hiện',
        'Tạo mỨ›i': 'Tạo mới',
        'Đang hoạt đỨ™ng': 'Đang hoạt động'
    }
    
    for bad, good in replacements.items():
        text = text.replace(bad, good)
        
    # 3. Final spacing cleanup: remove 3+ newlines
    text = re.sub(r'\n{3,}', '\n\n', text)
    
    # 4. Remove leading/trailing whitespace from each line (optional, but keeps it clean)
    # Actually don't, it might mess up indentation.
    
    with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
        f.write(text)
    
    print(f"  Done. New length: {len(text)}")

super_clean_app_js(r"c:\Users\Admin\Downloads\PTUD\PTUD\public\app.js")
