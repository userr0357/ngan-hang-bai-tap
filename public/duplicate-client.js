// client-side logic for duplicates

async function loadDuplicatesSection() {
    try {
        const btn = document.getElementById('btn-start-scan');
        if (btn && window.location.pathname.includes('admin')) {
            btn.style.display = 'flex';
        }

        const res = await fetch('/api/duplicate/reports', { credentials: 'include' });
        if (!res.ok) throw new Error('Failed to load reports');
        const data = await res.json();
        const tbody = document.getElementById('duplicates-tbody');
        if (!tbody) return;
        
        if (data.reports.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" style="padding:20px;text-align:center;color:var(--text-muted);">🎉 Tuyệt vời! Không có bài tập nào nghi ngờ sao chép.</td></tr>';
        } else {
            // Cần lưu reports vào biến toàn cục để modal dùng
            window.currentDuplicateReports = data.reports;
            
            tbody.innerHTML = data.reports.map(r => {
                let scoreColor = r.SimilarityScore >= 90 ? '#ef4444' : '#f59e0b';
                let scoreBadge = `<span style="background:${scoreColor}20;color:${scoreColor};padding:4px 8px;border-radius:6px;font-weight:700;font-size:14px;">${r.SimilarityScore}%</span>`;
                
                return `
                <tr style="border-bottom:1px solid var(--border-color);">
                    <td style="padding:14px;">${scoreBadge}<br><span style="font-size:12px;color:var(--text-muted);">${r.DetectedBy}</span></td>
                    <td style="padding:14px;">
                        <div style="font-weight:600;color:var(--text-main);margin-bottom:4px;">${r.TenA}</div>
                        <div style="font-size:12px;color:var(--text-muted);">GV: ${r.GVA}</div>
                    </td>
                    <td style="padding:14px;">
                        <div style="font-weight:600;color:var(--text-main);margin-bottom:4px;">${r.TenB}</div>
                        <div style="font-size:12px;color:var(--text-muted);">GV: ${r.GVB}</div>
                    </td>
                    <td style="padding:14px;">
                        <button onclick="openDuplicateModal(${r.ReportId})" style="background:var(--bg-color);border:1px solid var(--border-color);padding:6px 12px;border-radius:6px;cursor:pointer;color:var(--text-main);font-weight:600;font-size:13px;">👁 Đối soát</button>
                    </td>
                </tr>
                `;
            }).join('');
        }
        
    } catch (e) {
        console.error(e);
        const tbody = document.getElementById('duplicates-tbody');
        if (tbody) tbody.innerHTML = '<tr><td colspan="4" style="padding:20px;text-align:center;color:red;">Lỗi tải dữ liệu.</td></tr>';
    }
    
    // Tải lịch sử ngay sau khi tải xong phần PENDING
    loadDuplicateHistory();
}

async function startDuplicateScan() {
    if (!confirm("Bắt đầu quét chéo toàn hệ thống? Quá trình này có thể mất vài giây đến vài phút.")) return;
    
    const btn = document.getElementById('btn-start-scan');
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = '⏳ Đang quét...';
    }
    
    try {
        const res = await fetch('/api/duplicate/scan', { method: 'POST', credentials: 'include' });
        const data = await res.json();
        if (res.ok) {
            alert(`Quét hoàn tất! Đã kiểm tra ${data.totalChecked} bài. Phát hiện thêm ${data.duplicatesFound} trường hợp nghi ngờ.`);
            loadDuplicatesSection();
        } else {
            alert('Lỗi quét: ' + data.error);
        }
    } catch (e) {
        alert('Lỗi kết nối.');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = '<svg width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg> Quét Toàn Hệ Thống';
        }
    }
}

