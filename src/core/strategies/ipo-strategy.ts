/**
 * IPO 项目最大化资本 策略适配器 (IPOStrategy)
 * 遵循身材红线规范 (LOC < 120 行)，负责提取参数并委托核心深模块编译器
 * 对应 LeetCode 502 / 左程云 090 Code05
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { IntervalSchedulingStepCompiler } from './interval-scheduling-step-compiler';

export class IPOStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('ipo-max-capital', ['ipo']);
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawK =
      options?.customInputs?.k ??
      options?.customInputs?.['input-k'] ??
      model.defaultParams?.k ??
      2;
    const rawW =
      options?.customInputs?.w ??
      options?.customInputs?.['input-w'] ??
      model.defaultParams?.w ??
      0;
    const rawProfits =
      options?.customInputs?.profits ??
      options?.customInputs?.['input-profits'] ??
      model.defaultParams?.profits;
    const rawCapital =
      options?.customInputs?.capital ??
      options?.customInputs?.['input-capital'] ??
      model.defaultParams?.capital;

    const k = typeof rawK === 'number' ? rawK : parseInt(String(rawK), 10) || 2;
    const w = typeof rawW === 'number' ? rawW : parseInt(String(rawW), 10) || 0;
    const profits = this.parseArray(rawProfits, [1, 2, 3]);
    const capital = this.parseArray(rawCapital, [0, 1, 1]);

    return IntervalSchedulingStepCompiler.compileIPO(
      model,
      k,
      w,
      profits,
      capital,
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
