/**
 * 找出数组的第K大和 (LeetCode 2386) - 声明式 4-Card 沙盘渲染器
 * 核心：正负数分离基准 + 绝对值数组映射 + 归约为前 K 小和堆优化
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  FIND_KTH_SUM_PROBLEM_HTML,
  FIND_KTH_SUM_ANALYSIS_HTML,
  FIND_KTH_SUM_CODE_LANGUAGES,
} from './knapsack-073-problem-content';
import {
  buildFindKthSumSteps,
  parseFindKthInputs,
  type FindKthStep,
} from '../../../../core/renderers/adapters/find-kth-sum-step-compiler';
import {
  renderFindKthBoard,
  renderFindKthMetrics,
} from '../../../../core/renderers/adapters/find-kth-sum-canvas-adapter';

export { buildFindKthSumSteps, parseFindKthInputs };
export type { FindKthStep };

const { template, Visualizer } = createDeclarativeVisualizer<FindKthStep>({
  id: 'find-kth-sum',
  name: '找出数组的第K大和 (LeetCode 2386)',
  category: 'dynamic-programming',
  badge: {
    mode: '绝对值归约 · 小根堆',
    complexity: 'O(N log N + K log K) · O(K)',
  },
  card1Title: '原数组/绝对值映射与小根堆状态机沙盘',
  card2Title: '绝对值损失量与第K大和对决监视器',
  card2Desc: '展示利用 maxSum 减去绝对值数组的第 K 小累加和，将负数处理彻底消解的数学归约过程',
  legend: [
    { label: '普通堆节点', color: '#334155' },
    { label: '👑 当前堆顶损失量', color: '#10b981' },
    { label: '绝对值映射项', color: '#38bdf8' },
  ],
  inputs: [
    { id: 'input-k', label: '目标 K', type: 'number', defaultValue: 5, width: '50px' },
    { id: 'input-nums', label: '含负数数组 nums', type: 'text', defaultValue: '2, 4, -2', width: '140px' },
  ],
  presets: [
    {
      label: 'LeetCode 样例 (nums=[2,4,-2], K=5, Ans=2)',
      values: { 'input-k': 5, 'input-nums': '2, 4, -2' },
    },
    {
      label: '较大范围正负用例 (nums=[1,-2,3,4,-10,12], K=16)',
      values: { 'input-k': 16, 'input-nums': '1, -2, 3, 4, -10, 12' },
    },
  ],
  metrics: [
    { id: 'metric-max-sum', label: '全局最大和 maxSum', color: '#10b981' },
    { id: 'metric-cur-k', label: '当前推演顺位', color: '#38bdf8' },
    { id: 'metric-abs-val', label: '第K小绝对值损失', color: '#f59e0b' },
    { id: 'metric-ans-kth', label: '第 K 大子序列和', color: '#a855f7' },
  ],
  codeLanguages: FIND_KTH_SUM_CODE_LANGUAGES,
  problemHtml: FIND_KTH_SUM_PROBLEM_HTML,
  analysisHtml: FIND_KTH_SUM_ANALYSIS_HTML,
  buildSteps: (inputs: Record<string, any>) => {
    const { k, nums } = parseFindKthInputs(inputs);
    return buildFindKthSumSteps(nums, k);
  },
  renderCanvas: (container, step) => renderFindKthBoard(container, step),
  renderCustomMetrics: (container, step) => renderFindKthMetrics(container, step),
});

export const FindKthSumVisualizer = Visualizer;

registerAlgorithm({
  id: 'find-kth-sum',
  name: '找出数组的第K大和 (LeetCode 2386)',
  viewId: 'algo-find-kth-sum-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 073 Code07：LeetCode 2386 找出数组的第K大和，正负数分离基准 + 绝对值数组映射 + 归约为前 K 小和堆优化',
  icon: '🔍',
  aliases: ['class073-code07', 'find-kth-sum-073', 'find-the-k-sum-of-an-array', 'leetcode-2386'],
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 83,
  learningGoal: '深刻理解全局最大和作为基准的代数推导、损失量绝对值映射与小根堆极速求解',
});
