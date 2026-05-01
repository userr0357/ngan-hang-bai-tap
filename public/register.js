const form = document.getElementById('register-form');
const err = document.getElementById('reg-error');
const succ = document.getElementById('reg-success');
const btn = document.getElementById('reg-btn');

if (form) form.onsubmit = async (e) => {
  e.preventDefault();
  err.style.display = 'none';
  succ.style.display = 'none';
  btn.disabled = true;
  btn.textContent = 'Đang xử lý...';
  
  const fd = new FormData(form);
  const payload = Object.fromEntries(fd.entries());
  
  try {
    const res = await fetch('/api/lecturer/register', { 
      method: 'POST', 
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify(payload)
    });
    
    const json = await res.json();
    
    if (!res.ok) {
      err.textContent = json.error || 'Đăng ký thất bại'; 
      err.style.display = 'block';
    } else {
      succ.textContent = 'Đăng ký th công! Bạn có thể đăng nhập ngay bây giờ.'; 
      succ.style.display = 'block';
      form.reset();
    }
  } catch (e) {
    err.textContent = 'Lỗi kết nối tới máy chủ'; 
    err.style.display = 'block';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Đăng ký ngay';
  }
};
