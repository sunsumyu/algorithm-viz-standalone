/**
 * 验证二叉搜索树 (Validate BST · LeetCode 98 / Class 037 Code05)
 * 采用顶层声明式架构与多阶段演化体系 (Multi-Stage Evolution)
 * Stage 1: 中序递归单调性校验 | Stage 2: 上下界区间约束先序定界 | Stage 3: 迭代显式栈模拟中序遍历
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import {
  VALID_BST_PROBLEM_HTML,
  VALID_BST_ANALYSIS_HTML,
  VALID_BST_CODE_LANGUAGES,
} from './valid-bst-problem-content';
import {
  VALID_BST_STAGE1_CODE,
  VALID_BST_STAGE2_RANGE_CODE,
  VALID_BST_STAGE3_STACK_CODE,
} from './valid-bst-stage-codes';
import {
  VBStep,
  VALID_BST_CODE_LINES,
  collectTreeValues,
  buildVBSteps,
  buildValidBstStage2RangeSteps,
  buildValidBstStage3StackSteps,
} from '../../../core/renderers/adapters/valid-bst-step-compiler';
import {
  ValidBstCanvasAdapter,
  renderValidBstCanvas,
  renderStage1CustomMetrics,
  renderStage2CustomMetrics,
  renderStage3CustomMetrics,
} from '../../../core/renderers/adapters/valid-bst-canvas-adapter';

// 重新导出契约与推演函数，保持全库既有单测 100% 原始绿灯兼容
export type { VBStep };
export {
  VALID_BST_CODE_LINES,
  collectTreeValues,
  buildVBSteps,
  buildValidBstStage2RangeSteps,
  buildValidBstStage3StackSteps,
  renderValidBstCanvas,
  renderStage1CustomMetrics,
  renderStage2CustomMetrics,
  renderStage3CustomMetrics,
};

function parseAndBuild(inputs?: Record<string, any>): TreeNode | null {
  const raw = inputs?.['input-tree'] || inputs?.['tree'] || '5, 1, 4, null, null, 3, 6';
  return buildTree(parseTreeArray(raw, [5, 1, 4, null, null, 3, 6]));
}

// ============================================================
// 声明式算法注册中心配置 (Declarative Algorithm Visualizer)
// ============================================================
export const validBstVisualizer = registerDeclarativeAlgorithm<VBStep>({
  id: 'valid-bst',
  aliases: ['class023-code01', 'class037-code05', 'valid-bst', 'tree-037-validate-bst', 'leetcode-98'],
  name: '验证二叉搜索树',
  category: 'tree',
  icon: '🛡️',
  badge: { mode: '多阶段演化: 中序递归 · 上下界定界 · 显式栈', complexity: 'O(N) · O(H)' },
  card1Title: '📊 二叉搜索树拓扑与染色沙盘',
  card2Title: '🧭 中序序列输出与单调性监视器',
  card2Desc: '当前考察节点、前驱 prev 状态与实时递增输出序列流',
  legend: [
    { label: '当前访问节点', color: '#fbbf24' },
    { label: '已验证中序节点', color: '#34d399' },
    { label: '违规异常节点', color: '#ef4444' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '5, 1, 4, null, null, 3, 6',
      width: '180px',
      placeholder: '5, 1, 4, null, null, 3, 6',
    },
  ],
  presets: [
    { label: 'LeetCode 示例 2: 非法 BST (5, 1, 4, null, null, 3, 6)', values: { 'input-tree': '5, 1, 4, null, null, 3, 6' }, description: '右孩子 4 小于根节点 5，非法' },
    { label: 'LeetCode 示例 1: 合法 BST (2, 1, 3)', values: { 'input-tree': '2, 1, 3' }, description: '标准经典合法 BST' },
    { label: '多层完整合法 BST (10, 5, 15, 3, 7, 12, 18)', values: { 'input-tree': '10, 5, 15, 3, 7, 12, 18' }, description: '三层饱满 BST，中序严格递增' },
    { label: '隐蔽跨层违规 (10, 5, 15, null, null, 6, 20)', values: { 'input-tree': '10, 5, 15, null, null, 6, 20' }, description: '节点 6 小于根 10，违规' },
  ],
  metrics: [
    { id: 'cur-node', label: '当前节点', color: '#f59e0b' },
    { id: 'prev-node', label: '前驱节点 prev', color: '#2563eb' },
    { id: 'bst-result', label: '合法性判定', color: '#16a34a' },
  ],
  codeLanguages: VALID_BST_CODE_LANGUAGES,
  problemHtml: VALID_BST_PROBLEM_HTML,
  analysisHtml: VALID_BST_ANALYSIS_HTML,

  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 中序递归单调性校验 (Recursive Inorder Monotonicity)',
      shortName: '中序递归',
      num: 1,
      badge: { mode: '中序递归 · 前驱指针', complexity: 'O(N) · O(H)' },
      card1Title: '📊 中序遍历与单调性拓扑沙盘',
      card2Title: '🧭 中序序列输出与前驱监视器',
      card2Desc: '维护全局前驱指针 prev 保证严格单调递增',
      codeLanguages: VALID_BST_STAGE1_CODE,
      buildSteps: (inputs) => buildVBSteps(parseAndBuild(inputs)),
      renderCanvas: (c, s) => ValidBstCanvasAdapter.renderCanvas(c, s, 'stage-1'),
      renderCustomMetrics: (c, s) => ValidBstCanvasAdapter.renderStage1Metrics(c, s),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 上下界区间约束先序定界 (Boundary Range Pruning)',
      shortName: '区间定界',
      num: 2,
      badge: { mode: '先序剪枝 · 开区间 (min, max)', complexity: 'O(N) · O(H)' },
      card1Title: '📐 先序定界与开区间拓扑沙盘',
      card2Title: '🧭 节点范围约束与合法性监视器',
      card2Desc: '自顶向下传递开区间并立即剪枝越界节点',
      codeLanguages: VALID_BST_STAGE2_RANGE_CODE,
      buildSteps: (inputs) => buildValidBstStage2RangeSteps(parseAndBuild(inputs)),
      renderCanvas: (c, s) => ValidBstCanvasAdapter.renderCanvas(c, s, 'stage-2'),
      renderCustomMetrics: (c, s) => ValidBstCanvasAdapter.renderStage2Metrics(c, s),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 迭代显式栈模拟中序遍历 (Iterative Explicit Stack Inorder)',
      shortName: '显式栈',
      num: 3,
      badge: { mode: '显式栈模拟 · 防栈溢出', complexity: 'O(N) · O(H)' },
      card1Title: '🧱 显式调用栈中序遍历沙盘',
      card2Title: '🧭 Stack<TreeNode> 栈槽与出栈监视器',
      card2Desc: '左侧链压栈、出栈前驱校验、转向右孩子',
      codeLanguages: VALID_BST_STAGE3_STACK_CODE,
      buildSteps: (inputs) => buildValidBstStage3StackSteps(parseAndBuild(inputs)),
      renderCanvas: (c, s) => ValidBstCanvasAdapter.renderCanvas(c, s, 'stage-3'),
      renderCustomMetrics: (c, s) => ValidBstCanvasAdapter.renderStage3Metrics(c, s),
    },
  ],

  generateSteps: (inputs) => buildVBSteps(parseAndBuild(inputs)),
  buildSteps: (inputs) => buildVBSteps(parseAndBuild(inputs)),
  renderCanvas: (c, s) => ValidBstCanvasAdapter.renderCanvas(c, s, 'stage-1'),
  renderCustomMetrics: (c, s) => ValidBstCanvasAdapter.renderStage1Metrics(c, s),
});