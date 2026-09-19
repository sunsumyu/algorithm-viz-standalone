import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import {
  compileInterleavingStringStage1or2,
  compileInterleavingStringStage3,
  compileInterleavingStringStage4
} from './sequence-interleavingstring-compiler';

/**
 * 交错字符串 (Interleaving String, LeetCode 97) 独立算法策略
 * 遵循策略模式 (Strategy Pattern)，委托 sequence-interleavingstring-compiler 深模块推导 4 阶段步骤
 */
export class SequenceInterleavingStringStrategy implements IAlgorithmStrategy {
  public readonly modelId = 'interleaving-string';

  public canHandle(modelId: string): boolean {
    return modelId === this.modelId || modelId === 'interleave-string';
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, isMemo, anchorMap, direction } = params;
    const dir = direction === 'reverse' ? 'reverse' : 'forward';

    switch (stage) {
      case 1:
      case 2:
        return compileInterleavingStringStage1or2(model, Boolean(isMemo), anchorMap, dir);
      case 3:
        return compileInterleavingStringStage3(model, anchorMap, dir);
      case 4:
        return compileInterleavingStringStage4(model, anchorMap, dir);
      default:
        return [];
    }
  }

  public generateStage1or2(
    model: IYamlAlgorithmModel,
    isMemo: boolean = false,
    anchorMap?: Record<string, number>,
    direction: 'forward' | 'reverse' = 'forward'
  ): UniversalStep[] {
    return compileInterleavingStringStage1or2(model, isMemo, anchorMap, direction);
  }

  public generateStage3(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>,
    direction: 'forward' | 'reverse' = 'forward'
  ): UniversalStep[] {
    return compileInterleavingStringStage3(model, anchorMap, direction);
  }

  public generateStage4(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>,
    direction: 'forward' | 'reverse' = 'forward'
  ): UniversalStep[] {
    return compileInterleavingStringStage4(model, anchorMap, direction);
  }
}
