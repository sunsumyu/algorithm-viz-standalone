/**
 * 数组的最小偏移量 (LeetCode 1675) 策略适配器 (MinimizeDeviationStrategy)
 * 遵循身材红线规范 (LOC < 120 行)，归约为大顶堆极差收缩族群，委托 ResourceGreedyStepCompiler 统一编译器
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { ResourceGreedyStepCompiler } from './resource-greedy-step-compiler';

export class MinimizeDeviationStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('minimize-deviation-in-array');
  }

  public override canHandle(modelId: string): boolean {
    return (
      modelId === 'minimize-deviation-in-array' ||
      modelId === 'minimize-deviation' ||
      modelId === 'minimize-deviation-1675' ||
      modelId === 'class092-code01' ||
      modelId === 'leetcode-1675'
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
      [4, 1, 5, 20, 3];

    const nums = this.parseNums(rawNums, [4, 1, 5, 20, 3]);

    return ResourceGreedyStepCompiler.compileMinimizeDeviation(
      model,
      {
        nums,
        direction,
        anchorMap: options?.anchorMap,
        problemId: this.modelId,
      },
      stage
    );
  }

  private parseNums(raw: any, fallback: number[]): number[] {
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
