/**
 * 多重背包朴素枚举 (洛谷 P1776 宝物筛选) - 声明式 4-Card 沙盘渲染器
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import { registerAlgorithm } from '../../../../core/registry';
import { KNAPSACK_075_PROBLEMS } from './knapsack-075-problem-content';
import {
  buildBoundedKnapsackNaiveSteps,
  parseNaiveInputs,
  type BoundedKnapsackNaiveStep,
  type BoundedNaiveTake,
} from '../../../../core/renderers/adapters/bounded-knapsack-naive-step-compiler';
import {
  renderBoundedNaiveSandbox,
  renderBoundedNaiveVectorMatrix,
  createBoundedNaiveStages,
} from '../../../../core/renderers/adapters/bounded-knapsack-naive-canvas-adapter';

export { buildBoundedKnapsackNaiveSteps, parseNaiveInputs };
export type { BoundedKnapsackNaiveStep, BoundedNaiveTake };

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'bounded-knapsack-naive',
  name: '多重背包朴素枚举 (洛谷 P1776 宝物筛选)',
  category: 'dynamic-programming',
  badge: {
    mode: '多重背包 · 三重循环',
    complexity: 'O(W · Σc) · O(W)',
  },
  card1Title: '📦 宝物库品类陈列与实时背包载荷舱',
  card2Title: '📈 动态规划收益向量 dp[j] 监视器',
  card2Desc: '展示三重循环朴素枚举每种宝物件数 k 状态转移过程与倒序容量空间压缩',
  legend: [
    { label: '未装入宝物', color: '#475569' },
    { label: '已入选宝物', color: '#10b981' },
    { label: '当前考察宝物', color: '#818cf8' },
  ],
  inputs: [
    { id: 'input-t', label: 't:', type: 'number', defaultValue: 10, width: '42px' },
    { id: 'input-v', label: 'v:', type: 'text', defaultValue: '3, 4, 7', width: '70px' },
    { id: 'input-w', label: 'w:', type: 'text', defaultValue: '2, 3, 5', width: '70px' },
    { id: 'input-c', label: 'c:', type: 'text', defaultValue: '2, 3, 2', width: '70px' },
  ],
  presets: [
    {
      label: '洛谷经典案例 (t=10, 3种宝物, Ans=14)',
      values: { 'input-t': 10, 'input-v': '3, 4, 7', 'input-w': '2, 3, 5', 'input-c': '2, 3, 2' },
    },
    {
      label: '小容量多件案例 (t=8, v=[2,3], w=[2,3], c=[3,2], Ans=8)',
      values: { 'input-t': 8, 'input-v': '2, 3', 'input-w': '2, 3', 'input-c': '3, 2' },
    },
  ],
  metrics: [
    { id: 'metric-cur-item', label: '当前宝物品类', color: '#818cf8' },
    { id: 'metric-cur-k', label: '当前尝试件数 k', color: '#f59e0b' },
    { id: 'metric-cur-j', label: '当前考察容量 j', color: '#38bdf8' },
    { id: 'metric-max-val', label: '最大总价值', color: '#10b981' },
  ],
  codeLanguages: KNAPSACK_075_PROBLEMS['bounded-knapsack-naive'].codeLanguages,
  problemHtml: KNAPSACK_075_PROBLEMS['bounded-knapsack-naive'].problemHtml,
  analysisHtml: KNAPSACK_075_PROBLEMS['bounded-knapsack-naive'].analysisHtml,
  defaultStage: 'stage-4',
  stages: createBoundedNaiveStages(),
  buildSteps: (inputs: Record<string, any>) => buildBoundedKnapsackNaiveSteps(inputs),
  renderCanvas: (container, step) => renderBoundedNaiveSandbox(container, step),
  renderCustomMetrics: (container, step) => renderBoundedNaiveVectorMatrix(container, step),
});

export const BoundedKnapsackNaiveVisualizer = Visualizer;

registerAlgorithm({
  id: 'bounded-knapsack-naive',
  name: '多重背包朴素枚举 (洛谷 P1776 宝物筛选)',
  viewId: 'algo-bounded-knapsack-naive-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 075 Code01：洛谷 P1776 宝物筛选，多重背包基准朴素三重循环枚举每种物品件数 k',
  icon: '📦',
  aliases: ['class075-code01', 'bounded-knapsack-naive-075', 'multiple-knapsack-naive', 'luogu-p1776-naive'],
  template,
  Visualizer,
  difficulty: 2,
  levelOrder: 90,
  learningGoal: '理解多重背包的严格定义、三重循环朴素枚举的运行轨迹与向空间压缩的一维转化',
});
