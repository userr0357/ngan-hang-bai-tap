import sys
import os

# 1. Update lecturer.html with cache busting for CSS and JS
file_lecturer = 'public/lecturer.html'
if os.path.exists(file_lecturer):
    with open(file_lecturer, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('styles.css', 'styles.css?v=2')
    content = content.replace('app.js?v=2', 'app.js?v=3') # Increment version
    with open(file_lecturer, 'w', encoding='utf-8') as f:
        f.write(content)

# 2. Fix server.js API route placement once and for all
file_server = 'server.js'
if os.path.exists(file_server):
    with open(file_server, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Remove any existing definition of the route to avoid duplicates
    new_lines = []
    skip = False
    route_to_add = """
app.get('/api/submission-formats', async (req, res) => {
  try {
    if (!process.env.USE_EXTERNAL_DB || process.env.USE_EXTERNAL_DB === '0') return res.json([]);
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
    for line in lines:
        if "app.get('/api/submission-formats'" in line:
            skip = True
            continue
        if skip and "});" in line:
            skip = False
            continue
        if not skip:
            new_lines.append(line)
    
    # Insert the route before the static file protection middleware (around line 80)
    insertion_idx = 0
    for i, line in enumerate(new_lines):
        if "app.use((req, res, next) => {" in line:
            insertion_idx = i
            break
    
    if insertion_idx > 0:
        new_lines.insert(insertion_idx, route_code)
    
    with open(file_server, 'w', encoding='utf-8') as f:
        f.writelines(new_lines)

print("Done")
