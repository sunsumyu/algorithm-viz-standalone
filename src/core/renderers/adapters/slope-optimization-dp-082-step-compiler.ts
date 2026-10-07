/**
 * Class 082: 斜率优化 DP 与单调队列凸包 (Slope Optimization DP) StepCompiler
 * 职责：点斜式线性转化、单调队列下凸壳与切线维护推演
 */

import { SLOPE_OPTIMIZATION_DP_082_LINES } from '../../../algorithms/categories/dynamic-programming/dp-079-083/dp-079-083-stage-codes';
import { Dp079Step } from '../../../algorithms/categories/dynamic-programming/dp-079-083/dp-079-083-shared';

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
    line: lines.entry.javascript,
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
    line: lines.prefixSums.javascript,
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
        decision: `队头淘汰：线段 (P${popped}, P${q[head]!}) 斜率 ${segSlope.toFixed(2)} <= 当前查询斜率 K=${curK}。`,
        message: '由于查询斜率递增，该左侧切点在后续任何状态中均不可能再成为最优决策点，安全弹出队头！',
        log: `pop head ${popped}: slope=${segSlope.toFixed(2)} <= K=${curK}`,
        line: lines.popHead.javascript,
        codeLine: lines.popHead,
        statusBadge: { text: `弹出队头 P${popped}`, type: 'warning' },
        metrics: { '当前任务 i': i, '查询斜率 K': curK, '新队头': `P${q[head]!}` },
      });
    }

    const bestJ = q[head]!;
    dp[i] = dp[bestJ]! + sumT[i]! * (sumF[i]! - sumF[bestJ]!) + s * (sumF[n]! - sumF[bestJ]!);

    steps.push({
      points: [...points],
      hullIndices: getHullIndices(),
      curSlope: curK,
      bestJ,
      curDp: dp[i]!,
      decision: `最佳决策选定：队头切点 P${bestJ} 取得最小截距，计算 dp[${i}] = ${dp[i]}。`,
      message: `斜率为 ${curK} 的切线与凸包首先相切于 P${bestJ}，在所有历史划分点中产生最低开销 ${dp[i]}。`,
      log: `optimal j=${bestJ} for i=${i}: dp[${i}]=${dp[i]}`,
      line: lines.transOpt.javascript,
      codeLine: lines.transOpt,
      statusBadge: { text: `dp[${i}] = ${dp[i]}`, type: 'success' },
      metrics: { '当前任务 i': i, '最佳转移点 j': bestJ, '最优开销 dp[i]': dp[i]! },
    });

    // 构造新点 Pi
    const newPoint = { idx: i, x: sumF[i]!, y: dp[i]! };
    points.push(newPoint);

    // 2. 队尾维护下凸性
    while (head < tail && slope(q[tail - 1]!, q[tail]!) >= slope(q[tail]!, i)) {
      const popped = q[tail]!;
      tail--;
      steps.push({
        points: [...points],
        hullIndices: getHullIndices(),
        curSlope: curK,
        bestJ,
        curDp: dp[i]!,
        decision: `队尾弹出维护凸壳：点 P${popped} 破坏了下凸性，凹陷点不可能成为最优切点。`,
        message: `斜率产生非单调折角，弹出队尾 P${popped}，维持严格单调递增的下凸壳。`,
        log: `pop tail ${popped}: violated convexity with new point P${i}`,
        line: lines.popTailHull.javascript,
        codeLine: lines.popTailHull,
        statusBadge: { text: `弹出队尾 P${popped}`, type: 'warning' },
        metrics: { '当前任务 i': i, '凹陷淘汰点': `P${popped}` },
      });
    }

    tail++;
    q[tail] = i;

    steps.push({
      points: [...points],
      hullIndices: getHullIndices(),
      curSlope: curK,
      bestJ,
      curDp: dp[i]!,
      decision: `新决策点 P${i}(${newPoint.x}, ${newPoint.y}) 成功加入下凸壳队尾。`,
      message: '凸包维持严格单调递增，队列中各相邻点割线斜率严格递增。',
      log: `push tail P${i} into hull`,
      line: lines.pushHull.javascript,
      codeLine: lines.pushHull,
      statusBadge: { text: `P${i} 入队`, type: 'info' },
      metrics: { '凸包顶点数': tail - head + 1 },
    });
  }

  // 终结步骤
  steps.push({
    points: [...points],
    hullIndices: getHullIndices(),
    curSlope: 0,
    bestJ: q[head]!,
    curDp: dp[n]!,
    decision: `斜率优化 DP 求解完成：所有 ${n} 个任务全部安排完毕，最低总费用为 ${dp[n]}！`,
    message: '每个任务进出单调队列至多一次，全过程均摊时间复杂度为严格 O(N)。',
    log: `taskSchedule complete -> minCost = ${dp[n]}`,
    line: lines.returnAns.javascript,
    codeLine: lines.returnAns,
    statusBadge: { text: `最低开销: ${dp[n]}`, type: 'success' },
    metrics: { '总任务数': n, '最低总开销': dp[n]!, '时间复杂度': 'O(N)' },
  });

  return steps;
}
