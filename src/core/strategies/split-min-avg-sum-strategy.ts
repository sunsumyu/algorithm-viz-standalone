/**
 * 分割数组得到最小平均值和 策略适配器 (SplitMinAvgSumStrategy)
 * 遵循身材红线规范 (LOC < 120 行)，负责提取参数并委托统一深模块编译器
 * 对应 左程云 091 Code01 / 经典大厂笔试真题
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { ResourceGreedyStepCompiler } from './resource-greedy-step-compiler';

export class SplitMinAvgSumStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('split-min-avg-sum');
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
      model.defaultParams?.arr ??
      [9, 1, 8, 2, 7, 3, 6];

    const rawK =
      options?.customInputs?.k ??
      options?.customInputs?.['input-k'] ??
      model.defaultParams?.k ??
      3;

    const arr = this.parseArray(rawArr, [9, 1, 8, 2, 7, 3, 6]);
    const k = typeof rawK === 'number' ? rawK : parseInt(String(rawK), 10) || 3;

    return ResourceGreedyStepCompiler.compileSplitMinAvgSum(
      model,
      {
        arr,
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
