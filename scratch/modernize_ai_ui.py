import sys
import os

file_path = 'public/ai-features.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Update checkExerciseDuplicateContent rendering
old_dup_render = """    resultDiv.innerHTML = `
      <div style="padding:12px; background:${bgColor}; border:1px solid ${borderColor}; border-radius:6px; font-size:13px; color:#1e293b;">
        <div style="font-weight:bold; margin-bottom:4px;">${icon} Độ tương đồng: ${result.similarity_score}%</div>
        <div style="margin-bottom:4px; font-weight:500;">${result.message}</div>
        ${result.duplicate_reason ? `<div style="margin-top:6px; padding:6px; background:rgba(0,0,0,0.05); border-radius:4px;"><strong>Lý do trùng:</strong> ${result.duplicate_reason}</div>` : ''}
        ${result.matched_exercise ? `<div style="font-size:12px; color:#c2410c; margin-top:6px;"><strong>Bài trùng nhất:</strong> ${result.matched_exercise}</div>` : ''}
      </div>
    `;"""

new_dup_render = """    let cardClass = 'ai-result-success';
    if (result.similarity_score > 80) cardClass = 'ai-result-danger';
    else if (result.similarity_score > 50) cardClass = 'ai-result-warning';

    resultDiv.innerHTML = `
      <div class="ai-result-card ${cardClass}">
        <div style="font-weight:bold; margin-bottom:8px; display:flex; align-items:center; gap:8px; font-size:16px;">
          <span>${icon}</span> 
          <span>Độ tương đồng: ${result.similarity_score}%</span>
        </div>
        <div style="margin-bottom:12px; font-size:15px; border-bottom:1px solid rgba(0,0,0,0.1); padding-bottom:8px;">${result.message}</div>
        
        ${result.matched_exercise ? `
          <div style="margin-bottom:8px;">
            <strong>📍 Bài trùng nhất:</strong> 
            <span style="display:block; padding:4px 8px; background:rgba(0,0,0,0.05); border-radius:4px; margin-top:4px;">${result.matched_exercise}</span>
          </div>` : ''}
          
        ${result.duplicate_reason ? `
          <div style="margin-bottom:8px;">
            <strong>🔍 Điểm tương đồng:</strong> 
            <p style="margin:4px 0 0 0; padding:8px; background:rgba(0,0,0,0.05); border-radius:4px;">${result.duplicate_reason}</p>
          </div>` : ''}
      </div>
    `;"""

content = content.replace(old_dup_render, new_dup_render)

# Update validateExerciseContent rendering
old_val_render = """    resultDiv.innerHTML = `
      <div style="padding:12px; background:${bgColor}; border:1px solid ${borderColor}; border-radius:6px; font-size:13px; color:#1e293b;">
        <div style="font-weight:bold; margin-bottom:4px;">${icon} ${result.status === 'valid' ? 'Hợp lệ' : (result.status === 'warning' ? 'Cần chú ý' : 'Không đạt')}</div>
        <div style="margin-bottom:4px;">${result.feedback}</div>
        ${result.suggestions ? `<div style="font-size:12px; color:#475569;"><strong>Gợi ý:</strong> ${result.suggestions.join(', ')}</div>` : ''}
      </div>
    `;"""

new_val_render = """    let cardClass = 'ai-result-success';
    if (result.status === 'invalid') cardClass = 'ai-result-danger';
    else if (result.status === 'warning') cardClass = 'ai-result-warning';

    resultDiv.innerHTML = `
      <div class="ai-result-card ${cardClass}">
        <div style="font-weight:bold; margin-bottom:8px; display:flex; align-items:center; gap:8px; font-size:16px;">
          <span>${icon}</span> 
          <span>${result.status === 'valid' ? 'Hợp lệ' : (result.status === 'warning' ? 'Cần chú ý' : 'Không đạt')}</span>
        </div>
        <div style="margin-bottom:12px; border-bottom:1px solid rgba(0,0,0,0.1); padding-bottom:8px;">${result.feedback}</div>
        ${result.suggestions ? `
          <div>
            <strong>💡 Gợi ý cải thiện:</strong>
            <ul style="margin:8px 0 0 0; padding-left:20px;">
              ${result.suggestions.map(s => `<li style="margin-bottom:4px;">${s}</li>`).join('')}
            </ul>
          </div>` : ''}
      </div>
    `;"""

content = content.replace(old_val_render, new_val_render)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
