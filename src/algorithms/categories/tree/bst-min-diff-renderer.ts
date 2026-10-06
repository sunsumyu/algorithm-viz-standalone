/**
 * 二叉搜索树最小绝对差可视化器 (Minimum Absolute Difference in BST · LeetCode 530 / LC 783)
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范 (LOC < 150 行)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  BST_MIN_DIFF_PROBLEM_HTML,
  BST_MIN_DIFF_ANALYSIS_HTML,
} from './bst-min-diff-problem-content';
import {
  BST_MIN_DIFF_STAGE1_CODES,
  BST_MIN_DIFF_STAGE2_CODES,
  BST_MIN_DIFF_STAGE3_CODES,
} from './bst-min-diff-stage-codes';
import {
  BstMinDiffStep,
  buildBstMinDiffStage1Steps,
  buildBstMinDiffStage2Steps,
  buildBstMinDiffStage3Steps,
  parseBstMinDiffInputs,
} from '../../../core/renderers/adapters/bst-min-diff-step-compiler';
import {
  BstMinDiffCanvasAdapter,
  renderBstMinDiffCanvas,
  renderBstMinDiffCustomMetrics,
} from '../../../core/renderers/adapters/bst-min-diff-canvas-adapter';

// 兼容导出
export type { BstMinDiffStep };
export {
  buildBstMinDiffStage1Steps,
  buildBstMinDiffStage2Steps,
  buildBstMinDiffStage3Steps,
  renderBstMinDiffCanvas,
  renderBstMinDiffCustomMetrics,
};

export const bstMinDiffVisualizer = registerDeclarativeAlgorithm({
  id: 'bst-min-diff',
  aliases: ['leetcode-530', 'leetcode-783', 'minimum-absolute-difference-in-bst'],
  name: '二叉搜索树的最小绝对差',
  category: 'tree',
  icon: '📏',
  difficulty: 'easy',
  learningGoal: '利用BST中序遍历严格升序的单调性质，将全局任意两节点最小绝对差规约为相邻两项的极小差。',
  problemHtml: BST_MIN_DIFF_PROBLEM_HTML,
  analysisHtml: BST_MIN_DIFF_ANALYSIS_HTML,
  codeLanguages: BST_MIN_DIFF_STAGE1_CODES,

  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 经典中序双指针递归',
      shortName: '双指针递归',
      num: 1,
      codeLanguages: BST_MIN_DIFF_STAGE1_CODES,
      buildSteps: (inputs: Record<string, unknown>) => buildBstMinDiffStage1Steps(parseBstMinDiffInputs(inputs)),
      renderCanvas: (c, s) => BstMinDiffCanvasAdapter.renderCanvas(c, s as BstMinDiffStep),
      renderCustomMetrics: (c, s) => BstMinDiffCanvasAdapter.renderCustomMetrics(c, s as BstMinDiffStep),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 显式单调栈迭代中序',
      shortName: '显式栈迭代',
      num: 2,
      codeLanguages: BST_MIN_DIFF_STAGE2_CODES,
      buildSteps: (inputs: Record<string, unknown>) => buildBstMinDiffStage2Steps(parseBstMinDiffInputs(inputs)),
      renderCanvas: (c, s) => BstMinDiffCanvasAdapter.renderCanvas(c, s as BstMinDiffStep),
      renderCustomMetrics: (c, s) => BstMinDiffCanvasAdapter.renderCustomMetrics(c, s as BstMinDiffStep),
    },
    {
      id: 'stage-3',
      name: 'Stage 3: Morris 空间常数遍历',
      shortName: 'Morris 常数空间',
      num: 3,
      codeLanguages: BST_MIN_DIFF_STAGE3_CODES,
      buildSteps: (inputs: Record<string, unknown>) => buildBstMinDiffStage3Steps(parseBstMinDiffInputs(inputs)),
      renderCanvas: (c, s) => BstMinDiffCanvasAdapter.renderCanvas(c, s as BstMinDiffStep),
      renderCustomMetrics: (c, s) => BstMinDiffCanvasAdapter.renderCustomMetrics(c, s as BstMinDiffStep),
    },
  ],

  inputs: [
    {
      id: 'input-tree',
      label: 'BST 层序序列 (JSON/逗号数组)',
      type: 'text',
      defaultValue: '[4, 2, 6, 1, 3]',
      placeholder: '例如: [4, 2, 6, 1, 3] 或 [1, 0, 48, null, null, 12, 49]',
    },
  ],
  presets: [
    {
      label: '经典BST [4, 2, 6, 1, 3] (最小差为 1)',
      values: { 'input-tree': '[4, 2, 6, 1, 3]' },
      description: '标准经典用例，中序为 [1, 2, 3, 4, 6]，最小差为 1',
    },
    {
      label: '非对称BST [1, 0, 48, null, null, 12, 49] (最小差为 1)',
      values: { 'input-tree': '[1, 0, 48, null, null, 12, 49]' },
      description: '右深非平衡BST，中序为 [0, 1, 12, 48, 49]，最小差为 1',
    },
    {
      label: '大数值BST [236, 104, 701, null, 227, null, 911] (最小差为 9)',
      values: { 'input-tree': '[236, 104, 701, null, 227, null, 911]' },
      description: '跨度大数值BST，最小差为 236 - 227 = 9',
    },
    {
      label: '三节点BST [5, 1, 7] (最小差为 2)',
      values: { 'input-tree': '[5, 1, 7]' },
      description: '简单三节点BST，中序为 [1, 5, 7]，最小差为 2',
    },
  ],

  generateSteps: (inputs: Record<string, unknown>) => buildBstMinDiffStage1Steps(parseBstMinDiffInputs(inputs)),
  buildSteps: (inputs: Record<string, unknown>) => buildBstMinDiffStage1Steps(parseBstMinDiffInputs(inputs)),
  renderCanvas: (c, s) => BstMinDiffCanvasAdapter.renderCanvas(c, s as BstMinDiffStep),
  renderCustomMetrics: (c, s) => BstMinDiffCanvasAdapter.renderCustomMetrics(c, s as BstMinDiffStep),
});
