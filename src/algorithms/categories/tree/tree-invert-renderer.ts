/**
 * 翻转二叉树 (Invert Binary Tree · LeetCode 226)
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构规范 (LOC < 150 行)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  TREE_INVERT_PROBLEM_HTML,
  TREE_INVERT_ANALYSIS_HTML,
} from './tree-invert-problem-content';
import {
  TREE_INVERT_STAGE1_CODE,
  TREE_INVERT_STAGE2_QUEUE_CODE,
  TREE_INVERT_STAGE3_STATIC_ARRAY_CODE,
} from './tree-invert-stage-codes';
import {
  InvertStep,
  buildTreeInvertSteps,
  buildTreeInvertBfsSteps,
  buildTreeInvertStaticArraySteps,
  parseTreeInvertInputs,
  collectTreeValues,
  cloneTree,
} from '../../../core/renderers/adapters/tree-invert-step-compiler';
import {
  TreeInvertCanvasAdapter,
  renderTreeInvertCanvasForStep,
} from '../../../core/renderers/adapters/tree-invert-canvas-adapter';

// 兼容导出
export type { InvertStep };
export {
  buildTreeInvertSteps,
  buildTreeInvertBfsSteps,
  buildTreeInvertStaticArraySteps,
  collectTreeValues,
  cloneTree,
  renderTreeInvertCanvasForStep,
};

export const treeInvertVisualizer = registerDeclarativeAlgorithm<InvertStep>({
  id: 'tree-invert',
  aliases: ['leetcode-226', 'invert-binary-tree'],
  name: '翻转二叉树',
  category: 'tree',
  icon: '🪞',
  difficulty: 1,
  levelOrder: 3,
  learningGoal: '掌握利用递归或层序遍历互换每个节点左右子树指针的算法本质',
  problemHtml: TREE_INVERT_PROBLEM_HTML,
  analysisHtml: TREE_INVERT_ANALYSIS_HTML,

  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 前序递归翻转 (Recursive Preorder DFS)',
      shortName: '前序递归',
      num: 1,
      timeBadge: 'O(N) · O(H)',
      theme: 'bg-emerald' as const,
      badge: {
        mode: '深度优先 · 递归交换左右子树指针',
        complexity: 'O(N) · O(H) 递归栈',
      },
      card1Title: '🌳 二叉树动态镜像翻转沙盘',
      card2Title: '🧭 递归调用推演与孩子互换监视器',
      codeLanguages: TREE_INVERT_STAGE1_CODE,
      buildSteps: (inputs) => buildTreeInvertSteps(parseTreeInvertInputs(inputs)),
      renderCanvas: (c, s) => TreeInvertCanvasAdapter.renderCanvas(c, s, '#10b981'),
      renderCustomMetrics: TreeInvertCanvasAdapter.renderStage1Metrics,
    },
    {
      id: 'stage-2',
      name: '阶段 2: 队列层序遍历翻转 (Iterative Queue BFS)',
      shortName: '队列BFS',
      num: 2,
      timeBadge: 'O(N) · O(W)',
      theme: 'bg-blue' as const,
      badge: {
        mode: '广度优先 · 逐层出队交换指针',
        complexity: 'O(N) · O(W) 队列',
      },
      card1Title: '🚪 队列层序翻转拓扑沙盘',
      card2Title: '🔄 队列管道与逐层交换监视器',
      codeLanguages: TREE_INVERT_STAGE2_QUEUE_CODE,
      buildSteps: (inputs) => buildTreeInvertBfsSteps(parseTreeInvertInputs(inputs)),
      renderCanvas: (c, s) => TreeInvertCanvasAdapter.renderCanvas(c, s, '#3b82f6'),
      renderCustomMetrics: TreeInvertCanvasAdapter.renderStage2Metrics,
    },
    {
      id: 'stage-3',
      name: '阶段 3: 静态数组模拟队列 (Static Array Queue)',
      shortName: '静态数组',
      num: 3,
      timeBadge: 'O(N) · 零GC',
      theme: 'bg-amber' as const,
      badge: {
        mode: '连续内存 · 双指针模拟队列零 GC',
        complexity: 'O(N) · O(W) 零GC',
      },
      card1Title: '⚡ 连续内存队列拓扑沙盘',
      card2Title: '🏎️ queue[MAXN] 连续槽位与双指针监视器',
      codeLanguages: TREE_INVERT_STAGE3_STATIC_ARRAY_CODE,
      buildSteps: (inputs) => buildTreeInvertStaticArraySteps(parseTreeInvertInputs(inputs)),
      renderCanvas: (c, s) => TreeInvertCanvasAdapter.renderCanvas(c, s, '#f59e0b'),
      renderCustomMetrics: TreeInvertCanvasAdapter.renderStage3Metrics,
    },
  ],

  codeLanguages: TREE_INVERT_STAGE1_CODE,
  buildSteps: (inputs) => buildTreeInvertSteps(parseTreeInvertInputs(inputs)),
  generateSteps: (inputs) => buildTreeInvertSteps(parseTreeInvertInputs(inputs)),
  renderCanvas: (c, s) => TreeInvertCanvasAdapter.renderCanvas(c, s, '#10b981'),
  renderCustomMetrics: TreeInvertCanvasAdapter.renderStage1Metrics,

  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '4, 2, 7, 1, 3, 6, 9',
      width: '160px',
      placeholder: '4, 2, 7, 1, 3, 6, 9',
    },
  ],
  presets: [
    {
      label: '标准满二叉树 [4, 2, 7, 1, 3, 6, 9]',
      values: { 'input-tree': '4, 2, 7, 1, 3, 6, 9' },
      description: '7 节点满二叉树',
    },
    {
      label: '简单示例 [2, 1, 3]',
      values: { 'input-tree': '2, 1, 3' },
      description: '3 节点简单二叉树',
    },
    {
      label: '单侧偏斜树 [1, 2, null, 3, null]',
      values: { 'input-tree': '1, 2, null, 3, null' },
      description: '单侧链状二叉树',
    },
    {
      label: '单节点极限 [1]',
      values: { 'input-tree': '1' },
      description: '单节点根树',
    },
  ],
});