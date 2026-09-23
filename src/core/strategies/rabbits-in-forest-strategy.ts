/**
 * 森林中的兔子 策略适配器 (RabbitsInForestStrategy)
 * 遵循身材红线规范 (LOC < 120 行)，归约为有限状态资源与向上取整族群，委托统一深模块编译器
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { ResourceGreedyStepCompiler } from './resource-greedy-step-compiler';

export class RabbitsInForestStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('rabbits-in-forest');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawAnswers =
      options?.customInputs?.answers ??
      options?.customInputs?.['input-answers'] ??
      options?.answers ??
      model.defaultParams?.answers ??
      [1, 1, 2];

    const answers = this.parseArray(rawAnswers, [1, 1, 2]);

    return ResourceGreedyStepCompiler.compileRabbitsInForest(
      model,
      {
        answers,
        direction,
        anchorMap: options?.anchorMap,
        problemId: this.modelId,
      },
      stage
    );
  }

  private parseArray(raw: any, fallback: number[]): number[] {
    if (Array.isArray(raw) && raw.length > 0) {
      const valid = raw.map(Number).filter((n) => !isNaN(n));
      if (valid.length > 0) return valid;
    }
    if (typeof raw === 'string') {
      const nums = raw.split(/[,，\s]+/).map(Number).filter((n) => !isNaN(n));
      if (nums.length > 0) return nums;
    }
    return fallback;
  }
}
