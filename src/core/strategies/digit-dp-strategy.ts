import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { compileCountDigitOne } from './digit-countdigitone';
import { compileNonNegativeConsecutiveOnes } from './digit-nonnegativeconsecutiveones';

export type DigitDpModelId =
  | 'count-digit-one'
  | 'non-negative-consecutive-ones';

/**
 * 数位 DP 策略门面 (Digit DP Strategy Facade)
 * 左程云算法通关课 第084讲、第085讲：数位 DP 专题
 * 严格遵循单一职责（SRP）与深模块架构，委托给独立数位策略：
 * 1. count-digit-one (LC 233, 84 课) -> digit-countdigitone.ts
 * 2. non-negative-consecutive-ones (LC 600, 85 课) -> digit-nonnegativeconsecutiveones.ts
 */
export class DigitDpStrategy implements IAlgorithmStrategy {
  readonly modelId: string;

  constructor(private algo: DigitDpModelId) {
    this.modelId = algo;
  }

  canHandle(modelId: string): boolean {
    return modelId === this.algo || modelId === this.modelId;
  }

  generateSteps(
    model: IYamlAlgorithmModel,
    params: StageExecutionParams
  ): UniversalStep[] {
    return this.tryGenerate(model, params) ?? [];
  }

  tryGenerate(
    model: IYamlAlgorithmModel,
    params: StageExecutionParams
  ): UniversalStep[] | null {
    if (model.id !== this.algo) return null;

    switch (this.algo) {
      case 'count-digit-one':
        return compileCountDigitOne(model, params);
      case 'non-negative-consecutive-ones':
        return compileNonNegativeConsecutiveOnes(model, params);
      default:
        return null;
    }
  }
}
