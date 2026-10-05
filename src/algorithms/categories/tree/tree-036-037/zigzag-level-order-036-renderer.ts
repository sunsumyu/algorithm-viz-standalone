/**
 * 二叉树锯齿形层序遍历可视化器 (Zigzag Level Order Traversal · LeetCode 103 / Class 036 Code02)
 * 采用轻量领域适配器 (Thin Domain Adapter) 架构与多阶段演化体系
 * 推演步进委托至 ZigzagStepCompiler，表现层视觉委托至 ZigzagCanvasAdapter
 */

import { parseTreeArray } from '../../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TreeNode, buildTreeFromArr as buildTree } from '../tree-template';
import { Tree036Step } from './tree-036-037-shared';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';
import {
  ZIGZAG_STAGE1_CODE,
  ZIGZAG_STAGE2_STATIC_ARRAY_CODE,
  ZIGZAG_STAGE3_DFS_CODE,
} from './zigzag-level-order-036-stage-codes';
import {
  ZigzagCanvasAdapter,
  ZigzagStaticQueueState,
} from '../../../../core/renderers/adapters/zigzag-canvas-adapter';
import {
  ZigzagStepCompiler,
  ZigzagStep,
} from '../../../../core/renderers/adapters/zigzag-step-compiler';

export type { ZigzagStep, ZigzagStaticQueueState };

export const buildZigzagQueueSteps = (root: TreeNode | null): ZigzagStep[] => ZigzagStepCompiler.compileQueueSteps(root);
export const buildZigzagStaticArraySteps = (root: TreeNode | null): ZigzagStep[] => ZigzagStepCompiler.compileStaticArraySteps(root);
export const buildZigzagDfsSteps = (root: TreeNode | null): ZigzagStep[] => ZigzagStepCompiler.compileDfsSteps(root);
export const buildZigzag036Steps = (treeRaw?: string): Tree036Step[] => ZigzagStepCompiler.compileLegacySteps(treeRaw);

function parseAndBuild(inputs?: Record<string, any>): TreeNode | null {
  const raw = inputs?.['tree'] || inputs?.['input-tree'] || '3, 9, 20, null, null, 15, 7';
  return buildTree(parseTreeArray(raw, [3, 9, 20, null, null, 15, 7]));
}

