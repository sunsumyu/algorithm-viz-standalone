/**
 * 树上路径相交判定与 LCA 包含定理 (Tree Path Intersection & LCA) 声明式可视化器
 * 进阶树论: 路径相交充要条件 LCA(P1) in P2 or LCA(P2) in P1
 * 遵循 Matt Pocock 深模块哲学与标准 4-Card 声明式沙盘架构
 */

import { registerAlgorithm } from '../../../core/registry';
import { createDeclarativeVisualizer } from '../../../core/declarative-algorithm-visualizer';
import {
  TREE_PATH_INTERSECT_CODE_LANGUAGES,
  TREE_PATH_INTERSECT_PROBLEM_HTML,
  TREE_PATH_INTERSECT_ANALYSIS_HTML,
} from './tree-path-intersection-problem-content';
import {
  type TreeIntersectStep,
  buildTreePathIntersectSteps,
} from './tree-path-intersection-step-compiler';
import { renderTreePathIntersectionCanvas } from '../../../core/renderers/adapters/tree-path-intersection-canvas-adapter';

export type { TreeIntersectStep };
export { buildTreePathIntersectSteps };

const { template, Visualizer } = createDeclarativeVisualizer<TreeIntersectStep>({
  id: 'tree-path-intersection',
  name: '树上路径相交判定 (Tree Path Intersection)',
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
    { label: '路径一 (P1)', state: 'scanning' },
    { label: '路径二 (P2)', color: '#f59e0b' },
    { label: '🟢 相交交集点', state: 'discovered' },
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
    { id: 'metric-overlap-nodes', label: '交集节点', color: '#a855f7' },
  ],
  codeLanguages: TREE_PATH_INTERSECT_CODE_LANGUAGES,
  problemHtml: TREE_PATH_INTERSECT_PROBLEM_HTML,
  analysisHtml: TREE_PATH_INTERSECT_ANALYSIS_HTML,
  buildSteps: (inputs) => {
    const isIntersect = (inputs['input-intersect-case'] || 'intersect') === 'intersect';
    return buildTreePathIntersectSteps(isIntersect);
  },
  renderCanvas: renderTreePathIntersectionCanvas,
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
