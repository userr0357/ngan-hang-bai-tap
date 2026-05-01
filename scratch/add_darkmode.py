import re, sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Theme toggle button HTML (SVG moon icon)
TOGGLE_BTN = '<button class="theme-toggle-btn" data-theme-btn="" title="Chuyển sang tối" onclick="toggleDarkMode()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></button>'

DARK_SCRIPT = '  <script src="/dark-mode.js"></script>\n'
PRELOAD_INLINE = '<script>if(localStorage.getItem("theme")==="dark")document.documentElement.classList.add("dark-mode-preload")</script>\n'

def add_dark_mode_to_file(path, has_existing_toggle=False, toggle_insertion=None):
    with open(path, 'r', encoding='utf-8') as f:
        c = f.read()

    changed = False

    # 1. Add preload script right after <html> tag (flash prevention)
    if 'dark-mode-preload' not in c:
        c = re.sub(r'(<html[^>]*>)', r'\1\n' + PRELOAD_INLINE.strip(), c, count=1)
        changed = True

    # 2. Add dark-mode.js before closing </body>
    if '/dark-mode.js' not in c:
        c = c.replace('</body>', DARK_SCRIPT + '</body>')
        changed = True

    # 3. Add toggle button if insertion point given
    if toggle_insertion and TOGGLE_BTN not in c:
        old, new = toggle_insertion
        if old in c:
            c = c.replace(old, new)
            changed = True
        else:
            print(f'  ⚠️  toggle insertion point NOT found in {path}')

    if changed:
        with open(path, 'w', encoding='utf-8') as f:
            f.write(c)
        print(f'✅ {path}')
    else:
        print(f'⏭️  {path} — already up to date')

# ─── index.html (student page) ───
# Already has #theme-toggle — just ensure dark-mode.js is included
# Fix the existing theme-toggle to use our class
def fix_index():
    with open('public/index.html', 'r', encoding='utf-8') as f:
        c = f.read()

    # Replace old plain toggle
    old_toggle = '<button id="theme-toggle" title="Toggle light/dark">◐</button>'
    new_toggle = TOGGLE_BTN
    if old_toggle in c:
        c = c.replace(old_toggle, new_toggle)

    # Add preload
    if 'dark-mode-preload' not in c:
        c = re.sub(r'(<html[^>]*>)', r'\1\n  ' + PRELOAD_INLINE.strip(), c, count=1)

    # Add dark-mode.js before app.js
    if '/dark-mode.js' not in c:
        c = c.replace('<script src="/app.js">', DARK_SCRIPT + '  <script src="/app.js">')

    with open('public/index.html', 'w', encoding='utf-8') as f:
        f.write(c)
    print('✅ public/index.html')

fix_index()

# ─── login.html ───
add_dark_mode_to_file(
    'public/login.html',
    toggle_insertion=(
        '<div class="login-wrapper">',
        '<div class="login-wrapper">\n    ' + TOGGLE_BTN.replace(
            'class="theme-toggle-btn"',
            'class="theme-toggle-btn" style="position:fixed;top:16px;right:16px;z-index:100;"'
        )
    )
)

# ─── register.html ───
with open('public/register.html', 'r', encoding='utf-8') as f:
    reg = f.read()
if '/dark-mode.js' not in reg:
    reg = re.sub(r'(<html[^>]*>)', r'\1\n  ' + PRELOAD_INLINE.strip(), reg, count=1)
    reg = reg.replace('</body>', DARK_SCRIPT + '</body>')
    fixed_btn = TOGGLE_BTN.replace(
        'class="theme-toggle-btn"',
        'class="theme-toggle-btn" style="position:fixed;top:16px;right:16px;z-index:100;"'
    )
    if '<div class="login-wrapper">' in reg:
        reg = reg.replace('<div class="login-wrapper">', '<div class="login-wrapper">\n    ' + fixed_btn)
    with open('public/register.html', 'w', encoding='utf-8') as f:
        f.write(reg)
    print('✅ public/register.html')

# ─── forgot.html ───
with open('public/forgot.html', 'r', encoding='utf-8') as f:
    fg = f.read()
if '/dark-mode.js' not in fg:
    fg = re.sub(r'(<html[^>]*>)', r'\1\n  ' + PRELOAD_INLINE.strip(), fg, count=1)
    fg = fg.replace('</body>', DARK_SCRIPT + '</body>')
    fixed_btn = TOGGLE_BTN.replace(
        'class="theme-toggle-btn"',
        'class="theme-toggle-btn" style="position:fixed;top:16px;right:16px;z-index:100;"'
    )
    # Insert into body
    fg = fg.replace('<body>', '<body>\n    ' + fixed_btn)
    with open('public/forgot.html', 'w', encoding='utf-8') as f:
        f.write(fg)
    print('✅ public/forgot.html')

# ─── lecturer.html — add toggle to header ───
with open('public/lecturer.html', 'r', encoding='utf-8') as f:
    lec = f.read()

if '/dark-mode.js' not in lec:
    lec = re.sub(r'(<html[^>]*>)', r'\1\n  ' + PRELOAD_INLINE.strip(), lec, count=1)
    lec = lec.replace('</body>', DARK_SCRIPT + '</body>')

# Add toggle to header area — find the h1#page-title line
if 'data-theme-btn' not in lec:
    old_header = '<h1 id="page-title">Quản lý bài tập</h1>'
    new_header = f'<h1 id="page-title">Quản lý bài tập</h1>\n        {TOGGLE_BTN}'
    if old_header in lec:
        lec = lec.replace(old_header, new_header)
        print('✅ public/lecturer.html — toggle added to header')
    else:
        print('⚠️  lecturer.html toggle insertion missed')

with open('public/lecturer.html', 'w', encoding='utf-8') as f:
    f.write(lec)

# ─── admin.html — add toggle to header ───
with open('public/admin.html', 'r', encoding='utf-8') as f:
    adm = f.read()

if '/dark-mode.js' not in adm:
    adm = re.sub(r'(<html[^>]*>)', r'\1\n  ' + PRELOAD_INLINE.strip(), adm, count=1)
    adm = adm.replace('</body>', DARK_SCRIPT + '</body>')

# Find admin header to insert toggle (look for logout button or header area)
if 'data-theme-btn' not in adm:
    # Look for a header controls div
    m = re.search(r'(<div[^>]*class="[^"]*header-controls[^"]*"[^>]*>)', adm)
    if m:
        adm = adm.replace(m.group(0), m.group(0) + '\n          ' + TOGGLE_BTN)
        print('✅ public/admin.html — toggle added to header-controls')
    else:
        # Fallback: add floating button
        adm = adm.replace('<body>', '<body>\n    ' + TOGGLE_BTN.replace(
            'class="theme-toggle-btn"',
            'class="theme-toggle-btn" style="position:fixed;top:16px;right:16px;z-index:9999;"'
        ))
        print('✅ public/admin.html — toggle added as floating button')

with open('public/admin.html', 'w', encoding='utf-8') as f:
    f.write(adm)

print('\nAll done!')
