/**
 * 第 k 大子序列和 (LeetCode 2386 / 左程云 Class 073 Code07)
 * Step Compiler: 正数基底减法归约 + 小根堆两路扩展推演
 */

import type { HighlightTarget } from '../../code-panel';

export function parseFindKthInputs(inputs: Record<string, any>): {
  nums: number[];
  k: number;
} {
  const numsStr = String(inputs['input-nums'] || '1, 2, -1, 3');
  const nums = numsStr
    .split(',')
    .map((s: string) => parseInt(s.trim(), 10))
    .filter((n: number) => !isNaN(n));
  const k = parseInt(inputs['input-k'] || '6', 10);
  return { nums, k };
}

export interface FindKthStep {
  stepIndex: number;
  nums: number[];
  absNums: number[];
  maxSum: number;
  kTarget: number;
  heapSnapshot: { idx: number; val: number }[];
  currentSmallestRank: number;
  currentSmallestVal: number;
  kthSum: number;
  status: 'init' | 'pop' | 'branch' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, any>;
}

export function buildFindKthSumSteps(
  rawNums: number[],
  k: number
): FindKthStep[] {
  const steps: FindKthStep[] = [];
  const n = rawNums.length;

  let maxSum = 0;
  const absNums: number[] = [];
  for (const x of rawNums) {
    if (x > 0) maxSum += x;
    absNums.push(Math.abs(x));
  }
  absNums.sort((a, b) => a - b);

  const targetK = Math.min(k, 1 << Math.min(n, 20));

  const lines = {
    entry: { java: 8, cpp: 8, python: 3, javascript: 2 },
    initSum: { java: 10, cpp: 10, python: 5, javascript: 3 },
    sortAbs: { java: 18, cpp: 15, python: 6, javascript: 9 },
    pushEmpty: { java: 20, cpp: 19, python: 8, javascript: 10 },
    loopStart: { java: 21, cpp: 20, python: 9, javascript: 11 },
    popHeap: { java: 22, cpp: 22, python: 10, javascript: 13 },
    branch: { java: 26, cpp: 24, python: 11, javascript: 14 },
    returnAns: { java: 32, cpp: 30, python: 15, javascript: 22 },
  };

  function makeStep(data: Omit<FindKthStep, 'metrics'>): FindKthStep {
    return {
      ...data,
      metrics: {
        'metric-max-sum': `${maxSum}`,
        'metric-cur-k': `${data.currentSmallestRank} / ${targetK}`,
        'metric-abs-val': `${data.currentSmallestVal}`,
        'metric-ans-kth': `${data.kthSum}`,
      },
    };
  }

  // 1. 初始化入口
  steps.push(
    makeStep({
      stepIndex: 0,
      nums: [...rawNums],
      absNums: [...absNums],
      maxSum,
      kTarget: targetK,
      heapSnapshot: [{ idx: -1, val: 0 }],
      currentSmallestRank: 1,
      currentSmallestVal: 0,
      kthSum: maxSum,
      status: 'init',
      message: `✨ 算法初始化：进入 kSum 函数，目标求第 ${targetK} 大子序列和。`,
      log: `init: targetK=${targetK}`,
      codeLine: lines.entry,
    })
  );

  // 2. 正数累加与绝对值计算
  steps.push(
    makeStep({
      stepIndex: 0,
      nums: [...rawNums],
      absNums: [...absNums],
      maxSum,
      kTarget: targetK,
      heapSnapshot: [{ idx: -1, val: 0 }],
      currentSmallestRank: 1,
      currentSmallestVal: 0,
      kthSum: maxSum,
      status: 'init',
      message: `➕ 累加所有正数求得全局最大子序列和 maxSum=${maxSum}。`,
      log: `positive sum: maxSum=${maxSum}`,
      codeLine: lines.initSum,
    })
  );

  // 3. 绝对值升序排序
  steps.push(
    makeStep({
      stepIndex: 0,
      nums: [...rawNums],
      absNums: [...absNums],
      maxSum,
      kTarget: targetK,
      heapSnapshot: [{ idx: -1, val: 0 }],
      currentSmallestRank: 1,
      currentSmallestVal: 0,
      kthSum: maxSum,
      status: 'init',
      message: `📊 元素绝对值升序排序完成：absNums=[${absNums.join(', ')}]。空集和为 0 (对应第 1 小损失量)。`,
      log: `abs sort: [${absNums.join(', ')}]`,
      codeLine: lines.sortAbs,
    })
  );

  if (targetK <= 1 || n === 0) {
    steps.push(
      makeStep({
        stepIndex: 1,
        nums: [...rawNums],
        absNums: [...absNums],
        maxSum,
        kTarget: targetK,
        heapSnapshot: [{ idx: -1, val: 0 }],
        currentSmallestRank: 1,
        currentSmallestVal: 0,
        kthSum: maxSum,
        status: 'done',
        message: `🏁 目标为第 1 大和，直接返回全局最大正数和 ${maxSum}。`,
        log: `done: ans=${maxSum}`,
        codeLine: lines.returnAns,
      })
    );
    return steps;
  }

  const heap: { idx: number; val: number }[] = [{ idx: -1, val: 0 }];

  for (let i = 1; i < targetK; i++) {
    heap.sort((a, b) => a.val - b.val);
    const cur = heap.shift()!;

    if (cur.idx + 1 < n) {
      const nextAbs = absNums[cur.idx + 1];
      heap.push({ idx: cur.idx + 1, val: cur.val + nextAbs });
      if (cur.idx >= 0) {
        heap.push({ idx: cur.idx + 1, val: cur.val - absNums[cur.idx] + nextAbs });
      }
    }

    heap.sort((a, b) => a.val - b.val);
    const topOfHeap = heap[0];
    const rank = i + 1;
    const ansKth = maxSum - topOfHeap.val;

    steps.push(
      makeStep({
        stepIndex: steps.length,
        nums: [...rawNums],
        absNums: [...absNums],
        maxSum,
        kTarget: targetK,
        heapSnapshot: [...heap],
        currentSmallestRank: rank,
        currentSmallestVal: topOfHeap.val,
        kthSum: ansKth,
        status: 'branch',
        message: `👑 小根堆第 ${rank} 小绝对值损失量为 ${topOfHeap.val} (右下标=${topOfHeap.idx})。\n对应原数组第 ${rank} 大子序列和 = maxSum(${maxSum}) - 损失(${topOfHeap.val}) = ${ansKth}！`,
        log: `step #${rank}: loss=${topOfHeap.val}, ans=${ansKth}`,
        codeLine: lines.branch,
      })
    );
  }

  const finalTop = heap[0] || { idx: -1, val: 0 };
  const finalAns = maxSum - finalTop.val;

  steps.push(
    makeStep({
      stepIndex: steps.length,
      nums: [...rawNums],
      absNums: [...absNums],
      maxSum,
      kTarget: targetK,
      heapSnapshot: [...heap],
      currentSmallestRank: targetK,
      currentSmallestVal: finalTop.val,
      kthSum: finalAns,
      status: 'done',
      message: `🎉 第 K 大和推演成功！原数组的第 ${targetK} 大子序列和为 ${finalAns}！`,
      log: `done: k=${targetK}, ans=${finalAns}`,
      codeLine: lines.returnAns,
    })
  );

  return steps;
}
