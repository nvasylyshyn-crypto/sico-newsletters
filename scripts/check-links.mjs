import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.resolve('public');

function walk(dir) {
  const files = [];
  fs.readdirSync(dir).forEach(file => {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      if (!['assets', 'node_modules', '.next'].includes(file)) {
        files.push(...walk(fullPath));
      }
    } else if (/\.(html|css|js)$/.test(file)) {
      files.push(fullPath);
    }
  });
  return files;
}

const allFiles = walk(PUBLIC_DIR);
let brokenCount = 0;

allFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const fileDir = path.dirname(file);
  
  // Extract href and src values
  const regex = /(?:href|src)="([^"]+)"/g;
  let match;
  
  while ((match = regex.exec(content)) !== null) {
    const link = match[1];
    
    // Skip external links, hashes, fragments
    if (link.startsWith('http') || link.startsWith('#') || link.startsWith('mailto:') || link.startsWith('tel:')) {
      continue;
    }
    
    // Resolve path
    let targetPath;
    if (link.startsWith('/newsletters/')) {
        targetPath = path.join(PUBLIC_DIR, link.replace('/newsletters/', ''));
    } else if (link.startsWith('/')) {
        targetPath = path.join(PUBLIC_DIR, link);
    } else {
        targetPath = path.join(fileDir, link.split('?')[0].split('#')[0]);
    }
    
    if (!fs.existsSync(targetPath)) {
      console.log(`Broken link in ${path.relative(PUBLIC_DIR, file)}: ${link} -> (expected: ${path.relative(PUBLIC_DIR, targetPath)})`);
      brokenCount++;
    }
  }
});

console.log(`\nTotal broken relative links found: ${brokenCount}`);
