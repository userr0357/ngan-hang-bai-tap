const fs = require('fs');
let h = fs.readFileSync('public/lecturer.html', 'utf8');

// ═══ 1. Fix sidebar collapsed footer ═══
// Add proper CSS for collapsed sidebar footer
const lecCollapseEnd = ".lec-sidebar.collapsed .sidebar-footer button {\n      font-size: 0 !important;\n      padding: 8px !important;\n    }";
const lecCollapseIdx = h.indexOf(lecCollapseEnd);

const betterCollapseCSS = `.lec-sidebar.collapsed .sidebar-profile {
      padding: 8px !important;
      text-align: center;
    }
    .lec-sidebar.collapsed .profile-row > div:last-child { display: none !important; }
    .lec-sidebar.collapsed .profile-row { justify-content: center; }
    .lec-sidebar.collapsed .profile-stats { display: none !important; }
    .lec-sidebar.collapsed .profile-status { display: none !important; }
    .lec-sidebar.collapsed .btn-logout-red {
      font-size: 0 !important; padding: 8px !important;
      display: flex; align-items: center; justify-content: center;
    }
    .lec-sidebar.collapsed .btn-logout-red::before {
      content: '🚪'; font-size: 16px;
    }
    .lec-sidebar.collapsed .brand-lecturer {
      padding: 14px 6px 10px !important;
      justify-content: center !important;
    }
    .lec-sidebar.collapsed .brand-icon { margin: 0 !important; }
    .lec-sidebar.collapsed > div:nth-child(2) { display: none !important; }`;

if (lecCollapseIdx > -1) {
  h = h.substring(0, lecCollapseIdx + lecCollapseEnd.length) + '\n    ' + betterCollapseCSS + '\n' + h.substring(lecCollapseIdx + lecCollapseEnd.length);
  console.log('✅ Sidebar collapsed footer CSS added');
} else {
  console.log('❌ Could not find collapse CSS end marker');
  // Try alternate
  const altMarker = '</style>';
  const altIdx = h.indexOf(altMarker);
  if (altIdx > -1) {
    h = h.substring(0, altIdx) + '\n    ' + betterCollapseCSS + '\n  ' + h.substring(altIdx);
    console.log('✅ Sidebar collapsed CSS added (alt)');
  }
}

// ═══ 2. Redesign exercise cards - more spacing and clarity ═══
// Update ex-card CSS for better spacing
const oldCardCSS = `.ex-card {
      border: 1px solid var(--border-color,#e2e8f0); border-radius: 14px;
      margin-bottom: 12px; background: var(--card-bg,#fff); overflow: hidden;
      transition: all .2s ease; position: relative;
    }`;

const newCardCSS = `.ex-card {
      border: 1px solid var(--border-color,#e2e8f0); border-radius: 14px;
      margin-bottom: 14px; background: var(--card-bg,#fff); overflow: hidden;
      transition: all .2s ease; position: relative;
    }`;

h = h.replace(oldCardCSS, newCardCSS);

// Update ex-card-top for more padding
h = h.replace(
  `.ex-card-top {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 16px 18px 10px; gap: 12px;
    }`,
  `.ex-card-top {
      display: flex; justify-content: space-between; align-items: flex-start;
      padding: 18px 20px 12px; gap: 14px;
    }`
);

// Update title style
h = h.replace(
  `.ex-card-title {
      font-size: 15px; font-weight: 700; color: var(--text-main,#1e293b);
      cursor: pointer; line-height: 1.4; transition: color .15s;
    }`,
  `.ex-card-title {
      font-size: 15px; font-weight: 700; color: var(--text-main,#1e293b);
      cursor: pointer; line-height: 1.5; transition: color .15s;
      margin-bottom: 4px;
    }`
);

// Update badges for more spacing
h = h.replace(
  `.ex-card-badges {
      display: flex; gap: 6px; flex-wrap: wrap; margin-top: 6px;
    }`,
  `.ex-card-badges {
      display: flex; gap: 7px; flex-wrap: wrap; margin-top: 8px;
    }`
);

