import sys
import os

# 1. Update admin.html
file_admin_html = 'public/admin.html'
if os.path.exists(file_admin_html):
    with open(file_admin_html, 'r', encoding='utf-8') as f:
        content = f.read()
    old_admin_options = """          <option value="1">Level 1: "Lego" (Lắp ghép cú pháp)</option>
          <option value="2">Level 2: "Decision Making" (Luồng rẽ nhánh)</option>
          <option value="3">Level 3: "Repetition" (Vòng lặp & Mảng)</option>
          <option value="4">Level 4: "Modularization" (Hàm & Cấu trúc)</option>
          <option value="5">Level 5: "Problem Solver" (Tư duy giải thuật)</option>"""
    new_admin_options = """          <option value="1">Level 1: Lắp ghép cú pháp</option>
          <option value="2">Level 2: Luồng rẽ nhánh</option>
          <option value="3">Level 3: Vòng lặp & Mảng</option>
          <option value="4">Level 4: Hàm & Cấu trúc</option>
          <option value="5">Level 5: Tư duy giải thuật</option>"""
    content = content.replace(old_admin_options, new_admin_options)
    with open(file_admin_html, 'w', encoding='utf-8') as f:
        f.write(content)

# 2. Update app.js beautify logic
file_app = 'public/app.js'
if os.path.exists(file_app):
    with open(file_app, 'r', encoding='utf-8') as f:
        content = f.read()
    old_names = "1: 'Lego', 2: 'Decision Making', 3: 'Repetition', 4: 'Modularization', 5: 'Problem Solver'"
    new_names = "1: 'Lắp ghép cú pháp', 2: 'Luồng rẽ nhánh', 3: 'Vòng lặp & Mảng', 4: 'Hàm & Cấu trúc', 5: 'Tư duy giải thuật'"
    content = content.replace(old_names, new_names)
    with open(file_app, 'w', encoding='utf-8') as f:
        f.write(content)

# 3. Update server.js prompt
file_server = 'server.js'
if os.path.exists(file_server):
    with open(file_server, 'r', encoding='utf-8') as f:
        content = f.read()
    # Update levelNames in validate-exercise
    old_ln = "{ 1: 'Lego (Cú pháp)', 2: 'Decision Making (Rẽ nhánh)', 3: 'Repetition (Vòng lặp)', 4: 'Modularization (Hàm)', 5: 'Problem Solver (Giải thuật)' }"
    new_ln = "{ 1: 'Lắp ghép cú pháp', 2: 'Luồng rẽ nhánh', 3: 'Vòng lặp & Mảng', 4: 'Hàm & Cấu trúc', 5: 'Tư duy giải thuật' }"
    content = content.replace(old_ln, new_ln)
    
    # Update Programming Task Levels description
    old_ptl = """Programming Task Levels 1-5:
- Level 1: "Lego" (Basic syntax, variables, I/O, simple formulas)
- Level 2: "Decision Making" (if-else, switch-case, basic logic)
- Level 3: "Repetition" (Loops, Arrays, Strings, basic searching/sorting)
- Level 4: "Modularization" (Functions, Structs, Scope, modular design)
- Level 5: "Problem Solver" (File I/O, complex logic, real-world problems)"""
    new_ptl = """Programming Task Levels 1-5 (Tiếng Việt):
- Level 1: Lắp ghép cú pháp (Cú pháp cơ bản, biến, nhập/xuất, công thức đơn giản)
- Level 2: Luồng rẽ nhánh (if-else, switch-case, logic điều kiện)
- Level 3: Vòng lặp & Mảng (Vòng lặp, mảng, chuỗi, thuật toán tìm kiếm/sắp xếp cơ bản)
- Level 4: Hàm & Cấu trúc (Chia hàm, Struct, phạm vi biến, thiết kế module)
- Level 5: Tư duy giải thuật (Xử lý file, logic phức tạp, bài toán thực tế)"""
    content = content.replace(old_ptl, new_ptl)
    
    with open(file_server, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done")
