/**
 * 对称二叉树 (Symmetric Tree · LeetCode 101)
 * 采用顶层声明式架构与多阶段演化体系 (Multi-Stage Evolution)
 * Stage 1: 双指针镜像递归 | Stage 2: 队列成对迭代 | Stage 3: 静态数组模拟队列
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeNode, buildTreeFromArr } from './tree-template';
import {
  TREE_SYMMETRIC_PROBLEM_HTML,
  TREE_SYMMETRIC_ANALYSIS_HTML,
} from './tree-symmetric-problem-content';
import {
  TREE_SYMMETRIC_STAGE1_CODE,
  TREE_SYMMETRIC_STAGE2_QUEUE_CODE,
  TREE_SYMMETRIC_STAGE3_STATIC_ARRAY_CODE,
} from './tree-symmetric-stage-codes';
import {
  TSStep,
  TREE_SYMMETRIC_CODE_LINES,
  collectTreeValues,
  buildTSRecursiveSteps,
  buildTSIterativeQueueSteps,
  buildTSStaticArraySteps,
  buildTSSteps,
} from '../../../core/renderers/adapters/tree-symmetric-step-compiler';
import { TreeSymmetricCanvasAdapter } from '../../../core/renderers/adapters/tree-symmetric-canvas-adapter';

// 重新导出契约与推演函数，保持既有单测 100% 零退化兼容
export type { TSStep };
export {
  TREE_SYMMETRIC_CODE_LINES,
  collectTreeValues,
  buildTSRecursiveSteps,
  buildTSIterativeQueueSteps,
  buildTSStaticArraySteps,
  buildTSSteps,
};

function parseAndBuild(inputs?: Record<string, any>): TreeNode | null {
  const raw = inputs?.['input-tree'] ?? inputs?.tree ?? '1, 2, 2, 3, 4, 4, 3';
  return buildTreeFromArr(parseTreeArray(raw, [1, 2, 2, 3, 4, 4, 3]));
}

// ============================================================
// 声明式算法注册中心配置 (Declarative Algorithm Visualizer)
// ============================================================
export const treeSymmetricVisualizer = registerDeclarativeAlgorithm<TSStep>({
  id: 'tree-symmetric',
  aliases: ['leetcode-101', 'symmetric-tree'],
  name: '对称二叉树',
  category: 'tree',
  icon: '⚖️',
  difficulty: 1,
  levelOrder: 4,
  learningGoal: '掌握镜像二叉树双指针同时向下递归遍历外侧与内侧节点的算法设计模式',
  problemHtml: TREE_SYMMETRIC_PROBLEM_HTML,
  analysisHtml: TREE_SYMMETRIC_ANALYSIS_HTML,

  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 双指针镜像递归 (Recursive Mirror DFS)',
      shortName: '镜像递归',
      num: 1,
      timeBadge: 'O(N) · O(H)',
      theme: 'bg-emerald',
      badge: { mode: '深度优先 · 外侧与内侧双路递归比对', complexity: 'O(N) · O(H) 递归栈' },
      card1Title: '🌳 二叉树拓扑与镜像比对沙盘',
      card2Title: '⚖️ 镜像递归调用与内外侧状态监视器',
      codeLanguages: TREE_SYMMETRIC_STAGE1_CODE,
      buildSteps: (inputs) => buildTSRecursiveSteps(parseAndBuild(inputs)),
      renderCanvas: (c, s) => TreeSymmetricCanvasAdapter.renderCanvas(c, s, '#10b981'),
      renderCustomMetrics: (c, s) => TreeSymmetricCanvasAdapter.renderStage1Metrics(c, s),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 队列成对迭代 (Iterative Queue BFS)',
      shortName: '成对队列',
      num: 2,
      timeBadge: 'O(N) · O(W)',
      theme: 'bg-blue',
      badge: { mode: '广度优先 · 镜像成对入队与出队校验', complexity: 'O(N) · O(W) 队列' },
      card1Title: '🚪 队列成对出入拓扑沙盘',
      card2Title: '🔄 成对队列管道与失配阻断监视器',
      codeLanguages: TREE_SYMMETRIC_STAGE2_QUEUE_CODE,
      buildSteps: (inputs) => buildTSIterativeQueueSteps(parseAndBuild(inputs)),
      renderCanvas: (c, s) => TreeSymmetricCanvasAdapter.renderCanvas(c, s, '#3b82f6'),
      renderCustomMetrics: (c, s) => TreeSymmetricCanvasAdapter.renderStage2Metrics(c, s),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 静态数组模拟队列 (Static Array Queue)',
      shortName: '静态数组',
      num: 3,
      timeBadge: 'O(N) · 零GC',
      theme: 'bg-amber',
      badge: { mode: '连续内存 · 双指针模拟队列零 GC 极速', complexity: 'O(N) · O(W) 常数优' },
      card1Title: '⚡ 连续内存队列拓扑沙盘',
      card2Title: '🏎️ queue[MAXN] 连续槽位与双指针监视器',
      codeLanguages: TREE_SYMMETRIC_STAGE3_STATIC_ARRAY_CODE,
      buildSteps: (inputs) => buildTSStaticArraySteps(parseAndBuild(inputs)),
      renderCanvas: (c, s) => TreeSymmetricCanvasAdapter.renderCanvas(c, s, '#f59e0b'),
      renderCustomMetrics: (c, s) => TreeSymmetricCanvasAdapter.renderStage3Metrics(c, s),
    },
  ],

  codeLanguages: TREE_SYMMETRIC_STAGE1_CODE,
  buildSteps: (inputs) => buildTSRecursiveSteps(parseAndBuild(inputs)),
  generateSteps: (inputs) => buildTSRecursiveSteps(parseAndBuild(inputs)),
  renderCanvas: (c, s) => TreeSymmetricCanvasAdapter.renderCanvas(c, s, '#10b981'),

  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序',
      type: 'text',
      defaultValue: '1, 2, 2, 3, 4, 4, 3',
      width: '160px',
      placeholder: '1, 2, 2, 3, 4, 4, 3',
    },
  ],
  presets: [
    { label: '完全对称 [1, 2, 2, 3, 4, 4, 3]', values: { 'input-tree': '1, 2, 2, 3, 4, 4, 3' } },
    { label: '结构不对称 [1, 2, 2, null, 3, null, 3]', values: { 'input-tree': '1, 2, 2, null, 3, null, 3' } },
    { label: '数值不对称 [1, 2, 3]', values: { 'input-tree': '1, 2, 3' } },
    { label: '单节点根树 [1]', values: { 'input-tree': '1' } },
  ],
});
