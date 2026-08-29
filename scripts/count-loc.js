import fs from 'fs';
import path from 'path';

function countLinesInDir(dirPath, exts = ['.js', '.jsx', '.ts', '.tsx', '.mjs']) {
  let totalLines = 0;
  let fileCount = 0;
  const langCounts = {};

  function traverse(currentDir) {
    if (!fs.existsSync(currentDir)) return;
    const entries = fs.readdirSync(currentDir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name);

      if (entry.isDirectory()) {
        if (
          entry.name === 'node_modules' ||
          entry.name === '.git' ||
          entry.name === 'dist' ||
          entry.name === 'build' ||
          entry.name === 'coverage' ||
          entry.name === 'tests' ||
          entry.name === '.system_generated'
        ) {
          continue;
        }
        traverse(fullPath);
      } else if (entry.isFile()) {
        const ext = path.extname(entry.name).toLowerCase();
        if (exts.includes(ext)) {
          const content = fs.readFileSync(fullPath, 'utf8');
          const lines = content.split('\n').length;
          totalLines += lines;
          fileCount++;
          const lang = ext.replace('.', '').toUpperCase();
          langCounts[lang] = (langCounts[lang] || 0) + lines;
        }
      }
    }
  }

  traverse(dirPath);
  return { totalLines, fileCount, langCounts };
}

const rootDir = process.cwd();
const result = countLinesInDir(rootDir);

console.log('--------------------------------------------------');
console.log(`CITYMIND Production LOC Count`);
console.log(`Total Source Files: ${result.fileCount}`);
console.log(`Total Production LOC: ${result.totalLines}`);
console.log(`Languages Breakdown:`, result.langCounts);
console.log('--------------------------------------------------');
