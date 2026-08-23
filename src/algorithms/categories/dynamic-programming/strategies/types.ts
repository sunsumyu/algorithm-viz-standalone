/**
 * Evolution Strategy Types & Seams (DP 演化策略抽象接缝)
 */

import { DpDemoStep } from '../dp-demo-visualizer';
import { KeyPointsData } from '../../../../core/code-panel';
import { ExecutionStepMode } from '../../../../core/interfaces';

export type EvolutionModeId = 'naive-recursive' | 'memo-topdown' | 'tabulation-bottomup' | 'space-optimized';

export interface StageCodeConfig {
  lines: string[];
  languages: Record<string, string[]>;
  lineExplanations?: Record<number, string> | Record<string, Record<number, string>>;
  keyPoints?: KeyPointsData | string;
}

export type AlgoCategory = 'grid-2d' | 'knapsack' | 'robber' | 'stock' | 'sequence-string' | 'min-cost' | 'fib-or-climb' | 'generic';

export function detectCategory(algoId: string, algoTitle: string): AlgoCategory {
  const id = (algoId || '').toLowerCase();
  const title = (algoTitle || '').toLowerCase();

  if (id.includes('unique-paths') || id.includes('min-path-sum') || id.includes('triangle') || title.includes('路径') || title.includes('最小路径和')) {
    return 'grid-2d';
  }
  if (id.includes('knapsack') || id.includes('bag') || id.includes('coin') || id.includes('partition') || id.includes('target-sum') || id.includes('stone') || title.includes('背包') || title.includes('零钱') || title.includes('分割等和')) {
    return 'knapsack';
  }
  if (id.includes('rob') || title.includes('打家劫舍')) {
    return 'robber';
  }
  if (id.includes('stock') || title.includes('股票')) {
    return 'stock';
  }
  if (id.includes('lcs') || id.includes('subsequence') || id.includes('edit-distance') || id.includes('distinct') || id.includes('palindrom') || title.includes('子序列') || title.includes('编辑距离') || title.includes('回文')) {
    return 'sequence-string';
  }
  if (id.includes('cost') || title.includes('最小花费')) {
    return 'min-cost';
  }
  if (id.includes('climb') || id.includes('fib') || id.includes('stair') || title.includes('爬楼梯') || title.includes('斐波那契')) {
    return 'fib-or-climb';
  }
  return 'generic';
}

export interface EvolutionCodeContext {
  algoId: string;
  algoTitle: string;
  category: AlgoCategory;
  stage: EvolutionModeId;
  direction?: string;
  baseLines: string[];
  baseLanguages?: Record<string, string[]>;
  baseLineExplanations?: Record<number, string> | Record<string, Record<number, string>>;
  baseKeyPoints?: KeyPointsData | string;
}

export interface EvolutionStepContext {
  algoId: string;
  category: AlgoCategory;
  stage: EvolutionModeId;
  baseSteps: DpDemoStep[];
  stepMode: ExecutionStepMode;
  params: any;
}

export interface IEvolutionStrategy {
  canHandle(category: AlgoCategory, algoId: string): boolean;
  getCodeConfig(ctx: EvolutionCodeContext): StageCodeConfig | null;
  buildSteps(ctx: EvolutionStepContext): DpDemoStep[] | null;
}
