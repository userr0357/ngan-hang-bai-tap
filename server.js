const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const multer = require('multer');
const ExcelJS = require('exceljs');
const jwt = require('jsonwebtoken');
const mssql = require('mssql');

const JWT_SECRET = process.env.JWT_SECRET || 'change-me-to-secure-secret';

// ==================================================
//  FILE PATHS + AUTO CREATE IF NOT EXIST
// ==================================================
const DB_PATH = path.join(__dirname, 'db.json');
const LECTURERS_PATH = path.join(__dirname, 'lecturers.json');
const UPLOAD_DIR = path.join(__dirname, 'uploads');
const BACKUP_DIR = path.join(__dirname, 'backups');

// create needed files/folders
if (!fs.existsSync(DB_PATH)) fs.writeFileSync(DB_PATH, '[]', 'utf8');
if (!fs.existsSync(LECTURERS_PATH)) fs.writeFileSync(LECTURERS_PATH, '[]', 'utf8');

if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR);
if (!fs.existsSync(BACKUP_DIR)) fs.mkdirSync(BACKUP_DIR);

const upload = multer({ dest: UPLOAD_DIR });

const app = express();

// ==================================================
//  CORS CONFIG
// ==================================================
const FRONTEND_URL = process.env.FRONTEND_URL || '';

if (FRONTEND_URL) {
  app.use(cors({ origin: FRONTEND_URL, credentials: true }));
} else {
  app.use(cors());
}

app.use(express.json());

// ==================================================
//  PROTECT LECTURER STATIC FILES
// ==================================================
app.use((req, res, next) => {
  const protectedPaths = ['/lecturer.html', '/lecturer-new.html', '/lecturer-app.js', '/lecturer-new.js', '/lecturer-app.bundle.js'];

  try {
    const p = req.path;

    if (protectedPaths.includes(p) || p.startsWith('/lecturer/')) {
      let token = null;

      const authHeader = req.headers.authorization || '';
      if (authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];

      if (!token) {
        const cookieHeader = req.headers.cookie || '';
        const m = cookieHeader.match(/(?:^|; )token=([^;]+)/);
        if (m) token = decodeURIComponent(m[1]);
      }

      if (!token) {
        if ((req.headers.accept || '').includes('text/html')) return res.redirect('/login');
        return res.status(401).json({ error: 'Authentication required' });
      }

      try {
        jwt.verify(token, JWT_SECRET);
        return next();
      } catch (err) {
        if ((req.headers.accept || '').includes('text/html')) return res.redirect('/login');
        return res.status(401).json({ error: 'Invalid token' });
      }
    }
  } catch (err) {}

  next();
});

// serve static files
app.use(express.static(path.join(__dirname, 'public')));

// ==================================================
//  DB HELPERS
// ==================================================
function readDB() {
  return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
}

function writeDB(data) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(BACKUP_DIR, `db.${timestamp}.json`);
    if (fs.existsSync(DB_PATH)) fs.copyFileSync(DB_PATH, backupPath);
  } catch (err) {
    console.warn('Backup failed:', err.message);
  }

  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function readLecturers() {
  return JSON.parse(fs.readFileSync(LECTURERS_PATH, 'utf8'));
}

// difficulty rules
const diffOrder = { 'Dễ': 0, 'Trung bình': 1, 'Khó': 2, 'De': 0, 'Trung binh': 1, 'KHo': 2 };

// ==================================================
// EXTERNAL DB (weights) HELPERS - optional, feature-flagged
// ==================================================
const USE_EXTERNAL_DB = process.env.USE_EXTERNAL_DB === '1' || !!process.env.DB_HOST;
const _weightsCache = { ts: 0, ttl: 1000 * 60 * 5, data: null };

// feature flag + cache for merged subjects endpoint
const ENABLE_SUBJECTS_WITH_WEIGHTS = process.env.ENABLE_SUBJECTS_WITH_WEIGHTS !== '0';
const SUBJECTS_WITH_WEIGHTS_TTL = Number(process.env.SUBJECTS_WITH_WEIGHTS_TTL_MS) || 60 * 1000;
const _subjectsWithWeightsCache = { ts: 0, ttl: SUBJECTS_WITH_WEIGHTS_TTL, data: null };

