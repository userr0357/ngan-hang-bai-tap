"""
Rewrite /api/feedback routes to use dbo.FEEDBACKS SQL table instead of JSON audit file.

FEEDBACKS schema:
  Id          int NOT NULL (identity)
  BaiTapId    int NOT NULL  -- exercise numeric id (may need mapping)
  SenderId    varchar(10)   -- lecturer_id of sender
  ReceiverId  varchar(10)   -- lecturer_id of receiver (exercise owner)
  Category    nvarchar(50)  -- content/requirement/criteria/difficulty/format/spelling/knowledge/link/other
  Title       nvarchar(200) -- exercise title (denormalized for display)
  Content     nvarchar(MAX) -- feedback text
  Status      int           -- 0=new, 1=accepted, 2=resolved
  ResponseData nvarchar(MAX) -- JSON response from receiver
  CreatedAt   datetime
  UpdatedAt   datetime
  ResolvedAt  datetime
  IsRead      bit
  ReadAt      datetime
"""
import sys
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('server.js', 'r', encoding='utf-8') as f:
    sv = f.read()

# Find and replace the old feedback + new routes I added earlier
OLD_START = """app.post('/api/feedback', auth, (req, res) => {
  const { exercise_id, target_lecturer_id, content, exercise_title, category } = req.body;
  if (!content) return res.status(400).json({error: 'Nội dung trống'});
  try {
    const audit = readExerciseAudit();
    const fbId = 'FB_' + Date.now() + '_' + Math.random().toString(36).substr(2,5);
    audit.push({
      id: fbId,
      action: 'GOP_Y',
      timestamp: new Date().toISOString(),
      user: req.user.name,
      user_id: req.user.lecturer_id,
      exercise_id,
      exercise_title: exercise_title || '',
      target_lecturer_id,
      category: category || 'other',
      content,
      status: 'new'  // new | accepted | resolved
    });
    writeExerciseAudit(audit);
    res.json({ success: true, id: fbId });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// Feedback tôi đã gửi
app.get('/api/feedback/sent', auth, (req, res) => {
  try {
    const audit = readExerciseAudit();
    const sent = audit.filter(a => a.action === 'GOP_Y' && a.user_id === req.user.lecturer_id);
    sent.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(sent);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});

// Đổi trạng thái feedback
app.patch('/api/feedback/:id/status', auth, (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // accepted | resolved
  if (!['accepted','resolved'].includes(status))
    return res.status(400).json({error: 'Status không hợp lệ'});
  try {
    const audit = readExerciseAudit();
    const fb = audit.find(a => a.id === id && a.action === 'GOP_Y');
    if (!fb) return res.status(404).json({error: 'Không tìm thấy góp ý'});
    if (fb.target_lecturer_id !== req.user.lecturer_id)
      return res.status(403).json({error: 'Không có quyền'});
    fb.status = status;
    fb.status_updated_at = new Date().toISOString();
    writeExerciseAudit(audit);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});"""

# Check for old original route (before my patch)
OLD_ORIGINAL = """app.post('/api/feedback', auth, (req, res) => {
  const { exercise_id, target_lecturer_id, content, exercise_title } = req.body;
  if (!content) return res.status(400).json({error: 'Nội dung trống'});
  try {
    const audit = readExerciseAudit();
    audit.push({
      action: 'GOP_Y',
      timestamp: new Date().toISOString(),
      user: req.user.name,
      user_id: req.user.lecturer_id,
      exercise_id,
      exercise_title: exercise_title || '',
      target_lecturer_id,
      content
    });
    writeExerciseAudit(audit);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});"""

# OLD api get feedback/me (unchanged since start)
OLD_GET_ME = """app.get('/api/feedback/me', auth, (req, res) => {
  try {
    const audit = readExerciseAudit();
    const myFeedbacks = audit.filter(a => a.action === 'GOP_Y' && a.target_lecturer_id === req.user.lecturer_id);
    myFeedbacks.sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp));
    res.json(myFeedbacks);
  } catch (err) {
    res.status(500).json({error: err.message});
  }
});"""

