/**
 * 将有序数组转换为二叉搜索树可视化器 (Convert Sorted Array to BST · LeetCode 108)
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范 (LOC < 150 行)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  SORTED_ARRAY_TO_BST_PROBLEM_HTML,
  SORTED_ARRAY_TO_BST_ANALYSIS_HTML,
} from './sorted-array-to-bst-problem-content';
import {
  SORTED_ARRAY_TO_BST_STAGE1_CODES,
  SORTED_ARRAY_TO_BST_STAGE2_CODES,
  SORTED_ARRAY_TO_BST_STAGE3_CODES,
} from './sorted-array-to-bst-stage-codes';
import {
  SortedArrayToBstStep,
  collectTreeValues,
  parseAndBuildSortedArrayToBstNums,
  buildSortedArrayToBstStage1Steps,
  buildSortedArrayToBstStage2Steps,
  buildSortedArrayToBstStage3Steps,
} from '../../../core/renderers/adapters/sorted-array-to-bst-step-compiler';
import {
  SortedArrayToBstCanvasAdapter,
  renderSortedArrayToBstCustomMetrics,
} from '../../../core/renderers/adapters/sorted-array-to-bst-canvas-adapter';

// 兼容导出
export type { SortedArrayToBstStep };
export {
  collectTreeValues,
  buildSortedArrayToBstStage1Steps,
  buildSortedArrayToBstStage2Steps,
  buildSortedArrayToBstStage3Steps,
  renderSortedArrayToBstCustomMetrics,
};

export const sortedArrayToBstVisualizer = registerDeclarativeAlgorithm<SortedArrayToBstStep>({
  id: 'sorted-array-to-bst',
  name: '有序数组转二叉搜索树',
  category: 'tree',
  aliases: ['leetcode-108', 'convert-sorted-array-to-binary-search-tree'],
  icon: '🔄',
  badge: {
    mode: '多阶段演化: 偏左中点 · 偏右中点 · 三队列 BFS 迭代',
    complexity: 'O(N) · O(log N)',
  },
  card1Title: '📊 平衡 BST 拓扑结构沙盘',
  card2Title: '🧭 二分区间划分与调用栈/队列监视器',
  card2Desc: '当前切分区间 [left..right]、选定中点 mid 与平衡树高度监视',
  legend: [
    { label: '中点/新创建节点', color: '#fbbf24' },
    { label: '已完成子树节点', color: '#10b981' },
    { label: '正在处理节点', color: '#3b82f6' },
  ],
  inputs: [
    {
      id: 'input-nums',
      label: '升序数组 nums (逗号分隔)',
      type: 'text',
      defaultValue: '-10, -3, 0, 5, 9',
      placeholder: '例如: -10, -3, 0, 5, 9',
    },
  ],
  presets: [
    {
      label: 'LeetCode 官方标准用例 (5节点)',
      values: { 'input-nums': '-10, -3, 0, 5, 9' },
      description: '奇数长度 5 节点，中点为 0，左子树 (-10, -3)，右子树 (5, 9)',
    },
    {
      label: '偶数长度测试用例 (4节点)',
      values: { 'input-nums': '1, 2, 3, 4' },
      description: '偶数长度区间，适合观察偏左中点与偏右中点的拓扑偏转差异',
    },
    {
      label: '简单三节点树 (3节点)',
      values: { 'input-nums': '1, 2, 3' },
      description: '经典完全满二叉树，根为 2，左右分别为 1 和 3',
    },
    {
      label: '长序列平衡测试 (7节点)',
      values: { 'input-nums': '0, 1, 2, 3, 4, 5, 6' },
      description: '7 节点满二叉搜索树，根为 3',
    },
    {
      label: '单节点极限用例',
      values: { 'input-nums': '42' },
      description: '仅包含单一元素 42',
    },
  ],
  metrics: [
    { id: 'cur-range', label: '当前区间 [L..R]', color: '#3b82f6' },
    { id: 'mid-val', label: '选中中点根节点', color: '#fbbf24' },
    { id: 'action-type', label: '当前分治动作', color: '#10b981' },
  ],
  codeLanguages: SORTED_ARRAY_TO_BST_STAGE1_CODES,
  problemHtml: SORTED_ARRAY_TO_BST_PROBLEM_HTML,
  analysisHtml: SORTED_ARRAY_TO_BST_ANALYSIS_HTML,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 偏左中点经典分治递归 (LC 108 经典二分)',
      shortName: '偏左中点递归',
      num: 1,
      codeLanguages: SORTED_ARRAY_TO_BST_STAGE1_CODES,
      buildSteps: (inputs) => buildSortedArrayToBstStage1Steps(parseAndBuildSortedArrayToBstNums(inputs)),
      renderCanvas: SortedArrayToBstCanvasAdapter.renderCanvas,
      renderCustomMetrics: SortedArrayToBstCanvasAdapter.renderCustomMetrics,
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 偏右中点分治递归 (探索二叉搜索树多解)',
      shortName: '偏右中点递归',
      num: 2,
      codeLanguages: SORTED_ARRAY_TO_BST_STAGE2_CODES,
      buildSteps: (inputs) => buildSortedArrayToBstStage2Steps(parseAndBuildSortedArrayToBstNums(inputs)),
      renderCanvas: SortedArrayToBstCanvasAdapter.renderCanvas,
      renderCustomMetrics: SortedArrayToBstCanvasAdapter.renderCustomMetrics,
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 三队列显式 BFS 迭代模拟 (零递归调用栈)',
      shortName: '三队列迭代',
      num: 3,
      codeLanguages: SORTED_ARRAY_TO_BST_STAGE3_CODES,
      buildSteps: (inputs) => buildSortedArrayToBstStage3Steps(parseAndBuildSortedArrayToBstNums(inputs)),
      renderCanvas: SortedArrayToBstCanvasAdapter.renderCanvas,
      renderCustomMetrics: SortedArrayToBstCanvasAdapter.renderCustomMetrics,
    },
  ],
  generateSteps: (inputs) => buildSortedArrayToBstStage1Steps(parseAndBuildSortedArrayToBstNums(inputs)),
  buildSteps: (inputs) => buildSortedArrayToBstStage1Steps(parseAndBuildSortedArrayToBstNums(inputs)),
  renderCanvas: SortedArrayToBstCanvasAdapter.renderCanvas,
  renderCustomMetrics: SortedArrayToBstCanvasAdapter.renderCustomMetrics,
});
