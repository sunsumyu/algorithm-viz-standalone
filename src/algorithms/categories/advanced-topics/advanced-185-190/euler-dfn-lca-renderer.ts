/**
 * Class 185: 欧拉序与 DFN 序求 LCA (Euler Tour & DFN Order LCA)
 * 欧拉序 + 深度 RMQ + ST 表 O(1) 求解 / 洛谷 P3379 【模板】最近公共祖先
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { ADVANCED_185_190_PROBLEMS } from './advanced-185-190-problem-content';
import { EULER_DFN_LCA_CODES } from './advanced-185-190-stage-codes';
import {
  buildEulerDfnSteps,
  EulerDfnStep,
} from '../../../../core/renderers/adapters/euler-dfn-lca-185-step-compiler';
import { renderEulerDfnCanvas } from '../../../../core/renderers/adapters/euler-dfn-lca-185-canvas-adapter';

export { buildEulerDfnSteps, type EulerDfnStep };

export const eulerDfnLcaVisualizer = registerDeclarativeAlgorithm<EulerDfnStep>({
  id: 'euler-dfn-lca-185',
  name: '欧拉序与 DFN 序求 LCA (Class 185)',
  aliases: ['class185-code01', 'euler-dfn-lca-185', 'euler-lca'],
  category: 'tree',
  icon: '📜',
  difficulty: 3,
  levelOrder: 185,
  description: '左程云算法通关课 Class 185：欧拉序与 DFN 序求 LCA。欧拉序+深度 RMQ 将树上 LCA 转化为区间最值，ST 表预处理 O(N log N)，单次查询 O(1) 秒出祖先。',
  learningGoal: '掌握欧拉序展开机制、树上深度序列的区间极小值映射以及 O(1) 常数时间 LCA 检索',
  problemHtml: ADVANCED_185_190_PROBLEMS.eulerDfnLca.html,
  analysisHtml: ADVANCED_185_190_PROBLEMS.eulerDfnLca.html,
  presets: [
    { label: '查询 LCA(4, 5) -> 节点 2', values: { preset: 'lca_4_5' } },
  ],
  codeLanguages: EULER_DFN_LCA_CODES,
  generateSteps: () => buildEulerDfnSteps(),
  renderCanvas: (container, step) => renderEulerDfnCanvas(container, step),
});
