async function test() {
  const loginRes = await fetch('http://localhost:3000/api/lecturer/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lecturer_id: 'ADMIN00', password: 'admin123' })
  });
  const cookie = loginRes.headers.get('set-cookie');
  const token = cookie.match(/token=([^;]+)/)[1];
  const h = { Authorization: 'Bearer ' + token };

  const tests = [
    ['/api/admin/exercises?page=1&limit=3', 'exercises'],
    ['/api/admin/stats/distribution', 'distribution'],
    ['/api/admin/students?page=1&limit=3', 'students'],
    ['/api/admin/student/122001101/history', 'student-history'],
    ['/api/admin/lecturers', 'lecturers'],
    ['/api/admin/stats/skill-levels', 'skill-levels'],
    ['/api/admin/students/classes', 'classes'],
  ];

  for (const [url, name] of tests) {
    try {
      const r = await fetch('http://localhost:3000' + url, { headers: h });
      const d = await r.json();
      const summary = JSON.stringify(d).substring(0, 150);
      console.log(`✅ ${name} (${r.status}): ${summary}...`);
    } catch (e) { console.log(`❌ ${name}: ${e.message}`); }
  }
}
test();
