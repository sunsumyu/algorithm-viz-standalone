/**
 * 多重背包单调队列优化 (洛谷 P1776 极速最优解) - 声明式 4-Card 沙盘渲染器
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { KNAPSACK_075_PROBLEMS } from './knapsack-075-problem-content';
import {
  buildBoundedKnapsackMonoQueueSteps,
  parseMonoQueueInputs,
  type BoundedKnapsackMonoQueueStep,
} from '../../../../core/renderers/adapters/bounded-knapsack-monotonic-queue-step-compiler';
import {
  renderMonoQueueSandbox,
  renderMonoQueueVectorMatrix,
  createBoundedMonoQueueStages,
} from '../../../../core/renderers/adapters/bounded-knapsack-monotonic-queue-canvas-adapter';

export { buildBoundedKnapsackMonoQueueSteps, parseMonoQueueInputs };
export type { BoundedKnapsackMonoQueueStep };

const { template, Visualizer } = createDeclarativeVisualizer<BoundedKnapsackMonoQueueStep | any>({
  id: 'bounded-knapsack-monotonic-queue',
  name: '多重背包单调队列优化 (洛谷 P1776 极速最优解)',
  category: 'dynamic-programming',
  badge: {
    mode: '多重背包 · 单调队列 O(NW)',
    complexity: 'O(N · W) · O(W)',
  },
  card1Title: '⚡ 同余链划分与双端单调队列滑动窗口',
  card2Title: '📈 动态规划收益向量 dp[0..W] (滑窗高亮)',
  card2Desc: '展示利用模同余分组将状态转移映射为滑动窗口最值、队列单调递减出入队的线性推演',
  legend: [
    { label: '普通容量点', color: '#334155' },
    { label: '位于滑窗内点', color: '#10b981' },
    { label: '当前考察容量 j', color: '#38bdf8' },
  ],
  inputs: [
    { id: 'input-t', label: '容量 t:', type: 'number', defaultValue: 15, width: '55px' },
    { id: 'input-v', label: '价值 v:', type: 'text', defaultValue: '3, 4, 7, 8', width: '110px' },
    { id: 'input-w', label: '重量 w:', type: 'text', defaultValue: '2, 3, 5, 6', width: '110px' },
    { id: 'input-c', label: '数量 c:', type: 'text', defaultValue: '2, 3, 2, 2', width: '110px' },
  ],
  presets: [
    {
      label: '经典压测案例 (t=15, 4种物品, Ans=21)',
      values: { 'input-t': 15, 'input-v': '3, 4, 7, 8', 'input-w': '2, 3, 5, 6', 'input-c': '2, 3, 2, 2' },
    },
    {
      label: '同余长链案例 (t=12, v=[2,5], w=[2,3], c=[3,2], Ans=14)',
      values: { 'input-t': 12, 'input-v': '2, 5', 'input-w': '2, 3', 'input-c': '3, 2' },
    },
  ],
  metrics: [
    { id: 'metric-cur-mod', label: '当前同余链', color: '#818cf8' },
    { id: 'metric-cur-j', label: '当前容量 j', color: '#38bdf8' },
    { id: 'metric-queue-head', label: '单调队头最优 pos', color: '#22c55e' },
    { id: 'metric-max-val', label: '最大总价值', color: '#10b981' },
  ],
  codeLanguages: KNAPSACK_075_PROBLEMS['bounded-knapsack-monotonic-queue'].codeLanguages,
  problemHtml: KNAPSACK_075_PROBLEMS['bounded-knapsack-monotonic-queue'].problemHtml,
  analysisHtml: KNAPSACK_075_PROBLEMS['bounded-knapsack-monotonic-queue'].analysisHtml,
  defaultStage: 'stage-4',
  stages: createBoundedMonoQueueStages(),
  buildSteps: (inputs: Record<string, any>) => buildBoundedKnapsackMonoQueueSteps(inputs),
  renderCanvas: (container, step) => renderMonoQueueSandbox(container, step),
  renderCustomMetrics: (container, step) => renderMonoQueueVectorMatrix(container, step),
});

export const BoundedKnapsackMonoQueueVisualizer = Visualizer;

registerAlgorithm({
  id: 'bounded-knapsack-monotonic-queue',
  name: '多重背包单调队列优化 (洛谷 P1776 极速最优解)',
  viewId: 'algo-bounded-knapsack-monotonic-queue-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 075 Code03：洛谷 P1776 宝物筛选，利用同余链将转移转化为滑动窗口最值，单调队列将时间复杂度彻底压至 O(N · W) 理论极境',
  icon: '⚡',
  aliases: ['class075-code03', 'bounded-knapsack-mono-queue', 'bounded-knapsack-monotonic-queue-075', 'luogu-p1776-mono-queue'],
  template,
  Visualizer,
  difficulty: 3,
  levelOrder: 92,
  learningGoal: '掌握同余分组将背包转移转化为滑动窗口最值的数学推导，精通单调队列在动态规划中的降维打击应用',
});
