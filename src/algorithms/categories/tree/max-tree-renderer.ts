/**
 * LeetCode 654: 最大二叉树 (Maximum Binary Tree)
 * 采用顶层声明式架构与多阶段演化标准 (Multi-Stage Evolution)
 * Stage 1: 经典分治与区间扫描 | Stage 2: 单调栈 O(N) 笛卡尔树 | Stage 3: 显式任务栈迭代构建
 */

import { parseNumberList } from '../../../core/input-primitives';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  MAX_TREE_STAGE1_CODES,
  MAX_TREE_STAGE2_CODES,
  MAX_TREE_STAGE3_CODES,
} from './max-tree-stage-codes';
import {
  MAX_TREE_PROBLEM_HTML,
  MAX_TREE_ANALYSIS_HTML,
} from './max-tree-problem-content';
import {
  MaxTreeStep,
  collectTreeValues,
  buildMaxTreeStage1Steps,
  buildMaxTreeStage2StackSteps,
  buildMaxTreeStage3IterativeSteps,
  buildMaxTreeSteps,
} from '../../../core/renderers/adapters/max-tree-step-compiler';
import {
  MaxTreeCanvasAdapter,
  renderMaxTreeCanvas,
  renderStage1CustomMetrics,
  renderStage2CustomMetrics,
  renderStage3CustomMetrics,
} from '../../../core/renderers/adapters/max-tree-canvas-adapter';

// 重新导出类型契约、推演函数与渲染适配器，保证既有测试 100% 原始绿灯通过
export type { MaxTreeStep };
export {
  collectTreeValues,
  buildMaxTreeStage1Steps,
  buildMaxTreeStage2StackSteps,
  buildMaxTreeStage3IterativeSteps,
  buildMaxTreeSteps,
  renderMaxTreeCanvas,
  renderStage1CustomMetrics,
  renderStage2CustomMetrics,
  renderStage3CustomMetrics,
};

function parseNums(inputs?: Record<string, any>): number[] {
  return parseNumberList(inputs?.nums, [3, 2, 1, 6, 0, 5]);
}

// ============================================================
// 注册多阶段演化声明式算法
// ============================================================
registerDeclarativeAlgorithm<MaxTreeStep>({
  id: 'max-tree',
  name: '最大二叉树',
  category: 'tree',
  description: '根据数组构建最大二叉树：最大值作为根，递归构建左右子树',
  icon: '🌲',
  difficulty: 2,
  levelOrder: 654,
  aliases: ['leetcode-654', 'maximum-binary-tree'],
  learningGoal: '掌握分治扫描递归构建、笛卡尔树单调栈 O(N) 线性构建与显式任务栈模拟三大范式',
  inputs: [
    {
      id: 'nums',
      label: '输入整数数组',
      type: 'text',
      defaultValue: '3, 2, 1, 6, 0, 5',
      placeholder: '以逗号分隔，如 3, 2, 1, 6, 0, 5',
    },
  ],
  presets: [
    { label: '经典案例 [3,2,1,6,0,5]', values: { nums: '3, 2, 1, 6, 0, 5' } },
    { label: '递减斜链 [3,2,1]', values: { nums: '3, 2, 1' } },
    { label: '递增斜链 [1,2,3,4,5,6,7]', values: { nums: '1, 2, 3, 4, 5, 6, 7' } },
    { label: '锯齿多峰 [5,4,6,2,8,1,9]', values: { nums: '5, 4, 6, 2, 8, 1, 9' } },
  ],
  metrics: [
    { id: 'metric-mt-cur', label: '当前节点/焦点', color: '#38bdf8' },
    { id: 'metric-mt-max', label: '当前最值', color: '#c084fc' },
    { id: 'metric-mt-depth', label: '递归深度/栈深', color: '#10b981' },
    { id: 'metric-mt-range', label: '区间/阶段状态', color: '#f59e0b' },
  ],
  legend: [
    { label: '当前焦点', color: '#fbbf24' },
    { label: '最大值节点', color: '#c084fc' },
    { label: '扫描比对中', color: '#f59e0b' },
    { label: '已完成子树', color: '#34d399' },
  ],
  stages: [
    {
      id: 'stage-1-recursive',
      name: '阶段 1: 递归分治与区间线性扫描 (Recursive Divide & Conquer)',
      shortName: '递归分治',
      num: 1,
      badge: { mode: '分治递归 · 经典解法', complexity: 'O(N²) · O(N)' },
      card1Title: '🌲 最大二叉树分治拓扑沙盘',
      card2Title: '📐 区间最值扫描与递归调用推演栈',
      card2Desc: '分治子区间、最值定位、递归回溯树',
      codeLanguages: MAX_TREE_STAGE1_CODES,
      buildSteps: (inputs) => buildMaxTreeStage1Steps(parseNums(inputs)),
      renderCanvas: (c, s) => MaxTreeCanvasAdapter.renderCanvas(c, s),
      renderCustomMetrics: (c, s) => MaxTreeCanvasAdapter.renderStage1Metrics(c, s),
    },
    {
      id: 'stage-2-monotonic-stack',
      name: '阶段 2: 单调栈 O(N) 笛卡尔树构建 (Monotonic Stack Cartesian Tree)',
      shortName: '单调栈 O(N)',
      num: 2,
      badge: { mode: '单调递减栈 · 线性笛卡尔树', complexity: 'O(N) · O(N)' },
      card1Title: '🌲 单调栈笛卡尔树演进沙盘',
      card2Title: '🧭 单调递减栈槽与左右孩子挂载监视器',
      card2Desc: '弹出小元素挂左孩子、栈顶大元素挂右孩子、压栈',
      codeLanguages: MAX_TREE_STAGE2_CODES,
      buildSteps: (inputs) => buildMaxTreeStage2StackSteps(parseNums(inputs)),
      renderCanvas: (c, s) => MaxTreeCanvasAdapter.renderCanvas(c, s),
      renderCustomMetrics: (c, s) => MaxTreeCanvasAdapter.renderStage2Metrics(c, s),
    },
    {
      id: 'stage-3-explicit-stack',
      name: '阶段 3: 显式任务栈迭代构建 (Explicit Construction Stack)',
      shortName: '显式栈模拟',
      num: 3,
      badge: { mode: '显式任务栈 · 防递归溢出', complexity: 'O(N²) · O(N)' },
      card1Title: '🌲 迭代显式任务栈拓扑沙盘',
      card2Title: '🧱 TaskStack 任务队列与子区间调度',
      card2Desc: '模拟调用栈、弹出父子连接任务、区间拆分压栈',
      codeLanguages: MAX_TREE_STAGE3_CODES,
      buildSteps: (inputs) => buildMaxTreeStage3IterativeSteps(parseNums(inputs)),
      renderCanvas: (c, s) => MaxTreeCanvasAdapter.renderCanvas(c, s),
      renderCustomMetrics: (c, s) => MaxTreeCanvasAdapter.renderStage3Metrics(c, s),
    },
  ],
  problemHtml: MAX_TREE_PROBLEM_HTML,
  analysisHtml: MAX_TREE_ANALYSIS_HTML,
  generateSteps: (inputs) => buildMaxTreeStage1Steps(parseNums(inputs)),
  buildSteps: (inputs) => buildMaxTreeStage1Steps(parseNums(inputs)),
  renderCanvas: (c, s) => MaxTreeCanvasAdapter.renderCanvas(c, s),
  renderCustomMetrics: (c, s) => MaxTreeCanvasAdapter.renderStage1Metrics(c, s),
});
