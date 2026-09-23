/**
 * 两个 0 和 1 数量相等区间的最大长度 策略适配器 (LongestSameZerosOnesStrategy)
 * 遵循身材红线规范 (LOC < 120 行)，归约为鸽巢极值与边界比对族群，委托统一深模块编译器
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { ResourceGreedyStepCompiler } from './resource-greedy-step-compiler';

export class LongestSameZerosOnesStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('longest-same-zeros-ones-intervals');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawArr =
      options?.customInputs?.arr ??
      options?.customInputs?.['input-arr'] ??
      options?.arr ??
      model.defaultParams?.arr ??
      [0, 1, 0, 0, 1, 0];

    const arr = this.parseArray(rawArr, [0, 1, 0, 0, 1, 0]);

    return ResourceGreedyStepCompiler.compileLongestSameZerosOnes(
      model,
      {
        arr,
        direction,
        anchorMap: options?.anchorMap,
        problemId: this.modelId,
      },
      stage
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
