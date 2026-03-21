const fs = require('fs');
const path = "c:\\Users\\hp\\Documents\\Onwheels-SB\\src\\feactures\\dashboards\\admin\\pages\\compras\\productos\\Products.jsx";
let content = fs.readFileSync(path, 'utf8');

const modalVistaIndex = content.indexOf('=== Modal de Vista ===');

if (modalVistaIndex !== -1) {
    const closedParenIndex = content.lastIndexOf(')}', modalVistaIndex);
    if (closedParenIndex !== -1) {
        // Insert right after )}
        content = content.slice(0, closedParenIndex + 2) + '\n        </AnimatePresence>\n' + content.slice(closedParenIndex + 2);
        fs.writeFileSync(path, content, 'utf8');
        console.log("Fixed missing AnimatePresence!");
    } else {
        console.log("Could not find )} match");
    }
} else {
    console.log("Could not find Modal de Vista");
}
