/**
 * 二分图博弈 (Game on Bipartite Graph) 声明式可视化器
 * 进阶博弈论: 必定非最大匹配点为必胜/必败态、增广路翻转交替转移 (洛谷 P4055)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  BIPARTITE_GAME_CODE_LANGUAGES,
  BIPARTITE_GAME_PROBLEM_HTML,
  BIPARTITE_GAME_ANALYSIS_HTML,
} from './bipartite-game-problem-content';

export interface GameStep {
  curStartNode: number;
  matchedPairs: Array<[number, number]>;
  isWinState: boolean;
  winningStartNodes: number[];
  status: 'match' | 'check' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildBipartiteGameSteps(): GameStep[] {
  const steps: GameStep[] = [];

  steps.push({
    curStartNode: 1,
    matchedPairs: [
      [1, 3],
      [2, 4],
    ],
    isWinState: true,
    winningStartNodes: [],
    status: 'match',
    message: '1. [二分图最大匹配] 运行匈牙利算法，求得最大匹配为 (1-3) 与 (2-4)，节点 5 为非必经非匹配点！',
    log: '求得二分图最大匹配：(1, 3), (2, 4)',
    codeLine: [12, 18],
  });

  steps.push({
    curStartNode: 5,
    matchedPairs: [
      [1, 3],
      [2, 4],
    ],
    isWinState: true,
    winningStartNodes: [5],
    status: 'check',
    message: '2. [非最大匹配必胜判定] 从未匹配点 5 出发，后手无论如何移动均会落入匹配边，先手必胜！',
    log: '判定点 5: 不属于所有最大匹配，先手必胜！',
    codeLine: [22, 28],
  });

  steps.push({
    curStartNode: 5,
    matchedPairs: [
      [1, 3],
      [2, 4],
    ],
    isWinState: true,
    winningStartNodes: [5],
    status: 'done',
    message: '🎉 [二分图博弈定理验证完成] 必胜起始点集合为 {5}！只要起始点不属于某组最大匹配，先手必胜！',
    log: '✓ 判定完成：必胜起始点集 = {5}',
    codeLine: [30, 36],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<GameStep>({
  id: 'bipartite-game',
  name: '二分图博弈 (Bipartite Game)',
  category: 'graph',
  icon: '♟️',
  badge: {
    mode: '最大匹配非必经点定理',
    complexity: 'O(V · E) · O(V + E)',
  },
  card1Title: '♟️ 二分图拓扑与博弈胜负态沙盘',
  card2Title: '🧭 必胜起始点集合监视器',
  card2Desc: '最大匹配边集合、交错路径与先手必胜状态判据',
  legend: [
    { label: '左部节点 (L)', color: '#0284c7' },
    { label: '右部节点 (R)', color: '#f59e0b' },
    { label: '🟢 先手必胜起始点', color: '#10b981' },
    { label: '最大匹配边', color: '#6366f1' },
  ],
  inputs: [],
  presets: [
    { label: '5 节点二分图博弈 (P4055)', values: {} },
  ],
  metrics: [
    { id: 'metric-cur-start', label: '测试起始点', color: '#2563eb' },
    { id: 'metric-win-status', label: '博弈结局判定', color: '#10b981' },
  ],
  codeLanguages: BIPARTITE_GAME_CODE_LANGUAGES,
  problemHtml: BIPARTITE_GAME_PROBLEM_HTML,
  analysisHtml: BIPARTITE_GAME_ANALYSIS_HTML,
  buildSteps: () => buildBipartiteGameSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 80, y: 55 },
      2: { x: 80, y: 120 },
      5: { x: 80, y: 185 },
      3: { x: 230, y: 55 },
      4: { x: 230, y: 120 },
    };

    const edges = [
      { u: 1, v: 3 },
      { u: 2, v: 4 },
      { u: 5, v: 3 },
    ];

    const isMatchEdge = (u: number, v: number) => step.matchedPairs.some(([mu, mv]) => (mu === u && mv === v) || (mu === v && mv === u));

    const svgEdges = edges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        const isMatched = isMatchEdge(e.u, e.v);
        const color = isMatched ? '#10b981' : '#475569';
        const width = isMatched ? 3 : 1.5;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />`;
      })
      .join('');

    const nodes = [1, 2, 5, 3, 4];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isWinning = step.winningStartNodes.includes(u);
        const isLeft = u === 1 || u === 2 || u === 5;
        const bg = isWinning ? '#065f46' : isLeft ? '#0284c7' : '#f59e0b';
        const border = isWinning ? '#10b981' : isLeft ? '#38bdf8' : '#facc15';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isWinning ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            ${isWinning ? `<text x="${p.x - 28}" y="${p.y + 4}" fill="#34d399" font-size="9" font-weight="700" text-anchor="middle">👑必胜</text>` : ''}
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
          🟢 绿色粗线为最大匹配边 | 👑 起始点 5 不属于全图最大匹配，先手必胜！
        </div>
      </div>
    `;

    const root = container.closest('#algo-bipartite-game-view');
    if (root) {
      const nodeEl = root.querySelector('#metric-cur-start');
      const winEl = root.querySelector('#metric-win-status');

      if (nodeEl) nodeEl.textContent = `Node ${step.curStartNode}`;
      if (winEl) winEl.textContent = step.isWinState ? '✓ 先手必胜' : '后手必胜';

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const winStr = step.winningStartNodes.length > 0 ? `{ ${step.winningStartNodes.join(', ')} }` : '—';

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>必胜起点集合:</span>
              <strong style="color: #10b981; font-family: monospace;">${winStr}</strong>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 二分图博弈判定定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">起点 u 先手必胜 ⟺ 存在一组最大匹配不包含 u</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'bipartite-game',
  name: '二分图博弈 (Bipartite Game)',
  viewId: 'algo-bipartite-game-view',
  category: 'graph',
  description: '进阶图论博弈模型：最大匹配非必经点定理、交错路胜负转移与先手必胜状态判定 (洛谷 P4055)',
  icon: '♟️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 55,
  learningGoal: '掌握二分图博弈转化为最大匹配非必经点的判定证明及交错路搜索算法',
});

export { Visualizer as BipartiteGameVisualizer };
