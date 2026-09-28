import { ALL_ALGORITHM_METADATA } from '../src/core/algorithm-catalog.generated';

const classes = new Map<string, string[]>();
for (const item of ALL_ALGORITHM_METADATA) {
  if (item.aliases) {
    for (const a of item.aliases) {
      const m = a.match(/^class(\d{3})/i);
      if (m) {
        const cls = 'class' + m[1];
        if (!classes.has(cls)) classes.set(cls, []);
        classes.get(cls)!.push(`${item.id} (${a})`);
      }
    }
  }
}

const sorted = Array.from(classes.keys()).sort();
console.log('Total classes with aliases:', sorted.length);
console.log('Covered classes:', sorted.join(', '));

const classesOver100 = new Map<string, string[]>();
for (const item of ALL_ALGORITHM_METADATA) {
  if (item.aliases) {
    for (const a of item.aliases) {
      const m = a.match(/^class(\d{3})/i);
      if (m && parseInt(m[1], 10) >= 100) {
        const cls = 'class' + m[1];
        if (!classesOver100.has(cls)) classesOver100.set(cls, []);
        classesOver100.get(cls)!.push(item.id);
      }
    }
  }
}

const sortedOver100 = Array.from(classesOver100.keys()).sort();
console.log('Classes >= 100 (' + sortedOver100.length + '):', sortedOver100.join(', '));
for (const cls of sortedOver100) {
  console.log(`[${cls}] (${classesOver100.get(cls)!.length} algorithms):`, classesOver100.get(cls)!.join(', '));
}
