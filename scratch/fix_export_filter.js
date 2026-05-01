const fs = require('fs');
let h = fs.readFileSync('public/lecturer.html', 'utf8');

// Find and replace loadExportExercises function
const oldFn = `async function loadExportExercises() {
      try {
        const res = await fetch('/api/subjects', { credentials: 'include' });
        const subjects = await res.json();
        allExportExercises = [];
        const formSet = new Set();
        subjects.forEach(s => {
          (s.forms||[]).forEach(f => {
            formSet.add(f.name);
            (f.exercises||[]).forEach(ex => {
              allExportExercises.push({
                ...ex, subject_name: s.subject_name, subject_id: s.subject_id,
                form_name: f.name, form_id: f.form_id
              });
            });
          });
        });`;

const newFn = `async function loadExportExercises() {
      try {
        // Get current lecturer ID
        const meRes = await fetch('/api/lecturer/me', { credentials: 'include' });
        const me = await meRes.json();
        const myId = me.lecturer_id;

        const res = await fetch('/api/subjects', { credentials: 'include' });
        const subjects = await res.json();
        allExportExercises = [];
        const formSet = new Set();
        subjects.forEach(s => {
          (s.forms||[]).forEach(f => {
            (f.exercises||[]).forEach(ex => {
              // Only include exercises owned by current lecturer
              if (ex.owner === myId) {
                formSet.add(f.name);
                allExportExercises.push({
                  ...ex, subject_name: s.subject_name, subject_id: s.subject_id,
                  form_name: f.name, form_id: f.form_id
                });
              }
            });
          });
        });`;

const idx = h.indexOf('async function loadExportExercises()');
if (idx === -1) { console.log('NOT FOUND'); process.exit(1); }

// Find the exact old block to replace
const endMarker = '        });';
const searchArea = h.substring(idx, idx + 800);
// Find the 3rd occurrence of '});' which closes the subjects.forEach
let pos = 0;
for (let i = 0; i < 3; i++) {
  pos = searchArea.indexOf('});', pos) + 3;
}
const actualEnd = idx + pos;

// Build the new block ending
const newBlock = newFn;
const remaining = h.substring(actualEnd);

h = h.substring(0, idx) + newBlock + remaining;
fs.writeFileSync('public/lecturer.html', h, 'utf8');
console.log('✅ Export now filters by current lecturer!');
