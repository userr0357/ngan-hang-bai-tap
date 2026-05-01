const jwt = require('jsonwebtoken');
const token = jwt.sign({lecturer_id:'GV01',name:'Test',is_admin:true},'my-super-secret-key-123',{expiresIn:'1h'});

fetch('http://localhost:3000/api/admin/exercise-audit', {
  headers: { 'Cookie': 'token=' + token }
}).then(r => {
  console.log('Status:', r.status);
  return r.json();
}).then(d => {
  console.log('Results:', d.length);
  if (d.length) console.log('First:', JSON.stringify(d[0], null, 2));
}).catch(e => console.log('Error:', e.message));