function openDuplicateModal(reportId) {
    const report = window.currentDuplicateReports.find(r => r.ReportId === reportId);
    if (!report) return;
    
    document.getElementById('current-dup-report-id').value = reportId;
    document.getElementById('dup-score').innerText = report.SimilarityScore + '%';
    
    // Method text
    const methodEl = document.getElementById('dup-method');
    if (methodEl) {
        if (report.DetectedBy === 'ALGORITHM') {
            methodEl.innerHTML = '⚙️ HardHash<br><span style="font-size:9px;color:#9ca3af;font-weight:400;">Trùng lặp 100%</span>';
        } else {
            methodEl.innerHTML = '🧠 GROQ AI<br><span style="font-size:9px;color:#9ca3af;font-weight:400;">Phân tích ngữ nghĩa</span>';
        }
    }
    
    // Format Date helper
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('vi-VN') + ' ' + d.toLocaleTimeString('vi-VN', {hour: '2-digit', minute:'2-digit'});
    };
    
    // Check Original vs Copy
    const timeA = new Date(report.UpdatedA || 0).getTime();
    const timeB = new Date(report.UpdatedB || 0).getTime();
    const isAOriginal = timeA <= timeB;
    
    const badgeA = document.getElementById('dup-a-badge');
    const badgeB = document.getElementById('dup-b-badge');
    if (badgeA) {
        badgeA.innerText = isAOriginal ? 'Bản Gốc (Bài A)' : 'Bản Sao (Bài A)';
        badgeA.style.color = isAOriginal ? '#16a34a' : '#dc2626';
    }
    if (badgeB) {
        badgeB.innerText = (!isAOriginal) ? 'Bản Gốc (Bài B)' : 'Bản Sao (Bài B)';
        badgeB.style.color = (!isAOriginal) ? '#16a34a' : '#dc2626';
    }

    // Fill A
    document.getElementById('dup-a-title').innerText = report.TenA;
    document.getElementById('dup-a-gv').innerText = 'GV: ' + report.GVA;
    document.getElementById('dup-a-summary').innerText = report.SumA || '(Chưa phân tích tóm tắt)';
    const ctxA = document.getElementById('dup-a-context');
    if (ctxA) {
        ctxA.innerHTML = `<span style="background:#e0e7ff;padding:2px 6px;border-radius:4px;">Môn: ${report.MonA || '?'}</span>
                          <span style="background:#e0e7ff;padding:2px 6px;border-radius:4px;">Độ khó: ${report.DoKhoA || '?'}</span>
                          <span style="background:#e0e7ff;padding:2px 6px;border-radius:4px;">Cập nhật: ${formatDate(report.UpdatedA)}</span>`;
    }
    const rawA = document.getElementById('dup-a-raw');
    if (rawA) rawA.innerText = (report.MoTaA || '') + '\n\nYêu cầu:\n' + (report.YeuCauA || '');
    
    // Fill B
    document.getElementById('dup-b-title').innerText = report.TenB;
    document.getElementById('dup-b-gv').innerText = 'GV: ' + report.GVB;
    document.getElementById('dup-b-summary').innerText = report.SumB || '(Chưa phân tích tóm tắt)';
    const ctxB = document.getElementById('dup-b-context');
    if (ctxB) {
        ctxB.innerHTML = `<span style="background:#fee2e2;padding:2px 6px;border-radius:4px;">Môn: ${report.MonB || '?'}</span>
                          <span style="background:#fee2e2;padding:2px 6px;border-radius:4px;">Độ khó: ${report.DoKhoB || '?'}</span>
                          <span style="background:#fee2e2;padding:2px 6px;border-radius:4px;">Cập nhật: ${formatDate(report.UpdatedB)}</span>`;
    }
    const rawB = document.getElementById('dup-b-raw');
    if (rawB) rawB.innerText = (report.MoTaB || '') + '\n\nYêu cầu:\n' + (report.YeuCauB || '');
    
    // Keywords
    function renderKw(kwStr) {
        try {
            let arr = JSON.parse(kwStr);
            if (!Array.isArray(arr)) arr = [];
            return arr.map(k => `<span style="background:#e2e8f0;color:#334155;padding:2px 8px;border-radius:12px;font-size:12px;font-weight:600;">${k}</span>`).join('');
        } catch(e) { return ''; }
    }
    
    document.getElementById('dup-a-kw').innerHTML = renderKw(report.KwA);
    document.getElementById('dup-b-kw').innerHTML = renderKw(report.KwB);
    
    // Highlight logic (simple word matching)
    if (rawA && rawB) {
        const textA = rawA.innerText;
        const textB = rawB.innerText;
        // This could be enhanced with diff-match-patch. For now we just show the raw text as requested, 
        // Admin can visually compare. If we want red/black text, we can use a basic diff.
    }
    
    document.getElementById('duplicate-modal').style.display = 'flex';
}

function closeDuplicateModal() {
    document.getElementById('duplicate-modal').style.display = 'none';
}

