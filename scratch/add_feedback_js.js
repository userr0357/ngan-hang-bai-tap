const fs = require('fs');
let h = fs.readFileSync('public/lecturer.html', 'utf8');

const marker = '// Auto-load dashboard on page load';
const idx = h.indexOf(marker);
if (idx === -1) { console.log('Marker not found'); process.exit(1); }

const feedbackJS = `
    // ═══════════════════ FEEDBACK SYSTEM ═══════════════════
    let currentFeedbackEx = null;

    function openFeedbackModal(ex, f, s) {
      currentFeedbackEx = { ex, f, s };
      const modal = document.getElementById('feedback-modal');
      modal.style.display = 'flex';
      
      const lvlNames = {1:'Lắp ghép cú pháp',2:'Luồng rẽ nhánh',3:'Vòng lặp & Mảng',4:'Hàm & Cấu trúc',5:'Tư duy giải thuật'};
      const diffColors = {'Dễ':['#dcfce7','#166534'],'Trung bình':['#fef9c3','#854d0e'],'Khó':['#fee2e2','#991b1b']};
      const lvlColors = {1:'#10b981',2:'#06b6d4',3:'#f59e0b',4:'#f97316',5:'#8b5cf6'};
      const dc = diffColors[ex.difficulty] || ['#f1f5f9','#475569'];
      const lvl = ex.level || 1;
      const lc = lvlColors[lvl] || '#94a3b8';

      document.getElementById('fb-modal-subtitle').textContent = 'Gửi cho: ' + (ex.lecturer_name||ex.owner||'GV');
      document.getElementById('fb-exercise-info').innerHTML = \`
        <div style="background:linear-gradient(135deg,#e0f2fe,#bae6fd);border-radius:10px;padding:10px 14px">
          <div style="font-size:10px;font-weight:700;color:#0369a1;text-transform:uppercase;opacity:.7">Mã bài tập</div>
          <div style="font-size:14px;font-weight:700;color:#0369a1">\${ex.id||'—'}</div>
        </div>
        <div style="background:linear-gradient(135deg,#ede9fe,#ddd6fe);border-radius:10px;padding:10px 14px">
          <div style="font-size:10px;font-weight:700;color:#7c3aed;text-transform:uppercase;opacity:.7">ID hệ thống</div>
          <div style="font-size:14px;font-weight:700;color:#7c3aed">#\${ex.numeric_id||ex.pk||''}</div>
        </div>
        <div style="background:linear-gradient(135deg,#fff7ed,#fed7aa);border-radius:10px;padding:10px 14px">
          <div style="font-size:10px;font-weight:700;color:#c2410c;text-transform:uppercase;opacity:.7">Dạng bài</div>
          <div style="font-size:14px;font-weight:700;color:#c2410c">\${f&&f.name||'—'}</div>
        </div>
        <div style="background:linear-gradient(135deg,#fdf4ff,#f5d0fe);border-radius:10px;padding:10px 14px">
          <div style="font-size:10px;font-weight:700;color:#86198f;text-transform:uppercase;opacity:.7">Giảng viên</div>
          <div style="font-size:14px;font-weight:700;color:#86198f">\${ex.lecturer_name||ex.owner||'—'}</div>
        </div>
        <div style="grid-column:span 2;background:linear-gradient(135deg,#f1f5f9,#e2e8f0);border-radius:10px;padding:10px 14px">
          <div style="font-size:10px;font-weight:700;color:#334155;text-transform:uppercase;opacity:.7">Tên bài tập</div>
          <div style="font-size:14px;font-weight:700;color:#334155">\${ex.title||'—'}</div>
          <div style="display:flex;gap:8px;margin-top:6px">
            <span style="font-size:12px;font-weight:600;padding:2px 8px;border-radius:20px;background:\${dc[0]};color:\${dc[1]}">\${ex.difficulty||'—'}</span>
            <span style="font-size:12px;font-weight:700;padding:2px 8px;border-radius:20px;background:\${lc}20;color:\${lc};border:1px solid \${lc}44">Lv.\${lvl} - \${lvlNames[lvl]||''}</span>
          </div>
        </div>\`;

      document.getElementById('fb-category').value = '';
      document.getElementById('fb-content').value = '';
      document.getElementById('fb-error').style.display = 'none';
    }

    function closeFeedbackModal() {
      document.getElementById('feedback-modal').style.display = 'none';
      currentFeedbackEx = null;
    }
    document.getElementById('feedback-modal')?.addEventListener('click', e => { if(e.target.id==='feedback-modal') closeFeedbackModal(); });

    function toggleFbCustom() {
      // no special action needed — both fields always visible
    }

    async function submitFeedback() {
      if (!currentFeedbackEx) return;
      const category = document.getElementById('fb-category').value;
      const content = document.getElementById('fb-content').value.trim();
      const errEl = document.getElementById('fb-error');

      if (!category && !content) {
        errEl.textContent = 'Vui lòng chọn lý do hoặc nhập nội dung góp ý';
        errEl.style.display = 'block'; return;
      }

      const ex = currentFeedbackEx.ex;
      try {
        const res = await fetch('/api/feedback', {
          method: 'POST', credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            baiTapId: ex.numeric_id || ex.pk,
            receiverId: ex.owner,
            category: category || 'Khác',
            content: content || category
          })
        });
        const data = await res.json();
        if (data.success) {
          closeFeedbackModal();
          showToast('Đã gửi góp ý thành công!', 'success');
        } else {
          errEl.textContent = data.error || 'Lỗi gửi góp ý';
          errEl.style.display = 'block';
        }
      } catch(e) {
        errEl.textContent = 'Lỗi kết nối: ' + e.message;
        errEl.style.display = 'block';
      }
    }

    // ── Feedback Section (Tab system) ──
    function switchFbTab(tab) {
      const tabs = ['received','sent'];
      tabs.forEach(t => {
        const btn = document.getElementById('fb-tab-'+t);
        const panel = document.getElementById('fb-panel-'+t);
        if (t === tab) {
          btn.style.background = '#6366f1'; btn.style.color = '#fff';
          panel.style.display = 'block';
        } else {
          btn.style.background = 'transparent'; btn.style.color = 'var(--text-muted)';
          panel.style.display = 'none';
        }
      });
      if (tab === 'received') loadReceivedFeedbacks();
      if (tab === 'sent') loadSentFeedbacks();
    }

    async function loadReceivedFeedbacks() {
      const list = document.getElementById('fb-received-list');
      list.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted)">⏳ Đang tải...</div>';
      try {
        const res = await fetch('/api/feedback/received', { credentials: 'include' });
        const data = await res.json();
        if (!data.length) {
          list.innerHTML = '<div style="background:var(--card-bg,#fff);border:1px solid var(--border-color,#e2e8f0);border-radius:12px;padding:40px;text-align:center;color:var(--text-muted)"><div style="font-size:40px;margin-bottom:12px">📭</div><div style="font-size:15px;font-weight:600">Chưa có góp ý nào</div><div style="font-size:13px;margin-top:4px">Chưa có giảng viên nào gửi góp ý cho bài tập của bạn</div></div>';
          return;
        }
        list.innerHTML = data.map(fb => renderFeedbackCard(fb, 'received')).join('');
      } catch(e) { list.innerHTML = '<div style="color:#ef4444;padding:20px">Lỗi: '+e.message+'</div>'; }
    }

    async function loadSentFeedbacks() {
      const list = document.getElementById('fb-sent-list');
      list.innerHTML = '<div style="text-align:center;padding:30px;color:var(--text-muted)">⏳ Đang tải...</div>';
      try {
        const res = await fetch('/api/feedback/sent', { credentials: 'include' });
        const data = await res.json();
        if (!data.length) {
          list.innerHTML = '<div style="background:var(--card-bg,#fff);border:1px solid var(--border-color,#e2e8f0);border-radius:12px;padding:40px;text-align:center;color:var(--text-muted)"><div style="font-size:40px;margin-bottom:12px">📤</div><div style="font-size:15px;font-weight:600">Chưa gửi góp ý nào</div><div style="font-size:13px;margin-top:4px">Bạn chưa gửi góp ý cho bài tập của giảng viên khác</div></div>';
          return;
        }
        list.innerHTML = data.map(fb => renderFeedbackCard(fb, 'sent')).join('');
      } catch(e) { list.innerHTML = '<div style="color:#ef4444;padding:20px">Lỗi: '+e.message+'</div>'; }
    }

    function renderFeedbackCard(fb, type) {
      const statusMap = {0:['⏳','Chờ xử lý','#f59e0b','#fef9c3'], 1:['✅','Đã xử lý','#16a34a','#dcfce7'], 2:['❌','Từ chối','#ef4444','#fee2e2']};
      const st = statusMap[fb.Status] || statusMap[0];
      const date = fb.CreatedAt ? new Date(fb.CreatedAt).toLocaleString('vi-VN') : '—';
      const lvlColors = {1:'#10b981',2:'#06b6d4',3:'#f59e0b',4:'#f97316',5:'#8b5cf6'};
      const lc = lvlColors[fb.SkillLevel||1] || '#94a3b8';
      const diffColors = {'Dễ':['#dcfce7','#166534'],'Trung bình':['#fef9c3','#854d0e'],'Khó':['#fee2e2','#991b1b']};
      const dc = diffColors[fb.TenDoKho] || ['#f1f5f9','#475569'];
      const personLabel = type === 'received' ? 'Người gửi' : 'Gửi cho';
      const personName = type === 'received' ? (fb.SenderName||fb.SenderId) : (fb.ReceiverName||fb.ReceiverId);

      return \`<div style="background:var(--card-bg,#fff);border:1px solid var(--border-color,#e2e8f0);border-radius:14px;overflow:hidden;transition:box-shadow .15s" onmouseenter="this.style.boxShadow='0 4px 16px rgba(0,0,0,.08)'" onmouseleave="this.style.boxShadow=''">
        <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 18px;background:var(--bg-color,#f8fafc);border-bottom:1px solid var(--border-color,#e2e8f0)">
          <div style="display:flex;align-items:center;gap:10px">
            <span style="font-size:18px">\${type==='received'?'📥':'📤'}</span>
            <div>
              <div style="font-size:14px;font-weight:700;color:var(--text-main)">\${fb.TenBaiTap||'—'}</div>
              <div style="font-size:12px;color:var(--text-muted)">Mã: \${fb.MaBaiTap||'—'} · \${fb.TenMon||'—'} · \${fb.TenDangBai||'—'}</div>
            </div>
          </div>
          <div style="display:flex;align-items:center;gap:8px">
            <span style="font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px;background:\${dc[0]};color:\${dc[1]}">\${fb.TenDoKho||'—'}</span>
            <span style="font-size:12px;font-weight:700;padding:3px 8px;border-radius:8px;background:\${lc}20;color:\${lc};border:1px solid \${lc}44">L\${fb.SkillLevel||1}</span>
            <span style="font-size:12px;font-weight:600;padding:3px 10px;border-radius:20px;background:\${st[3]};color:\${st[2]}">\${st[0]} \${st[1]}</span>
          </div>
        </div>
        <div style="padding:14px 18px">
          <div style="display:flex;justify-content:space-between;margin-bottom:8px">
            <span style="font-size:12px;color:var(--text-muted)">\${personLabel}: <b style="color:var(--text-main)">\${personName}</b></span>
            <span style="font-size:12px;color:var(--text-muted)">🕐 \${date}</span>
          </div>
          <div style="font-size:13px;font-weight:600;color:#6366f1;margin-bottom:6px">📌 \${fb.Category||'Góp ý'}</div>
          <div style="font-size:14px;color:var(--text-main);line-height:1.6;background:var(--bg-color,#f8fafc);padding:10px 14px;border-radius:8px;border-left:3px solid #6366f1">\${fb.Content||'(Không có nội dung)'}</div>
        </div>
      </div>\`;
    }

    function showToast(msg, type) {
      const t = document.getElementById('toast-notification');
      if (!t) return;
      t.textContent = msg;
      t.style.background = type==='success' ? '#16a34a' : '#ef4444';
      t.style.display = 'block';
      setTimeout(() => t.style.display = 'none', 3000);
    }

    `;

h = h.substring(0, idx) + feedbackJS + h.substring(idx);

// Also update the menu click handler to load feedbacks
const fbMenuTrigger = "if (sec === 'export') loadExportExercises();";
const fbIdx = h.indexOf(fbMenuTrigger);
if (fbIdx > -1) {
  h = h.substring(0, fbIdx + fbMenuTrigger.length) +
      "\n        if (sec === 'feedback') { loadReceivedFeedbacks(); }" +
      h.substring(fbIdx + fbMenuTrigger.length);
  console.log('Added feedback menu trigger');
}

fs.writeFileSync('public/lecturer.html', h, 'utf8');
console.log('✅ Feedback JS logic added!');
