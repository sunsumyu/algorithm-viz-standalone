/**
 * 01背包模版 (洛谷 P1048 采药 / 左程云 Class 073 Code01)
 * Canvas Adapter: 空间压缩与一维滚动数组逆序更新沙盘
 */

import {
  KNAPSACK_01_STAGE1_CODE_LANGUAGES,
  KNAPSACK_01_STAGE2_CODE_LANGUAGES,
  KNAPSACK_01_STAGE3_CODE_LANGUAGES,
  KNAPSACK_01_CODE_LANGUAGES,
} from '../../../algorithms/categories/dynamic-programming/knapsack-073/knapsack-073-problem-content';
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
  buildKnapsack01Steps,
  parseKnapsack01Inputs,
  type Knapsack01Step,
} from './knapsack-01-step-compiler';

export { renderKnapsackSandbox, renderKnapsackDpMatrix };

export function createKnapsack01Stages() {
  return [
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
        mode: '01背包 · 二维状态转移',
        complexity: 'O(M · T) · O(M · T)',
      },
      card1Title: '📐 状态转移决策剖析与依赖网格',
      card2Title: '📊 严格二维状态表 dp[i][j]',
      codeLanguages: KNAPSACK_01_STAGE3_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t, items } = parseKnapsack01Inputs(inputs);
        return buildKnapsack2DSteps('01', t, items);
      },
      renderCanvas: (container: HTMLElement, step: any) => renderKnapsack2DCard1(container, step),
      renderCustomMetrics: (container: HTMLElement, step: any) => renderKnapsack2DCard2(container, step),
    },
    {
      id: 'stage-4',
      name: '阶段 4: 空间压缩',
      shortName: '空间优化',
      num: 4,
      timeBadge: 'O(T) 空间',
      theme: 'bg-amber',
      badge: {
        mode: '01背包 · 一维滚动数组逆序更新',
        complexity: 'O(M · T) · O(T)',
      },
      card1Title: '🎒 物品载荷列表与背包实时容量舱',
      card2Title: '📈 动态规划一维收益矩阵 dp[0..T]',
      codeLanguages: KNAPSACK_01_CODE_LANGUAGES,
      buildSteps: (inputs: Record<string, any>) => {
        const { t, items } = parseKnapsack01Inputs(inputs);
        return buildKnapsack01Steps(t, items);
      },
      renderCanvas: (container: HTMLElement, step: Knapsack01Step) => renderKnapsackSandbox(container, step),
      renderCustomMetrics: (container: HTMLElement, step: Knapsack01Step) => renderKnapsackDpMatrix(container, step),
    },
  ];
}
