const fs = require('fs');
const path = require('path');

const files = [
  'public/admin.html',
  'public/lecturer.html',
  'public/index.html',
  'public/login.html',
  'public/admin.js',
  'public/app.js',
  'public/styles.css'
];

function bumpFontSize(content) {
  return content.replace(/font-size:\s*(\d+)px/g, (match, size) => {
    let newSize = parseInt(size, 10);
    // bump by 1px if small, 2px if medium
    if (newSize < 12) newSize += 1;
    else if (newSize >= 12 && newSize <= 16) newSize += 2;
    else if (newSize > 16 && newSize <= 24) newSize += 1;
    return `font-size:${newSize}px`;
  });
}

function fixColorsForDarkMode(content) {
  // Replace dark colors with CSS variables so dark mode handles them
  let c = content;
  c = c.replace(/color:\s*#333(333)?/ig, 'color:var(--text-main)');
  c = c.replace(/color:\s*#1e293b/ig, 'color:var(--text-main)');
  c = c.replace(/color:\s*#374151/ig, 'color:var(--text-main)');
  c = c.replace(/color:\s*#4b5563/ig, 'color:var(--text-muted)');
  c = c.replace(/color:\s*#64748b/ig, 'color:var(--text-muted)');
  c = c.replace(/color:\s*#6b7280/ig, 'color:var(--text-muted)');
  c = c.replace(/color:\s*#94a3b8/ig, 'color:var(--text-muted)');
  
  // also fix some explicit backgrounds that might be light-only
  c = c.replace(/background:\s*#fff/ig, 'background:var(--card-bg,#fff)');
  c = c.replace(/background:\s*#ffffff/ig, 'background:var(--card-bg,#fff)');
  c = c.replace(/background:\s*#f8fafc/ig, 'background:var(--bg-color,#f8fafc)');
  
  return c;
}

files.forEach(f => {
  try {
    const fullPath = path.join(__dirname, '..', f);
    if (!fs.existsSync(fullPath)) return;
    let content = fs.readFileSync(fullPath, 'utf8');
    
    content = bumpFontSize(content);
    content = fixColorsForDarkMode(content);
    
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log('Processed', f);
  } catch(e) {
    console.error('Error on', f, e.message);
  }
});
