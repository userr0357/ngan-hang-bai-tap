"""
Fix server.js feedback APIs:
1. Add id + category + status to POST /api/feedback
2. Add GET /api/feedback/sent  
3. Add PATCH /api/feedback/:id/status
"""
import sys, re
sys.stdout.reconfigure(encoding='utf-8', errors='replace')

with open('server.js', 'r', encoding='utf-8') as f:
    sv = f.read()

OLD_POST = """app.post('/api/feedback', auth, (req, res) => {
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

NEW_POST = """app.post('/api/feedback', auth, (req, res) => {
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

if OLD_POST in sv:
    sv = sv.replace(OLD_POST, NEW_POST)
    print('✅ Feedback APIs updated')
else:
    print('❌ OLD_POST not found')

with open('server.js', 'w', encoding='utf-8') as f:
    f.write(sv)
print('Done server.js')
