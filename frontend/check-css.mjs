import fs from 'fs';
const css = fs.readFileSync('dist/assets/index-CYwc0SQ-.css', 'utf8');
console.log('select-btn:', css.includes('select-btn'));
console.log('select-dropdown:', css.includes('select-dropdown'));
console.log('select-option:', css.includes('select-option'));
console.log('glass:', css.includes('.glass'));
console.log('card-surface:', css.includes('card-surface'));
console.log('skeleton:', css.includes('.skeleton'));
// Check for any of our custom CSS
const idx = css.indexOf('1E1B4B');
console.log('Has #1E1B4B color:', idx !== -1, idx !== -1 ? css.substring(Math.max(0,idx-50), idx+50) : '');
