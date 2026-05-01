const fs = require('fs');
let h = fs.readFileSync('public/lecturer.html', 'utf8');

// ─── 1. Add feedback button next to "Xem" for non-owner exercises ───
const viewBtnOld = `<button onclick="showExerciseModal(\${JSON.stringify(ex).replace(/"/g,'&quot;')},\${JSON.stringify(f).replace(/"/g,'&quot;')},\${JSON.stringify(s).replace(/"/g,'&quot;')})" style="padding:6px 12px;background:var(--card-bg,#fff);border:1.5px solid var(--border-color,#e2e8f0);border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;color:var(--text-main,#1e293b)">Xem</button>`;

const viewBtnNew = `<button onclick="showExerciseModal(\${JSON.stringify(ex).replace(/"/g,'&quot;')},\${JSON.stringify(f).replace(/"/g,'&quot;')},\${JSON.stringify(s).replace(/"/g,'&quot;')})" style="padding:6px 12px;background:var(--card-bg,#fff);border:1.5px solid var(--border-color,#e2e8f0);border-radius:8px;font-size:12px;font-weight:600;cursor:pointer;color:var(--text-main,#1e293b)">Xem</button><button onclick="openFeedbackModal(\${JSON.stringify(ex).replace(/"/g,'&quot;')},\${JSON.stringify(f).replace(/"/g,'&quot;')},\${JSON.stringify(s).replace(/"/g,'&quot;')})" style="padding:6px 12px;background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">💬 Góp ý</button>`;

if (h.includes(viewBtnOld)) {
  h = h.replace(viewBtnOld, viewBtnNew);
  console.log('✅ Added feedback button next to Xem');
} else {
  console.log('⚠️ Xem button pattern not found, trying alternative...');
  // Try to find the Xem button another way
  const xemIdx = h.indexOf('>Xem</button>`}');
  if (xemIdx > -1) {
    const insertAt = xemIdx + '>Xem</button>'.length;
    h = h.substring(0, insertAt) + `<button onclick="openFeedbackModal(\${JSON.stringify(ex).replace(/"/g,'&quot;')},\${JSON.stringify(f).replace(/"/g,'&quot;')},\${JSON.stringify(s).replace(/"/g,'&quot;')})" style="padding:6px 12px;background:linear-gradient(135deg,#f59e0b,#fbbf24);color:#fff;border:none;border-radius:8px;font-size:12px;font-weight:700;cursor:pointer">💬 Góp ý</button>` + h.substring(insertAt);
    console.log('✅ Added feedback button (alt method)');
  } else {
    console.log('❌ Could not find Xem button');
  }
}

// ─── 2. Add Feedback Modal HTML (before </main>) ───
const mainCloseTag = '</main>';
const mainIdx = h.indexOf(mainCloseTag);

