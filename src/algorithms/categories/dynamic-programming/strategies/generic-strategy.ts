/**
 * Generic DP Evolution Strategy (通用默认兜底策略)
 */

import { DpDemoStep } from '../dp-demo-visualizer';
import { IEvolutionStrategy, EvolutionCodeContext, EvolutionStepContext, StageCodeConfig } from './types';

export class GenericEvolutionStrategy implements IEvolutionStrategy {
  canHandle(): boolean {
    return true; // 兜底策略始终可以处理
  }

  getCodeConfig(ctx: EvolutionCodeContext): StageCodeConfig | null {
    const { baseLines, baseLanguages, baseLineExplanations, baseKeyPoints } = ctx;
    const languages = baseLanguages || { java: baseLines, javascript: baseLines };
    return {
      lines: baseLines,
      languages,
      lineExplanations: baseLineExplanations,
      keyPoints: baseKeyPoints,
    };
  }

  buildSteps(ctx: EvolutionStepContext): DpDemoStep[] | null {
    return ctx.baseSteps;
  }
}
