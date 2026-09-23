/**
 * 加入差值绝对值直到长度固定 策略适配器 (AbsoluteValueAddToArrayStrategy)
 * 遵循身材红线规范 (LOC < 120 行)，负责提取参数并委托核心深模块编译器
 * 对应大厂真实笔试真题 / 左程云 090 Code06
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { ResourceGreedyStepCompiler } from './resource-greedy-step-compiler';

export class AbsoluteValueAddToArrayStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('absolute-value-add-to-array');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawNums =
      options?.customInputs?.nums ??
      options?.customInputs?.['input-arr'] ??
      options?.customInputs?.arr ??
      model.defaultParams?.nums;

    const nums = this.parseNums(rawNums);

    return ResourceGreedyStepCompiler.compileAbsoluteValueAdd(
      model,
      {
        nums,
        direction,
        anchorMap: options?.anchorMap,
      },
      stage
    );
  }

  private parseNums(raw: any): number[] {
    const fallback = [3, 9];
    if (Array.isArray(raw) && raw.length > 0) {
      const valid = raw.map(Number).filter((n) => !isNaN(n) && n >= 0);
      if (valid.length > 0) return valid;
    }
    if (typeof raw === 'string') {
      const nums = raw.split(/[,，\s]+/).map(Number).filter((n) => !isNaN(n) && n >= 0);
      if (nums.length > 0) return nums;
    }
    return fallback;
  }
}