async function loadWeightsFromSql() {
  if (!USE_EXTERNAL_DB) {
    // if external DB usage not enabled, try to load local snapshot file if present
    try {
      const p = path.join(__dirname, 'tieuchi_check.json');
      if (fs.existsSync(p)) {
        const arr = JSON.parse(fs.readFileSync(p, 'utf8'));
        const mapLocal = {};
        for (const row of arr) {
          const key = String(row.MaDangBai || '').trim();
          if (!mapLocal[key]) mapLocal[key] = [];
          mapLocal[key].push({ id: row.Id, name: row.TenTieuChi, order: row.ThuTu, points: row.TrongSo });
        }
        for (const k of Object.keys(mapLocal)) mapLocal[k].sort((a,b)=> (a.order||0)-(b.order||0));
        _weightsCache.ts = Date.now();
        _weightsCache.data = mapLocal;
        return mapLocal;
      }
    } catch (e) {
      console.warn('loadWeightsFromLocal error', e && e.message ? e.message : e);
    }
    return {};
  }
  const now = Date.now();
  if (_weightsCache.data && (now - _weightsCache.ts) < _weightsCache.ttl) return _weightsCache.data;

  const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT || 1433),
    options: { encrypt: false, trustServerCertificate: true },
    pool: { max: 5, min: 0, idleTimeoutMillis: 30000 }
  };

  try {
    await mssql.connect(config);
    const req = new mssql.Request();
    const q = `SELECT Id, MaDangBai, TenTieuChi, ThuTu, TrongSo FROM TIEUCHI_DANGBAI ORDER BY MaDangBai, ThuTu`;
    const r = await req.query(q);
    const rows = r.recordset || [];
    // build map by MaDangBai
    const map = {};
    for (const row of rows) {
      const key = String(row.MaDangBai || row.MaDangBai === 0 ? row.MaDangBai : '').trim();
      if (!map[key]) map[key] = [];
      map[key].push({ id: row.Id, name: row.TenTieuChi, order: row.ThuTu, points: row.TrongSo });
    }
    // ensure order
    for (const k of Object.keys(map)) map[k].sort((a,b)=> (a.order||0)-(b.order||0));
    _weightsCache.ts = Date.now();
    _weightsCache.data = map;
    return map;
  } catch (err) {
    console.warn('loadWeightsFromSql error', err && err.message ? err.message : err);
    try { await mssql.close(); } catch(e){}
    // fallback to local snapshot if available
    try {
      const p = path.join(__dirname, 'tieuchi_check.json');
      if (fs.existsSync(p)) {
        const arr = JSON.parse(fs.readFileSync(p, 'utf8'));
        const mapLocal = {};
        for (const row of arr) {
          const key = String(row.MaDangBai || '').trim();
          if (!mapLocal[key]) mapLocal[key] = [];
          mapLocal[key].push({ id: row.Id, name: row.TenTieuChi, order: row.ThuTu, points: row.TrongSo });
        }
        for (const k of Object.keys(mapLocal)) mapLocal[k].sort((a,b)=> (a.order||0)-(b.order||0));
        _weightsCache.ts = Date.now();
        _weightsCache.data = mapLocal;
        return mapLocal;
      }
    } catch (e) { console.warn('fallback local load error', e && e.message ? e.message : e); }
    return {};
  }
}

function normalizeCriteriaServer(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.flatMap(g => {
      if (typeof g === 'string') return [{ name: g, points: 0 }];
      if (typeof g === 'object') {
        if (g.tieu_chi && Array.isArray(g.tieu_chi)) return g.tieu_chi.map(s => ({ name: s, points: 0 }));
        return [{ name: g.name || g.tieu_chi || '(Không tên)', points: g.points || 0 }];
      }
      return [{ name: String(g), points: 0 }];
    });
  }
  if (typeof raw === 'object') {
    if (raw.tieu_chi && Array.isArray(raw.tieu_chi)) return raw.tieu_chi.map(s => ({ name: s, points: 0 }));
    if (raw.name) return [{ name: raw.name, points: raw.points || 0 }];
    return [];
  }
  return [];
}

