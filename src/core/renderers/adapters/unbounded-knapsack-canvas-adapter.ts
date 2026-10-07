/**
 * 完全背包模版 Canvas 表现层适配器 (Stage 1-4 多阶段与沙盘装载)
 */

import {
  renderKnapsackSandbox,
  renderKnapsackDpMatrix,
} from '../knapsack-sandbox-stage';
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
} from '../knapsack-stage-evolution';
import {
  UNBOUNDED_KNAPSACK_CODE_LANGUAGES,
  UNBOUNDED_KNAPSACK_STAGE1_CODE_LANGUAGES,
  UNBOUNDED_KNAPSACK_STAGE2_CODE_LANGUAGES,
  UNBOUNDED_KNAPSACK_STAGE3_CODE_LANGUAGES,
} from '../../../algorithms/categories/dynamic-programming/knapsack-074/knapsack-074-problem-content';
import {
  buildUnboundedKnapsackSteps,
  parseUnboundedKnapsackInputs,
  type UnboundedKnapsackStep,
} from './unbounded-knapsack-step-compiler';

export { renderKnapsackSandbox, renderKnapsackDpMatrix };

export function renderUnboundedKnapsackCanvas(
  container: HTMLElement,
  step: UnboundedKnapsackStep
): void {
  renderKnapsackSandbox(container, step, {
    title: '🌿 草药资源库与正序推进沙盘 (每种可无限次叠加 ∞)',
    isPartitioned: false,
  });
}

export function renderUnboundedKnapsackMetrics(
  container: HTMLElement,
  step: UnboundedKnapsackStep
): void {
  renderKnapsackDpMatrix(container, step, `正序滚动容量表 dp[0..${step.dp.length - 1}]`);
}

export function createUnboundedKnapsackStages(): any[] {
  return [
    {
      id: 'stage-1',
      name: '阶段 1: 暴力递归',
      shortName: '递归',
      num: 1,
      timeBadge: 'O(2^n)',
      theme: 'bg-blue',
      badge: {
        mode: '完全背包 · 递归暴力搜索',
        complexity: 'O(2^N) · O(N) 栈深',
      },
      card1Title: '🎒 递归决策树展开与运行时调用栈',
      card2Title: '📊 暴力递归开销与重叠子问题分析',
      codeLanguages: UNBOUNDED_KNAPSACK_STAGE1_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t, items } = parseUnboundedKnapsackInputs(inputs);
        return buildKnapsackRecursionSteps('unbounded', t, items);
      },
      renderCanvas: (container: HTMLElement, step: any) => renderKnapsackRecursionCard1(container, step),
      renderCustomMetrics: (container: HTMLElement, step: any) => renderKnapsackRecursionCard2(container, step),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 记忆化搜索',
      shortName: '记忆化',
      num: 2,
      timeBadge: 'O(M·T)',
      theme: 'bg-blue',
      badge: {
        mode: '完全背包 · 记忆化搜索',
        complexity: 'O(M · T) · O(M · T) 备忘录',
      },
      card1Title: '💾 备忘录剪枝探查追踪 (Cache Hit/Miss)',
      card2Title: '🎯 2D 备忘录缓存热力矩阵 memo[i][j]',
      codeLanguages: UNBOUNDED_KNAPSACK_STAGE2_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t, items } = parseUnboundedKnapsackInputs(inputs);
        return buildKnapsackMemoSteps('unbounded', t, items);
      },
      renderCanvas: (container: HTMLElement, step: any) => renderKnapsackMemoCard1(container, step),
      renderCustomMetrics: (container: HTMLElement, step: any) => renderKnapsackMemoCard2(container, step),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 二维动态规划',
      shortName: '二维DP',
      num: 3,
      timeBadge: 'O(M·T)',
      theme: 'bg-emerald',
      badge: {
        mode: '完全背包 · 严格二维表递推',
        complexity: 'O(M · T) · O(M · T)',
      },
      card1Title: '📐 二维动态规划状态表 dp[i][j]',
      card2Title: '⚖️ 同行左侧依赖对比决策台',
      codeLanguages: UNBOUNDED_KNAPSACK_STAGE3_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t, items } = parseUnboundedKnapsackInputs(inputs);
        return buildKnapsack2DSteps('unbounded', t, items);
      },
      renderCanvas: (container: HTMLElement, step: any) => renderKnapsack2DCard1(container, step),
      renderCustomMetrics: (container: HTMLElement, step: any) => renderKnapsack2DCard2(container, step),
    },
    {
      id: 'stage-4',
      name: '阶段 4: 一维空间压缩',
      shortName: '一维优化',
      num: 4,
      timeBadge: 'O(T) 空间',
      theme: 'bg-amber',
      badge: {
        mode: '完全背包 · 正序空间压缩',
        complexity: 'O(M · T) · O(T)',
      },
      card1Title: '🌿 草药资源库与正序推进沙盘',
      card2Title: '📊 滚动收益向量 dp[j] 监视器',
      codeLanguages: UNBOUNDED_KNAPSACK_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t, cost, val } = parseUnboundedKnapsackInputs(inputs);
        return buildUnboundedKnapsackSteps(t, cost, val);
      },
      renderCanvas: renderUnboundedKnapsackCanvas,
      renderCustomMetrics: renderUnboundedKnapsackMetrics,
    },
  ];
}
