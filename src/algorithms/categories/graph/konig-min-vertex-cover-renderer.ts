/**
 * 二分图最小点覆盖与 König 定理 (König's Theorem - Min Vertex Cover) 声明式可视化器
 * 进阶匹配理论: 最大匹配数 = 最小点覆盖数、未匹配点交错路 DFS 染色提取覆盖集 (洛谷 P6062)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  KONIG_COVER_CODE_LANGUAGES,
  KONIG_COVER_PROBLEM_HTML,
  KONIG_COVER_ANALYSIS_HTML,
} from './konig-min-vertex-cover-problem-content';

export interface KonigStep {
  matchedEdges: Array<[string, string]>;
  visitedLeft: string[];
  visitedRight: string[];
  coverSet: string[];
  status: 'match' | 'alternating' | 'cover' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildKonigSteps(): KonigStep[] {
  const steps: KonigStep[] = [];

  steps.push({
    matchedEdges: [
      ['L1', 'R1'],
      ['L2', 'R2'],
    ],
    visitedLeft: [],
    visitedRight: [],
    coverSet: [],
    status: 'match',
    message: '1. [求出二分图最大匹配] 运行匈牙利算法，求得最大匹配为 (L1-R1) 与 (L2-R2)，最大匹配数 = 2。',
    log: '最大匹配完成：匹配边 (L1, R1), (L2, R2)，匹配数 = 2',
    codeLine: [12, 18],
  });

  steps.push({
    matchedEdges: [
      ['L1', 'R1'],
      ['L2', 'R2'],
    ],
    visitedLeft: ['L3', 'L1'],
    visitedRight: ['R1'],
    coverSet: [],
    status: 'alternating',
    message: '2. [未匹配点交错路 DFS] 从左侧未匹配点 L3 出发，沿非匹配边向右、匹配边向左交错搜索，访问集合为 L3 ➔ R1 ➔ L1！',
    log: '交错路 DFS：访问左部 {L3, L1}，访问右部 {R1}',
    codeLine: [20, 28],
  });

  steps.push({
    matchedEdges: [
      ['L1', 'R1'],
      ['L2', 'R2'],
    ],
    visitedLeft: ['L3', 'L1'],
    visitedRight: ['R1'],
    coverSet: ['L2', 'R1'],
    status: 'done',
    message: '🎉 [König 定理构造最小点覆盖] 点覆盖集为 (左侧未访问点 L2) ∪ (右侧已访问点 R1) = {L2, R1}！覆盖大小恰为最大匹配数 2！',
    log: '✓ König 定理构造完毕：最小点覆盖集 = {L2, R1}，大小 = 2',
    codeLine: [30, 36],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<KonigStep>({
  id: 'konig-min-vertex-cover',
  name: 'König 最小点覆盖 (Konig Min Vertex Cover)',
  category: 'graph',
  icon: '🛡️',
  badge: {
    mode: 'König 对偶定理',
    complexity: 'O(V · E) · O(V + E)',
  },
  card1Title: '🛡️ 二分图交错搜索与点覆盖沙盘',
  card2Title: '🧭 König 覆盖集与匹配数对偶监视器',
  card2Desc: '最大匹配数、未访问左部点 ∪ 已访问右部点与每条边被覆盖证明',
  legend: [
    { label: '左部节点 (L1..L3)', color: '#0284c7' },
    { label: '右部节点 (R1..R2)', color: '#f59e0b' },
    { label: '🟢 最小点覆盖选中节点', color: '#10b981' },
    { label: '最大匹配边', color: '#6366f1' },
  ],
  inputs: [],
  presets: [
    { label: '经典 3-2 二分图 König 构造', values: {} },
  ],
  metrics: [
    { id: 'metric-match-size', label: '最大匹配数', color: '#2563eb' },
    { id: 'metric-cover-size', label: '最小点覆盖大小', color: '#10b981' },
  ],
  codeLanguages: KONIG_COVER_CODE_LANGUAGES,
  problemHtml: KONIG_COVER_PROBLEM_HTML,
  analysisHtml: KONIG_COVER_ANALYSIS_HTML,
  buildSteps: () => buildKonigSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<string, { x: number; y: number }> = {
      L1: { x: 80, y: 55 },
      L2: { x: 80, y: 120 },
      L3: { x: 80, y: 185 },
      R1: { x: 230, y: 75 },
      R2: { x: 230, y: 155 },
    };

    const edges = [
      { u: 'L1', v: 'R1' },
      { u: 'L2', v: 'R2' },
      { u: 'L3', v: 'R1' },
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

    const nodes = ['L1', 'L2', 'L3', 'R1', 'R2'];
    const svgNodes = nodes
      .map((id) => {
        const p = nodeCoords[id];
        if (!p) return '';
        const inCover = step.coverSet.includes(id);
        const isLeft = id.startsWith('L');
        const bg = inCover ? '#065f46' : isLeft ? '#0284c7' : '#f59e0b';
        const border = inCover ? '#10b981' : isLeft ? '#38bdf8' : '#facc15';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${inCover ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${id}</text>
            ${inCover ? `<text x="${isLeft ? p.x - 28 : p.x + 28}" y="${p.y + 4}" fill="#34d399" font-size="8.5" font-weight="700" text-anchor="middle">🛡️覆盖</text>` : ''}
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
          🟢 绿色高亮为 König 最小点覆盖集 {L2, R1} | 满足最大匹配 = 最小点覆盖 = 2
        </div>
      </div>
    `;

    const root = container.closest('#algo-konig-min-vertex-cover-view');
    if (root) {
      const mEl = root.querySelector('#metric-match-size');
      const cEl = root.querySelector('#metric-cover-size');

      if (mEl) mEl.textContent = `${step.matchedEdges.length}`;
      if (cEl) cEl.textContent = step.coverSet.length > 0 ? `${step.coverSet.length}` : '推导中...';

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const coverStr = step.coverSet.length > 0 ? `{ ${step.coverSet.join(', ')} }` : '—';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>最小点覆盖节点集:</span>
              <strong style="color: #10b981; font-family: monospace;">${coverStr}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 König 对偶定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">二分图中 最大匹配数 = 最小点覆盖数 = 总点数 - 最大独立集</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'konig-min-vertex-cover',
  name: 'König 最小点覆盖 (Konig Min Vertex Cover)',
  viewId: 'algo-konig-min-vertex-cover-view',
  category: 'graph',
  description: '经典二分图对偶理论：König 定理证明、交错路 DFS 构造最小点覆盖集、最大独立集与 DAG 最小路径覆盖转化 (洛谷 P6062)',
  icon: '🛡️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 45,
  learningGoal: '掌握 König 定理的构造性证明过程、交错路 DFS 提取方案以及最大独立集的转换关系',
});

export { Visualizer as KonigMinVertexCoverVisualizer };
