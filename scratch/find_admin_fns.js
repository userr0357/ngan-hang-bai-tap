const fs = require('fs');
const a = fs.readFileSync('public/admin.js', 'utf8');

// Find distribution/subject table rendering
const terms = ['distribution', 'subject-dist', 'mon-dist', 'loadSubjectDist', 'renderSubject', 'skill-level', 'loadSkillLevel', 'renderSkill', 'loadLecturerAnalytics'];
for (const t of terms) {
  const idx = a.indexOf(t);
  if (idx > -1) {
    console.log(`\n=== Found "${t}" at ${idx} ===`);
    console.log(a.substring(Math.max(0, idx - 100), idx + 400));
  }
}
