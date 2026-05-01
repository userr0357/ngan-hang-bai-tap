"""Redesign login, register, forgot pages with professional look + full dark mode"""
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

# Shared auth page CSS
AUTH_STYLE = '''  <style>
    body { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg-color); padding: 20px; }
    .auth-wrap { width: 100%; max-width: 420px; position: relative; }
    .auth-card {
      background: var(--card-bg); border: 1px solid var(--border-color);
      border-radius: 20px; padding: 36px 32px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.1);
    }
    .auth-logo { text-align: center; margin-bottom: 28px; }
    .auth-logo-icon { width: 52px; height: 52px; background: var(--primary); border-radius: 14px; display: inline-flex; align-items: center; justify-content: center; font-size: 26px; margin-bottom: 12px; box-shadow: 0 8px 20px rgba(99,102,241,0.35); }
    .auth-logo h1 { font-size: 22px; font-weight: 800; color: var(--text-main); margin: 0; }
    .auth-logo p { font-size: 13px; color: var(--text-muted); margin: 4px 0 0; }
    .form-label { font-size: 13px; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; display: block; }
    .form-input {
      width: 100%; padding: 11px 14px; border: 1.5px solid var(--border-color);
      border-radius: 10px; font-size: 14px; font-family: inherit;
      background: var(--bg-color); color: var(--text-main);
      transition: border-color 0.2s, box-shadow 0.2s; outline: none; box-sizing: border-box;
    }
    .form-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px var(--primary-light); }
    .form-group { margin-bottom: 18px; }
    .btn-auth {
      width: 100%; padding: 13px; border: none; border-radius: 10px;
      background: var(--primary); color: white; font-size: 15px; font-weight: 700;
      cursor: pointer; font-family: inherit; transition: all 0.2s; margin-top: 8px;
    }
    .btn-auth:hover { background: var(--primary-hover); transform: translateY(-1px); box-shadow: 0 6px 18px rgba(99,102,241,0.35); }
    .auth-links { display: flex; justify-content: space-between; margin-top: 18px; font-size: 13px; }
    .auth-links a { color: var(--primary); text-decoration: none; font-weight: 600; }
    .auth-links a:hover { text-decoration: underline; }
    .auth-back { display: block; text-align: center; margin-top: 14px; font-size: 13px; color: var(--text-muted); text-decoration: none; }
    .auth-back:hover { color: var(--primary); }
    .auth-error { color: var(--danger); margin-top: 14px; font-size: 13px; font-weight: 500; padding: 10px 14px; background: var(--danger-light); border-radius: 8px; display: none; }
    .theme-float { position: fixed; top: 16px; right: 16px; z-index: 100; }
  </style>'''

TOGGLE_BTN = '''    <div class="theme-float">
      <button class="theme-toggle-btn" data-theme-btn="" title="Chuyển sang tối" onclick="toggleDarkMode()"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg></button>
    </div>'''

# ─── login.html ───
LOGIN = f'''<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Đăng nhập — Ngân Hàng Bài Tập</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <script>if(localStorage.getItem("theme")==="dark")document.body.classList.add("dark-mode")</script>
{AUTH_STYLE}
</head>
<body>
{TOGGLE_BTN}
  <div class="auth-wrap">
    <div class="auth-card">
      <div class="auth-logo">
        <div class="auth-logo-icon">📚</div>
        <h1>Đăng Nhập</h1>
        <p>Hệ thống Ngân Hàng Bài Tập</p>
      </div>
      <form id="login-page-form">
        <div class="form-group">
          <label class="form-label" for="login-lecturer-id">Mã giảng viên</label>
          <input id="login-lecturer-id" class="form-input" name="lecturer_id" required placeholder="Ví dụ: ADMIN00, GV01" />
        </div>
        <div class="form-group">
          <label class="form-label" for="login-password">Mật khẩu</label>
          <input id="login-password" class="form-input" name="password" type="password" required placeholder="Nhập mật khẩu" />
        </div>
        <button type="submit" class="btn-auth">🔐 Đăng nhập an toàn</button>
        <div class="auth-links">
          <a href="/forgot.html">Quên mật khẩu?</a>
          <a href="/register.html">Đăng ký tài khoản</a>
        </div>
        <a href="/" class="auth-back">← Quay lại Trang Sinh viên</a>
      </form>
      <div id="login-error" class="auth-error"></div>
    </div>
  </div>
  <script src="/dark-mode.js"></script>
  <script src="/login.js"></script>
</body>
</html>'''

