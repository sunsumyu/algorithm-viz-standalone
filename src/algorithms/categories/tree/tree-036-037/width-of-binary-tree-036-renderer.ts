/**
 * 二叉树最大宽度可视化器 (Width of Binary Tree · LeetCode 662 / Class 036 Code03)
 * 采用轻量领域适配器 (Thin Domain Adapter) 架构与多阶段演化体系
 * 推演步进委托至 WidthStepCompiler，表现层视觉委托至 WidthCanvasAdapter
 */

import { parseTreeArray } from '../../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../../core/declarative-algorithm-visualizer';
import { TreeNode, buildTreeFromArr } from '../tree-template';
import { TREE_036_037_PROBLEMS } from './tree-036-037-problem-content';
import {
  WIDTH_STAGE1_CODE,
  WIDTH_STAGE2_STATIC_ARRAY_CODE,
  WIDTH_STAGE3_DFS_CODE,
} from './width-of-binary-tree-036-stage-codes';
import {
  WidthCanvasAdapter,
  Width036StaticQueueState,
} from '../../../../core/renderers/adapters/width-canvas-adapter';
import {
  WidthStepCompiler,
  Width036Step,
  collectAllTreeVals,
} from '../../../../core/renderers/adapters/width-step-compiler';

export type { Width036Step, Width036StaticQueueState };
export { collectAllTreeVals };

export const buildWidth036QueueSteps = (root: TreeNode | null): Width036Step[] => WidthStepCompiler.compileQueueSteps(root);
export const buildWidth036StaticArraySteps = (root: TreeNode | null): Width036Step[] => WidthStepCompiler.compileStaticArraySteps(root);
export const buildWidth036DfsSteps = (root: TreeNode | null): Width036Step[] => WidthStepCompiler.compileDfsSteps(root);
export const buildWidth036Steps = (treeRaw?: string): Width036Step[] => WidthStepCompiler.compileLegacySteps(treeRaw);

export function renderWidthCanvasForStep(container: HTMLElement, step: Width036Step, primaryColor: string = '#0284c7'): void {
  WidthCanvasAdapter.renderCanvas(container, step, primaryColor);
}

function parseAndBuild(inputs?: Record<string, any>): TreeNode | null {
  const raw = inputs?.tree ?? '1, 3, 2, 5, 3, null, 9';
  return buildTreeFromArr(parseTreeArray(raw, [1, 3, 2, 5, 3, null, 9]));
}

