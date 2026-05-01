async function test() {
  const loginRes = await fetch('http://localhost:3000/api/lecturer/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lecturer_id: 'ADMIN00', password: 'admin123' })
  });
  const cookie = loginRes.headers.get('set-cookie');
  const token = cookie.match(/token=([^;]+)/)[1];
  const h = { Authorization: 'Bearer ' + token };

  // Test distribution
  const d = await fetch('http://localhost:3000/api/admin/stats/distribution', { headers: h });
  const dist = await d.json();
  console.log('Distribution:', JSON.stringify(dist, null, 2));

  // Test exercises (stats format)
  const e = await fetch('http://localhost:3000/api/admin/exercises?page=1&limit=3', { headers: h });
  const ex = await e.json();
  console.log('\nExercises stats:', JSON.stringify(ex.stats));
  console.log('Pagination:', JSON.stringify(ex.pagination));
  console.log('First item keys:', ex.data?.[0] ? Object.keys(ex.data[0]).join(', ') : 'no data');

  // Test skill levels
  const s = await fetch('http://localhost:3000/api/admin/stats/skill-levels', { headers: h });
  console.log('\nSkill levels:', JSON.stringify(await s.json()));
}
test().catch(e => console.error(e.message));
