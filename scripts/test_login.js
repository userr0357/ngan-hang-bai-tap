(async()=>{
  const fetch = require('node-fetch');
  const base = 'http://localhost:3000';
  const payload = { name: 'Đoàn Thiện Minh', password: 'gv002pass', lecturer_id: 'GV002' };
  try {
    const res = await fetch(base + '/api/lecturer/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    console.log('login status', res.status);
    const setCookie = res.headers.get('set-cookie') || res.headers.get('Set-Cookie') || '';
    console.log('set-cookie length', setCookie.length);

    const me = await fetch(base + '/api/lecturer/me', { headers: setCookie ? { Cookie: setCookie } : {} });
    console.log('/api/lecturer/me status', me.status);
    try { console.log('me:', await me.json()); } catch (e) { console.log('me parse error', e.message); }

    const subs = await fetch(base + '/api/subjects', { headers: setCookie ? { Cookie: setCookie } : {} });
    console.log('/api/subjects status', subs.status);
    const j = await subs.json();
    console.log('subjects count', j.length);
    console.log('subject ids:', j.map(s => s.subject_id));

    const subId = j[0].subject_id;
    const sub = await (await fetch(base + '/api/subject/' + encodeURIComponent(subId), { headers: setCookie ? { Cookie: setCookie } : {} })).json();
    console.log('subject', sub.subject_id, 'forms', sub.forms.length);
    console.log('first form exercises', sub.forms[0].exercises.length);
    console.log('sample exercise grading_criteria:', sub.forms[0].exercises[0].grading_criteria);
  } catch (e) { console.error('ERROR', e.message || e); process.exit(1); }
})();