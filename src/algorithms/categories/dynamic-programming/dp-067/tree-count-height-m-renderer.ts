/**
 * 节点数为 n 高度不大于 m 的二叉树结构数 (牛客网 / 左神 Class067 Code05)
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { DP_067_PROBLEMS } from './dp-067-problem-content';
import {
  type TreeCountTreeNode,
  type TreeCountRecStep,
  type TreeCountMemoStep,
  type TreeCount2DStep,
  type TreeCountSpaceOptStep,
  parseTreeCountInputs,
  buildTreeCountDepTree,
  buildTreeCountStage1Steps,
  buildTreeCountStage2Steps,
  buildTreeCountStage3Steps,
  buildTreeCountStage4Steps,
} from '../../../../core/renderers/adapters/tree-count-height-m-step-compiler';
import {
  renderTreeSplitView,
  createTreeCountStages,
} from '../../../../core/renderers/adapters/tree-count-height-m-canvas-adapter';

// 向后兼容导出
export {
  type TreeCountTreeNode,
  type TreeCountRecStep,
  type TreeCountMemoStep,
  type TreeCount2DStep,
  type TreeCountSpaceOptStep,
  parseTreeCountInputs,
  buildTreeCountDepTree,
  buildTreeCountStage1Steps,
  buildTreeCountStage2Steps,
  buildTreeCountStage3Steps,
  buildTreeCountStage4Steps,
  renderTreeSplitView,
};

export const TreeCountHeightMDeclarativeResult = registerDeclarativeAlgorithm<any>({
  id: 'tree-count-height-m',
  name: '节点数n高度不大于m的二叉树结构数',
  viewId: 'algo-tree-count-height-m-view',
  category: 'dynamic-programming',
  description: '左程云算法讲解067 Code05：节点数为n高度不大于m的二叉树结构种类数，左右子树独立形态笛卡尔乘积累加',
  icon: '🌲',
  aliases: ['class067-code05', 'tree-count-height-m-067', 'binary-tree-count-height-m'],
  difficulty: 3,
  levelOrder: 105,
  learningGoal: '掌握树形规模拆分思想、左右子树笛卡尔乘积计数模型以及二维列滚动空间压缩',
  badge: {
    mode: '树形规模拆分 · 列滚动 DP',
    complexity: 'O(M×N^2) · O(N) 空间',
  },
  inputs: [
    { id: 'input-n', label: '节点总数 n:', type: 'number', defaultValue: 5, width: '60px' },
    { id: 'input-m', label: '高度上限 m:', type: 'number', defaultValue: 3, width: '60px' },
  ],
  presets: [
    { label: '牛客经典案例 (n=5, m=3 Ans=6)', values: { 'input-n': 5, 'input-m': 3 } },
    { label: '单节点案例 (n=1, m=1 Ans=1)', values: { 'input-n': 1, 'input-m': 1 } },
    { label: '卡特兰数上限 (n=4, m=4 Ans=14)', values: { 'input-n': 4, 'input-m': 4 } },
  ],
  metrics: [
    { id: 'metric-params', label: '当前规模', color: '#2563eb' },
    { id: 'metric-status', label: '状态', color: '#10b981' },
    { id: 'metric-val', label: '结构形态数', color: '#f59e0b' },
  ],
  codeLanguages: DP_067_PROBLEMS['tree-count-height-m'].codeLanguages,
  problemHtml: DP_067_PROBLEMS['tree-count-height-m'].problemHtml,
  analysisHtml: DP_067_PROBLEMS['tree-count-height-m'].analysisHtml,
  defaultStage: 'stage-1',
  buildSteps: buildTreeCountStage1Steps,
  stages: createTreeCountStages(),
});

export const TreeCountHeightMVisualizer = TreeCountHeightMDeclarativeResult.Visualizer;
