const fs = require('fs');
const path = 'c:\\Users\\hp\\Documents\\Onwheels-SB\\src\\feactures\\dashboards\\admin\\pages\\compras\\productos\\Products.jsx';

let content = fs.readFileSync(path, 'utf8');

// The error is because configUi was not imported.
// Let's add the import after the other imports.
if (!content.includes('import { configUi }')) {
    const importMark = 'import { canManage }';
    const importIdx = content.indexOf(importMark);
    if (importIdx !== -1) {
        const endOfLineIdx = content.indexOf('\n', importIdx);
        const newImport = '\nimport { configUi } from "../../../configuracion/configUi";';
        content = content.substring(0, endOfLineIdx + 1) + newImport + content.substring(endOfLineIdx + 1);
        fs.writeFileSync(path, content, 'utf8');
        console.log('Import added successfully.');
    } else {
        console.error('Could not find import mark.');
        process.exit(1);
    }
} else {
    console.log('Import already exists.');
}
