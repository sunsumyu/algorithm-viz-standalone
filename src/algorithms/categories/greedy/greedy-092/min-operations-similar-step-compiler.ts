/**
 * 使数组相似的最少操作次数 (LeetCode 2449) - 步进推演编译器
 * 核心贪心：奇偶分离独立排序 + 顺位对齐累加正差值之和 / 2
 */

import { MIN_OPERATIONS_SIMILAR_LINES } from './greedy-092-stage-codes';
import { Greedy092Step } from './greedy-092-shared';

export interface PairMatch {
  type: 'odd' | 'even';
  idx: number;
  num: number;
  target: number;
  diff: number;
  ops: number;
}

export interface MinOperationsSimilarStep extends Greedy092Step {
  line?: number;
  originalNums: number[];
  originalTarget: number[];
  oddNums: number[];
  oddTarget: number[];
  evenNums: number[];
  evenTarget: number[];
  pairs: PairMatch[];
  totalOps: number;
}

export function parseMinOperationsSimilarInputs(inputs: Record<string, any>): { nums: number[]; target: number[] } {
  const rawNums = String(inputs?.['input-nums'] || '8, 12, 6');
  const rawTarget = String(inputs?.['input-target'] || '2, 14, 10');
  const nums = rawNums.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
  const target = rawTarget.split(/[,，\s]+/).map((s) => parseInt(s.trim(), 10)).filter((n) => !isNaN(n));
  return { nums, target };
}

export function buildMinOperationsSimilarSteps(nums: number[], target: number[]): MinOperationsSimilarStep[] {
  const steps: MinOperationsSimilarStep[] = [];
  const lines = MIN_OPERATIONS_SIMILAR_LINES;

  // Step 0: 入口
  steps.push({
    line: lines.entry.java ?? 1,
    originalNums: [...nums],
    originalTarget: [...target],
    oddNums: [],
    oddTarget: [],
    evenNums: [],
    evenTarget: [],
    pairs: [],
    totalOps: 0,
    decision: `主函数入口：接收 nums=[${nums.join(', ')}]，target=[${target.join(', ')}]`,
    message: '由于每次操作只能对数字 +2 或 -2，奇偶性不变，奇数只能对齐奇数，偶数只能对齐偶数',
    log: `enter makeSimilar(nums=[${nums.join(',')}], target=[${target.join(',')}])`,
    codeLine: lines.entry,
  });

  // Step 1: 奇偶分离并排序
  const sortedNums = [...nums].sort((a, b) => a - b);
  const sortedTarget = [...target].sort((a, b) => a - b);

  const oddNums = sortedNums.filter((x) => x % 2 !== 0);
  const evenNums = sortedNums.filter((x) => x % 2 === 0);
  const oddTarget = sortedTarget.filter((x) => x % 2 !== 0);
  const evenTarget = sortedTarget.filter((x) => x % 2 === 0);

  steps.push({
    line: lines.sortSplit.java ?? 2,
    originalNums: [...nums],
    originalTarget: [...target],
    oddNums: [...oddNums],
    oddTarget: [...oddTarget],
    evenNums: [...evenNums],
    evenTarget: [...evenTarget],
    pairs: [],
    totalOps: 0,
    decision: `奇偶分离与升序排序：\n奇数: nums=[${oddNums.join(', ')}] ➔ target=[${oddTarget.join(', ')}]\n偶数: nums=[${evenNums.join(', ')}] ➔ target=[${evenTarget.join(', ')}]`,
    message: '根据排序不等式与贪心对齐原则，同类排位顺位对应配对可达到最少总操作',
    log: 'split and sorted odd/even sets',
    codeLine: lines.sortSplit,
  });

  // Step 2: 奇数对齐
  const pairs: PairMatch[] = [];
  let totalOps = 0;

  for (let i = 0; i < oddNums.length; i++) {
    const a = oddNums[i];
    const b = oddTarget[i];
    const diff = a - b;
    const ops = diff > 0 ? diff / 2 : 0;
    totalOps += ops;

    pairs.push({
      type: 'odd',
      idx: i,
      num: a,
      target: b,
      diff,
      ops,
    });

    steps.push({
      line: lines.oddPairs.java ?? 3,
      originalNums: [...nums],
      originalTarget: [...target],
      oddNums: [...oddNums],
      oddTarget: [...oddTarget],
      evenNums: [...evenNums],
      evenTarget: [...evenTarget],
      pairs: [...pairs],
      totalOps,
      decision: `奇数配对 #${i}: nums[${i}]=${a} ➔ target[${i}]=${b} (差值 ${diff >= 0 ? '+' : ''}${diff}) ➔ ${diff > 0 ? `贡献正向操作 ${ops} 次` : '差值 <= 0，由其他正差值抵消'}，累计操作 = ${totalOps}`,
      message: '正差值累计即为实际需要的独立操作对次数',
      log: `odd pair #${i} (${a} -> ${b}) diff=${diff} ops=${ops}`,
      codeLine: lines.oddPairs,
    });
  }

  // Step 3: 偶数对齐
  for (let i = 0; i < evenNums.length; i++) {
    const a = evenNums[i];
    const b = evenTarget[i];
    const diff = a - b;
    const ops = diff > 0 ? diff / 2 : 0;
    totalOps += ops;

    pairs.push({
      type: 'even',
      idx: i,
      num: a,
      target: b,
      diff,
      ops,
    });

    steps.push({
      line: lines.evenPairs.java ?? 4,
      originalNums: [...nums],
      originalTarget: [...target],
      oddNums: [...oddNums],
      oddTarget: [...oddTarget],
      evenNums: [...evenNums],
      evenTarget: [...evenTarget],
      pairs: [...pairs],
      totalOps,
      decision: `偶数配对 #${i}: nums[${i}]=${a} ➔ target[${i}]=${b} (差值 ${diff >= 0 ? '+' : ''}${diff}) ➔ ${diff > 0 ? `贡献正向操作 ${ops} 次` : '差值 <= 0，由其他正差值抵消'}，累计操作 = ${totalOps}`,
      message: '正差值累计即为实际需要的独立操作对次数',
      log: `even pair #${i} (${a} -> ${b}) diff=${diff} ops=${ops}`,
      codeLine: lines.evenPairs,
    });
  }

  // Step 4: 收敛
  steps.push({
    line: lines.done.java ?? 5,
    originalNums: [...nums],
    originalTarget: [...target],
    oddNums: [...oddNums],
    oddTarget: [...oddTarget],
    evenNums: [...evenNums],
    evenTarget: [...evenTarget],
    pairs: [...pairs],
    totalOps,
    decision: `🎉 计算完毕！使数组完全相似的最少操作次数为 ${totalOps} 次`,
    message: '奇偶顺位贪心对齐达到全局最优',
    log: `done totalOps=${totalOps}`,
    codeLine: lines.done,
  });

  return steps;
}
