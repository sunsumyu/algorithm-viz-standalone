/**
 * 01背包模版 (洛谷 P1048 采药) - 声明式 4-Card 沙盘渲染器
 * 核心：空间压缩与一维滚动数组逆序更新可视化
 * 架构重构：采用通用背包推演深模块 KnapsackExecutionEngine 与沙盘载荷舱组件 KnapsackSandboxStage
 */

import { registerAlgorithm } from '../../../../core/registry';
import { createDeclarativeVisualizer } from '../../../../core/declarative-algorithm-visualizer';
import {
  KNAPSACK_01_PROBLEM_HTML,
  KNAPSACK_01_ANALYSIS_HTML,
  KNAPSACK_01_CODE_LANGUAGES,
  KNAPSACK_01_STAGE1_CODE_LANGUAGES,
  KNAPSACK_01_STAGE2_CODE_LANGUAGES,
  KNAPSACK_01_STAGE3_CODE_LANGUAGES,
} from './knapsack-073-problem-content';
import {
  runKnapsackEngine,
  KnapsackExecutionStep,
  KnapsackItem,
} from '../../../../core/knapsack-execution-engine';
import {
  renderKnapsackSandbox,
  renderKnapsackDpMatrix,
} from '../../../../core/renderers/knapsack-sandbox-stage';
import {
  buildKnapsackRecursionSteps,
  buildKnapsackMemoSteps,
  buildKnapsack2DSteps,
  renderKnapsackRecursionCard1,
  renderKnapsackRecursionCard2,
  renderKnapsackMemoCard1,
  renderKnapsackMemoCard2,
  renderKnapsack2DCard1,
  renderKnapsack2DCard2,
} from '../../../../core/renderers/knapsack-stage-evolution';

export interface Knapsack01Step extends KnapsackExecutionStep {
  cost: number[];
  val: number[];
  currentVal: number;
}

function parseKnapsack01Inputs(inputs: Record<string, any>) {
  const t = parseInt(inputs['input-capacity'] || '70', 10);
  const costs = String(inputs['input-costs'] || '71, 69, 1')
    .split(',')
    .map((s: string) => parseInt(s.trim(), 10))
    .filter((n: number) => !isNaN(n));
  const vals = String(inputs['input-vals'] || '100, 1, 2')
    .split(',')
    .map((s: string) => parseInt(s.trim(), 10))
    .filter((n: number) => !isNaN(n));
  const m = Math.min(costs.length, vals.length);
  const items: KnapsackItem[] = [];
  for (let i = 0; i < m; i++) {
    items.push({ cost: costs[i], val: vals[i], id: i + 1, name: `物品 #${i + 1}` });
  }
  return { t, costs, vals, items };
}

export function buildKnapsack01Steps(
  capacity: number,
  cost: number[],
  val: number[]
): Knapsack01Step[] {
  const m = Math.min(cost.length, val.length);
  const items: KnapsackItem[] = [];
  for (let i = 0; i < m; i++) {
    items.push({ cost: cost[i], val: val[i], id: i + 1, name: `物品 #${i + 1}` });
  }

  const engineSteps = runKnapsackEngine({
    type: '01',
    capacity,
    items,
    lineMap: {
      initDp: { java: 8, cpp: 8, python: 3, javascript: 3 },
      outerLoop: { java: 9, cpp: 9, python: 4, javascript: 4 },
      capLoop: { java: 10, cpp: 11, python: 5, javascript: 6 },
      updateDp: { java: 11, cpp: 12, python: 6, javascript: 7 },
      returnAns: { java: 14, cpp: 15, python: 7, javascript: 10 },
    },
    customMessages: {
      init: `🚀 初始化 01 背包空间：容量 T=${capacity}，待选物品数 M=${m}。dp 数组初值置 0。`,
      done: `🎉 01 背包决策完毕！在总容量 ${capacity} 下的最大价值为答案！`,
    },
  });

  return engineSteps.map((s) => ({
    ...s,
    cost: [...cost],
    val: [...val],
    currentVal: s.selectedItems ? s.selectedItems.reduce((acc, it) => acc + it.val, 0) : 0,
    metrics: {
      'metric-cur-item': s.itemIndex !== undefined && s.itemIndex >= 0 ? `#${s.itemIndex + 1}` : '—',
      'metric-cur-capacity': s.j >= 0 ? `${s.j}` : '—',
      'metric-max-val': `${s.maxVal}`,
      'metric-status': s.status.toUpperCase(),
    },
  })) as Knapsack01Step[];
}

