import sys
import os

file_path = 'public/app.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Replace 1: Add system ID logic
old1 = "originalInp.value = ex.id || '';"
new1 = """originalInp.value = ex.id || '';
            const sysIdCont = document.getElementById('system-id-container');
            const sysIdDisp = document.getElementById('display-system-id');
            if (sysIdCont && sysIdDisp) {
              sysIdCont.style.display = 'block';
              sysIdDisp.textContent = ex.id || '';
            }"""
content = content.replace(old1, new1)

# Replace 2: Correct ID mapping
old2 = "setIf('[name=id]', ex.id); setIf('[name=title]', ex.title); setIf('[name=difficulty]', ex.difficulty); setIf('[name=description]', ex.description || '');"
new2 = "setIf('[name=id]', ex.name); setIf('[name=skill_level]', ex.skill_level); setIf('[name=title]', ex.title); setIf('[name=difficulty]', ex.difficulty); setIf('[name=description]', ex.description || '');"
content = content.replace(old2, new2)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
