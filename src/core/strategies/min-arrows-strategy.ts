import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { IntervalSchedulingStepCompiler } from './interval-scheduling-step-compiler';

/**
 * 用最少数量的箭引爆气球 领域适配策略 (MinArrowsStrategy)
 * 极简薄适配器（< 50 行）：负责 points 入参解析，
 * 全权委托至顶层通用的 IntervalSchedulingStepCompiler 编译引擎。
 */
export class MinArrowsStrategy implements IAlgorithmStrategy {
  public readonly modelId: string = 'min-arrows';

  public canHandle(modelId: string): boolean {
    return modelId === 'min-arrows' || modelId === 'minimum-number-of-arrows-to-burst-balloons';
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
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
        direction: params.direction as 'forward' | 'reverse' | undefined,
      },
      params.stage ?? 1
    );
  }
}
