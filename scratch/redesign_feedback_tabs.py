import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('public/app.js', 'r', encoding='utf-8') as f:
    js = f.read()

# Find and replace the entire loadFeedbacks function
OLD_LF_MARKER = 'async function loadFeedbacks() {'
idx = js.find(OLD_LF_MARKER)
if idx == -1:
    print('❌ loadFeedbacks not found')
    exit()

# Find function end
depth = 0; in_str = False; i = idx
while i < len(js):
    c = js[i]
    if c == '{' and not in_str: depth += 1
    elif c == '}' and not in_str:
        depth -= 1
        if depth == 0: func_end = i + 1; break
    elif c in ('"', "'", '`') and not in_str: in_str = c
    elif in_str and c == in_str and (i == 0 or js[i-1] != '\\'): in_str = False
    i += 1

old_func = js[idx:func_end]

CAT_MAP_JS = """{
    content:'📝 Nội dung',requirement:'📋 Yêu cầu kỹ thuật',
    criteria:'📊 Tiêu chí',difficulty:'⚖️ Độ khó',
    format:'📎 Định dạng nộp',spelling:'✏️ Chính tả',
    knowledge:'🧠 Kiến thức',link:'🔗 Link hỏng',other:'💬 Khác'
  }"""

CAT_COLORS_JS = """{
    content:'#6366f1',requirement:'#10b981',criteria:'#f59e0b',
    difficulty:'#ef4444',format:'#0891b2',spelling:'#ec4899',
    knowledge:'#8b5cf6',link:'#dc2626',other:'#64748b'
  }"""

STATUS_CFG_JS = """{
    new:{label:'Mới',color:'#6366f1',bg:'#eef2ff'},
    accepted:{label:'Đã tiếp nhận',color:'#f59e0b',bg:'#fffbeb'},
    resolved:{label:'Đã sửa',color:'#10b981',bg:'#f0fdf4'}
  }"""