# ─── register.html ───
with open('public/register.js', 'r', encoding='utf-8') as f:
    rjs_check = f.read()
# Check what fields register form has
import re
fields = re.findall(r'id="([^"]+)"', rjs_check)

REGISTER = f'''<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Đăng ký — Ngân Hàng Bài Tập</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <script>if(localStorage.getItem("theme")==="dark")document.body.classList.add("dark-mode")</script>
{AUTH_STYLE}
</head>
<body>
{TOGGLE_BTN}
  <div class="auth-wrap">
    <div class="auth-card">
      <div class="auth-logo">
        <div class="auth-logo-icon">📚</div>
        <h1>Đăng Ký</h1>
        <p>Tạo tài khoản giảng viên mới</p>
      </div>
      <form id="register-form">
        <div class="form-group">
          <label class="form-label" for="reg-id">Mã giảng viên</label>
          <input id="reg-id" class="form-input" name="lecturer_id" required placeholder="VD: GV10" />
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-name">Họ và tên</label>
          <input id="reg-name" class="form-input" name="name" required placeholder="Nguyễn Văn A" />
        </div>
        <div class="form-group">
          <label class="form-label" for="reg-password">Mật khẩu</label>
          <input id="reg-password" class="form-input" name="password" type="password" required placeholder="Ít nhất 6 ký tự" />
        </div>
        <button type="submit" class="btn-auth">✅ Tạo tài khoản</button>
        <div class="auth-links">
          <a href="/login">Đã có tài khoản? Đăng nhập</a>
        </div>
        <a href="/" class="auth-back">← Quay lại Trang Sinh viên</a>
      </form>
      <div id="register-error" class="auth-error"></div>
      <div id="register-success" style="color:var(--success);margin-top:14px;font-size:13px;font-weight:600;padding:10px 14px;background:var(--success-light);border-radius:8px;display:none;"></div>
    </div>
  </div>
  <script src="/dark-mode.js"></script>
  <script src="/register.js"></script>
</body>
</html>'''

# ─── forgot.html ───
FORGOT = f'''<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Quên mật khẩu — Ngân Hàng Bài Tập</title>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
  <script>if(localStorage.getItem("theme")==="dark")document.body.classList.add("dark-mode")</script>
{AUTH_STYLE}
</head>
<body>
{TOGGLE_BTN}
  <div class="auth-wrap">
    <div class="auth-card">
      <div class="auth-logo">
        <div class="auth-logo-icon">🔑</div>
        <h1>Quên mật khẩu</h1>
        <p>Nhập mã giảng viên để đặt lại mật khẩu</p>
      </div>
      <form id="forgot-form">
        <div class="form-group">
          <label class="form-label" for="forgot-id">Mã giảng viên</label>
          <input id="forgot-id" class="form-input" name="lecturer_id" required placeholder="VD: GV01" />
        </div>
        <div class="form-group">
          <label class="form-label" for="forgot-new-pass">Mật khẩu mới</label>
          <input id="forgot-new-pass" class="form-input" name="new_password" type="password" required placeholder="Ít nhất 6 ký tự" />
        </div>
        <button type="submit" class="btn-auth">🔄 Đặt lại mật khẩu</button>
        <a href="/login" class="auth-back">← Quay lại Đăng nhập</a>
      </form>
      <div id="forgot-msg" class="auth-error" style="display:none;"></div>
    </div>
  </div>
  <script src="/dark-mode.js"></script>
  <script src="/forgot.js"></script>
</body>
</html>'''

for path, content in [
    ('public/login.html', LOGIN),
    ('public/register.html', REGISTER),
    ('public/forgot.html', FORGOT),
]:
    with open(path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'✅ {path} rewritten')
