/**
 * 消灭怪物的最大数量 策略适配器 (EliminateMonstersStrategy)
 * 遵循身材红线规范 (LOC < 120 行)，归约为区间调度与 EDF 最早到达时序判定族群，委托统一深模块编译器
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { IntervalSchedulingStepCompiler } from './interval-scheduling-step-compiler';

export class EliminateMonstersStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('eliminate-monsters');
  }

  public override canHandle(modelId: string): boolean {
    return modelId === 'eliminate-monsters';
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    let dist =
      options?.customInputs?.dist ??
      options?.customInputs?.['input-dist'] ??
      options?.dist ??
      model.defaultParams?.dist;

    let speed =
      options?.customInputs?.speed ??
      options?.customInputs?.['input-speed'] ??
      options?.speed ??
      model.defaultParams?.speed;

    if (typeof dist === 'string') {
      dist = dist
        .split(/[,，\s]+/)
        .map(s => parseInt(s.trim(), 10))
        .filter(x => !isNaN(x));
    }
    if (typeof speed === 'string') {
      speed = speed
        .split(/[,，\s]+/)
        .map(s => parseInt(s.trim(), 10))
        .filter(x => !isNaN(x));
    }

    if (!Array.isArray(dist) || dist.length === 0) {
      dist = [1, 3, 4];
    }
    if (!Array.isArray(speed) || speed.length === 0) {
      speed = [1, 1, 1];
    }

    return IntervalSchedulingStepCompiler.compileEliminateMonsters(
      model,
      dist,
      speed,
      {
        direction,
        anchorMap: options?.anchorMap,
      },
      stage
    );
  }
}
