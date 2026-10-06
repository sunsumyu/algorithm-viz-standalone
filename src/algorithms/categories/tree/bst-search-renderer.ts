/**
 * 二叉搜索树中的搜索与插入 (Search in a BST · LeetCode 700 / 701)
 * 遵循 Matt Pocock 深模块哲学与 Thin Domain Adapter 架构 (LOC < 150 行)
 */

import { parseTreeArray } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { buildTreeFromArr as buildTree } from './tree-template';
import {
  BST_SEARCH_PROBLEM_HTML,
  BST_SEARCH_ANALYSIS_HTML,
  BST_SEARCH_CODE_LANGUAGES,
} from './bst-search-problem-content';
import {
  BST_SEARCH_STAGE1_ITERATIVE_CODE,
  BST_SEARCH_STAGE1_LINES,
  BST_SEARCH_STAGE2_RECURSIVE_CODE,
  BST_SEARCH_STAGE2_LINES,
  BST_SEARCH_STAGE3_INSERT_CODE,
  BST_SEARCH_STAGE3_LINES,
} from './bst-search-stage-codes';
import {
  BSTSStep,
  buildBSTSearchSteps,
  buildBstSearchStage2RecursiveSteps,
  buildBstSearchStage3InsertSteps,
} from '../../../core/renderers/adapters/bst-search-step-compiler';
import {
  BstSearchCanvasAdapter,
  renderBstSearchCanvas,
  renderBstSearchCustomMetrics,
} from '../../../core/renderers/adapters/bst-search-canvas-adapter';

export type { BSTSStep };
export {
  buildBSTSearchSteps,
  buildBstSearchStage2RecursiveSteps,
  buildBstSearchStage3InsertSteps,
  renderBstSearchCanvas,
  renderBstSearchCustomMetrics,
  BST_SEARCH_STAGE1_ITERATIVE_CODE,
  BST_SEARCH_STAGE1_LINES,
  BST_SEARCH_STAGE2_RECURSIVE_CODE,
  BST_SEARCH_STAGE2_LINES,
  BST_SEARCH_STAGE3_INSERT_CODE,
  BST_SEARCH_STAGE3_LINES,
};

export const BST_SEARCH_CODE_LINES = BST_SEARCH_STAGE1_LINES;

const parseInputs = (inputs?: Record<string, any>) => {
  const raw = inputs?.['input-tree'] || inputs?.['tree'] || '4, 2, 7, 1, 3';
  const arr = parseTreeArray(raw, [4, 2, 7, 1, 3]);
  const root = buildTree(arr);
  const target = parseInt(String(inputs?.['input-target'] ?? inputs?.['target'] ?? '2'), 10);
  return { root, target };
};

