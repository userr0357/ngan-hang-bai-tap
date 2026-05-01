import sys
import os

file_path = 'public/app.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Redesign showExercise function
old_show = """function showExercise(ex, f) {
  const modal = document.getElementById('exercise-view-modal');
  if (!modal) return;
  
  const content = modal.querySelector('.modal-content');
  if (!content) return;
  
  const reqCount = (ex.requirements || []).length;
  const critCount = (ex.grading_criteria || []).length;
  
  content.innerHTML = `
    <div class="modal-header">
      <h2>${ex.title}</h2>
      <button class="modal-close" onclick="closeExerciseView()">×</button>
    </div>
    <div style="padding: 24px; max-height: 80vh; overflow-y: auto;">
      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px;">
        <div>
          <p><strong>ID:</strong> ${ex.id}</p>
          <p><strong>Độ khó:</strong> <span class="badge ${ex.difficulty === 'Khó' ? 'hard' : (ex.difficulty === 'Trung bình' ? 'medium' : 'easy')}">${ex.difficulty}</span></p>
        </div>
        <div>
          <p><strong>Dạng:</strong> ${f.name} (${f.form_id})</p>
          <p><strong>Định dạng nộp:</strong> ${ex.submission_format || '(Không có)'}</p>
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="margin-bottom: 10px;">Mô tả</h3>
        <div style="background: #f8fafc; padding: 15px; border-radius: 8px; border: 1px solid #e2e8f0; line-height: 1.6;">
          ${ex.description || 'Chưa có mô tả'}
        </div>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="margin-bottom: 10px;">Yêu cầu (${reqCount})</h3>
        <ol style="padding-left: 20px;">
          ${(ex.requirements || []).map(r => `<li style="margin-bottom: 8px;">${r}</li>`).join('') || '<li>Chưa có yêu cầu</li>'}
        </ol>
      </div>
      
      <div style="margin-bottom: 20px;">
        <h3 style="margin-bottom: 10px;">Tiêu chí chấm (${critCount})</h3>
        <ul style="list-style: none;">
          ${(ex.grading_criteria || []).map(c => `
            <li style="margin-bottom: 8px; display: flex; justify-content: space-between; border-bottom: 1px solid #eee; padding-bottom: 4px;">
              <span>${c.name}</span>
              <strong style="color: #475569;">(${c.points} điểm)</strong>
            </li>
          `).join('') || '<li>Chưa có tiêu chí</li>'}
        </ul>
      </div>

      <div style="margin-bottom: 20px;">
        <h3 style="margin-bottom: 10px;">File đính kèm</h3>
        ${ex.file_dinh_kem ? `
          <div style="display: flex; flex-wrap: wrap; gap: 10px;">
            ${ex.file_dinh_kem.split(',').map(file => `
              <a href="${file}" target="_blank" style="padding: 8px 12px; background: #e0e7ff; color: #4338ca; border-radius: 6px; font-weight: 600; font-size: 13px; text-decoration: none; display: flex; align-items: center; gap: 6px;">
                📂 File đính kèm
              </a>
            `).join('')}
          </div>
        ` : '<p style="color: #94a3b8; font-style: italic;">(Không có)</p>'}
      </div>
    </div>
  `;
  
  modal.classList.add('show');
}"""

new_show = """function showExercise(ex, f) {
  const modal = document.getElementById('exercise-view-modal');
  if (!modal) return;
  
  const content = modal.querySelector('.modal-content');
  if (!content) return;
  
  const reqCount = (ex.requirements || []).length;
  const critCount = (ex.grading_criteria || []).length;
  const levelNames = { 1: 'Lắp ghép cú pháp', 2: 'Luồng rẽ nhánh', 3: 'Vòng lặp & Mảng', 4: 'Hàm & Cấu trúc', 5: 'Tư duy giải thuật' };
  const levelName = levelNames[ex.skill_level] || 'Lắp ghép cú pháp';
  
  content.innerHTML = `
    <div class="modal-header" style="background: linear-gradient(to right, #f8fafc, #ffffff); border-bottom: 1px solid #e2e8f0; padding: 20px 24px;">
      <div style="display:flex; align-items:center; gap:12px;">
        <div style="width:40px; height:40px; background:var(--primary); color:white; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:20px;">📝</div>
        <h2 style="margin:0; font-size:1.25rem; font-weight:700; color:#1e293b;">${ex.title}</h2>
      </div>
      <button class="modal-close" onclick="closeExerciseView()" style="font-size:24px; color:#94a3b8; hover:color:#1e293b;">&times;</button>
    </div>
    
    <div style="padding: 24px; max-height: 80vh; overflow-y: auto; background: white;">
      <!-- Metadata Grid -->
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
            <div class="ex-view-value">${f.name}</div>
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

      <!-- Description -->
      <div class="ex-section-title"><span>📖</span> Mô tả bài tập</div>
      <div style="background: #fdfdfd; padding: 16px; border: 1px dashed #cbd5e1; border-radius: 12px; line-height: 1.7; color: #334155; white-space: pre-line;">
        ${ex.description || 'Chưa có nội dung mô tả.'}
      </div>

      <!-- Requirements -->
      <div class="ex-section-title"><span>📋</span> Yêu cầu kỹ thuật (${reqCount})</div>
      <div>
        ${(ex.requirements || []).map((r, i) => `
          <div class="ex-requirement-item">
            <strong>Yêu cầu ${i+1}:</strong> ${r}
          </div>
        `).join('') || '<p style="color:#94a3b8; font-style:italic">Chưa có yêu cầu cụ thể.</p>'}
      </div>

      <!-- Grading Criteria -->
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

      <!-- Attachments -->
      <div class="ex-section-title"><span>📎</span> File đính kèm</div>
      ${ex.file_dinh_kem ? `
        <div style="display: flex; flex-wrap: wrap; gap: 12px; margin-top:8px;">
          ${ex.file_dinh_kem.split(',').map(file => {
            const fileName = file.split('/').pop();
            return `
              <a href="${file}" target="_blank" style="padding: 10px 16px; background: white; border: 1.5px solid #e2e8f0; color: #1e293b; border-radius: 10px; font-weight: 600; font-size: 13px; text-decoration: none; display: flex; align-items: center; gap: 10px; transition: all 0.2s;" onmouseover="this.style.borderColor='var(--primary)'; this.style.background='#f8fafc'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='white'">
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
      
      <div style="margin-top:32px; display:flex; justify-content:center; gap:16px;">
         <div style="font-size:12px; color:#94a3b8;">Giảng viên biên soạn: <strong>${ex.owner_name || 'Hệ thống'}</strong></div>
      </div>
    </div>
  `;
  
  modal.classList.add('show');
}"""

content = content.replace(old_show, new_show)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
