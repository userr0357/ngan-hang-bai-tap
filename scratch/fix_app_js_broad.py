import os
import re

def fix_app_js(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
        content = f.read()
    
    # Mapping of corrupted strings to correct ones
    # These are based on the Select-String output
    replacements = {
        'Ging viAn': 'Giảng viên',
        'Ging ViAn': 'Giảng Viên',
        'MA Ging ViAn': 'Mã Giảng Viên',
        'MA ging viAn': 'Mã giảng viên',
        'MA\'n qun lA': 'Môn quản lý',
        'qun lA': 'quản lý',
        'mA\'n h?c': 'môn học',
        'ThA\'ng tin': 'Thông tin',
        '?ng nh-p': 'Đăng nhập',
        'Vn bn trc tip': 'Văn bản trực tiếp',
        'Tip +\'': 'Tiếp',
        'File nAcn': 'File nén',
        'TAi liu': 'Tài liệu',
        '??ng dn': 'Đường dẫn',
        'Cha cp nht': 'Chưa cập nhật',
        'QUY?N HN': 'QUYỀN HẠN',
        'o. ?A': '✅ Đã',
        'gA3p A': 'góp ý',
        'tip nh-n': 'tiếp nhận',
        '`Anh du lA': 'đánh dấu là',
        'sa!': 'sửa!',
        'dY"<': '📊'
    }

    for bad, good in replacements.items():
        content = content.replace(bad, good)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed {file_path}")

fix_app_js(r"c:\Users\Admin\Downloads\PTUD\PTUD\public\app.js")
