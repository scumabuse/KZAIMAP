import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) results = results.concat(walk(full));
    else if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(full);
  }
  return results;
}

const files = walk('./src');
let totalFixed = 0;

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  // Replace cubic-bezier arrays in ease with string equivalent
  const orig = content;
  content = content
    .replace(/ease: \[0\.34, 1\.56, 0\.64, 1\]/g, 'ease: "backOut"')
    .replace(/ease: \[0\.16, 1, 0\.3, 1\]/g,     'ease: "easeOut"')
    .replace(/ease: \[0\.34,1\.56,0\.64,1\]/g,   'ease: "backOut"');
  
  if (content !== orig) {
    fs.writeFileSync(file, content);
    console.log('Fixed ease in:', path.relative('.', file));
    totalFixed++;
  }
}

console.log(`Done: ${totalFixed} files fixed.`);