// Update footer
h = h.replace(
  `.ex-card-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding: 10px 18px; border-top: 1px solid var(--border-color,#e2e8f0);
      background: var(--bg-color,#f8fafc);
    }`,
  `.ex-card-footer {
      display: flex; justify-content: space-between; align-items: center;
      padding: 12px 20px; border-top: 1px solid var(--border-color,#e2e8f0);
      background: var(--bg-color,#f8fafc);
    }`
);

// Update desc padding
h = h.replace(
  `.ex-card-desc {
      font-size: 13px; color: var(--text-muted,#64748b); line-height: 1.5;
      padding: 0 18px 10px; display: -webkit-box; -webkit-line-clamp: 2;
      -webkit-box-orient: vertical; overflow: hidden;
    }`,
  `.ex-card-desc {
      font-size: 13px; color: var(--text-muted,#64748b); line-height: 1.6;
      padding: 2px 20px 14px; display: -webkit-box; -webkit-line-clamp: 2;
      -webkit-box-orient: vertical; overflow: hidden;
    }`
);

console.log('✅ Exercise card spacing improved');

// ═══ 3. Redesign create/edit exercise modal ═══
// Replace the modal CSS and HTML structure
const oldModalCSS = `.modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.45); z-index: 1000; align-items: center; justify-content: center; }
    .modal.show { display: flex; }
    .modal-content { background: var(--card-bg,#fff); max-width: 640px; width: 95%; max-height: 90vh; overflow-y: auto; border-radius: 14px; padding: 24px; box-shadow: 0 20px 60px rgba(0,0,0,.2); }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 18px; }
    .modal-header h2 { margin: 0; font-size: 18px; font-weight: 800; color: var(--text-main,#1e293b); }
    .modal-close { background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-muted,#64748b); }
    .modal-close:hover { color: #dc2626; }
    form label { display: block; margin-top: 12px; font-size: 13px; font-weight: 600; color: var(--text-muted,#64748b); }
    form input, form textarea, form select { width: 100%; padding: 9px 12px; margin-top: 4px; border: 1.5px solid var(--border-color,#e2e8f0); border-radius: 9px; font-family: inherit; font-size: 14px; background: var(--bg-color,#f8fafc); color: var(--text-main,#1e293b); box-sizing: border-box; }
    form input:focus, form textarea:focus, form select:focus { outline: none; border-color: var(--primary,#6366f1); }`;

