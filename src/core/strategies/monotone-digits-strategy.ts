/**
 * 单调递增的数字算法策略适配器 (MonotoneDigitsStrategy)
 * 遵循身材红线标准 (LOC < 120 行)，仅负责参数提取、归约转换与委托核心编译器
 * 对应 LeetCode 738
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { TwoPassNeighborStepCompiler } from './two-pass-neighbor-step-compiler';

export class MonotoneDigitsStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('monotone-digits');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawN = options?.customInputs?.n ?? model.defaultParams?.n ?? 332;
    const n = typeof rawN === 'number' ? rawN : (parseInt(String(rawN), 10) || 332);

    return TwoPassNeighborStepCompiler.compileMonotoneDigits(
      model,
      n,
      {
        direction,
        anchorMap: options?.anchorMap,
      },
      stage
    );
  }
}
