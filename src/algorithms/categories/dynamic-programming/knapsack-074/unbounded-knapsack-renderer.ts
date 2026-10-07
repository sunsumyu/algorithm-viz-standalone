/**
 * 完全背包模版 (洛谷 P1616 疯狂的采药) - 声明式 4-Card 沙盘渲染器
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  UNBOUNDED_KNAPSACK_PROBLEM_HTML,
  UNBOUNDED_KNAPSACK_ANALYSIS_HTML,
  UNBOUNDED_KNAPSACK_CODE_LANGUAGES,
} from './knapsack-074-problem-content';
import {
  createUnboundedKnapsackStages,
  renderUnboundedKnapsackCanvas,
  renderUnboundedKnapsackMetrics,
} from '../../../../core/renderers/adapters/unbounded-knapsack-canvas-adapter';
import {
  buildUnboundedKnapsackSteps,
  parseUnboundedKnapsackInputs,
  type UnboundedKnapsackStep,
} from '../../../../core/renderers/adapters/unbounded-knapsack-step-compiler';

export { buildUnboundedKnapsackSteps, parseUnboundedKnapsackInputs };
export type { UnboundedKnapsackStep };

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'unbounded-knapsack-standard',
  name: '完全背包模版 (疯狂的采药)',
  category: 'dynamic-programming',
  badge: {
    mode: '完全背包 · 正序空间压缩',
    complexity: 'O(M · T) · O(T)',
  },
  defaultStage: 'stage-4',
  stages: createUnboundedKnapsackStages(),
  card1Title: '🌿 草药资源库与正序推进沙盘',
  card2Title: '📊 滚动收益向量 dp[j] 监视器',
  card2Desc: '展示正序容量枚举下，同一草药在同一轮中可以被连续多次装入的累加过程',
  legend: [
    { label: '未装入草药', color: '#475569' },
    { label: '当前考察草药', color: '#f59e0b' },
    { label: '带来更优更新', color: '#10b981' },
  ],
  inputs: [
    { id: 'input-t', label: '总时间 T (容量)', type: 'number', defaultValue: 70, width: '60px' },
    { id: 'input-costs', label: '耗时数组 costs', type: 'text', defaultValue: '71, 23', width: '120px' },
    { id: 'input-vals', label: '价值数组 values', type: 'text', defaultValue: '100, 10', width: '120px' },
  ],
  presets: [
    {
      label: '洛谷经典案例 (T=70, 耗时[71,23], 价值[100,10], Ans=30)',
      values: { 'input-t': 70, 'input-costs': '71, 23', 'input-vals': '100, 10' },
    },
    {
      label: '多草药多重选择 (T=10, 耗时[2,3,5], 价值[5,8,14], Ans=26)',
      values: { 'input-t': 10, 'input-costs': '2, 3, 5', 'input-vals': '5, 8, 14' },
    },
  ],
  metrics: [
    { id: 'metric-cur-item', label: '当前草药', color: '#f59e0b' },
    { id: 'metric-cur-j', label: '当前时间点 j', color: '#38bdf8' },
    { id: 'metric-direction', label: '压缩方向', color: '#8b5cf6' },
    { id: 'metric-max-val', label: '当前最大收益', color: '#10b981' },
  ],
  codeLanguages: UNBOUNDED_KNAPSACK_CODE_LANGUAGES,
  problemHtml: UNBOUNDED_KNAPSACK_PROBLEM_HTML,
  analysisHtml: UNBOUNDED_KNAPSACK_ANALYSIS_HTML,
  buildSteps: (inputs: Record<string, any>) => {
    const { t, cost, val } = parseUnboundedKnapsackInputs(inputs);
    return buildUnboundedKnapsackSteps(t, cost, val);
  },
  renderCanvas: renderUnboundedKnapsackCanvas,
  renderCustomMetrics: renderUnboundedKnapsackMetrics,
});

export const UnboundedKnapsackVisualizer = Visualizer;

registerAlgorithm({
  id: 'unbounded-knapsack-standard',
  name: '完全背包模版 (疯狂的采药)',
  viewId: 'algo-unbounded-knapsack-standard-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 074 Code03：洛谷 P1616 疯狂的采药，每件物品可选任意次，空间压缩后正序枚举容量 j',
  icon: '🌿',
  aliases: ['class074-code03', 'unbounded-knapsack-074', 'unbounded-knapsack', 'complete-knapsack', 'luogu-p1616'],
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 86,
  learningGoal: '深刻理解完全背包与 01 背包空间压缩的本质区别：正序从小到大枚举容量使得物品可同轮无限次自叠加',
});
