import * as fs from 'fs';
import * as path from 'path';

function walk(dir: string): string[] {
  let results: string[] = [];
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
  return results;
}

const files = walk('src/algorithms/categories');
const renderers = files.filter(f => f.endsWith('-renderer.ts'));
console.log('Total renderers:', renderers.length);

const categories = new Set(renderers.map(f => path.relative('src/algorithms/categories', f).split(path.sep)[0]));
console.log('Categories:', Array.from(categories).sort().join(', '));