export const zigzagLevelOrder036Visualizer = registerDeclarativeAlgorithm<ZigzagStep>({
  id: 'tree-036-zigzag-level-order',
  name: '二叉树锯齿形层序遍历 (Class 036)',
  aliases: ['zigzag-level-order', 'binary-tree-zigzag-level-order-traversal', 'leetcode-103'],
  category: 'tree',
  icon: '🔀',
  difficulty: 2,
  levelOrder: 3602,
  learningGoal: '掌握标准队列与双端队列/方向标志结合的锯齿形层序遍历技巧，理解出队顺序与收集顺序解耦的设计',
  problemHtml: TREE_036_037_PROBLEMS.zigzagLevelOrder036.html,

  inputs: [
    { id: 'tree', label: '二叉树层序', type: 'text', defaultValue: '3, 9, 20, null, null, 15, 7', width: '180px' },
  ],
  presets: [
    { label: 'LeetCode 示例 1 (三层折返)', values: { tree: '3, 9, 20, null, null, 15, 7' }, description: '经典之字形三层折返: [3] -> [20, 9] -> [15, 7]' },
    { label: '满二叉树 (完备三层)', values: { tree: '1, 2, 3, 4, 5, 6, 7' }, description: '全满节点锯齿形: [1] -> [3, 2] -> [4, 5, 6, 7]' },
    { label: '链状偏斜二叉树', values: { tree: '1, 2, null, 3, null' }, description: '单侧链状退化结构' },
    { label: '单节点二叉树', values: { tree: '1' }, description: '仅包含根节点' },
  ],
  metrics: [
    { id: 'cur-level', label: '当前所在层', color: '#2563eb' },
    { id: 'queue-size', label: '队列/窗口规模', color: '#f59e0b' },
    { id: 'total-collected', label: '已收集层数', color: '#16a34a' },
  ],

  defaultStage: 'stage-1',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 双端队列 / isReverse 标志法',
      shortName: '双端队列',
      num: 1,
      timeBadge: 'O(n) · O(w)',
      theme: 'bg-emerald' as const,
      badge: { mode: '锯齿形层序 · isReverse 标志头尾插法', complexity: 'O(n) · O(w) 队列宽度' },
      card1Title: '📊 二叉树拓扑与双端收集沙盘',
      card2Title: '🧭 FIFO 队列与当前层双端收集监视器',
      codeLanguages: ZIGZAG_STAGE1_CODE,
      buildSteps: (inputs: Record<string, any>) => ZigzagStepCompiler.compileQueueSteps(parseAndBuild(inputs)),
      renderCanvas: (container: HTMLElement, step: ZigzagStep) => ZigzagCanvasAdapter.renderCanvas(container, step, '#fbbf24'),
      renderCustomMetrics: (container: HTMLElement, step: ZigzagStep) => {
        container.innerHTML = ZigzagCanvasAdapter.renderMetricsShell(step, ZigzagCanvasAdapter.renderStage1BufferHtml(step.queue, step.currentLevel, step.isReverse));
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 静态数组模拟队列 (Class 036)',
      shortName: '静态数组',
      num: 2,
      timeBadge: 'O(n) · 零GC',
      theme: 'bg-blue' as const,
      badge: { mode: '锯齿形层序 · 静态连续内存双向读指针', complexity: 'O(n) · O(w) 常数极优' },
      card1Title: '⚡ 静态数组模拟队列拓扑沙盘',
      card2Title: '🏎️ 连续内存 queue[MAXN] 与 l/r 双指针监视器',
      codeLanguages: ZIGZAG_STAGE2_STATIC_ARRAY_CODE,
      buildSteps: (inputs: Record<string, any>) => ZigzagStepCompiler.compileStaticArraySteps(parseAndBuild(inputs)),
      renderCanvas: (container: HTMLElement, step: ZigzagStep) => ZigzagCanvasAdapter.renderCanvas(container, step, '#38bdf8'),
      renderCustomMetrics: (container: HTMLElement, step: ZigzagStep) => {
        container.innerHTML = ZigzagCanvasAdapter.renderMetricsShell(step, ZigzagCanvasAdapter.renderStage2BufferHtml(step.staticQueueState));
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: 递归 DFS 深度映射',
      shortName: '递归DFS',
      num: 3,
      timeBadge: 'O(n) · O(h)',
      theme: 'bg-amber' as const,
      badge: { mode: '锯齿形层序 · DFS 递归深度奇偶头尾插', complexity: 'O(n) · O(h) 栈深' },
      card1Title: '🌳 二叉树拓扑与 DFS 递归探索沙盘',
      card2Title: '📚 DFS 递归调用栈与深度映射监视器',
      codeLanguages: ZIGZAG_STAGE3_DFS_CODE,
      buildSteps: (inputs: Record<string, any>) => ZigzagStepCompiler.compileDfsSteps(parseAndBuild(inputs)),
      renderCanvas: (container: HTMLElement, step: ZigzagStep) => ZigzagCanvasAdapter.renderCanvas(container, step, '#f97316'),
      renderCustomMetrics: (container: HTMLElement, step: ZigzagStep) => {
        container.innerHTML = ZigzagCanvasAdapter.renderMetricsShell(step, ZigzagCanvasAdapter.renderStage3BufferHtml(step.callStack));
      },
    },
  ],

  // Legacy fallback
  codeLanguages: ZIGZAG_STAGE1_CODE,
  buildSteps: (inputs) => ZigzagStepCompiler.compileQueueSteps(parseAndBuild(inputs)),
  generateSteps: (inputs) => ZigzagStepCompiler.compileQueueSteps(parseAndBuild(inputs)),
  renderCanvas: (container, step) => ZigzagCanvasAdapter.renderCanvas(container, step, '#fbbf24'),
});
