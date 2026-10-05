/**
 * 二叉树中的最大路径和 (Binary Tree Maximum Path Sum · LeetCode 124 / Zuoshen Class 077)
 *
 * 领域适配器 (Thin Domain Adapter, LOC < 150 行)
 * 核心推演委托: MaxPathSumStepCompiler
 * 表现层呈现委托: MaxPathSumCanvasAdapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeNode, buildTreeFromArr } from './tree-template';
import {
  MAX_PATH_SUM_PROBLEM_HTML,
  MAX_PATH_SUM_ANALYSIS_HTML,
} from './binary-tree-maximum-path-sum-problem-content';
import {
  MAX_PATH_SUM_STAGE1_CODES,
  MAX_PATH_SUM_STAGE2_CODES,
  MAX_PATH_SUM_STAGE3_CODES,
} from './binary-tree-maximum-path-sum-stage-codes';
import {
  buildMaxPathSumStage1Steps,
  buildMaxPathSumStage2InfoSteps,
  buildMaxPathSumStage3StackSteps,
  parseTreeInput,
} from '../../../core/renderers/adapters/max-path-sum-step-compiler';
import {
  renderMaxPathSumCanvas,
  renderMaxPathSumCustomMetrics,
} from '../../../core/renderers/adapters/max-path-sum-canvas-adapter';
import type { PathSumStep } from '../../../core/renderers/adapters/max-path-sum-step-compiler';

// 保持既有单测与外部调用契约 100% 兼容
export * from '../../../core/renderers/adapters/max-path-sum-step-compiler';
export * from '../../../core/renderers/adapters/max-path-sum-canvas-adapter';

const toRoot = (inputs?: Record<string, unknown>): TreeNode | null =>
  buildTreeFromArr(parseTreeInput(inputs?.['input-tree'] as string | undefined));

const renderCanvas = (c: HTMLElement, s: unknown) => renderMaxPathSumCanvas(c, s as PathSumStep);
const renderMetrics = (c: HTMLElement, s: unknown) => renderMaxPathSumCustomMetrics(c, s as PathSumStep);

// 顶层声明式算法注册
export const binaryTreeMaximumPathSumVisualizer = registerDeclarativeAlgorithm<PathSumStep>({
  id: 'binary-tree-maximum-path-sum',
  name: '二叉树中的最大路径和',
  category: 'tree',
  icon: '🏔️',
  difficulty: 3,
  levelOrder: 124,
  aliases: ['leetcode-124', 'max-path-sum-tree'],
  learningGoal: '透彻掌握树形 DP 经典模型：单边向上贡献收益与跨根拱形全路径和分离计算的精妙架构',
  timeComplexity: 'O(N)',
  spaceComplexity: 'O(H)',
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序数组 (逗号分隔)',
      type: 'text',
      defaultValue: '-10, 9, 20, null, null, 15, 7',
      placeholder: '例如: -10, 9, 20, null, null, 15, 7',
    },
  ],
  presets: [
    {
      label: 'LeetCode 示例 2: 经典拱形最值 42',
      values: { 'input-tree': '-10, 9, 20, null, null, 15, 7' },
      description: '根 -10，左 9，右 20(15, 7)，最优路径 15 -> 20 -> 7',
    },
    {
      label: 'LeetCode 示例 1: 简单三节点树 6',
      values: { 'input-tree': '1, 2, 3' },
      description: '根 1，左 2，右 3，最优路径 2 -> 1 -> 3',
    },
    {
      label: '全部负数节点树 -1',
      values: { 'input-tree': '-3, -2, -1' },
      description: '根 -3，左 -2，右 -1，最大值是单节点 -1',
    },
    {
      label: '单节点树 10',
      values: { 'input-tree': '10' },
      description: '仅包含根节点 10',
    },
  ],
  metrics: [
    { id: 'global-max', label: '全局最大路径和', color: '#10b981' },
    { id: 'arch-sum', label: '当前拱形和', color: '#0ea5e9' },
    { id: 'gains', label: '左/右单侧增益', color: '#f59e0b' },
  ],
  codeLanguages: MAX_PATH_SUM_STAGE1_CODES,
  problemHtml: MAX_PATH_SUM_PROBLEM_HTML,
  analysisHtml: MAX_PATH_SUM_ANALYSIS_HTML,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 递归后序遍历与单边最大贡献分离 (LC 124)',
      shortName: '后序递归与单边增益',
      num: 1,
      codeLanguages: MAX_PATH_SUM_STAGE1_CODES,
      buildSteps: (i) => buildMaxPathSumStage1Steps(toRoot(i)),
      renderCanvas, renderCustomMetrics: renderMetrics,
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 树形 DP 二元信息汇聚模型 (Zuoshen Class 077)',
      shortName: '树形DP信息汇聚',
      num: 2,
      codeLanguages: MAX_PATH_SUM_STAGE2_CODES,
      buildSteps: (i) => buildMaxPathSumStage2InfoSteps(toRoot(i)),
      renderCanvas, renderCustomMetrics: renderMetrics,
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 显式后序遍历与状态表映射 (零递归栈)',
      shortName: '显式栈后序遍历',
      num: 3,
      codeLanguages: MAX_PATH_SUM_STAGE3_CODES,
      buildSteps: (i) => buildMaxPathSumStage3StackSteps(toRoot(i)),
      renderCanvas, renderCustomMetrics: renderMetrics,
    },
  ],
  generateSteps: (i) => buildMaxPathSumStage1Steps(toRoot(i)),
  buildSteps: (i) => buildMaxPathSumStage1Steps(toRoot(i)),
  renderCanvas,
  renderCustomMetrics: renderMetrics,
});
