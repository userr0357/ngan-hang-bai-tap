(async()=>{
  try {
    const urlBase = 'http://localhost:4000';
    const loginRes = await fetch(urlBase + '/api/lecturer/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ id: 'ADMIN001', password: 'admin123' })
    });
    console.log('login status', loginRes.status);
    const setCookie = loginRes.headers.get('set-cookie') || '';
    console.log('set-cookie:', setCookie);

    const htmlRes = await fetch(urlBase + '/lecturer.html', {
      headers: setCookie ? { Cookie: setCookie } : {}
    });
    console.log('lecturer.html status', htmlRes.status);
    const html = await htmlRes.text();
    const checks = {
      'manage-list': html.includes('id="manage-list"'),
      'req-add': html.includes('id="req-add"'),
      'grade-add': html.includes('id="grade-add"'),
      'exercise-modal': html.includes('id="exercise-modal"'),
      'exercise-form': html.includes('id="exercise-form"'),
      'requirements-list': html.includes('id="requirements-list"'),
      'grading-list': html.includes('id="grading-list"')
    };
    console.log(JSON.stringify(checks, null, 2));

    // fetch app.js
    const jsRes = await fetch(urlBase + '/app.js');
    console.log('app.js status', jsRes.status);
    const js = await jsRes.text();
    const funcs = {
      showExerciseLecturerDetail: js.includes('function showExerciseLecturerDetail'),
      addRequirementField: js.includes('function addRequirementField'),
      addGradingField: js.includes('function addGradingField'),
      getCriteriaArray: js.includes('function getCriteriaArray')
    };
    console.log(JSON.stringify(funcs, null, 2));

    // check API subjects
    const subs = await (await fetch(urlBase + '/api/subjects')).json();
    console.log('subjects count', Array.isArray(subs) ? subs.length : 'not-array');
    if (Array.isArray(subs) && subs.length) {
      const id = subs[0].subject_id;
      const sub = await (await fetch(urlBase + '/api/subject/' + encodeURIComponent(id))).json();
      console.log('subject has forms', Array.isArray(sub.forms) ? sub.forms.length : 'no-forms');
    }
  } catch (e) { console.error('ERROR', e.message || e); process.exit(1); }
})();