export const bstSearchVisualizer = registerDeclarativeAlgorithm<BSTSStep>({
  id: 'bst-search',
  aliases: ['leetcode-700', 'bst-search', 'bst-insert', 'leetcode-701', 'insert-into-a-binary-search-tree'],
  name: '二叉搜索树中的搜索与插入',
  category: 'tree',
  icon: '🔍',
  badge: { mode: '多阶段演化: 迭代剪枝 · 递归分治 · 动态插入', complexity: 'O(log N) · O(1)' },
  card1Title: '📊 BST 拓扑结构与检索路径沙盘',
  card2Title: '🧭 单向分支决策与查找状态监视器',
  card2Desc: '当前检查节点、目标比对关系与已走过检索路径',
  legend: [
    { label: '命中目标节点', color: '#16a34a' },
    { label: '新插入节点', color: '#8b5cf6' },
    { label: '搜索路径节点', color: '#fbbf24' },
    { label: '当前比对节点', color: '#3b82f6' },
  ],
  inputs: [
    { id: 'input-tree', label: 'BST 树层序', type: 'text', defaultValue: '4, 2, 7, 1, 3', width: '140px', placeholder: '4, 2, 7, 1, 3' },
    { id: 'input-target', label: '目标值 val', type: 'number', defaultValue: 2, width: '45px' },
  ],
  presets: [
    { label: '命中示例 (val=2)', values: { 'input-tree': '4, 2, 7, 1, 3', 'input-target': 2 } },
    { label: '不存在值 (val=5)', values: { 'input-tree': '4, 2, 7, 1, 3', 'input-target': 5 } },
    { label: '多层大型 BST (val=15)', values: { 'input-tree': '10, 5, 20, 3, 7, 15, 25', 'input-target': 15 } },
  ],
  metrics: [
    { id: 'cur-node', label: '当前比对节点', color: '#3b82f6' },
    { id: 'branch-decision', label: '分支转向决策', color: '#f59e0b' },
    { id: 'found-status', label: '搜索命中状态', color: '#16a34a' },
  ],
  codeLanguages: BST_SEARCH_CODE_LANGUAGES,
  problemHtml: BST_SEARCH_PROBLEM_HTML,
  analysisHtml: BST_SEARCH_ANALYSIS_HTML,
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 迭代单向剪枝查找 (Iterative BST Search · O(1) 空间)',
      shortName: '迭代剪枝',
      num: 1,
      badge: { mode: '迭代循环 · 零递归开销', complexity: 'O(log N) · O(1)' },
      card1Title: '📊 BST 迭代检索路径沙盘',
      card2Title: '🧭 单向分支决策与查找状态监视器',
      card2Desc: '当前检查节点、目标比对关系与已走过检索路径',
      codeLanguages: BST_SEARCH_STAGE1_ITERATIVE_CODE,
      buildSteps: (inputs) => buildBSTSearchSteps(parseInputs(inputs).root, parseInputs(inputs).target),
      renderCanvas: (c, s) => BstSearchCanvasAdapter.renderCanvas(c, s, 'stage-1'),
      renderCustomMetrics: BstSearchCanvasAdapter.renderCustomMetrics,
    },
    {
      id: 'stage-2',
      name: '阶段 2: 递归分支剪枝查找 (Recursive Divide & Conquer · O(H) 栈深度)',
      shortName: '递归分治',
      num: 2,
      badge: { mode: '递归分治 · 函数调用栈', complexity: 'O(log N) · O(H)' },
      card1Title: '🌲 BST 递归深入与分治拓扑沙盘',
      card2Title: '🧭 递归栈深度与分支下探监视器',
      card2Desc: '自顶向下分治递归，单向分支深入直到基底条件命中',
      codeLanguages: BST_SEARCH_STAGE2_RECURSIVE_CODE,
      buildSteps: (inputs) => buildBstSearchStage2RecursiveSteps(parseInputs(inputs).root, parseInputs(inputs).target),
      renderCanvas: (c, s) => BstSearchCanvasAdapter.renderCanvas(c, s, 'stage-2'),
      renderCustomMetrics: BstSearchCanvasAdapter.renderCustomMetrics,
    },
    {
      id: 'stage-3',
      name: '阶段 3: 搜索未命中定点动态插入 (BST Search & Insert · LC 701 读写闭环)',
      shortName: '动态插入',
      num: 3,
      badge: { mode: '寻路插入 · 读写闭环', complexity: 'O(log N) · O(1)' },
      card1Title: '🌱 动态插入与叶子槽位挂载沙盘',
      card2Title: '🧭 空槽位锁定与节点挂载监视器',
      card2Desc: '未命中时顺承下潜路径将新节点作为叶子挂载，维持全局单调性',
      codeLanguages: BST_SEARCH_STAGE3_INSERT_CODE,
      buildSteps: (inputs) => buildBstSearchStage3InsertSteps(parseInputs(inputs).root, parseInputs(inputs).target),
      renderCanvas: (c, s) => BstSearchCanvasAdapter.renderCanvas(c, s, 'stage-3'),
      renderCustomMetrics: BstSearchCanvasAdapter.renderCustomMetrics,
    },
  ],
  generateSteps: (inputs) => buildBSTSearchSteps(parseInputs(inputs).root, parseInputs(inputs).target),
  buildSteps: (inputs) => buildBSTSearchSteps(parseInputs(inputs).root, parseInputs(inputs).target),
  renderCanvas: (c, s) => BstSearchCanvasAdapter.renderCanvas(c, s, 'stage-1'),
  renderCustomMetrics: BstSearchCanvasAdapter.renderCustomMetrics,
});
