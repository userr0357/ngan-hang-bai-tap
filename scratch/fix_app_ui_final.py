import sys
import os

file_path = 'public/app.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update meta.innerHTML to include Lecturer Name
old_meta = """        const levelName = levelNames[ex.skill_level] || 'Lego';
        meta.innerHTML = `<strong>Mã:</strong> <span style="color:#1e293b">${ex.name || ''}</span> | <strong>ID:</strong> <span style="color:#1e293b">${ex.id || ''}</span> | <strong>Level:</strong> <span style="color:#1e293b">${ex.skill_level || 1} (${levelName})</span>`;"""

new_meta = """        const levelName = levelNames[ex.skill_level] || 'Lắp ghép cú pháp';
        meta.innerHTML = `<strong>Mã:</strong> <span style="color:#1e293b">${ex.name || '---'}</span> | <strong>ID:</strong> <span style="color:#1e293b">${ex.id || ''}</span> | <strong>Level:</strong> <span style="color:#1e293b">${ex.skill_level || 1} (${levelName})</span> | <strong>GV:</strong> <span style="color:#1e293b">${ex.owner_name || 'Hệ thống'}</span>`;"""

content = content.replace(old_meta, new_meta)

# 2. Update formatStr beautification
old_format = "const formatStr = ex.submission_format || '(Không rõ)';"
new_format = """let formatStr = ex.submission_format || '(Không rõ)';
        // Beautify common formats
        formatStr = formatStr.replace(/zip/g, 'File nén').replace(/pdf/g, 'Tài liệu').replace(/docx/g, 'Văn bản').replace(/link/g, 'Đường dẫn').replace(/text/g, 'Văn bản trực tiếp');"""

content = content.replace(old_format, new_format)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
