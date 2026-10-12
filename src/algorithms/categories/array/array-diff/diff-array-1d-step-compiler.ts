/**
 * 一维差分数组步骤编译器
 * 负责推演差分标记与前缀和还原步骤
 */

import { DIFF_1D_LINES } from './array-diff-stage-codes';
import { ArrayDiffStep } from './array-diff-shared';

export interface Diff1DStep extends ArrayDiffStep {
  n: number;
  bookings: number[][];
}

export function buildDiff1DSteps(bookings: number[][], n: number): Diff1DStep[] {
  const steps: Diff1DStep[] = [];
  const lines = DIFF_1D_LINES;

  const diff = new Array(n + 2).fill(0);

  // Step 0: 入口
  steps.push({
    n,
    bookings,
    diffArray: [...diff],
    ansArray: [],
    decision: `主函数入口：处理 ${bookings.length} 组区间预订增量，总位置数 n=${n}`,
    message: '利用差分数组，每次区间修改只需 O(1) 标记两端点',
    log: `enter corpFlightBookings(bookings, n=${n})`,
    codeLine: lines.entry,
    metrics: { '区间总数': `${bookings.length}`, '长度 n': `${n}` },
  });

  // Step 1: 初始化差分数组
  steps.push({
    n,
    bookings,
    diffArray: [...diff],
    ansArray: [],
    decision: `分配差分数组：int[] diff = new int[${n + 2}] (1-based 下标便于处理边界)`,
    message: '初始化全为 0',
    log: 'init diff array',
    codeLine: lines.initDiff,
    metrics: { 'diff 长度': `${n + 2}` },
  });

  // Step 2: 循环处理每个区间
  for (const b of bookings) {
    const [l, r, val] = b;

    steps.push({
      n,
      bookings,
      diffArray: [...diff],
      ansArray: [],
      activeRange: { l, r, val },
      decision: `处理预订区间 [${l}, ${r}]：统一增加座位数 ${val}`,
      message: `准备执行 diff[${l}] += ${val}，diff[${r + 1}] -= ${val}`,
      log: `process booking [${l}, ${r}, ${val}]`,
      codeLine: lines.updateLoop,
      metrics: { '左端点 L': `${l}`, '右端点 R': `${r}`, '增量 val': `+${val}` },
    });

    diff[l] += val;
    steps.push({
      n,
      bookings,
      diffArray: [...diff],
      ansArray: [],
      activeRange: { l, r, val },
      decision: `标记左边界：diff[${l}] += ${val} ➔ diff[${l}] 变为 ${diff[l]} (表示从 ${l} 起增量生效)`,
      message: '左端点增加',
      log: `diff[${l}] += ${val} => ${diff[l]}`,
      codeLine: lines.applyAdd,
      metrics: { [`diff[${l}]`]: `${diff[l]}` },
    });

    diff[r + 1] -= val;
    steps.push({
      n,
      bookings,
      diffArray: [...diff],
      ansArray: [],
      activeRange: { l, r, val },
      decision: `标记右边界：diff[${r + 1}] -= ${val} ➔ diff[${r + 1}] 变为 ${diff[r + 1]} (表示从 ${r + 1} 起增量截断抵消)`,
      message: '右端点截断',
      log: `diff[${r + 1}] -= ${val} => ${diff[r + 1]}`,
      codeLine: lines.applySub,
      metrics: { [`diff[${r + 1}]`]: `${diff[r + 1]}` },
    });
  }

  // Step 3: 前缀和还原
  const ans = new Array(n).fill(0);
  ans[0] = diff[1];

  steps.push({
    n,
    bookings,
    diffArray: [...diff],
    ansArray: [...ans],
    decision: `开始前缀和还原：初始化 ans[0] = diff[1] = ${diff[1]}`,
    message: '第 1 项前缀和即为 diff[1]',
    log: 'init ans[0] = diff[1]',
    codeLine: lines.initAns,
    metrics: { 'ans[0]': `${ans[0]}` },
  });

  for (let i = 1; i < n; i++) {
    ans[i] = ans[i - 1] + diff[i + 1];
    steps.push({
      n,
      bookings,
      diffArray: [...diff],
      ansArray: [...ans],
      decision: `累加前缀和：ans[${i}] = ans[${i - 1}] + diff[${i + 1}] = ${ans[i - 1]} + ${diff[i + 1]} = ${ans[i]}`,
      message: `还原出第 ${i + 1} 项真实值`,
      log: `ans[${i}] = ${ans[i]}`,
      codeLine: lines.prefixScan,
      metrics: { [`ans[${i}]`]: `${ans[i]}` },
    });
  }

  // Step 4: 返回
  steps.push({
    n,
    bookings,
    diffArray: [...diff],
    ansArray: [...ans],
    decision: `🎉 前缀和扫描还原完成！最终数组 ans = [${ans.join(', ')}]`,
    message: '全流程仅需 O(n + m) 线性时间',
    log: 'done diff 1D',
    codeLine: lines.returnAns,
    metrics: { '最终结果': `[${ans.join(', ')}]` },
  });

  return steps;
}
