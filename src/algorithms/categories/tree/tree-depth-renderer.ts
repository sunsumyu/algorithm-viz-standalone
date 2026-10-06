/**
 * 二叉树最大深度轻量领域适配器 (Thin Domain Adapter · LeetCode 104 / Class 036 Code04)
 * 遵循 Matt Pocock 深模块规范 (LOC < 150 行)，推演编译与画布呈现委托至统一深模块：
 *   - TreeDepthStepCompiler (推演步进编译器)
 *   - TreeDepthCanvasAdapter (拓扑画布与看板呈现适配器)
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import {
  TREE_DEPTH_PROBLEM_HTML,
  TREE_DEPTH_ANALYSIS_HTML,
} from './tree-depth-problem-content';
import {
  TREE_DEPTH_STAGE1_CODE,
  TREE_DEPTH_STAGE2_BFS_CODE,
  TREE_DEPTH_STAGE3_STATIC_ARRAY_CODE,
} from './tree-depth-stage-codes';
import {
  TreeDepthStepCompiler,
  TDStep,
  TDStaticQueueState,
  TREE_DEPTH_CODE_LINES,
  collectTreeValues,
} from '../../../core/renderers/adapters/tree-depth-step-compiler';
import { TreeDepthCanvasAdapter } from '../../../core/renderers/adapters/tree-depth-canvas-adapter';

// 向后兼容导出
export type {
  TDStep,
  TDStaticQueueState,
};
export {
  TREE_DEPTH_CODE_LINES,
  collectTreeValues,
};
export const buildTDSteps = TreeDepthStepCompiler.compileMaxDepthStage1Steps;
export const buildTDBfsSteps = TreeDepthStepCompiler.compileMaxDepthStage2BfsSteps;
export const buildTreeDepthStage2BfsSteps = TreeDepthStepCompiler.compileMaxDepthStage2BfsSteps;
export const buildTDStaticArraySteps = TreeDepthStepCompiler.compileMaxDepthStage3StaticArraySteps;
export const buildTreeDepthStage3StaticArraySteps = TreeDepthStepCompiler.compileMaxDepthStage3StaticArraySteps;

function parseAndBuild(inputs?: Record<string, any>): TreeNode | null {
  const raw = inputs?.['input-tree'] || inputs?.['tree'] || '3, 9, 20, null, null, 15, 7';
  const arr = parseTreeArray(raw, [3, 9, 20, null, null, 15, 7]);
  return buildTree(arr);
}

export const treeDepthVisualizer = registerDeclarativeAlgorithm<TDStep>({
  id: 'tree-depth',
  aliases: ['tree-036-depth-of-binary-tree', 'maximum-depth-of-binary-tree', 'leetcode-104'],
  name: '二叉树的最大深度',
  category: 'tree',
  icon: '📉',
  difficulty: 1,
  levelOrder: 104,
  learningGoal: '深刻理解后序自底向上分治归约与层次遍历逐层计数的两种求深度范式，掌握静态数组在层序中的极致优化',
  problemHtml: TREE_DEPTH_PROBLEM_HTML,
  analysisHtml: TREE_DEPTH_ANALYSIS_HTML,
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '3, 9, 20, null, null, 15, 7',
      width: '180px',
      placeholder: '3, 9, 20, null...',
    },
  ],
  presets: [
    { label: 'LeetCode 示例 1: 3 层非平衡树', values: { 'input-tree': '3, 9, 20, null, null, 15, 7' }, description: '右子树深于左子树，最大深度 = 3' },
    { label: '单链倾斜树 (4 层)', values: { 'input-tree': '1, 2, null, 3, null, 4' }, description: '退化为单链表，最大深度 = 4' },
    { label: '满二叉树 (3 层)', values: { 'input-tree': '1, 2, 3, 4, 5, 6, 7' }, description: '完全对称饱满，最大深度 = 3' },
    { label: '单节点二叉树', values: { 'input-tree': '1' }, description: '仅有根节点，最大深度 = 1' },
  ],
  metrics: [
    { id: 'cur-node', label: '当前考察节点', color: '#f59e0b' },
    { id: 'l-depth', label: '左子树深度 left', color: '#2563eb' },
    { id: 'r-depth', label: '右子树深度 right', color: '#0d9488' },
    { id: 'max-depth-res', label: '当前计算深度', color: '#16a34a' },
  ],
  defaultStage: 'stage-1',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 递归后序自底向上归约',
      shortName: '递归后序',
      num: 1,
      timeBadge: 'O(n) · O(h)',
      theme: 'bg-emerald' as const,
      badge: { mode: '后序分治 · 自底向上高度归约', complexity: 'O(n) · O(h) 递归栈深' },
      card1Title: '📊 二叉树拓扑与自底向上深度沙盘',
      card2Title: '🧭 左右深度比对与归约计算器',
      codeLanguages: TREE_DEPTH_STAGE1_CODE,
      buildSteps: (inputs: Record<string, any>) => buildTDSteps(parseAndBuild(inputs)),
      renderCanvas: (container: HTMLElement, step: TDStep) => TreeDepthCanvasAdapter.renderTreeDepthCanvas(container, step, '#fbbf24'),
      renderCustomMetrics: (container: HTMLElement, step: TDStep) => TreeDepthCanvasAdapter.renderMaxDepthStage1Metrics(container, step),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 层次遍历 BFS 队列计数',
      shortName: 'BFS队列',
      num: 2,
      timeBadge: 'O(n) · O(w)',
      theme: 'bg-blue' as const,
      badge: { mode: '广度优先 · 队列逐层扩展计数', complexity: 'O(n) · O(w) 队列宽度' },
      card1Title: '🌊 二叉树拓扑与广度层序扩展沙盘',
      card2Title: '🥞 FIFO 队列与深度计数监视器',
      codeLanguages: TREE_DEPTH_STAGE2_BFS_CODE,
      buildSteps: (inputs: Record<string, any>) => buildTDBfsSteps(parseAndBuild(inputs)),
      renderCanvas: (container: HTMLElement, step: TDStep) => TreeDepthCanvasAdapter.renderTreeDepthCanvas(container, step, '#38bdf8'),
      renderCustomMetrics: (container: HTMLElement, step: TDStep) => TreeDepthCanvasAdapter.renderMaxDepthStage2Metrics(container, step.queue || [], step.maxDepth),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 静态数组模拟队列 (Class 036)',
      shortName: '静态数组',
      num: 3,
      timeBadge: 'O(n) · 零GC',
      theme: 'bg-amber' as const,
      badge: { mode: '层次遍历 · 连续内存双指针模拟队列', complexity: 'O(n) · O(w) 常数极优' },
      card1Title: '⚡ 静态数组模拟队列拓扑沙盘',
      card2Title: '🏎️ 连续内存 queue[MAXN] 与 l/r 双指针监视器',
      codeLanguages: TREE_DEPTH_STAGE3_STATIC_ARRAY_CODE,
      buildSteps: (inputs: Record<string, any>) => buildTDStaticArraySteps(parseAndBuild(inputs)),
      renderCanvas: (container: HTMLElement, step: TDStep) => TreeDepthCanvasAdapter.renderTreeDepthCanvas(container, step, '#f97316'),
      renderCustomMetrics: (container: HTMLElement, step: TDStep) => TreeDepthCanvasAdapter.renderMaxDepthStage3Metrics(container, step.staticQueueState, step.maxDepth),
    },
  ],
  codeLanguages: TREE_DEPTH_STAGE1_CODE,
  buildSteps: (inputs) => buildTDSteps(parseAndBuild(inputs)),
  generateSteps: (inputs) => buildTDSteps(parseAndBuild(inputs)),
  renderCanvas: (container, step) => TreeDepthCanvasAdapter.renderTreeDepthCanvas(container, step, '#fbbf24'),
});