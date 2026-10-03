const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      // Don't modify the api.ts itself, or login/register pages
      if (fullPath.includes('lib\\api.ts') || fullPath.includes('login') || fullPath.includes('register')) continue;
      
      let content = fs.readFileSync(fullPath, 'utf8');
      
      // If it has fetch("http
      if (content.includes('fetch("http') || content.includes('fetch(`http')) {
        // Add import
        if (!content.includes('apiFetch')) {
          const depth = fullPath.split(path.sep).length - 4; // roughly
          const relativePath = depth > 0 ? '../'.repeat(depth) + 'lib/api' : './lib/api';
          content = `import { apiFetch } from "@/lib/api";\n` + content;
        }
        
        content = content.replace(/fetch\(/g, 'apiFetch(');
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  }
}

processDir('src/app');
processDir('src/components');
