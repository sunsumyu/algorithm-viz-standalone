/**
 * 二叉树所有路径轻量领域适配器 (Thin Domain Adapter · LeetCode 257)
 * 遵循 Matt Pocock 深模块规范 (LOC < 150 行)，推演编译与画布呈现委托至统一深模块：
 *   - AllPathsStepCompiler (推演步进编译器)
 *   - AllPathsCanvasAdapter (拓扑画布与看板呈现适配器)
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { parseTreeArray } from '../../../core/input-primitives';
import { TreeNode, buildTreeFromArr } from './tree-template';
import { ALL_PATHS_STAGE1_CODES, ALL_PATHS_STAGE2_CODES, ALL_PATHS_STAGE3_CODES } from './all-paths-stage-codes';
import { ALL_PATHS_PROBLEM_HTML, ALL_PATHS_ANALYSIS_HTML } from './all-paths-problem-content';
import {
  AllPathsStepCompiler,
  AllPathsStep,
  collectTreeValues,
  buildAllPathsStage1BacktrackSteps,
  buildAllPathsStage2FunctionalSteps,
  buildAllPathsStage3BfsSteps,
  buildAllPathsSteps,
} from '../../../core/renderers/adapters/all-paths-step-compiler';
import {
  AllPathsCanvasAdapter,
  renderAllPathsCanvas,
  renderAllPathsCustomMetrics,
} from '../../../core/renderers/adapters/all-paths-canvas-adapter';

// 向后兼容导出
export type { AllPathsStep };
export {
  AllPathsStepCompiler,
  collectTreeValues,
  buildAllPathsStage1BacktrackSteps,
  buildAllPathsStage2FunctionalSteps,
  buildAllPathsStage3BfsSteps,
  buildAllPathsSteps,
  AllPathsCanvasAdapter,
  renderAllPathsCanvas,
  renderAllPathsCustomMetrics,
};

function parseTree(inputs?: Record<string, any>): TreeNode | null {
  const raw = inputs?.tree || '1, 2, 3, null, 5';
  const arr = parseTreeArray(raw, [1, 2, 3, null, 5]);
  return buildTreeFromArr(arr);
}

export const allPathsVisualizer = registerDeclarativeAlgorithm<AllPathsStep>({
  id: 'all-paths',
  name: '二叉树所有路径',
  category: 'tree',
  icon: '🛤️',
  difficulty: 1,
  levelOrder: 257,
  aliases: ['leetcode-257', 'binary-tree-paths'],
  learningGoal: '掌握回溯法收集路径的经典范式，对比显式栈回溯、纯函数不可变字符串传递与 BFS 双队列层序遍历',
  timeComplexity: 'O(N)',
  spaceComplexity: 'O(N)',
  inputs: [
    { id: 'tree', label: '二叉树层序数组', type: 'text', defaultValue: '1, 2, 3, null, 5', placeholder: '例如: 1, 2, 3, null, 5' },
  ],
  presets: [
    { label: 'LeetCode 示例 1: [1, 2, 3, null, 5] (2条路径)', values: { tree: '1, 2, 3, null, 5' }, description: '生成两条路径："1->2->5" 和 "1->3"' },
    { label: 'LeetCode 示例 2: 单节点树 [1] (1条路径)', values: { tree: '1' }, description: '仅含根节点，路径为 "1"' },
    { label: '满二叉树: [1, 2, 3, 4, 5, 6, 7] (4条路径)', values: { tree: '1, 2, 3, 4, 5, 6, 7' }, description: '生成 4 条到达底层叶子的路径' },
    { label: '单链倾斜树: [1, 2, null, 3, null, 4] (1条路径)', values: { tree: '1, 2, null, 3, null, 4' }, description: '单侧退化链，生成单条深层路径' },
  ],
  metrics: [
    { id: 'cur', label: '考察节点', color: '#fbbf24' },
    { id: 'depth', label: '当前深度', color: '#60a5fa' },
    { id: 'path', label: '动态路径', color: '#a78bfa' },
    { id: 'result', label: '已收获数', color: '#34d399' },
  ],
  card1Title: '📊 二叉树拓扑与全路径探索沙盘',
  card2Title: '🧭 动态路径栈与 DFS 递归推演栈',
  card2Desc: '实时监视当前候选路径栈的压入/弹出现场与完整路径收集记录',
  stages: [
    {
      id: 'stage-1',
      name: 'Stage 1: 回溯法 DFS 递归与显式路径栈',
      shortName: '显式回溯栈',
      num: 1,
      badge: { mode: '显式回溯 · 动态栈管理', complexity: 'O(N) · O(H)' },
      card1Title: '📊 二叉树拓扑与回溯路径沙盘',
      card2Title: '🧭 显式路径栈与 DFS 递归推演栈',
      codeLanguages: ALL_PATHS_STAGE1_CODES,
      buildSteps: (inputs) => buildAllPathsStage1BacktrackSteps(parseTree(inputs)),
      renderCanvas: renderAllPathsCanvas,
      renderCustomMetrics: renderAllPathsCustomMetrics,
    },
    {
      id: 'stage-2',
      name: 'Stage 2: 纯函数递归与不可变字符串传递',
      shortName: '纯函数不可变串',
      num: 2,
      badge: { mode: '纯函数式 · 天然参数隔离', complexity: 'O(N) · O(H)' },
      card1Title: '📊 二叉树拓扑与函数参数流沙盘',
      card2Title: '🧭 不可变字符串参数流与路径收集集',
      codeLanguages: ALL_PATHS_STAGE2_CODES,
      buildSteps: (inputs) => buildAllPathsStage2FunctionalSteps(parseTree(inputs)),
      renderCanvas: renderAllPathsCanvas,
      renderCustomMetrics: renderAllPathsCustomMetrics,
    },
    {
      id: 'stage-3',
      name: 'Stage 3: 广度优先搜索双队列层序遍历',
      shortName: 'BFS 双队列',
      num: 3,
      badge: { mode: '广度优先 · 节点与路径同步出入队', complexity: 'O(N) · O(N)' },
      card1Title: '📊 二叉树拓扑与层序遍历沙盘',
      card2Title: '🧭 BFS 双队列状态与叶子路径收集',
      codeLanguages: ALL_PATHS_STAGE3_CODES,
      buildSteps: (inputs) => buildAllPathsStage3BfsSteps(parseTree(inputs)),
      renderCanvas: renderAllPathsCanvas,
      renderCustomMetrics: renderAllPathsCustomMetrics,
    },
  ],
  codeLanguages: ALL_PATHS_STAGE1_CODES,
  problemHtml: ALL_PATHS_PROBLEM_HTML,
  analysisHtml: ALL_PATHS_ANALYSIS_HTML,
  generateSteps: (inputs) => buildAllPathsStage1BacktrackSteps(parseTree(inputs)),
  buildSteps: (inputs) => buildAllPathsStage1BacktrackSteps(parseTree(inputs)),
  renderCanvas: renderAllPathsCanvas,
  renderCustomMetrics: renderAllPathsCustomMetrics,
});
