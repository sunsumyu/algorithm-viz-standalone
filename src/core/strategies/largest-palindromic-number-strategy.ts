/**
 * 最大回文数字 策略适配器 (LargestPalindromicNumberStrategy)
 * 遵循身材红线规范 (LOC < 120 行)，归约为双向前后缀对称填装与词频扫描族群，委托统一深模块编译器
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { TwoPassNeighborStepCompiler } from './two-pass-neighbor-step-compiler';

export class LargestPalindromicNumberStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('largest-palindromic-number');
  }

  public override canHandle(modelId: string): boolean {
    return modelId === 'largest-palindromic-number';
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    let num =
      options?.customInputs?.num ??
      options?.customInputs?.['input-num'] ??
      options?.num ??
      model.defaultParams?.num;

    if (num === undefined || num === null) {
      num = '444947137';
    }

    const numStr = String(num).trim();

    return TwoPassNeighborStepCompiler.compileLargestPalindromicNumber(
      model,
      numStr,
      {
        direction,
        anchorMap: options?.anchorMap,
      },
      stage
    );
  }
}
