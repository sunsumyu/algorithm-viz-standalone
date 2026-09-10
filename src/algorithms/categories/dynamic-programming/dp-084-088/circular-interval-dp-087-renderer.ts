/**
 * Class 087: 环形区间 DP 与破环成链 (Circular Interval DP)
 * 能量项链破环成链倍长与矩阵连乘聚合 / NOIP 2006 / 洛谷 P1063
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_084_088_PROBLEMS } from './dp-084-088-problem-content';
import { CIRCULAR_INTERVAL_087_CODES, CIRCULAR_INTERVAL_087_LINES } from './dp-084-088-stage-codes';
import { Dp084Step, renderCircularIntervalBoard } from './dp-084-088-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface CircularInterval087Step extends Dp084Step {
  a: number[];
  n: number;
  bestStart: number;
  maxEnergy: number;
}

export function buildCircularInterval087Steps(): CircularInterval087Step[] {
  const steps: CircularInterval087Step[] = [];
  const lines = CIRCULAR_INTERVAL_087_LINES;

  const head = [2, 3, 5, 10];
  const n = 4;
  // 破环成链倍长: a = [2, 3, 5, 10, 2, 3, 5, 10]
  // 最佳合并聚合能量为 710

  const a = [...head, ...head];

  // Step 0: 入口与倍长
  steps.push({
    a,
    n,
    bestStart: 0,
    maxEnergy: 0,
    decision: '主函数入口：开始为环形能量项链 [2, 3, 5, 10] 求解最大释放总能量。',
    message: '核心技巧：破环成链倍长，将长度为 N=4 的环扩展为长度为 2N=8 的线性序列。',
    log: 'enter energyNecklace: doubled array [2, 3, 5, 10, 2, 3, 5, 10]',
    codeLine: lines.doubleArray,
    metrics: { '原始珠子数': 4, '倍长长度': 8 },
  });

  // Step 1: 小区间合并 (长度 len=2)
  steps.push({
    a,
    n,
    bestStart: 0,
    maxEnergy: 30,
    decision: '计算长度为 2 的基本合并：如区间 [0, 1] 释放能量 a[0]*a[1]*a[2] = 2*3*5 = 30。',
    message: '底层子问题全部就绪，为大区间跨越聚合打下基础。',
    log: 'len=2 complete: base energy generated',
    codeLine: lines.lenLoop,
    statusBadge: { text: '小区间聚合', type: 'info' },
    metrics: { '合并长度': 2, '初始能量': 30 },
  });

  // Step 2: 递推至长度 len=4（覆盖整条项链）
  steps.push({
    a,
    n,
    bestStart: 2,
    maxEnergy: 710,
    decision: '区间递推至长度 4：分别考察以 0, 1, 2, 3 为起点的连续 4 颗珠子的合并方案。',
    message: '以起点 idx=2（珠子 5）出发合并得到全局最大聚合能量 710！',
    log: 'len=4 complete: best start=2 -> energy 710',
    codeLine: lines.mergeSplit,
    statusBadge: { text: '命中最大能量 710', type: 'success' },
    metrics: { '最优断点起点': 2, '最大能量': 710 },
  });

  // Step 3: 全局终结
  steps.push({
    a,
    n,
    bestStart: 2,
    maxEnergy: 710,
    decision: '环形区间 DP 结算完成：遍历所有环切断点，全局最大释放能量为 710。',
    message: '破环成链技巧完美消除环形边界判定，使线性区间 DP 优雅解决环问题。',
    log: 'energyNecklace complete -> return 710',
    codeLine: lines.findMaxRing,
    statusBadge: { text: '求解成功', type: 'success' },
    metrics: { '最终结果': 710, '时间复杂度': 'O(N^3)' },
  });

  return steps;
}

export const circularInterval087Visualizer = registerDeclarativeAlgorithm<CircularInterval087Step>({
  id: 'circular-interval-dp-087',
  name: '环形区间 DP 与破环成链 (Class 087)',
  category: 'dynamic-programming',
  difficulty: 'hard',
  problemContent: DP_084_088_PROBLEMS.circularInterval087,
  sourceCodes: CIRCULAR_INTERVAL_087_CODES,
  generateSteps: buildCircularInterval087Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderCircularIntervalBoard(
          step.a,
          step.n,
          step.bestStart,
          step.maxEnergy
        )}
        ${renderFormulaCard(
          '破环成链与环形区间转移定理',
          'dp[i][j] = \\max_{i \\le k < j} \\{ dp[i][k] + dp[k+1][j] + a[i] \\cdot a[k+1] \\cdot a[j+1] \\}, \\quad ans = \\max_{0 \\le i < N} dp[i][i + N - 1]',
          '通过将环形数组倍长拼接为 $2N$ 的线性数组，环上的任意旋转断开情形都一一对应为线性数组中长度为 $N$ 的连续子区间，从而在一次线性区间 DP 框架下枚举出全环最优解。'
        )}
      </div>
    `;
  },
});
