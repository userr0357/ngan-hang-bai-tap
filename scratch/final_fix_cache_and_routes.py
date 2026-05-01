import sys
import os

# 1. Update admin.html cache bust
file_admin = 'public/admin.html'
if os.path.exists(file_admin):
    with open(file_admin, 'r', encoding='utf-8') as f:
        content = f.read()
    content = content.replace('<script src="/app.js"></script>', '<script src="/app.js?v=2"></script>')
    content = content.replace('<script src="/admin.js"></script>', '<script src="/admin.js?v=2"></script>')
    with open(file_admin, 'w', encoding='utf-8') as f:
        f.write(content)

# 2. Move API routes higher in server.js
file_server = 'server.js'
if os.path.exists(file_server):
    with open(file_server, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the submission-formats route and the place to move it (before catch-all)
    # Actually, I'll move it right after the middleware definitions
    route_code = """app.get('/api/submission-formats', async (req, res) => {
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
});"""

    if route_code in content:
        content = content.replace(route_code, "") # Remove it from its current position
        # Insert it after the login route
        login_marker = "app.post('/api/login', (req, res) => {"
        # We need to find the end of the login route
        # For simplicity, let's just insert it after the app.use(express.json()) call
        marker = "app.use(express.static(path.join(__dirname, 'public')));"
        content = content.replace(marker, marker + "\n\n" + route_code)

    with open(file_server, 'w', encoding='utf-8') as f:
        f.write(content)

print("Done")
