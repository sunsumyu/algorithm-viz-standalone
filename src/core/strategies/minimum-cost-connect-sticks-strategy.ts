/**
 * 连接棒材的最低费用 策略适配器 (MinimumCostConnectSticksStrategy)
 * 遵循身材红线规范 (LOC < 120 行)，负责提取参数并委托核心编译器
 * 对应 LeetCode 1167 / 洛谷 P1090 / 左程云 089 Code03
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { IntervalSchedulingStepCompiler } from './interval-scheduling-step-compiler';

export class MinimumCostConnectSticksStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('minimum-cost-connect-sticks');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawSticks =
      options?.customInputs?.sticks ??
      options?.customInputs?.['input-sticks'] ??
      model.defaultParams?.sticks;

    const sticks = this.parseSticks(rawSticks);

    return IntervalSchedulingStepCompiler.compileConnectSticks(
      model,
      sticks,
      stage,
      direction,
      options?.anchorMap
    );
  }

  private parseSticks(raw: any): number[] {
    const fallback = [2, 4, 3, 5, 1];
    if (Array.isArray(raw) && raw.length > 0) {
      const valid = raw.map(Number).filter((n) => !isNaN(n) && n > 0);
      if (valid.length > 0) return valid;
    }
    if (typeof raw === 'string') {
      const nums = raw.split(/[,，\s]+/).map(Number).filter((n) => !isNaN(n) && n > 0);
      if (nums.length > 0) return nums;
    }
    return fallback;
  }
}
