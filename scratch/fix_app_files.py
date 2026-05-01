import sys
import os

file_path = 'public/app.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add file preview reset to edit button
old = "const setIf = (selector, value) => { const el = formEl.querySelector(selector); if (el) el.value = value || ''; };"
new = """const setIf = (selector, value) => { const el = formEl.querySelector(selector); if (el) el.value = value || ''; };
            
            // Reset file input and preview
            const fileInp = document.getElementById('field-files');
            const previewArea = document.getElementById('file-list-preview');
            if (fileInp) fileInp.value = '';
            if (previewArea) previewArea.innerHTML = '';
            if (ex.file_dinh_kem) {
               const files = ex.file_dinh_kem.split(',');
               files.forEach(f => {
                 const badge = document.createElement('div');
                 badge.className = 'file-info-badge';
                 badge.style.background = '#e0e7ff';
                 badge.innerHTML = `<a href="${f}" target="_blank" style="color:var(--primary); font-weight:600; font-size:11px;">📂 File cũ</a>`;
                 previewArea.appendChild(badge);
               });
            }"""
content = content.replace(old, new)

# Also update btnCreateNew to reset files
old_create = "renderRequirements(); renderGradingList();"
new_create = """renderRequirements(); renderGradingList();
  const fInp = document.getElementById('field-files');
  const pArea = document.getElementById('file-list-preview');
  if (fInp) fInp.value = '';
  if (pArea) pArea.innerHTML = '';"""
content = content.replace(old_create, new_create)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
