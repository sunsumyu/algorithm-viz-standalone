/**
 * 最小费用最大流 (Minimum Cost Maximum Flow - MCMF SPFA/Dijkstra) 声明式可视化器
 * 进阶网络流: 残量网络连续最短路增广 (EK/SPFA)、反向弧费用相反、最大化流的同时最小化费用 (洛谷 P3381)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  MCMF_CODE_LANGUAGES,
  MCMF_PROBLEM_HTML,
  MCMF_ANALYSIS_HTML,
} from './min-cost-max-flow-problem-content';

export interface MCMFStep {
  curPath: Array<{ u: string; v: string; cap: number; flow: number; cost: number }>;
  totalFlow: number;
  totalCost: number;
  status: 'init' | 'augment' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildMCMFSteps(): MCMFStep[] {
  const steps: MCMFStep[] = [];

  steps.push({
    curPath: [],
    totalFlow: 0,
    totalCost: 0,
    status: 'init',
    message: '1. [初始化残量网络] 建立容量与单位费用，反向边初始容量为 0，费用为 -cost！',
    log: '初始化 MCMF 网络：反向弧单位费用为相反数',
    codeLine: [18, 25],
  });

  steps.push({
    curPath: [
      { u: 'S', v: 'A', cap: 3, flow: 2, cost: 1 },
      { u: 'A', v: 'T', cap: 2, flow: 2, cost: 2 },
    ],
    totalFlow: 2,
    totalCost: 6,
    status: 'augment',
    message: '2. [第 1 轮增广最廉价路径 S➔A➔T] 沿单位费用最小路径增广 2 单位流量，累计费用 = 2 * (1 + 2) = 6！',
    log: '增广路径 S➔A➔T：流量 +2，费用 +6',
    codeLine: [28, 38],
  });

  steps.push({
    curPath: [
      { u: 'S', v: 'A', cap: 3, flow: 2, cost: 1 },
      { u: 'A', v: 'T', cap: 2, flow: 2, cost: 2 },
      { u: 'S', v: 'B', cap: 2, flow: 1, cost: 3 },
      { u: 'B', v: 'T', cap: 3, flow: 1, cost: 1 },
    ],
    totalFlow: 3,
    totalCost: 10,
    status: 'done',
    message: '🎉 [第 2 轮增广 S➔B➔T 与最大流达成] 增广 1 单位流量，累计最大流 = 3，最小总费用 = 6 + 1*(3+1) = 10！',
    log: '✓ MCMF 达成：最大流 = 3，最小费用 = 10',
    codeLine: [40, 46],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<MCMFStep>({
  id: 'min-cost-max-flow',
  name: '最小费用最大流 (Min Cost Max Flow)',
  category: 'graph',
  icon: '🚰',
  badge: {
    mode: '连续最短路增广 (SPFA/Primal-Dual)',
    complexity: 'O(F · E log V) · O(V + E)',
  },
  card1Title: '🚰 费用流拓扑网络与增广路径沙盘',
  card2Title: '🧭 累计流量与最小费用监视器',
  card2Desc: '残量网络费用最短路、瓶颈增广流量与最小累计费用',
  legend: [
    { label: '源点 S / 汇点 T', color: '#f59e0b' },
    { label: '内部中继节点', color: '#0284c7' },
    { label: '🟢 当前增广最短路', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '4 节点经典费用流网络 (P3381)', values: {} },
  ],
  metrics: [
    { id: 'metric-mcmf-flow', label: '当前最大流', color: '#2563eb' },
    { id: 'metric-mcmf-cost', label: '累计最小费用', color: '#10b981' },
  ],
  codeLanguages: MCMF_CODE_LANGUAGES,
  problemHtml: MCMF_PROBLEM_HTML,
  analysisHtml: MCMF_ANALYSIS_HTML,
  buildSteps: () => buildMCMFSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<string, { x: number; y: number }> = {
      S: { x: 50, y: 110 },
      A: { x: 155, y: 55 },
      B: { x: 155, y: 165 },
      T: { x: 260, y: 110 },
    };

    const edges = [
      { u: 'S', v: 'A', cap: 3, cost: 1 },
      { u: 'S', v: 'B', cap: 2, cost: 3 },
      { u: 'A', v: 'T', cap: 2, cost: 2 },
      { u: 'B', v: 'T', cap: 3, cost: 1 },
    ];

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const curFlowEdge = step.curPath.find((pe) => pe.u === e.u && pe.v === e.v);
        const flow = curFlowEdge ? curFlowEdge.flow : 0;
        const inUse = flow > 0;
        const color = inUse ? '#10b981' : '#475569';
        const width = inUse ? 2.5 : 1.5;
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 6;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />
            <text x="${midX}" y="${midY}" fill="${color}" font-size="8.5" font-weight="700" font-family="monospace" text-anchor="middle">${flow}/${e.cap} ($${e.cost})</text>
          </g>
        `;
      })
      .join('');

    const nodes = ['S', 'A', 'B', 'T'];
    const svgNodes = nodes
      .map((id) => {
        const p = nodeCoords[id];
        if (!p) return '';
        const isST = id === 'S' || id === 'T';
        const bg = isST ? '#b45309' : '#0369a1';
        const border = isST ? '#facc15' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${id}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 210">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟢 绿色连线为当前增广流 | 边标注 流量/容量 (单位费用) | 优先走单位费用最短路
        </div>
      </div>
    `;

    const root = container.closest('#algo-min-cost-max-flow-view');
    if (root) {
      const fEl = root.querySelector('#metric-mcmf-flow');
      const cEl = root.querySelector('#metric-mcmf-cost');

      if (fEl) fEl.textContent = `${step.totalFlow}`;
      if (cEl) cEl.textContent = `${step.totalCost}`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 费用流增广定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">残量网络无负费用回路 ⟺ 当前流为对应流量下的最小费用流</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'min-cost-max-flow',
  name: '最小费用最大流 (Min Cost Max Flow)',
  viewId: 'algo-min-cost-max-flow-view',
  category: 'graph',
  description: '网络流运筹经典巅峰：残量网络连续单位费用最短路增广、反向边负费用、消圈定理与最小总费用计算 (洛谷 P3381)',
  icon: '🚰',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 41,
  learningGoal: '掌握连续最短路增广算法 (SSPA)、Dijkstra+势能 (Primal-Dual) 优化以及消圈定理证明',
});

export { Visualizer as MinCostMaxFlowVisualizer };
