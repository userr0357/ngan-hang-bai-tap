import os
import re

def ultimate_project_fix():
    # Root directory for processing
    root_dirs = [r"c:\Users\Admin\Downloads\PTUD\PTUD\public", r"c:\Users\Admin\Downloads\PTUD\PTUD"]
    # We will exclude node_modules and backups
    exclude_dirs = ["node_modules", "backups", ".git", ".gemini", "uploads"]
    
    # Extensions to process
    extensions = [".html", ".js", ".css"]

    # Mapping of corrupted strings (Mojibake + PowerShell "?" artifacts)
    # This covers both the multi-byte sequences and the single-byte misreadings
    mojibake_map = {
        # Emojis & Symbols (Multi-byte patterns)
        'ðŸ“ ': '📌', 'ðŸ“': '📌', '📌„': '📌',
        'âš–ï¸ ': '⚖️', 'âš–': '⚖️',
        'ðŸ—‘ï¸ ': '🗑️', 'ðŸ—‘': '🗑️',
        'âœ ï¸ ': '📝', 'âœ': '📝',
        'ðŸ“¤': '📤', 'ðŸ“¥': '📥', '📥 ': '📥',
        'ðŸ’¬': '💬', 'ðŸ …': '🏆', 'ðŸ“Ž': '📎',
        'ðŸ—‚': '📁', 'ðŸ”—': '🔗', 'ðŸ“Š': '📊',
        'âœ¨': '✨', 'â ³': '⏳', 'Â·': '·',
        'ðŸ‘¤': '👤', 'ðŸ’¡': '💡', 'ðŸ” ': '🔍',
        'ðŸ”’': '🔒', 'ðŸ‘‹': '👋', 'ðŸ§ ': '🧠', 'ï¸ ': '',
        'dY"?': '📌', 'dY?.': '🏆', 'dY",': '📎', 'dY"s': '👋',
        
        # Common Corrupted Phrases (Cases found in admin/login/register)
        'Dang nh?p': 'Đăng nhập',
        'Dang ky': 'Đăng ký',
        'Ngn Hng': 'Ngân Hàng',
        'Bi T?p': 'Bài Tập',
        'Ngn hng': 'Ngân hàng',
        'bi t?p': 'bài tập',
        'gi?ng vin': 'giảng viên',
        'Gi?ng vin': 'Giảng viên',
        'Gi?ng Vin': 'Giảng Viên',
        'gi?ng viAn': 'giảng viên',
        'ma GV': 'mã GV',
        'Ma GV': 'Mã GV',
        'ma bi': 'mã bài',
        'Ma bi': 'Mã bài',
        'Ma Mn': 'Mã Môn',
        'ma mn': 'mã môn',
        'H? th?ng': 'Hệ thống',
        'h? th?ng': 'hệ thống',
        'Da c': 'Đã có',
        'Da n?p': 'Đã nộp',
        'n?p bi': 'nộp bài',
        'Qun m?t kh?u': 'Quên mật khẩu',
        'd? nh?n ma': 'để nhận mã',
        'G?i ma OTP': 'Gửi mã OTP',
        't? email': 'từ email',
        'mn h?c': 'môn học',
        'Mn h?c': 'Môn học',
        'd?ng bi': 'dạng bài',
        'D?ng bi': 'Dạng bài',
        'm?c d?': 'mức độ',
        'k? nang': 'kỹ năng',
        'l?p trnh': 'lập trình',
        'qu?n ly': 'quản lý',
        'Qu?n ly': 'Quản lý',
        'Qu?n Ly': 'Quản Lý',
        'Phn b?': 'Phân bổ',
        't?ng mn': 'tổng môn',
        'Da kha': 'Đã khóa',
        'Ho?t d?ng': 'Hoạt động',
        'thng tin': 'thông tin',
        'thnh cng': 'thành công',
        't?t c?': 'tất cả',
        'du?c gn': 'được gán',
        'Vui lng': 'Vui lòng',
        'di?n d?y d?': 'điền đầy đủ',
        'ky t?': 'ký tự',
        't?o mn': 'tạo môn',
        'ti kho?n': 'tài khoản',
        'Ti kho?n': 'Tài khoản',
        'xm ph?m': 'xâm phạm',
        'b?o m?t': 'bảo mật',
        'xA3a': 'xóa',
        'nAcn': 'nén',
        'TAi liu': 'tài liệu',
        'l<ch s-': 'lịch sử',
        'Chua phn cng': 'Chưa phân công',
        'Luu danh sch': 'Lưu danh sách',
        'theo t?ng': 'theo từng',
        'ngy g?n dy': 'ngày gần đây',
        'thng g?n dy': 'tháng gần đây',
        'nam g?n dy': 'năm gần đây',
        'Tm ki?m': 'Tìm kiếm',
        'tn ho?c ma': 'tên hoặc mã',
        'Ma Gi?ng Vin': 'Mã Giảng Viên',
        'ma dng d?': 'mã dùng để',
        'dang nh?p vo': 'đăng nhập vào',
        'khng th? thay d?i': 'không thể thay đổi',
        'thay d?i ma': 'thay đổi mã',
        'Chua cA3': 'Chưa có',
        'thao tAc': 'thao tác',
        'mA3i': 'mới',
        'c-p nh-t': 'cập nhật',
        'nỨ™p': 'nộp',
        'đưỨ ng': 'đường',
        'trỨ±c tiẼ¿p': 'trực tiếp'
    }

    print("Starting global project-wide restoration...")
    
    files_processed = 0
    files_modified = 0

    for base_dir in root_dirs:
        for root, dirs, files in os.walk(base_dir):
            # Skip excluded directories
            dirs[:] = [d for d in dirs if d not in exclude_dirs]
            
            for file in files:
                if any(file.endswith(ext) for ext in extensions):
                    file_path = os.path.join(root, file)
                    
                    # Avoid processing backups or scripts we created
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
                        
                        # Apply mapping
                        for bad, good in mojibake_map.items():
                            if bad in content:
                                content = content.replace(bad, good)
                                modified = True
                        
                        # Fix double-spacing (just in case)
                        if "\r\r\n" in content:
                            content = content.replace("\r\r\n", "\n")
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
    ultimate_project_fix()
