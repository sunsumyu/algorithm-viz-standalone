/**
 * 雇佣 K 名工人的最低成本 策略适配器 (MinCostHireWorkersStrategy)
 * 遵循身材红线规范 (LOC < 120 行)，归约为双重贪心架构与有限资源调度族群，委托统一深模块编译器
 * 对应 LeetCode 857
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { ResourceGreedyStepCompiler } from './resource-greedy-step-compiler';

export class MinCostHireWorkersStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('min-cost-hire-workers');
  }

  public override canHandle(modelId: string): boolean {
    return modelId === 'min-cost-hire-workers';
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    let quality =
      options?.customInputs?.quality ??
      options?.customInputs?.['input-quality'] ??
      options?.quality ??
      model.defaultParams?.quality;

    let wage =
      options?.customInputs?.wage ??
      options?.customInputs?.['input-wage'] ??
      options?.wage ??
      model.defaultParams?.wage;

    let k =
      options?.customInputs?.k ??
      options?.customInputs?.['input-k'] ??
      options?.k ??
      model.defaultParams?.k;

    if (typeof quality === 'string') {
      quality = quality
        .split(/[,，\s]+/)
        .map(s => parseInt(s.trim(), 10))
        .filter(x => !isNaN(x));
    }
    if (typeof wage === 'string') {
      wage = wage
        .split(/[,，\s]+/)
        .map(s => parseInt(s.trim(), 10))
        .filter(x => !isNaN(x));
    }
    if (typeof k === 'string') {
      k = parseInt(k.trim(), 10);
    }

    if (!Array.isArray(quality) || quality.length === 0) {
      quality = [10, 20, 5];
    }
    if (!Array.isArray(wage) || wage.length === 0) {
      wage = [70, 50, 30];
    }
    if (typeof k !== 'number' || isNaN(k) || k <= 0) {
      k = 2;
    }

    return ResourceGreedyStepCompiler.compileMinCostHireWorkers(
      model,
      {
        quality,
        wage,
        k,
        direction,
        anchorMap: options?.anchorMap,
      },
      stage
    );
  }
}
