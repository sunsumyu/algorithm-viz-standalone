/**
 * 路径总和可视化器 (Path Sum & Path Sum II · LeetCode 112 & 113 / Class 037 Code03)
 * Matt Pocock 深模块轻量领域适配器 (<150 LOC)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  type PSStep,
  PATH_SUM_CODE_LINES,
  collectTreeValues,
  parsePathSumInputs,
  buildPSSteps,
  buildPathSumStage2BacktrackSteps,
  buildPathSumStage3BfsSteps,
  compilePathSumStage1,
  compilePathSumStage2,
  compilePathSumStage3,
} from '../../../core/renderers/adapters/path-sum-step-compiler';
import {
  renderPathSumCanvas,
  renderStage1CustomMetrics,
  renderStage2CustomMetrics,
  renderStage3CustomMetrics,
} from '../../../core/renderers/adapters/path-sum-canvas-adapter';
import {
  PATH_SUM_PROBLEM_HTML,
  PATH_SUM_ANALYSIS_HTML,
  PATH_SUM_CODE_LANGUAGES,
} from './path-sum-problem-content';
import {
  PATH_SUM_STAGE1_CODE,
  PATH_SUM_STAGE2_BACKTRACK_CODE,
  PATH_SUM_STAGE3_BFS_CODE,
} from './path-sum-stage-codes';

export type { PSStep };
export {
  PATH_SUM_CODE_LINES,
  collectTreeValues,
  buildPSSteps,
  buildPathSumStage2BacktrackSteps,
  buildPathSumStage3BfsSteps,
};

export const pathSumVisualizer = registerDeclarativeAlgorithm<PSStep>({
  id: 'path-sum',
  aliases: ['tree-037-path-sum-ii'],
  name: '路径总和与收集所有路径',
  category: 'tree',
  icon: '🪜',
  badge: {
    mode: '多阶段演化: 递归减法 · 回溯全解 · 队列BFS',
    complexity: 'O(N) · O(H)',
  },
  card1Title: '📊 二叉树拓扑与当前回溯路径沙盘',
  card2Title: '🧭 路径累加和与解集收集监视器',
  card2Desc: '实时当前路径栈、剩余差额及已收集解集二维看板',
  legend: [
    { label: '当前访问节点', color: '#fbbf24' },
    { label: '当前路径栈', color: '#93c5fd' },
    { label: '命中目标解', color: '#16a34a' },
  ],
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1',
      width: '180px',
      placeholder: '5, 4, 8, 11...',
    },
    { id: 'input-target-sum', label: '目标和 targetSum', type: 'number', defaultValue: 22, width: '50px' },
  ],
  presets: [
    {
      label: 'LeetCode 示例 1: 经典双解 (sum=22)',
      values: { 'input-tree': '5, 4, 8, 11, null, 13, 4, 7, 2, null, null, 5, 1', 'input-target-sum': 22 },
      description: '两条有效路径 [5,4,11,2] 和 [5,8,4,5]',
    },
    {
      label: '单解路径示例 (sum=10)',
      values: { 'input-tree': '1, 2, 3, 4, 5, 6, 7', 'input-target-sum': 10 },
      description: '满二叉树路径 [1, 3, 6]',
    },
    {
      label: '无匹配过大目标 (sum=100)',
      values: { 'input-tree': '1, 2, 3', 'input-target-sum': 100 },
      description: '搜索完全探索但无解',
    },
  ],
  metrics: [
    { id: 'cur-sum', label: '当前路径累加和', color: '#2563eb' },
    { id: 'remain-diff', label: '剩余所需差值', color: '#f59e0b' },
    { id: 'found-status', label: '有效判定 / 路径数', color: '#16a34a' },
  ],
  codeLanguages: PATH_SUM_CODE_LANGUAGES,
  problemHtml: PATH_SUM_PROBLEM_HTML,
  analysisHtml: PATH_SUM_ANALYSIS_HTML,
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 递归减法回溯 (Recursive Subtraction DFS)',
      shortName: '递归减法',
      num: 1,
      badge: { mode: '递归减法 · O(H)', complexity: 'O(N) · O(H)' },
      card1Title: '📊 递归深入与差额减法拓扑沙盘',
      card2Title: '🧭 路径剩余差额与叶子判定监视器',
      card2Desc: '自顶向下扣减 remain 并在叶子节点检测相等',
      codeLanguages: PATH_SUM_STAGE1_CODE,
      buildSteps: compilePathSumStage1,
      renderCanvas: renderPathSumCanvas,
      renderCustomMetrics: renderStage1CustomMetrics,
    },
    {
      id: 'stage-2',
      name: '阶段 2: 回溯现场恢复与全解收集 (Backtracking Path Restoration)',
      shortName: '回溯全解',
      num: 2,
      badge: { mode: '回溯恢复 · LC 113', complexity: 'O(N) · O(H)' },
      card1Title: '🌲 DFS 回溯路径与现场恢复拓扑沙盘',
      card2Title: '🧭 共享路径栈与全解收集监视器',
      card2Desc: '入栈深入、命中收录、左右递归后显式弹出恢复现场',
      codeLanguages: PATH_SUM_STAGE2_BACKTRACK_CODE,
      buildSteps: compilePathSumStage2,
      renderCanvas: renderPathSumCanvas,
      renderCustomMetrics: renderStage2CustomMetrics,
    },
    {
      id: 'stage-3',
      name: '阶段 3: 迭代 BFS 双队列 (Iterative BFS Queues)',
      shortName: '队列BFS',
      num: 3,
      badge: { mode: '双队列 · 迭代BFS', complexity: 'O(N) · O(W)' },
      card1Title: '🌊 广度优先层序求和拓扑沙盘',
      card2Title: '🧭 双队列管道与层序累计和监视器',
      card2Desc: 'nodeQueue 与 sumQueue 同步出队入队',
      codeLanguages: PATH_SUM_STAGE3_BFS_CODE,
      buildSteps: compilePathSumStage3,
      renderCanvas: renderPathSumCanvas,
      renderCustomMetrics: renderStage3CustomMetrics,
    },
  ],
  generateSteps: compilePathSumStage1,
  buildSteps: compilePathSumStage1,
  renderCanvas: renderPathSumCanvas,
});
