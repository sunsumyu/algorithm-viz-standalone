/**
 * 完全二叉树检验 (Completeness of Binary Tree · LeetCode 958 / Class 036 Code05)
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范 (LOC < 150 行)
 */

import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';
import {
  COMPLETENESS_STAGE1_CODE,
  COMPLETENESS_STAGE2_STATIC_ARRAY_CODE,
  COMPLETENESS_STAGE3_SENTINEL_CODE,
} from './completeness-binary-tree-036-stage-codes';
import {
  Completeness036StaticQueueState,
  Completeness036Step,
  parseAndBuildCompletenessTree,
  buildCompletenessQueueSteps,
  buildCompletenessStaticArraySteps,
  buildCompletenessSentinelSteps,
  buildCompleteness036Steps,
} from '../../../../core/renderers/adapters/completeness-binary-tree-step-compiler';
import { CompletenessBinaryTreeCanvasAdapter } from '../../../../core/renderers/adapters/completeness-binary-tree-canvas-adapter';

// 兼容导出
export type { Completeness036StaticQueueState, Completeness036Step };
export {
  buildCompletenessQueueSteps,
  buildCompletenessStaticArraySteps,
  buildCompletenessSentinelSteps,
  buildCompleteness036Steps,
};

export const completenessBinaryTree036Visualizer = registerDeclarativeAlgorithm<Completeness036Step>({
  id: 'tree-036-completeness-binary-tree',
  aliases: ['leetcode-958', 'completeness-of-binary-tree', 'tree-036-code05'],
  name: '完全二叉树检验 (Class 036)',
  category: 'tree',
  icon: '🛡️',
  difficulty: 2,
  levelOrder: 3608,
  learningGoal: '深入领会左神完全二叉树两大铁律：有右无左直接判伪、出现缺孩子节点后后续必须全部为叶子',
  problemHtml: TREE_036_037_PROBLEMS.completenessBinaryTree036.html,

  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 标准 Queue + 左神两大铁律',
      shortName: '两大铁律',
      num: 1,
      timeBadge: 'O(n) · O(w)',
      theme: 'bg-emerald' as const,
      badge: {
        mode: '广度优先 · 左神两大铁律与叶子警戒标志',
        complexity: 'O(n) · O(w) 队列状态机',
      },
      card1Title: '🛡️ 二叉树拓扑与状态机校验沙盘',
      card2Title: '⚖️ 状态机监视器与左神两大铁律核验看板',
      codeLanguages: COMPLETENESS_STAGE1_CODE,
      buildSteps: (inputs) => buildCompletenessQueueSteps(parseAndBuildCompletenessTree(inputs)),
      renderCanvas: (el, step) => CompletenessBinaryTreeCanvasAdapter.renderCanvas(el, step, '#10b981'),
      renderCustomMetrics: CompletenessBinaryTreeCanvasAdapter.renderStage1Metrics,
    },
    {
      id: 'stage-2',
      name: '阶段 2: 静态数组模拟队列 (Class 036 招牌)',
      shortName: '静态数组',
      num: 2,
      timeBadge: 'O(n) · 零GC',
      theme: 'bg-amber' as const,
      badge: {
        mode: '层次遍历 · 连续内存双指针模拟队列',
        complexity: 'O(n) · O(w) 常数极优',
      },
      card1Title: '⚡ 静态连续数组队列拓扑沙盘',
      card2Title: '🏎️ 连续内存 queue[MAXN] 与双指针监视器',
      codeLanguages: COMPLETENESS_STAGE2_STATIC_ARRAY_CODE,
      buildSteps: (inputs) => buildCompletenessStaticArraySteps(parseAndBuildCompletenessTree(inputs)),
      renderCanvas: (el, step) => CompletenessBinaryTreeCanvasAdapter.renderCanvas(el, step, '#f59e0b'),
      renderCustomMetrics: CompletenessBinaryTreeCanvasAdapter.renderStage2Metrics,
    },
    {
      id: 'stage-3',
      name: '阶段 3: 空节点哨兵单调性校验 (紧凑排布无空隙)',
      shortName: '哨兵单调队列',
      num: 3,
      timeBadge: 'O(n) · O(w)',
      theme: 'bg-blue' as const,
      badge: {
        mode: '广度优先 · 遇空后无非空单调性检验',
        complexity: 'O(n) · O(w) 哨兵队列',
      },
      card1Title: '🧱 空哨兵队列探索与断层空隙检测沙盘',
      card2Title: '🔍 空节点哨兵单调队列监视器',
      codeLanguages: COMPLETENESS_STAGE3_SENTINEL_CODE,
      buildSteps: (inputs) => buildCompletenessSentinelSteps(parseAndBuildCompletenessTree(inputs)),
      renderCanvas: (el, step) => CompletenessBinaryTreeCanvasAdapter.renderCanvas(el, step, '#3b82f6'),
      renderCustomMetrics: CompletenessBinaryTreeCanvasAdapter.renderStage3Metrics,
    },
  ],

  codeLanguages: COMPLETENESS_STAGE1_CODE,
  buildSteps: (inputs) => buildCompletenessQueueSteps(parseAndBuildCompletenessTree(inputs)),
  generateSteps: (inputs) => buildCompletenessQueueSteps(parseAndBuildCompletenessTree(inputs)),
  renderCanvas: (el, step) => CompletenessBinaryTreeCanvasAdapter.renderCanvas(el, step, '#10b981'),

  inputs: [
    {
      id: 'tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '1, 2, 3, 4, 5, 6',
      width: '160px',
    },
  ],
  presets: [
    {
      label: '合法完全二叉树 (6 节点)',
      values: { tree: '1, 2, 3, 4, 5, 6' },
      description: '满树紧凑排布，判定通过',
    },
    {
      label: '有右无左违规案例',
      values: { tree: '1, 2, 3, null, 4' },
      description: '节点 2 缺失左孩子却有右孩子 4，直接判定 false',
    },
    {
      label: '断点后出现非叶子违规',
      values: { tree: '1, 2, 3, 4, null, 6, 7' },
      description: '节点 2 缺右触发断点，节点 3 仍有子节点，违反全叶铁律',
    },
  ],
});
