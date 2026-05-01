import re, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# ── Fix 1: Admin export HTML – replace Card 1 (Bài tập) với full exercise picker
with open('public/admin.html', 'r', encoding='utf-8') as f:
    html = f.read()

OLD_EXPORT_CARD1 = '''            <!-- Card 1: Bài tập -->
            <div style="background:var(--card-bg); border-radius:14px; border:1px solid #e5e7eb; overflow:hidden;">
              <div style="background:linear-gradient(135deg,#6366f1,#818cf8); padding:18px 20px;">
                <div style="font-size:28px; margin-bottom:8px;">📋</div>
                <h3 style="margin:0; color:white; font-size:16px; font-weight:700;">Danh Sách Bài Tập</h3>
                <p style="margin:4px 0 0; font-size:12px; color:rgba(255,255,255,0.8);">Toàn bộ bài tập kèm thông tin môn học, giảng viên, cấp độ</p>
              </div>
              <div style="padding:16px;">
                <div style="margin-bottom:10px;">
                  <label style="font-size:12px; font-weight:600; color:var(--text-muted);">Lọc theo Môn học</label>
                  <select id="exp-ex-mamon" style="width:100%; margin-top:4px; padding:8px; border:1px solid var(--border-color); border-radius:6px; font-size:13px;">
                    <option value="">— Tất cả môn —</option>
                  </select>
                </div>
                <div style="margin-bottom:12px;">
                  <label style="font-size:12px; font-weight:600; color:var(--text-muted);">Định dạng</label>
                  <div style="display:flex; gap:8px; margin-top:4px;">
                    <label style="display:flex; align-items:center; gap:5px; font-size:13px; cursor:pointer;"><input type="radio" name="exp-ex-fmt" value="xlsx" checked> Excel (.xlsx)</label>
                    <label style="display:flex; align-items:center; gap:5px; font-size:13px; cursor:pointer;"><input type="radio" name="exp-ex-fmt" value="csv"> CSV (.csv)</label>
                  </div>
                </div>
                <button onclick="doExport('exercises')" style="width:100%; padding:10px; background:#6366f1; color:white; border:none; border-radius:8px; font-size:14px; font-weight:600; cursor:pointer; transition:opacity 0.15s;" onmouseover="this.style.opacity=0.85" onmouseout="this.style.opacity=1">
                  ⬇ Xuất Bài Tập
                </button>
              </div>
            </div>'''

