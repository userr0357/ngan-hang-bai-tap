const fs = require('fs');
let h = fs.readFileSync('public/admin.html', 'utf8');

// Fix duplicate class attributes on menu-group divs
// Pattern: class="menu-group" ... class="menu-label"  -> class="menu-group menu-label" ...
const regex = /class="menu-group"([^>]*?)class="menu-label"/g;
const matches = h.match(regex);
console.log('Found', matches ? matches.length : 0, 'duplicate class attrs');

h = h.replace(regex, 'class="menu-group menu-label"$1');

fs.writeFileSync('public/admin.html', h, 'utf8');
console.log('✅ Fixed duplicate class attributes');
