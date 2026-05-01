"""
Fix all hardcoded colors across lecturer.html, admin.html to use CSS variables for dark mode.
Also improve login/register/forgot pages.
"""
import re, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

def replace_hardcodes(content):
    """Replace common hardcoded colors with CSS variables"""
    replacements = [
        # Backgrounds
        (r'background:\s*white([;\s"])', r'background:var(--card-bg)\1'),
        (r'background:\s*#fff([;\s"])', r'background:var(--card-bg)\1'),
        (r'background:\s*#ffffff([;\s"])', r'background:var(--card-bg)\1'),
        (r'background:\s*#f8fafc([;\s"])', r'background:var(--bg-color)\1'),
        (r'background:\s*#f1f5f9([;\s"])', r'background:var(--bg-color)\1'),
        (r'background:\s*#fdfdfd([;\s"])', r'background:var(--card-bg)\1'),
        (r'background:\s*#f9fafb([;\s"])', r'background:var(--bg-color)\1'),
        # Text colors
        (r'color:\s*#1e293b([;\s"])', r'color:var(--text-main)\1'),
        (r'color:\s*#0f172a([;\s"])', r'color:var(--text-main)\1'),
        (r'color:\s*#334155([;\s"])', r'color:var(--text-main)\1'),
        (r'color:\s*#475569([;\s"])', r'color:var(--text-muted)\1'),
        (r'color:\s*#64748b([;\s"])', r'color:var(--text-muted)\1'),
        (r'color:\s*#94a3b8([;\s"])', r'color:var(--text-muted)\1'),
        # Borders
        (r'border:\s*1px solid #e2e8f0([;\s"])', r'border:1px solid var(--border-color)\1'),
        (r'border:\s*1px solid #f1f5f9([;\s"])', r'border:1px solid var(--border-color)\1'),
        (r'border-color:\s*#e2e8f0([;\s"])', r'border-color:var(--border-color)\1'),
        (r'border-bottom:\s*1px solid #e2e8f0([;\s"])', r'border-bottom:1px solid var(--border-color)\1'),
        (r'border-top:\s*1px solid #e2e8f0([;\s"])', r'border-top:1px solid var(--border-color)\1'),
    ]
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    return content

# === Fix lecturer.html ===
with open('public/lecturer.html', 'r', encoding='utf-8') as f:
    lec = f.read()

lec_fixed = replace_hardcodes(lec)

# Count changes
orig_count = len(re.findall(r'background:\s*(white|#fff\b|#ffffff|#f8fafc|#fdfdfd)', lec))
new_count = len(re.findall(r'background:\s*(white|#fff\b|#ffffff|#f8fafc|#fdfdfd)', lec_fixed))
print(f'lecturer.html: {orig_count} hardcode backgrounds → {new_count} remaining')

with open('public/lecturer.html', 'w', encoding='utf-8') as f:
    f.write(lec_fixed)
print('✅ lecturer.html fixed')

# === Fix admin.html ===
with open('public/admin.html', 'r', encoding='utf-8') as f:
    adm = f.read()

adm_fixed = replace_hardcodes(adm)
orig_count_a = len(re.findall(r'background:\s*(white|#fff\b|#ffffff|#f8fafc|#fdfdfd)', adm))
new_count_a = len(re.findall(r'background:\s*(white|#fff\b|#ffffff|#f8fafc|#fdfdfd)', adm_fixed))
print(f'admin.html: {orig_count_a} hardcode backgrounds → {new_count_a} remaining')

with open('public/admin.html', 'w', encoding='utf-8') as f:
    f.write(adm_fixed)
print('✅ admin.html fixed')

print('\nAll done!')
