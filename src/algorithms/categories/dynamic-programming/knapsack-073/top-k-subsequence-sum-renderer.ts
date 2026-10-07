/**
 * 非负数组前k个最小的子序列累加和 (Top K Subsequence Sum) - 声明式 4-Card 沙盘渲染器
 * 核心：大容量数据超越 01 背包限制，使用小根堆/优先队列 O(N log N + K log K) 状态机高效扩展
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  TOP_K_SUBSEQUENCE_SUM_PROBLEM_HTML,
  TOP_K_SUBSEQUENCE_SUM_ANALYSIS_HTML,
  TOP_K_SUBSEQUENCE_SUM_CODE_LANGUAGES,
} from './knapsack-073-problem-content';
import {
  buildTopKSubsequenceSumSteps,
  parseTopKInputs,
  type TopKStep,
} from '../../../../core/renderers/adapters/top-k-subsequence-sum-step-compiler';
import {
  renderTopKBoard,
  renderTopKMetrics,
} from '../../../../core/renderers/adapters/top-k-subsequence-sum-canvas-adapter';

export { buildTopKSubsequenceSumSteps, parseTopKInputs };
export type { TopKStep };

const { template, Visualizer } = createDeclarativeVisualizer<TopKStep>({
  id: 'top-k-subsequence-sum',
  name: '非负数组前k个最小子序列和',
  category: 'dynamic-programming',
  badge: {
    mode: '小根堆状态机 · O(NlogN+KlogK)',
    complexity: 'O(N log N + K log K) · O(K)',
  },
  card1Title: '排序数组与小根堆两路后继扩展沙盘',
  card2Title: '已生成的 Top-K 最小和单调队列监视器',
  card2Desc: '展示小根堆弹出最小和、分两路（替换当前/追加下一个）无遗漏不重复扩展状态',
  legend: [
    { label: '小根堆普通节点', color: '#334155' },
    { label: '👑 当前堆顶最小', color: '#10b981' },
    { label: '🌱 新推入分支', color: '#f59e0b' },
  ],
  inputs: [
    { id: 'input-k', label: '目标 K', type: 'number', defaultValue: 6, width: '50px' },
    { id: 'input-nums', label: '非负数组 nums', type: 'text', defaultValue: '1, 3, 6, 8', width: '140px' },
  ],
  presets: [
    {
      label: '经典案例 (nums=[1,3,6,8], K=6)',
      values: { 'input-k': 6, 'input-nums': '1, 3, 6, 8' },
    },
    {
      label: '密集较小数值用例 (nums=[2,4,7], K=8)',
      values: { 'input-k': 8, 'input-nums': '2, 4, 7' },
    },
  ],
  metrics: [
    { id: 'metric-collected-count', label: '已收集数量', color: '#38bdf8' },
    { id: 'metric-heap-size', label: '堆内有效节点数', color: '#8b5cf6' },
    { id: 'metric-popped-item', label: '本步堆顶弹出', color: '#10b981' },
    { id: 'metric-latest-sum', label: '最新入榜累加和', color: '#f59e0b' },
  ],
  codeLanguages: TOP_K_SUBSEQUENCE_SUM_CODE_LANGUAGES,
  problemHtml: TOP_K_SUBSEQUENCE_SUM_PROBLEM_HTML,
  analysisHtml: TOP_K_SUBSEQUENCE_SUM_ANALYSIS_HTML,
  buildSteps: (inputs: Record<string, any>) => {
    const { k, nums } = parseTopKInputs(inputs);
    return buildTopKSubsequenceSumSteps(nums, k);
  },
  renderCanvas: (container, step) => renderTopKBoard(container, step),
  renderCustomMetrics: (container, step) => renderTopKMetrics(container, step),
});

export const TopKSubsequenceSumVisualizer = Visualizer;

registerAlgorithm({
  id: 'top-k-subsequence-sum',
  name: '非负数组前k个最小子序列和',
  viewId: 'algo-top-k-subsequence-sum-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 073 Code06：非负数组前k个最小子序列和，小根堆状态机 O(NlogN + KlogK) 两路扩展最优解',
  icon: '🌲',
  aliases: ['class073-code06', 'top-k-subsequence-sum-073', 'top-k-subsequence-sum-problem'],
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 82,
  learningGoal: '掌握超越 01 背包容量限制的小根堆两路状态机生成模型',
});