async function handleDuplicateAction(action) {
    const reportId = document.getElementById('current-dup-report-id').value;
    if (!reportId) return;
    
    const actionName = action === 'MERGE' ? 'GỘP BÀI (Xóa Bài B)' : 'HỢP LỆ (Bỏ qua)';
    if (!confirm(`Bạn có chắc chắn muốn thực hiện hành động: ${actionName}?`)) return;
    
    try {
        const res = await fetch(`/api/duplicate/reports/${reportId}/action`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            credentials: 'include',
            body: JSON.stringify({ action })
        });
        
        if (res.ok) {
            closeDuplicateModal();
            loadDuplicatesSection(); // Refresh
        } else {
            const data = await res.json();
            alert('Lỗi: ' + data.error);
        }
    } catch(e) {
        alert('Lỗi kết nối');
    }
}

async function loadDuplicateHistory() {
    try {
        const res = await fetch('/api/duplicate/reports/history', { credentials: 'include' });
        if (!res.ok) {
            const err = await res.text();
            document.getElementById('duplicate-history-tbody').innerHTML = `<tr><td colspan="5" style="color:red">Lỗi server: ${err}</td></tr>`;
            return;
        }
        const data = await res.json();
        const tbody = document.getElementById('duplicate-history-tbody');
        if (!tbody) return;
        
        if (!data.history || data.history.length === 0) {
            tbody.innerHTML = '<tr><td colspan="5" style="padding:20px;text-align:center;color:var(--text-muted);">Chưa có lịch sử đối soát nào.</td></tr>';
            return;
        }
        
        tbody.innerHTML = data.history.map(r => {
            let statusBadge = r.Status === 'MERGED' 
                ? `<span style="background:#fee2e2;color:#dc2626;padding:4px 8px;border-radius:6px;font-weight:700;font-size:12px;">🗑 Đã Gộp (Xóa B)</span>`
                : `<span style="background:#dcfce7;color:#16a34a;padding:4px 8px;border-radius:6px;font-weight:700;font-size:12px;">✅ Hợp lệ (Bỏ qua)</span>`;
                
            let scoreColor = r.SimilarityScore >= 90 ? '#ef4444' : '#f59e0b';
            let scoreBadge = `<span style="background:${scoreColor}20;color:${scoreColor};padding:4px 8px;border-radius:6px;font-weight:700;font-size:13px;">${r.SimilarityScore}%</span>`;
            
            return `
            <tr style="border-bottom:1px solid var(--border-color);">
                <td style="padding:14px;">${statusBadge}</td>
                <td style="padding:14px;">${scoreBadge}<br><span style="font-size:11px;color:var(--text-muted);">${r.DetectedBy === 'ALGORITHM' ? 'HardHash' : 'GROQ AI'}</span></td>
                <td style="padding:14px;">
                    <div style="font-weight:600;color:var(--text-main);margin-bottom:4px;">${r.TenA}</div>
                    <div style="font-size:12px;color:var(--text-muted);">GV: ${r.GVA}</div>
                </td>
                <td style="padding:14px;">
                    <div style="font-weight:600;color:${r.Status === 'MERGED' ? '#9ca3af;text-decoration:line-through;' : 'var(--text-main);'};margin-bottom:4px;">${r.TenB}</div>
                    <div style="font-size:12px;color:var(--text-muted);">GV: ${r.GVB}</div>
                </td>
                <td style="padding:14px;">
                    <button onclick="restoreDuplicateReport(${r.ReportId})" style="background:transparent;border:1px solid #10b981;padding:6px 12px;border-radius:6px;cursor:pointer;color:#10b981;font-weight:600;font-size:12px;transition:0.2s;">
                        ↺ Khôi phục
                    </button>
                </td>
            </tr>
            `;
        }).join('');
    } catch (e) {
        console.error(e);
        const tbody = document.getElementById('duplicate-history-tbody');
        if (tbody) tbody.innerHTML = `<tr><td colspan="5" style="color:red">Lỗi tải dữ liệu: ${e.message}</td></tr>`;
    }
}

async function restoreDuplicateReport(reportId) {
    if (!confirm("Khôi phục lại quyết định này? (Bài B sẽ được đưa trở lại danh sách nếu đã bị xóa gộp)")) return;
    try {
        const res = await fetch(`/api/duplicate/reports/${reportId}/restore`, { method: 'POST', credentials: 'include' });
        if (res.ok) {
            loadDuplicatesSection(); // Refresh both tables
        } else {
            const data = await res.json();
            alert('Lỗi: ' + data.error);
        }
    } catch(e) {
        alert('Lỗi kết nối');
    }
}
