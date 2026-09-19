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

export function buildCounting084Steps(input?: { n?: number } | number): Counting084Step[] {
  const steps: Counting084Step[] = [];
  const lines = COUNTING_DP_084_LINES;

  let targetN = 4;
  if (typeof input === 'number') {
    targetN = input;
  } else if (input && typeof input.n === 'number') {
    targetN = input.n;
  }
  const n = Math.max(1, Math.min(8, targetN));

  let prev2 = 0; // D(1)
  let prev1 = 1; // D(2)
  let cur = n === 1 ? 0 : 1;

  const history: { i: number; val: number }[] = [
    { i: 1, val: 0 },
  ];
  if (n >= 2) {
    history.push({ i: 2, val: 1 });
  }

  // Step 0: 入口与边界初始化
  steps.push({
    n,
    curI: Math.min(2, n),
    history: [...history],
    curAns: n === 1 ? 0 : 1,
    decision: `主函数入口：开始计算 N=${n} 时的全错排方案数 D(${n})。`,
    message: '初始化基本边界：1 个元素无法错排 D(1)=0；2 个元素仅有互相交换 1 种方案 D(2)=1。',
    log: `enter derangement: n=${n}, base cases D(1)=0, D(2)=1`,
    codeLine: lines.baseCases,
    metrics: { '目标规模 N': n, '初始计算': n === 1 ? 'D(1)=0' : 'D(2)=1' },
  });

  if (n <= 1) {
    steps.push({
      n,
      curI: 1,
      history: [{ i: 1, val: 0 }],
      curAns: 0,
      decision: 'N=1 边界触底：1 个元素无法错排，直接返回 0。',
      message: '元素只能放在自身位置，错排数为 0。',
      log: 'derangement complete -> return 0',
      codeLine: lines.returnAns,
      statusBadge: { text: 'D(1) = 0', type: 'info' },
      metrics: { '最终答案': 0, '时间复杂度': 'O(1)' },
    });
    return steps;
  }

  if (n === 2) {
    steps.push({
      n,
      curI: 2,
      history: [
        { i: 1, val: 0 },
        { i: 2, val: 1 },
      ],
      curAns: 1,
      decision: 'N=2 边界触底：2 个元素仅有互相交换 1 种方案，直接返回 1。',
      message: '仅有 (2, 1) 一种错排排列。',
      log: 'derangement complete -> return 1',
      codeLine: lines.returnAns,
      statusBadge: { text: 'D(2) = 1', type: 'success' },
      metrics: { '最终答案': 1, '时间复杂度': 'O(1)' },
    });
    return steps;
  }

  // 从 i = 3 推进到 n
  for (let i = 3; i <= n; i++) {
    cur = (i - 1) * (prev1 + prev2);
    history.push({ i, val: cur });

    // Step a: 递推计算
    steps.push({
      n,
      curI: i,
      history: [...history],
      curAns: cur,
      decision: `计算 i=${i}：根据错排递推式 D(${i}) = (${i} - 1) × [D(${i - 1}) + D(${i - 2})] = ${i - 1} × (${prev1} + ${prev2}) = ${cur}。`,
      message: `${i} 个元素的错排分类讨论：第 ${i} 个元素放入位置 k(共 ${i - 1} 种选法)。若第 k 个元素互换放入位置 ${i}，归约为 D(${i - 2})=${prev2}；若不互换，归约为 D(${i - 1})=${prev1}。`,
      log: `compute D(${i}) = (${i} - 1) * (${prev1} + ${prev2}) = ${cur}`,
      codeLine: lines.recurrence,
      statusBadge: { text: `D(${i}) = ${cur}`, type: 'info' },
      metrics: { '当前规模': i, '错排方案数': cur },
    });

    // Step b: 变量滚动
    prev2 = prev1;
    prev1 = cur;
    steps.push({
      n,
      curI: i,
      history: [...history],
      curAns: cur,
      decision: `状态滚动：prev2 更新为 ${prev2}，prev1 更新为 ${prev1}，为下一轮常数空间递推就绪。`,
      message: `空间优化技巧：只需记录最近两个前驱状态，空间复杂度成功降至 O(1)。`,
      log: `slide state: prev2=${prev2}, prev1=${prev1}`,
      codeLine: lines.slideState,
      metrics: { 'prev2': prev2, 'prev1': prev1 },
    });
  }

  // 终结返回
  steps.push({
    n,
    curI: n,
    history: [...history],
    curAns: cur,
    decision: `递推完成：${n} 个元素的全部错排方案数为 ${cur}。`,
    message: `算法在 O(N) 线性时间与 O(1) 常数空间下圆满产出结果。`,
    log: `derangement complete -> return ${cur}`,
    codeLine: lines.returnAns,
    statusBadge: { text: `最终结果 ${cur}`, type: 'success' },
    metrics: { '最终答案': cur, '时间复杂度': 'O(N)', '空间复杂度': 'O(1)' },
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
