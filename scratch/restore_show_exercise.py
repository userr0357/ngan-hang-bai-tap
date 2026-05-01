import sys
import os

file_path = 'public/app.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# New Premium showExercise function
new_show_function = """
function showExercise(ex, f) {
  const modal = document.getElementById('exercise-view-modal');
  if (!modal) {
    // Create modal if it doesn't exist
    const m = document.createElement('div');
    m.id = 'exercise-view-modal';
    m.className = 'exercise-modal-detail';
    m.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:100000;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.3s;';
    m.innerHTML = '<div class="exercise-modal-backdrop" onclick="closeExerciseView()"></div><div class="modal-content" style="background:white; width:700px; max-width:95vw; border-radius:16px; overflow:hidden; box-shadow:0 25px 50px -12px rgba(0,0,0,0.25);"></div>';
    document.body.appendChild(m);
  }
  
  const modalObj = document.getElementById('exercise-view-modal');
  const contentArea = modalObj.querySelector('.modal-content');
  
  const reqCount = (ex.requirements || []).length;
  const critCount = (ex.grading_criteria || []).length;
  const levelNames = { 1: 'Lắp ghép cú pháp', 2: 'Luồng rẽ nhánh', 3: 'Vòng lặp & Mảng', 4: 'Hàm & Cấu trúc', 5: 'Tư duy giải thuật' };
  const levelName = levelNames[ex.skill_level] || 'Lắp ghép cú pháp';
  
  contentArea.innerHTML = `
    <div class="modal-header" style="background: linear-gradient(to right, #f8fafc, #ffffff); border-bottom: 1px solid #e2e8f0; padding: 20px 24px; display:flex; justify-content:space-between; align-items:center;">
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="width:40px; height:40px; background:var(--primary); color:white; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:20px;">📝</div>
        <h2 style="margin:0; font-size:1.25rem; font-weight:700; color:#1e293b;">${ex.title}</h2>
      </div>
      <button onclick="closeExerciseView()" style="background:none; border:none; font-size:28px; color:#94a3b8; cursor:pointer; line-height:1;">&times;</button>
    </div>
    
    <div style="padding: 24px; max-height: 75vh; overflow-y: auto; background: white;">
      <div class="ex-view-grid">
        <div class="ex-view-card">
          <div class="ex-view-card-icon">🆔</div>
          <div>
            <div class="ex-view-label">Mã & ID</div>
            <div class="ex-view-value">${ex.name || '---'} <span style="font-weight:400; color:#94a3b8">#${ex.id}</span></div>
          </div>
        </div>
        <div class="ex-view-card">
          <div class="ex-view-card-icon">🎯</div>
          <div>
            <div class="ex-view-label">Dạng Bài</div>
            <div class="ex-view-value">${f.name || f.form_id || 'Chung'}</div>
          </div>
        </div>
        <div class="ex-view-card">
          <div class="ex-view-card-icon">📊</div>
          <div>
            <div class="ex-view-label">Độ khó & Cấp độ</div>
            <div class="ex-view-value">
              <span class="badge ${ex.difficulty === 'Khó' ? 'hard' : (ex.difficulty === 'Trung bình' ? 'medium' : 'easy')}">${ex.difficulty}</span>
              <span style="font-size:12px; margin-left:4px; color:#475569">Lv.${ex.skill_level}</span>
            </div>
          </div>
        </div>
        <div class="ex-view-card">
          <div class="ex-view-card-icon">📥</div>
          <div>
            <div class="ex-view-label">Hình thức nộp</div>
            <div class="ex-view-value" style="font-size:13px">${ex.submission_format || '(Chưa đặt)'}</div>
          </div>
        </div>
      </div>

      <div class="ex-section-title"><span>📖</span> Mô tả bài tập</div>
      <div style="background: #fdfdfd; padding: 16px; border: 1px dashed #cbd5e1; border-radius: 12px; line-height: 1.7; color: #334155; white-space: pre-line;">
        ${ex.description || 'Chưa có nội dung mô tả.'}
      </div>

      <div class="ex-section-title"><span>📋</span> Yêu cầu kỹ thuật (${reqCount})</div>
      <div>
        ${(ex.requirements || []).map((r, i) => `
          <div class="ex-requirement-item">
            <strong>Yêu cầu ${i+1}:</strong> ${r}
          </div>
        `).join('') || '<p style="color:#94a3b8; font-style:italic">Chưa có yêu cầu cụ thể.</p>'}
      </div>

      <div class="ex-section-title"><span>⚖️</span> Tiêu chí chấm điểm (${critCount})</div>
      <div style="background:#f8fafc; border-radius:12px; padding:8px 16px;">
        <table class="ex-grading-table">
          ${(ex.grading_criteria || []).map(c => `
            <tr class="ex-grading-row">
              <td class="ex-grading-cell" style="font-weight:500; color:#1e293b;">${c.name}</td>
              <td class="ex-grading-cell" style="text-align:right;">
                <span class="ex-points-badge">${c.points} điểm</span>
              </td>
            </tr>
          `).join('') || '<tr><td colspan="2" class="ex-grading-cell" style="color:#94a3b8; text-align:center;">Chưa có tiêu chí chấm điểm.</td></tr>'}
        </table>
      </div>

      <div class="ex-section-title"><span>📎</span> File đính kèm</div>
      ${ex.file_dinh_kem ? `
        <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top:8px;">
          ${ex.file_dinh_kem.split(',').map(file => {
            const fileName = file.split('/').pop();
            return `
              <a href="${file}" target="_blank" style="padding: 10px 16px; background: white; border: 1.5px solid #e2e8f0; color: #1e293b; border-radius: 10px; font-weight: 600; font-size: 13px; text-decoration: none; display: flex; align-items: center; gap: 10px; transition: all 0.2s;">
                <span style="font-size:20px;">📄</span>
                <div style="line-height:1.2">
                  <div style="font-size:11px; color:#64748b; font-weight:400">Tài liệu</div>
                  ${fileName.length > 20 ? fileName.substring(0,17)+'...' : fileName}
                </div>
              </a>
            `;
          }).join('')}
        </div>
      ` : `
        <div style="padding:20px; border: 2px dashed #f1f5f9; border-radius:12px; text-align:center; color:#94a3b8; font-size:14px;">
          Không có file đính kèm.
        </div>
      `}
      
      <div style="margin-top:32px; display:flex; justify-content:center; gap:16px; border-top:1px solid #f1f5f9; padding-top:16px;">
         <div style="font-size:12px; color:#94a3b8;">Giảng viên biên soạn: <strong>${ex.owner_name || 'Hệ thống'}</strong></div>
      </div>
    </div>
  `;
  
  modalObj.style.opacity = '1';
  modalObj.style.pointerEvents = 'auto';
}

function closeExerciseView() {
  const modal = document.getElementById('exercise-view-modal');
  if (modal) {
    modal.style.opacity = '0';
    modal.style.pointerEvents = 'none';
  }
}
"""

# Append the function to the end to ensure it exists and is accessible
if "function showExercise" not in content:
    content += "\n\n" + new_show_function

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
