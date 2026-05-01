import sys
import os

# Define the route code clearly
ROUTE_CODE = """
app.get('/api/submission-formats', async (req, res) => {
  try {
    const useExt = String(process.env.USE_EXTERNAL_DB) === '1';
    if (!useExt) return res.json([]);
    const config = {
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      server: process.env.DB_HOST,
      database: process.env.DB_NAME,
      options: { encrypt: false, trustServerCertificate: true }
    };
    const mssql = require('mssql');
    await mssql.connect(config);
    const result = await mssql.query("SELECT * FROM DINHDANG_NOPBAI");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
"""

file_server = 'server.js'
with open(file_server, 'r', encoding='utf-8') as f:
    content = f.read()

# Remove any existing versions of this route
import re
content = re.sub(r"app\.get\('/api/submission-formats'.*?\}\);", "", content, flags=re.DOTALL)

# Insert it early
marker = "app.use(express.json());"
content = content.replace(marker, marker + "\n" + ROUTE_CODE)

with open(file_server, 'w', encoding='utf-8') as f:
    f.write(content)

# Cache busting
file_lecturer = 'public/lecturer.html'
with open(file_lecturer, 'r', encoding='utf-8') as f:
    l_content = f.read()
l_content = l_content.replace('styles.css', 'styles.css?v=2')
l_content = l_content.replace('app.js?v=2', 'app.js?v=3')
with open(file_lecturer, 'w', encoding='utf-8') as f:
    f.write(l_content)

print("Done")
