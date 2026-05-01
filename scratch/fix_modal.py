import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('public/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

OLD_SHOW = "function showExercise(ex, f) {\n  console.log('Opening Premium Modal for:', ex.title);"

# Find end of showExercise function
idx = js.find(OLD_SHOW)
if idx == -1:
    print('❌ showExercise not found')
    exit()

# Find the closing bracket
depth = 0; in_str = False; i = idx
while i < len(js):
    c = js[i]
    if c == '{' and not in_str: depth += 1
    elif c == '}' and not in_str:
        depth -= 1
        if depth == 0: func_end = i + 1; break
    elif c in ('"', "'", '`') and not in_str: in_str = c
    elif in_str and c == in_str: in_str = False
    i += 1

old_show_func = js[idx:func_end]

NEW_SHOW_FUNC = r"""function showExercise(ex, f) {
  const modal = document.getElementById('exercise-view-modal');
  if (!modal) return;
  const contentArea = modal.querySelector('.modal-content');
  if (!contentArea) return;

  const levelNames = {1:'Lắp ghép cú pháp',2:'Luồng rẽ nhánh',3:'Vòng lặp & Mảng',4:'Hàm & Cấu trúc',5:'Tư duy giải thuật'};
  const levelName = levelNames[ex.skill_level] || '—';
  const levelClass = ex.skill_level ? 'level-' + ex.skill_level : '';
  const reqCount  = (ex.requirements || []).length;
  const critCount = (ex.grading_criteria || []).length;
  const totalPts  = Array.isArray(ex.grading_criteria)
    ? ex.grading_criteria.reduce((s,g) => s + (g && typeof g.points === 'number' ? g.points : 0), 0) : 0;
  const diffLabel = normalizeDifficultyLabel(ex.difficulty) || ex.difficulty || '';
  const diffClass = diffLabel === 'Khó' ? 'hard' : (diffLabel === 'Trung bình' ? 'medium' : 'easy');

  // Format dates nicely
  const fmtDate = (d) => {
    if (!d) return null;
    try { return new Date(d).toLocaleDateString('vi-VN', {day:'2-digit',month:'2-digit',year:'numeric'}); } catch(e){ return d; }
  };
  const updatedDate = fmtDate(ex.updated_at || ex.UpdatedAt || ex.created_at || ex.CreatedAt);

  // Subject info from state
  const subjectName = (state.currentSubject && state.currentSubject.subject_name) || '';
  const subjectId   = (state.currentSubject && state.currentSubject.subject_id)   || '';

  contentArea.innerHTML = `
    <!-- Header -->
    <div style="padding:20px 24px; border-bottom:1px solid var(--border-color); display:flex; align-items:flex-start; gap:14px; background:var(--card-bg); flex-shrink:0;">
      <div style="width:44px;height:44px;background:var(--primary);color:white;border-radius:12px;display:flex;align-items:center;justify-content:center;font-size:22px;flex-shrink:0;">📝</div>
      <div style="flex:1;min-width:0;">
        <h2 style="margin:0 0 6px;font-size:19px;font-weight:800;color:var(--text-main);line-height:1.3;">${ex.title}</h2>
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
          <span class="badge ${diffClass}">${diffLabel}</span>
          ${ex.skill_level ? `<span class="ex-level-pill ${levelClass}" style="padding:3px 10px;border-radius:20px;font-size:12px;font-weight:700;">L${ex.skill_level} · ${levelName}</span>` : ''}
          ${totalPts > 0 ? `<span style="font-size:13px;font-weight:700;color:var(--primary)">🏅 Tổng: ${totalPts} điểm</span>` : ''}
        </div>
      </div>
      <button onclick="closeExerciseView()" style="background:var(--bg-color);border:1px solid var(--border-color);width:36px;height:36px;border-radius:50%;font-size:20px;color:var(--text-muted);cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;transition:all 0.2s;" onmouseover="this.style.background='#fee2e2';this.style.color='#dc2626'" onmouseout="this.style.background='var(--bg-color)';this.style.color='var(--text-muted)'">×</button>
    </div>

    <!-- Scrollable body -->
    <div style="padding:20px 24px;overflow-y:auto;flex:1;background:var(--bg-color);">

      <!-- Info cards row 1: 4 cols -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:12px;">
        <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:10px;padding:12px;">
          <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Mã bài</div>
          <div style="font-size:14px;font-weight:700;color:var(--text-main);font-family:monospace;">${ex.name || '—'}</div>
        </div>
        <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:10px;padding:12px;">
          <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Môn học</div>
          <div style="font-size:13px;font-weight:700;color:var(--text-main);">${subjectName || '—'}</div>
          ${subjectId ? `<div style="font-size:11px;color:var(--text-muted);font-family:monospace;">${subjectId}</div>` : ''}
        </div>
        <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:10px;padding:12px;">
          <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Dạng bài</div>
          <div style="font-size:13px;font-weight:700;color:var(--text-main);">${f.name || f.form_id || '—'}</div>
        </div>
        <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:10px;padding:12px;">
          <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Giảng viên</div>
          <div style="font-size:13px;font-weight:700;color:var(--text-main);">${ex.owner_name || 'Hệ thống'}</div>
          ${ex.owner ? `<div style="font-size:11px;color:var(--text-muted);font-family:monospace;">${ex.owner}</div>` : ''}
        </div>
      </div>

      <!-- Info cards row 2: 4 cols -->
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:22px;">
        <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:10px;padding:12px;">
          <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Hình thức nộp</div>
          <div style="font-size:13px;font-weight:600;color:var(--text-main);">${ex.submission_format || '—'}</div>
        </div>
        <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:10px;padding:12px;">
          <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Yêu cầu</div>
          <div style="font-size:20px;font-weight:800;color:var(--primary);">${reqCount}</div>
        </div>
        <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:10px;padding:12px;">
          <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Tiêu chí chấm</div>
          <div style="font-size:20px;font-weight:800;color:var(--primary);">${critCount}</div>
        </div>
        <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:10px;padding:12px;">
          <div style="font-size:10px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:4px;">Cập nhật</div>
          <div style="font-size:12px;font-weight:600;color:var(--text-main);">${updatedDate || '—'}</div>
        </div>
      </div>

      <!-- Description -->
      <div style="font-size:14px;font-weight:700;color:var(--text-main);margin-bottom:10px;display:flex;align-items:center;gap:6px;">
        <span style="width:3px;height:16px;background:var(--primary);border-radius:2px;display:inline-block;"></span> Mô tả bài tập
      </div>
      <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:10px;padding:16px;line-height:1.75;color:var(--text-main);font-size:14px;white-space:pre-line;margin-bottom:20px;">
        ${ex.description || '<span style="color:var(--text-muted);font-style:italic;">Chưa có mô tả.</span>'}
      </div>

      <!-- Requirements -->
      <div style="font-size:14px;font-weight:700;color:var(--text-main);margin-bottom:10px;display:flex;align-items:center;gap:6px;">
        <span style="width:3px;height:16px;background:#10b981;border-radius:2px;display:inline-block;"></span> Yêu cầu kỹ thuật (${reqCount})
      </div>
      <div style="margin-bottom:20px;">
        ${(ex.requirements||[]).map((r,i) => `
          <div style="padding:12px 14px;background:var(--card-bg);border:1px solid var(--border-color);border-left:4px solid var(--primary);border-radius:4px 10px 10px 4px;margin-bottom:8px;font-size:14px;color:var(--text-main);line-height:1.6;">
            <span style="font-weight:700;color:var(--primary);">${i+1}.</span> ${r}
          </div>
        `).join('') || `<div style="padding:16px;text-align:center;color:var(--text-muted);font-style:italic;background:var(--card-bg);border-radius:10px;">Chưa có yêu cầu.</div>`}
      </div>

      <!-- Grading criteria -->
      <div style="font-size:14px;font-weight:700;color:var(--text-main);margin-bottom:10px;display:flex;align-items:center;justify-content:space-between;">
        <span style="display:flex;align-items:center;gap:6px;"><span style="width:3px;height:16px;background:#f59e0b;border-radius:2px;display:inline-block;"></span> Tiêu chí chấm điểm (${critCount})</span>
        ${totalPts > 0 ? `<span style="font-size:13px;font-weight:800;color:var(--primary);background:var(--primary-light);padding:4px 12px;border-radius:20px;">Tổng: ${totalPts} điểm</span>` : ''}
      </div>
      <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:10px;overflow:hidden;margin-bottom:20px;">
        ${(ex.grading_criteria||[]).length > 0
          ? (ex.grading_criteria||[]).map((c,i) => `
            <div style="display:flex;align-items:center;justify-content:space-between;padding:12px 16px;border-bottom:1px solid var(--border-color);${i%2===0?'background:var(--card-bg)':'background:var(--bg-color)'}">
              <div style="font-size:14px;color:var(--text-main);flex:1;">${c.name || '—'}</div>
              <span style="padding:4px 10px;background:var(--primary-light);color:var(--primary);border-radius:6px;font-weight:700;font-size:13px;white-space:nowrap;margin-left:12px;">${c.points} điểm</span>
            </div>
          `).join('')
          : `<div style="padding:20px;text-align:center;color:var(--text-muted);font-style:italic;">Chưa có tiêu chí chấm điểm.</div>`
        }
      </div>

      <!-- Attachments -->
      ${ex.file_dinh_kem ? `
        <div style="font-size:14px;font-weight:700;color:var(--text-main);margin-bottom:10px;display:flex;align-items:center;gap:6px;">
          <span style="width:3px;height:16px;background:#8b5cf6;border-radius:2px;display:inline-block;"></span> Tài liệu đính kèm
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:10px;margin-bottom:16px;">
          ${ex.file_dinh_kem.split(',').map(file => {
            const fn = file.trim().split('/').pop();
            return `<a href="${file.trim()}" target="_blank" style="display:flex;align-items:center;gap:10px;padding:10px 14px;background:var(--card-bg);border:1.5px solid var(--border-color);border-radius:10px;text-decoration:none;color:var(--text-main);font-size:13px;font-weight:600;transition:all 0.2s;" onmouseover="this.style.borderColor='var(--primary)'" onmouseout="this.style.borderColor='var(--border-color)'">
              <span style="font-size:20px;">📎</span>${fn.length>24?fn.substring(0,21)+'…':fn}
            </a>`;
          }).join('')}
        </div>
      ` : ''}
    </div>
  `;

  modal.style.display = 'flex';
  modal.style.alignItems = 'flex-start';
  modal.style.justifyContent = 'center';
  setTimeout(() => modal.classList.add('show'), 10);
  document.body.style.overflow = 'hidden';
}"""

js = js.replace(old_show_func, NEW_SHOW_FUNC)

with open('public/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('✅ showExercise modal rewritten')
