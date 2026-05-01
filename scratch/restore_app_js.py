import os

def restore_app_js(file_path):
    with open(file_path, 'r', encoding='utf-8', errors='replace') as f:
        lines = f.readlines()
    
    # I need to find the start and end of the corrupted block
    # Corrupted block starts at 'function renderSidebarInfoCard'
    # and ends at 'function exportData'
    
    start_idx = -1
    end_idx = -1
    for i, line in enumerate(lines):
        if 'function renderSidebarInfoCard' in line:
            start_idx = i
        if 'function exportData' in line:
            end_idx = i
            break
    
    if start_idx != -1 and end_idx != -1:
        print(f"Found corrupted block from line {start_idx+1} to {end_idx+1}")
        
        new_block = """
function renderSidebarInfoCard(lecturer, subjectsObj) {
  const card = document.getElementById('sidebar-info-card');
  if (!card) return;
  const initChar = (lecturer.name || '?').charAt(0).toUpperCase();

  card.innerHTML = `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
      <div class="avatar">${initChar}</div>
      <div style="min-width:0;">
        <div class="name" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${lecturer.name || 'Giảng viên'}</div>
        <div class="id">${lecturer.lecturer_id || ''}</div>
      </div>
    </div>
    <div class="stats">
      <div class="stat-item">
        <span class="stat-value stat-count-subjects">—</span>
        <span class="stat-label">Môn quản lý</span>
      </div>
      <div class="stat-item">
        <span class="stat-value stat-count-exercises">—</span>
        <span class="stat-label">Bài tập</span>
      </div>
      <div class="stat-status">
        <span class="stat-dot"></span>
        <span class="stat-status-text">Đang hoạt động</span>
      </div>
    </div>
  `;

  fetch('/api/lecturer/stats', { credentials: 'include' })
    .then(r => r.json())
    .then(stats => {
      const s = card.querySelector('.stat-count-subjects');
      const e = card.querySelector('.stat-count-exercises');
      if (s) s.textContent = stats.SubjectCount  ?? 0;
      if (e) e.textContent = stats.ExerciseCount ?? 0;
    })
    .catch(() => {});
}

async function loadLecturerHistory() {
  const container = document.getElementById('lecturer-history-list');
  if (!container) return;

  container.innerHTML = `
    <div style="text-align:center;padding:40px;color:var(--text-muted);">
      <div style="font-size:28px;margin-bottom:8px;">⏳</div><div>Đang tải lịch sử...</div>
    </div>`;

  try {
    const res = await fetch('/api/lecturer/exercise-audit', { credentials: 'include' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:48px;color:var(--text-muted);background:var(--card-bg);border-radius:12px;border:1px solid var(--border-color);">
          <div style="font-size:40px;margin-bottom:12px;">📬</div>
          <div style="font-size:16px;font-weight:600;">Chưa có lịch sử thao tác</div>
          <div style="font-size:13px;margin-top:4px;">Các thao tác thêm/sửa/xóa bài tập sẽ xuất hiện tại đây</div>
        </div>`;
      return;
    }

    const actionCfg = {
      create: { label: 'Tạo mới', color: '#10b981', bg: '#f0fdf4', icon: '✨' },
      update: { label: 'Cập nhật', color: '#f59e0b', bg: '#fffbeb', icon: '📝' },
      delete: { label: 'Xóa',    color: '#ef4444', bg: '#fef2f2', icon: '🗑️' }
    };

    // Stats bar
    const creates = data.filter(h => h.Action === 'create').length;
    const updates = data.filter(h => h.Action === 'update').length;
    const deletes = data.filter(h => h.Action === 'delete').length;

    container.innerHTML = `
      <!-- Stats -->
      <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:20px;">
        <div style="background:linear-gradient(135deg,#10b981,#059669);border-radius:12px;padding:16px;color:white;text-align:center;">
          <div style="font-size:28px;font-weight:800;">${creates}</div>
          <div style="font-size:12px;opacity:0.85;margin-top:4px;">✨ Bài đã tạo</div>
        </div>
        <div style="background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:12px;padding:16px;color:white;text-align:center;">
          <div style="font-size:28px;font-weight:800;">${updates}</div>
          <div style="font-size:12px;opacity:0.85;margin-top:4px;">📝 Lần cập nhật</div>
        </div>
        <div style="background:linear-gradient(135deg,#ef4444,#dc2626);border-radius:12px;padding:16px;color:white;text-align:center;">
          <div style="font-size:28px;font-weight:800;">${deletes}</div>
          <div style="font-size:12px;opacity:0.85;margin-top:4px;">🗑️ Bài đã xóa</div>
        </div>
      </div>

      <!-- Table -->
      <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;overflow:hidden;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;">
              <th style="padding:13px 16px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap;">Hành động</th>
              <th style="padding:13px 16px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Tên bài tập</th>
              <th style="padding:13px 16px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Môn học</th>
              <th style="padding:13px 16px;text-align:left;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">Chi tiết</th>
              <th style="padding:13px 16px;text-align:right;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;white-space:nowrap;">Thời gian</th>
            </tr>
          </thead>
          <tbody id="history-tbody"></tbody>
        </table>
      </div>`;

    const tbody = document.getElementById('history-tbody');
    data.forEach((h, idx) => {
      const cfg = actionCfg[h.Action] || { label: h.Action, color: '#6366f1', bg: '#eef2ff', icon: '📋' };
      const timeStr = h.ActionTime ? new Date(h.ActionTime).toLocaleString('vi-VN') : '—';
      const subjectName = h.SubjectName || h.SubjectId || '—';
      const details = h.Details || '—';
      const tr = document.createElement('tr');
      tr.style.cssText = `border-bottom:1px solid var(--border-color);transition:background 0.15s;`;
      tr.onmouseenter = () => tr.style.background = 'var(--bg-color)';
      tr.onmouseleave = () => tr.style.background = '';
      tr.innerHTML = `
        <td style="padding:13px 16px;white-space:nowrap;">
          <span style="display:inline-flex;align-items:center;gap:5px;background:${cfg.bg};color:${cfg.color};padding:5px 11px;border-radius:20px;font-size:12px;font-weight:700;border:1px solid ${cfg.color}22;">
            ${cfg.icon} ${cfg.label}
          </span>
        </td>
        <td style="padding:13px 16px;font-weight:600;color:var(--text-main);font-size:13px;max-width:200px;">
          <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${h.ExerciseTitle || h.ExerciseId || ''}">${h.ExerciseTitle || h.ExerciseId || '—'}</div>
          ${h.ExerciseId ? `<div style="font-size:11px;color:var(--text-muted);margin-top:2px;">ID: ${h.ExerciseId}</div>` : ''}
        </td>
        <td style="padding:13px 16px;font-size:13px;color:var(--text-muted);">${subjectName}</td>
        <td style="padding:13px 16px;font-size:12px;color:var(--text-muted);max-width:220px;">
          <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${details}">${details}</div>
        </td>
        <td style="padding:13px 16px;text-align:right;font-size:12px;color:var(--text-muted);white-space:nowrap;">${timeStr}</td>
      `;
      tbody.appendChild(tr);
    });
  } catch (err) {
    if (container) container.innerHTML = `<div style="padding:20px;text-align:center;color:var(--danger);">❌ Lỗi tải lịch sử: ${err.message}</div>`;
  }
}

"""
        # Replace the entire block
        lines[start_idx:end_idx] = [new_block]
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.writelines(lines)
        print("Successfully restored app.js")
    else:
        print("Could not find start/end indices for restoration.")

restore_app_js(r"c:\Users\Admin\Downloads\PTUD\PTUD\public\app.js")
