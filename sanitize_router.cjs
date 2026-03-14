const fs = require('fs');
const path = 'src/routers/AppRouter.jsx';
const content = fs.readFileSync(path, 'utf8');
const lines = content.split(/\r?\n/);
const seen = new Set();
const newLines = lines.filter(line => {
    if (line.includes('import { CustomLayoutWrapper }') || line.includes('import CustomLayoutWrapper ')) {
        if (seen.has('CustomLayoutWrapper')) {
            console.log('Removing duplicate import:', line);
            return false;
        }
        seen.add('CustomLayoutWrapper');
    }
    // Also check for Events duplicate just in case
    if (line.includes('import { Events }') || line.includes('import Events from ')) {
        if (seen.has('Events')) {
            console.log('Removing duplicate Events import:', line);
            return false;
        }
        seen.add('Events');
    }
    return true;
});
fs.writeFileSync(path, newLines.join('\n'));
console.log('Sanitization complete.');
