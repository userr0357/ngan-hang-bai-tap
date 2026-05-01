import sys
import os

file_path = 'public/app.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Hide system ID when creating new
old = "  const modal = document.getElementById('exercise-modal'); if (modal) modal.classList.add('show');"
new = """  const sysIdCont = document.getElementById('system-id-container'); if (sysIdCont) sysIdCont.style.display = 'none';
  const modal = document.getElementById('exercise-modal'); if (modal) modal.classList.add('show');"""
content = content.replace(old, new)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