function mergeWeightsIntoSubjectsCopy(dbCopy, weightsMap) {
  if (!dbCopy || !Array.isArray(dbCopy)) return dbCopy;
  for (const subject of dbCopy) {
    if (!subject.forms) continue;
    for (const form of subject.forms) {
      const formKey = String(form.form_id || '').trim();
      const weights = weightsMap && weightsMap[formKey] ? weightsMap[formKey] : null;
      // normalize form-level criteria first
      form.grading_criteria = normalizeCriteriaServer(form.grading_criteria || []);
      if (weights && weights.length && (!form.grading_criteria || !form.grading_criteria.length)) {
        // if form has no criteria, populate from weights
        form.grading_criteria = weights.map(w => ({ name: w.name || '', points: w.points || 0 }));
      } else if (weights && weights.length && form.grading_criteria.length) {
        // try to merge by index
        const merged = form.grading_criteria.map((g, idx) => ({ name: g.name || '', points: (weights[idx] && weights[idx].points) ? weights[idx].points : (g.points || 0) }));
        form.grading_criteria = merged;
      }

      // exercises
      if (!form.exercises || !Array.isArray(form.exercises)) continue;
      for (const ex of form.exercises) {
        const norm = normalizeCriteriaServer(ex.grading_criteria || []);
        if (weights && weights.length) {
          if (norm.length === 0) {
            // use weights as form-level criteria for this exercise
            ex.grading_criteria = weights.map(w => ({ name: w.name || '', points: w.points || 0 }));
          } else if (norm.length === weights.length) {
            ex.grading_criteria = norm.map((g, idx) => ({ name: g.name || '', points: (weights[idx] && weights[idx].points) ? weights[idx].points : (g.points || 0) }));
          } else {
            // lengths differ: attempt positional merge up to min length, keep remaining names with 0 points
            const minL = Math.min(norm.length, weights.length);
            const merged = [];
            for (let i=0;i<minL;i++) merged.push({ name: norm[i].name || weights[i].name || '', points: weights[i].points || (norm[i].points||0) });
            if (norm.length > minL) for (let i=minL;i<norm.length;i++) merged.push({ name: norm[i].name || '', points: norm[i].points || 0 });
            else if (weights.length > minL) for (let i=minL;i<weights.length;i++) merged.push({ name: weights[i].name || '', points: weights[i].points || 0 });
            ex.grading_criteria = merged;
          }
        } else {
          // no weights available; keep normalized criteria
          ex.grading_criteria = norm;
        }
      }
    }
  }
  return dbCopy;
}

// ==================================================
//  ROUTES
// ==================================================
app.get('/api/subjects', async (req, res) => {
  try {
    const db = readDB();
    // Always attempt to load weights (from external DB or local snapshot).
    // If none found, return raw DB to avoid changing behavior.
    const weights = await loadWeightsFromSql();
    if (!weights || Object.keys(weights).length === 0) return res.json(db);
    const copy = JSON.parse(JSON.stringify(db));
    const merged = mergeWeightsIntoSubjectsCopy(copy, weights);
    return res.json(merged);
  } catch (err) {
    console.warn('subjects merge error', err && err.message ? err.message : err);
    return res.json(readDB());
  }
});

app.get('/api/subject/:id', async (req, res) => {
  try {
    const db = readDB();
    const sub = db.find(s => s.subject_id === req.params.id);
    if (!sub) return res.status(404).json({ error: 'Not found' });
    // Try to load weights (external DB or local snapshot). If none, return raw subject.
    const weights = await loadWeightsFromSql();
    if (!weights || Object.keys(weights).length === 0) return res.json(sub);
    const copy = JSON.parse(JSON.stringify(sub));
    const merged = mergeWeightsIntoSubjectsCopy([copy], weights);
    return res.json(merged[0]);
  } catch (err) {
    console.warn('subject merge error', err && err.message ? err.message : err);
    const db = readDB();
    const sub = db.find(s => s.subject_id === req.params.id);
    if (!sub) return res.status(404).json({ error: 'Not found' });
    return res.json(sub);
  }
});

