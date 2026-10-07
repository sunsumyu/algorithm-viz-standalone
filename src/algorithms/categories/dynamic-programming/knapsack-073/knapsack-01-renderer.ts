/**
 * 01背包模版 (洛谷 P1048 采药) - 声明式 4-Card 沙盘渲染器
 * 薄领域适配器 (Thin Domain Adapter)
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  KNAPSACK_01_PROBLEM_HTML,
  KNAPSACK_01_ANALYSIS_HTML,
  KNAPSACK_01_CODE_LANGUAGES,
} from './knapsack-073-problem-content';
import {
  renderKnapsackSandbox,
  renderKnapsackDpMatrix,
  createKnapsack01Stages,
} from '../../../../core/renderers/adapters/knapsack-01-canvas-adapter';
import {
  buildKnapsack01Steps,
  parseKnapsack01Inputs,
  type Knapsack01Step,
} from '../../../../core/renderers/adapters/knapsack-01-step-compiler';

export { buildKnapsack01Steps, parseKnapsack01Inputs };
export type { Knapsack01Step };

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'knapsack-01-standard',
  name: '01背包模版 (采药)',
  category: 'dynamic-programming',
  badge: {
    mode: '01背包 · 倒序压缩',
    complexity: 'O(M · T) · O(T)',
  },
  defaultStage: 'stage-4',
  stages: createKnapsack01Stages(),
  inputs: [
    { id: 'input-capacity', label: '背包总容量 T', type: 'number', defaultValue: 70, width: '60px' },
    { id: 'input-costs', label: '耗时/体积 costs', type: 'text', defaultValue: '71, 69, 1', width: '120px' },
    { id: 'input-vals', label: '价值 values', type: 'text', defaultValue: '100, 1, 2', width: '120px' },
  ],
  presets: [
    {
      label: '洛谷经典案例 (T=70, 体积[71,69,1], 价值[100,1,2], Ans=3)',
      values: { 'input-capacity': 70, 'input-costs': '71, 69, 1', 'input-vals': '100, 1, 2' },
    },
    {
      label: '充分选择案例 (T=10, 体积[2,3,5,7], 价值[3,4,8,10], Ans=15)',
      values: { 'input-capacity': 10, 'input-costs': '2, 3, 5, 7', 'input-vals': '3, 4, 8, 10' },
    },
  ],
  metrics: [
    { id: 'metric-cur-item', label: '当前考察物品', color: '#f59e0b' },
    { id: 'metric-cur-capacity', label: '当前容量 j', color: '#38bdf8' },
    { id: 'metric-max-val', label: '实时最大收益', color: '#10b981' },
    { id: 'metric-status', label: '当前状态', color: '#a855f7' },
  ],
  codeLanguages: KNAPSACK_01_CODE_LANGUAGES,
  problemHtml: KNAPSACK_01_PROBLEM_HTML,
  analysisHtml: KNAPSACK_01_ANALYSIS_HTML,
  buildSteps: (inputs: Record<string, any>) => {
    const { t, costs, vals } = parseKnapsack01Inputs(inputs);
    return buildKnapsack01Steps(t, costs, vals);
  },
  renderCanvas: (container, step) => {
    renderKnapsackSandbox(container, step, {
      title: '🎒 实时背包载荷与草药货架',
      isPartitioned: false,
    });
  },
  renderCustomMetrics: (container, step) => {
    renderKnapsackDpMatrix(container, step, `一维滚动状态向量 dp[0..${step.dp.length - 1}]`);
  },
});

export const Knapsack01Visualizer = Visualizer;

registerAlgorithm({
  id: 'knapsack-01-standard',
  name: '01背包模版 (采药)',
  viewId: 'algo-knapsack-01-standard-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 073 Code01：洛谷 P1048 采药，经典 01 背包与滚动数组倒序空间压缩',
  icon: '🎒',
  aliases: ['class073-code01', 'knapsack-01-073', 'knapsack-01', 'luogu-p1048'],
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 77,
  learningGoal: '掌握 01 背包状态定义、转移方程推导及一维空间压缩中容量倒序枚举的核心原理',
});
