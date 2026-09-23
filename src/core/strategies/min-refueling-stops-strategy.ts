/**
 * 最低加油次数 策略适配器 (MinRefuelingStopsStrategy)
 * 遵循身材红线规范 (LOC < 120 行)，归约为有限状态资源与大顶堆反悔贪心族群，委托统一深模块编译器
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { ResourceGreedyStepCompiler } from './resource-greedy-step-compiler';

export class MinRefuelingStopsStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('minimum-number-of-refueling-stops');
  }

  public override canHandle(modelId: string): boolean {
    return modelId === 'minimum-number-of-refueling-stops' || modelId === 'min-refueling-stops';
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const target =
      options?.customInputs?.target ??
      options?.customInputs?.['input-target'] ??
      options?.target ??
      model.defaultParams?.target ??
      100;

    const startFuel =
      options?.customInputs?.startFuel ??
      options?.customInputs?.['input-start-fuel'] ??
      options?.startFuel ??
      model.defaultParams?.startFuel ??
      10;

    const stations =
      options?.customInputs?.stations ??
      options?.customInputs?.['input-stations'] ??
      options?.stations ??
      model.defaultParams?.stations ??
      [[10, 60], [20, 30], [30, 30], [60, 40]];

    return ResourceGreedyStepCompiler.compileMinRefuelingStops(
      model,
      {
        target: Number(target),
        startFuel: Number(startFuel),
        stations,
        direction,
        anchorMap: options?.anchorMap,
        problemId: this.modelId,
      },
      stage
    );
  }
}