NEW_LF = r"""// ── Feedback tab state ──
let _fbTab = 'received'; // 'received' | 'sent'

async function loadFeedbacks() {
  const container = document.getElementById('feedback-list');
  if (!container) return;

  const catMap    = """ + CAT_MAP_JS + r""";
  const catColors = """ + CAT_COLORS_JS + r""";
  const statusCfg = """ + STATUS_CFG_JS + r""";

  // ── Tab header ──
  container.innerHTML = `
    <div style="display:flex;gap:0;border:1.5px solid var(--border-color);border-radius:10px;overflow:hidden;margin-bottom:20px;width:fit-content;">
      <button id="fb-tab-received" onclick="switchFbTab('received')"
        style="padding:9px 22px;font-size:13px;font-weight:700;border:none;cursor:pointer;transition:all 0.2s;
          background:${_fbTab==='received'?'var(--primary)':'var(--card-bg)'};
          color:${_fbTab==='received'?'white':'var(--text-muted)'};">
        📥 Góp ý đã nhận
      </button>
      <button id="fb-tab-sent" onclick="switchFbTab('sent')"
        style="padding:9px 22px;font-size:13px;font-weight:700;border:none;cursor:pointer;transition:all 0.2s;border-left:1.5px solid var(--border-color);
          background:${_fbTab==='sent'?'var(--primary)':'var(--card-bg)'};
          color:${_fbTab==='sent'?'white':'var(--text-muted)'};">
        📤 Góp ý đã gửi
      </button>
    </div>
    <div id="fb-tab-content"><div style="text-align:center;padding:32px;color:var(--text-muted);">⏳ Đang tải...</div></div>`;

  loadFbTabContent();
}

function switchFbTab(tab) {
  _fbTab = tab;
  loadFeedbacks();
}

async function loadFbTabContent() {
  const content = document.getElementById('fb-tab-content');
  if (!content) return;
  const catMap    = {content:'📝 Nội dung',requirement:'📋 Yêu cầu kỹ thuật',criteria:'📊 Tiêu chí',difficulty:'⚖️ Độ khó',format:'📎 Định dạng',spelling:'✏️ Chính tả',knowledge:'🧠 Kiến thức',link:'🔗 Link hỏng',other:'💬 Khác'};
  const catColors = {content:'#6366f1',requirement:'#10b981',criteria:'#f59e0b',difficulty:'#ef4444',format:'#0891b2',spelling:'#ec4899',knowledge:'#8b5cf6',link:'#dc2626',other:'#64748b'};
  const statusCfg = {new:{label:'Mới',color:'#6366f1',bg:'#eef2ff'},accepted:{label:'Đã tiếp nhận',color:'#f59e0b',bg:'#fffbeb'},resolved:{label:'Đã sửa',color:'#10b981',bg:'#f0fdf4'}};

  try {
    const url = _fbTab === 'received' ? '/api/feedback/me' : '/api/feedback/sent';
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('Lỗi ' + res.status);
    const data = await res.json();

    // Stats row
    const total = data.length;
    const newCount = data.filter(f => !f.status || f.status === 'new').length;
    const resolvedCount = data.filter(f => f.status === 'resolved').length;
    const exIds = [...new Set(data.map(f => f.exercise_id))].length;

    const statsHtml = `
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:20px;">
        <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:10px;padding:14px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:var(--primary);">${total}</div>
          <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-top:2px;">Tổng góp ý</div>
        </div>
        <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:10px;padding:14px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:#6366f1;">${newCount}</div>
          <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-top:2px;">Chưa xử lý</div>
        </div>
        <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:10px;padding:14px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:#10b981;">${resolvedCount}</div>
          <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-top:2px;">Đã sửa</div>
        </div>
        <div style="background:var(--card-bg);border:1px solid var(--border-color);border-radius:10px;padding:14px;text-align:center;">
          <div style="font-size:22px;font-weight:800;color:#f59e0b;">${exIds}</div>
          <div style="font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;margin-top:2px;">Bài tập</div>
        </div>
      </div>`;

    if (!data.length) {
      const emptyMsg = _fbTab === 'received'
        ? 'Chưa có ai gửi góp ý cho bài tập của bạn'
        : 'Bạn chưa gửi góp ý cho bài tập nào';
      content.innerHTML = statsHtml + `
        <div style="padding:48px;text-align:center;background:var(--card-bg);border:1px solid var(--border-color);border-radius:12px;">
          <div style="font-size:40px;margin-bottom:12px;">${_fbTab==='received'?'📭':'📤'}</div>
          <div style="font-size:15px;font-weight:600;color:var(--text-main);">${emptyMsg}</div>
        </div>`;
      return;
    }

    const sectionLabel = `<div style="font-size:13px;font-weight:700;color:var(--text-main);margin-bottom:12px;display:flex;align-items:center;gap:6px;"><span style="width:3px;height:14px;background:var(--primary);border-radius:2px;display:inline-block;"></span>${_fbTab==='received'?'Phản hồi cho bài tập của tôi':'Góp ý tôi đã gửi'} (${total})</div>`;

    let listHtml = '';
    data.forEach(f => {
      const cat      = f.category || 'other';
      const catLabel = catMap[cat] || '💬 Khác';
      const catColor = catColors[cat] || '#64748b';
      const st       = statusCfg[f.status || 'new'] || statusCfg.new;
      const timeStr  = new Date(f.timestamp || f.created_at).toLocaleString('vi-VN');
      const initials = (f.user || f.user_id || '?').substring(0,2).toUpperCase();

      // Action buttons (only for received tab)
      const actionBtns = (_fbTab === 'received' && f.id) ? `
        <div style="display:flex;gap:6px;margin-top:10px;padding-top:10px;border-top:1px solid var(--border-color);">
          ${f.status !== 'accepted' && f.status !== 'resolved' ? `<button onclick="updateFbStatus('${f.id}','accepted')" style="padding:5px 14px;border:1.5px solid #f59e0b;background:transparent;color:#f59e0b;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">✅ Tiếp nhận</button>` : ''}
          ${f.status !== 'resolved' ? `<button onclick="updateFbStatus('${f.id}','resolved')" style="padding:5px 14px;border:1.5px solid #10b981;background:transparent;color:#10b981;border-radius:6px;font-size:12px;font-weight:700;cursor:pointer;">✔ Đã sửa</button>` : ''}
        </div>` : '';

      // For sent tab: show target lecturer info
      const sentToInfo = _fbTab === 'sent' && f.target_lecturer_id ? `
        <div style="font-size:12px;color:var(--text-muted);margin-top:4px;">👤 Gửi đến GV: <strong>${f.target_lecturer_id}</strong></div>` : '';

      listHtml += `
        <div id="fb-card-${f.id||''}" style="background:var(--card-bg);border:1px solid var(--border-color);border-left:4px solid ${catColor};border-radius:4px 12px 12px 4px;padding:14px 16px;margin-bottom:10px;transition:box-shadow 0.2s;" onmouseover="this.style.boxShadow='0 4px 16px rgba(0,0,0,0.08)'" onmouseout="this.style.boxShadow='none'">
          <div style="display:flex;align-items:flex-start;gap:12px;">
            <div style="width:34px;height:34px;border-radius:50%;background:${catColor}20;color:${catColor};font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;flex-shrink:0;">${initials}</div>
            <div style="flex:1;min-width:0;">
              <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px;">
                <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
                  <span style="font-size:13px;font-weight:700;color:var(--text-main);">${f.user||f.user_id||'Ẩn danh'}</span>
                  <span style="font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px;background:${catColor}18;color:${catColor};">${catLabel}</span>
                  <span id="fb-status-${f.id||''}" style="font-size:11px;font-weight:700;padding:2px 9px;border-radius:20px;background:${st.bg};color:${st.color};">${st.label}</span>
                </div>
                <span style="font-size:11px;color:var(--text-muted);white-space:nowrap;">${timeStr}</span>
              </div>
              <div style="font-size:12px;color:var(--primary);font-weight:600;margin-bottom:6px;">📝 ${f.exercise_title||f.exercise_id||'—'}</div>
              ${sentToInfo}
              <div style="font-size:14px;color:var(--text-main);line-height:1.65;">${f.content}</div>
              ${actionBtns}
            </div>
          </div>
        </div>`;
    });

    content.innerHTML = statsHtml + sectionLabel + listHtml;
  } catch(err) {
    if(content) content.innerHTML = `<div style="padding:20px;text-align:center;background:var(--danger-light);border-radius:10px;color:var(--danger);">❌ ${err.message}</div>`;
  }
}

async function updateFbStatus(fbId, status) {
  try {
    const res = await fetch(`/api/feedback/${fbId}/status`, {
      method: 'PATCH', credentials: 'include',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ status })
    });
    if (!res.ok) throw new Error((await res.json()).error || 'Lỗi');
    // Update UI inline
    const statusCfg = {accepted:{label:'Đã tiếp nhận',color:'#f59e0b',bg:'#fffbeb'},resolved:{label:'Đã sửa',color:'#10b981',bg:'#f0fdf4'}};
    const st = statusCfg[status];
    const badge = document.getElementById('fb-status-' + fbId);
    if (badge && st) {
      badge.textContent = st.label;
      badge.style.background = st.bg;
      badge.style.color = st.color;
    }
    // Remove action buttons
    const card = document.getElementById('fb-card-' + fbId);
    if (card) {
      const btns = card.querySelector('div[style*="border-top"]');
      if (btns) btns.remove();
    }
    showToast(status === 'resolved' ? '✅ Đã đánh dấu là Đã sửa!' : '✅ Đã tiếp nhận góp ý!');
  } catch(e) {
    showToast('❌ ' + e.message, true);
  }
}"""

js = js.replace(old_func, NEW_LF)

with open('public/app.js', 'w', encoding='utf-8') as f:
    f.write(js)
print('✅ loadFeedbacks redesigned with 2-tab system')
