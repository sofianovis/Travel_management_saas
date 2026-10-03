const fs = require('fs');
const path = require('path');

function fixClient(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      fixClient(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // If "use client" is not the first thing but exists, or if import { apiFetch } is before it
      const useClientIdx = content.indexOf('"use client";');
      if (useClientIdx > 0) {
        // Strip it out and put it at the very top
        content = content.replace(/"use client";\n?/g, '');
        content = '"use client";\n' + content;
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Fixed', fullPath);
      }
    }
  }
}

fixClient('src/app');
fixClient('src/components');
