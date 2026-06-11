import fs from 'fs';
import path from 'path';

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) results = results.concat(walk(full));
    else if (file.endsWith('.tsx') || file.endsWith('.css')) results.push(full);
  }
  return results;
}

const files = walk('./src');

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  const orig = content;

  if (file.endsWith('.css')) {
    // Increase general breathing room in CSS
    content = content
      .replace(/padding: 13px 24px;/g, 'padding: 16px 32px;') // btn-primary
      .replace(/padding: 10px 20px;/g, 'padding: 12px 24px;') // btn-amber
      .replace(/padding: 13px 16px;/g, 'padding: 16px 20px;') // eco-input
      .replace(/line-height: 1.05;/g, 'line-height: 1.15;') // headings
      .replace(/--r-md:  12px;/g, '--r-md:  16px;') // increase radius
      .replace(/--r-lg:  16px;/g, '--r-lg:  20px;')
      .replace(/--r-xl:  24px;/g, '--r-xl:  28px;')
      .replace(/font-size: 14px;/g, 'font-size: 15px;') // slightly larger base fonts for inputs/buttons
      .replace(/font-size: 15px;\n  font-weight: 500;/g, 'font-size: 15px;\n  font-weight: 500;\n  line-height: 1.6;')
      .replace(/font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;/g, "font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;\n  line-height: 1.6;")
      .replace(/background: var\(--bg\);/g, 'background: var(--bg);\n  letter-spacing: -0.01em;');
  } else {
    // TSX files adjustments
    // Buttons: replace w-full with inline or limited width
    content = content
      .replace(/btn-primary w-full/g, 'btn-primary w-full sm:w-auto')
      // Increase padding in cards
      .replace(/p-8/g, 'p-10')
      .replace(/p-6/g, 'p-8')
      .replace(/p-5/g, 'p-7')
      // Increase gap
      .replace(/gap-5/g, 'gap-8')
      .replace(/gap-6/g, 'gap-10')
      // Reduce text width
      .replace(/max-w-2xl/g, 'max-w-xl')
      .replace(/max-w-xl/g, 'max-w-lg') // Some might be max-w-lg now
      // Increase line height
      .replace(/leading-relaxed/g, 'leading-loose')
      // Increase vertical spacing
      .replace(/space-y-20/g, 'space-y-32')
      .replace(/space-y-12/g, 'space-y-20')
      .replace(/space-y-10/g, 'space-y-16')
      .replace(/space-y-8/g, 'space-y-12');
  }

  if (content !== orig) {
    fs.writeFileSync(file, content);
    console.log('Updated:', path.relative('.', file));
  }
}
console.log('All styling adjustments applied.');
