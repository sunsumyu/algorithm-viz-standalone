import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { IntervalSchedulingStepCompiler } from './interval-scheduling-step-compiler';

/**
 * 合并区间 领域适配策略 (MergeIntervalsStrategy)
 * 极简薄适配器（< 50 行）：负责 intervals 入参解析，
 * 全权委托至顶层通用的 IntervalSchedulingStepCompiler 编译引擎。
 */
export class MergeIntervalsStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('merge-intervals');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    params: StageExecutionParams
  ): UniversalStep[] {
    const rawIntervalsStr = String(
      params.customInputs?.['input-intervals'] ??
      params.customInputs?.intervals ??
      model.defaultParams?.intervals ??
      '[[1, 3], [2, 6], [8, 10], [15, 18]]'
    );

    let intervals: Array<[number, number]> = [];
    try {
      const parsed = JSON.parse(rawIntervalsStr);
      if (Array.isArray(parsed) && parsed.length > 0) {
        intervals = parsed.map((arr: [number, number]) => [Number(arr[0]), Number(arr[1])]);
      }
    } catch {
      // fallback to default
    }
    if (intervals.length === 0) {
      intervals = [[1, 3], [2, 6], [8, 10], [15, 18]];
    }

    return IntervalSchedulingStepCompiler.compileMerge(
      model,
      intervals,
      {
        anchorMap: params.anchorMap,
        direction,
      },
      stage
    );
  }
}
