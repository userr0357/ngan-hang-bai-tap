import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('public/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# ── Fix: openFeedbackModal – professional redesign
OLD_FB = '''// FEEDBACK LOGIC
// ==========================================
function openFeedbackModal(ex) {
  let modal = document.getElementById('feedback-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'feedback-modal';
    modal.className = 'exercise-modal-detail';
    modal.style = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.3s;';
    modal.innerHTML = `
      <div class="exercise-modal-backdrop" onclick="closeFeedbackModal()"></div>
      <div class="exercise-modal-box" style="width:600px; max-width:90vw; padding:24px; text-align:left;">
        <h3 style="margin-top:0;">Góp ý bài tập</h3>
        <div style="font-weight:600; color:var(--primary); margin-bottom:12px;" id="fb-ex-title"></div>
        <textarea id="fb-content" rows="6" style="width:100%; border:1px solid var(--border-color); border-radius:8px; padding:12px; margin-bottom:16px; font-size:15px; resize:vertical;" placeholder="Nhập nội dung góp ý của bạn..."></textarea>
        <div style="display:flex; justify-content:flex-end; gap:12px;">
          <button class="btn btn-secondary" onclick="closeFeedbackModal()">Hủy</button>
          <button class="btn btn-primary" id="btn-submit-fb">Gửi góp ý</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  }
  
  document.getElementById('fb-ex-title').textContent = ex.title || ex.id;
  document.getElementById('fb-content').value = '';
  document.getElementById('btn-submit-fb').onclick = async () => {
    const content = document.getElementById('fb-content').value.trim();
    if (!content) return alert('Vui lòng nhập nội dung góp ý!');
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST', credentials: 'include', headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ exercise_id: ex.id, exercise_title: ex.title, target_lecturer_id: ex.owner, content })
      });
      if (res.ok) {
        alert('Đã gửi góp ý thành công!');
        closeFeedbackModal();
      } else {
        alert('Lỗi: ' + (await res.json()).error);
      }
    } catch(err) { alert('Lỗi hệ thống'); }
  };
  
  modal.style.opacity = '1';
  modal.style.pointerEvents = 'auto';
}

function closeFeedbackModal() {
  const modal = document.getElementById('feedback-modal');
  if (modal) { modal.style.opacity = '0'; modal.style.pointerEvents = 'none'; }
}'''

NEW_FB = '''// FEEDBACK LOGIC
// ==========================================
function openFeedbackModal(ex) {
  let modal = document.getElementById('feedback-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'feedback-modal';
    modal.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:99999;display:flex;align-items:center;justify-content:center;opacity:0;pointer-events:none;transition:opacity 0.25s;background:rgba(0,0,0,0.45);backdrop-filter:blur(4px);';
    document.body.appendChild(modal);
  }

  const catOptions = [
    {v:'content',   l:'📝 Nội dung bài tập'},
    {v:'requirement',l:'📋 Yêu cầu kỹ thuật'},
    {v:'criteria',  l:'📊 Tiêu chí chấm điểm'},
    {v:'difficulty',l:'⚖️ Độ khó chưa phù hợp'},
    {v:'format',    l:'📎 Hình thức nộp bài'},
    {v:'other',     l:'💬 Khác'},
  ].map(o => `<option value="${o.v}">${o.l}</option>`).join('');

  const diffColor = (ex.difficulty === 'Khó') ? '#ef4444' : (ex.difficulty === 'Trung bình' ? '#f59e0b' : '#10b981');

  modal.innerHTML = `
    <div onclick="closeFeedbackModal()" style="position:absolute;inset:0;"></div>
    <div style="position:relative;width:520px;max-width:95vw;background:var(--card-bg);border-radius:16px;overflow:hidden;box-shadow:0 24px 80px rgba(0,0,0,0.25);border:1px solid var(--border-color);">
      <!-- Header -->
      <div style="padding:18px 22px;border-bottom:1px solid var(--border-color);display:flex;align-items:flex-start;gap:12px;">
        <div style="width:40px;height:40px;background:var(--primary);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0;">💬</div>
        <div style="flex:1;min-width:0;">
          <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;margin-bottom:3px;">Góp ý bài tập</div>
          <div id="fb-ex-title" style="font-size:15px;font-weight:700;color:var(--text-main);line-height:1.3;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;"></div>
          <div style="display:flex;align-items:center;gap:8px;margin-top:4px;">
            <span style="font-size:11px;padding:2px 8px;border-radius:20px;font-weight:700;background:${diffColor}22;color:${diffColor};">${ex.difficulty||'—'}</span>
            ${ex.owner_name ? `<span style="font-size:12px;color:var(--text-muted);">👤 ${ex.owner_name}</span>` : ''}
          </div>
        </div>
        <button onclick="closeFeedbackModal()" style="background:var(--bg-color);border:1px solid var(--border-color);width:32px;height:32px;border-radius:50%;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-muted);flex-shrink:0;">×</button>
      </div>
      <!-- Body -->
      <div style="padding:18px 22px;">
        <div style="margin-bottom:14px;">
          <label style="font-size:12px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;">Loại góp ý</label>
          <select id="fb-category" style="width:100%;padding:10px 12px;border:1.5px solid var(--border-color);border-radius:8px;font-size:14px;background:var(--bg-color);color:var(--text-main);outline:none;font-family:inherit;">${catOptions}</select>
        </div>
        <div style="margin-bottom:6px;">
          <label style="font-size:12px;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;">Nội dung góp ý <span style="color:var(--danger);">*</span></label>
          <textarea id="fb-content" rows="5" maxlength="1000" oninput="document.getElementById('fb-char').textContent=this.value.length"
            style="width:100%;padding:11px 13px;border:1.5px solid var(--border-color);border-radius:8px;font-size:14px;font-family:inherit;resize:vertical;background:var(--bg-color);color:var(--text-main);outline:none;box-sizing:border-box;line-height:1.6;transition:border-color 0.2s;"
            onfocus="this.style.borderColor='var(--primary)'" onblur="this.style.borderColor='var(--border-color)'"
            placeholder="Mô tả chi tiết góp ý của bạn về bài tập này..."></textarea>
          <div style="text-align:right;font-size:11px;color:var(--text-muted);margin-top:3px;"><span id="fb-char">0</span>/1000</div>
        </div>
        <div id="fb-msg" style="display:none;padding:10px 13px;border-radius:8px;font-size:13px;font-weight:500;margin-bottom:12px;"></div>
      </div>
      <!-- Footer -->
      <div style="padding:14px 22px;border-top:1px solid var(--border-color);display:flex;justify-content:flex-end;gap:10px;background:var(--bg-color);">
        <button onclick="closeFeedbackModal()" style="padding:9px 20px;border:1.5px solid var(--border-color);background:var(--card-bg);color:var(--text-muted);border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;font-family:inherit;">Hủy</button>
        <button id="btn-submit-fb" style="padding:9px 22px;background:var(--primary);color:white;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.2s;">✉️ Gửi góp ý</button>
      </div>
    </div>`;

  modal.querySelector('#btn-submit-fb').onclick = async () => {
    const content  = modal.querySelector('#fb-content').value.trim();
    const category = modal.querySelector('#fb-category').value;
    const msgEl    = modal.querySelector('#fb-msg');
    const btn      = modal.querySelector('#btn-submit-fb');
    if (!content) {
      msgEl.style.cssText = 'display:block;padding:10px 13px;border-radius:8px;font-size:13px;font-weight:500;margin-bottom:12px;background:var(--danger-light);color:var(--danger);';
      msgEl.textContent = '⚠️ Vui lòng nhập nội dung góp ý!'; return;
    }
    btn.textContent = '⏳ Đang gửi...'; btn.disabled = true;
    try {
      const res = await fetch('/api/feedback', {
        method: 'POST', credentials: 'include', headers: {'Content-Type':'application/json'},
        body: JSON.stringify({ exercise_id: ex.id, exercise_title: ex.title, target_lecturer_id: ex.owner, category, content })
      });
      if (res.ok) {
        msgEl.style.cssText = 'display:block;padding:10px 13px;border-radius:8px;font-size:13px;font-weight:600;margin-bottom:12px;background:#dcfce7;color:#15803d;';
        msgEl.textContent = '✅ Đã gửi góp ý thành công! Cảm ơn bạn.';
        modal.querySelector('#fb-content').value = '';
        modal.querySelector('#fb-char').textContent = '0';
        setTimeout(closeFeedbackModal, 1800);
      } else {
        const err = await res.json().catch(() => ({}));
        msgEl.style.cssText = 'display:block;padding:10px 13px;border-radius:8px;font-size:13px;font-weight:500;margin-bottom:12px;background:var(--danger-light);color:var(--danger);';
        msgEl.textContent = '❌ Lỗi: ' + (err.error || 'Không gửi được');
      }
    } catch(err) {
      msgEl.style.cssText = 'display:block;padding:10px 13px;border-radius:8px;font-size:13px;margin-bottom:12px;background:var(--danger-light);color:var(--danger);';
      msgEl.textContent = '❌ Lỗi kết nối hệ thống';
    } finally {
      btn.textContent = '✉️ Gửi góp ý'; btn.disabled = false;
    }
  };

  modal.querySelector('#fb-ex-title').textContent = ex.title || ex.id;
  modal.style.opacity = '1';
  modal.style.pointerEvents = 'auto';
  document.body.style.overflow = 'hidden';
  setTimeout(() => modal.querySelector('textarea')?.focus(), 100);
}

function closeFeedbackModal() {
  const modal = document.getElementById('feedback-modal');
  if (modal) { modal.style.opacity = '0'; modal.style.pointerEvents = 'none'; document.body.style.overflow = ''; }
}'''

if OLD_FB in js:
    js = js.replace(OLD_FB, NEW_FB)
    print('✅ openFeedbackModal redesigned')
else:
    print('❌ OLD_FB not found — trying partial match')
    if 'function openFeedbackModal' in js:
        print('  function exists but text differs')

# ── Fix: loadFeedbacks – professional cards with stats + filter
OLD_LF_START = 'async function loadFeedbacks() {\n  const container = document.getElementById(\'feedback-list\');\n  container.innerHTML = \'<p>Đang tải...</p>\';\n  try {\n    const res = await fetch(\'/api/feedback/me\', { credentials: \'include\' });\n    if (!res.ok) {\n      const errData = await res.json().catch(() => ({}));\n      throw new Error(errData.error || \'Server error \' + res.status);\n    }\n    const data = await res.json();\n    if (!Array.isArray(data) || data.length === 0) {\n      container.innerHTML = \'<div style="padding:20px; text-align:center; color:var(--text-light); background:var(--surface-bg); border-radius:8px;">Chưa có góp ý nào.</div>\';\n      return;\n    }\n    container.innerHTML = \'\';\n    data.forEach(f => {\n      const card = document.createElement(\'div\');\n      card.style = \'background:var(--card-bg); border:1px solid var(--border-color); border-radius:8px; padding:16px; margin-bottom:12px; box-shadow:var(--shadow-sm);\';\n      const timeStr = new Date(f.timestamp).toLocaleString(\'vi-VN\');\n      card.innerHTML = `\n        <div style="display:flex; justify-content:space-between; margin-bottom:8px;">\n          <div style="font-weight:600; color:var(--primary);"><span style="font-size:14px;">📝</span> Bài: ${f.exercise_title || f.exercise_id}</div>\n          <div style="font-size:12px; color:var(--text-light);">${timeStr}</div>\n        </div>\n        <div style="font-size:14px; color:var(--text-main); margin-bottom:8px;">${f.content}</div>\n        <div style="font-size:13px; color:#64748b; font-style:italic;">Người góp ý: ${f.user} (${f.user_id})</div>\n      `;\n      container.appendChild(card);\n    });\n  } catch (err) {\n    container.innerHTML = \'<p style="color:var(--danger)">Lỗi tải dữ liệu: \' + err.message + \'</p>\';\n  }\n}'

NEW_LF = '''async function loadFeedbacks() {
  const container = document.getElementById('feedback-list');
  if (!container) return;
  container.innerHTML = '<div style="text-align:center;padding:32px;color:var(--text-muted);">⏳ Đang tải góp ý...</div>';
  try {
    const res = await fetch('/api/feedback/me', { credentials: 'include' });
    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || 'Server error ' + res.status);
    }
    const data = await res.json();

    // Stats header
    const total   = Array.isArray(data) ? data.length : 0;
    const catMap  = { content:'📝 Nội dung', requirement:'📋 Yêu cầu', criteria:'📊 Tiêu chí', difficulty:'⚖️ Độ khó', format:'📎 Định dạng', other:'💬 Khác' };
    const catColors = { content:'#6366f1', requirement:'#10b981', criteria:'#f59e0b', difficulty:'#ef4444', format:'#0891b2', other:'#8b5cf6' };

    const statsHtml = `
      <div style="display:flex;gap:10px;margin-bottom:20px;flex-wrap:wrap;">
        <div style="flex:1;min-width:110px;background:var(--card-bg);border:1px solid var(--border-color);border-radius:10px;padding:14px;text-align:center;">
          <div style="font-size:24px;font-weight:800;color:var(--primary);">${total}</div>
          <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-top:2px;">Tổng góp ý</div>
        </div>
        <div style="flex:1;min-width:110px;background:var(--card-bg);border:1px solid var(--border-color);border-radius:10px;padding:14px;text-align:center;">
          <div style="font-size:24px;font-weight:800;color:#10b981;">${data.filter ? data.filter(f=>!f.read).length : 0}</div>
          <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-top:2px;">Chưa đọc</div>
        </div>
        <div style="flex:1;min-width:110px;background:var(--card-bg);border:1px solid var(--border-color);border-radius:10px;padding:14px;text-align:center;">
          <div style="font-size:24px;font-weight:800;color:#f59e0b;">${[...new Set((data||[]).map(f=>f.exercise_id))].length}</div>
          <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-top:2px;">Bài tập</div>
        </div>
      </div>`;

    if (!Array.isArray(data) || data.length === 0) {
      container.innerHTML = statsHtml + '<div style="padding:48px;text-align:center;background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;"><div style="font-size:40px;margin-bottom:12px;">💬</div><div style="font-size:15px;font-weight:600;color:var(--text-main);">Chưa có góp ý nào</div><div style="font-size:13px;color:var(--text-muted);margin-top:6px;">Sinh viên và đồng nghiệp chưa gửi góp ý cho bài tập của bạn</div></div>';
      return;
    }

    let listHtml = '';
    data.forEach(f => {
      const timeStr = new Date(f.timestamp || f.created_at).toLocaleString('vi-VN');
      const cat  = f.category || 'other';
      const catLabel = catMap[cat] || '💬 Khác';
      const catColor = catColors[cat] || '#8b5cf6';
      const initials = (f.user || f.user_id || '?').substring(0,2).toUpperCase();
      listHtml += `
        <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;padding:16px;margin-bottom:12px;border-left:4px solid ${catColor};transition:box-shadow 0.2s;" onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'" onmouseout="this.style.boxShadow='none'">
          <div style="display:flex;align-items:flex-start;gap:12px;">
            <div style="width:36px;height:36px;border-radius:50%;background:${catColor}22;color:${catColor};font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${initials}</div>
            <div style="flex:1;min-width:0;">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:8px;flex-wrap:wrap;">
                <div>
                  <span style="font-size:12px;font-weight:700;color:var(--text-main);">${f.user || f.user_id || 'Ẩn danh'}</span>
                  <span style="font-size:12px;color:var(--text-muted);margin-left:6px;">${timeStr}</span>
                </div>
                <span style="font-size:11px;font-weight:700;padding:3px 10px;border-radius:20px;background:${catColor}18;color:${catColor};white-space:nowrap;">${catLabel}</span>
              </div>
              <div style="font-size:12px;color:var(--primary);font-weight:600;margin:5px 0 2px;">📝 ${f.exercise_title || f.exercise_id || '—'}</div>
              <div style="font-size:14px;color:var(--text-main);line-height:1.65;margin-top:6px;">${f.content}</div>
            </div>
          </div>
        </div>`;
    });

    container.innerHTML = statsHtml + `<div style="font-size:13px;font-weight:700;color:var(--text-main);margin-bottom:12px;display:flex;align-items:center;gap:6px;"><span style="width:3px;height:14px;background:var(--primary);border-radius:2px;display:inline-block;"></span>Danh sách góp ý (${total})</div>` + listHtml;
  } catch (err) {
    container.innerHTML = `<div style="padding:20px;text-align:center;background:var(--danger-light);border-radius:10px;color:var(--danger);font-weight:500;">❌ Lỗi tải dữ liệu: ${err.message}</div>`;
  }
}'''

if OLD_LF_START in js:
    js = js.replace(OLD_LF_START, NEW_LF)
    print('✅ loadFeedbacks redesigned')
else:
    # Try softer match
    import re
    idx = js.find('async function loadFeedbacks() {')
    if idx != -1:
        print('  loadFeedbacks found at index', idx, '— manual inspection needed')
    else:
        print('❌ loadFeedbacks not found')

with open('public/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('Done app.js')
