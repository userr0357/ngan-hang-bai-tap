async function test() {
  // Login as admin
  const loginRes = await fetch('http://localhost:3000/api/lecturer/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lecturer_id: 'ADMIN00', password: 'admin123' })
  });
  console.log('Login status:', loginRes.status);
  const loginData = await loginRes.json();
  console.log('Login:', JSON.stringify(loginData));
  
  const cookie = loginRes.headers.get('set-cookie');
  if (!cookie) { console.log('No cookie!'); return; }
  const token = cookie.match(/token=([^;]+)/)[1];
  const headers = { Authorization: 'Bearer ' + token };
  
  // Test admin endpoints
  const endpoints = [
    '/api/admin/exercises',
    '/api/admin/lecturers',
    '/api/admin/subjects',
    '/api/admin/stats/distribution',
    '/api/admin/exercise-activity'
  ];
  
  for (const ep of endpoints) {
    try {
      const r = await fetch('http://localhost:3000' + ep, { headers });
      const contentType = r.headers.get('content-type') || '';
      if (contentType.includes('json')) {
        const data = await r.json();
        console.log(ep, '→', r.status, Array.isArray(data) ? data.length + ' items' : JSON.stringify(data).substring(0, 100));
      } else {
        const text = await r.text();
        console.log(ep, '→', r.status, 'NOT JSON! First 80 chars:', text.substring(0, 80));
      }
    } catch (e) { console.log(ep, '→ ERROR:', e.message); }
  }
}
test();
