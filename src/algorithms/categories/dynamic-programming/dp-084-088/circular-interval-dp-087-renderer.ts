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

export function buildCircularInterval087Steps(input?: { head?: number[] } | number[]): CircularInterval087Step[] {
  const steps: CircularInterval087Step[] = [];
  const lines = CIRCULAR_INTERVAL_087_LINES;

  let rawHead = [2, 3, 5, 10];
  if (Array.isArray(input)) {
    rawHead = input;
  } else if (input && Array.isArray(input.head)) {
    rawHead = input.head;
  }
  const head = rawHead.length > 0 ? rawHead.slice(0, 6) : [2, 3, 5, 10];
  const n = head.length;
  const a = [...head, ...head];
  const totalLen = 2 * n;

  // dp[2n][2n]: dp[i][j] 表示合并珠子序列 [i..j] 释放的最大能量
  const dp: number[][] = Array.from({ length: totalLen }, () => new Array(totalLen).fill(0));

  // Step 0: 入口帧
  steps.push({
    a: [...a],
    n,
    bestStart: 0,
    maxEnergy: 0,
    decision: `主函数入口：开始为环形能量项链 [${head.join(', ')}] (共 ${n} 颗珠子) 求解最大释放能量。`,
    message: '核心破环成链技巧：将环形序列复制倍长为 2N 线性序列，任何旋转断开的环都对应一段长度为 N 的连续子区间。',
    log: `enter energyNecklace: head=[${head.join(', ')}], n=${n}`,
    codeLine: lines.entry,
    metrics: { '原始珠子数': n, '倍长长度': totalLen },
  });

  // Step 1: 破环成链倍长
  steps.push({
    a: [...a],
    n,
    bestStart: 0,
    maxEnergy: 0,
    decision: `破环成链倍长：生成长度为 ${totalLen} 的数组 [${a.join(', ')}]。`,
    message: `珠子首尾衔接：第 i 颗珠子的头标记为 a[i]，尾标记为 a[i+1]。倍长后可直接在 2N 数组上套用常规区间 DP。`,
    log: `doubled array: [${a.join(', ')}]`,
    codeLine: lines.doubleArray,
    metrics: { '倍长序列': a.join(', ') },
  });

  // 递推区间长度 len 从 2 到 n
  for (let len = 2; len <= n; len++) {
    steps.push({
      a: [...a],
      n,
      bestStart: 0,
      maxEnergy: dp[0]![len - 1] ?? 0,
      decision: `推进至区间合并跨度 len = ${len}：枚举所有长度为 ${len} 的连续珠子子段。`,
      message: `区间 DP 自底向上递推：长度为 ${len} 的区间合并依赖于严格更短的切分子区间。`,
      log: `len loop: len = ${len}`,
      codeLine: lines.lenLoop,
      statusBadge: { text: `跨度 len=${len}`, type: 'info' },
      metrics: { '当前合并跨度': len },
    });

    for (let i = 0; i <= totalLen - len; i++) {
      const j = i + len - 1;
      let maxVal = 0;
      let bestK = i;

      for (let k = i; k < j; k++) {
        const energyGain = a[i]! * a[k + 1]! * a[j + 1]!;
        const total = dp[i]![k]! + dp[k + 1]![j]! + energyGain;
        if (total > maxVal) {
          maxVal = total;
          bestK = k;
        }
      }
      dp[i]![j] = maxVal;

      steps.push({
        a: [...a],
        n,
        bestStart: i,
        maxEnergy: maxVal,
        decision: `区间 [${i}, ${j}] (长度 ${len})：最佳切分点 k=${bestK}，释放聚合能量 a[${i}]*a[${bestK + 1}]*a[${j + 1}] = ${a[i]! * a[bestK + 1]! * a[j + 1]!}，累计 dp[${i}][${j}] = ${maxVal}。`,
        message: `子区间 [${i}, ${bestK}] 能量 (${dp[i]![bestK]}) + [${bestK + 1}, ${j}] 能量 (${dp[bestK + 1]![j]}) + 本次合并释放 (${a[i]! * a[bestK + 1]! * a[j + 1]!}) = ${maxVal}。`,
        log: `mergeSplit [${i}, ${j}]: bestK=${bestK}, energy=${maxVal}`,
        codeLine: lines.mergeSplit,
        statusBadge: { text: `[${i}, ${j}] 能量: ${maxVal}`, type: 'info' },
        metrics: { '当前区间': `[${i}, ${j}]`, '聚合能量': maxVal },
      });
    }
  }

  // 遍历所有可能的环切断点
  let globalMax = 0;
  let bestStartIdx = 0;
  for (let i = 0; i < n; i++) {
    const ringEnergy = dp[i]![i + n - 1]!;
    if (ringEnergy > globalMax) {
      globalMax = ringEnergy;
      bestStartIdx = i;
    }
  }

  // Step 4: 终结返回
  steps.push({
    a: [...a],
    n,
    bestStart: bestStartIdx,
    maxEnergy: globalMax,
    decision: `遍历所有 ${n} 处切断点结算完成：以起点 idx=${bestStartIdx} (珠子 ${head[bestStartIdx]}) 切开项链时释放最大能量 ${globalMax}！`,
    message: `破环成链定理兑现：在 0 <= i < ${n} 中寻找 dp[i][i + ${n - 1}] 的全局极大值，最终最大释放总能量为 <strong>${globalMax}</strong>。`,
    log: `energyNecklace complete: bestStart=${bestStartIdx} -> maxEnergy=${globalMax}`,
    codeLine: lines.findMaxRing,
    statusBadge: { text: `最大能量 ${globalMax}`, type: 'success' },
    metrics: { '最优切断起点': bestStartIdx, '全局最大能量': globalMax },
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
