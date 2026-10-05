/**
 * 二叉树层序遍历可视化器 (Binary Tree Level Order Traversal · LeetCode 102 / Class 036 Code01)
 *
 * 架构规范：纯领域适配器 (Thin Domain Adapter, LOC < 150 行)
 * 表现层委托给 LevelOrderCanvasAdapter，核心推演委托给 LevelOrderStepCompiler
 * 遵循 Matt Pocock 深模块规范与双版本长处综合整合 (Bi-Version Synthesis)
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeNode, buildTreeFromArr as buildTree } from './tree-template';
import { LevelOrderCanvasAdapter, LevelOrderStaticQueueState, LevelOrderHashMapState } from '../../../core/renderers/adapters/level-order-canvas-adapter';
import { LevelOrderStepCompiler, LevelOrderStep } from '../../../core/renderers/adapters/level-order-step-compiler';
import { BINARY_TREE_LEVEL_PROBLEM_HTML, BINARY_TREE_LEVEL_ANALYSIS_HTML } from './binary-tree-level-problem-content';
import {
  LEVEL_ORDER_STAGE1_CODE, LEVEL_ORDER_STAGE1_LINES,
  LEVEL_ORDER_STAGE2_CODE, LEVEL_ORDER_STAGE2_LINES,
  LEVEL_ORDER_STATIC_ARRAY_CODE, LEVEL_ORDER_STATIC_ARRAY_LINES,
  LEVEL_ORDER_HASH_MAP_CODE, LEVEL_ORDER_HASH_MAP_LINES,
} from './binary-tree-level-stage-codes';
import { BINARY_TREE_LEVEL_INPUTS, BINARY_TREE_LEVEL_PRESETS } from './binary-tree-level-presets';

export type BTLStaticQueueState = LevelOrderStaticQueueState;
export type BTLHashMapState = LevelOrderHashMapState;
export type BTLStep = LevelOrderStep;

export const buildBTLSteps = (root: TreeNode | null): BTLStep[] =>
  LevelOrderStepCompiler.compileStandardQueueSteps(root, LEVEL_ORDER_STAGE2_LINES);

export const buildStaticArrayLevelOrderSteps = (root: TreeNode | null): BTLStep[] =>
  LevelOrderStepCompiler.compileStaticArraySteps(root, LEVEL_ORDER_STATIC_ARRAY_LINES);

export const buildHashMapLevelOrderSteps = (root: TreeNode | null): BTLStep[] =>
  LevelOrderStepCompiler.compileHashMapSteps(root, LEVEL_ORDER_HASH_MAP_LINES);

export const buildDFSLevelOrderSteps = (root: TreeNode | null): BTLStep[] =>
  LevelOrderStepCompiler.compileDfsSteps(root, LEVEL_ORDER_STAGE1_LINES);

const parseTree = (inputs?: Record<string, any>): TreeNode | null =>
  buildTree(parseTreeArray(inputs?.['input-tree'] || inputs?.['tree'] || '3, 9, 20, null, null, 15, 7', [3, 9, 20, null, null, 15, 7]));

const renderCanvas = (c: HTMLElement, s: BTLStep, color: string = '#fbbf24') =>
  LevelOrderCanvasAdapter.renderLevelOrderCanvas(c, s, color);

const renderMetrics = (c: HTMLElement, s: BTLStep, stageId: string) =>
  LevelOrderCanvasAdapter.renderCustomMetrics(c, s, stageId);

// ============================================================
// 声明式算法注册 — 4 阶段完整演化体系 (Class 036 集大成者)
// ============================================================
export const binaryTreeLevelVisualizer = registerDeclarativeAlgorithm<BTLStep>({
  id: 'binary-tree-level',
  aliases: ['tree-036-level-order'],
  name: '二叉树的层序遍历',
  category: 'tree',
  icon: '🥞',
  badge: { mode: 'BFS 队列逐层收集', complexity: 'O(n) · O(w)' },
  card1Title: '📊 二叉树拓扑与遍历沙盘',
  card2Title: '🧭 遍历状态与分层结果监视器',
  card2Desc: '当前处理节点、缓冲数据结构与已收集层序二维数组',
  legend: [
    { label: '当前活跃节点', color: '#fbbf24' },
    { label: '当前层已访问', color: '#34d399' },
    { label: '队列待访问', color: '#60a5fa' },
  ],
  inputs: BINARY_TREE_LEVEL_INPUTS,
  presets: BINARY_TREE_LEVEL_PRESETS,
  metrics: [
    { id: 'cur-level', label: '当前所在层', color: '#2563eb' },
    { id: 'queue-size', label: 'BFS 队列大小', color: '#f59e0b' },
    { id: 'total-collected', label: '已收集层数', color: '#16a34a' },
  ],
  problemHtml: BINARY_TREE_LEVEL_PROBLEM_HTML,
  analysisHtml: BINARY_TREE_LEVEL_ANALYSIS_HTML,
  defaultStage: 'stage-1',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 标准 Queue 队列',
      shortName: 'Queue队列',
      num: 1,
      timeBadge: 'O(n) · O(w)',
      theme: 'bg-emerald' as const,
      badge: { mode: '层序遍历 · Queue 队列逐层出队', complexity: 'O(n) · O(w) 队列宽度' },
      card1Title: '📊 二叉树拓扑与 BFS 遍历沙盘',
      card2Title: '🧭 标准 FIFO 队列与分层结果监视器',
      codeLanguages: LEVEL_ORDER_STAGE2_CODE,
      buildSteps: (inputs) => buildBTLSteps(parseTree(inputs)),
      renderCanvas: (c, s) => renderCanvas(c, s, '#fbbf24'),
      renderCustomMetrics: (c, s) => renderMetrics(c, s, 'stage-1'),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 哈希表记录层级 (新手对比)',
      shortName: '哈希表对比',
      num: 2,
      timeBadge: 'O(n) · 劣质',
      theme: 'bg-purple' as const,
      badge: { mode: '层序遍历 · Queue + HashMap 映射', complexity: 'O(n) · O(n) 常数较大' },
      card1Title: '🗺️ 二叉树拓扑与哈希表映射沙盘',
      card2Title: '⚠️ HashMap&lt;TreeNode, Integer&gt; 状态监视器',
      codeLanguages: LEVEL_ORDER_HASH_MAP_CODE,
      buildSteps: (inputs) => buildHashMapLevelOrderSteps(parseTree(inputs)),
      renderCanvas: (c, s) => renderCanvas(c, s, '#c084fc'),
      renderCustomMetrics: (c, s) => renderMetrics(c, s, 'stage-2'),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 静态数组模拟队列 (Class 036)',
      shortName: '静态数组',
      num: 3,
      timeBadge: 'O(n) · 零GC',
      theme: 'bg-blue' as const,
      badge: { mode: '层序遍历 · 静态数组双指针模拟队列', complexity: 'O(n) · O(w) 常数极优' },
      card1Title: '⚡ 静态数组模拟队列拓扑沙盘',
      card2Title: '🏎️ 连续内存 queue[MAXN] 与 l/r 双指针监视器',
      codeLanguages: LEVEL_ORDER_STATIC_ARRAY_CODE,
      buildSteps: (inputs) => buildStaticArrayLevelOrderSteps(parseTree(inputs)),
      renderCanvas: (c, s) => renderCanvas(c, s, '#38bdf8'),
      renderCustomMetrics: (c, s) => renderMetrics(c, s, 'stage-3'),
    },
    {
      id: 'stage-4',
      name: '阶段 4: 递归 DFS 分层收集',
      shortName: '递归DFS',
      num: 4,
      timeBadge: 'O(n) · O(h)',
      theme: 'bg-amber' as const,
      badge: { mode: '层序遍历 · 递归 DFS 深度映射', complexity: 'O(n) · O(h) 栈深' },
      card1Title: '🌳 二叉树拓扑与 DFS 递归探索沙盘',
      card2Title: '📚 DFS 递归调用栈与分层收集监视器',
      codeLanguages: LEVEL_ORDER_STAGE1_CODE,
      buildSteps: (inputs) => buildDFSLevelOrderSteps(parseTree(inputs)),
      renderCanvas: (c, s) => renderCanvas(c, s, '#f97316'),
      renderCustomMetrics: (c, s) => renderMetrics(c, s, 'stage-4'),
    },
  ],
  codeLanguages: LEVEL_ORDER_STAGE2_CODE,
  generateSteps: (inputs) => buildBTLSteps(parseTree(inputs)),
  buildSteps: (inputs) => buildBTLSteps(parseTree(inputs)),
  renderCanvas: (c, s) => renderCanvas(c, s, '#fbbf24'),
  renderCustomMetrics: (c, s) => renderMetrics(c, s, 'stage-1'),
});