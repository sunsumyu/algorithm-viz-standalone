import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import { UniversalStageEngine, type UniversalStep } from '../universal-stage-engine';

/**
 * 两个字符串的删除操作 (Delete Operation for Two Strings) 独立策略
 */
export class SequenceDeleteDistanceStrategy implements IAlgorithmStrategy {
  public readonly modelId = 'delete-operation-for-two-strings';

  public canHandle(modelId: string): boolean {
    return modelId === this.modelId;
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, isMemo, anchorMap } = params;

    switch (stage) {
      case 1:
      case 2:
        return UniversalStageEngine.generateDeleteDistanceStage1or2Steps(model, Boolean(isMemo), anchorMap);
      case 3:
        return UniversalStageEngine.generateDeleteDistanceStage3Steps(model, anchorMap);
      case 4:
        return UniversalStageEngine.generateDeleteDistanceStage4Steps(model, anchorMap);
      default:
        return [];
    }
  }
}
