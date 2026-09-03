/**
 * 完全背包模版 (洛谷 P1616 疯狂的采药) - 声明式 4-Card 沙盘渲染器
 * 核心：每种物品可选任意次，空间压缩后【正序】枚举容量 j，允许当轮重复累加
 * 架构重构：采用通用背包推演深模块 KnapsackExecutionEngine 与沙盘载荷舱组件 KnapsackSandboxStage
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  UNBOUNDED_KNAPSACK_PROBLEM_HTML,
  UNBOUNDED_KNAPSACK_ANALYSIS_HTML,
  UNBOUNDED_KNAPSACK_CODE_LANGUAGES,
} from './knapsack-074-problem-content';
import {
  runKnapsackEngine,
  KnapsackExecutionStep,
  KnapsackItem,
} from '../../../../core/knapsack-execution-engine';
import {
  renderKnapsackSandbox,
  renderKnapsackDpMatrix,
} from '../../../../core/renderers/knapsack-sandbox-stage';

export interface UnboundedKnapsackStep extends KnapsackExecutionStep {
  cost: number[];
  val: number[];
  totalTime: number;
}

export function buildUnboundedKnapsackSteps(
  totalTime: number,
  cost: number[],
  val: number[]
): UnboundedKnapsackStep[] {
  const m = Math.min(cost.length, val.length);
  const items: KnapsackItem[] = [];
  for (let i = 0; i < m; i++) {
    items.push({ cost: cost[i], val: val[i], id: i + 1, name: `草药 #${i + 1}` });
  }

  const engineSteps = runKnapsackEngine({
    type: 'unbounded',
    capacity: totalTime,
    items,
    lineMap: {
      initDp: { java: 8, cpp: 8, python: 3, javascript: 3 },
      outerLoop: { java: 9, cpp: 9, python: 4, javascript: 4 },
      capLoop: { java: 11, cpp: 11, python: 5, javascript: 6 },
      updateDp: { java: 12, cpp: 12, python: 6, javascript: 7 },
      returnAns: { java: 15, cpp: 15, python: 7, javascript: 10 },
    },
    customMessages: {
      init: `🌿 初始化完全背包：总时间 T=${totalTime}，草药种类 m=${m}（每种草药可无限次叠加採摘）。`,
      done: `🎉 完全背包决策完毕！在总时间 ${totalTime} 内无限选取的最大总收益为答案！`,
    },
  });

  return engineSteps.map((s) => ({
    ...s,
    cost: [...cost],
    val: [...val],
    totalTime,
    metrics: {
      'metric-cur-herb': s.itemIndex >= 0 ? `第 ${s.itemIndex + 1} 种` : '—',
      'metric-cur-time': s.j >= 0 ? `${s.j}` : '—',
      'metric-cur-item': s.itemIndex >= 0 ? `#${s.itemIndex + 1}` : '—',
      'metric-cur-j': s.j >= 0 ? `${s.j}` : '—',
      'metric-direction': '正序 (从小到大)',
      'metric-max-val': `${s.maxVal}`,
    },
  })) as UnboundedKnapsackStep[];
}

const { template, Visualizer } = createDeclarativeVisualizer<UnboundedKnapsackStep>({
  id: 'unbounded-knapsack-standard',
  name: '完全背包模版 (疯狂的采药)',
  category: 'dynamic-programming',
  badge: {
    mode: '完全背包 · 正序压缩',
    complexity: 'O(M · T) · O(T)',
  },
  card1Title: '🌿 草药资源库与正序推进沙盘',
  card2Title: '📊 滚动收益向量 dp[j] 监视器',
  card2Desc: '展示正序容量枚举下，同一草药在同一轮中可以被连续多次装入的累加过程',
  legend: [
    { label: '未装入草药', color: '#475569' },
    { label: '当前考察草药', color: '#f59e0b' },
    { label: '带来更优更新', color: '#10b981' },
  ],
  inputs: [
    {
      id: 'input-t',
      label: '总时间 T (容量)',
      type: 'number',
      defaultValue: 70,
      width: '60px',
    },
    {
      id: 'input-costs',
      label: '耗时数组 costs',
      type: 'text',
      defaultValue: '71, 23',
      width: '120px',
    },
    {
      id: 'input-vals',
      label: '价值数组 values',
      type: 'text',
      defaultValue: '100, 10',
      width: '120px',
    },
  ],
  presets: [
    {
      label: '洛谷经典案例 (T=70, 耗时[71,23], 价值[100,10], Ans=30)',
      values: {
        'input-t': 70,
        'input-costs': '71, 23',
        'input-vals': '100, 10',
      },
    },
    {
      label: '多草药多重选择 (T=10, 耗时[2,3,5], 价值[5,8,14], Ans=26)',
      values: {
        'input-t': 10,
        'input-costs': '2, 3, 5',
        'input-vals': '5, 8, 14',
      },
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
  buildSteps: (inputs) => {
    const t = parseInt(inputs['input-t'] || '70', 10);
    const cost = (inputs['input-costs'] || '71, 23')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    const val = (inputs['input-vals'] || '100, 10')
      .split(',')
      .map((s) => parseInt(s.trim(), 10))
      .filter((n) => !isNaN(n));
    return buildUnboundedKnapsackSteps(t, cost, val);
  },
  renderCanvas: (container, step) => {
    renderKnapsackSandbox(container, step, {
      title: '🌿 草药资源库与正序推进沙盘 (每种可无限次叠加 ∞)',
      isPartitioned: false,
    });
  },
  renderCustomMetrics: (container, step) => {
    renderKnapsackDpMatrix(container, step, `正序滚动容量表 dp[0..${step.dp.length - 1}]`);
  },
});

export const UnboundedKnapsackVisualizer = Visualizer;

registerAlgorithm({
  id: 'unbounded-knapsack-standard',
  name: '完全背包模版 (疯狂的采药)',
  viewId: 'algo-unbounded-knapsack-standard-view',
  category: 'dynamic-programming',
  description: '左程云算法通关课 Class 074 Code03：洛谷 P1616 疯狂的采药，每件物品可选任意次，空间压缩后正序枚举容量 j',
  icon: '🌿',
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 86,
  learningGoal: '深刻理解完全背包与 01 背包空间压缩的本质区别：正序从小到大枚举容量使得物品可同轮无限次自叠加',
});
