import sys
import os

file_path = 'server.js'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Move the submission-formats route to the absolute top of the routes
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
    content = content.replace(route_code, "")

# Insert it right after app.use(cors()) or very early
insertion_point = "const app = express();"
content = content.replace(insertion_point, insertion_point + "\n\n" + route_code)

# 2. Fix Lecturer Name Join (Use MaGiangVien column)
# The current query uses gv.HoTen as TenGiangVien
# Let's ensure the mapping uses it correctly.
# I'll check if the query has bt.MaGiangVien and gv.HoTen.
# Wait, let's look at the mapping logic I wrote earlier.

# 3. Fix the name (MaBaiTap) display issue
# I suspect the row property might be case-sensitive or different.
# I will make the mapping more defensive.

old_mapping = "if (!exercisesMap[exId].name && row.MaBaiTap) exercisesMap[exId].name = row.MaBaiTap;"
new_mapping = "if (!exercisesMap[exId].name && (row.MaBaiTap || row.mabaitap)) exercisesMap[exId].name = row.MaBaiTap || row.mabaitap;"
content = content.replace(old_mapping, new_mapping)

with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print("Done")
