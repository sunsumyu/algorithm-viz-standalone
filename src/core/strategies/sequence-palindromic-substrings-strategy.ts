import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import { UniversalStageEngine, type UniversalStep } from '../universal-stage-engine';

/**
 * 回文子串 (Palindromic Substrings) 独立策略
 */
export class SequencePalindromicSubstringsStrategy implements IAlgorithmStrategy {
  public readonly modelId = 'palindromic-substrings';

  public canHandle(modelId: string): boolean {
    return modelId === this.modelId;
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, isMemo, anchorMap } = params;

    switch (stage) {
      case 1:
      case 2:
        return UniversalStageEngine.generatePalindromicSubstringsStage1or2Steps(model, Boolean(isMemo), anchorMap);
      case 3:
        return UniversalStageEngine.generatePalindromicSubstringsStage3Steps(model, anchorMap);
      case 4:
        return UniversalStageEngine.generatePalindromicSubstringsStage4Steps(model, anchorMap);
      default:
        return [];
    }
  }
}
