import os

def final_global_repair():
    root_dirs = [r"c:\Users\Admin\Downloads\PTUD\PTUD\public", r"c:\Users\Admin\Downloads\PTUD\PTUD"]
    extensions = [".html", ".js", ".css"]
    exclude_dirs = ["node_modules", "backups", ".git", ".gemini", "uploads"]

    # 1. Patterns from the recursive corruption (my previous mistake)
    recursive_map = {
        '💡💡': '',
        'từừ': 't',
        'cóó': 'c',
        'hệệ': 'h',
        'làà': 'l',
        'mãã': 'm',
        'ngônôn': 'ng',
        'vàà': 'v',
        'đãã': 'đ',
        'shệệow': 'show',
        'stừừ': 'st',
        'vààalààue': 'value',
        'cóóonstừừ': 'const',
        'funcóótừừion': 'function',
        'evààentừừ': 'event',
        'selààecóótừừed': 'selected',
        'disablààed': 'disabled',
        'applààicóóatừừion': 'application',
        'incóólààude': 'include',
        'mããetừừhệệod': 'method',
        'cóóredentừừialààs': 'credentials',
        'JSON.stừừringônônify': 'JSON.stringify',
        'fetừừcóóhệệ': 'fetch',
        'docóóumããentừừ': 'document',
        'getừừElààemããentừừById': 'getElementById',
        'querySelààecóótừừor': 'querySelector',
        'addEvààentừừListừừener': 'addEventListener',
        'DOMContừừentừừLoaded': 'DOMContentLoaded',
        'scóórolààlàà': 'scroll',
        'IntừừoView': 'IntoView',
        'behệệavààior': 'behavior',
        'smããootừừhệệ': 'smooth',
        'stừừartừừ': 'start',
        'setừừTimããeoutừừ': 'setTimeout',
        'urlààParamããs': 'urlParams',
        'secóótừừion': 'section',
        'dashệệboard': 'dashboard',
        'lààecóótừừurer': 'lecturer',
        'datừừa': 'data',
        'gvàà': 'gv',
        'PerPage': 'PerPage',
        'Initừừialààize': 'Initialize',
        'switừừcóóhệệ': 'switch',
        'mããenu': 'menu',
        'itừừemãã': 'item',
        'acóótừừivààe': 'active',
        'admããin': 'admin',
        'lààoad': 'load',
        'Exercóóises': 'Exercises',
        'hệệistừừory': 'history',
        'Acóótừừivààitừừy': 'Activity',
        'stừừudentừừs': 'students',
        'exportừừ': 'export',
        'alààias': 'alias',
        'searcóóhệệ': 'search',
        'filààtừừer': 'filter',
        'cóólààass': 'class',
        'focóóus': 'focus',
        'cóóentừừer': 'center',
        'facóóulààtừừy': 'faculty',
        'shệệowToastừừ': 'showToast',
        'submããitừừtừừed': 'submitted',
        'wrapper': 'wrapper',
    }

    # 2. Patterns from the original Mojibake (the user's complaint)
    mojibake_map = {
        'yu c?u': 'yêu cầu',
        'Vui lng': 'Vui lòng',
        'di?n': 'điền',
        'tiu d?': 'tiêu đề',
        'v m t?': 'và mô tả',
        'd? AI': 'để AI',
        'ki?m d?nh': 'kiểm định',
        'Dang ki?m d?nh': 'Đang kiểm định',
        'Dang phn tch': 'Đang phân tích',
        'H?p l?': 'Hợp lệ',
        'C?n ch y': 'Cần chú ý',
        'Khng d?t': 'Không đạt',
        '?? G?i y': '💡 Gợi ý',
        'c c?i thi?n': 'cải thiện',
        'Ch?t Lu?ng': 'Chất Lượng',
        'Kh?i t?o': 'Khởi tạo',
        'g?i khi': 'gọi khi',
        'Thm event': 'Thêm event',
        'L?i:': 'Lỗi:',
        'd d?ng': 'đã dùng',
        'bi tp': 'bài tập',
        'hng': 'hàng',
        'ng': 'ngôn',
        'th': 'thành',
        ' h ': ' hệ ',
    }

    # Combine and sort by length descending
    full_map = {**recursive_map, **mojibake_map}
    sorted_keys = sorted(full_map.keys(), key=len, reverse=True)

    print("Starting Comprehensive Global Repair...")
    
    files_modified = 0
    for base_dir in root_dirs:
        for root, dirs, files in os.walk(base_dir):
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            for file in files:
                if any(file.endswith(ext) for ext in extensions):
                    file_path = os.path.join(root, file)
                    if "backup" in file.lower() or "scratch" in root:
                        continue
                    try:
                        with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
                            content = f.read()
                        
                        original_content = content
                        for bad in sorted_keys:
                            content = content.replace(bad, full_map[bad])
                        
                        if content != original_content:
                            with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
                                f.write(content)
                            print(f"  [FIXED] {file_path}")
                            files_modified += 1
                    except Exception as e:
                        print(f"  [ERROR] {file_path}: {e}")

    print(f"\nRepair Complete! {files_modified} files normalized.")

if __name__ == "__main__":
    final_global_repair()
