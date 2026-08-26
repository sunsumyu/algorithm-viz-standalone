import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import { UniversalStageEngine, type UniversalStep } from '../universal-stage-engine';

/**
 * 最长回文子序列 (Longest Palindromic Subsequence) 区间 DP 独立策略
 */
export class SequenceLongestPalindromicSubsequenceStrategy implements IAlgorithmStrategy {
  public readonly modelId = 'longest-palindromic-subsequence';

  public canHandle(modelId: string): boolean {
    return modelId === this.modelId;
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, isMemo, anchorMap } = params;

    switch (stage) {
      case 1:
      case 2:
        return UniversalStageEngine.generateLongestPalindromicSubsequenceStage1or2Steps(model, Boolean(isMemo), anchorMap);
      case 3:
        return UniversalStageEngine.generateLongestPalindromicSubsequenceStage3Steps(model, anchorMap);
      case 4:
        return UniversalStageEngine.generateLongestPalindromicSubsequenceStage4Steps(model, anchorMap);
      default:
        return [];
    }
  }
}
