import os
import re

def final_icon_fix(file_path):
    print(f"Final icon fix for {file_path}...")
    with open(file_path, 'rb') as f:
        data = f.read()
    
    # We will use regex on the raw bytes to find common UTF-8 Mojibake patterns
    # OR we decode and use string replacement. Decoding is safer if we know it's UTF-8.
    try:
        text = data.decode('utf-8')
    except:
        text = data.decode('utf-8', errors='replace')

    # Mapping of patterns found in Select-String output
    # Patterns like "dY\"?" are what the terminal showed, but in reality 
    # they are sequences like \xf0\x9f\x93\x8c
    
    # Let's map the literal mangled strings seen in previous view_file
    mojibake_map = {
        'ðŸ“ ': '📌',
        'ðŸ—¹': '🗳️',
        'ðŸ“¤': '📤',
        'ðŸ“¥': '📥',
        'ðŸ“‹': '📋',
        'ðŸ’¬': '💬',
        'ðŸ—‘ï¸ ': '🗑️',
        'ðŸ‘¤': '👤',
        'ðŸ—‚': '📁',
        'âš–ï¸ ': '⚖️',
        'ðŸ“Ž': '📎',
        'âœ ï¸ ': '✍️',
        'ðŸ§ ': '🧠',
        'ðŸ”—': '🔗',
        'ðŸ“Š': '📊',
        'ðŸ …': '🏆',
        'ðŸ“±': '📱',
        'ðŸŒ ': '🌐',
        'Ã—': '×',
        'â€¦': '...',
        'âœ¨': '✨',
        'â ³': '⏳',
        'âš ï¸ ': '⚠️',
        'ðŸ’¡': '💡',
        'ðŸ” ': '🔍',
        'ðŸ”’': '🔒',
        'ðŸ‘‹': '👋'
    }

    # Also handle the cases where they might have been partially fixed or mangled differently
    # Based on "dY\"?" pattern (F0 9F 93 8C)
    
    # I will replace some specific hardcoded mangled strings from the Select-String output
    # These are likely due to a previous edit tool misinterpreting bytes.
    extra_fixes = {
        'dY"?': '📌',
        'dY?.': '🏆',
        'dY",': '📎',
        'dY"s': '👋',
        'dY-`\x8f\x82,?': '🗑️',
        'dY"\'': '🔒',
        'dY-`\x8f\x82,?': '🗑️'
    }

    modified = False
    for bad, good in mojibake_map.items():
        if bad in text:
            text = text.replace(bad, good)
            modified = True
            
    for bad, good in extra_fixes.items():
        if bad in text:
            text = text.replace(bad, good)
            modified = True

    # Fix the specific "T?ng" and "di?m" issues (Missing characters)
    text = text.replace('T?ng:', 'Tổng:').replace('di?m', 'điểm')
    text = text.replace('yu c?u', 'yêu cầu').replace('N?Ti dung', 'Nội dung')
    text = text.replace('h??c k', 'học kỳ').replace('Khng c', 'Không có')

    if modified:
        with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
            f.write(text)
        print(f"  Successfully fixed icons in {file_path}")
    else:
        print(f"  No Mojibake found in {file_path}")

final_icon_fix(r"c:\Users\Admin\Downloads\PTUD\PTUD\public\app.js")
