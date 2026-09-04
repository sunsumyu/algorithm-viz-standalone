/**
 * 最小均值回路与分数规划 (Minimum Mean Weight Cycle - Karp's Algorithm) 声明式可视化器
 * 进阶图论: 0-1 分数规划、边权重赋权 w'(e) = w(e) - lambda、SPFA 负环判定、二分逼近
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  MIN_MEAN_CYCLE_CODE_LANGUAGES,
  MIN_MEAN_CYCLE_PROBLEM_HTML,
  MIN_MEAN_CYCLE_ANALYSIS_HTML,
} from './min-mean-cycle-problem-content';

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
  codeLine: number | number[];
  metrics?: Record<string, any>;
}

export function buildMinMeanCycleSteps(graphType: string): MinMeanStep[] {
  const steps: MinMeanStep[] = [];

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
      codeLine: 56,
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
      log: 'double l = 0.0, r = 5.0;',
      codeLine: 64,
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
      log: 'iter 0: mid = (0.000 + 5.000) / 2 = 2.500',
      codeLine: 66,
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
      log: 'hasNegativeCycle(2.500): 边权全局减 2.500',
      codeLine: 38,
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
      codeLine: 27,
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
      log: '| relax edge (2->4): newW = -1.500, dist[4] = -1.500',
      codeLine: 39,
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
      log: '| relax edge (4->3): newW = -1.500, dist[3] = -3.000',
      codeLine: 39,
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
      log: '| count[2] >= 4 -> 探测到负权回路 2->4->3->2，return true',
      codeLine: 42,
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
      log: 'r = mid; // 更新上界 R -> 2.500',
      codeLine: 68,
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
      log: 'iter 1: mid = 1.250，边权减 1.250',
      codeLine: 66,
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
      log: '回路 2->4->3->2 权值和 +0.250 > 0，非负环',
      codeLine: 38,
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
      log: 'SPFA 队列清空，无负环，return false',
      codeLine: 52,
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
      log: 'l = mid; // 更新下界 L -> 1.250',
      codeLine: 70,
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
      log: 'iter 2: mid = 1.875',
      codeLine: 66,
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
      log: '探测到负权回路，return true',
      codeLine: 42,
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
      log: 'r = mid; // 更新上界 R -> 1.875',
      codeLine: 68,
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
      codeLine: 65,
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
      log: '零权回路特征：sum(w - λ*) = 0',
      codeLine: 38,
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
      log: '✓ return l = 1.333; 0-1分数规划圆满完成！',
      codeLine: 73,
    })
  );

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<MinMeanStep>({
  id: 'min-mean-cycle',
  name: '最小均值回路 (Min Mean Cycle)',
  category: 'graph',
  icon: '🔄',
  badge: {
    mode: '0-1 分数规划 + SPFA 负环',
    complexity: 'O(V · E · log(W/ε)) · O(V + E)',
  },
  card1Title: '🌐 有向带权图与赋权残量沙盘',
  card2Title: '🧭 二分区间 [L, R] 与负环判定监视器',
  card2Desc: '二分平均值 λ、新边权 w\'=w-λ 与 SPFA 负权回路高亮',
  legend: [
    { label: '正权边 (w\' ≥ 0)', color: '#38bdf8' },
    { label: '负权边 (w\' < 0)', color: '#facc15' },
    { label: '🔴 负权回路 (Negative Cycle)', color: '#ef4444' },
  ],
  inputs: [
    {
      id: 'input-graph-type',
      label: '图用例',
      type: 'select',
      defaultValue: 'four-nodes',
      options: [
        { label: '4 节点双回路图 (ans=1.333)', value: 'four-nodes' },
        { label: '3 节点单回路图 (ans=2.000)', value: 'three-nodes' },
      ],
      width: '180px',
    },
  ],
  presets: [
    { label: '4 节点双回路图 (ans=1.333)', values: { 'input-graph-type': 'four-nodes' } },
    { label: '3 节点单回路图 (ans=2.000)', values: { 'input-graph-type': 'three-nodes' } },
  ],
  metrics: [
    { id: 'metric-bounds', label: '二分区间 [L, R]', color: '#2563eb' },
    { id: 'metric-guess-lambda', label: '当前猜测 λ', color: '#0d9488' },
    { id: 'metric-cycle-status', label: '负环判定', color: '#ef4444' },
  ],
  codeLanguages: MIN_MEAN_CYCLE_CODE_LANGUAGES,
  problemHtml: MIN_MEAN_CYCLE_PROBLEM_HTML,
  analysisHtml: MIN_MEAN_CYCLE_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const gType = inputs['input-graph-type'] || 'four-nodes';
    return buildMinMeanCycleSteps(gType);
  },
  renderCanvas: (container, step) => {
    const nodePositions: Record<number, { x: number; y: number }> = {
      1: { x: 75, y: 55 },
      2: { x: 235, y: 55 },
      3: { x: 75, y: 175 },
      4: { x: 235, y: 175 },
    };

    const svgEdges = step.reweightedEdges
      .map((e) => {
        const p1 = nodePositions[e.u];
        const p2 = nodePositions[e.v];
        if (!p1 || !p2) return '';

        const isCycleEdge = step.activeCycleNodes.includes(e.u) && step.activeCycleNodes.includes(e.v);
        const isNegEdge = e.newW < 0;
        const color = isCycleEdge ? '#ef4444' : isNegEdge ? '#facc15' : '#38bdf8';
        const strokeWidth = isCycleEdge ? 3 : 1.5;

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 6;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${strokeWidth}" marker-end="url(#arrow-${isCycleEdge ? 'neg' : 'default'})" />
            <rect x="${midX - 25}" y="${midY - 8}" width="50" height="14" rx="3" fill="#0f172a" fill-opacity="0.85" />
            <text x="${midX}" y="${midY + 3}" fill="${color}" font-size="8.5" font-weight="700" font-family="monospace" text-anchor="middle">w':${e.newW}</text>
          </g>
        `;
      })
      .join('');

    const nodes = [1, 2, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const pos = nodePositions[u];
        if (!pos) return '';
        const inCycle = step.activeCycleNodes.includes(u);
        const bg = inCycle ? '#7f1d1d' : '#1e3a8a';
        const border = inCycle ? '#ef4444' : '#38bdf8';

        return `
          <g>
            <circle cx="${pos.x}" cy="${pos.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${inCycle ? '2.5' : '1.5'}" />
            <text x="${pos.x}" y="${pos.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 210">
          <defs>
            <marker id="arrow-default" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#38bdf8" />
            </marker>
            <marker id="arrow-neg" viewBox="0 0 10 10" refX="21" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#ef4444" />
            </marker>
          </defs>
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🔴 红色高亮为 SPFA 探测到的负权回路 | 边上标注动态赋权 w'(e) = w(e) - λ
        </div>
      </div>
    `;

    const root = container.closest('#algo-min-mean-cycle-view');
    if (root) {
      const boundsEl = root.querySelector('#metric-bounds') || root.querySelector('#bounds');
      const lambdaEl = root.querySelector('#metric-guess-lambda') || root.querySelector('#guess-lambda');
      const cycleEl = root.querySelector('#metric-cycle-status') || root.querySelector('#cycle-status');

      if (boundsEl) boundsEl.textContent = `[${step.boundL.toFixed(3)}, ${step.boundR.toFixed(3)}]`;
      if (lambdaEl) lambdaEl.textContent = `${step.lambda.toFixed(3)}`;
      if (cycleEl) {
        cycleEl.textContent = step.hasNegCycle ? '⚠ 存在负环 (缩小上界)' : '✓ 无负环 (提高下界)';
        (cycleEl as HTMLElement).style.color = step.hasNegCycle ? '#ef4444' : '#10b981';
      }

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 分数规划判据:</span>
              <strong style="font-family: monospace; color: #2563eb;">存在负环 ⟺ λ* < λ</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'min-mean-cycle',
  name: '最小均值回路 (Min Mean Cycle)',
  viewId: 'algo-min-mean-cycle-view',
  category: 'graph',
  description: '进阶图论 0-1 分数规划：边权动态赋权 w\'(e)=w(e)-λ、SPFA 负环判别与二分逼近最小平均回路 (洛谷 P2868)',
  icon: '🔄',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 73,
  learningGoal: '掌握 0-1 分数规划转化为负环判定的数学原理、二分逼近与 Karp 最小均值回路算法',
});

export { Visualizer as MinMeanCycleVisualizer };
