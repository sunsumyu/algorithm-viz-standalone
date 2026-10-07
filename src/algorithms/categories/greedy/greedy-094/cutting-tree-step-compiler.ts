/**
 * 砍树问题 (Cutting Tree) - 步进推演编译器
 * 核心贪心：增长率升序邻项交换律 + 0-1背包动态规划
 */

import { CUTTING_TREE_LINES } from './greedy-094-stage-codes';
import { Greedy094Step } from './greedy-094-shared';

export interface TreeInfo {
  id: number;
  weight: number;
  growth: number;
}

export interface CuttingTreeStep extends Greedy094Step {
  line?: number;
  trees: TreeInfo[];
  m: number;
  dp: number[];
  curTreeIdx?: number;
  curJ?: number;
}

export function parseCuttingTreeInputs(inputs: Record<string, any>): { trees: [number, number][]; m: number } {
  const rawTrees = String(inputs?.['input-trees'] || '10,2; 5,5; 20,1');
  const m = Math.max(1, parseInt(String(inputs?.['input-m'] || '2'), 10) || 1);
  const trees = rawTrees.split(';').map((s) => {
    const parts = s.trim().split(',').map((x) => parseInt(x.trim(), 10));
    return [parts[0] || 0, parts[1] || 0] as [number, number];
  });
  return { trees, m };
}

export function buildCuttingTreeSteps(
  treesData: [number, number][],
  m: number
): CuttingTreeStep[] {
  const steps: CuttingTreeStep[] = [];
  const lines = CUTTING_TREE_LINES;
  const n = treesData.length;

  const initialTrees: TreeInfo[] = treesData.map(([w, g], i) => ({
    id: i,
    weight: w,
    growth: g,
  }));

  // Step 0: 入口
  steps.push({
    line: lines.entry.java ?? 1,
    trees: initialTrees.map((t) => ({ ...t })),
    m,
    dp: new Array(m + 1).fill(0),
    decision: `主函数入口：共有 ${n} 棵树，一共可砍 ${m} 天（每天最多砍 1 棵），目标收获最大总木材量`,
    message: '每棵树具有初始重量 weight 与每日自然生长量 growth',
    log: `enter maxTreeWeight(n=${n}, m=${m})`,
    codeLine: lines.entry,
  });

  // Step 1: 增长率贪心排序
  const sortedTrees = [...initialTrees].sort((a, b) => a.growth - b.growth);

  steps.push({
    line: lines.sortGrowth.java ?? 2,
    trees: sortedTrees.map((t) => ({ ...t })),
    m,
    dp: new Array(m + 1).fill(0),
    decision: `贪心排序完成：按日增长率 growth 升序排列！由邻项交换证明：生长速度越快的树应该越晚砍`,
    message: '若选定某几棵树，越晚砍生长量越多的树，获得的复利增量越大',
    log: `sorted trees by growth: ${sortedTrees.map((t) => t.growth).join(', ')}`,
    codeLine: lines.sortGrowth,
  });

  // Step 2: 0-1 背包 DP
  const dp = new Array(m + 1).fill(0);

  for (let i = 0; i < n; i++) {
    const t = sortedTrees[i];
    for (let j = m; j >= 1; j--) {
      const candidate = dp[j - 1] + t.weight + t.growth * (j - 1);
      const prevVal = dp[j];
      if (candidate > dp[j]) {
        dp[j] = candidate;
        steps.push({
          line: lines.dpKnapsack.java ?? 3,
          trees: sortedTrees.map((x) => ({ ...x })),
          m,
          dp: [...dp],
          curTreeIdx: i,
          curJ: j,
          decision: `考察树 #${t.id}（w=${t.weight}, g=${t.growth}）在第 ${j} 天砍：收益 = dp[${j - 1}] + ${t.weight} + ${t.growth}×${j - 1} = ${candidate} > 原 dp[${j}]=${prevVal} ➔ 更新 dp[${j}] = ${candidate}`,
          message: `更新 dp[${j}] 为最优收益`,
          log: `tree #${t.id}, j=${j}, dp[${j}]=${candidate}`,
          codeLine: lines.dpKnapsack,
        });
      }
    }
  }

  // Step 3: 收敛完成
  steps.push({
    line: lines.done.java ?? 4,
    trees: sortedTrees.map((x) => ({ ...x })),
    m,
    dp: [...dp],
    decision: `🎉 演练结束：砍 ${m} 棵树可获得的最大木材总量为 dp[${m}] = ${dp[m]}`,
    message: '排序确定砍伐先后顺序消除后效性，动态规划从容选出最优子集',
    log: `done maxWeight=${dp[m]}`,
    codeLine: lines.done,
  });

  return steps;
}
