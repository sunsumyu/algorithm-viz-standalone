/**
 * 最大数 策略适配器 (LargestNumberStrategy)
 * 遵循身材红线规范 (LOC < 120 行)，负责提取参数并委托核心编译器
 * 对应 LeetCode 179 / 左程云 089 Code01
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { TwoSequenceGreedyStepCompiler } from './two-sequence-greedy-step-compiler';

export class LargestNumberStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('largest-number');
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
      model.defaultParams?.nums;

    const nums = this.parseNums(rawNums);

    return TwoSequenceGreedyStepCompiler.compileLargestNumber(
      model,
      nums,
      stage,
      direction,
      options?.anchorMap
    );
  }

  private parseNums(raw: any): number[] {
    const fallback = [3, 30, 34, 5, 9];
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
