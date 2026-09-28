import * as fs from 'fs';
import * as path from 'path';

function walk(dir: string): string[] {
  let results: string[] = [];
  try {
    const list = fs.readdirSync(dir);
    list.forEach(file => {
      const full = path.join(dir, file);
      const stat = fs.statSync(full);
      if (stat && stat.isDirectory()) {
        results = results.concat(walk(full));
      } else {
        results.push(full);
      }
    });
  } catch (e) {}
  return results;
}

const allFiles = walk('src/algorithms');

// Search for keywords
const keywords = [
  '039', '040', '041', '043', '044', '045', '046',
  'decode-string', 'basic-calculator', 'count-atoms',
  'reverse-stack', 'sort-stack',
  'palindrome-linked-list', 'reorder-list', 'linked-list-cycle',
  'trie'
];

for (const kw of keywords) {
  const matches = allFiles.filter(f => f.toLowerCase().includes(kw));
  if (matches.length > 0) {
    console.log(`[Keyword: ${kw}] (${matches.length} matches):`);
    for (const m of matches) {
      console.log(`  - ${m}`);
    }
  }
}
