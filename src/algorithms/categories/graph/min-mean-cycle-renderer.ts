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

  // 1. 初始猜测 lambda = 2.5
  const reweighted1 = origEdges.map((e) => ({
    u: e.u,
    v: e.v,
    origW: e.w,
    newW: Number((e.w - 2.5).toFixed(2)),
  }));

  steps.push({
    lambda: 2.5,
    boundL: 0.0,
    boundR: 5.0,
    hasNegCycle: true,
    activeCycleNodes: [2, 4, 3],
    reweightedEdges: reweighted1,
    status: 'guess',
    message: '⚡ [二分猜测 lambda = 2.5] 边权赋为 w\' = w - 2.5。计算回路 2➔4➔3➔2 新权和为 -3.5 < 0，触发负环！',
    log: '二分猜测 λ=2.500，重赋权检验',
    codeLine: [18, 25],
  });

  // 2. 负环确认，收缩上界 R = 2.5
  steps.push({
    lambda: 2.5,
    boundL: 0.0,
    boundR: 2.5,
    hasNegCycle: true,
    activeCycleNodes: [2, 4, 3],
    reweightedEdges: reweighted1,
    status: 'detect',
    message: '🛑 [负环成立] SPFA 探测到负权回路，说明最小平均权值 <= 2.5，收缩上界 R = 2.5！',
    log: 'SPFA 探测到负环：λ* <= 2.500，更新 R -> 2.500',
    codeLine: [32, 38],
  });

  // 3. 第二轮猜测 lambda = 1.25
  const reweighted2 = origEdges.map((e) => ({
    u: e.u,
    v: e.v,
    origW: e.w,
    newW: Number((e.w - 1.25).toFixed(2)),
  }));

  steps.push({
    lambda: 1.25,
    boundL: 1.25,
    boundR: 2.5,
    hasNegCycle: false,
    activeCycleNodes: [],
    reweightedEdges: reweighted2,
    status: 'guess',
    message: '📈 [二分猜测 lambda = 1.25] 边权赋为 w\' = w - 1.25。所有环和均为正数 (无负环)，提高下界 L = 1.25！',
    log: '无负环：λ* >= 1.250，更新 L -> 1.250',
    codeLine: [39, 43],
  });

  // 4. 收敛至最优均值 lambda* = 1.333
  const reweightedOpt = origEdges.map((e) => ({
    u: e.u,
    v: e.v,
    origW: e.w,
    newW: Number((e.w - 1.333).toFixed(3)),
  }));

  steps.push({
    lambda: 1.333,
    boundL: 1.333,
    boundR: 1.333,
    hasNegCycle: true,
    activeCycleNodes: [2, 4, 3],
    reweightedEdges: reweightedOpt,
    status: 'converged',
    message: '🎉 [二分收敛完成] 全局最小均值回路为 2 ➔ 4 ➔ 3 ➔ 2，平均边权 lambda* = (1+1+2)/3 = 1.333！',
    log: '✓ 二分收敛：最小均值回路 λ* = 1.333',
    codeLine: [46, 50],
  });

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
      const boundsEl = root.querySelector('#metric-bounds');
      const lambdaEl = root.querySelector('#metric-guess-lambda');
      const cycleEl = root.querySelector('#metric-cycle-status');

      if (boundsEl) boundsEl.textContent = `[${step.boundL.toFixed(3)}, ${step.boundR.toFixed(3)}]`;
      if (lambdaEl) lambdaEl.textContent = `${step.lambda.toFixed(3)}`;
      if (cycleEl) {
        cycleEl.textContent = step.hasNegCycle ? '⚠ 存在负环 (缩小上界)' : '✓ 无负环 (提高下界)';
        cycleEl.style.color = step.hasNegCycle ? '#ef4444' : '#10b981';
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
