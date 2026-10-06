/**
 * 从前序/后序与中序遍历构造二叉树轻量领域适配器 (Thin Domain Adapter · LeetCode 105 & 106 / Zuoshen Class 036 Code07)
 * 遵循 Matt Pocock 深模块规范 (LOC < 150 行)，推演编译与画布呈现委托至统一深模块：
 *   - BuildTreeStepCompiler (推演步进编译器)
 *   - BuildTreeCanvasAdapter (树形沙盘与指标呈现适配器)
 */

import { parseNumberList } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  BUILD_TREE_PROBLEM_HTML,
  BUILD_TREE_ANALYSIS_HTML,
} from './build-tree-problem-content';
import {
  BUILD_TREE_STAGE1_PRE_IN_CODE,
  BUILD_TREE_STAGE2_POST_IN_CODE,
  BUILD_TREE_STAGE3_STACK_CODE,
} from './build-tree-stage-codes';
import {
  BuildTreeStepCompiler,
  BTStep,
  BUILD_TREE_CODE_LINES,
  BUILD_TREE_STAGE2_LINES,
  BUILD_TREE_STAGE3_LINES,
  collectTreeValues,
  buildTreeSteps,
  buildTreeStage2PostorderSteps,
  buildTreeStage3StackSteps,
} from '../../../core/renderers/adapters/build-tree-step-compiler';
import {
  BuildTreeCanvasAdapter,
  renderBuildTreeCanvas,
  renderBuildTreeCustomMetrics,
} from '../../../core/renderers/adapters/build-tree-canvas-adapter';

// 向后兼容符号导出
export type { BTStep };
export {
  BUILD_TREE_CODE_LINES,
  BUILD_TREE_STAGE2_LINES,
  BUILD_TREE_STAGE3_LINES,
  collectTreeValues,
  buildTreeSteps,
  buildTreeStage2PostorderSteps,
  buildTreeStage3StackSteps,
  renderBuildTreeCanvas,
  renderBuildTreeCustomMetrics,
};

