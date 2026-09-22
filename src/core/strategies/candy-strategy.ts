import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { TwoPassNeighborStepCompiler } from './two-pass-neighbor-step-compiler';

/**
 * 分发糖果 领域适配策略 (CandyStrategy)
 * 极简薄适配器（< 50 行）：负责 ratings 评分数组入参解析与规约，
 * 全权委托至核心深模块 TwoPassNeighborStepCompiler 编译引擎。
 */
export class CandyStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('candy');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    params: StageExecutionParams
  ): UniversalStep[] {
    const rawInput =
      params.customInputs?.['input-ratings'] ??
      params.customInputs?.ratings ??
      model.defaultParams?.ratings ??
      [1, 2, 87, 87, 87, 2, 1];

    let ratings: number[];
    if (Array.isArray(rawInput)) {
      ratings = rawInput.map(Number).filter(n => !Number.isNaN(n));
    } else if (typeof rawInput === 'string') {
      try {
        const parsed = JSON.parse(rawInput);
        if (Array.isArray(parsed)) {
          ratings = parsed.map(Number).filter(n => !Number.isNaN(n));
        } else {
          ratings = rawInput.split(/[\s,]+/).map(Number).filter(n => !Number.isNaN(n));
        }
      } catch {
        ratings = rawInput.split(/[\s,]+/).map(Number).filter(n => !Number.isNaN(n));
      }
    } else {
      ratings = [1, 2, 87, 87, 87, 2, 1];
    }

    if (ratings.length === 0) {
      ratings = [1, 2, 87, 87, 87, 2, 1];
    }

    return TwoPassNeighborStepCompiler.compileCandy(
      model,
      ratings,
      {
        anchorMap: params.anchorMap,
        direction,
      },
      stage
    );
  }
}
