// login page script
const form = document.getElementById('login-page-form');
const back = document.getElementById('login-back');
const err = document.getElementById('login-error');
if (back) back.onclick = () => { location.href = '/'; };
if (form) form.onsubmit = async (e) => {
  e.preventDefault();
  err.style.display = 'none';
  const fd = new FormData(form);
  const payload = { password: fd.get('password'), lecturer_id: fd.get('lecturer_id') };
  try {
    const res = await fetch('/api/lecturer/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload), credentials: 'include' });
    if (!res.ok) {
      let msg = 'Đăng nhập thất bại';
      try { const j = await res.json(); msg = j.error || msg; } catch(_) { msg = await res.text().catch(()=>msg)||msg; }
      err.textContent = msg; err.style.display='block'; return;
    }

    // on success, server sets HttpOnly cookie — check role then redirect
    try {
      const me = await fetch('/api/lecturer/me', { credentials: 'include' });
      if (me.ok) {
        const user = await me.json();
        if (user && user.is_admin) {
          location.href = '/admin.html';
          return;
        }
      }
    } catch (_) {}
    location.href = '/lecturer';

  } catch (e) {
    err.textContent = 'Lỗi kết nối'; err.style.display='block';
  }
};
