/**
 * Kruskal 重构树 (Kruskal Reconstruction Tree) 声明式可视化器
 * 进阶树论: 边权转化为新节点点权、大根堆/小根堆性质、瓶颈路径转化为 LCA 点权、子树对应联通块 (洛谷 P4768 / P4197)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  KRUSKAL_TREE_CODE_LANGUAGES,
  KRUSKAL_TREE_PROBLEM_HTML,
  KRUSKAL_TREE_ANALYSIS_HTML,
} from './kruskal-reconstruction-tree-problem-content';

export interface KruskalTreeStep {
  curEdge: { u: number; v: number; w: number };
  newNodeId: number;
  nodeWeights: Record<number, number>;
  treeEdges: Array<{ u: number; v: number }>;
  status: 'init' | 'merge' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildKruskalTreeSteps(): KruskalTreeStep[] {
  const steps: KruskalTreeStep[] = [];

  steps.push({
    curEdge: { u: 1, v: 2, w: 3 },
    newNodeId: 4,
    nodeWeights: { 4: 3 },
    treeEdges: [
      { u: 4, v: 1 },
      { u: 4, v: 2 },
    ],
    status: 'merge',
    message: '1. [合并边 1-2, 权值 3] 新建重构树节点 4，点权为边权 3，连接代表子树根 1 与 2！',
    log: 'Kruskal 新建节点 4 (权值 3)：连接 1 与 2',
    codeLine: [18, 25],
  });

  steps.push({
    curEdge: { u: 2, v: 3, w: 5 },
    newNodeId: 5,
    nodeWeights: { 4: 3, 5: 5 },
    treeEdges: [
      { u: 4, v: 1 },
      { u: 4, v: 2 },
      { u: 5, v: 4 },
      { u: 5, v: 3 },
    ],
    status: 'done',
    message: '🎉 [重构树构建完成] 新建节点 5 (点权 5) 连接 4 与 3！任意两点 u, v 间路径瓶颈边权恰好等于其重构树上的 LCA 点权！',
    log: '✓ Kruskal 重构树构建完成：两点瓶颈边权 = val[LCA(u, v)]',
    codeLine: [28, 35],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<KruskalTreeStep>({
  id: 'kruskal-reconstruction-tree',
  name: 'Kruskal 重构树 (Kruskal Tree)',
  category: 'graph',
  icon: '🏗️',
  badge: {
    mode: '边权转点权二叉堆化',
    complexity: 'O(M log M + Q log N) · O(N + M)',
  },
  card1Title: '🏗️ 原图边权与重构二叉树沙盘',
  card2Title: '🧭 新建虚节点 val[u] 与 LCA 瓶颈监视器',
  card2Desc: '边权转化为父节点点权、大根堆性质与两点路径瓶颈 LCA',
  legend: [
    { label: '原图叶子节点 (1..3)', color: '#0284c7' },
    { label: '🏗️ 边权新建节点 (4..5)', color: '#f59e0b' },
    { label: '重构树连边', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '3 节点经典 Kruskal 重构树 (P4768)', values: {} },
  ],
  metrics: [
    { id: 'metric-kruskal-root', label: '重构树根节点', color: '#f59e0b' },
    { id: 'metric-lca-bottleneck', label: '瓶颈边权转换', color: '#10b981' },
  ],
  codeLanguages: KRUSKAL_TREE_CODE_LANGUAGES,
  problemHtml: KRUSKAL_TREE_PROBLEM_HTML,
  analysisHtml: KRUSKAL_TREE_ANALYSIS_HTML,
  buildSteps: () => buildKruskalTreeSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number; isInternal?: boolean }> = {
      1: { x: 75, y: 165 },
      2: { x: 135, y: 165 },
      3: { x: 235, y: 165 },
      4: { x: 105, y: 100, isInternal: true },
      5: { x: 170, y: 35, isInternal: true },
    };

    const svgEdges = step.treeEdges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#10b981" stroke-width="2" />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4, 5];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const w = step.nodeWeights[u];
        const isInternal = p.isInternal;
        const bg = isInternal ? '#b45309' : '#0369a1';
        const border = isInternal ? '#facc15' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            ${w !== undefined ? `<text x="${p.x + 24}" y="${p.y + 4}" fill="#facc15" font-size="9" font-weight="700" text-anchor="middle">w:${w}</text>` : ''}
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
        <svg style="width: 100%; height: 210px;" viewBox="0 0 310 200">
          ${svgEdges}
          ${svgNodes}
        </svg>
        <div style="font-size: 10.5px; color: #94a3b8; text-align: center;">
          🟡 金色节点为新建边权节点 | 具有大根堆性质：两点瓶颈路径边权 $\equiv \text{val}[\text{LCA}(u, v)]$
        </div>
      </div>
    `;

    const root = container.closest('#algo-kruskal-reconstruction-tree-view');
    if (root) {
      const rEl = root.querySelector('#metric-kruskal-root');
      const lEl = root.querySelector('#metric-lca-bottleneck');

      if (rEl) rEl.textContent = 'Node 5 (val:5)';
      if (lEl) lEl.textContent = 'val[LCA(u, v)]';

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 重构树三大核心性质:</span>
              <strong style="font-family: monospace; color: #2563eb;">1. 原图点全为叶子; 2. 具有大根堆性质; 3. 瓶颈路等价于 LCA 点权</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'kruskal-reconstruction-tree',
  name: 'Kruskal 重构树 (Kruskal Tree)',
  viewId: 'algo-kruskal-reconstruction-tree-view',
  category: 'graph',
  description: '高级树论经典：边权转化为新建点权、二叉大根堆拓扑结构、树上倍增 LCA 极速求任意两点瓶颈路径 (洛谷 P4768 / P4197)',
  icon: '🏗️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 40,
  learningGoal: '掌握 Kruskal 重构树的并查集新建虚点模板、大根堆性质及其与倍增跳祖先判定连通块',
});

export { Visualizer as KruskalReconstructionTreeVisualizer };
