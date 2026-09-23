/**
 * 两地调度策略适配器 (TwoCitySchedulingStrategy)
 * 遵循身材红线标准 (LOC < 120 行)，负责参数提取与委托核心编译器
 * 对应 LeetCode 1029 / 左程云 089 Code02
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { TwoSequenceGreedyStepCompiler } from './two-sequence-greedy-step-compiler';

export class TwoCitySchedulingStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('two-city-scheduling');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawCosts =
      options?.customInputs?.costs ??
      options?.customInputs?.['input-costs'] ??
      model.defaultParams?.costs;

    const costs = this.parseCosts(rawCosts);

    return TwoSequenceGreedyStepCompiler.compileTwoCityScheduling(
      model,
      costs,
      stage,
      direction,
      options?.anchorMap
    );
  }

  private parseCosts(raw: any): number[][] {
    const fallback = [[10, 20], [30, 200], [400, 50], [30, 20]];
    if (Array.isArray(raw) && raw.length >= 2) {
      const valid = raw
        .map((item) => (Array.isArray(item) ? [Number(item[0]), Number(item[1])] : null))
        .filter((c): c is [number, number] => c !== null && !isNaN(c[0]) && !isNaN(c[1]));
      if (valid.length >= 2) return valid;
    }
    if (typeof raw === 'string') {
      const pairs = raw.split(/[;；]+/).map((s) => s.trim()).filter(Boolean);
      const res: number[][] = [];
      for (const p of pairs) {
        const nums = p.split(/[,，\s]+/).map(Number).filter((n) => !isNaN(n));
        if (nums.length >= 2) res.push([nums[0], nums[1]]);
      }
      if (res.length >= 2) return res;
    }
    return fallback;
  }
}
