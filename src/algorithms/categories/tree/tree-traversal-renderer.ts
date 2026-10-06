/**
 * 二叉树前中后序遍历可视化器 (Binary Tree Traversal · LeetCode 144/94/145)
 * 多阶段演化架构 (Thin Domain Adapter)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  TREE_TRAVERSAL_PROBLEM_HTML,
  TREE_TRAVERSAL_ANALYSIS_HTML,
} from './tree-traversal-problem-content';
import {
  TRAVERSAL_STAGE1_CODES,
  TRAVERSAL_STAGE2_CODES,
} from './tree-traversal-stage-codes';
import {
  Mode,
  TTStep,
  buildRecursiveSteps,
  buildTTSteps,
  buildIterativeSteps,
  parseAndBuild,
  resolveMode,
} from '../../../core/renderers/adapters/tree-traversal-step-compiler';
import {
  renderTraversalCanvas,
  renderRecursiveMetrics,
  renderIterativeMetrics,
} from '../../../core/renderers/adapters/tree-traversal-canvas-adapter';

export type { Mode, TTStep };
export {
  buildRecursiveSteps,
  buildTTSteps,
  buildIterativeSteps,
  parseAndBuild,
  resolveMode,
  renderTraversalCanvas,
  renderRecursiveMetrics,
  renderIterativeMetrics,
};

// ============================================================
// 声明式算法注册 — 多阶段演化
// ============================================================
export const treeTraversalVisualizer = registerDeclarativeAlgorithm<TTStep>({
  id: 'tree-traversal',
  aliases: ['class018-code01', 'binary-tree-traversal', 'preorder-inorder-postorder'],
  name: '二叉树遍历',
  category: 'tree',
  icon: '🌲',
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '彻底掌握二叉树前中后序遍历的递归与迭代两种实现，理解访问时机与栈操作的本质',
  badge: {
    mode: '前序 / 中序 / 后序',
    complexity: 'O(n) · O(h)',
  },
  card1Title: '📊 二叉树拓扑结构与遍历沙盘',
  card2Title: '🧭 遍历指标与输出序列监视器',
  card2Desc: '当前访问节点、递归/迭代栈状态与输出序列',
  legend: [
    { label: '当前访问节点', color: '#fbbf24' },
    { label: '已输出节点', color: '#34d399' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '1, 2, 3, 4, 5, 6, 7',
      width: '150px',
      placeholder: '1, 2, 3, 4, 5...',
    },
  ],
  modes: [
    { id: 'pre', label: '前序遍历 (根-左-右)' },
    { id: 'in', label: '中序遍历 (左-根-右)' },
    { id: 'post', label: '后序遍历 (左-右-根)' },
  ],
  presets: [
    { label: '完美满二叉树', values: { 'input-tree': '1, 2, 3, 4, 5, 6, 7' } },
    { label: '单侧偏斜树', values: { 'input-tree': '1, 2, null, 3, null, null, null' } },
    { label: '不规则二叉树', values: { 'input-tree': '1, 2, 3, null, 4, 5, null' } },
    { label: '单节点', values: { 'input-tree': '1' } },
  ],
  metrics: [
    { id: 'cur-node', label: '当前访问节点', color: '#f59e0b' },
    { id: 'depth', label: '调用栈深度 depth', color: '#2563eb' },
    { id: 'visited-count', label: '已访问节点数', color: '#0f172a' },
  ],
  problemHtml: TREE_TRAVERSAL_PROBLEM_HTML,
  analysisHtml: TREE_TRAVERSAL_ANALYSIS_HTML,
  defaultStage: 'stage-1',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 递归遍历',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(n)',
      theme: 'bg-blue' as const,
      badge: {
        mode: '前中后序 · 递归系统栈',
        complexity: 'O(n) · O(h) 栈深',
      },
      card1Title: '🌲 二叉树拓扑与递归遍历沙盘',
      card2Title: '📚 递归调用栈与遍历序列监视器',
      codeLanguages: TRAVERSAL_STAGE1_CODES.pre,
      modeCodeLanguages: TRAVERSAL_STAGE1_CODES,
      buildSteps: (inputs: Record<string, any>, mode?: string) => {
        const root = parseAndBuild(inputs);
        return buildRecursiveSteps(root, resolveMode(mode));
      },
      renderCanvas: (container: HTMLElement, step: TTStep) => renderTraversalCanvas(container, step),
      renderCustomMetrics: (container: HTMLElement, step: TTStep) => renderRecursiveMetrics(container, step),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 迭代栈遍历',
      shortName: '迭代栈',
      num: 2,
      timeBadge: 'O(n)',
      theme: 'bg-emerald' as const,
      badge: {
        mode: '前中后序 · 显式栈迭代',
        complexity: 'O(n) · O(h) 栈深',
      },
      card1Title: '📊 二叉树拓扑与迭代栈遍历沙盘',
      card2Title: '🥞 显式栈状态与遍历序列监视器',
      codeLanguages: TRAVERSAL_STAGE2_CODES.pre,
      modeCodeLanguages: TRAVERSAL_STAGE2_CODES,
      buildSteps: (inputs: Record<string, any>, mode?: string) => {
        const root = parseAndBuild(inputs);
        return buildIterativeSteps(root, resolveMode(mode));
      },
      renderCanvas: (container: HTMLElement, step: TTStep) => renderTraversalCanvas(container, step),
      renderCustomMetrics: (container: HTMLElement, step: TTStep) => renderIterativeMetrics(container, step),
    },
  ],
  codeLanguages: TRAVERSAL_STAGE1_CODES.pre,
  buildSteps: (inputs, mode) => buildRecursiveSteps(parseAndBuild(inputs), resolveMode(mode)),
  renderCanvas: (container, step) => renderTraversalCanvas(container, step),
  renderCustomMetrics: (container, step) => renderRecursiveMetrics(container, step),
});