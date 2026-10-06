/**
 * 二叉树最小深度轻量领域适配器 (Thin Domain Adapter · LeetCode 111 / Zuoshen Class 036)
 * 遵循 Matt Pocock 深模块规范 (LOC < 150 行)，推演编译与画布呈现委托至统一深模块：
 *   - TreeDepthStepCompiler (推演步进编译器)
 *   - TreeDepthCanvasAdapter (拓扑画布与看板呈现适配器)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { TreeNode, buildTreeFromArr } from './tree-template';
import {
  MIN_DEPTH_PROBLEM_HTML,
  MIN_DEPTH_ANALYSIS_HTML,
} from './min-depth-problem-content';
import {
  MIN_DEPTH_STAGE1_CODES,
  MIN_DEPTH_STAGE2_CODES,
  MIN_DEPTH_STAGE3_CODES,
} from './min-depth-stage-codes';
import {
  TreeDepthStepCompiler,
  MinDepthStep,
  MIN_DEPTH_STAGE1_LINES,
  MIN_DEPTH_STAGE2_LINES,
  MIN_DEPTH_STAGE3_LINES,
  MIN_DEPTH_CODES,
} from '../../../core/renderers/adapters/tree-depth-step-compiler';
import { TreeDepthCanvasAdapter } from '../../../core/renderers/adapters/tree-depth-canvas-adapter';

// 向后兼容导出
export type { MinDepthStep };
export {
  MIN_DEPTH_STAGE1_LINES,
  MIN_DEPTH_STAGE2_LINES,
  MIN_DEPTH_STAGE3_LINES,
  MIN_DEPTH_CODES,
};
export const buildMinDepthStage1Steps = TreeDepthStepCompiler.compileMinDepthStage1Steps;
export const buildMinDepthStage2BfsSteps = TreeDepthStepCompiler.compileMinDepthStage2BfsSteps;
export const buildMinDepthStage3StaticArraySteps = TreeDepthStepCompiler.compileMinDepthStage3StaticArraySteps;
export const buildMinDepthSteps = buildMinDepthStage1Steps;
export const renderMinDepthCanvas = TreeDepthCanvasAdapter.renderMinDepthCanvas;

function parseTreeInput(raw?: string, fallback: (number | null)[] = [3, 9, 20, null, null, 15, 7]): (number | null)[] {
  if (!raw || !raw.trim()) return fallback;
  const cleaned = raw.replace(/^\[|\]$/g, '').trim();
  if (!cleaned) return fallback;
  return cleaned
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .map((s) => (s === 'null' || s === 'nil' || s === 'none' || s === '' ? null : Number(s)));
}

function parseAndBuild(inputs?: Record<string, any>): TreeNode | null {
  const arr = parseTreeInput(inputs?.['input-tree'] || inputs?.['tree']);
  return buildTreeFromArr(arr);
}

export const minDepthVisualizer = registerDeclarativeAlgorithm<MinDepthStep>({
  id: 'min-depth',
  name: '二叉树最小深度',
  category: 'tree',
  icon: '📏',
  difficulty: 1,
  levelOrder: 111,
  aliases: ['leetcode-111', 'min-depth-tree', 'minimum-depth'],
  learningGoal: '透彻掌握二叉树最小深度与最大深度的本质差异，理解单侧子树陷阱与 BFS 提前退出优化',
  timeComplexity: 'O(N)',
  spaceComplexity: 'O(H) / O(W)',
  inputs: [
    {
      id: 'input-tree',
      label: '二叉树层序数组 (逗号分隔)',
      type: 'text',
      defaultValue: '3, 9, 20, null, null, 15, 7',
      placeholder: '例如: 3, 9, 20, null, null, 15, 7',
    },
  ],
  presets: [
    { label: '截图推演用例: 典型四节点 [1, 2, 3, null, 4]', values: { 'input-tree': '1, 2, 3, null, 4' }, description: '根 1，左 2(右 4)，右 3(叶子)，完整展示深入、单侧避坑与回溯归约' },
    { label: 'LeetCode 示例 1: 经典二分叉 2', values: { 'input-tree': '3, 9, 20, null, null, 15, 7' }, description: '根 3，左 9 (叶子)，右 20(15, 7)，最小深度为 2' },
    { label: 'LeetCode 示例 2: 单侧长链 5', values: { 'input-tree': '2, null, 3, null, 4, null, 5, null, 6' }, description: '单侧右斜链，必须走到叶子节点 6，深度为 5' },
    { label: '单侧陷阱用例 2', values: { 'input-tree': '1, 2' }, description: '根 1，左 2，最小深度是 2 而非 1 (根不是叶节点)' },
    { label: '单节点根树 1', values: { 'input-tree': '10' }, description: '仅包含根节点 10，自身即为叶子，最小深度 1' },
  ],
  metrics: [
    { id: 'cur', label: '当前节点', color: '#fab387' },
    { id: 'depth', label: '当前深度', color: '#2563eb' },
    { id: 'result', label: '最小深度', color: '#10b981' },
  ],
  codeLanguages: MIN_DEPTH_STAGE1_CODES,
  problemHtml: MIN_DEPTH_PROBLEM_HTML,
  analysisHtml: MIN_DEPTH_ANALYSIS_HTML,
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 后序递归分治与叶节点特判 (LC 111)',
      shortName: '后序递归特判',
      num: 1,
      codeLanguages: MIN_DEPTH_STAGE1_CODES,
      buildSteps: (inputs) => buildMinDepthStage1Steps(parseAndBuild(inputs)),
      renderCanvas: (container, step) => renderMinDepthCanvas(container, step),
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 广度优先搜索层序最短路提前终止 (BFS)',
      shortName: 'BFS 提前终止',
      num: 2,
      codeLanguages: MIN_DEPTH_STAGE2_CODES,
      buildSteps: (inputs) => buildMinDepthStage2BfsSteps(parseAndBuild(inputs)),
      renderCanvas: (container, step) => renderMinDepthCanvas(container, step),
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 静态数组模拟队列 (Zuoshen Class 036)',
      shortName: '静态数组队列',
      num: 3,
      codeLanguages: MIN_DEPTH_STAGE3_CODES,
      buildSteps: (inputs) => buildMinDepthStage3StaticArraySteps(parseAndBuild(inputs)),
      renderCanvas: (container, step) => renderMinDepthCanvas(container, step),
    },
  ],
  generateSteps: (inputs) => buildMinDepthStage1Steps(parseAndBuild(inputs)),
  buildSteps: (inputs) => buildMinDepthStage1Steps(parseAndBuild(inputs)),
  renderCanvas: (container, step) => renderMinDepthCanvas(container, step),
});
