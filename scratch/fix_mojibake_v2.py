import os

def fix_mojibake_safe(file_path):
    print(f"Fixing {file_path}...")
    with open(file_path, 'rb') as f:
        content = f.read()
    
    # Try to decode as UTF-8
    try:
        text = content.decode('utf-8')
    except UnicodeDecodeError:
        # If it fails, maybe it's already Latin-1 or something else
        print(f"  Failed to decode {file_path} as UTF-8")
        return

    # Dictionary of known Mojibake patterns to fix
    # Patterns for Vietnamese UTF-8 interpreted as Latin-1
    replacements = {
        'Tiáº¿p nháº­n gÃ³p Ã½': 'Tiếp nhận góp ý',
        'Quáº£n lÃ½ bÃ i táº­p': 'Quản lý bài tập',
        'Lá»‹ch sá»­ bÃ i táº­p': 'Lịch sử bài tập',
        'Tá»•ng Quan': 'Tổng Quan',
        'Há»“ sÆ¡ cÃ¡ nhÃ¢n': 'Hồ sơ cá nhân',
        'Ä‘Äƒng nháº­p': 'đăng nhập',
        'mÃ´n há» c': 'môn học',
        'BÃ i táº­p': 'Bài tập',
        'gá»­i': 'gửi',
        'nháº­n': 'nhận',
        'Ä‘Ã£': 'đã'
    }

    modified = False
    for bad, good in replacements.items():
        if bad in text:
            text = text.replace(bad, good)
            print(f"  Fixed pattern: {bad} -> {good}")
            modified = True

    if modified:
        with open(file_path, 'wb') as f:
            f.write(text.encode('utf-8'))
        print(f"  Saved {file_path}")
    else:
        print(f"  No recognized patterns found in {file_path}")

fix_mojibake_safe(r"c:\Users\Admin\Downloads\PTUD\PTUD\public\lecturer.html")
fix_mojibake_safe(r"c:\Users\Admin\Downloads\PTUD\PTUD\public\app.js")
