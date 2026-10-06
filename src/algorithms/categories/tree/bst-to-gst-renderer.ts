/**
 * 把二叉搜索树转换为累加树可视化器 (Convert BST to Greater Tree · LeetCode 538 / LC 1038)
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范 (LOC < 150 行)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  BST_TO_GST_PROBLEM_HTML,
  BST_TO_GST_ANALYSIS_HTML,
} from './bst-to-gst-problem-content';
import {
  BST_TO_GST_STAGE1_CODES,
  BST_TO_GST_STAGE2_CODES,
  BST_TO_GST_STAGE3_CODES,
} from './bst-to-gst-stage-codes';
import {
  BstToGstStep,
  parseAndBuildBstToGstTree,
  buildBstToGstStage1Steps,
  buildBstToGstStage2Steps,
  buildBstToGstStage3Steps,
} from '../../../core/renderers/adapters/bst-to-gst-step-compiler';
import {
  BstToGstCanvasAdapter,
  renderBstToGstCanvas,
  renderBstToGstCustomMetrics,
} from '../../../core/renderers/adapters/bst-to-gst-canvas-adapter';

// 兼容导出
export type { BstToGstStep };
export {
  buildBstToGstStage1Steps,
  buildBstToGstStage2Steps,
  buildBstToGstStage3Steps,
  renderBstToGstCanvas,
  renderBstToGstCustomMetrics,
};

export const bstToGstVisualizer = registerDeclarativeAlgorithm<BstToGstStep>({
  id: 'bst-to-gst',
  aliases: ['leetcode-538', 'leetcode-1038', 'convert-bst-to-greater-tree', 'binary-search-tree-to-greater-sum-tree'],
  name: '把二叉搜索树转换为累加树',
  category: 'tree',
  icon: '💰',
  difficulty: 'medium',
  learningGoal: '利用BST「右-根-左」反向中序严格递减的性质，通过单变量全局累加实现节点值原地后缀累加转换。',
  problemHtml: BST_TO_GST_PROBLEM_HTML,
  analysisHtml: BST_TO_GST_ANALYSIS_HTML,
  codeLanguages: BST_TO_GST_STAGE1_CODES,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 反向中序递归遍历',
      shortName: '反向中序递归',
      num: 1,
      codeLanguages: BST_TO_GST_STAGE1_CODES,
      buildSteps: (inputs) => buildBstToGstStage1Steps(parseAndBuildBstToGstTree(inputs)),
      renderCanvas: BstToGstCanvasAdapter.renderCanvas,
      renderCustomMetrics: BstToGstCanvasAdapter.renderCustomMetrics,
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 显式单调栈迭代反向中序',
      shortName: '显式栈迭代',
      num: 2,
      codeLanguages: BST_TO_GST_STAGE2_CODES,
      buildSteps: (inputs) => buildBstToGstStage2Steps(parseAndBuildBstToGstTree(inputs)),
      renderCanvas: BstToGstCanvasAdapter.renderCanvas,
      renderCustomMetrics: BstToGstCanvasAdapter.renderCustomMetrics,
    },
    {
      id: 'stage-3',
      name: 'Stage 3: Morris 反向空间常数遍历',
      shortName: 'Morris 常数空间',
      num: 3,
      codeLanguages: BST_TO_GST_STAGE3_CODES,
      buildSteps: (inputs) => buildBstToGstStage3Steps(parseAndBuildBstToGstTree(inputs)),
      renderCanvas: BstToGstCanvasAdapter.renderCanvas,
      renderCustomMetrics: BstToGstCanvasAdapter.renderCustomMetrics,
    },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: 'BST 层序序列 (JSON/逗号数组)',
      type: 'text',
      defaultValue: '[4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]',
      placeholder: '例如: [4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8] 或 [0, null, 1]',
    },
  ],
  presets: [
    {
      label: '官方经典 [4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]',
      values: { 'input-tree': '[4, 1, 6, 0, 2, 5, 7, null, null, null, 3, null, null, null, 8]' },
      description: '标准经典用例，全树累加和为 36',
    },
    {
      label: '单侧树 [0, null, 1]',
      values: { 'input-tree': '[0, null, 1]' },
      description: '右单链树，转换后为 [1, null, 1]',
    },
    {
      label: '对称小树 [1, 0, 2]',
      values: { 'input-tree': '[1, 0, 2]' },
      description: '简单三节点BST，转换后为 [3, 3, 2]',
    },
    {
      label: '单节点 [3]',
      values: { 'input-tree': '[3]' },
      description: '单一节点边界，转换后仍为 [3]',
    },
  ],
  generateSteps: (inputs) => buildBstToGstStage1Steps(parseAndBuildBstToGstTree(inputs)),
  buildSteps: (inputs) => buildBstToGstStage1Steps(parseAndBuildBstToGstTree(inputs)),
  renderCanvas: BstToGstCanvasAdapter.renderCanvas,
  renderCustomMetrics: BstToGstCanvasAdapter.renderCustomMetrics,
});
