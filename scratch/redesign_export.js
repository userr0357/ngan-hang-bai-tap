const fs = require('fs');
let h = fs.readFileSync('public/lecturer.html', 'utf8');

const oldStart = h.indexOf('<div id="section-export"');
const oldEnd = h.indexOf('<!-- Feedback Section -->');
if (oldStart === -1 || oldEnd === -1) { console.log('Section not found!', oldStart, oldEnd); process.exit(1); }

const newSection = `<div id="section-export" class="section-lecturer" style="display:none">
        <!-- Header -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:20px;flex-wrap:wrap;gap:12px">
          <div style="display:flex;align-items:center;gap:12px">
            <span style="font-size:28px">📤</span>
            <div>
              <h2 style="margin:0;font-size:22px;font-weight:800;color:var(--text-main,#1e293b)">Xuất Báo Cáo Bài Tập</h2>
              <p style="margin:2px 0 0;font-size:14px;color:var(--text-muted,#64748b)">Lọc và chọn bài tập để xuất Excel hoặc JSON</p>
            </div>
          </div>
          <div style="display:flex;gap:8px">
            <button onclick="exportSelectedExcel()" id="btn-export-excel" style="display:flex;align-items:center;gap:6px;padding:10px 18px;background:linear-gradient(135deg,#16a34a,#22c55e);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(22,163,74,.25);transition:transform .1s" onmouseenter="this.style.transform='translateY(-1px)'" onmouseleave="this.style.transform=''">📊 Xuất Excel</button>
            <button onclick="exportSelectedJSON()" id="btn-export-json" style="display:flex;align-items:center;gap:6px;padding:10px 18px;background:linear-gradient(135deg,#2563eb,#3b82f6);color:#fff;border:none;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;box-shadow:0 2px 8px rgba(37,99,235,.25);transition:transform .1s" onmouseenter="this.style.transform='translateY(-1px)'" onmouseleave="this.style.transform=''">📄 Xuất JSON</button>
          </div>
        </div>

        <!-- Stats Bar -->
        <div id="export-stats-bar" style="display:flex;gap:12px;margin-bottom:16px;flex-wrap:wrap">
          <div style="flex:1;min-width:140px;background:linear-gradient(135deg,#6366f1,#818cf8);border-radius:12px;padding:14px 16px;color:#fff">
            <div style="font-size:11px;font-weight:600;opacity:.8">Tổng bài tập</div>
            <div id="export-stat-total" style="font-size:24px;font-weight:800">0</div>
          </div>
          <div style="flex:1;min-width:140px;background:linear-gradient(135deg,#10b981,#34d399);border-radius:12px;padding:14px 16px;color:#fff">
            <div style="font-size:11px;font-weight:600;opacity:.8">Đã chọn</div>
            <div id="export-stat-selected" style="font-size:24px;font-weight:800">0</div>
          </div>
          <div style="flex:1;min-width:140px;background:linear-gradient(135deg,#f59e0b,#fbbf24);border-radius:12px;padding:14px 16px;color:#fff">
            <div style="font-size:11px;font-weight:600;opacity:.8">Dạng bài</div>
            <div id="export-stat-forms" style="font-size:24px;font-weight:800">0</div>
          </div>
          <div style="flex:1;min-width:140px;background:linear-gradient(135deg,#ef4444,#f87171);border-radius:12px;padding:14px 16px;color:#fff">
            <div style="font-size:11px;font-weight:600;opacity:.8">Môn học</div>
            <div id="export-stat-subjects" style="font-size:24px;font-weight:800">0</div>
          </div>
        </div>

        <!-- Filters -->
        <div style="background:var(--card-bg,#fff);border:1px solid var(--border-color,#e2e8f0);border-radius:12px;padding:14px 16px;margin-bottom:16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap">
          <input type="text" id="export-search" placeholder="🔍 Tìm kiếm bài tập..." style="flex:1;min-width:200px;padding:9px 14px;border:1.5px solid var(--border-color,#e2e8f0);border-radius:9px;font-size:13px;font-family:inherit;background:var(--bg-color,#f8fafc);color:var(--text-main);outline:none" oninput="filterExportList()">
          <select id="export-filter-form" onchange="filterExportList()" style="padding:8px 12px;border:1.5px solid var(--border-color,#e2e8f0);border-radius:9px;font-size:13px;font-family:inherit;background:var(--card-bg);color:var(--text-main);cursor:pointer;outline:none">
            <option value="">Tất cả dạng bài</option>
          </select>
          <select id="export-filter-diff" onchange="filterExportList()" style="padding:8px 12px;border:1.5px solid var(--border-color,#e2e8f0);border-radius:9px;font-size:13px;font-family:inherit;background:var(--card-bg);color:var(--text-main);cursor:pointer;outline:none">
            <option value="">Tất cả độ khó</option>
            <option value="Dễ">Dễ</option>
            <option value="Trung bình">Trung bình</option>
            <option value="Khó">Khó</option>
          </select>
          <select id="export-filter-level" onchange="filterExportList()" style="padding:8px 12px;border:1.5px solid var(--border-color,#e2e8f0);border-radius:9px;font-size:13px;font-family:inherit;background:var(--card-bg);color:var(--text-main);cursor:pointer;outline:none">
            <option value="">Tất cả level</option>
            <option value="1">Level 1</option>
            <option value="2">Level 2</option>
            <option value="3">Level 3</option>
            <option value="4">Level 4</option>
            <option value="5">Level 5</option>
          </select>
          <button onclick="clearExportFilters()" style="padding:8px 14px;border:1.5px solid var(--border-color,#e2e8f0);border-radius:9px;background:none;font-size:13px;color:var(--text-muted);cursor:pointer;font-family:inherit" onmouseenter="this.style.background='#fee2e2';this.style.color='#dc2626'" onmouseleave="this.style.background='';this.style.color='var(--text-muted)'">✕ Xóa lọc</button>
        </div>

        <!-- Select All Bar -->
        <div style="background:var(--card-bg,#fff);border:1px solid var(--border-color,#e2e8f0);border-radius:12px;padding:10px 16px;margin-bottom:16px;display:flex;justify-content:space-between;align-items:center">
          <label style="display:flex;align-items:center;gap:8px;cursor:pointer;font-size:14px;font-weight:600;color:var(--text-main)">
            <input type="checkbox" id="export-select-all" onchange="toggleSelectAllExport(this.checked)" style="width:18px;height:18px;accent-color:#6366f1;cursor:pointer">
            Chọn tất cả bài tập hiển thị
          </label>
          <span id="export-selection-info" style="font-size:13px;color:var(--text-muted)">0 bài đã chọn</span>
        </div>

        <!-- Exercise List -->
        <div style="background:var(--card-bg,#fff);border:1px solid var(--border-color,#e2e8f0);border-radius:12px;overflow:hidden">
          <table style="width:100%;border-collapse:collapse">
            <thead style="position:sticky;top:0;background:var(--bg-color,#f8fafc);z-index:1">
              <tr style="border-bottom:2px solid var(--border-color,#e2e8f0)">
                <th style="padding:12px 14px;width:40px"></th>
                <th style="padding:12px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Mã bài</th>
                <th style="padding:12px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Tên bài tập</th>
                <th style="padding:12px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Dạng bài</th>
                <th style="padding:12px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Độ khó</th>
                <th style="padding:12px 14px;text-align:center;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Level</th>
                <th style="padding:12px 14px;text-align:left;font-size:11px;font-weight:700;color:var(--text-muted);text-transform:uppercase;letter-spacing:.5px">Môn học</th>
              </tr>
            </thead>
            <tbody id="export-exercises-tbody">
              <tr><td colspan="7" style="text-align:center;padding:40px;color:var(--text-muted)">Đang tải danh sách bài tập...</td></tr>
            </tbody>
          </table>
        </div>
        <div id="export-status" style="margin-top:12px;font-size:13px;color:var(--text-muted)"></div>
      </div>

      `;

h = h.substring(0, oldStart) + newSection + h.substring(oldEnd);
fs.writeFileSync('public/lecturer.html', h, 'utf8');
console.log('✅ Export section HTML replaced!');
