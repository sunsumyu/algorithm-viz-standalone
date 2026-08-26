import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import { UniversalStageEngine, type UniversalStep } from '../universal-stage-engine';

/**
 * 编辑距离 (Edit Distance) 字符串状态机独立策略
 */
export class SequenceEditDistanceStrategy implements IAlgorithmStrategy {
  public readonly modelId = 'edit-distance';

  public canHandle(modelId: string): boolean {
    return modelId === this.modelId;
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, isMemo, anchorMap } = params;

    switch (stage) {
      case 1:
      case 2:
        return UniversalStageEngine.generateEditDistanceStage1or2Steps(model, Boolean(isMemo), anchorMap);
      case 3:
        return UniversalStageEngine.generateEditDistanceStage3Steps(model, anchorMap);
      case 4:
        return UniversalStageEngine.generateEditDistanceStage4Steps(model, anchorMap);
      default:
        return [];
    }
  }
}
