const jwt = require('jsonwebtoken');
require('dotenv').config();
const token = jwt.sign({lecturer_id:'admin',name:'Admin',is_admin:true}, process.env.JWT_SECRET || 'my-super-secret-key-123',{expiresIn:'1h'});

async function test() {
  try {
    const r = await fetch('http://localhost:3000/api/admin/students?page=1&limit=20', {
      headers: { 'Cookie': 'token=' + token }
    });
    const text = await r.text();
    console.log('Status:', r.status);
    console.log('Response:', text.substring(0, 500));
  } catch (e) {
    console.error(e);
  }
}
test();
