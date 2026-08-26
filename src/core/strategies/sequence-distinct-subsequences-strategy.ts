import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import { UniversalStageEngine, type UniversalStep } from '../universal-stage-engine';

/**
 * 不同的子序列 (Distinct Subsequences) 字符串序列 DP 独立策略
 */
export class SequenceDistinctSubsequencesStrategy implements IAlgorithmStrategy {
  public readonly modelId = 'distinct-subsequences';

  public canHandle(modelId: string): boolean {
    return modelId === this.modelId;
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, isMemo, anchorMap } = params;

    switch (stage) {
      case 1:
      case 2:
        return UniversalStageEngine.generateDistinctSubsequencesStage1or2Steps(model, Boolean(isMemo), anchorMap);
      case 3:
        return UniversalStageEngine.generateDistinctSubsequencesStage3Steps(model, anchorMap);
      case 4:
        return UniversalStageEngine.generateDistinctSubsequencesStage4Steps(model, anchorMap);
      default:
        return [];
    }
  }
}
