const jwt = require('jsonwebtoken');
require('dotenv').config();
const token = jwt.sign({lecturer_id:'admin',name:'Admin',is_admin:true}, process.env.JWT_SECRET || 'my-super-secret-key-123',{expiresIn:'1h'});

async function test() {
  try {
    const r1 = await fetch('http://localhost:3000/api/admin/chart/login-activity', {
      headers: { 'Cookie': 'token=' + token }
    });
    const d1 = await r1.json();
    console.log('--- chart/login-activity ---');
    console.log(d1.length > 0 ? d1[0] : 'empty');
    
    if (d1.length > 0 && d1[0].date) {
        const r2 = await fetch(`http://localhost:3000/api/admin/submissions-by-date/${d1[0].date}`, {
          headers: { 'Cookie': 'token=' + token }
        });
        const d2 = await r2.json();
        console.log(`\n--- submissions-by-date/${d1[0].date} ---`);
        console.log(d2.length > 0 ? d2[0] : 'empty');
    }
  } catch (e) {
    console.error(e);
  }
}
test();
