import { ALL_ALGORITHM_METADATA } from '../src/core/algorithm-catalog.generated';

console.log(`当前 ALL_ALGORITHM_METADATA 中总条目数: ${ALL_ALGORITHM_METADATA.length}`);

// 1. 检查同一个 LeetCode 题号
const lcMap = new Map<number, typeof ALL_ALGORITHM_METADATA>();
for (const it of ALL_ALGORITHM_METADATA) {
  const fullText = `${it.name} ${it.description} ${it.id} ${(it.aliases || []).join(' ')} ${it.learningGoal || ''}`;
  const lcMatches = fullText.match(/(?:LeetCode|力扣|LC)\s*[:：#№]?\s*(\d+)/gi);
  if (lcMatches) {
    const nums = new Set<number>();
    for (const m of lcMatches) {
      const numMatch = m.match(/\d+/);
      if (numMatch) nums.add(parseInt(numMatch[0], 10));
    }
    for (const n of nums) {
      const list = lcMap.get(n) || [];
      list.push(it);
      lcMap.set(n, list);
    }
  }
}

console.log('\n=== 相同 LeetCode 题号的条目 ===');
let lcDupCount = 0;
for (const [num, list] of lcMap) {
  if (list.length > 1) {
    lcDupCount++;
    console.log(`[LC ${num} 关联 ${list.length} 个条目]:`);
    for (const item of list) {
      console.log(`  - [${item.category}] id: ${item.id}, name: ${item.name}`);
    }
  }
}
if (lcDupCount === 0) console.log('无相同 LeetCode 题号的重复条目。');

// 2. 核心题名语义归一化查重（去掉类目、标点、前缀后缀后的核心词）
const nameKeyMap = new Map<string, typeof ALL_ALGORITHM_METADATA>();
for (const it of ALL_ALGORITHM_METADATA) {
  const key = it.name
    .replace(/[0-9]+/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/（.*?）/g, '')
    .replace(/Class|LeetCode|力扣|洛谷/gi, '')
    .replace(/算法|实现|详解|原理|基础|模版|模板|练习|总结|篇/g, '')
    .trim();
  if (key.length >= 3) {
    const list = nameKeyMap.get(key) || [];
    list.push(it);
    nameKeyMap.set(key, list);
  }
}

console.log('\n=== 归一化名称重合 (长度>=3) ===');
let nameDupCount = 0;
for (const [key, list] of nameKeyMap) {
  if (list.length > 1) {
    nameDupCount++;
    console.log(`\n[关键词: "${key}"] (${list.length} 条):`);
    for (const item of list) {
      console.log(`  - [${item.category}] id: ${item.id}, name: ${item.name}`);
    }
  }
}
