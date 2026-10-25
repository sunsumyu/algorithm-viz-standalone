/**
 * 将数组分成几个递增序列 (LeetCode 1121) 策略适配器 (DivideArraySeqStrategy)
 * 遵循身材红线规范 (LOC < 120 行)，归约为有限容量资源调度族群，委托 ResourceGreedyStepCompiler 统一编译器
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { ResourceGreedyStepCompiler } from './resource-greedy-step-compiler';

export class DivideArraySeqStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('divide-array-into-increasing-sequences');
  }

  public override canHandle(modelId: string): boolean {
    return (
      modelId === 'divide-array-into-increasing-sequences' ||
      modelId === 'divide-array-seq' ||
      modelId === 'class092-code05' ||
      modelId === 'divide-array-increasing-1121' ||
      modelId === 'leetcode-1121'
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
      [1, 2, 2, 3, 3, 4, 4];

    const rawK =
      options?.customInputs?.k ??
      options?.customInputs?.['input-k'] ??
      options?.k ??
      model.defaultParams?.k ??
      3;

    const nums = this.parseArray(rawNums, [1, 2, 2, 3, 3, 4, 4]);
    const k = typeof rawK === 'number' && !isNaN(rawK) ? rawK : parseInt(String(rawK), 10) || 3;

    return ResourceGreedyStepCompiler.compileDivideArraySeq(
      model,
      {
        nums,
        k,
        direction,
        anchorMap: options?.anchorMap,
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
