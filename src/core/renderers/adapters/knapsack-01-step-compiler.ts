/**
 * 01背包模版 (洛谷 P1048 采药 / 左程云 Class 073 Code01)
 * Step Compiler: 01 背包空间压缩与一维滚动数组逆序更新状态推演
 */

import {
  runKnapsackEngine,
  type KnapsackExecutionStep,
  type KnapsackItem,
} from '../../knapsack-execution-engine';

export interface Knapsack01Step extends KnapsackExecutionStep {
  cost: number[];
  val: number[];
  currentVal: number;
}

export function parseKnapsack01Inputs(inputs: Record<string, any>): {
  t: number;
  costs: number[];
  vals: number[];
  items: KnapsackItem[];
} {
  const t = parseInt(inputs['input-capacity'] || '70', 10);
  const costs = String(inputs['input-costs'] || '71, 69, 1')
    .split(',')
    .map((s: string) => parseInt(s.trim(), 10))
    .filter((n: number) => !isNaN(n));
  const vals = String(inputs['input-vals'] || '100, 1, 2')
    .split(',')
    .map((s: string) => parseInt(s.trim(), 10))
    .filter((n: number) => !isNaN(n));
  const m = Math.min(costs.length, vals.length);
  const items: KnapsackItem[] = [];
  for (let i = 0; i < m; i++) {
    items.push({ cost: costs[i], val: vals[i], id: i + 1, name: `物品 #${i + 1}` });
  }
  return { t, costs, vals, items };
}

export function buildKnapsack01Steps(
  capacity: number,
  costOrItems: number[] | KnapsackItem[],
  val?: number[]
): Knapsack01Step[] {
  let items: KnapsackItem[] = [];
  let costArr: number[] = [];
  let valArr: number[] = [];

  if (Array.isArray(costOrItems) && costOrItems.length > 0 && typeof costOrItems[0] === 'object') {
    items = costOrItems as KnapsackItem[];
    costArr = items.map((it) => it.cost);
    valArr = items.map((it) => it.val);
  } else {
    costArr = (costOrItems as number[]) || [];
    valArr = val || [];
    const m = Math.min(costArr.length, valArr.length);
    for (let i = 0; i < m; i++) {
      items.push({ cost: costArr[i], val: valArr[i], id: i + 1, name: `物品 #${i + 1}` });
    }
  }

  const mCount = items.length;

  const engineSteps = runKnapsackEngine({
    type: '01',
    capacity,
    items,
    lineMap: {
      initDp: { java: 8, cpp: 8, python: 3, javascript: 3 },
      outerLoop: { java: 9, cpp: 9, python: 4, javascript: 4 },
      capLoop: { java: 10, cpp: 11, python: 5, javascript: 6 },
      updateDp: { java: 11, cpp: 12, python: 6, javascript: 7 },
      returnAns: { java: 14, cpp: 15, python: 7, javascript: 10 },
    },
    customMessages: {
      init: `🚀 初始化 01 背包空间：容量 T=${capacity}，待选物品数 M=${mCount}。dp 数组初值置 0。`,
      done: `🎉 01 背包决策完毕！在总容量 ${capacity} 下的最大价值为答案！`,
    },
  });

  return engineSteps.map((s) => ({
    ...s,
    cost: [...costArr],
    val: [...valArr],
    currentVal: s.selectedItems ? s.selectedItems.reduce((acc, it) => acc + it.val, 0) : 0,
    metrics: {
      'metric-cur-item': s.itemIndex !== undefined && s.itemIndex >= 0 ? `#${s.itemIndex + 1}` : '—',
      'metric-cur-capacity': s.j >= 0 ? `${s.j}` : '—',
      'metric-max-val': `${s.maxVal}`,
      'metric-status': s.status.toUpperCase(),
    },
  })) as Knapsack01Step[];
}
