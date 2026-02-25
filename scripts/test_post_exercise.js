const http = require('http');

function requestJson(path, data) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(data);
    const opts = {
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body)
      }
    };

    const req = http.request(opts, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve({ statusCode: res.statusCode, headers: res.headers, body: raw });
      });
    });

    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function postMultipart(path, fields, cookie) {
  return new Promise((resolve, reject) => {
    const boundary = '----WebKitFormBoundary' + Math.random().toString(16).slice(2);
    const parts = [];
    for (const k of Object.keys(fields)) {
      parts.push(`--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${fields[k]}\r\n`);
    }
    parts.push(`--${boundary}--\r\n`);
    const body = parts.join('');

    const opts = {
      hostname: 'localhost',
      port: 3000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data; boundary=' + boundary,
        'Content-Length': Buffer.byteLength(body),
      }
    };
    if (cookie) opts.headers['Cookie'] = cookie;

    const req = http.request(opts, res => {
      const chunks = [];
      res.on('data', c => chunks.push(c));
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: Buffer.concat(chunks).toString('utf8') }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  try {
    console.log('Logging in...');
    const login = await requestJson('/api/lecturer/login', { lecturer_id: 'GV002', password: 'gv002pass' });
    console.log('Login status:', login.statusCode);
    if (login.statusCode !== 200) { console.log('Login body:', login.body); return; }
    const setCookie = login.headers['set-cookie'];
    const cookie = Array.isArray(setCookie) ? setCookie.map(s=>s.split(';')[0]).join('; ') : (setCookie || '').split(';')[0];
    console.log('Received cookie:', cookie);

    const exercise = JSON.stringify({ id: 'TST_' + Date.now(), title: 'Test upload', description: 'desc', difficulty: 'Dễ', submission_format: 'PDF' });
    console.log('Posting multipart /api/exercise with exercise payload:', exercise);
    const res = await postMultipart('/api/exercise', { subject_id: 'NMLT', exercise }, cookie);
    console.log('POST status:', res.statusCode);
    console.log('Response headers:', res.headers);
    console.log('Response body:', res.body);
  } catch (err) {
    console.error('Error:', err);
  }
})();
