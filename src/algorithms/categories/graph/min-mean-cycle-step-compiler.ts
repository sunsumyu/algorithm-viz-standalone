/**
 * 最小均值回路与分数规划 (Minimum Mean Weight Cycle - Karp's Algorithm · 洛谷 P2868) 步进编译器
 * 进阶图论: 0-1 分数规划、边权重赋权 w'(e) = w(e) - lambda、SPFA 负环判定、二分逼近
 * 遵循 Matt Pocock 深模块规范，保持单一事实来源与纯中文交互日志
 */

import type { HighlightTarget } from '../../../core/renderers/dark-code-terminal-presenter';

export interface MinMeanStep {
  lambda: number;
  boundL: number;
  boundR: number;
  hasNegCycle: boolean;
  activeCycleNodes: number[];
  reweightedEdges: Array<{ u: number; v: number; origW: number; newW: number }>;
  status: 'guess' | 'detect' | 'converged';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, any>;
}

export function buildMinMeanCycleSteps(graphType: string): MinMeanStep[] {
  const steps: MinMeanStep[] = [];

  // 四语言 1-based 相对行号映射字典
  const lines = {
    entry:          { java: 56, cpp: 50, python: 23, javascript: 24 },
    spfaInit:       { java: 27, cpp: 27, python: 7,  javascript: 6 },
    spfaQueue:      { java: 32, cpp: 29, python: 9,  javascript: 8 },
    spfaRelax:      { java: 38, cpp: 35, python: 13, javascript: 12 },
    detectNegCycle: { java: 43, cpp: 39, python: 17, javascript: 16 },
    noNegCycle:     { java: 52, cpp: 47, python: 21, javascript: 21 },
    binaryIter:     { java: 66, cpp: 53, python: 27, javascript: 27 },
    narrowRange:    { java: 67, cpp: 54, python: 29, javascript: 29 },
    returnAns:      { java: 73, cpp: 60, python: 31, javascript: 33 },
  };

  const origEdges =
    graphType === 'three-nodes'
      ? [
          { u: 1, v: 2, w: 2 },
          { u: 2, v: 3, w: 2 },
          { u: 3, v: 1, w: 2 },
        ]
      : [
          { u: 1, v: 2, w: 4 },
          { u: 2, v: 3, w: 2 },
          { u: 3, v: 1, w: 3 },
          { u: 2, v: 4, w: 1 },
          { u: 4, v: 3, w: 1 },
        ];

  function makeStep(data: Omit<MinMeanStep, 'metrics'>): MinMeanStep {
    return {
      ...data,
      metrics: {
        'metric-bounds': `[${data.boundL.toFixed(3)}, ${data.boundR.toFixed(3)}]`,
        'metric-guess-lambda': `${data.lambda.toFixed(3)}`,
        'metric-cycle-status': data.hasNegCycle ? '⚠ 存在负环 (缩小上界)' : '✓ 无负环 (提高下界)',
        bounds: `[${data.boundL.toFixed(3)}, ${data.boundR.toFixed(3)}]`,
        'guess-lambda': `${data.lambda.toFixed(3)}`,
        'cycle-status': data.hasNegCycle ? '⚠ 存在负环 (缩小上界)' : '✓ 无负环 (提高下界)',
      },
    };
  }

  const reweight = (lmbda: number) =>
    origEdges.map((e) => ({
      u: e.u,
      v: e.v,
      origW: e.w,
      newW: Number((e.w - lmbda).toFixed(3)),
    }));

  // 1. 函数入口
  steps.push(
    makeStep({
      lambda: 0,
      boundL: 0.0,
      boundR: 5.0,
      hasNegCycle: false,
      activeCycleNodes: [],
      reweightedEdges: reweight(0),
      status: 'guess',
      message: '🚀 [函数入口] findMinMeanCycle: 开始 0-1 分数规划，求解有向图中边权平均值最小的简单回路。',
      log: '启动 findMinMeanCycle，有向边总数 m = ' + origEdges.length,
      codeLine: lines.entry,
    })
  );

  // 2. 初始化二分上下界
  steps.push(
    makeStep({
      lambda: 0,
      boundL: 0.0,
      boundR: 5.0,
      hasNegCycle: false,
      activeCycleNodes: [],
      reweightedEdges: reweight(0),
      status: 'guess',
      message: '📦 [二分区间初始化] 边权范围在 [0, 5]，设定二分搜索区间 [L, R] = [0.000, 5.000]。',
      log: '初始化二分搜索边界：double l = 0.0, r = 5.0;',
      codeLine: lines.spfaRelax,
    })
  );

  // --- 第 1 轮迭代：二分猜测 mid = 2.500 ---
  steps.push(
    makeStep({
      lambda: 2.5,
      boundL: 0.0,
      boundR: 5.0,
      hasNegCycle: false,
      activeCycleNodes: [],
      reweightedEdges: reweight(0),
      status: 'guess',
      message: '🔄 [第 1 轮二分] 计算中点 mid = (0.000 + 5.000) / 2 = 2.500，假设最小平均边权为 λ = 2.500。',
      log: '第 1 轮二分中点：mid = (0.000 + 5.000) / 2 = 2.500',
      codeLine: lines.noNegCycle,
    })
  );

  steps.push(
    makeStep({
      lambda: 2.5,
      boundL: 0.0,
      boundR: 5.0,
      hasNegCycle: false,
      activeCycleNodes: [],
      reweightedEdges: reweight(2.5),
      status: 'guess',
      message: '⚡ [边权动态赋权] 全图边权重赋为 w\'(e) = w(e) - 2.500。若重权图存在负环，说明真实最小均值 <= 2.500！',
      log: 'hasNegativeCycle(2.500): 全图边权全局减去 2.500',
      codeLine: lines.spfaRelax,
    })
  );

  steps.push(
    makeStep({
      lambda: 2.5,
      boundL: 0.0,
      boundR: 5.0,
      hasNegCycle: false,
      activeCycleNodes: [],
      reweightedEdges: reweight(2.5),
      status: 'detect',
      message: '📥 [SPFA 初始化] 超级源点向所有节点入队，初始化 dist[1..4] = 0, count[1..4] = 0。',
      log: 'SPFA 队列初始化：节点 1, 2, 3, 4 全部入队',
      codeLine: lines.spfaInit,
    })
  );

  steps.push(
    makeStep({
      lambda: 2.5,
      boundL: 0.0,
      boundR: 5.0,
      hasNegCycle: false,
      activeCycleNodes: [2, 4],
      reweightedEdges: reweight(2.5),
      status: 'detect',
      message: '🔍 [SPFA 边松弛 1] 弹出节点 2，松弛负权边 2➔4 (w\' = 1 - 2.5 = -1.5)，更新 dist[4] = -1.500。',
      log: '| 松弛边 (2->4): 新边权 = -1.500, dist[4] = -1.500',
      codeLine: lines.detectNegCycle,
    })
  );

  steps.push(
    makeStep({
      lambda: 2.5,
      boundL: 0.0,
      boundR: 5.0,
      hasNegCycle: false,
      activeCycleNodes: [4, 3],
      reweightedEdges: reweight(2.5),
      status: 'detect',
      message: '🔍 [SPFA 边松弛 2] 弹出节点 4，松弛负权边 4➔3 (w\' = 1 - 2.5 = -1.5)，更新 dist[3] = -3.000。',
      log: '| 松弛边 (4->3): 新边权 = -1.500, dist[3] = -3.000',
      codeLine: lines.detectNegCycle,
    })
  );

  steps.push(
    makeStep({
      lambda: 2.5,
      boundL: 0.0,
      boundR: 5.0,
      hasNegCycle: true,
      activeCycleNodes: [2, 4, 3],
      reweightedEdges: reweight(2.5),
      status: 'detect',
      message: '🛑 [SPFA 探测到负环] 回路 2➔4➔3➔2 权值和为 (-1.5) + (-1.5) + (-0.5) = -3.500 < 0，节点 2 入队次数超限！',
      log: '| 节点 2 入队次数超限，探测到负权回路 2->4->3->2，返回 true',
      codeLine: lines.spfaInit,
    })
  );

  steps.push(
    makeStep({
      lambda: 2.5,
      boundL: 0.0,
      boundR: 2.5,
      hasNegCycle: true,
      activeCycleNodes: [2, 4, 3],
      reweightedEdges: reweight(2.5),
      status: 'guess',
      message: '📉 [收缩上界] 判定存在负环 ⟹ 真实最小均值 λ* <= 2.500，收缩右界 R 🡰 2.500，新区间 [0.000, 2.500]。',
      log: '收缩上界：r = mid (2.500)',
      codeLine: lines.binaryIter,
    })
  );

  // --- 第 2 轮迭代：二分猜测 mid = 1.250 ---
  steps.push(
    makeStep({
      lambda: 1.25,
      boundL: 0.0,
      boundR: 2.5,
      hasNegCycle: false,
      activeCycleNodes: [],
      reweightedEdges: reweight(1.25),
      status: 'guess',
      message: '🔄 [第 2 轮二分] 计算中点 mid = (0.000 + 2.500) / 2 = 1.250，边权赋为 w\'(e) = w(e) - 1.250。',
      log: '第 2 轮二分中点：mid = 1.250，全局边权减 1.250',
      codeLine: lines.noNegCycle,
    })
  );

  steps.push(
    makeStep({
      lambda: 1.25,
      boundL: 0.0,
      boundR: 2.5,
      hasNegCycle: false,
      activeCycleNodes: [],
      reweightedEdges: reweight(1.25),
      status: 'detect',
      message: '🔍 [检验回路权值] 检查回路 2➔4➔3➔2 权值和：(1-1.25) + (1-1.25) + (2-1.25) = -0.25 - 0.25 + 0.75 = +0.25 > 0。',
      log: '回路 2->4->3->2 赋权和为 +0.250 > 0，非负环',
      codeLine: lines.spfaRelax,
    })
  );

  steps.push(
    makeStep({
      lambda: 1.25,
      boundL: 0.0,
      boundR: 2.5,
      hasNegCycle: false,
      activeCycleNodes: [],
      reweightedEdges: reweight(1.25),
      status: 'detect',
      message: '✓ [SPFA 检验完毕] 队列松弛正常结束，无任何节点入队次数达到 n，全图不存在负权回路，返回 false。',
      log: 'SPFA 队列清空，无负环，返回 false',
      codeLine: lines.spfaQueue,
    })
  );

  steps.push(
    makeStep({
      lambda: 1.25,
      boundL: 1.25,
      boundR: 2.5,
      hasNegCycle: false,
      activeCycleNodes: [],
      reweightedEdges: reweight(1.25),
      status: 'guess',
      message: '📈 [提高下界] 判定无负环 ⟹ 猜测值 λ = 1.250 小于真实最小均值，提高左界 L 🡰 1.250，新区间 [1.250, 2.500]。',
      log: '提升下界：l = mid (1.250)',
      codeLine: lines.narrowRange,
    })
  );

  // --- 第 3 轮迭代：二分猜测 mid = 1.875 ---
  steps.push(
    makeStep({
      lambda: 1.875,
      boundL: 1.25,
      boundR: 2.5,
      hasNegCycle: false,
      activeCycleNodes: [],
      reweightedEdges: reweight(1.875),
      status: 'guess',
      message: '🔄 [第 3 轮二分] 计算中点 mid = (1.250 + 2.500) / 2 = 1.875，重新重赋权检验。',
      log: '第 3 轮二分中点：mid = 1.875',
      codeLine: lines.noNegCycle,
    })
  );

  steps.push(
    makeStep({
      lambda: 1.875,
      boundL: 1.25,
      boundR: 2.5,
      hasNegCycle: true,
      activeCycleNodes: [2, 4, 3],
      reweightedEdges: reweight(1.875),
      status: 'detect',
      message: '🛑 [SPFA 再次探测负环] 回路 2➔4➔3➔2 权值和为 (1-1.875)*2 + (2-1.875) = -1.625 < 0，再次锁定负权回路！',
      log: '再次探测到负权回路，返回 true',
      codeLine: lines.spfaInit,
    })
  );

  steps.push(
    makeStep({
      lambda: 1.875,
      boundL: 1.25,
      boundR: 1.875,
      hasNegCycle: true,
      activeCycleNodes: [2, 4, 3],
      reweightedEdges: reweight(1.875),
      status: 'guess',
      message: '📉 [再次收缩上界] 再次收缩右界 R 🡰 1.875，二分区间缩小至 [1.250, 1.875]。',
      log: '再次收缩上界：r = mid (1.875)',
      codeLine: lines.binaryIter,
    })
  );

  // --- 二分连续逼近收敛 ---
  steps.push(
    makeStep({
      lambda: 1.333,
      boundL: 1.332,
      boundR: 1.334,
      hasNegCycle: false,
      activeCycleNodes: [2, 4, 3],
      reweightedEdges: reweight(1.333),
      status: 'converged',
      message: '🎯 [二分迭代逼近] 循环 40 次二分逼近，区间跨度 |R - L| < 10⁻⁵，极速收敛至最优解 λ* = 1.333！',
      log: '二分逼近收敛：|R - L| < 1e-5',
      codeLine: lines.detectNegCycle,
    })
  );

  steps.push(
    makeStep({
      lambda: 1.333,
      boundL: 1.333,
      boundR: 1.333,
      hasNegCycle: false,
      activeCycleNodes: [2, 4, 3],
      reweightedEdges: reweight(1.333),
      status: 'converged',
      message: '💎 [最优权值特征验证] 当 λ = 1.333 时，回路 2➔4➔3➔2 新权值和恰好为 0 (零环)，零环即为最优均值回路！',
      log: '零权回路特征验证：∑(w - λ*) = 0',
      codeLine: lines.spfaRelax,
    })
  );

  steps.push(
    makeStep({
      lambda: 1.333,
      boundL: 1.333,
      boundR: 1.333,
      hasNegCycle: false,
      activeCycleNodes: [2, 4, 3],
      reweightedEdges: reweight(1.333),
      status: 'converged',
      message: '🎉 [求解完毕] 最小均值回路为 2 ➔ 4 ➔ 3 ➔ 2，最小平均边权 λ* = (1 + 1 + 2) / 3 = 1.333！',
      log: '✓ return l = 1.333; 0-1 分数规划圆满完成！',
      codeLine: lines.returnAns,
    })
  );

  return steps;
}
