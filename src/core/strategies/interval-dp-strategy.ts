import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { compilePredictWinner } from './interval-predictwinner';
import { compileBurstBalloons } from './interval-burstballoons';
import { compileMinScoreTriangulation } from './interval-minscoretriangulation';
import { compileMergeStones } from './interval-mergestones';
import { compileStrangePrinter } from './interval-strangeprinter';

export type IntervalDpModelId =
  | 'predict-the-winner'
  | 'burst-balloons'
  | 'min-score-triangulation'
  | 'merge-stones'
  | 'strange-printer';

/**
 * 区间 DP 策略门面 (Interval DP Strategy Facade)
 * 第083讲、第084讲、第085讲：区间 DP 专题
 * 严格遵循单一职责（SRP）与深模块架构，委托给 5 大独立区间策略：
 * 1. predict-the-winner (LC 486, 83 课) -> interval-predictwinner.ts
 * 2. burst-balloons (LC 312, 83 课) -> interval-burstballoons.ts
 * 3. min-score-triangulation (LC 1039, 84 课) -> interval-minscoretriangulation.ts
 * 4. merge-stones (LC 1000, 84 课) -> interval-mergestones.ts
 * 5. strange-printer (LC 664, 85 课) -> interval-strangeprinter.ts
 */
export class IntervalDpStrategy implements IAlgorithmStrategy {
  readonly modelId: string;

  constructor(private algo: IntervalDpModelId) {
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
      case 'predict-the-winner':
        return compilePredictWinner(model, params);
      case 'burst-balloons':
        return compileBurstBalloons(model, params);
      case 'min-score-triangulation':
        return compileMinScoreTriangulation(model, params);
      case 'merge-stones':
        return compileMergeStones(model, params);
      case 'strange-printer':
        return compileStrangePrinter(model, params);
      default:
        return null;
    }
  }
}