export const buildTreeVisualizer = registerDeclarativeAlgorithm({
  id: 'build-tree',
  name: '从前序/后序与中序遍历构造二叉树',
  category: 'tree',
  aliases: [
    'tree-036-build-tree-preorder-inorder',
    'build-tree-from-preorder-inorder',
    'build-tree-2',
    'leetcode-106',
    'construct-binary-tree-from-inorder-and-postorder',
  ],
  inputs: [
    { id: 'input-preorder', label: '前序遍历 preorder', type: 'text', defaultValue: '3, 9, 20, 15, 7', placeholder: '3, 9, 20, 15, 7' },
    { id: 'input-inorder', label: '中序遍历 inorder', type: 'text', defaultValue: '9, 3, 15, 20, 7', placeholder: '9, 3, 15, 20, 7' },
    { id: 'input-postorder', label: '后序遍历 postorder (Stage 2 专用)', type: 'text', defaultValue: '9, 15, 7, 20, 3', placeholder: '9, 15, 7, 20, 3' },
  ],
  presets: [
    { label: 'LeetCode 经典不平衡树', values: { 'input-preorder': '3, 9, 20, 15, 7', 'input-inorder': '9, 3, 15, 20, 7', 'input-postorder': '9, 15, 7, 20, 3' }, description: '根3，左9，右20(15,7)' },
    { label: '满二叉树 (7节点)', values: { 'input-preorder': '4, 2, 1, 3, 6, 5, 7', 'input-inorder': '1, 2, 3, 4, 5, 6, 7', 'input-postorder': '1, 3, 2, 5, 7, 6, 4' }, description: '根4，左2(1,3)，右6(5,7)' },
    { label: '简单三节点树', values: { 'input-preorder': '1, 2, 3', 'input-inorder': '2, 1, 3', 'input-postorder': '2, 3, 1' }, description: '根 1，左 2，右 3' },
    { label: '单链左斜树 (退化)', values: { 'input-preorder': '1, 2, 3', 'input-inorder': '3, 2, 1', 'input-postorder': '3, 2, 1' }, description: '只有左孩子单侧链' },
    { label: '单节点树', values: { 'input-preorder': '1', 'input-inorder': '1', 'input-postorder': '1' }, description: '仅包含根节点 1' },
  ],
  metrics: [
    { id: 'cur-root', label: '当前锁定根节点', color: '#f59e0b' },
    { id: 'pre-range', label: '前序/后序区间 [pL..pR]', color: '#2563eb' },
    { id: 'in-range', label: '中序区间 [iL..iR]', color: '#0d9488' },
  ],
  codeLanguages: BUILD_TREE_STAGE1_PRE_IN_CODE,
  problemHtml: BUILD_TREE_PROBLEM_HTML,
  analysisHtml: BUILD_TREE_ANALYSIS_HTML,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 前序+中序分治切分递归构造 (LC 105)',
      shortName: '前序+中序分治',
      num: 1,
      codeLanguages: BUILD_TREE_STAGE1_PRE_IN_CODE,
      buildSteps: (inputs) => {
        const pre = parseNumberList(inputs?.['input-preorder'] || inputs?.['preorder'] || '3, 9, 20, 15, 7', [3, 9, 20, 15, 7]);
        const inArr = parseNumberList(inputs?.['input-inorder'] || inputs?.['inorder'] || '9, 3, 15, 20, 7', [9, 3, 15, 20, 7]);
        return buildTreeSteps(pre, inArr);
      },
      renderCanvas: BuildTreeCanvasAdapter.renderCanvas,
      renderCustomMetrics: BuildTreeCanvasAdapter.renderCustomMetrics,
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 后序+中序分治切分递归构造 (LC 106)',
      shortName: '后序+中序分治',
      num: 2,
      codeLanguages: BUILD_TREE_STAGE2_POST_IN_CODE,
      buildSteps: (inputs) => {
        const inArr = parseNumberList(inputs?.['input-inorder'] || inputs?.['inorder'] || '9, 3, 15, 20, 7', [9, 3, 15, 20, 7]);
        const post = parseNumberList(inputs?.['input-postorder'] || inputs?.['postorder'] || '9, 15, 7, 20, 3', [9, 15, 7, 20, 3]);
        return buildTreeStage2PostorderSteps(inArr, post);
      },
      renderCanvas: BuildTreeCanvasAdapter.renderCanvas,
      renderCustomMetrics: BuildTreeCanvasAdapter.renderCustomMetrics,
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 迭代显式栈模拟前序重构 ($O(N)$ 零哈希表 · LC 105 迭代法)',
      shortName: '迭代显式栈',
      num: 3,
      codeLanguages: BUILD_TREE_STAGE3_STACK_CODE,
      buildSteps: (inputs) => {
        const pre = parseNumberList(inputs?.['input-preorder'] || inputs?.['preorder'] || '3, 9, 20, 15, 7', [3, 9, 20, 15, 7]);
        const inArr = parseNumberList(inputs?.['input-inorder'] || inputs?.['inorder'] || '9, 3, 15, 20, 7', [9, 3, 15, 20, 7]);
        return buildTreeStage3StackSteps(pre, inArr);
      },
      renderCanvas: BuildTreeCanvasAdapter.renderCanvas,
      renderCustomMetrics: BuildTreeCanvasAdapter.renderCustomMetrics,
    },
  ],
  generateSteps: (inputs) => {
    const pre = parseNumberList(inputs?.['input-preorder'] || inputs?.['preorder'] || '3, 9, 20, 15, 7', [3, 9, 20, 15, 7]);
    const inArr = parseNumberList(inputs?.['input-inorder'] || inputs?.['inorder'] || '9, 3, 15, 20, 7', [9, 3, 15, 20, 7]);
    return buildTreeSteps(pre, inArr);
  },
  buildSteps: (inputs) => {
    const pre = parseNumberList(inputs?.['input-preorder'] || inputs?.['preorder'] || '3, 9, 20, 15, 7', [3, 9, 20, 15, 7]);
    const inArr = parseNumberList(inputs?.['input-inorder'] || inputs?.['inorder'] || '9, 3, 15, 20, 7', [9, 3, 15, 20, 7]);
    return buildTreeSteps(pre, inArr);
  },
  renderCanvas: BuildTreeCanvasAdapter.renderCanvas,
  renderCustomMetrics: BuildTreeCanvasAdapter.renderCustomMetrics,
});
