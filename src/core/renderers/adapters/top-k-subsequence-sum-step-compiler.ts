/**
 * 非负数组前k个最小的子序列累加和 (Top K Subsequence Sum / 左程云 Class 073 Code06)
 * Step Compiler: 小根堆状态机两路扩展状态推演
 */

import type { HighlightTarget } from '../../code-panel';

export function parseTopKInputs(inputs: Record<string, any>): {
  nums: number[];
  k: number;
} {
  const numsStr = String(inputs['input-nums'] || '1, 3, 6, 7');
  const nums = numsStr
    .split(',')
    .map((s: string) => parseInt(s.trim(), 10))
    .filter((n: number) => !isNaN(n));
  const k = parseInt(inputs['input-k'] || '8', 10);
  return { nums, k };
}

export interface TopKStep {
  stepIndex: number;
  kTarget: number;
  sortedNums: number[];
  heapSnapshot: { right: number; sum: number }[];
  ans: number[];
  poppedItem?: { right: number; sum: number };
  branch1?: { right: number; sum: number };
  branch2?: { right: number; sum: number };
  status: 'init' | 'pop' | 'branch' | 'done';
  message: string;
  log: string;
  codeLine?: HighlightTarget;
  metrics?: Record<string, any>;
}

export function buildTopKSubsequenceSumSteps(
  nums: number[],
  k: number
): TopKStep[] {
  const steps: TopKStep[] = [];
  const sorted = [...nums].sort((a, b) => a - b);
  const n = sorted.length;
  const targetK = Math.min(k, 1 << Math.min(n, 20)); // 安全上限

  const ans: number[] = [0]; // 空集累加和为 0 (第 1 小)
  const heap: { right: number; sum: number }[] = [];

  const lines = {
    entry: { java: 8, cpp: 7, python: 3, javascript: 2 },
    sort: { java: 9, cpp: 8, python: 5, javascript: 3 },
    pushFirst: { java: 12, cpp: 12, python: 7, javascript: 6 },
    loopStart: { java: 14, cpp: 14, python: 9, javascript: 7 },
    popHeap: { java: 15, cpp: 15, python: 10, javascript: 9 },
    branch: { java: 19, cpp: 18, python: 12, javascript: 11 },
    returnAns: { java: 24, cpp: 25, python: 15, javascript: 17 },
  };

  function makeStep(data: Omit<TopKStep, 'metrics'>): TopKStep {
    const popStr = data.poppedItem ? `(${data.poppedItem.sum}, 下标${data.poppedItem.right})` : '—';
    return {
      ...data,
      metrics: {
        'metric-collected-count': `${data.ans.length} / ${targetK}`,
        'metric-heap-size': `${data.heapSnapshot.length}`,
        'metric-popped-item': popStr,
        'metric-latest-sum': `${data.ans[data.ans.length - 1]}`,
      },
    };
  }

  // 1. 初始化入口
  steps.push(
    makeStep({
      stepIndex: 0,
      kTarget: targetK,
      sortedNums: [...sorted],
      heapSnapshot: [],
      ans: [...ans],
      status: 'init',
      message: `🚀 初始化算法：进入 topKSum 函数，准备对原数组进行非降序排序。`,
      log: `init: k=${targetK}`,
      codeLine: lines.entry,
    })
  );

  // 2. 升序排序
  steps.push(
    makeStep({
      stepIndex: 0,
      kTarget: targetK,
      sortedNums: [...sorted],
      heapSnapshot: [],
      ans: [...ans],
      status: 'init',
      message: `📊 数组升序排序为 [${sorted.join(', ')}]。空集和 0 默认作为第 1 小子序列和！`,
      log: `sort: sorted=[${sorted.join(', ')}], ans=[0]`,
      codeLine: lines.sort,
    })
  );

  if (n === 0 || targetK <= 1) {
    steps.push(
      makeStep({
        stepIndex: 1,
        kTarget: targetK,
        sortedNums: [...sorted],
        heapSnapshot: [],
        ans: [...ans],
        status: 'done',
        message: `🏁 收集完成！前 ${targetK} 个最小和已就绪。`,
        log: `done: ans=[${ans.join(', ')}]`,
        codeLine: lines.returnAns,
      })
    );
    return steps;
  }

  // 首个状态入堆
  heap.push({ right: 0, sum: sorted[0] });

  steps.push(
    makeStep({
      stepIndex: 1,
      kTarget: targetK,
      sortedNums: [...sorted],
      heapSnapshot: [...heap],
      ans: [...ans],
      status: 'init',
      message: `📥 初始种子入堆：将第一个单元素子序列 (和=${sorted[0]}, 最右下标=0) 放入小根堆。`,
      log: `heap seed: sum=${sorted[0]}, right=0`,
      codeLine: lines.pushFirst,
    })
  );

  for (let i = 1; i < targetK; i++) {
    if (heap.length === 0) break;

    heap.sort((a, b) => a.sum - b.sum);
    const cur = heap.shift()!;
    ans.push(cur.sum);

    steps.push(
      makeStep({
        stepIndex: steps.length,
        kTarget: targetK,
        sortedNums: [...sorted],
        heapSnapshot: [...heap],
        ans: [...ans],
        poppedItem: cur,
        status: 'pop',
        message: `👑 堆顶弹出：当前全局最小和为 ${cur.sum} (右边界下标=${cur.right})，收录为第 ${ans.length} 小子序列和！`,
        log: `pop: sum=${cur.sum}, right=${cur.right}`,
        codeLine: lines.popHeap,
      })
    );

    if (cur.right + 1 < n) {
      const nextNum = sorted[cur.right + 1];
      const b1 = { right: cur.right + 1, sum: cur.sum - sorted[cur.right] + nextNum };
      const b2 = { right: cur.right + 1, sum: cur.sum + nextNum };

      heap.push(b1);
      heap.push(b2);

      steps.push(
        makeStep({
          stepIndex: steps.length,
          kTarget: targetK,
          sortedNums: [...sorted],
          heapSnapshot: [...heap],
          ans: [...ans],
          poppedItem: cur,
          branch1: b1,
          branch2: b2,
          status: 'branch',
          message: `🌱 状态机两路扩展：\n1️⃣ 替换最右项：(${cur.sum} - ${sorted[cur.right]} + ${nextNum} = ${b1.sum}, 下标 ${b1.right})\n2️⃣ 追加新项：(${cur.sum} + ${nextNum} = ${b2.sum}, 下标 ${b2.right})，均推入堆！`,
          log: `branch: b1=${b1.sum}, b2=${b2.sum}`,
          codeLine: lines.branch,
        })
      );
    }
  }

  steps.push(
    makeStep({
      stepIndex: steps.length,
      kTarget: targetK,
      sortedNums: [...sorted],
      heapSnapshot: [...heap],
      ans: [...ans],
      status: 'done',
      message: `🎉 收集完毕！前 ${targetK} 个最小子序列和已严格升序生成：[${ans.join(', ')}]！`,
      log: `done: ans=[${ans.join(', ')}]`,
      codeLine: lines.returnAns,
    })
  );

  return steps;
}
