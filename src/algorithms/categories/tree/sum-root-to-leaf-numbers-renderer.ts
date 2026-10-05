/**
 * 求根节点到叶节点数字之和 (Sum Root to Leaf Numbers · LeetCode 129 / Zuoshen Class 036)
 *
 * 领域适配器 (Thin Domain Adapter, LOC < 150 行)
 * 核心推演委托: SumRootToLeafStepCompiler
 * 表现层呈现委托: SumRootToLeafCanvasAdapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeNode, buildTreeFromArr } from './tree-template';
import {
  SUM_NUMBERS_PROBLEM_HTML,
  SUM_NUMBERS_ANALYSIS_HTML,
} from './sum-root-to-leaf-numbers-problem-content';
import {
  SUM_NUMBERS_STAGE1_CODES,
  SUM_NUMBERS_STAGE2_CODES,
  SUM_NUMBERS_STAGE3_CODES,
} from './sum-root-to-leaf-numbers-stage-codes';
import {
  buildSumNumbersStage1Steps,
  buildSumNumbersStage2BfsSteps,
  buildSumNumbersStage3StackSteps,
  generateSumNumbersSteps,
  parseTreeInput,
} from '../../../core/renderers/adapters/sum-root-to-leaf-step-compiler';
import {
  renderSumNumbersCanvas,
  renderSumNumbersCustomMetrics,
} from '../../../core/renderers/adapters/sum-root-to-leaf-canvas-adapter';
import type { SumNumbersStep } from '../../../core/renderers/adapters/sum-root-to-leaf-step-compiler';

// 保持既有单测与外部调用契约 100% 兼容
export * from '../../../core/renderers/adapters/sum-root-to-leaf-step-compiler';
export * from '../../../core/renderers/adapters/sum-root-to-leaf-canvas-adapter';

const toRoot = (inputs?: Record<string, unknown>): TreeNode | null =>
  buildTreeFromArr(parseTreeInput(inputs?.['input-tree'] as string | undefined));

const renderCanvas = (c: HTMLElement, s: unknown) => renderSumNumbersCanvas(c, s as SumNumbersStep);
const renderMetrics = (c: HTMLElement, s: unknown) => renderSumNumbersCustomMetrics(c, s as SumNumbersStep);

// 顶层声明式算法注册
export const sumRootToLeafNumbersVisualizer = registerDeclarativeAlgorithm<SumNumbersStep>({
  id: 'sum-root-to-leaf-numbers',
  name: '求根节点到叶节点数字之和',
  category: 'tree',
  icon: '🌿',
  difficulty: 2,
  levelOrder: 129,
  aliases: ['leetcode-129', 'sum-numbers', 'sum-root-to-leaf'],
  learningGoal: '掌握二叉树自顶向下递归路径数值累加，理解叶子判定、BFS 双队列同步与显式双栈迭代机制',
  timeComplexity: 'O(N)',
  spaceComplexity: 'O(H)',
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序数组 (逗号分隔)',
      type: 'text',
      defaultValue: '4, 9, 0, 5, 1',
      placeholder: '例如: 4, 9, 0, 5, 1',
    },
  ],
  presets: [
    {
      label: 'LeetCode 示例 2: 经典 1026',
      values: { 'input-tree': '4, 9, 0, 5, 1' },
      description: '路径为 495 + 491 + 40 = 1026',
    },
    {
      label: 'LeetCode 示例 1: 基础 25',
      values: { 'input-tree': '1, 2, 3' },
      description: '路径为 12 + 13 = 25',
    },
    {
      label: '单分支链式树 123',
      values: { 'input-tree': '1, 2, null, 3' },
      description: '路径为 123',
    },
    {
      label: '单节点树 7',
      values: { 'input-tree': '7' },
      description: '仅包含根节点 7',
    },
  ],
  metrics: [
    { id: 'total-sum', label: '路径累计总和', color: '#10b981' },
    { id: 'cur-sum', label: '当前分支数值', color: '#f59e0b' },
    { id: 'completed-paths', label: '已结算叶子数', color: '#38bdf8' },
  ],
  codeLanguages: SUM_NUMBERS_STAGE1_CODES,
  problemHtml: SUM_NUMBERS_PROBLEM_HTML,
  analysisHtml: SUM_NUMBERS_ANALYSIS_HTML,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 前序遍历与自顶向下累加递归 (LC 129)',
      shortName: 'DFS前序递归',
      num: 1,
      codeLanguages: SUM_NUMBERS_STAGE1_CODES,
      buildSteps: (i) => buildSumNumbersStage1Steps(toRoot(i)),
      renderCanvas, renderCustomMetrics: renderMetrics,
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 广度优先搜索双队列同步 (BFS 层序遍历)',
      shortName: 'BFS双队列层序',
      num: 2,
      codeLanguages: SUM_NUMBERS_STAGE2_CODES,
      buildSteps: (i) => buildSumNumbersStage2BfsSteps(toRoot(i)),
      renderCanvas, renderCustomMetrics: renderMetrics,
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 显式迭代双栈与回溯模拟 (Iterative DFS)',
      shortName: '显式双栈迭代',
      num: 3,
      codeLanguages: SUM_NUMBERS_STAGE3_CODES,
      buildSteps: (i) => buildSumNumbersStage3StackSteps(toRoot(i)),
      renderCanvas, renderCustomMetrics: renderMetrics,
    },
  ],
  generateSteps: (i) => buildSumNumbersStage1Steps(toRoot(i)),
  buildSteps: (i) => buildSumNumbersStage1Steps(toRoot(i)),
  renderCanvas,
  renderCustomMetrics: renderMetrics,
});
