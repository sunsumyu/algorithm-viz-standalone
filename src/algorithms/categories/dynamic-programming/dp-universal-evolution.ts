/**
 * 动态规划通用 4 阶段算法演化引擎 (Universal 4-Stage DP Evolution Engine)
 * 采用多态策略深模块（Polymorphic Strategy Deep Module）架构
 * 
 * 核心对外接缝：
 * 阶段 1: 朴素递归 (Naive Recursion - Top-Down)
 * 阶段 2: 记忆化搜索 (Memoization - Top-Down DP)
 * 阶段 3: 递推表格法 (Tabulation - Bottom-Up DP)
 * 阶段 4: 空间压缩滚动变量/滚动数组 (Space-Optimized DP)
 */

import { DpDemoStep, DpTreeNode } from './dp-demo-visualizer';
import { KeyPointsData } from '../../../core/code-panel';
import { ExecutionStepMode, StepVar } from '../../../core/interfaces';
import { codeStepIndexer } from '../../../core/code-step-indexer';
import {
  EvolutionModeId,
  StageCodeConfig,
  detectCategory,
  evolutionDispatcher,
} from './strategies';

export type { EvolutionModeId, StageCodeConfig } from './strategies';
export type { DpDemoStep, DpTreeNode };

export function getAnchorHighlight(algoId: string, stage: string, anchor: string, fallback?: any): any {
  const key = `${algoId}:${stage}`;
  const java = codeStepIndexer.resolveHighlight(key, anchor, 'java');
  const python = codeStepIndexer.resolveHighlight(key, anchor, 'python');
  const cpp = codeStepIndexer.resolveHighlight(key, anchor, 'cpp');
  const javascript = codeStepIndexer.resolveHighlight(key, anchor, 'javascript');

  if (java != null || python != null || cpp != null || javascript != null) {
    return {
      java: java ?? fallback?.java,
      python: python ?? fallback?.python,
      cpp: cpp ?? fallback?.cpp,
      javascript: javascript ?? fallback?.javascript,
    };
  }
  return fallback;
}

export const EVOLUTION_MODES: Array<{
  id: EvolutionModeId;
  label: string;
  name: string;
  badge: string;
  desc: string;
}> = [
  {
    id: 'naive-recursive',
    label: '1. 朴素递归',
    name: '1. 朴素递归 (Top-Down)',
    badge: '指数级 O(2ⁿ)',
    desc: '依据转移方程从顶层目标发起暴力分治搜索，展示重叠子问题的指数级爆炸过程。',
  },
  {
    id: 'memo-topdown',
    label: '2. 记忆化搜索',
    name: '2. 记忆化搜索 (Top-Down DP)',
    badge: '剪枝 O(n)',
    desc: '在递归搜索中引入 Memo 备忘录缓存，遇到已计算状态直接 O(1) 查表返回。',
  },
  {
    id: 'tabulation-bottomup',
    label: '3. 递推表格法',
    name: '3. 递推表格法 (Bottom-Up DP)',
    badge: '经典填表 O(n)',
    desc: '从基础 Base Case 出发自底向上顺序填充 DP 表格，消除递归栈开销。',
  },
  {
    id: 'space-optimized',
    label: '4. 空间压缩优化',
    name: '4. 空间压缩优化 (Space-Optimized)',
    badge: '极致 O(1) / O(W)',
    desc: '仅依赖前若干项，用辅助滚动变量滑动更新，将空间复杂度降至 O(1) 或 O(W)。',
  },
];

/**
 * 为指定算法和阶段生成多语言代码与教学要点（委托给多态演化策略分发器）
 */
export function getEvolutionCodeForAlgorithm(
  algoTitle: string,
  baseLines: string[],
  baseLanguages: Record<string, string[]> | undefined,
  baseLineExplanations: Record<number, string> | Record<string, Record<number, string>> | undefined,
  baseKeyPoints: KeyPointsData | string | undefined,
  stage: EvolutionModeId,
  algoId: string = '',
  direction: string = 'backward'
): StageCodeConfig {
  const category = detectCategory(algoId, algoTitle);
  return evolutionDispatcher.getCodeConfig({
    algoId,
    algoTitle,
    category,
    stage,
    direction,
    baseLines,
    baseLanguages,
    baseLineExplanations,
    baseKeyPoints,
  });
}

/**
 * 通用 4 阶段演化算法单步生成调度器（委托给多态演化策略分发器）
 */
export function buildUniversalEvolutionSteps(
  algoId: string,
  builder: ((stepMode: ExecutionStepMode) => DpDemoStep[]) | ((params: any, mode: any) => DpDemoStep[]),
  params: any,
  mode: ExecutionStepMode,
  stage: EvolutionModeId
): DpDemoStep[] {
  const baseSteps = (builder as any).length >= 2 ? (builder as any)(params, mode) : (builder as any)(mode);
  if (stage === 'tabulation-bottomup') {
    return baseSteps;
  }

  const category = detectCategory(algoId, '');
  return evolutionDispatcher.buildSteps({
    algoId,
    category,
    stage,
    baseSteps,
    stepMode: mode,
    params,
  });
}