const newModalCSS = `.modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,.55); z-index: 1000; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
    .modal.show { display: flex; }
    .modal-content {
      background: var(--card-bg,#fff); max-width: 720px; width: 95%; max-height: 90vh;
      overflow-y: auto; border-radius: 18px; padding: 0;
      box-shadow: 0 24px 80px rgba(0,0,0,.3); border: none;
    }
    .modal-header {
      display: flex; justify-content: space-between; align-items: center;
      padding: 22px 28px; background: linear-gradient(135deg,#6366f1,#8b5cf6);
      border-radius: 18px 18px 0 0; position: relative;
    }
    .modal-header h2 { margin: 0; font-size: 19px; font-weight: 800; color: #fff; }
    .modal-close {
      background: rgba(255,255,255,.15); border: none; font-size: 20px;
      cursor: pointer; color: #fff; width: 36px; height: 36px;
      border-radius: 10px; display: flex; align-items: center;
      justify-content: center; transition: background .15s;
    }
    .modal-close:hover { background: rgba(255,255,255,.3); color: #fff; }
    #exercise-form { padding: 24px 28px 20px; }
    #exercise-form label {
      display: flex; align-items: center; gap: 6px;
      margin-top: 16px; margin-bottom: 5px; font-size: 13px;
      font-weight: 700; color: var(--text-main,#1e293b);
      text-transform: uppercase; letter-spacing: .03em;
    }
    #exercise-form label::before {
      content: ''; width: 3px; height: 14px; background: #6366f1;
      border-radius: 2px; flex-shrink: 0;
    }
    #exercise-form input, #exercise-form textarea, #exercise-form select {
      width: 100%; padding: 10px 14px; margin-top: 0; 
      border: 1.5px solid var(--border-color,#e2e8f0); border-radius: 10px;
      font-family: inherit; font-size: 14px;
      background: var(--bg-color,#f8fafc); color: var(--text-main,#1e293b);
      box-sizing: border-box; transition: border-color .15s, box-shadow .15s;
    }
    #exercise-form input:focus, #exercise-form textarea:focus, #exercise-form select:focus {
      outline: none; border-color: #6366f1;
      box-shadow: 0 0 0 3px rgba(99,102,241,.1);
    }
    #exercise-form textarea { min-height: 100px; resize: vertical; }
    #exercise-form .accent {
      padding: 10px 24px; background: linear-gradient(135deg,#6366f1,#818cf8);
      color: #fff; border: none; border-radius: 10px; font-size: 14px;
      font-weight: 700; cursor: pointer; box-shadow: 0 3px 10px rgba(99,102,241,.25);
      transition: all .15s;
    }
    #exercise-form .accent:hover { transform: translateY(-1px); box-shadow: 0 5px 16px rgba(99,102,241,.3); }
    #exercise-cancel, #exercise-form button[type="button"]:last-child {
      padding: 10px 20px; background: var(--bg-color,#f1f5f9);
      border: 1.5px solid var(--border-color,#e2e8f0); border-radius: 10px;
      font-size: 14px; font-weight: 600; cursor: pointer;
      color: var(--text-muted,#64748b); transition: all .15s;
    }
    #exercise-cancel:hover { background: #fee2e2; border-color: #fecaca; color: #dc2626; }
    #req-add, #grade-add {
      padding: 7px 14px; border: 1.5px dashed var(--border-color,#c7d2fe);
      border-radius: 8px; background: #eef2ff; color: #6366f1;
      font-size: 13px; font-weight: 700; cursor: pointer; transition: all .15s;
    }
    #req-add:hover, #grade-add:hover { background: #ddd6fe; border-style: solid; }
    form label { display: block; margin-top: 12px; font-size: 13px; font-weight: 600; color: var(--text-muted,#64748b); }
    form input, form textarea, form select { width: 100%; padding: 9px 12px; margin-top: 4px; border: 1.5px solid var(--border-color,#e2e8f0); border-radius: 9px; font-family: inherit; font-size: 14px; background: var(--bg-color,#f8fafc); color: var(--text-main,#1e293b); box-sizing: border-box; }
    form input:focus, form textarea:focus, form select:focus { outline: none; border-color: var(--primary,#6366f1); }`;

if (h.includes(oldModalCSS)) {
  h = h.replace(oldModalCSS, newModalCSS);
  console.log('✅ Modal CSS redesigned');
} else {
  console.log('❌ Old modal CSS not found, trying partial...');
  const partStart = '.modal { display: none;';
  const partEnd = 'form input:focus, form textarea:focus, form select:focus { outline: none; border-color: var(--primary,#6366f1); }';
  const ps = h.indexOf(partStart);
  const pe = h.indexOf(partEnd);
  if (ps > -1 && pe > -1) {
    h = h.substring(0, ps) + newModalCSS + h.substring(pe + partEnd.length);
    console.log('✅ Modal CSS redesigned (partial)');
  }
}

// Update modal submit buttons area
const oldSubmitArea = `<div style="margin-top:10px">
          <button type="submit" class="accent">Lưu</button>
          <button type="button" id="exercise-cancel">Huỷ</button>
        </div>`;
const newSubmitArea = `<div style="margin-top:20px;display:flex;gap:10px;justify-content:flex-end;padding-top:16px;border-top:1px solid var(--border-color,#e2e8f0)">
          <button type="button" id="exercise-cancel">✕ Huỷ</button>
          <button type="submit" class="accent">💾 Lưu bài tập</button>
        </div>`;

if (h.includes(oldSubmitArea)) {
  h = h.replace(oldSubmitArea, newSubmitArea);
  console.log('✅ Submit buttons redesigned');
}

fs.writeFileSync('public/lecturer.html', h, 'utf8');
console.log('✅ All 3 issues fixed!');
