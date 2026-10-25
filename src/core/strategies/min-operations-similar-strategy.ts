/**
 * 使数组相似的最少操作次数 (LeetCode 2449) 策略适配器 (MinOperationsSimilarStrategy)
 * 遵循身材红线规范 (LOC < 120 行)，归约为双序列奇偶顺位匹配族群，委托 TwoSequenceGreedyStepCompiler 统一编译器
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { TwoSequenceGreedyStepCompiler } from './two-sequence-greedy-step-compiler';

export class MinOperationsSimilarStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('minimum-operations-to-make-similar');
  }

  public override canHandle(modelId: string): boolean {
    return (
      modelId === 'minimum-operations-to-make-similar' ||
      modelId === 'min-operations-similar' ||
      modelId === 'min-operations-similar-2449' ||
      modelId === 'class092-code03' ||
      modelId === 'leetcode-2449' ||
      modelId === 'make-array-similar'
    );
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawNums =
      options?.customInputs?.nums ??
      options?.customInputs?.['input-nums'] ??
      options?.nums ??
      model.defaultParams?.nums ??
      [8, 12, 6];

    const rawTarget =
      options?.customInputs?.target ??
      options?.customInputs?.['input-target'] ??
      options?.target ??
      model.defaultParams?.target ??
      [2, 14, 10];

    const nums = this.parseArray(rawNums, [8, 12, 6]);
    const target = this.parseArray(rawTarget, [2, 14, 10]);

    return TwoSequenceGreedyStepCompiler.compileMinOperationsSimilar(
      model,
      nums,
      target,
      stage,
      direction,
      options?.anchorMap
    );
  }

  private parseArray(raw: any, fallback: number[]): number[] {
    if (Array.isArray(raw) && raw.length > 0) {
      const valid = raw.map(Number).filter((n) => !isNaN(n));
      if (valid.length > 0) return valid;
    }
    if (typeof raw === 'string') {
      const nums = raw.split(/[,，\s]+/).map(Number).filter((n) => !isNaN(n));
      if (nums.length > 0) return nums;
    }
    return fallback;
  }
}
