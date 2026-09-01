/**
 * 动态点分树 (Dynamic Centroid Tree - 点分治树上重构) 声明式可视化器
 * 进阶树论: 重心递归分治建树、树高严格 O(log N)、动态单点修改与全局路径维护 (洛谷 P6329 / SP1437)
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  CENTROID_TREE_CODE_LANGUAGES,
  CENTROID_TREE_PROBLEM_HTML,
  CENTROID_TREE_ANALYSIS_HTML,
} from './centroid-tree-problem-content';

export interface CentroidTreeStep {
  originalRoot: number;
  centroidParents: Record<number, number | null>;
  activeNode: number;
  queryAns: number;
  status: 'init' | 'build' | 'query' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildCentroidTreeSteps(): CentroidTreeStep[] {
  const steps: CentroidTreeStep[] = [];

  steps.push({
    originalRoot: 1,
    centroidParents: { 1: null, 2: null, 3: null, 4: null, 5: null },
    activeNode: 1,
    queryAns: 0,
    status: 'init',
    message: '1. [原图与第一层重心] 找到全树重心 1，作为点分树的根节点。',
    log: '找到全树重心：Node 1 成为点分树根',
    codeLine: [15, 20],
  });

  steps.push({
    originalRoot: 1,
    centroidParents: { 1: null, 2: 1, 3: 1, 4: null, 5: null },
    activeNode: 2,
    queryAns: 0,
    status: 'build',
    message: '2. [第二层子树重心] 分割后子树重心 2 与 3，向点分树父节点 1 连边。',
    log: '递归重心连边：2 ➔ 1, 3 ➔ 1',
    codeLine: [22, 28],
  });

  steps.push({
    originalRoot: 1,
    centroidParents: { 1: null, 2: 1, 3: 1, 4: 2, 5: 3 },
    activeNode: 4,
    queryAns: 0,
    status: 'build',
    message: '3. [点分树重构完成] 递归得到点分树，最大树高严格为 O(log N) = 2！',
    log: '点分树构建完毕：树高严格 O(log N)',
    codeLine: [30, 35],
  });

  steps.push({
    originalRoot: 1,
    centroidParents: { 1: null, 2: 1, 3: 1, 4: 2, 5: 3 },
    activeNode: 4,
    queryAns: 12,
    status: 'done',
    message: '🎉 [动态跳父节点查询] 查询 4 的邻域，仅需沿点分树逐层跳父节点 4 ➔ 2 ➔ 1，单次查询 O(log² N)！',
    log: '✓ 动态点分树查询完成：跳父节点 4->2->1，复杂度 O(log^2 N)',
    codeLine: [38, 45],
  });

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<CentroidTreeStep>({
  id: 'centroid-tree',
  name: '动态点分树 (Centroid Tree)',
  category: 'graph',
  icon: '🌲',
  badge: {
    mode: '重心分治重构树',
    complexity: 'O(N log N) · O(N)',
  },
  card1Title: '🌲 原图树形与点分重构树沙盘',
  card2Title: '🧭 点分树父子关系监视器',
  card2Desc: '各节点点分树父节点 fa[u]、树高 O(log N) 与跳链查询',
  legend: [
    { label: '原树节点', color: '#0284c7' },
    { label: '👑 点分树根节点', color: '#f59e0b' },
    { label: '🟢 当前活跃/查询链节点', color: '#10b981' },
  ],
  inputs: [],
  presets: [
    { label: '5 节点经典点分树', values: {} },
  ],
  metrics: [
    { id: 'metric-active-node', label: '当前点分节点', color: '#2563eb' },
    { id: 'metric-tree-height', label: '点分树最大深度', color: '#10b981' },
  ],
  codeLanguages: CENTROID_TREE_CODE_LANGUAGES,
  problemHtml: CENTROID_TREE_PROBLEM_HTML,
  analysisHtml: CENTROID_TREE_ANALYSIS_HTML,
  buildSteps: () => buildCentroidTreeSteps(),
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
        const isCentroidEdge = step.centroidParents[e.v] === e.u;
        const color = isCentroidEdge ? '#10b981' : '#475569';
        const width = isCentroidEdge ? 2.5 : 1.5;

        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4, 5];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isRoot = u === 1;
        const isCur = step.activeNode === u;
        const bg = isCur ? '#f59e0b' : isRoot ? '#065f46' : '#1e3a8a';
        const border = isCur ? '#facc15' : isRoot ? '#10b981' : '#38bdf8';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="14" fill="${bg}" stroke="${border}" stroke-width="${isCur || isRoot ? 2.5 : 1.5}" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
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
          🟢 绿色边为点分树父子关系 | 点分树树高严格不超过 $\log_2 N$，动态修改只影响到根的一条链
        </div>
      </div>
    `;

    const root = container.closest('#algo-centroid-tree-view');
    if (root) {
      const nodeEl = root.querySelector('#metric-active-node');
      const hEl = root.querySelector('#metric-tree-height');

      if (nodeEl) nodeEl.textContent = `Node ${step.activeNode}`;
      if (hEl) hEl.textContent = 'O(log N) = 2';

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        const faItems = Object.entries(step.centroidParents)
          .map(([u, fa]) => `<span style="background: #f8fafc; border: 1px solid #e2e8f0; padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 10px;">fa[N${u}] = ${fa !== null ? `N${fa}` : 'Root'}</span>`)
          .join(' ');

        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span>点分树父指针表 fa[u]:</span>
              <div style="display: flex; gap: 4px;">${faItems}</div>
            </div>
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 动态点分树单次修改/查询:</span>
              <strong style="font-family: monospace; color: #2563eb;">O(log² N) 严格上界</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'centroid-tree',
  name: '动态点分树 (Centroid Tree)',
  viewId: 'algo-centroid-tree-view',
  category: 'graph',
  description: '进阶树论点分治重构：重心递归建树、树高严格 O(log N)、动态单点修改与路径信息维护 (洛谷 P6329)',
  icon: '🌲',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 61,
  learningGoal: '掌握动态点分树的重构方法、树高对数级性质以及跳链更新和容斥查询技巧',
});

export { Visualizer as CentroidTreeVisualizer };
