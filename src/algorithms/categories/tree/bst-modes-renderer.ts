/**
 * 二叉搜索树中的众数可视化器 (Find Mode in Binary Search Tree · LeetCode 501)
 * 采用顶层声明式架构与轻量领域适配器 (Thin Domain Adapter)
 *
 * Stage 1: 经典中序双指针在线动态结算递归 (Inorder Traversal with Dynamic Update)
 * Stage 2: 显式单调栈迭代中序 (Iterative Explicit Stack Inorder)
 * Stage 3: Morris 空间常数遍历 (Morris Inorder Traversal · O(1) 常数空间进阶算法)
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { buildTreeFromArr } from './tree-template';
import { BST_MODES_PROBLEM_HTML, BST_MODES_ANALYSIS_HTML } from './bst-modes-problem-content';
import {
  BST_MODES_STAGE1_CODES,
  BST_MODES_STAGE2_CODES,
  BST_MODES_STAGE3_CODES,
} from './bst-modes-stage-codes';
import {
  type BstModesStep,
  buildBstModesStage1Steps,
  buildBstModesStage2Steps,
  buildBstModesStage3Steps,
} from '../../../core/renderers/adapters/bst-modes-step-compiler';
import { BstModesCanvasAdapter } from '../../../core/renderers/adapters/bst-modes-canvas-adapter';

export type { BstModesStep };
export { buildBstModesStage1Steps, buildBstModesStage2Steps, buildBstModesStage3Steps };
export const renderBstModesCanvas = BstModesCanvasAdapter.renderCanvas;
export const renderBstModesCustomMetrics = BstModesCanvasAdapter.renderCustomMetrics;

const parseInput = (inputs?: Record<string, unknown>) => {
  const arr = parseTreeArray(inputs?.['input-tree'] || '[1, null, 2, 2]', [1, null, 2, 2]);
  return buildTreeFromArr(arr);
};

export const bstModesVisualizer = registerDeclarativeAlgorithm({
  id: 'bst-modes',
  aliases: ['leetcode-501', 'find-mode-in-binary-search-tree'],
  name: '二叉搜索树中的众数',
  category: 'tree',
  icon: '📊',
  difficulty: 'easy',
  learningGoal: '利用BST中序遍历相同元素连续出现的单调特性，采用双指针在线动态清空重置模式，单趟统计出所有最高频众数。',
  problemHtml: BST_MODES_PROBLEM_HTML,
  analysisHtml: BST_MODES_ANALYSIS_HTML,
  codeLanguages: BST_MODES_STAGE1_CODES,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 经典中序双指针递归',
      shortName: '双指针递归',
      num: 1,
      codeLanguages: BST_MODES_STAGE1_CODES,
      buildSteps: (inputs: Record<string, unknown>) => buildBstModesStage1Steps(parseInput(inputs)),
      renderCanvas: (c, s) => BstModesCanvasAdapter.renderCanvas(c, s as BstModesStep),
      renderCustomMetrics: (c, s) => BstModesCanvasAdapter.renderCustomMetrics(c, s as BstModesStep),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 显式单调栈迭代中序',
      shortName: '显式栈迭代',
      num: 2,
      codeLanguages: BST_MODES_STAGE2_CODES,
      buildSteps: (inputs: Record<string, unknown>) => buildBstModesStage2Steps(parseInput(inputs)),
      renderCanvas: (c, s) => BstModesCanvasAdapter.renderCanvas(c, s as BstModesStep),
      renderCustomMetrics: (c, s) => BstModesCanvasAdapter.renderCustomMetrics(c, s as BstModesStep),
    },
    {
      id: 'stage-3',
      name: 'Stage 3: Morris 空间常数遍历',
      shortName: 'Morris 常数空间',
      num: 3,
      codeLanguages: BST_MODES_STAGE3_CODES,
      buildSteps: (inputs: Record<string, unknown>) => buildBstModesStage3Steps(parseInput(inputs)),
      renderCanvas: (c, s) => BstModesCanvasAdapter.renderCanvas(c, s as BstModesStep),
      renderCustomMetrics: (c, s) => BstModesCanvasAdapter.renderCustomMetrics(c, s as BstModesStep),
    },
  ],
  inputs: [
    { id: 'input-tree', label: 'BST 层序序列 (JSON/逗号数组)', type: 'text', defaultValue: '[1, null, 2, 2]', placeholder: '例如: [1, null, 2, 2] 或 [2, 1, 2, 1]' },
  ],
  presets: [
    { label: '官方样例 [1, null, 2, 2] (众数为 [2])', values: { 'input-tree': '[1, null, 2, 2]' }, description: '右偏二叉树，节点值 2 重复出现两次' },
    { label: '单节点 [0] (众数为 [0])', values: { 'input-tree': '[0]' }, description: '单一节点边界用例，众数为 [0]' },
    { label: '多众数并列 [2, 1, 2, 1] (众数为 [1, 2])', values: { 'input-tree': '[2, 1, 2, 1]' }, description: '并列双众数用例，1 和 2 均出现两次' },
    { label: '复合BST [6, 2, 8, 0, 4, 7, 9, null, null, 2, 6] (众数为 [2, 6])', values: { 'input-tree': '[6, 2, 8, 0, 4, 7, 9, null, null, 2, 6]' }, description: '较深二叉搜索树，2 和 6 出现两次' },
  ],
  generateSteps: (inputs: Record<string, unknown>) => buildBstModesStage1Steps(parseInput(inputs)),
  buildSteps: (inputs: Record<string, unknown>) => buildBstModesStage1Steps(parseInput(inputs)),
  renderCanvas: (c, s) => BstModesCanvasAdapter.renderCanvas(c, s as BstModesStep),
  renderCustomMetrics: (c, s) => BstModesCanvasAdapter.renderCustomMetrics(c, s as BstModesStep),
});
