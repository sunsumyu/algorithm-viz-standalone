/**
 * 完全背包模版 (洛谷 P1616 疯狂的采药 / 左程云 Class 074 Code03)
 * Step Compiler: 每种物品可选任意次，正序枚举容量 j 状态推演
 */

import {
  runKnapsackEngine,
  type KnapsackExecutionStep,
  type KnapsackItem,
} from '../../knapsack-execution-engine';

export interface UnboundedKnapsackStep extends KnapsackExecutionStep {
  cost: number[];
  val: number[];
  totalTime: number;
}

export function parseUnboundedKnapsackInputs(inputs: Record<string, any>): {
  t: number;
  cost: number[];
  val: number[];
  items: KnapsackItem[];
} {
  const t = parseInt(inputs['input-t'] || '70', 10);
  const cost = String(inputs['input-costs'] || '71, 23')
    .split(',')
    .map((s: string) => parseInt(s.trim(), 10))
    .filter((n: number) => !isNaN(n));
  const val = String(inputs['input-vals'] || '100, 10')
    .split(',')
    .map((s: string) => parseInt(s.trim(), 10))
    .filter((n: number) => !isNaN(n));
  const m = Math.min(cost.length, val.length);
  const items: KnapsackItem[] = [];
  for (let i = 0; i < m; i++) {
    items.push({ cost: cost[i], val: val[i], id: i + 1, name: `草药 #${i + 1}` });
  }
  return { t, cost, val, items };
}

export function buildUnboundedKnapsackSteps(
  totalTime: number,
  cost: number[],
  val: number[]
): UnboundedKnapsackStep[] {
  const m = Math.min(cost.length, val.length);
  const items: KnapsackItem[] = [];
  for (let i = 0; i < m; i++) {
    items.push({ cost: cost[i], val: val[i], id: i + 1, name: `草药 #${i + 1}` });
  }

  const engineSteps = runKnapsackEngine({
    type: 'unbounded',
    capacity: totalTime,
    items,
    lineMap: {
      initDp: { java: 8, cpp: 8, python: 3, javascript: 3 },
      outerLoop: { java: 9, cpp: 9, python: 4, javascript: 4 },
      capLoop: { java: 11, cpp: 11, python: 5, javascript: 6 },
      updateDp: { java: 12, cpp: 12, python: 6, javascript: 7 },
      returnAns: { java: 15, cpp: 15, python: 7, javascript: 10 },
    },
    customMessages: {
      init: `🌿 初始化完全背包：总时间 T=${totalTime}，草药种类 m=${m}（每种草药可无限次叠加採摘）。`,
      done: `🎉 完全背包决策完毕！在总时间 ${totalTime} 内无限选取的最大总收益为答案！`,
    },
  });

  return engineSteps.map((s) => ({
    ...s,
    cost: [...cost],
    val: [...val],
    totalTime,
    metrics: {
      'metric-cur-herb': s.itemIndex !== undefined && s.itemIndex >= 0 ? `第 ${s.itemIndex + 1} 种` : '—',
      'metric-cur-time': s.j >= 0 ? `${s.j}` : '—',
      'metric-cur-item': s.itemIndex !== undefined && s.itemIndex >= 0 ? `#${s.itemIndex + 1}` : '—',
      'metric-cur-j': s.j >= 0 ? `${s.j}` : '—',
      'metric-direction': '正序 (从小到大)',
      'metric-max-val': `${s.maxVal}`,
    },
  }));
}