export const widthOfBinaryTree036Visualizer = registerDeclarativeAlgorithm<Width036Step>({
  id: 'tree-036-width-of-binary-tree',
  aliases: ['leetcode-662', 'width-of-binary-tree', 'tree-036-code03'],
  name: '二叉树最大宽度 (Class 036)',
  category: 'tree',
  icon: '📏',
  difficulty: 2,
  levelOrder: 3603,
  learningGoal: '掌握完全二叉树编号模型与基于首节点偏移 base 消除整数溢出的工程技巧',
  problemHtml: TREE_036_037_PROBLEMS.widthOfBinaryTree036.html,

  inputs: [
    { id: 'tree', label: '二叉树层序', type: 'text', defaultValue: '1, 3, 2, 5, 3, null, 9', width: '160px' },
  ],
  presets: [
    { label: '示例 1 (跨度 4 · 两翼饱满)', values: { tree: '1, 3, 2, 5, 3, null, 9' }, description: '左右最宽跨度为 4' },
    { label: '示例 2 (跨度 2 · 中间空位)', values: { tree: '1, 3, 2, 5, null, null, 9' }, description: '中间空位跨度为 2' },
    { label: '单链极端偏斜 (跨度 1)', values: { tree: '1, 3, null, 5' }, description: '单链跨度为 1' },
  ],

  defaultStage: 'stage-1',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 标准 Queue + 基准偏移防溢出',
      shortName: 'Queue+Base',
      num: 1,
      timeBadge: 'O(n) · O(w)',
      theme: 'bg-emerald' as const,
      badge: { mode: '广度优先 · 首节点基准偏移归一化', complexity: 'O(n) · O(w) 队列防溢出' },
      card1Title: '📐 二叉树拓扑与完全二叉树编号沙盘',
      card2Title: '🥞 FIFO 队列与归一化编号监视器',
      codeLanguages: WIDTH_STAGE1_CODE,
      buildSteps: (inputs: Record<string, any>) => WidthStepCompiler.compileQueueSteps(parseAndBuild(inputs)),
      renderCanvas: (container: HTMLElement, step: Width036Step) => WidthCanvasAdapter.renderCanvas(container, step, '#10b981'),
      renderCustomMetrics: (container: HTMLElement, step: Width036Step) => {
        container.innerHTML = WidthCanvasAdapter.renderMetricsShell(step, WidthCanvasAdapter.renderStage1QueueBufferHtml(step));
      },
    },
    {
      id: 'stage-2',
      name: '阶段 2: 静态连续双数组模拟队列 (Class 036 招牌)',
      shortName: '静态双数组',
      num: 2,
      timeBadge: 'O(n) · 零GC',
      theme: 'bg-amber' as const,
      badge: { mode: '层次遍历 · 静态双数组双指针模拟队列', complexity: 'O(n) · O(w) 常数极优' },
      card1Title: '⚡ 静态双连续数组队列拓扑沙盘',
      card2Title: '🏎️ 连续内存 nq[MAXN] / iq[MAXN] 与双指针监视器',
      codeLanguages: WIDTH_STAGE2_STATIC_ARRAY_CODE,
      buildSteps: (inputs: Record<string, any>) => WidthStepCompiler.compileStaticArraySteps(parseAndBuild(inputs)),
      renderCanvas: (container: HTMLElement, step: Width036Step) => WidthCanvasAdapter.renderCanvas(container, step, '#f59e0b'),
      renderCustomMetrics: (container: HTMLElement, step: Width036Step) => {
        container.innerHTML = WidthCanvasAdapter.renderMetricsShell(step, WidthCanvasAdapter.renderStage2StaticArrayBufferHtml(step.staticQueueState));
      },
    },
    {
      id: 'stage-3',
      name: '阶段 3: DFS 递归先序遍历记录每层最左编号',
      shortName: 'DFS映射',
      num: 3,
      timeBadge: 'O(n) · O(h)',
      theme: 'bg-blue' as const,
      badge: { mode: '深度优先 · 递归先序每层最左节点首访入表', complexity: 'O(n) · O(h) 递归栈' },
      card1Title: '🌲 DFS 先序探索路径与虚拟编号沙盘',
      card2Title: '🗺️ DFS 递归栈与各层首访最左编号表 leftMost',
      codeLanguages: WIDTH_STAGE3_DFS_CODE,
      buildSteps: (inputs: Record<string, any>) => WidthStepCompiler.compileDfsSteps(parseAndBuild(inputs)),
      renderCanvas: (container: HTMLElement, step: Width036Step) => WidthCanvasAdapter.renderCanvas(container, step, '#3b82f6'),
      renderCustomMetrics: (container: HTMLElement, step: Width036Step) => {
        container.innerHTML = WidthCanvasAdapter.renderMetricsShell(step, WidthCanvasAdapter.renderStage3DfsBufferHtml(step));
      },
    },
  ],

  // Fallback
  codeLanguages: WIDTH_STAGE1_CODE,
  buildSteps: (inputs) => WidthStepCompiler.compileQueueSteps(parseAndBuild(inputs)),
  generateSteps: (inputs) => WidthStepCompiler.compileQueueSteps(parseAndBuild(inputs)),
  renderCanvas: (container, step) => WidthCanvasAdapter.renderCanvas(container, step, '#10b981'),
});