NEW_EXPORT_CARD1 = '''            <!-- Card 1: Bài tập (Full picker) -->
            <div style="background:var(--card-bg); border-radius:14px; border:1px solid var(--border-color); overflow:hidden; grid-column:1/-1;">
              <div style="background:linear-gradient(135deg,#6366f1,#818cf8); padding:18px 24px; display:flex; align-items:center; gap:14px;">
                <div style="font-size:32px;">📋</div>
                <div>
                  <h3 style="margin:0; color:white; font-size:17px; font-weight:800;">Xuất Danh Sách Bài Tập</h3>
                  <p style="margin:3px 0 0; font-size:12px; color:rgba(255,255,255,0.85);">Chọn môn → lọc theo dạng bài / độ khó / level → tích chọn bài tập cần xuất</p>
                </div>
              </div>
              <!-- Filter row -->
              <div style="padding:16px 20px; border-bottom:1px solid var(--border-color); display:flex; gap:12px; flex-wrap:wrap; align-items:flex-end;">
                <div style="flex:1; min-width:160px;">
                  <label style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:5px;">📚 Môn học</label>
                  <select id="exp-ex-mamon" onchange="loadAdminExportList()" style="width:100%; padding:9px 12px; border:1.5px solid var(--border-color); border-radius:8px; font-size:13px; background:var(--bg-color); color:var(--text-main);">
                    <option value="">— Chọn môn —</option>
                  </select>
                </div>
                <div style="min-width:140px;">
                  <label style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:5px;">🎯 Dạng bài</label>
                  <select id="exp-ex-form" onchange="applyAdminExportFilters()" style="width:100%; padding:9px 12px; border:1.5px solid var(--border-color); border-radius:8px; font-size:13px; background:var(--bg-color); color:var(--text-main);">
                    <option value="">Tất cả dạng</option>
                  </select>
                </div>
                <div style="min-width:130px;">
                  <label style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:5px;">⚖️ Độ khó</label>
                  <select id="exp-ex-diff" onchange="applyAdminExportFilters()" style="width:100%; padding:9px 12px; border:1.5px solid var(--border-color); border-radius:8px; font-size:13px; background:var(--bg-color); color:var(--text-main);">
                    <option value="">Tất cả</option>
                    <option value="Dễ">🟢 Dễ</option>
                    <option value="Trung bình">🟡 Trung bình</option>
                    <option value="Khó">🔴 Khó</option>
                  </select>
                </div>
                <div style="min-width:120px;">
                  <label style="font-size:11px; font-weight:700; color:var(--text-muted); text-transform:uppercase; letter-spacing:0.05em; display:block; margin-bottom:5px;">📊 Level</label>
                  <select id="exp-ex-level" onchange="applyAdminExportFilters()" style="width:100%; padding:9px 12px; border:1.5px solid var(--border-color); border-radius:8px; font-size:13px; background:var(--bg-color); color:var(--text-main);">
                    <option value="">Tất cả</option>
                    <option value="1">L1 – Lắp ghép</option>
                    <option value="2">L2 – Rẽ nhánh</option>
                    <option value="3">L3 – Vòng lặp</option>
                    <option value="4">L4 – Hàm</option>
                    <option value="5">L5 – Giải thuật</option>
                  </select>
                </div>
                <div style="display:flex; gap:8px; align-items:center; padding-top:18px;">
                  <label style="display:flex; align-items:center; gap:5px; font-size:13px; cursor:pointer; white-space:nowrap;"><input type="radio" name="exp-ex-fmt" value="xlsx" checked> Excel</label>
                  <label style="display:flex; align-items:center; gap:5px; font-size:13px; cursor:pointer; white-space:nowrap;"><input type="radio" name="exp-ex-fmt" value="csv"> CSV</label>
                </div>
              </div>
              <!-- Exercise list -->
              <div id="exp-ex-list-container" style="padding:16px 20px; min-height:120px; max-height:420px; overflow-y:auto;">
                <div style="text-align:center; padding:40px; color:var(--text-muted); font-size:14px;">
                  ← Chọn môn học để xem danh sách bài tập
                </div>
              </div>
              <!-- Action bar -->
              <div style="padding:12px 20px; border-top:1px solid var(--border-color); display:flex; justify-content:space-between; align-items:center; background:var(--bg-color);">
                <div style="font-size:13px; color:var(--text-muted);">
                  Đã chọn: <strong id="exp-ex-selected-count" style="color:var(--primary);">0</strong> bài tập
                </div>
                <div style="display:flex; gap:10px;">
                  <button onclick="selectAllAdminExport(true)" style="padding:7px 16px; border:1.5px solid var(--border-color); background:var(--bg-color); color:var(--text-muted); border-radius:8px; font-size:13px; font-weight:600; cursor:pointer;">☑ Chọn tất cả</button>
                  <button onclick="selectAllAdminExport(false)" style="padding:7px 16px; border:1.5px solid var(--border-color); background:var(--bg-color); color:var(--text-muted); border-radius:8px; font-size:13px; font-weight:600; cursor:pointer;">☐ Bỏ chọn</button>
                  <button onclick="doExportSelected()" style="padding:7px 20px; background:#6366f1; color:white; border:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; transition:all 0.2s;">⬇ Xuất bài đã chọn</button>
                  <button onclick="doExport('exercises')" style="padding:7px 20px; background:#0f172a; color:white; border:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer;">⬇ Xuất tất cả</button>
                </div>
              </div>
            </div>'''

if OLD_EXPORT_CARD1 in html:
    # Also change the 3-col grid to 1-col since card1 is now full width
    html = html.replace(OLD_EXPORT_CARD1, NEW_EXPORT_CARD1)
    # Fix grid — keep other cards in their own row
    html = html.replace(
        '<div style="display:grid; grid-template-columns:repeat(3,1fr); gap:16px; margin-bottom:24px;">',
        '<div style="display:grid; grid-template-columns:1fr; gap:16px; margin-bottom:24px;">'
    )
    print('✅ admin export card1 replaced')
else:
    print('❌ card1 not found')

with open('public/admin.html', 'w', encoding='utf-8') as f:
    f.write(html)
