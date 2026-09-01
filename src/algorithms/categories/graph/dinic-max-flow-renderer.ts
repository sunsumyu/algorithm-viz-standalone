/**
 * Dinic 最大流与残量网络 (Dinic's Maximum Flow Algorithm) 声明式可视化器
 * 进阶网络流: BFS 分层网络 level[u]、当前弧优化 cur[u]、多路增广 DFS 阻塞流 (洛谷 P3376)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  DINIC_MAX_FLOW_CODE_LANGUAGES,
  DINIC_MAX_FLOW_PROBLEM_HTML,
  DINIC_MAX_FLOW_ANALYSIS_HTML,
} from './dinic-max-flow-problem-content';

export interface DinicStep {
  levels: Record<string, number>;
  flowEdges: Array<{ u: string; v: string; cap: number; flow: number }>;
  curMaxFlow: number;
  status: 'bfs_level' | 'dfs_augment' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildDinicSteps(): DinicStep[] {
  const steps: DinicStep[] = [];

  steps.push({
    levels: { S: 0, A: 1, B: 1, T: 2 },
    flowEdges: [
      { u: 'S', v: 'A', cap: 10, flow: 0 },
      { u: 'S', v: 'B', cap: 10, flow: 0 },
      { u: 'A', v: 'T', cap: 10, flow: 0 },
      { u: 'B', v: 'T', cap: 10, flow: 0 },
    ],
    curMaxFlow: 0,
    status: 'bfs_level',
    message: '1. [BFS 构建分层网络] 沿残量大于 0 的边 BFS：level[S]=0, level[A]=1, level[B]=1, level[T]=2！汇点可达！',
    log: 'BFS 分层完成：S(0) ➔ A/B(1) ➔ T(2)',
    codeLine: [18, 26],
  });

  steps.push({
    levels: { S: 0, A: 1, B: 1, T: 2 },
    flowEdges: [
      { u: 'S', v: 'A', cap: 10, flow: 10 },
      { u: 'S', v: 'B', cap: 10, flow: 0 },
      { u: 'A', v: 'T', cap: 10, flow: 10 },
      { u: 'B', v: 'T', cap: 10, flow: 0 },
    ],
    curMaxFlow: 10,
    status: 'dfs_augment',
    message: '2. [DFS 多路增广第 1 路] 沿分层严格递增边 S ➔ A ➔ T 增广 10 单位流量！',
    log: '多路增广 1：S➔A➔T 增广 +10 流量',
    codeLine: [28, 38],
  });

  steps.push({
    levels: { S: 0, A: 1, B: 1, T: 2 },
    flowEdges: [
      { u: 'S', v: 'A', cap: 10, flow: 10 },
      { u: 'S', v: 'B', cap: 10, flow: 10 },
      { u: 'A', v: 'T', cap: 10, flow: 10 },
      { u: 'B', v: 'T', cap: 10, flow: 10 },
    ],
    curMaxFlow: 20,
    status: 'done',
    message: '🎉 [DFS 多路增广第 2 路与最大流达成] 沿 S ➔ B ➔ T 增广 10 单位流量！网络中不再存在增广路，最大流 = 20！',
    log: '✓ Dinic 算法完成：达成最大流 = 20',
    codeLine: [40, 46],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<DinicStep>({
  id: 'dinic-max-flow',
  name: 'Dinic 最大流 (Dinic Max Flow)',
  category: 'graph',
  icon: '🌊',
  badge: {
    mode: 'BFS 分层 + 当前弧优化 DFS',
    complexity: 'O(V² · E) · O(V + E)',
  },
  card1Title: '🌊 分层残量网络与多路增广沙盘',
  card2Title: '🧭 节点分层 level[u] 与最大流监视器',
  card2Desc: '残量网络分层、当前弧优化跳过失效边与累计最大流',
  legend: [
    { label: '源点 S / 汇点 T', color: '#f59e0b' },
    { label: '分层网络节点 (A..B)', color: '#0284c7' },
    { label: '🟢 满流/增广边', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '4 节点经典分层流网络 (P3376)', values: {} },
  ],
  metrics: [
    { id: 'metric-dinic-level', label: '汇点 T 分层', color: '#2563eb' },
    { id: 'metric-dinic-max-flow', label: '当前最大流', color: '#10b981' },
  ],
  codeLanguages: DINIC_MAX_FLOW_CODE_LANGUAGES,
  problemHtml: DINIC_MAX_FLOW_PROBLEM_HTML,
  analysisHtml: DINIC_MAX_FLOW_ANALYSIS_HTML,
  buildSteps: () => buildDinicSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<string, { x: number; y: number }> = {
      S: { x: 50, y: 110 },
      A: { x: 155, y: 55 },
      B: { x: 155, y: 165 },
      T: { x: 260, y: 110 },
    };

    const svgEdges = step.flowEdges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const isFull = e.flow === e.cap;
        const inUse = e.flow > 0;
        const color = isFull ? '#10b981' : inUse ? '#f59e0b' : '#475569';
        const width = inUse ? 2.5 : 1.5;
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 6;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />
            <text x="${midX}" y="${midY}" fill="${color}" font-size="9" font-weight="700" font-family="monospace" text-anchor="middle">${e.flow}/${e.cap}</text>
          </g>
        `;
      })
      .join('');

    const nodes = ['S', 'A', 'B', 'T'];
    const svgNodes = nodes
      .map((id) => {
        const p = nodeCoords[id];
        if (!p) return '';
        const lvl = step.levels[id];
        const isST = id === 'S' || id === 'T';
        const bg = isST ? '#b45309' : '#0369a1';
        const border = isST ? '#facc15' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${id}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="#94a3b8" font-size="8.5" font-weight="700" text-anchor="middle">lvl:${lvl}</text>
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
          🟢 绿色连线为满流边 | 节点标注 level 分层 | 当前弧优化避免重复探索死边
        </div>
      </div>
    `;

    const root = container.closest('#algo-dinic-max-flow-view');
    if (root) {
      const lEl = root.querySelector('#metric-dinic-level');
      const fEl = root.querySelector('#metric-dinic-max-flow');

      if (lEl) lEl.textContent = `level[T] = ${step.levels.T}`;
      if (fEl) fEl.textContent = `${step.curMaxFlow}`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 Dinic 双优化核心:</span>
              <strong style="font-family: monospace; color: #2563eb;">1. BFS 分层消灭环; 2. DFS 当前弧优化 cur[u] 将单次增广压至阻塞流</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'dinic-max-flow',
  name: 'Dinic 最大流 (Dinic Max Flow)',
  category: 'graph',
  description: '网络流算法基石：BFS 构建分层网络、DFS 当前弧优化多路增广阻塞流、O(V²E) 高效求解最大流 (洛谷 P3376)',
  icon: '🌊',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 39,
  learningGoal: '掌握 Dinic 算法的分层思想、当前弧优化模板实现及二分图网络流下的 O(E√V) 复杂度证明',
});

export { Visualizer as DinicMaxFlowVisualizer };
