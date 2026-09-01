/**
 * 树上路径相交判定与 LCA 包含定理 (Tree Path Intersection & LCA) 声明式可视化器
 * 进阶树论: 路径相交充要条件 LCA(P1) in P2 or LCA(P2) in P1
 * 遵循标准 4-Card 声明式沙盘架构 (createDeclarativeVisualizer)
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TREE_PATH_INTERSECT_CODE_LANGUAGES,
  TREE_PATH_INTERSECT_PROBLEM_HTML,
  TREE_PATH_INTERSECT_ANALYSIS_HTML,
} from './tree-path-intersection-problem-content';

export interface TreeIntersectStep {
  path1: [number, number];
  path2: [number, number];
  lca1: number;
  lca2: number;
  isIntersect: boolean;
  status: 'init' | 'calc_lca' | 'verify' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

export function buildTreePathIntersectSteps(isIntersectCase: boolean): TreeIntersectStep[] {
  const steps: TreeIntersectStep[] = [];

  if (isIntersectCase) {
    // 路径相交情况：P1=(4, 5) -> LCA=2; P2=(4, 6) -> LCA=1
    // LCA(P1)=2 在路径 P2=(4,6) 上
    steps.push({
      path1: [4, 5],
      path2: [4, 6],
      lca1: 2,
      lca2: 1,
      isIntersect: true,
      status: 'init',
      message: '1. [输入待判定路径] 路径一: (4 ➔ 5)，路径二: (4 ➔ 6)。',
      log: '输入路径: P1=(4,5), P2=(4,6)',
      codeLine: [12, 16],
    });

    steps.push({
      path1: [4, 5],
      path2: [4, 6],
      lca1: 2,
      lca2: 1,
      isIntersect: true,
      status: 'calc_lca',
      message: '2. [计算两路径 LCA] LCA(4, 5) = 节点 2，LCA(4, 6) = 节点 1。',
      log: '计算 LCA: LCA(P1)=2, LCA(P2)=1',
      codeLine: [18, 22],
    });

    steps.push({
      path1: [4, 5],
      path2: [4, 6],
      lca1: 2,
      lca2: 1,
      isIntersect: true,
      status: 'done',
      message: '🎉 [判定相交] LCA(P1)=2 位于路径 P2=(4➔2➔1➔3➔6) 上！两路径相交于节点 2 与节点 4！',
      log: '✓ 判定成功：LCA(P1)=2 在 P2 上，两路径相交',
      codeLine: [24, 28],
    });
  } else {
    // 不相交情况：P1=(4, 5), P2=(6, 7)
    steps.push({
      path1: [4, 5],
      path2: [6, 7],
      lca1: 2,
      lca2: 3,
      isIntersect: false,
      status: 'calc_lca',
      message: '1. [计算 LCA] LCA(4, 5) = 节点 2，LCA(6, 7) = 节点 3。',
      log: '计算 LCA: LCA(P1)=2, LCA(P2)=3',
      codeLine: [18, 22],
    });

    steps.push({
      path1: [4, 5],
      path2: [6, 7],
      lca1: 2,
      lca2: 3,
      isIntersect: false,
      status: 'done',
      message: '❌ [判定不相交] 节点 2 不在 P2 上，且节点 3 不在 P1 上，两路径互不相交！',
      log: '✓ 判定完成：两路径互不相交',
      codeLine: [24, 28],
    });
  }

  return steps;
}

const { template, Visualizer } = createDeclarativeVisualizer<TreeIntersectStep>({
  id: 'tree-path-intersection',
  name: '树上路径相交判定 (Tree Path Intersection)',
  viewId: 'algo-tree-path-intersection-view',
  category: 'graph',
  icon: '🌲',
  badge: {
    mode: 'LCA 包含定理 O(1) 判定',
    complexity: 'O(log N) · O(N log N)',
  },
  card1Title: '🌲 树形拓扑与双路径高亮沙盘',
  card2Title: '🧭 LCA 包含判定监视器',
  card2Desc: 'LCA(P1)、LCA(P2) 树上深度与路径包含关系验证',
  legend: [
    { label: '路径一 (P1)', color: '#38bdf8' },
    { label: '路径二 (P2)', color: '#f59e0b' },
    { label: '🟢 相交交集点', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'input-intersect-case',
      label: '判定用例',
      type: 'select',
      defaultValue: 'intersect',
      options: [
        { label: '相交路径用例: (4,5) 与 (4,6)', value: 'intersect' },
        { label: '不相交用例: (4,5) 与 (6,7)', value: 'disjoint' },
      ],
      width: '210px',
    },
  ],
  presets: [
    { label: '相交路径 (4,5) & (4,6)', values: { 'input-intersect-case': 'intersect' } },
    { label: '不相交路径 (4,5) & (6,7)', values: { 'input-intersect-case': 'disjoint' } },
  ],
  metrics: [
    { id: 'metric-lca-p1', label: 'LCA(P1)', color: '#38bdf8' },
    { id: 'metric-lca-p2', label: 'LCA(P2)', color: '#f59e0b' },
    { id: 'metric-intersect-result', label: '相交结论', color: '#10b981' },
  ],
  codeLanguages: TREE_PATH_INTERSECT_CODE_LANGUAGES,
  problemHtml: TREE_PATH_INTERSECT_PROBLEM_HTML,
  analysisHtml: TREE_PATH_INTERSECT_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const isIntersect = (inputs['input-intersect-case'] || 'intersect') === 'intersect';
    return buildTreePathIntersectSteps(isIntersect);
  },
  renderCanvas: (container, step) => {
    const nodeCoords: Record<number, { x: number; y: number }> = {
      1: { x: 155, y: 35 },
      2: { x: 95, y: 95 },
      3: { x: 215, y: 95 },
      4: { x: 65, y: 165 },
      5: { x: 125, y: 165 },
      6: { x: 185, y: 165 },
      7: { x: 245, y: 165 },
    };

    const treeEdges = [
      { u: 1, v: 2 },
      { u: 1, v: 3 },
      { u: 2, v: 4 },
      { u: 2, v: 5 },
      { u: 3, v: 6 },
      { u: 3, v: 7 },
    ];

    const svgEdges = treeEdges
      .map((e) => {
        const p1 = nodeCoords[e.u];
        const p2 = nodeCoords[e.v];
        if (!p1 || !p2) return '';
        return `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="#475569" stroke-width="2" />`;
      })
      .join('');

    const nodes = [1, 2, 3, 4, 5, 6, 7];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';
        const isLCA1 = step.lca1 === u;
        const isLCA2 = step.lca2 === u;
        const bg = isLCA1 && isLCA2 ? '#10b981' : isLCA1 ? '#0284c7' : isLCA2 ? '#f59e0b' : '#1e293b';

        return `
          <g>
            <circle cx="${p.x}" cy="${p.y}" r="14" fill="${bg}" stroke="#ffffff" stroke-width="2" />
            <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            ${isLCA1 ? `<text x="${p.x}" y="${p.y - 18}" fill="#38bdf8" font-size="8.5" font-weight="700" text-anchor="middle">LCA1</text>` : ''}
            ${isLCA2 ? `<text x="${p.x}" y="${p.y + 26}" fill="#facc15" font-size="8.5" font-weight="700" text-anchor="middle">LCA2</text>` : ''}
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
          相交充要条件：两路径相交 ⟺ LCA(P1) 位于 P2 上 或 LCA(P2) 位于 P1 上
        </div>
      </div>
    `;

    const root = container.closest('#algo-tree-path-intersection-view');
    if (root) {
      const l1El = root.querySelector('#metric-lca-p1');
      const l2El = root.querySelector('#metric-lca-p2');
      const resEl = root.querySelector('#metric-intersect-result');

      if (l1El) l1El.textContent = `Node ${step.lca1}`;
      if (l2El) l2El.textContent = `Node ${step.lca2}`;
      if (resEl) {
        resEl.textContent = step.isIntersect ? '✓ 路径相交' : '❌ 路径不相交';
        resEl.style.color = step.isIntersect ? '#10b981' : '#ef4444';
      }

      const customMetricsContainer = root.querySelector('#dsp-custom-metrics-container');
      if (customMetricsContainer) {
        customMetricsContainer.innerHTML = `
          <div style="display: flex; flex-direction: column; gap: 6px; font-size: 11px; color: #475569; padding: 2px 0;">
            <div style="display: flex; justify-content: space-between; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 4px; padding: 4px 8px;">
              <span style="color: #1e40af; font-weight: 700;">👑 LCA 包含定理:</span>
              <strong style="font-family: monospace; color: #2563eb;">isOnPath(LCA1, P2) || isOnPath(LCA2, P1)</strong>
            </div>
          </div>
        `;
      }
    }
  },
});

registerAlgorithm({
  id: 'tree-path-intersection',
  name: '树上路径相交判定 (Tree Path Intersection)',
  viewId: 'algo-tree-path-intersection-view',
  category: 'graph',
  description: '进阶树论定理：树上两条路径相交的充要条件判定、LCA 深度包含关系与 O(1) 快速检验',
  icon: '🌲',
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 68,
  learningGoal: '掌握树上路径相交的 LCA 包含定理数学证明及快速判定技巧',
});

export { Visualizer as TreePathIntersectionVisualizer };
