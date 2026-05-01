import sys
import os

file_path = 'public/admin.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add drop zone and format populate logic to setupAdminExerciseModal
old_setup = """function setupAdminExerciseModal() {
  const closeBtn = document.getElementById('admin-modal-close');
  if (closeBtn) closeBtn.onclick = closeAdminExerciseModal;
  const cancelBtn = document.getElementById('admin-exercise-cancel');
  if (cancelBtn) cancelBtn.onclick = closeAdminExerciseModal;
  
  const reqAddBtn = document.getElementById('admin-req-add');
  if (reqAddBtn) reqAddBtn.onclick = addAdminRequirement;
  const gradeAddBtn = document.getElementById('admin-grade-add');
  if (gradeAddBtn) gradeAddBtn.onclick = addAdminGradingCriteria;
}"""

new_setup = """function setupAdminExerciseModal() {
  const closeBtn = document.getElementById('admin-modal-close');
  if (closeBtn) closeBtn.onclick = closeAdminExerciseModal;
  const cancelBtn = document.getElementById('admin-exercise-cancel');
  if (cancelBtn) cancelBtn.onclick = closeAdminExerciseModal;
  
  const reqAddBtn = document.getElementById('admin-req-add');
  if (reqAddBtn) reqAddBtn.onclick = addAdminRequirement;
  const gradeAddBtn = document.getElementById('admin-grade-add');
  if (gradeAddBtn) gradeAddBtn.onclick = addAdminGradingCriteria;

  initAdminDropZone();
  populateAdminSubmissionFormats();
}

function initAdminDropZone() {
  const dropZone = document.getElementById('admin-file-drop-zone');
  const fileInput = document.getElementById('admin-field-files');
  const preview = document.getElementById('admin-file-list-preview');
  if (!dropZone || !fileInput) return;
  dropZone.onclick = () => fileInput.click();
  dropZone.ondragover = (e) => { e.preventDefault(); dropZone.classList.add('dragover'); };
  dropZone.ondragleave = () => { dropZone.classList.remove('dragover'); };
  dropZone.ondrop = (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    if (e.dataTransfer.files.length) { fileInput.files = e.dataTransfer.files; renderAdminFilePreview(fileInput.files); }
  };
  fileInput.onchange = () => renderAdminFilePreview(fileInput.files);
  function renderAdminFilePreview(files) {
    preview.innerHTML = '';
    Array.from(files).forEach((file, index) => {
      const badge = document.createElement('div'); badge.className = 'file-info-badge';
      badge.innerHTML = `<span>📄 ${file.name}</span> <span class="remove-file">×</span>`;
      preview.appendChild(badge);
    });
  }
  preview.onclick = (e) => { if (e.target.classList.contains('remove-file')) { e.stopPropagation(); fileInput.value = ''; preview.innerHTML = ''; } };
}

function populateAdminSubmissionFormats() {
  const selFormat = document.getElementById('admin-field-submission');
  if (!selFormat) return;
  fetch('/api/submission-formats').then(r => r.json()).then(data => {
    selFormat.innerHTML = '';
    data.forEach(fmt => {
      const o = document.createElement('option'); o.value = fmt.TenDinhDang;
      let label = fmt.TenDinhDang;
      if (label === 'zip') label = 'File nén (.zip, .rar)';
      if (label === 'pdf') label = 'Tài liệu (.pdf)';
      if (label === 'docx') label = 'Văn bản (.docx)';
      if (label === 'link') label = 'Đường dẫn (GitHub/Drive)';
      if (label === 'text') label = 'Văn bản trực tiếp';
      if (label === 'image') label = 'Hình ảnh (.jpg, .png)';
      o.textContent = label; selFormat.appendChild(o);
    });
  });
}"""
content = content.replace(old_setup, new_setup)

# Update openAdminExerciseModal to reset files
old_open = "titleEl.textContent = 'Chỉnh Sửa Bài Tập';"
new_open = """titleEl.textContent = 'Chỉnh Sửa Bài Tập';
    // Reset and show files
    const fInp = document.getElementById('admin-field-files');
    const pArea = document.getElementById('admin-file-list-preview');
    if (fInp) fInp.value = '';
    if (pArea) {
      pArea.innerHTML = '';
      if (exercise.file_dinh_kem) {
        exercise.file_dinh_kem.split(',').forEach(f => {
          const badge = document.createElement('div'); badge.className = 'file-info-badge'; badge.style.background = '#e0e7ff';
          badge.innerHTML = `<a href="${f}" target="_blank" style="color:var(--primary); font-weight:600; font-size:11px;">📂 File cũ</a>`;
          pArea.appendChild(badge);
        });
      }
    }"""
content = content.replace(old_open, new_open)

# Reset files for new exercise
old_new = "titleEl.textContent = 'Thêm Bài Tập Mới';"
new_new = """titleEl.textContent = 'Thêm Bài Tập Mới';
    const fInp2 = document.getElementById('admin-field-files');
    const pArea2 = document.getElementById('admin-file-list-preview');
    if (fInp2) fInp2.value = '';
    if (pArea2) pArea2.innerHTML = '';"""
content = content.replace(old_new, new_new)

# Update saveAdminExercise to use FormData
old_save = """  try {
    const method = originalId ? 'PUT' : 'POST';
    const endpoint = originalId ? `/api/exercise-to-db/${originalId}` : '/api/exercise-to-db';
    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exerciseData),
      credentials: 'include'
    });"""

new_save = """  try {
    const finalFd = new FormData();
    finalFd.append('subject_id', exerciseData.subject_id);
    finalFd.append('form_id', exerciseData.form_id);
    finalFd.append('title', exerciseData.title);
    finalFd.append('difficulty', exerciseData.difficulty);
    finalFd.append('description', exerciseData.description);
    finalFd.append('submission_format', exerciseData.submission_format);
    finalFd.append('requirements', JSON.stringify(exerciseData.requirements));
    finalFd.append('grading_criteria', JSON.stringify(exerciseData.grading_criteria));
    if (!originalId) finalFd.append('id', exerciseData.id);

    const fileInput = document.getElementById('admin-field-files');
    if (fileInput && fileInput.files.length) {
      for (let i = 0; i < fileInput.files.length; i++) {
        finalFd.append('files', fileInput.files[i]);
      }
    }

    const method = originalId ? 'PUT' : 'POST';
    const endpoint = originalId ? `/api/exercise-to-db/${originalId}` : '/api/exercise-to-db';
    const res = await fetch(endpoint, {
      method,
      body: finalFd,
      credentials: 'include'
    });"""
content = content.replace(old_save, new_save)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
