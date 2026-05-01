import sys
import os

file_path = 'server.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Add submission-formats API
anchor = "// ==================================================\n//  API: GET EXERCISES FROM DATABASE (BAITAP)"
new_api = """app.get('/api/submission-formats', async (req, res) => {
  try {
    if (!USE_EXTERNAL_DB) return res.json([]);
    const config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      server: process.env.DB_HOST,
      database: process.env.DB_NAME,
      options: { encrypt: false, trustServerCertificate: true }
    };
    await mssql.connect(config);
    const result = await mssql.query("SELECT * FROM DINHDANG_NOPBAI");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// =================================================="""
content = content.replace(anchor, new_api + "\n" + anchor.split('\n')[1])

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)
print("Done")
