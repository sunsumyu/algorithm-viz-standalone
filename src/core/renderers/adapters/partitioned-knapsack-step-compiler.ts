/**
 * 分组背包模版 (洛谷 P1757 通天之分组背包 / 左程云 Class 074 Code01)
 * Step Compiler: 组内物品互斥决策（至多选 1 件），容量倒序枚举状态推演
 */

import {
  runKnapsackEngine,
  type KnapsackExecutionStep,
  type KnapsackItem,
} from '../../knapsack-execution-engine';

export type PartitionedItem = KnapsackItem & {
  group: number;
};

export type PartitionedKnapsackStep = KnapsackExecutionStep;

export function parsePartitionedInputs(inputs: Record<string, any>): {
  m: number;
  items: PartitionedItem[];
} {
  const m = parseInt(inputs['input-capacity'] || '45', 10);
  let rawArr: [number, number, number][] = [];
  try {
    rawArr = JSON.parse(
      inputs['input-items-json'] || '[[10,10,1],[10,20,1],[20,20,2]]'
    );
  } catch {
    rawArr = [
      [10, 10, 1],
      [10, 20, 1],
      [20, 20, 2],
    ];
  }
  const items: PartitionedItem[] = rawArr.map(([cost, val, group], idx) => ({
    cost,
    val,
    group,
    id: idx + 1,
    name: `物品 #${idx + 1} (组${group})`,
  }));
  return { m, items };
}

export function buildPartitionedKnapsackSteps(
  capacity: number,
  rawItems: PartitionedItem[]
): PartitionedKnapsackStep[] {
  return runKnapsackEngine({
    type: 'partitioned',
    capacity,
    items: rawItems,
    lineMap: {
      sort: { java: 9, cpp: 9, python: 3, javascript: 3 },
      initDp: { java: 10, cpp: 10, python: 4, javascript: 4 },
      outerLoop: { java: 11, cpp: 11, python: 6, javascript: 6 },
      groupEnd: { java: 12, cpp: 12, python: 8, javascript: 8 },
      capLoop: { java: 13, cpp: 14, python: 10, javascript: 9 },
      itemLoop: { java: 14, cpp: 15, python: 11, javascript: 10 },
      ifFit: { java: 15, cpp: 16, python: 13, javascript: 12 },
      updateDp: { java: 16, cpp: 17, python: 14, javascript: 13 },
      advanceLoop: { java: 20, cpp: 21, python: 15, javascript: 17 },
      returnAns: { java: 22, cpp: 23, python: 16, javascript: 19 },
    },
    customMessages: {
      init: `🗂️ 初始化分组背包：总容量 M=${capacity}，共有 ${rawItems.length} 件物品分属于不同组。`,
      done: `🎉 分组背包推演完毕！严格遵守组内互斥选择，最大累计收益为答案！`,
    },
  });
}
