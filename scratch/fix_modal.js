const fs = require('fs');
let h = fs.readFileSync('public/lecturer.html', 'utf8');

const startMarker = "const infoCards = [";
const startIdx = h.indexOf(startMarker);
const endMarker = "join('');";
const endIdx = h.indexOf(endMarker, startIdx);
const endAbs = endIdx + endMarker.length;

console.log('Replacing chars', startIdx, 'to', endAbs);

const replacement = `const fmtIcons = { 'zip':'📦', 'pdf':'📄', 'docx':'📝', 'link':'🔗', 'text':'📃', 'image':'🖼️' };
      const fmtDisplay = ex.submission_format ? ex.submission_format.split(', ').map(f => (fmtIcons[f.toLowerCase()]||'📋') + ' ' + f.toUpperCase()).join('  ') : '(Chưa đặt)';
      const infoCards = [
        { bg:'linear-gradient(135deg,#e0f2fe,#bae6fd)', icon:'🏷️', label:'MÃ BÀI TẬP', value: ex.id||'---', color:'#0369a1' },
        { bg:'linear-gradient(135deg,#ede9fe,#ddd6fe)', icon:'🔢', label:'ID HỆ THỐNG', value: '#'+(ex.numeric_id||ex.pk||''), color:'#7c3aed' },
        { bg:'linear-gradient(135deg,#fff7ed,#fed7aa)', icon:'📂', label:'DẠNG BÀI', value: (f&&f.name)||'', color:'#c2410c' },
        { bg:'linear-gradient(135deg,#f1f5f9,#e2e8f0)', icon:'📊', label:'ĐỘ KHÓ & CẤP ĐỘ', value: diff+(levelLabel?\` • \${levelLabel}\`:''), color:'#334155' },
        { bg:'linear-gradient(135deg,#ecfdf5,#d1fae5)', icon:'📋', label:'HÌNH THỨC NỘP', value: fmtDisplay, color:'#065f46' },
        { bg:'linear-gradient(135deg,#fdf4ff,#f5d0fe)', icon:'👨‍🏫', label:'GIẢNG VIÊN', value: ex.lecturer_name||ex.owner||'Hệ thống', color:'#86198f' }
      ];
      document.getElementById('ex-detail-grid').innerHTML = infoCards.map(c=>\`
        <div style="background:\${c.bg};border-radius:12px;padding:14px 16px;min-height:70px;border:1px solid rgba(0,0,0,.05)">
          <div style="font-size:10px;font-weight:700;color:\${c.color};letter-spacing:.06em;margin-bottom:6px;text-transform:uppercase;opacity:.75">\${c.icon} \${c.label}</div>
          <div style="font-size:14px;font-weight:700;color:\${c.color};line-height:1.4">\${escH(String(c.value))}</div>
        </div>\`).join('');`;

h = h.substring(0, startIdx) + replacement + h.substring(endAbs);
fs.writeFileSync('public/lecturer.html', h, 'utf8');
console.log('✅ Modal info cards updated!');
