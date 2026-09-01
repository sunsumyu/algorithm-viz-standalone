/**
 * 广义圆方树 (Block-Cut Tree / Round-Square Tree) 声明式可视化器
 * 进阶图论: 点双连通分量 (BCC) 缩点、圆点代表原图节点、方点代表点双、树上必经点与简单路径 (洛谷 P4320 / P4630)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  BLOCK_CUT_TREE_CODE_LANGUAGES,
  BLOCK_CUT_TREE_PROBLEM_HTML,
  BLOCK_CUT_TREE_ANALYSIS_HTML,
} from './block-cut-tree-problem-content';

export interface BlockCutStep {
  roundNodes: number[];
  squareNodes: string[];
  treeEdges: Array<{ u: string | number; v: string | number }>;
  activeBcc: string[];
  status: 'dfn' | 'tarjan' | 'build' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildBlockCutTreeSteps(): BlockCutStep[] {
  const steps: BlockCutStep[] = [];

  steps.push({
    roundNodes: [1, 2, 3, 4],
    squareNodes: [],
    treeEdges: [],
    activeBcc: [],
    status: 'dfn',
    message: '1. [原图环状拓扑分析] 原图包含环 (1-2-3-1) 与连向 4 的边 (3-4)。',
    log: '分析原图双连通分量：环 (1, 2, 3) 与 边 (3, 4)',
    codeLine: [15, 20],
  });

  steps.push({
    roundNodes: [1, 2, 3, 4],
    squareNodes: ['S1'],
    treeEdges: [
      { u: 'S1', v: 1 },
      { u: 'S1', v: 2 },
      { u: 'S1', v: 3 },
    ],
    activeBcc: ['1', '2', '3'],
    status: 'tarjan',
    message: '2. [Tarjan 识别点双 BCC1] 环 {1, 2, 3} 构成点双分量，建立方点 S1，连向圆点 1, 2, 3！',
    log: '建立方点 S1：连向圆点 1, 2, 3',
    codeLine: [22, 30],
  });

  steps.push({
    roundNodes: [1, 2, 3, 4],
    squareNodes: ['S1', 'S2'],
    treeEdges: [
      { u: 'S1', v: 1 },
      { u: 'S1', v: 2 },
      { u: 'S1', v: 3 },
      { u: 'S2', v: 3 },
      { u: 'S2', v: 4 },
    ],
    activeBcc: ['3', '4'],
    status: 'done',
    message: '🎉 [广义圆方树构建完成] 建立方点 S2 连向 3, 4！全图转化成无向树，圆方相间，支持 LCA 极速求必经点！',
    log: '✓ 圆方树构建完毕：圆方交替相连，无环树形结构',
    codeLine: [32, 40],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<BlockCutStep>({
  id: 'block-cut-tree',
  name: '圆方树与点双缩点 (Block-Cut Tree)',
  category: 'graph',
  icon: '🌳',
  badge: {
    mode: '圆方二分二叉树化',
    complexity: 'O(V + E) · O(V + E)',
  },
  card1Title: '🌳 广义圆方相间二叉树沙盘',
  card2Title: '🧭 圆点/方点结构与点双分量监视器',
  card2Desc: '圆点(原图节点)、方点(点双分量 BCC) 与树上割点判定',
  legend: [
    { label: '⚪ 圆点 (原图节点)', color: '#0284c7' },
    { label: '🟥 方点 (点双分量 BCC)', color: '#ef4444' },
    { label: '圆方树边', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '4 节点经典圆方树 (P4320)', values: {} },
  ],
  metrics: [
    { id: 'metric-round-count', label: '圆点总数', color: '#2563eb' },
    { id: 'metric-square-count', label: '方点总数 (BCC)', color: '#ef4444' },
  ],
  codeLanguages: BLOCK_CUT_TREE_CODE_LANGUAGES,
  problemHtml: BLOCK_CUT_TREE_PROBLEM_HTML,
  analysisHtml: BLOCK_CUT_TREE_ANALYSIS_HTML,
  buildSteps: () => buildBlockCutTreeSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<string, { x: number; y: number; isSquare?: boolean }> = {
      1: { x: 60, y: 70 },
      2: { x: 60, y: 150 },
      S1: { x: 130, y: 110, isSquare: true },
      3: { x: 195, y: 110 },
      S2: { x: 250, y: 110, isSquare: true },
      4: { x: 290, y: 110 },
    };

    const svgEdges = step.treeEdges
      .map((e) => {
        const p1 = nodeCoords[String(e.u)];
        const p2 = nodeCoords[String(e.v)];
        if (!p1 || !p2) return '';
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#10b981" stroke-width="2" />`;
      })
      .join('');

    const nodes = Object.entries(nodeCoords).filter(([id]) => {
      if (id.startsWith('S')) return step.squareNodes.includes(id);
      return step.roundNodes.includes(Number(id));
    });

    const svgNodes = nodes
      .map(([id, p]) => {
        if (p.isSquare) {
          return `
            <g>
              <rect x="${p.x - 12}" y="${p.y - 12}" width="24" height="24" rx="4" fill="#991b1b" stroke="#f87171" stroke-width="2" />
              <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${id}</text>
            </g>
          `;
        }
        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="14" fill="#0284c7" stroke="#38bdf8" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${id}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 320 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          ⚪ 蓝色圆点代表原图节点 | 🟥 红色方点代表点双连通分量 (BCC) | 圆方交替必不相连同类点
        </div>
      </div>
    `;

    const root = container.closest('#algo-block-cut-tree-view');
    if (root) {
      const rEl = root.querySelector('#metric-round-count');
      const sEl = root.querySelector('#metric-square-count');

      if (rEl) rEl.textContent = `${step.roundNodes.length} 个`;
      if (sEl) sEl.textContent = `${step.squareNodes.length} 个`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 圆方树拓扑性质:</span>
              <strong style="font-family: monospace; color: #2563eb;">圆点度数 ≥ 2 ⟺ 该点为原图割点；两圆点路径圆点即全部必经点</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'block-cut-tree',
  name: '圆方树与点双缩点 (Block-Cut Tree)',
  viewId: 'algo-block-cut-tree-view',
  category: 'graph',
  description: '进阶图论树化结构：Tarjan 提取点双连通分量、圆点代表原节点、方点代表点双、转化为树上路径与必经点求解 (洛谷 P4320 / P4630)',
  icon: '🌳',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 50,
  learningGoal: '掌握广义圆方树的构建算法、圆方相间性质及其在无向图必经点、两点间所有路径交集计算中的应用',
});

export { Visualizer as BlockCutTreeVisualizer };
