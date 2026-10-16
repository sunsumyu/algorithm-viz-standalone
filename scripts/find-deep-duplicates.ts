import fs from 'fs';
import path from 'path';
import { ALL_ALGORITHM_METADATA } from '../src/core/algorithm-catalog.generated';

console.log(`==========================================================`);
console.log(`🔍 [全面算法去重审计] 目录总条目数: ${ALL_ALGORITHM_METADATA.length}`);
console.log(`==========================================================\n`);

// 1. ID 唯一性核验
const idCounts = new Map<string, typeof ALL_ALGORITHM_METADATA>();
for (const item of ALL_ALGORITHM_METADATA) {
  const list = idCounts.get(item.id) || [];
  list.push(item);
  idCounts.set(item.id, list);
}
const duplicateIds = [...idCounts.entries()].filter(([_, list]) => list.length > 1);
console.log(`1. 唯一主 ID 冲突核验: ${duplicateIds.length === 0 ? '✅ 0 冲突 (全部主 ID 全局唯一)' : `❌ 发现 ${duplicateIds.length} 个冲突 ID`}`);
for (const [id, list] of duplicateIds) {
  console.log(`   - ID "${id}": 在 [${list.map(x => x.category + '/' + x.name).join(', ')}] 中重复`);
}

// 2. 别名 (aliases) 跨算法碰撞核验
const aliasMap = new Map<string, { id: string; category: string }[]>();
for (const item of ALL_ALGORITHM_METADATA) {
  for (const alias of item.aliases || []) {
    const list = aliasMap.get(alias) || [];
    list.push({ id: item.id, category: item.category });
    aliasMap.set(alias, list);
  }
}
const duplicateAliases = [...aliasMap.entries()].filter(([_, list]) => list.length > 1);
console.log(`\n2. 别名 (Aliases) 跨算法碰撞核验: ${duplicateAliases.length === 0 ? '✅ 0 碰撞 (别名映射严格互斥)' : `❌ 发现 ${duplicateAliases.length} 个重叠别名`}`);
for (const [alias, list] of duplicateAliases) {
  console.log(`   - Alias "${alias}": 被 [${list.map(x => x.category + ':' + x.id).join(', ')}] 共同声明`);
}

// 3. 别名与主 ID 冲突核验 (主 ID 不应该被另一个条目当作 alias)
const aliasIdCollisions: string[] = [];
for (const [alias, list] of aliasMap) {
  if (idCounts.has(alias)) {
    const mainOwner = idCounts.get(alias)![0];
    const aliasOwners = list.filter(x => x.id !== alias);
    if (aliasOwners.length > 0) {
      aliasIdCollisions.push(`- 别名 "${alias}" (由 [${aliasOwners.map(x => x.id).join(', ')}] 声明) 与主算法条目 [${mainOwner.id}] 冲突`);
    }
  }
}
console.log(`\n3. 别名与主 ID 交叉碰撞: ${aliasIdCollisions.length === 0 ? '✅ 0 交叉冲突' : `❌ 发现 ${aliasIdCollisions.length} 个冲突`}`);
for (const c of aliasIdCollisions) {
  console.log(`   ${c}`);
}

// 4. LeetCode 题号全量关联分析
// 扫描全文本（包含 title, description, aliases, learningGoal, 以及各类目下的 renderer 文件内容）
const lcProblemMap = new Map<number, { id: string; name: string; category: string; reason: string }[]>();

function recordLc(num: number, id: string, name: string, category: string, reason: string) {
  const list = lcProblemMap.get(num) || [];
  if (!list.some(x => x.id === id)) {
    list.push({ id, name, category, reason });
    lcProblemMap.set(num, list);
  }
}

// 从 catalog 中抽取
for (const it of ALL_ALGORITHM_METADATA) {
  const text = `${it.name} ${it.description} ${it.id} ${(it.aliases || []).join(' ')} ${it.learningGoal || ''}`;
  const matches = text.match(/(?:LeetCode|力扣|LC)\s*[:：#№]?\s*(\d+)/gi);
  if (matches) {
    for (const m of matches) {
      const n = m.match(/\d+/);
      if (n) recordLc(parseInt(n[0], 10), it.id, it.name, it.category, '元数据匹配');
    }
  }
}

// 进一步深入扫描 renderer 源文件中的 LC 题号标注
const rendererDir = path.resolve('src/algorithms/categories');
function scanRenderers(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const ent of entries) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      scanRenderers(full);
    } else if (ent.name.endsWith('-renderer.ts') || ent.name.endsWith('-spec.ts')) {
      const content = fs.readFileSync(full, 'utf-8');
      const idMatch = content.match(/id:\s*['"]([^'"]+)['"]/);
      if (idMatch) {
        const id = idMatch[1];
        const item = ALL_ALGORITHM_METADATA.find(x => x.id === id);
        if (item) {
          const lcMatches = content.match(/(?:LeetCode|力扣|LC)\s*[:：#№]?\s*(\d+)/gi);
          if (lcMatches) {
            for (const m of lcMatches) {
              const n = m.match(/\d+/);
              if (n) {
                const num = parseInt(n[0], 10);
                // 排除 0, 10000+
                if (num > 0 && num < 10000) {
                  recordLc(num, item.id, item.name, item.category, `源码标注 (${path.basename(full)})`);
                }
              }
            }
          }
        }
      }
    }
  }
}
scanRenderers(rendererDir);

console.log(`\n4. 同一 LeetCode 题号对应多个条目核验:`);
let lcMultipleCount = 0;
for (const [num, list] of [...lcProblemMap.entries()].sort((a, b) => a[0] - b[0])) {
  if (list.length > 1) {
    lcMultipleCount++;
    console.log(`\n   [LC ${num}] (${list.length} 个条目关联):`);
    for (const it of list) {
      console.log(`     • [${it.category}] id: ${it.id} | name: "${it.name}" (${it.reason})`);
    }
  }
}
if (lcMultipleCount === 0) {
  console.log(`   ✅ 没有任何相同 LeetCode 题号被多个条目关联。`);
}

// 5. 跨类目同名算法比对 (比较完全相同的题目名称，例如“最大子数组和”、“买卖股票的最佳时机”)
const nameGroup = new Map<string, typeof ALL_ALGORITHM_METADATA>();
for (const it of ALL_ALGORITHM_METADATA) {
  const cleanName = it.name.trim();
  const list = nameGroup.get(cleanName) || [];
  list.push(it);
  nameGroup.set(cleanName, list);
}

console.log(`\n5. 完全重名算法核验 (Exact Match Name):`);
let exactNameDupCount = 0;
for (const [name, list] of nameGroup) {
  if (list.length > 1) {
    exactNameDupCount++;
    console.log(`\n   [完全重名: "${name}"] (${list.length} 个条目):`);
    for (const it of list) {
      console.log(`     • [${it.category}] id: ${it.id}`);
    }
  }
}
if (exactNameDupCount === 0) {
  console.log(`   ✅ 没有任何完全同名的算法条目。`);
}

console.log(`\n==========================================================`);
