/**
 * 树分治与点分治 (Tree Centroid Decomposition - 静态点分治) 声明式可视化器
 * 进阶树论: 递归寻找子树重心、最大子树不超过 size/2、路径经过重心与子树容斥 (POJ 1741 / 洛谷 P3806)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TREE_CENTROID_CODE_LANGUAGES,
  TREE_CENTROID_PROBLEM_HTML,
  TREE_CENTROID_ANALYSIS_HTML,
} from './tree-centroid-decomposition-problem-content';

export interface StaticCentroidStep {
  curCentroid: number;
  maxSubtreeSize: number;
  subtreeSizes: Record<number, number>;
  status: 'find_root' | 'calc_path' | 'recurse' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildStaticCentroidSteps(): StaticCentroidStep[] {
  const steps: StaticCentroidStep[] = [];

  steps.push({
    curCentroid: 1,
    maxSubtreeSize: 2,
    subtreeSizes: { 1: 5, 2: 2, 3: 2, 4: 1, 5: 1 },
    status: 'find_root',
    message: '1. [寻找第一层全树重心] 计算各子树大小，节点 1 的各子树最大 size = 2 ≤ 5/2，选定 1 为全树重心！',
    log: '定位全树重心：Node 1 (max_sub = 2 <= 5/2)',
    codeLine: [18, 25],
  });

  steps.push({
    curCentroid: 1,
    maxSubtreeSize: 2,
    subtreeSizes: { 1: 5, 2: 2, 3: 2, 4: 1, 5: 1 },
    status: 'calc_path',
    message: '2. [统计经过重心 1 的路径] 收集子树 2 和 3 到重心 1 的距离，双指针/哈希表匹配路径长度 ≤ K，减去同一子树内部多算路径！',
    log: '统计跨重心路径：双指针匹配 + 容斥去重',
    codeLine: [28, 35],
  });

  steps.push({
    curCentroid: 2,
    maxSubtreeSize: 1,
    subtreeSizes: { 2: 2, 4: 1 },
    status: 'recurse',
    message: '3. [递归分治子树] 标记重心 1 访问完毕，分别递归求解子连通块 {2, 4} 与 {3, 5}，分治深度严格 O(log N)！',
    log: '递归分治子连通块：选定子重心 Node 2',
    codeLine: [38, 45],
  });

  steps.push({
    curCentroid: 1,
    maxSubtreeSize: 2,
    subtreeSizes: { 1: 5, 2: 2, 3: 2, 4: 1, 5: 1 },
    status: 'done',
    message: '🎉 [点分治路径统计完成] 全树所有合法路径均在 O(N log² N) 严格时间内统计完毕！',
    log: '✓ 点分治统计完成：复杂度严格 O(N log^2 N)',
    codeLine: [48, 52],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<StaticCentroidStep>({
  id: 'tree-centroid-decomposition',
  name: '树分治与点分治 (Centroid Decomposition)',
  category: 'graph',
  icon: '⚖️',
  badge: {
    mode: '静态重心递归分治',
    complexity: 'O(N log² N) · O(N)',
  },
  card1Title: '⚖️ 树形拓扑与重心递归分割沙盘',
  card2Title: '🧭 重心最大子树与递归深度监视器',
  card2Desc: '子树节点数 size[u]、最大子树 max_part ≤ total/2 与容斥去重',
  legend: [
    { label: '普通树节点', color: '#0284c7' },
    { label: '👑 当前分治重心 (Centroid)', color: '#f59e0b' },
    { label: '🟢 已分治处理完毕', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '5 节点经典点分治树 (POJ 1741)', values: {} },
  ],
  metrics: [
    { id: 'metric-cur-centroid', label: '当前分治重心', color: '#f59e0b' },
    { id: 'metric-max-subtree', label: '重心最大子树', color: '#10b981' },
  ],
  codeLanguages: TREE_CENTROID_CODE_LANGUAGES,
  problemHtml: TREE_CENTROID_PROBLEM_HTML,
  analysisHtml: TREE_CENTROID_ANALYSIS_HTML,
  buildSteps: () => buildStaticCentroidSteps(),
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 155, y: 35 },
      2: { x: 95, y: 100 },
      3: { x: 215, y: 100 },
      4: { x: 75, y: 165 },
      5: { x: 235, y: 165 },
    };

    const treeEdges = [
      { u: 1, v: 2 },
      { u: 1, v: 3 },
      { u: 2, v: 4 },
      { u: 3, v: 5 },
    ];

    const svgEdges = treeEdges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#475569" stroke-width="1.5" />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4, 5];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isCentroid = step.curCentroid === u;
        const sz = step.subtreeSizes[u] || 0;
        const bg = isCentroid ? '#b45309' : '#0369a1';
        const border = isCentroid ? '#facc15' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="15" fill="${bg}" stroke="${border}" stroke-width="${isCentroid ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="11" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 26}" fill="#94a3b8" font-size="8.5" font-weight="700" text-anchor="middle">sz:${sz}</text>
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
          🟡 金色为当前分治重心 | 递归层数严格保证不超过 $\log_2 N$，分治树高对数级
        </div>
      </div>
    `;

    const root = container.closest('#algo-tree-centroid-decomposition-view');
    if (root) {
      const cEl = root.querySelector('#metric-cur-centroid');
      const sEl = root.querySelector('#metric-max-subtree');

      if (cEl) cEl.textContent = `Node ${step.curCentroid}`;
      if (sEl) sEl.textContent = `${step.maxSubtreeSize} (≤ size/2)`;

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 重心分治主定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">max_subtree(c) ≤ TotalSize / 2 ⟹ 递归层数 ≤ log₂N</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'tree-centroid-decomposition',
  name: '树分治与点分治 (Centroid Decomposition)',
  viewId: 'algo-tree-centroid-decomposition-view',
  category: 'graph',
  description: '经典进阶树论：递归寻找子树重心、最大子树不超过总体一半、树上路径统计与子树容斥 (POJ 1741 / 洛谷 P3806)',
  icon: '⚖️',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 44,
  learningGoal: '掌握静态点分治算法的重心查找模板、跨重心路径统计与容斥去重技巧',
});

export { Visualizer as TreeCentroidDecompositionVisualizer };