const feedbackModal = `
    <!-- Feedback Modal -->
    <div id="feedback-modal" style="display:none;position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,.5);z-index:1000;align-items:center;justify-content:center;backdrop-filter:blur(4px)">
      <div style="background:var(--card-bg,#fff);border-radius:16px;max-width:600px;width:95%;max-height:90vh;overflow-y:auto;box-shadow:0 20px 60px rgba(0,0,0,.3)">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#f59e0b,#d97706);padding:20px 24px;border-radius:16px 16px 0 0">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <div style="display:flex;align-items:center;gap:12px">
              <span style="font-size:24px">💬</span>
              <div>
                <h3 style="margin:0;color:#fff;font-size:18px;font-weight:700">Gửi Góp Ý Bài Tập</h3>
                <p id="fb-modal-subtitle" style="margin:2px 0 0;font-size:12px;color:rgba(255,255,255,.8)">Gửi góp ý cho giảng viên</p>
              </div>
            </div>
            <button onclick="closeFeedbackModal()" style="background:rgba(255,255,255,.15);border:none;color:#fff;width:34px;height:34px;border-radius:8px;font-size:18px;cursor:pointer">&times;</button>
          </div>
        </div>
        <!-- Exercise Info -->
        <div style="padding:16px 24px;border-bottom:1px solid var(--border-color,#e2e8f0)">
          <div id="fb-exercise-info" style="display:grid;grid-template-columns:1fr 1fr;gap:10px"></div>
        </div>
        <!-- Form -->
        <div style="padding:20px 24px">
          <label style="display:block;font-size:13px;font-weight:700;color:var(--text-main);margin-bottom:6px">Lý do góp ý</label>
          <select id="fb-category" onchange="toggleFbCustom()" style="width:100%;padding:10px 14px;border:1.5px solid var(--border-color,#e2e8f0);border-radius:10px;font-size:14px;font-family:inherit;background:var(--card-bg);color:var(--text-main);margin-bottom:14px;outline:none;cursor:pointer">
            <option value="">-- Chọn lý do --</option>
            <option value="Nội dung chưa chính xác">📝 Nội dung chưa chính xác</option>
            <option value="Yêu cầu chưa rõ ràng">❓ Yêu cầu chưa rõ ràng</option>
            <option value="Độ khó chưa phù hợp">📊 Độ khó chưa phù hợp</option>
            <option value="Tiêu chí chấm điểm chưa hợp lý">⚖️ Tiêu chí chấm điểm chưa hợp lý</option>
            <option value="Trùng lặp với bài tập khác">🔄 Trùng lặp với bài tập khác</option>
            <option value="Đề xuất cải thiện">💡 Đề xuất cải thiện</option>
            <option value="Khác">📋 Khác (tự nhập bên dưới)</option>
          </select>
          <label style="display:block;font-size:13px;font-weight:700;color:var(--text-main);margin-bottom:6px">Nội dung góp ý chi tiết</label>
          <textarea id="fb-content" placeholder="Nhập nội dung góp ý chi tiết của bạn..." style="width:100%;min-height:120px;padding:12px 14px;border:1.5px solid var(--border-color,#e2e8f0);border-radius:10px;font-size:14px;font-family:inherit;resize:vertical;background:var(--bg-color,#f8fafc);color:var(--text-main);outline:none;box-sizing:border-box"></textarea>
          <div id="fb-error" style="color:#ef4444;font-size:13px;margin-top:6px;display:none"></div>
        </div>
        <!-- Actions -->
        <div style="padding:14px 24px;border-top:1px solid var(--border-color,#e2e8f0);display:flex;justify-content:flex-end;gap:10px">
          <button onclick="closeFeedbackModal()" style="padding:10px 20px;border:1.5px solid var(--border-color,#e2e8f0);border-radius:10px;background:none;font-size:14px;font-weight:600;cursor:pointer;color:var(--text-muted);font-family:inherit">Hủy</button>
          <button onclick="submitFeedback()" style="padding:10px 24px;background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border:none;border-radius:10px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 2px 8px rgba(245,158,11,.3)">📩 Gửi Góp Ý</button>
        </div>
      </div>
    </div>
    `;
h = h.substring(0, mainIdx) + feedbackModal + h.substring(mainIdx);
console.log('✅ Added feedback modal HTML');

// ─── 3. Replace feedback section with 2-part design ───
const fbSectionStart = h.indexOf('<div id="section-feedback"');
const fbSectionEnd = h.indexOf('<!-- Exercise History Section -->');
if (fbSectionStart > -1 && fbSectionEnd > -1) {
  const newFbSection = `<div id="section-feedback" class="section-lecturer" style="display:none">
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:20px">
          <span style="font-size:28px">💬</span>
          <div>
            <h2 style="margin:0;font-size:22px;font-weight:800;color:var(--text-main,#1e293b)">Tiếp Nhận & Gửi Góp Ý</h2>
            <p style="margin:2px 0 0;font-size:14px;color:var(--text-muted,#64748b)">Quản lý góp ý nhận được và góp ý đã gửi</p>
          </div>
        </div>

        <!-- Tab buttons -->
        <div style="display:flex;gap:4px;margin-bottom:16px;background:var(--bg-color,#f1f5f9);padding:4px;border-radius:12px;width:fit-content">
          <button onclick="switchFbTab('received')" id="fb-tab-received" class="fb-tab-active" style="padding:8px 20px;border-radius:9px;border:none;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;background:#6366f1;color:#fff;transition:all .15s">📥 Góp ý nhận được</button>
          <button onclick="switchFbTab('sent')" id="fb-tab-sent" style="padding:8px 20px;border-radius:9px;border:none;font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;background:transparent;color:var(--text-muted);transition:all .15s">📤 Góp ý đã gửi</button>
        </div>

        <!-- Received feedbacks -->
        <div id="fb-panel-received">
          <div id="fb-received-list" style="display:flex;flex-direction:column;gap:12px">
            <div style="text-align:center;padding:40px;color:var(--text-muted)">Đang tải...</div>
          </div>
        </div>

        <!-- Sent feedbacks -->
        <div id="fb-panel-sent" style="display:none">
          <div id="fb-sent-list" style="display:flex;flex-direction:column;gap:12px">
            <div style="text-align:center;padding:40px;color:var(--text-muted)">Đang tải...</div>
          </div>
        </div>
      </div>

      `;
  h = h.substring(0, fbSectionStart) + newFbSection + h.substring(fbSectionEnd);
  console.log('✅ Replaced feedback section with 2-panel design');
}

fs.writeFileSync('public/lecturer.html', h, 'utf8');
console.log('✅ All HTML changes done!');
