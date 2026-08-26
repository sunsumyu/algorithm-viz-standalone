import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import { UniversalStageEngine, type UniversalStep } from '../universal-stage-engine';

/**
 * 分割等和子集 (Partition Equal Subset Sum) 0-1 背包 DP 独立策略
 */
export class KnapsackPartitionSubsetStrategy implements IAlgorithmStrategy {
  public readonly modelId = 'partition-equal-subset-sum';

  public canHandle(modelId: string): boolean {
    return modelId === this.modelId;
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, isMemo, anchorMap } = params;

    switch (stage) {
      case 1:
      case 2:
        return UniversalStageEngine.generatePartitionSubsetStage1or2Steps(model, Boolean(isMemo), anchorMap);
      case 3:
        return UniversalStageEngine.generatePartitionSubsetStage3Steps(model, anchorMap);
      case 4:
        return UniversalStageEngine.generatePartitionSubsetStage4Steps(model, anchorMap);
      default:
        return [];
    }
  }
}