NEW_FEEDBACK_APIS = """// ==================================================
//  FEEDBACK APIs — uses dbo.FEEDBACKS (SQL Server)
//  Status: 0=new, 1=accepted, 2=resolved
// ==================================================

// POST: Gửi góp ý
app.post('/api/feedback', auth, async (req, res) => {
  const { exercise_id, exercise_title, target_lecturer_id, category, content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ error: 'Nội dung trống' });
  try {
    const pool = await getPool();
    // BaiTapId: try to parse as int, else use 0
    const baiTapId = parseInt(exercise_id) || 0;
    const r = await pool.request()
      .input('BaiTapId',    mssql.Int,          baiTapId)
      .input('SenderId',    mssql.VarChar(10),   req.user.lecturer_id)
      .input('ReceiverId',  mssql.VarChar(10),   target_lecturer_id || '')
      .input('Category',    mssql.NVarChar(50),  category || 'other')
      .input('Title',       mssql.NVarChar(200), exercise_title || String(exercise_id || ''))
      .input('Content',     mssql.NVarChar(mssql.MAX), content.trim())
      .input('Status',      mssql.Int,           0)
      .input('IsRead',      mssql.Bit,           0)
      .query(`INSERT INTO FEEDBACKS (BaiTapId,SenderId,ReceiverId,Category,Title,Content,Status,IsRead,CreatedAt,UpdatedAt)
              OUTPUT INSERTED.Id
              VALUES (@BaiTapId,@SenderId,@ReceiverId,@Category,@Title,@Content,@Status,@IsRead,GETDATE(),GETDATE())`);
    const newId = r.recordset[0]?.Id;
    res.json({ success: true, id: newId });
  } catch (err) {
    console.error('POST /api/feedback error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET: Feedback nhận được (bài tập của tôi)
app.get('/api/feedback/me', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const r = await pool.request()
      .input('ReceiverId', mssql.VarChar(10), req.user.lecturer_id)
      .query(`SELECT f.Id as id, f.BaiTapId as exercise_id, f.Title as exercise_title,
                f.SenderId as user_id, f.ReceiverId as target_lecturer_id,
                f.Category as category, f.Content as content,
                f.Status as status_code, f.IsRead as is_read,
                f.ResponseData as response_data,
                f.CreatedAt as timestamp, f.UpdatedAt as updated_at, f.ResolvedAt as resolved_at
              FROM FEEDBACKS f
              WHERE f.ReceiverId = @ReceiverId
              ORDER BY f.CreatedAt DESC`);
    const rows = r.recordset.map(row => ({
      ...row,
      status: row.status_code === 2 ? 'resolved' : row.status_code === 1 ? 'accepted' : 'new',
      user: row.user_id
    }));
    res.json(rows);
  } catch (err) {
    console.error('GET /api/feedback/me error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// GET: Feedback đã gửi (tôi gửi)
app.get('/api/feedback/sent', auth, async (req, res) => {
  try {
    const pool = await getPool();
    const r = await pool.request()
      .input('SenderId', mssql.VarChar(10), req.user.lecturer_id)
      .query(`SELECT f.Id as id, f.BaiTapId as exercise_id, f.Title as exercise_title,
                f.SenderId as user_id, f.ReceiverId as target_lecturer_id,
                f.Category as category, f.Content as content,
                f.Status as status_code, f.IsRead as is_read,
                f.ResponseData as response_data,
                f.CreatedAt as timestamp, f.UpdatedAt as updated_at
              FROM FEEDBACKS f
              WHERE f.SenderId = @SenderId
              ORDER BY f.CreatedAt DESC`);
    const rows = r.recordset.map(row => ({
      ...row,
      status: row.status_code === 2 ? 'resolved' : row.status_code === 1 ? 'accepted' : 'new',
      user: row.user_id
    }));
    res.json(rows);
  } catch (err) {
    console.error('GET /api/feedback/sent error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PATCH: Đổi trạng thái (accepted=1, resolved=2)
app.patch('/api/feedback/:id/status', auth, async (req, res) => {
  const fbId = parseInt(req.params.id);
  const { status } = req.body;
  const statusMap = { accepted: 1, resolved: 2 };
  const statusCode = statusMap[status];
  if (statusCode === undefined) return res.status(400).json({ error: 'Status không hợp lệ. Dùng: accepted | resolved' });
  try {
    const pool = await getPool();
    // Verify ownership
    const check = await pool.request()
      .input('Id', mssql.Int, fbId)
      .input('ReceiverId', mssql.VarChar(10), req.user.lecturer_id)
      .query('SELECT Id FROM FEEDBACKS WHERE Id=@Id AND ReceiverId=@ReceiverId');
    if (!check.recordset.length) return res.status(404).json({ error: 'Không tìm thấy hoặc không có quyền' });

    await pool.request()
      .input('Id', mssql.Int, fbId)
      .input('Status', mssql.Int, statusCode)
      .input('Now', mssql.DateTime, new Date())
      .query(`UPDATE FEEDBACKS SET Status=@Status, UpdatedAt=@Now ${status==='resolved'?', ResolvedAt=@Now':''} WHERE Id=@Id`);
    res.json({ success: true });
  } catch (err) {
    console.error('PATCH /api/feedback status error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

// PATCH: Đánh dấu đã đọc
app.patch('/api/feedback/:id/read', auth, async (req, res) => {
  const fbId = parseInt(req.params.id);
  try {
    const pool = await getPool();
    await pool.request()
      .input('Id', mssql.Int, fbId)
      .input('ReceiverId', mssql.VarChar(10), req.user.lecturer_id)
      .query('UPDATE FEEDBACKS SET IsRead=1, ReadAt=GETDATE() WHERE Id=@Id AND ReceiverId=@ReceiverId');
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});"""

replaced = False
# Try the patched version first
if OLD_START in sv:
    # Also need to remove the OLD_GET_ME that comes after in the original
    sv = sv.replace(OLD_START, '// ==================================================\n//  FEEDBACK APIs — migrated to SQL (see below)\n// ==================================================\n')
    if OLD_GET_ME in sv:
        sv = sv.replace(OLD_GET_ME, NEW_FEEDBACK_APIS)
        replaced = True
        print('✅ Replaced patched+original routes with SQL version')

if not replaced and OLD_ORIGINAL in sv:
    # Replace original version
    combined = OLD_ORIGINAL + '\n\n' + OLD_GET_ME
    if combined in sv:
        sv = sv.replace(combined, NEW_FEEDBACK_APIS)
        replaced = True
        print('✅ Replaced original routes with SQL version')
    else:
        sv = sv.replace(OLD_ORIGINAL, '')
        sv = sv.replace(OLD_GET_ME, NEW_FEEDBACK_APIS)
        replaced = True
        print('✅ Replaced original routes (split) with SQL version')

if not replaced:
    # Check what's there
    if 'app.post(\'/api/feedback\'' in sv:
        print('ℹ️ api/feedback POST found but markers differ')
    if 'app.get(\'/api/feedback/me\'' in sv:
        print('ℹ️ api/feedback/me GET found')
    print('❌ Could not auto-replace — check markers')

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(sv)
print('Done server.js')
