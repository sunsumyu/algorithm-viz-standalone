import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { IntervalSchedulingStepCompiler } from './interval-scheduling-step-compiler';

/**
 * 无重叠区间 领域适配策略 (NonOverlappingStrategy)
 * 极简薄适配器（< 50 行）：负责 intervals 入参解析，
 * 全权委托至顶层通用的 IntervalSchedulingStepCompiler 编译引擎。
 */
export class NonOverlappingStrategy implements IAlgorithmStrategy {
  public readonly modelId: string = 'non-overlapping';

  public canHandle(modelId: string): boolean {
    return modelId === 'non-overlapping' || modelId === 'non-overlapping-intervals';
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const rawIntervalsStr = String(
      params.customInputs?.['input-intervals'] ??
      params.customInputs?.intervals ??
      model.defaultParams?.intervals ??
      '[[1, 2], [2, 3], [3, 4], [1, 3]]'
    );

    let intervals: Array<[number, number]> = [];
    try {
      const parsed = JSON.parse(rawIntervalsStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        intervals = parsed.map((arr: [number, number]) => [arr[0], arr[1]]);
      }
    } catch {
      // fallback to default
    }
    if (intervals.length === 0) {
      intervals = [[1, 2], [2, 3], [3, 4], [1, 3]];
    }

    return IntervalSchedulingStepCompiler.compileDisjoint(
      model,
      intervals,
      {
        anchorMap: params.anchorMap,
        direction: params.direction as 'forward' | 'reverse' | undefined,
      },
      params.stage ?? 1
    );
  }
}
