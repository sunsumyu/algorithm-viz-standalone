/**
 * 匈牙利算法二分图最大匹配 (Hungarian Algorithm - Maximum Bipartite Matching) 声明式可视化器
 * 核心：增广路探索、匹配边与非匹配边交替翻转、增广路定理 (洛谷 P3386)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  HUNGARIAN_MATCHING_CODE_LANGUAGES,
  HUNGARIAN_MATCHING_PROBLEM_HTML,
  HUNGARIAN_MATCHING_ANALYSIS_HTML,
} from './hungarian-matching-problem-content';

export interface HungarianStep {
  matchedEdges: Array<[string, string]>;
  curLeft: string;
  curAugmentPath: string[];
  matchCount: number;
  status: 'init' | 'augment' | 'flip' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildHungarianSteps(): HungarianStep[] {
  const steps: HungarianStep[] = [];

  steps.push({
    matchedEdges: [],
    curLeft: 'L1',
    curAugmentPath: ['L1', 'R1'],
    matchCount: 1,
    status: 'augment',
    message: '1. [为 L1 寻找增广路] L1 尝试连接未匹配点 R1，直接匹配！匹配对 (L1, R1)。',
    log: '找到增广路：L1 ➔ R1，匹配成功',
    codeLine: [18, 25],
  });

  steps.push({
    matchedEdges: [['L1', 'R1']],
    curLeft: 'L2',
    curAugmentPath: ['L2', 'R1', 'L1', 'R2'],
    matchCount: 2,
    status: 'flip',
    message: '2. [为 L2 寻找增广路并交替翻转] L2 争取 R1，原配 L1 寻找次选 R2！翻转增广路 L2 ➔ R1 ➔ L1 ➔ R2，匹配对变为 (L2, R1) 与 (L1, R2)！',
    log: '交替路翻转：(L2, R1), (L1, R2) 均匹配成功',
    codeLine: [28, 38],
  });

  steps.push({
    matchedEdges: [
      ['L2', 'R1'],
      ['L1', 'R2'],
      ['L3', 'R3'],
    ],
    curLeft: 'L3',
    curAugmentPath: ['L3', 'R3'],
    matchCount: 3,
    status: 'done',
    message: '🎉 [二分图最大匹配达成] L3 匹配 R3，全图达到完备最大匹配，最大匹配数 = 3！',
    log: '✓ 匈牙利算法完成：最大匹配数 = 3',
    codeLine: [40, 45],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<HungarianStep>({
  id: 'hungarian-matching',
  name: '匈牙利二分图匹配 (Hungarian Matching)',
  category: 'graph',
  icon: '🤝',
  badge: {
    mode: '增广路交替翻转',
    complexity: 'O(V · E) · O(V + E)',
  },
  card1Title: '🤝 二分图增广路与交替匹配沙盘',
  card2Title: '🧭 增广路径与当前匹配数监视器',
  card2Desc: '左侧节点匹配尝试、交错路 DFS 递归抢占与增广翻转',
  legend: [
    { label: '左部节点 (L1..L3)', color: '#0284c7' },
    { label: '右部节点 (R1..R3)', color: '#f59e0b' },
    { label: '🟢 达成匹配的边', color: '#10b981' },
    { label: '普通可选边', color: '#475569' },
  ],
  inputs: [],
  presets: [
    { label: '3x3 经典二分图增广翻转 (P3386)', values: {} },
  ],
  metrics: [
    { id: 'metric-hungarian-left', label: '当前尝试左部节点', color: '#2563eb' },
    { id: 'metric-hungarian-count', label: '最大匹配数', color: '#10b981' },
  ],
  codeLanguages: HUNGARIAN_MATCHING_CODE_LANGUAGES,
  problemHtml: HUNGARIAN_MATCHING_PROBLEM_HTML,
  analysisHtml: HUNGARIAN_MATCHING_ANALYSIS_HTML,
  buildSteps: () => buildHungarianSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<string, { x: number; y: number }> = {
      L1: { x: 80, y: 60 },
      L2: { x: 80, y: 110 },
      L3: { x: 80, y: 160 },
      R1: { x: 230, y: 60 },
      R2: { x: 230, y: 110 },
      R3: { x: 230, y: 160 },
    };

    const edges = [
      { u: 'L1', v: 'R1' },
      { u: 'L1', v: 'R2' },
      { u: 'L2', v: 'R1' },
      { u: 'L3', v: 'R3' },
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

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />`;
      })
      .join('');

    const nodes = ['L1', 'L2', 'L3', 'R1', 'R2', 'R3'];
    const svgNodes = nodes
      .map((id) => {
        const p = nodeCoords[id];
        if (!p) return '';
        const isLeft = id.startsWith('L');
        const isCur = step.curLeft === id;
        const bg = isCur ? '#b45309' : isLeft ? '#0369a1' : '#b45309';
        const border = isCur ? '#facc15' : isLeft ? '#38bdf8' : '#facc15';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${id}</text>
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
          🟢 绿色粗线为当前匹配边 | 增广路定理：当且仅当无增广路时达到最大匹配
        </div>
      </div>
    `;

    const root = container.closest('#algo-hungarian-matching-view');
    if (root) {
      const lEl = root.querySelector('#metric-hungarian-left');
      const cEl = root.querySelector('#metric-hungarian-count');

      if (lEl) lEl.textContent = `${step.curLeft}`;
      if (cEl) cEl.textContent = `${step.matchCount} / 3 对`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 增广路定理 (Berge's Lemma):</span>
              <strong style="font-family: monospace; color: #2563eb;">匹配 M 为最大匹配 ⟺ 二分图中不存在关于 M 的增广路径</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'hungarian-matching',
  name: '匈牙利二分图匹配 (Hungarian Matching)',
  viewId: 'algo-hungarian-matching-view',
  category: 'graph',
  description: '经典二分图基石：增广路径查找、交错路径递归腾位置与翻转、O(VE) 求解最大二分图匹配 (洛谷 P3386)',
  icon: '🤝',
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 31,
  learningGoal: '掌握匈牙利算法的 DFS 增广路搜索模板、交错轨翻转原理及 Berge 定理证明',
});

export { Visualizer as HungarianMatchingVisualizer };
