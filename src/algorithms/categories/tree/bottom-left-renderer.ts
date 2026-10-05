/**
 * LeetCode 513: 找树左下角的值 (Find Bottom Left Tree Value)
 * 采用轻量领域适配器 (Thin Domain Adapter) 架构与多阶段演化体系
 * 推演步进委托至 BottomLeftStepCompiler，表现层视觉委托至 BottomLeftCanvasAdapter
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseTreeArray } from '../../../core/input-primitives';
import { TreeNode, buildTreeFromArr } from './tree-template';
import {
  BOTTOM_LEFT_STAGE1_CODES,
  BOTTOM_LEFT_STAGE2_CODES,
  BOTTOM_LEFT_STAGE3_CODES,
} from './bottom-left-stage-codes';
import {
  BOTTOM_LEFT_PROBLEM_HTML,
  BOTTOM_LEFT_ANALYSIS_HTML,
} from './bottom-left-problem-content';
import { BottomLeftCanvasAdapter } from '../../../core/renderers/adapters/bottom-left-canvas-adapter';
import {
  BottomLeftStepCompiler,
  BottomLeftStep,
  collectTreeValues,
} from '../../../core/renderers/adapters/bottom-left-step-compiler';

export type { BottomLeftStep };
export { collectTreeValues };

export const buildBottomLeftStage1PreorderSteps = (root: TreeNode | null): BottomLeftStep[] =>
  BottomLeftStepCompiler.compileStage1PreorderSteps(root);

export const buildBottomLeftStage2BfsSteps = (root: TreeNode | null): BottomLeftStep[] =>
  BottomLeftStepCompiler.compileStage2BfsSteps(root);

export const buildBottomLeftStage3ReverseBfsSteps = (root: TreeNode | null): BottomLeftStep[] =>
  BottomLeftStepCompiler.compileStage3ReverseBfsSteps(root);

export const buildBottomLeftSteps = (root: TreeNode | null): BottomLeftStep[] =>
  BottomLeftStepCompiler.compileSteps(root);

export function renderBottomLeftCanvas(container: HTMLElement, step: BottomLeftStep): void {
  BottomLeftCanvasAdapter.renderCanvas(container, step);
}

export function renderBottomLeftCustomMetrics(container: HTMLElement, step: BottomLeftStep): void {
  BottomLeftCanvasAdapter.renderCustomMetrics(container, step);
}

function parseAndBuild(inputs?: Record<string, any>): TreeNode | null {
  const arr = parseTreeArray(inputs?.tree || inputs?.['input-tree'], [2, 1, 3]);
  return buildTreeFromArr(arr);
}

export const bottomLeftVisualizer = registerDeclarativeAlgorithm<BottomLeftStep>({
  id: 'bottom-left',
  name: '找树左下角的值',
  category: 'tree',
  icon: '🎯',
  difficulty: 1,
  levelOrder: 513,
  aliases: ['leetcode-513', 'find-bottom-left-value'],
  learningGoal: '掌握先序优先先登锁定、标准层序首节点捕获与逆向右先层序终节点即答案三大演化形态',
  timeComplexity: 'O(N)',
  spaceComplexity: 'O(H) / O(W)',
  inputs: [
    { id: 'tree', label: '二叉树层序数组', type: 'text', defaultValue: '2, 1, 3', placeholder: '例如: 2, 1, 3' },
  ],
  presets: [
    { label: 'LeetCode 示例 1: [2, 1, 3] (答案 1)', values: { tree: '2, 1, 3' }, description: '第 1 层有 1 和 3，最左边节点为 1' },
    { label: 'LeetCode 示例 2: [1, 2, 3, 4, null, 5, 6, null, null, 7] (答案 7)', values: { tree: '1, 2, 3, 4, null, 5, 6, null, null, 7' }, description: '最底层为第 3 层的节点 7' },
    { label: '单节点根树: [1] (答案 1)', values: { tree: '1' }, description: '整树仅一个节点，左下角即根节点自身' },
    { label: '右偏单链树: [1, null, 2, null, 3, null, 4] (答案 4)', values: { tree: '1, null, 2, null, 3, null, 4' }, description: '最底层最左边即节点 4' },
    { label: '空树用例: [] (答案 0)', values: { tree: '[]' }, description: '空树特判' },
  ],
  metrics: [
    { id: 'cur', label: '当前节点', color: '#fab387' },
    { id: 'depth', label: '当前深度', color: '#2563eb' },
    { id: 'result', label: '左下角值', color: '#10b981' },
  ],
  codeLanguages: BOTTOM_LEFT_STAGE1_CODES,
  problemHtml: BOTTOM_LEFT_PROBLEM_HTML,
  analysisHtml: BOTTOM_LEFT_ANALYSIS_HTML,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 先序递归 DFS 与最深层先登者锁定 (Preorder DFS)',
      shortName: '先序先登DFS',
      num: 1,
      badge: { mode: '先序遍历 · 先登者锁定', complexity: 'O(N) · O(H)' },
      card1Title: '🌲 二叉树先序深度优先搜索沙盘',
      card2Title: '🧭 递归推演栈与最深层首访锁定',
      card2Desc: '先左后右先序遍历，同深度首次访问的叶子必为该层最左节点',
      codeLanguages: BOTTOM_LEFT_STAGE1_CODES,
      buildSteps: (inputs) => BottomLeftStepCompiler.compileStage1PreorderSteps(parseAndBuild(inputs)),
      renderCanvas: (container, step) => BottomLeftCanvasAdapter.renderCanvas(container, step),
      renderCustomMetrics: (container, step) => BottomLeftCanvasAdapter.renderCustomMetrics(container, step),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 标准层序 BFS 队列与层首捕获 (Standard Level-Order BFS)',
      shortName: '标准层序BFS',
      num: 2,
      badge: { mode: '层序队列 · 层首捕获', complexity: 'O(N) · O(W)' },
      card1Title: '🌲 标准层序广度优先搜索沙盘',
      card2Title: '📦 BFS 队列槽与层首元素监控',
      card2Desc: '每层 i == 0 时锁定层首节点，遍历至最后一层获得答案',
      codeLanguages: BOTTOM_LEFT_STAGE2_CODES,
      buildSteps: (inputs) => BottomLeftStepCompiler.compileStage2BfsSteps(parseAndBuild(inputs)),
      renderCanvas: (container, step) => BottomLeftCanvasAdapter.renderCanvas(container, step),
      renderCustomMetrics: (container, step) => BottomLeftCanvasAdapter.renderCustomMetrics(container, step),
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 逆向右先层序 BFS (Reverse Right-to-Left BFS · 最优解)',
      shortName: '逆向右先BFS',
      num: 3,
      badge: { mode: '逆向层序 · 终节点即答案', complexity: 'O(N) · O(W)' },
      card1Title: '🌲 逆向右先层序广度优先沙盘',
      card2Title: '⚡ 逆向 BFS 队列与最后出队监视器',
      card2Desc: '先入右孩子后入左孩子，队列最后一个出队的节点即为树左下角的值',
      codeLanguages: BOTTOM_LEFT_STAGE3_CODES,
      buildSteps: (inputs) => BottomLeftStepCompiler.compileStage3ReverseBfsSteps(parseAndBuild(inputs)),
      renderCanvas: (container, step) => BottomLeftCanvasAdapter.renderCanvas(container, step),
      renderCustomMetrics: (container, step) => BottomLeftCanvasAdapter.renderCustomMetrics(container, step),
    },
  ],

  generateSteps: (inputs) => BottomLeftStepCompiler.compileStage1PreorderSteps(parseAndBuild(inputs)),
  buildSteps: (inputs) => BottomLeftStepCompiler.compileStage1PreorderSteps(parseAndBuild(inputs)),
  renderCanvas: (container, step) => BottomLeftCanvasAdapter.renderCanvas(container, step),
  renderCustomMetrics: (container, step) => BottomLeftCanvasAdapter.renderCustomMetrics(container, step),
});