// merged subjects endpoint (read-only merge of weights into subjects)
app.get('/api/subjects-with-weights', async (req, res) => {
  if (!ENABLE_SUBJECTS_WITH_WEIGHTS) return res.status(404).json({ error: 'Not enabled' });
  try {
    const now = Date.now();
    if (_subjectsWithWeightsCache.data && (now - _subjectsWithWeightsCache.ts) < _subjectsWithWeightsCache.ttl) {
      return res.json(_subjectsWithWeightsCache.data);
    }

    const db = readDB();
    const weights = await loadWeightsFromSql();

    let out;
    if (!weights || Object.keys(weights).length === 0) {
      out = db; // no weights available, return raw DB
    } else {
      const copy = JSON.parse(JSON.stringify(db));
      out = mergeWeightsIntoSubjectsCopy(copy, weights);
    }

    _subjectsWithWeightsCache.data = out;
    _subjectsWithWeightsCache.ts = Date.now();
    return res.json(out);
  } catch (err) {
    console.warn('/api/subjects-with-weights error', err && err.message ? err.message : err);
    return res.status(500).json(readDB());
  }
});

// admin dry-run report: list forms with weights found and counts
app.get('/api/admin/weights-match-report', auth, async (req, res) => {
  try {
    const db = readDB();
    const weights = await loadWeightsFromSql();
    const report = [];
    for (const subject of db) {
      for (const form of subject.forms || []) {
        const key = String(form.form_id || '').trim();
        const w = weights && weights[key] ? weights[key] : [];
        const formNorm = normalizeCriteriaServer(form.grading_criteria || []);
        report.push({ subject_id: subject.subject_id, form_id: form.form_id, form_name: form.name, weights_count: (w||[]).length, form_criteria_count: (formNorm||[]).length });
      }
    }
    res.json({ success: true, use_external_db: !!USE_EXTERNAL_DB, report });
  } catch (err) {
    console.error('weights-match-report error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================================================
//  LOGIN (SET COOKIE TOKEN)
// ==================================================
app.post('/api/lecturer/login', (req, res) => {
  const { name, password, lecturer_id } = req.body;
  const lecturers = readLecturers();

  // Allow login by lecturer_id + password. If client provided a name, prefer server's stored name.
  const found = lecturers.find(l => l.lecturer_id === lecturer_id && l.password === password);

  // legacy: if not found by id/password, try full match (name+id+password) for backward compatibility
  if (!found) {
    const legacy = lecturers.find(l => l.lecturer_id === lecturer_id && l.name === name && l.password === password);
    if (legacy) found = legacy;
  }

  if (!found) return res.status(401).json({ error: 'Invalid credentials' });

  const token = jwt.sign(
    { lecturer_id: found.lecturer_id, name: found.name },
    JWT_SECRET,
    { expiresIn: '8h' }
  );

  const cookieOpts = {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 8 * 3600 * 1000
  };

  if (process.env.NODE_ENV === 'production') cookieOpts.secure = true;

  res.cookie('token', token, cookieOpts);
  res.json({ success: true, lecturer: { lecturer_id: found.lecturer_id, name: found.name } });
});

// ==================================================
//  AUTH MIDDLEWARE
// ==================================================
function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  let token = null;

  if (authHeader.startsWith('Bearer ')) token = authHeader.split(' ')[1];

  if (!token) {
    const cookieHeader = req.headers.cookie || '';
    const m = cookieHeader.match(/(?:^|; )token=([^;]+)/);
    if (m) token = decodeURIComponent(m[1]);
  }

  if (!token) return res.status(401).json({ error: 'No token provided' });

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}

// ==================================================
//  EXERCISE CRUD
// ==================================================
app.post('/api/exercise', auth, upload.array('files'), (req, res) => {
  try {
    const payload = req.body;
    const db = readDB();

    const subject = db.find(s => s.subject_id === payload.subject_id);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    const form = subject.forms.find(f => f.form_id === payload.form_id);
    if (!form) return res.status(404).json({ error: 'Form not found' });

    const exercise = JSON.parse(payload.exercise);

    // record owner (lecturer) for permission checks
    try {
      if (req.user && req.user.lecturer_id) exercise.owner = req.user.lecturer_id;
    } catch (e) {}

    // add created_at timestamp for new exercises if not provided
    if (!exercise.created_at) exercise.created_at = new Date().toISOString();

    if (req.files && req.files.length) {
      exercise.attached_files = req.files.map(f => ({
        originalname: f.originalname,
        filename: path.basename(f.path)
      }));
    } else {
      exercise.attached_files = exercise.attached_files || [];
    }

    form.exercises.push(exercise);

    form.exercises.sort((a, b) => {
      const da = diffOrder[a.difficulty] ?? 1;
      const dbb = diffOrder[b.difficulty] ?? 1;
      if (da !== dbb) return da - dbb;
      return (a.id || '').localeCompare(b.id || '');
    });

    form.exercise_count = form.exercises.length;
    subject.total_exercises = subject.forms.reduce(
      (s, f) => s + (f.exercise_count || f.exercises.length || 0),
      0
    );

    writeDB(db);
    res.json({ success: true, subject });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// update
app.put('/api/exercise/:id', auth, upload.array('files'), (req, res) => {
  try {
    const id = req.params.id;
    const updated = req.body.exercise ? JSON.parse(req.body.exercise) : req.body;

    const db = readDB();
    let found = false;

    for (const subject of db) {
      for (const form of subject.forms) {
        const idx = form.exercises.findIndex(e => e.id === id);
        if (idx !== -1) {
          const ex = form.exercises[idx];
          // permission: only owner may edit (if owner set)
          if (ex.owner && req.user && ex.owner !== req.user.lecturer_id) {
            return res.status(403).json({ error: 'Forbidden' });
          }
          const merged = { ...ex, ...updated };

          // preserve original created_at if present; if merged has no created_at, keep existing or set now
          if (!merged.created_at) merged.created_at = ex.created_at || new Date().toISOString();

          if (req.files?.length) {
            merged.attached_files = (merged.attached_files || []).concat(
              req.files.map(f => ({
                originalname: f.originalname,
                filename: path.basename(f.path)
              }))
            );
          }

          form.exercises[idx] = merged;
          form.exercises.sort(
            (a, b) => (diffOrder[a.difficulty] ?? 1) - (diffOrder[b.difficulty] ?? 1)
          );

          form.exercise_count = form.exercises.length;
          subject.total_exercises = subject.forms.reduce(
            (s, f) => s + (f.exercise_count || f.exercises.length || 0),
            0
          );

          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (!found) return res.status(404).json({ error: 'Exercise not found' });

    writeDB(db);
    res.json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// delete
app.delete('/api/exercise/:id', auth, (req, res) => {
  const id = req.params.id;
  const db = readDB();

  let removed = false;

  for (const subject of db) {
    for (const form of subject.forms) {
      const idx = form.exercises.findIndex(e => e.id === id);

      if (idx !== -1) {
        // permission: only owner may delete (if owner set)
        const ex = form.exercises[idx];
        if (ex.owner && req.user && ex.owner !== req.user.lecturer_id) return res.status(403).json({ error: 'Forbidden' });
        form.exercises.splice(idx, 1);

        form.exercise_count = form.exercises.length;
        subject.total_exercises = subject.forms.reduce(
          (s, f) => s + (f.exercise_count || f.exercises.length || 0),
          0
        );

        removed = true;
        break;
      }
    }

    if (removed) break;
  }

  if (!removed) return res.status(404).json({ error: 'Not found' });

  writeDB(db);
  res.json({ success: true });
});

// ==================================================
//  EXPORT EXCEL
// ==================================================
app.get('/api/export', auth, async (req, res) => {
  const subject_id = req.query.subject_id;

  // optional filters: since (ISO date) to export only exercises created after this time
  // and form_ids (comma-separated) to export only specific form types
  const since = req.query.since ? new Date(req.query.since) : null;
  const formIds = req.query.form_ids ? req.query.form_ids.split(',').map(s=>s.trim()).filter(Boolean) : null;
  // optional explicit exercise ids (comma-separated) to export specific exercises
  const exIds = req.query.exercise_ids ? req.query.exercise_ids.split(',').map(s=>s.trim()).filter(Boolean) : null;

  const db = readDB();
  const subject = db.find(s => s.subject_id === subject_id);

  if (!subject) return res.status(404).json({ error: 'Subject not found' });

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(subject.subject_name || subject_id);

  sheet.columns = [
    { header: 'Form ID', key: 'form_id', width: 10 },
    { header: 'Form Name', key: 'form_name', width: 20 },
    { header: 'Exercise ID', key: 'id', width: 20 },
    { header: 'Title', key: 'title', width: 40 },
    { header: 'Difficulty', key: 'difficulty', width: 12 },
    { header: 'Submission Format', key: 'submission_format', width: 20 },
    { header: 'Description', key: 'description', width: 40 },
    { header: 'Requirements', key: 'requirements', width: 30 },
    { header: 'Grading Criteria', key: 'grading_criteria', width: 30 },
    { header: 'Attached Files', key: 'attached_files', width: 30 },
    { header: 'Created At', key: 'created_at', width: 20 }
  ];

  for (const form of subject.forms) {
    if (formIds && formIds.length && !formIds.includes(form.form_id)) continue;
    for (const ex of form.exercises) {
      // if explicit exercise ids provided, only include those
      if (exIds && exIds.length && !exIds.includes(ex.id)) continue;
      if (since) {
        if (!ex.created_at) continue;
        const d = new Date(ex.created_at);
        if (isNaN(d.getTime()) || d < since) continue;
      }
      sheet.addRow({
        form_id: form.form_id,
        form_name: form.name,
        id: ex.id,
        title: ex.title,
        difficulty: ex.difficulty,
        submission_format: ex.submission_format
        ,
        description: ex.description || '',
        requirements: Array.isArray(ex.requirements) ? ex.requirements.join(' | ') : (ex.requirements || ''),
        grading_criteria: Array.isArray(ex.grading_criteria) ? ex.grading_criteria.join(' | ') : (ex.grading_criteria || ''),
        attached_files: Array.isArray(ex.attached_files) ? ex.attached_files.map(f=>f.originalname||f.filename||'').join(', ') : (ex.attached_files||'') ,
        created_at: ex.created_at || ''
      });
    }
  }

  res.setHeader(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  );

  res.setHeader(
    'Content-Disposition',
    `attachment; filename="${subject_id}-exercises.xlsx"`
  );

  await workbook.xlsx.write(res);
  res.end();
});

// ==================================================
//  LOGOUT
// ==================================================
app.post('/api/lecturer/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ success: true });
});

// ==================================================
//  EXPORT INLINE (export exercises provided in request body)
// ==================================================
app.post('/api/export-inline', auth, async (req, res) => {
  try {
    const { exercises, subject_id } = req.body;
    if (!Array.isArray(exercises) || !exercises.length) return res.status(400).json({ error: 'No exercises provided' });

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(subject_id || 'export');

    sheet.columns = [
      { header: 'Form ID', key: 'form_id', width: 10 },
      { header: 'Form Name', key: 'form_name', width: 20 },
      { header: 'Exercise ID', key: 'id', width: 20 },
      { header: 'Title', key: 'title', width: 40 },
      { header: 'Difficulty', key: 'difficulty', width: 12 },
      { header: 'Submission Format', key: 'submission_format', width: 20 },
      { header: 'Description', key: 'description', width: 40 },
      { header: 'Requirements', key: 'requirements', width: 30 },
      { header: 'Grading Criteria', key: 'grading_criteria', width: 30 },
      { header: 'Attached Files', key: 'attached_files', width: 30 },
      { header: 'Created At', key: 'created_at', width: 20 }
    ];

    for (const ex of exercises) {
      sheet.addRow({
        form_id: ex.form_id || '',
        form_name: ex.form_name || '',
        id: ex.id || '',
        title: ex.title || '',
        difficulty: ex.difficulty || '',
        submission_format: ex.submission_format || '',
        description: ex.description || '',
        requirements: Array.isArray(ex.requirements) ? ex.requirements.join(' | ') : (ex.requirements || ''),
        grading_criteria: Array.isArray(ex.grading_criteria) ? ex.grading_criteria.join(' | ') : (ex.grading_criteria || ''),
        attached_files: Array.isArray(ex.attached_files) ? ex.attached_files.map(f=>f.originalname||f.filename||'').join(', ') : (ex.attached_files||''),
        created_at: ex.created_at || ''
      });
    }

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${subject_id || 'export'}-exercises.xlsx"`);
    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('export-inline error', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ==================================================
//  LECTURER ME
// ==================================================
app.get('/api/lecturer/me', auth, (req, res) => {
  res.json({ lecturer_id: req.user.lecturer_id, name: req.user.name });
});

// ==================================================
//  SERVE LECTURER PAGE
// ==================================================
app.get('/lecturer', auth, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'lecturer.html'));
});

// serve login page (friendly URL)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// fallback for SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// export app for Vercel (optional)
module.exports = app;

// ==================================================
//  START SERVER (for Render)
// ==================================================
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}
