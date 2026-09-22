import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { IntervalSchedulingStepCompiler } from './interval-scheduling-step-compiler';

/**
 * 用最少数量的箭引爆气球 领域适配策略 (MinArrowsStrategy)
 * 极简薄适配器（< 50 行）：负责 points 入参解析，
 * 全权委托至顶层通用的 IntervalSchedulingStepCompiler 编译引擎。
 */
export class MinArrowsStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('min-arrows', ['minimum-number-of-arrows-to-burst-balloons']);
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    params: StageExecutionParams
  ): UniversalStep[] {
    const rawPointsStr = String(
      params.customInputs?.['input-points'] ??
      params.customInputs?.points ??
      model.defaultParams?.points ??
      '[[10, 16], [2, 8], [1, 6], [7, 12]]'
    );

    let points: Array<[number, number]> = [];
    try {
      const parsed = JSON.parse(rawPointsStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        points = parsed.map((arr: [number, number]) => [arr[0], arr[1]]);
      }
    } catch {
      // fallback to default
    }
    if (points.length === 0) {
      points = [[10, 16], [2, 8], [1, 6], [7, 12]];
    }

    return IntervalSchedulingStepCompiler.compileArrows(
      model,
      points,
      {
        anchorMap: params.anchorMap,
        direction,
      },
      stage
    );
  }
}
