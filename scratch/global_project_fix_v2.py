import os
import re

def ultimate_project_fix_v2():
    # Root directory for processing
    root_dirs = [r"c:\Users\Admin\Downloads\PTUD\PTUD\public", r"c:\Users\Admin\Downloads\PTUD\PTUD"]
    exclude_dirs = ["node_modules", "backups", ".git", ".gemini", "uploads"]
    extensions = [".html", ".js", ".css"]

    # Updated mapping with ISO-8859-1 artifacts found in ai-features.js
    mojibake_map = {
        # ISO-8859-1 / Windows-1252 Common Artifacts
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
        'd?ng': 'dạng',
        'm t?': 'mô tả',
        'phn tch': 'phân tích',
        ' ': '💡 ',
        'd d?ng': 'đã dùng',
        'đ?': 'để',
        'v': 'và',
        'đ': 'đã',
        'm': 'mã',
        't': 'từ',
        'l': 'là',
        'c': 'có',
        'h': 'hệ',
        'th': 'thành',
        'ng': 'ngôn',
        'hng': 'hàng',
        'bi': 'bài',
        'tp': 'tập',
        
        # Multi-byte patterns
        'ðŸ“ ': '📌', 'ðŸ“': '📌',
        'âš–ï¸ ': '⚖️', 'âš–': '⚖️',
        'ðŸ—‘ï¸ ': '🗑️', 'ðŸ—‘': '🗑️',
        'âœ ï¸ ': '📝', 'âœ': '📝',
        'ï¸ ': '',
    }

    print("Starting global project-wide restoration V2...")
    
    files_processed = 0
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
                        with open(file_path, 'rb') as f:
                            raw_data = f.read()
                        
                        try:
                            content = raw_data.decode('utf-8')
                        except:
                            content = raw_data.decode('utf-8', errors='replace')
                        
                        modified = False
                        for bad, good in mojibake_map.items():
                            if bad in content:
                                content = content.replace(bad, good)
                                modified = True
                        
                        if modified:
                            with open(file_path, 'w', encoding='utf-8', newline='\n') as f:
                                f.write(content)
                            print(f"  [FIXED] {file_path}")
                            files_modified += 1
                        files_processed += 1
                    except Exception as e:
                        print(f"  [ERROR] Could not process {file_path}: {e}")

    print(f"\nRestoration Complete!")
    print(f"Total files processed: {files_processed}")
    print(f"Total files modified: {files_modified}")

if __name__ == "__main__":
    ultimate_project_fix_v2()
