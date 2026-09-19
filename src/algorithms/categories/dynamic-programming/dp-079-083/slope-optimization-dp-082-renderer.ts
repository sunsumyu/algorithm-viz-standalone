/**
 * Class 082: 斜率优化 DP 与单调队列凸包 (Slope Optimization DP)
 * 点斜式线性转化与下凸壳 O(N) 动态切线维护 / 洛谷 P2365
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_079_083_PROBLEMS } from './dp-079-083-problem-content';
import { SLOPE_OPTIMIZATION_DP_082_CODES, SLOPE_OPTIMIZATION_DP_082_LINES } from './dp-079-083-stage-codes';
import { Dp079Step, renderSlopeOptBoard } from './dp-079-083-shared';
import { renderFormulaCard } from '../../string/string-100-105/string-100-105-shared';

export interface SlopeOpt082Step extends Dp079Step {
  points: { idx: number; x: number; y: number }[];
  hullIndices: number[];
  curSlope: number;
  bestJ: number;
  curDp: number;
}

export interface SlopeOpt082Input {
  t?: number[];
  f?: number[];
  s?: number;
}

export function buildSlopeOpt082Steps(input?: SlopeOpt082Input): SlopeOpt082Step[] {
  const steps: SlopeOpt082Step[] = [];
  const lines = SLOPE_OPTIMIZATION_DP_082_LINES;

  const t = input?.t || [0, 4, 5, 3];
  const f = input?.f || [0, 1, 1, 5];
  const s = input?.s !== undefined ? input.s : 1;
  const n = t.length - 1;

  const sumT: number[] = new Array(n + 1).fill(0);
  const sumF: number[] = new Array(n + 1).fill(0);
  for (let i = 1; i <= n; i++) {
    sumT[i] = sumT[i - 1]! + t[i]!;
    sumF[i] = sumF[i - 1]! + f[i]!;
  }

  // q: 维护下凸壳点索引的单调队列
  const q: number[] = new Array(n + 1).fill(0);
  let head = 0;
  let tail = 0;
  q[0] = 0;

  const dp: number[] = new Array(n + 1).fill(0);
  const points: { idx: number; x: number; y: number }[] = [{ idx: 0, x: 0, y: 0 }];

  function getHullIndices(): number[] {
    return q.slice(head, tail + 1);
  }

  function slope(j1: number, j2: number): number {
    const x1 = sumF[j1]!;
    const x2 = sumF[j2]!;
    const y1 = dp[j1]!;
    const y2 = dp[j2]!;
    if (x1 === x2) return y2 >= y1 ? Infinity : -Infinity;
    return (y2 - y1) / (x2 - x1);
  }

  // Step 0: 入口
  steps.push({
    points: [...points],
    hullIndices: getHullIndices(),
    curSlope: 0,
    bestJ: 0,
    curDp: 0,
    decision: `主函数入口：开始为任务安排问题 (N=${n}, 启动开销 S=${s}) 求解最小总费用。`,
    message: '将 DP 状态改写为直线的点斜式 $Y = K \\cdot X + B$，截距 $B$ 即为待最小化的目标。初始决策点 P0(0, 0) 入队。',
    log: `enter taskSchedule: n=${n}, s=${s}, t=[${t.join(',')}], f=[${f.join(',')}]`,
    codeLine: lines.entry,
    metrics: { '任务数 N': n, '启动开销 S': s, '初始队列大小': 1 },
  });

  // Step 1: 前缀和预处理
  steps.push({
    points: [...points],
    hullIndices: getHullIndices(),
    curSlope: 0,
    bestJ: 0,
    curDp: 0,
    decision: `前缀和预处理：时间前缀和 sumT=[${sumT.join(', ')}]，费用前缀和 sumF=[${sumF.join(', ')}]。`,
    message: '前缀和数组单调递增，为后续点坐标 X=sumF 以及查询斜率 K=sumT+S 的单调性奠定基础。',
    log: `prefix sums computed: sumT=[${sumT.join(',')}], sumF=[${sumF.join(',')}]`,
    codeLine: lines.prefixSums,
    statusBadge: { text: '前缀和就绪', type: 'info' },
    metrics: { '总时间': sumT[n]!, '总费用': sumF[n]! },
  });

  for (let i = 1; i <= n; i++) {
    const curK = sumT[i]! + s;

    // 1. 队头淘汰：切线斜率不足以支撑最优性
    while (head < tail && slope(q[head]!, q[head + 1]!) <= curK) {
      const popped = q[head]!;
      const segSlope = slope(popped, q[head + 1]!);
      head++;
      steps.push({
        points: [...points],
        hullIndices: getHullIndices(),
        curSlope: curK,
        bestJ: q[head]!,
        curDp: dp[i - 1]!,
        decision: `考察 i=${i}：当前查询斜率 K=${curK} 超过相邻割线斜率 ${segSlope.toFixed(2)}，决策点 P${popped} 永远不再最优，从队头淘汰！`,
        message: `由于查询斜率单调递增，切线触点持续右移，左侧斜率较平缓的点可直接弹出。`,
        log: `pop head: P${popped} popped, new head is P${q[head]}`,
        codeLine: lines.popHead,
        statusBadge: { text: `队头淘汰 P${popped}`, type: 'warning' },
        metrics: { '当前斜率 K': curK, '淘汰点': popped, '新队头': q[head]! },
      });
    }

    // 2. 队头即为最优决策点 j
    const j = q[head]!;
    dp[i] = dp[j]! + sumT[i]! * (sumF[i]! - sumF[j]!) + s * (sumF[n]! - sumF[j]!);

    steps.push({
      points: [...points],
      hullIndices: getHullIndices(),
      curSlope: curK,
      bestJ: j,
      curDp: dp[i],
      decision: `遍历 i=${i}：单调队列锁定最优决策点 j=${j}，切线截距最小化，得出 dp[${i}] = ${dp[i]}！`,
      message: `将任务批次划分为 [1..${j}] 与 [${j + 1}..${i}]，当前批次总费用增量计入全局结果。`,
      log: `task i=${i}: best j=${j}, dp[${i}]=${dp[i]}`,
      codeLine: lines.transOpt,
      statusBadge: { text: `dp[${i}] = ${dp[i]}`, type: 'info' },
      metrics: { '当前任务': i, '最优前驱 j': j, [`dp[${i}]`]: dp[i] },
    });

    // 3. 维护队尾下凸性
    const newPoint = { idx: i, x: sumF[i]!, y: dp[i] };
    points.push(newPoint);

    while (head < tail && slope(q[tail - 1]!, q[tail]!) >= slope(q[tail]!, i)) {
      const poppedTail = q[tail]!;
      tail--;
      steps.push({
        points: [...points],
        hullIndices: getHullIndices(),
        curSlope: curK,
        bestJ: j,
        curDp: dp[i],
        decision: `维护凸包：点 P${poppedTail} 导致下凸壳凹陷（斜率非严格递增），从队尾弹出！`,
        message: '下凸壳要求相邻线段斜率严格单调递增，凹点无法作为任何切线的触点。',
        log: `pop tail: P${poppedTail} popped from hull to maintain convexity`,
        codeLine: lines.popTailHull,
        statusBadge: { text: `队尾弹出 P${poppedTail}`, type: 'warning' },
        metrics: { '凹陷点': poppedTail, '当前凸包点数': tail - head + 1 },
      });
    }

    tail++;
    q[tail] = i;

    steps.push({
      points: [...points],
      hullIndices: getHullIndices(),
      curSlope: curK,
      bestJ: j,
      curDp: dp[i],
      decision: `新点入队：将点 P${i}(${newPoint.x}, ${newPoint.y}) 压入单调队列，下凸壳形态更新完成。`,
      message: `单调队列当前有效点集为 [${getHullIndices().map((idx) => `P${idx}`).join(', ')}]。`,
      log: `push hull: P${i}(${newPoint.x}, ${newPoint.y}) pushed`,
      codeLine: lines.pushHull,
      statusBadge: { text: `P${i} 入队`, type: 'info' },
      metrics: { '新入队点': `P${i}`, '队列长度': tail - head + 1 },
    });
  }

  const finalCost = dp[n]!;

  // 终结汇总帧
  steps.push({
    points: [...points],
    hullIndices: getHullIndices(),
    curSlope: sumT[n]! + s,
    bestJ: q[head]!,
    curDp: finalCost,
    decision: `全量任务安排终结：完成全部 ${n} 个任务的最优最小总费用为 dp[${n}] = ${finalCost}！`,
    message: '单调队列动态维护下凸壳切线，将原本 O(N^2) 的二次规划直接优化至 O(N) 线性均摊时间。',
    log: `taskSchedule complete -> return ${finalCost}`,
    codeLine: lines.returnAns,
    statusBadge: { text: `最终最优费用: ${finalCost}`, type: 'success' },
    metrics: { '最终总费用': finalCost, '时间复杂度': 'O(N)' },
  });

  return steps;
}

export const slopeOptDp082Visualizer = registerDeclarativeAlgorithm<SlopeOpt082Step>({
  id: 'slope-optimization-dp-082',
  name: '斜率优化 DP 与单调队列凸包 (Class 082)',
  category: 'dynamic-programming',
  difficulty: 'hard',
  problemContent: DP_079_083_PROBLEMS.slopeOptDp082,
  sourceCodes: SLOPE_OPTIMIZATION_DP_082_CODES,
  generateSteps: buildSlopeOpt082Steps,
  renderCanvas: (container, step) => {
    container.innerHTML = `
      <div style="padding: 16px; font-family: system-ui, -apple-system, sans-serif;">
        ${renderSlopeOptBoard(
          step.points,
          step.hullIndices,
          step.curSlope,
          step.bestJ,
          step.curDp
        )}
        ${renderFormulaCard(
          '点斜式下凸壳几何定理',
          '\\text{Slope}(j_1, j_2) = \\frac{Y_2 - Y_1}{X_2 - X_1} \\le K(i) \\implies j_1 \\text{ 恒劣于 } j_2',
          '通过将交叉乘积项改写为点斜式 $Y = K \\cdot X + B$，最优决策点必位于点集的下凸壳切点处。利用单调队列维护凸包相邻斜率递增性，实现均摊 $O(1)$ 的最优决策点查找与点入队维护。'
        )}
      </div>
    `;
  },
});
