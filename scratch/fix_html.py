import re, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('public/lecturer.html', 'r', encoding='utf-8') as f:
    c = f.read()

# Replace the entire old card block with a simple empty div (JS will render inside it)
old = '''      <!-- Sidebar Profile Card (Premium) -->
      <div id="sidebar-info-card" style="margin:0 12px 12px; background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); border-radius:14px; padding:14px; backdrop-filter:blur(8px);">
        <!-- Avatar + Name -->
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:14px;">
          <div class="user-avatar-mini" style="width:42px; height:42px; min-width:42px; background:linear-gradient(135deg,#a78bfa,#818cf8); border-radius:12px; display:flex; align-items:center; justify-content:center; font-weight:800; font-size:17px; color:white; box-shadow:0 4px 12px rgba(99,102,241,0.4);">?</div>
          <div style="min-width:0;">
            <div class="admin-user-name" style="font-weight:700; font-size:13px; color:white; line-height:1.3; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">Đang tải...</div>
            <div class="sidebar-lecturer-id" style="font-size:10px; color:rgba(255,255,255,0.55); font-family:monospace; margin-top:1px;">GV01</div>
          </div>
        </div>
        <!-- Stats grid -->
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:6px; margin-bottom:10px;">
          <div style="background:rgba(255,255,255,0.1); border-radius:10px; padding:8px 10px; text-align:center;">
            <div class="stat-count-subjects" style="font-size:20px; font-weight:800; color:#a5f3fc; line-height:1;">0</div>
            <div style="font-size:10px; color:rgba(255,255,255,0.6); margin-top:2px; font-weight:600;">Môn quản lý</div>
          </div>
          <div style="background:rgba(255,255,255,0.1); border-radius:10px; padding:8px 10px; text-align:center;">
            <div class="stat-count-exercises" style="font-size:20px; font-weight:800; color:#86efac; line-height:1;">0</div>
            <div style="font-size:10px; color:rgba(255,255,255,0.6); margin-top:2px; font-weight:600;">Bài tập</div>
          </div>
        </div>
        <!-- Status pill -->
        <div style="display:flex; align-items:center; gap:6px; background:rgba(16,185,129,0.15); border:1px solid rgba(16,185,129,0.3); border-radius:8px; padding:5px 10px;">
          <span style="width:7px; height:7px; background:#10b981; border-radius:50%; box-shadow:0 0 6px #10b981; flex-shrink:0;"></span>
          <span style="font-size:11px; color:rgba(255,255,255,0.85); font-weight:600;">Đang hoạt động</span>
        </div>
      </div>'''

new = '      <!-- Profile card — rendered dynamically by renderSidebarInfoCard() in app.js -->\n      <div id="sidebar-info-card" class="sidebar-info-card"></div>'

if old in c:
    c = c.replace(old, new)
    print('Replaced card HTML OK')
else:
    # Try regex fallback
    c2 = re.sub(
        r'<!-- Sidebar Profile Card \(Premium\) -->.*?</div>\s*\n(\s*<button)',
        new + '\n\\1',
        c, flags=re.DOTALL
    )
    if c2 != c:
        c = c2
        print('Replaced via regex OK')
    else:
        print('FAILED to replace card HTML')

# Bump version
c = re.sub(r'app\.js\?v=\d+', 'app.js?v=22', c)
with open('public/lecturer.html', 'w', encoding='utf-8') as f:
    f.write(c)
print('Saved lecturer.html v22')
