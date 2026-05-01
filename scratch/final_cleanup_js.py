import sys
import os
import re

file_app = 'public/app.js'
with open(file_app, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Capture the Premium function code (we want to keep this)
# It's at the top, inserted after "const state = { ... };"
# Wait, let's just define it again to be absolutely sure we have the right one.

PREMIUM_SHOW_EXERCISE = """
function showExercise(ex, f) {
  console.log('Opening Premium Modal for:', ex.title);
  const modal = document.getElementById('exercise-view-modal');
  if (!modal) {
    alert('Không tìm thấy khung hiển thị (Modal). Vui lòng F5.');
    return;
  }
  
  const contentArea = modal.querySelector('.modal-content');
  if (!contentArea) return;

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
      <div class="ex-view-grid" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px;">
        <div class="ex-view-card" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; display: flex; align-items: center; gap: 12px;">
          <div class="ex-view-card-icon" style="width: 36px; height: 36px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); font-size: 18px;">🆔</div>
          <div>
            <div class="ex-view-label" style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">Mã & ID</div>
            <div class="ex-view-value" style="font-size: 14px; font-weight: 600; color: #1e293b;">${ex.name || '---'} <span style="font-weight:400; color:#94a3b8">#${ex.id}</span></div>
          </div>
        </div>
        <div class="ex-view-card" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; display: flex; align-items: center; gap: 12px;">
          <div class="ex-view-card-icon" style="width: 36px; height: 36px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); font-size: 18px;">🎯</div>
          <div>
            <div class="ex-view-label" style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">Dạng Bài</div>
            <div class="ex-view-value" style="font-size: 14px; font-weight: 600; color: #1e293b;">${f.name || f.form_id || 'Chung'}</div>
          </div>
        </div>
        <div class="ex-view-card" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; display: flex; align-items: center; gap: 12px;">
          <div class="ex-view-card-icon" style="width: 36px; height: 36px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); font-size: 18px;">📊</div>
          <div>
            <div class="ex-view-label" style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">Độ khó & Cấp độ</div>
            <div class="ex-view-value" style="font-size: 14px; font-weight: 600; color: #1e293b;">
              <span class="badge ${ex.difficulty === 'Khó' ? 'hard' : (ex.difficulty === 'Trung bình' ? 'medium' : 'easy')}">${ex.difficulty}</span>
              <span style="font-size:12px; margin-left:4px; color:#475569">Lv.${ex.skill_level}</span>
            </div>
          </div>
        </div>
        <div class="ex-view-card" style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; display: flex; align-items: center; gap: 12px;">
          <div class="ex-view-card-icon" style="width: 36px; height: 36px; background: white; border-radius: 8px; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 4px rgba(0,0,0,0.05); font-size: 18px;">📥</div>
          <div>
            <div class="ex-view-label" style="font-size: 11px; font-weight: 600; color: #64748b; text-transform: uppercase;">Hình thức nộp</div>
            <div class="ex-view-value" style="font-size: 13px; font-weight: 600; color: #1e293b;">${ex.submission_format || '(Chưa đặt)'}</div>
          </div>
        </div>
      </div>

      <div class="ex-section-title" style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 24px 0 12px; display: flex; align-items: center; gap: 8px;"><span>📖</span> Mô tả bài tập</div>
      <div style="background: #fdfdfd; padding: 16px; border: 1px dashed #cbd5e1; border-radius: 12px; line-height: 1.7; color: #334155; white-space: pre-line;">
        ${ex.description || 'Chưa có nội dung mô tả.'}
      </div>

      <div class="ex-section-title" style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 24px 0 12px; display: flex; align-items: center; gap: 8px;"><span>📋</span> Yêu cầu kỹ thuật (${reqCount})</div>
      <div>
        ${(ex.requirements || []).map((r, i) => `
          <div class="ex-requirement-item" style="padding: 12px; background: white; border-left: 4px solid var(--primary); border-radius: 4px 8px 8px 4px; margin-bottom: 8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05); font-size: 14px;">
            <strong>Yêu cầu ${i+1}:</strong> ${r}
          </div>
        `).join('') || '<p style="color:#94a3b8; font-style:italic">Chưa có yêu cầu cụ thể.</p>'}
      </div>

      <div class="ex-section-title" style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 24px 0 12px; display: flex; align-items: center; gap: 8px;"><span>⚖️</span> Tiêu chí chấm điểm (${critCount})</div>
      <div style="background:#f8fafc; border-radius:12px; padding:8px 16px;">
        <table class="ex-grading-table" style="width: 100%; border-collapse: collapse; margin-top: 8px;">
          ${(ex.grading_criteria || []).map(c => `
            <tr class="ex-grading-row" style="border-bottom: 1px solid #f1f5f9;">
              <td class="ex-grading-cell" style="padding: 12px 8px; font-size: 14px; font-weight:500; color:#1e293b;">${c.name}</td>
              <td class="ex-grading-cell" style="padding: 12px 8px; font-size: 14px; text-align:right;">
                <span class="ex-points-badge" style="padding: 4px 8px; background: #e0e7ff; color: #4338ca; border-radius: 6px; font-weight: 700; font-size: 12px;">${c.points} điểm</span>
              </td>
            </tr>
          `).join('') || '<tr><td colspan="2" class="ex-grading-cell" style="color:#94a3b8; text-align:center;">Chưa có tiêu chí chấm điểm.</td></tr>'}
        </table>
      </div>

      <div class="ex-section-title" style="font-size: 16px; font-weight: 700; color: #1e293b; margin: 24px 0 12px; display: flex; align-items: center; gap: 8px;"><span>📎</span> File đính kèm</div>
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
  
  modal.style.display = 'flex';
  setTimeout(() => { modal.style.opacity = '1'; }, 10);
}

function closeExerciseView() {
  const modal = document.getElementById('exercise-view-modal');
  if (modal) {
    modal.style.opacity = '0';
    setTimeout(() => { modal.style.display = 'none'; }, 300);
  }
}
"""

# 2. Remove ALL occurrences of function showExercise and closeExerciseView from the file
content = re.sub(r"function showExercise.*?\}\n\nfunction closeExerciseView.*?\}", "", content, flags=re.DOTALL)
# One more pass in case they are separated
content = re.sub(r"function showExercise.*?\}", "", content, flags=re.DOTALL)
content = re.sub(r"function closeExerciseView.*?\}", "", content, flags=re.DOTALL)

# 3. Re-insert the Premium version at the very top (after state)
content = re.sub(r"const state = \{.*?\};", lambda m: m.group(0) + PREMIUM_SHOW_EXERCISE, content, flags=re.DOTALL)

with open(file_app, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
