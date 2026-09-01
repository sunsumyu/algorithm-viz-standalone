/**
 * 二分图最大权完美匹配 (Kuhn-Munkres Algorithm - KM 算法) 声明式可视化器
 * 进阶匹配理论: 顶标可行性 lx[u] + ly[v] >= w(u,v)、相等子图增广、松弛变量 slack[v] 顶标调整、O(N³) 严格时间 (洛谷 P6577)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  KM_ALGORITHM_CODE_LANGUAGES,
  KM_ALGORITHM_PROBLEM_HTML,
  KM_ALGORITHM_ANALYSIS_HTML,
} from './km-algorithm-problem-content';

export interface KMStep {
  lx: Record<string, number>;
  ly: Record<string, number>;
  matchedEdges: Array<[string, string]>;
  slack: Record<string, number>;
  totalWeight: number;
  status: 'init_labels' | 'augment' | 'adjust_labels' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildKMSteps(): KMStep[] {
  const steps: KMStep[] = [];

  steps.push({
    lx: { L1: 10, L2: 8 },
    ly: { R1: 0, R2: 0 },
    matchedEdges: [],
    slack: { R1: 0, R2: 0 },
    totalWeight: 0,
    status: 'init_labels',
    message: '1. [顶标可行性初始化] 左部顶标初始化为出边最大权 lx[L1]=10, lx[L2]=8；右部顶标 ly=0。满足 lx+ly ≥ w！',
    log: '初始化顶标：lx={L1:10, L2:8}, ly={R1:0, R2:0}',
    codeLine: [15, 22],
  });

  steps.push({
    lx: { L1: 10, L2: 8 },
    ly: { R1: 0, R2: 0 },
    matchedEdges: [['L1', 'R1']],
    slack: { R1: 0, R2: 2 },
    totalWeight: 10,
    status: 'augment',
    message: '2. [相等子图寻找增广路] 边 (L1, R1, w:10) 满足 10 + 0 = 10，加入相等子图并成功增广！',
    log: '增广匹配：(L1, R1, w=10) 成立',
    codeLine: [24, 32],
  });

  steps.push({
    lx: { L1: 10, L2: 8 },
    ly: { R1: 0, R2: 0 },
    matchedEdges: [
      ['L1', 'R1'],
      ['L2', 'R2'],
    ],
    slack: { R1: 0, R2: 0 },
    totalWeight: 18,
    status: 'done',
    message: '🎉 [KM 完美匹配达成] 边 (L2, R2, w:8) 满足 8 + 0 = 8，成功增广！全图完美匹配达成，最大总权值 = 10 + 8 = 18！',
    log: '✓ KM 算法完成：达成完美匹配，最大权值 = 18',
    codeLine: [35, 42],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<KMStep>({
  id: 'km-algorithm',
  name: 'KM 二分图最大权完美匹配 (KM Algorithm)',
  category: 'graph',
  icon: '🧮',
  badge: {
    mode: '顶标调整 O(N³)',
    complexity: 'O(N³) · O(N²)',
  },
  card1Title: '🧮 顶标可行网络与相等子图沙盘',
  card2Title: '🧭 顶标 lx[u], ly[v] 与松弛量监视器',
  card2Desc: '左/右顶标值、相等子图 (lx+ly=w) 判定与总权值',
  legend: [
    { label: '左部节点 (L1..L2)', color: '#0284c7' },
    { label: '右部节点 (R1..R2)', color: '#f59e0b' },
    { label: '🟢 相等子图匹配边', color: '#10b981' },
    { label: '普通带权边', color: '#475569' },
  ],
  inputs: [],
  presets: [
    { label: '2x2 经典带权二分图 (P6577)', values: {} },
  ],
  metrics: [
    { id: 'metric-km-weight', label: '最大总权值', color: '#10b981' },
    { id: 'metric-km-matched', label: '完美匹配对数', color: '#2563eb' },
  ],
  codeLanguages: KM_ALGORITHM_CODE_LANGUAGES,
  problemHtml: KM_ALGORITHM_PROBLEM_HTML,
  analysisHtml: KM_ALGORITHM_ANALYSIS_HTML,
  buildSteps: () => buildKMSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<string, { x: number; y: number }> = {
      L1: { x: 80, y: 75 },
      L2: { x: 80, y: 155 },
      R1: { x: 230, y: 75 },
      R2: { x: 230, y: 155 },
    };

    const edges = [
      { u: 'L1', v: 'R1', w: 10 },
      { u: 'L1', v: 'R2', w: 5 },
      { u: 'L2', v: 'R1', w: 4 },
      { u: 'L2', v: 'R2', w: 8 },
    ];

    const isMatch = (u: string, v: string) => step.matchedEdges.some(([mu, mv]) => (mu === u && mv === v) || (mu === v && mv === u));

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const matched = isMatch(e.u, e.v);
        const color = matched ? '#10b981' : '#475569';
        const width = matched ? 3 : 1.5;
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2 - 6;

        return `
          <g>
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />
            <text x="${midX}" y="${midY}" fill="${color}" font-size="9" font-weight="700" font-family="monospace" text-anchor="middle">w:${e.w}</text>
          </g>
        `;
      })
      .join('');

    const nodes = ['L1', 'L2', 'R1', 'R2'];
    const svgNodes = nodes
      .map((id) => {
        const p = nodeCoords[id];
        if (!p) return '';
        const isLeft = id.startsWith('L');
        const labelVal = isLeft ? step.lx[id] : step.ly[id];

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${isLeft ? '#0284c7' : '#f59e0b'}" stroke="${isLeft ? '#38bdf8' : '#facc15'}" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${id}</text>
            <text x="${isLeft ? p.x - 28 : p.x + 28}" y="${p.y + 4}" fill="#34d399" font-size="9" font-weight="700" text-anchor="middle">顶标:${labelVal}</text>
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
          🟢 绿色粗线为相等子图匹配边 | 满足顶标定理：当且仅当 $lx[u] + ly[v] = w(u, v)$ 时边加入相等子图
        </div>
      </div>
    `;

    const root = container.closest('#algo-km-algorithm-view');
    if (root) {
      const wEl = root.querySelector('#metric-km-weight');
      const mEl = root.querySelector('#metric-km-matched');

      if (wEl) wEl.textContent = `${step.totalWeight}`;
      if (mEl) mEl.textContent = `${step.matchedEdges.length} / 2 对`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 KM 算法主定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">相等子图完美匹配的权值和必等于全图最大权值和 ∑lx + ∑ly</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'km-algorithm',
  name: 'KM 二分图最大权完美匹配 (KM Algorithm)',
  viewId: 'algo-km-algorithm-view',
  category: 'graph',
  description: '带权匹配巅峰理论：顶标可行性约束、相等子图交错路增广、BFS slack 松弛顶标调整、严格 O(N³) 高效求解 (洛谷 P6577)',
  icon: '🧮',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 42,
  learningGoal: '掌握 KM 顶标定理的数学证明、slack 变量优化顶标调整以及 O(N³) BFS 增广模板',
});

export { Visualizer as KMAlgorithmVisualizer };
