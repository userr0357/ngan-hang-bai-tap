import sys
import os

# 1. Update app.js beautify logic
file_app = 'public/app.js'
if os.path.exists(file_app):
    with open(file_app, 'r', encoding='utf-8') as f:
        content = f.read()
    # The labels in populateAdminSubmissionFormats was just for formats, but I might have similar logic for levels elsewhere or just in renderManageList
    # I'll update the meta string in renderManageList
    old_meta = 'meta.innerHTML = `<strong>Mã:</strong> <span style="color:#1e293b">${ex.name || \'\'}</span> | <strong>ID:</strong> <span style="color:#1e293b">${ex.id || \'\'}</span> | <strong>Level:</strong> <span style="color:#1e293b">${ex.skill_level || 1}</span>`;'
    new_meta = """const levelNames = {
          1: 'Lego', 2: 'Decision Making', 3: 'Repetition', 4: 'Modularization', 5: 'Problem Solver'
        };
        const levelName = levelNames[ex.skill_level] || 'Lego';
        meta.innerHTML = `<strong>Mã:</strong> <span style="color:#1e293b">${ex.name || ''}</span> | <strong>ID:</strong> <span style="color:#1e293b">${ex.id || ''}</span> | <strong>Level:</strong> <span style="color:#1e293b">${ex.skill_level || 1} (${levelName})</span>`;"""
    content = content.replace(old_meta, new_meta)
    with open(file_app, 'w', encoding='utf-8') as f:
        f.write(content)

# 2. Update AI prompt in server.js
file_server = 'server.js'
if os.path.exists(file_server):
    with open(file_server, 'r', encoding='utf-8') as f:
        content = f.read()
    old_prompt = "Skill Level 1-5 (1: Nhận biết, 2: Thông hiểu, 3: Vận dụng, 4: Vận dụng cao, 5: Sáng tạo)"
    new_prompt = """Programming Task Levels 1-5:
- Level 1: "Lego" (Basic syntax, variables, I/O, simple formulas)
- Level 2: "Decision Making" (if-else, switch-case, basic logic)
- Level 3: "Repetition" (Loops, Arrays, Strings, basic searching/sorting)
- Level 4: "Modularization" (Functions, Structs, Scope, modular design)
- Level 5: "Problem Solver" (File I/O, complex logic, real-world problems)"""
    content = content.replace(old_prompt, new_prompt)
    with open(file_server, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done")
