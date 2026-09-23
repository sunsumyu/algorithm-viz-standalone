/**
 * 分成 k 份的最大乘积 策略适配器 (MaximumProductKPartsStrategy)
 * 遵循身材红线规范 (LOC < 120 行)，负责提取参数并委托核心深模块编译器
 * 对应大厂真实笔试真题 / 左程云 090 Code02
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { ResourceGreedyStepCompiler } from './resource-greedy-step-compiler';

export class MaximumProductKPartsStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('maximum-product-k-parts');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawN =
      options?.customInputs?.n ??
      options?.customInputs?.['input-n'] ??
      model.defaultParams?.n ??
      14;
    const rawK =
      options?.customInputs?.k ??
      options?.customInputs?.['input-k'] ??
      model.defaultParams?.k ??
      4;

    const n = this.parsePositive(rawN, 14);
    const k = this.parsePositive(rawK, 4);

    return ResourceGreedyStepCompiler.compileMaximumProductKParts(
      model,
      {
        n,
        k,
        direction,
        anchorMap: options?.anchorMap,
      },
      stage
    );
  }

  private parsePositive(raw: any, fallback: number): number {
    if (typeof raw === 'number' && !isNaN(raw) && raw >= 1) {
      return Math.floor(raw);
    }
    if (typeof raw === 'string') {
      const parsed = parseInt(raw.trim(), 10);
      if (!isNaN(parsed) && parsed >= 1) return parsed;
    }
    return fallback;
  }
}
