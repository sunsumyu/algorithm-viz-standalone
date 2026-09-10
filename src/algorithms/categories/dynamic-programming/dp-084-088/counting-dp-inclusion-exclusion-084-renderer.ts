/**
 * Class 084: 计数 DP 与错排问题 (Derangement & Counting DP)
 * 错排递推公式与容斥原理展开 / 洛谷 P1595
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_084_088_PROBLEMS } from './dp-084-088-problem-content';
import { COUNTING_DP_084_CODES, COUNTING_DP_084_LINES } from './dp-084-088-stage-codes';
import { Dp084Step, renderCountingDpBoard } from './dp-084-088-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface Counting084Step extends Dp084Step {
  n: number;
  curI: number;
  history: { i: number; val: number }[];
  curAns: number;
}

export function buildCounting084Steps(): Counting084Step[] {
  const steps: Counting084Step[] = [];
  const lines = COUNTING_DP_084_LINES;

  const n = 4;
  // D(1) = 0, D(2) = 1
  // D(3) = (3 - 1) * (1 + 0) = 2
  // D(4) = (4 - 1) * (2 + 1) = 9

  // Step 0: 入口与边界初始化
  steps.push({
    n,
    curI: 2,
    history: [
      { i: 1, val: 0 },
      { i: 2, val: 1 },
    ],
    curAns: 1,
    decision: '主函数入口：开始计算 N=4 时的全错排方案数 D(4)。',
    message: '初始化基本边界：1 个元素无法错排 D(1)=0；2 个元素仅有互相交换 1 种方案 D(2)=1。',
    log: 'enter derangement: n=4, base cases D(1)=0, D(2)=1',
    codeLine: lines.baseCases,
    metrics: { '目标规模 N': 4, '当前计算': 'D(2)=1' },
  });

  // Step 1: 计算 i=3
  steps.push({
    n,
    curI: 3,
    history: [
      { i: 1, val: 0 },
      { i: 2, val: 1 },
      { i: 3, val: 2 },
    ],
    curAns: 2,
    decision: '计算 i=3：根据错排递推式 D(3) = (3 - 1) * [D(2) + D(1)] = 2 * (1 + 0) = 2。',
    message: '3 个元素的错排方案数为 2（即排列 (2, 3, 1) 和 (3, 1, 2)）。',
    log: 'compute D(3) = 2 * (1 + 0) = 2',
    codeLine: lines.recurrence,
    statusBadge: { text: 'D(3) = 2', type: 'info' },
    metrics: { '规模': 3, '方案数': 2 },
  });

  // Step 2: 计算 i=4 (达到目标)
  steps.push({
    n,
    curI: 4,
    history: [
      { i: 1, val: 0 },
      { i: 2, val: 1 },
      { i: 3, val: 2 },
      { i: 4, val: 9 },
    ],
    curAns: 9,
    decision: '计算 i=4：根据错排递推式 D(4) = (4 - 1) * [D(3) + D(2)] = 3 * (2 + 1) = 9。',
    message: '4 个元素的错排方案数为 9，常数空间滚动更新完毕。',
    log: 'compute D(4) = 3 * (2 + 1) = 9',
    codeLine: lines.recurrence,
    statusBadge: { text: 'D(4) = 9', type: 'success' },
    metrics: { '规模': 4, '最终方案数': 9 },
  });

  // Step 3: 终结返回
  steps.push({
    n,
    curI: 4,
    history: [
      { i: 1, val: 0 },
      { i: 2, val: 1 },
      { i: 3, val: 2 },
      { i: 4, val: 9 },
    ],
    curAns: 9,
    decision: '递推完成：4 个元素的全部错排方案数为 9。',
    message: '算法在 O(N) 线性时间与 O(1) 空间下高效产出结果。',
    log: 'derangement complete -> return 9',
    codeLine: lines.returnAns,
    statusBadge: { text: '计算完成', type: 'success' },
    metrics: { '最终答案': 9, '时间复杂度': 'O(N)' },
  });

  return steps;
}

export const countingDp084Visualizer = registerDeclarativeAlgorithm<Counting084Step>({
  id: 'counting-dp-inclusion-exclusion-084',
  name: '计数 DP 与错排问题 (Class 084)',
  category: 'dynamic-programming',
  difficulty: 'medium',
  problemContent: DP_084_088_PROBLEMS.countingDp084,
  sourceCodes: COUNTING_DP_084_CODES,
  generateSteps: buildCounting084Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderCountingDpBoard(
          step.n,
          step.curI,
          step.history,
          step.curAns
        )}
        ${renderFormulaCard(
          '经典错排递推方程与容斥定理',
          'D(n) = (n - 1) \\times [D(n - 1) + D(n - 2)], \\quad D(n) = n! \\sum_{k=0}^{n} \\frac{(-1)^k}{k!}',
          '将第 $n$ 个元素的落点分为与目标位置元素对换（归约为 $D(n-2)$）以及不对换（归约为 $D(n-1)$）两类互斥情形，满足不重不漏计数原理。'
        )}
      </div>
    `;
  },
});