const { template, Visualizer } = createDeclarativeVisualizer<any>({
  id: 'knapsack-01-standard',
  name: '01背包模版 (采药)',
  category: 'dynamic-programming',
  badge: {
    mode: '01背包 · 倒序压缩',
    complexity: 'O(M · T) · O(T)',
  },
  defaultStage: 'stage-4',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(2^n)',
      theme: 'bg-blue',
      badge: {
        mode: '01背包 · 递归暴力搜索',
        complexity: 'O(2^N) · O(N) 栈深',
      },
      card1Title: '🎒 递归决策树展开与运行时调用栈',
      card2Title: '📊 暴力递归开销与重叠子问题分析',
      codeLanguages: KNAPSACK_01_STAGE1_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t, items } = parseKnapsack01Inputs(inputs);
        return buildKnapsackRecursionSteps('01', t, items);
      },
      renderCanvas: (container, step) => renderKnapsackRecursionCard1(container, step),
      renderCustomMetrics: (container, step) => renderKnapsackRecursionCard2(container, step),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化搜索',
      shortName: '记忆化',
      num: 2,
      timeBadge: 'O(M·T)',
      theme: 'bg-blue',
      badge: {
        mode: '01背包 · 记忆化搜索',
        complexity: 'O(M · T) · O(M · T) 备忘录',
      },
      card1Title: '💾 备忘录剪枝探查追踪 (Cache Hit/Miss)',
      card2Title: '🎯 2D 备忘录缓存热力矩阵 memo[i][j]',
      codeLanguages: KNAPSACK_01_STAGE2_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t, items } = parseKnapsack01Inputs(inputs);
        return buildKnapsackMemoSteps('01', t, items);
      },
      renderCanvas: (container, step) => renderKnapsackMemoCard1(container, step),
      renderCustomMetrics: (container, step) => renderKnapsackMemoCard2(container, step),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 二维动态规划',
      shortName: '二维DP',
      num: 3,
      timeBadge: 'O(M·T)',
      theme: 'bg-emerald',
      badge: {
        mode: '01背包 · 严格二维表递推',
        complexity: 'O(M · T) · O(M · T)',
      },
      card1Title: '📐 二维动态规划状态表 dp[i][j]',
      card2Title: '⚖️ 上一行左侧依赖对比决策台',
      codeLanguages: KNAPSACK_01_STAGE3_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t, items } = parseKnapsack01Inputs(inputs);
        return buildKnapsack2DSteps('01', t, items);
      },
      renderCanvas: (container, step) => renderKnapsack2DCard1(container, step),
      renderCustomMetrics: (container, step) => renderKnapsack2DCard2(container, step),
    },
    {
      id: 'stage-4',
      name: '阶段 4: 一维空间压缩',
      shortName: '一维优化',
      num: 4,
      timeBadge: 'O(T) 空间',
      theme: 'bg-amber',
      badge: {
        mode: '01背包 · 倒序压缩',
        complexity: 'O(M · T) · O(T)',
      },
      card1Title: '待选草药货架与载荷舱 (01 背包)',
      card2Title: '一维滚动状态向量 dp[0..M] 监视器',
      codeLanguages: KNAPSACK_01_CODE_LANGUAGES,
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
    },
  ],
  inputs: [
    {
      id: 'input-capacity',
      label: '背包总容量 T',
      type: 'number',
      defaultValue: 70,
      width: '60px',
    },
    {
      id: 'input-costs',
      label: '耗时/体积 costs',
      type: 'text',
      defaultValue: '71, 69, 1',
      width: '120px',
    },
    {
      id: 'input-vals',
      label: '价值 values',
      type: 'text',
      defaultValue: '100, 1, 2',
      width: '120px',
    },
  ],
  presets: [
    {
      label: '洛谷经典案例 (T=70, 体积[71,69,1], 价值[100,1,2], Ans=3)',
      values: {
        'input-capacity': 70,
        'input-costs': '71, 69, 1',
        'input-vals': '100, 1, 2',
      },
    },
    {
      label: '充分选择案例 (T=10, 体积[2,3,5,7], 价值[3,4,8,10], Ans=15)',
      values: {
        'input-capacity': 10,
        'input-costs': '2, 3, 5, 7',
        'input-vals': '3, 4, 8, 10',
      },
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
  template,
  Visualizer,
  difficulty: 1,
  levelOrder: 77,
  learningGoal: '掌握 01 背包状态定义、转移方程推导及一维空间压缩中容量倒序枚举的核心原理',
});
