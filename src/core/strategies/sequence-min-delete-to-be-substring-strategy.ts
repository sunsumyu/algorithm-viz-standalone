import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import {
  compileMinDeleteStage1or2,
  compileMinDeleteStage3,
  compileMinDeleteStage4
} from './sequence-mindeletetobesubstring-compiler';

/**
 * 最少删除使成为子串 (MinDeleteToBeSubstring) 独立算法策略
 * 遵循策略模式 (Strategy Pattern)，委托 sequence-mindeletetobesubstring-compiler 深模块推导 4 阶段步骤
 */
export class SequenceMinDeleteToBeSubstringStrategy implements IAlgorithmStrategy {
  public readonly modelId = 'min-delete-to-be-substring';

  public canHandle(modelId: string): boolean {
    return (
      modelId === this.modelId ||
      modelId === 'min-delete-to-make-substring' ||
      modelId === 'min-delete-substring'
    );
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, isMemo, anchorMap, direction } = params;
    const dir = direction === 'reverse' ? 'reverse' : 'forward';

    switch (stage) {
      case 1:
      case 2:
        return compileMinDeleteStage1or2(model, Boolean(isMemo), anchorMap, dir);
      case 3:
        return compileMinDeleteStage3(model, anchorMap, dir);
      case 4:
        return compileMinDeleteStage4(model, anchorMap, dir);
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
    return compileMinDeleteStage1or2(model, isMemo, anchorMap, direction);
  }

  public generateStage3(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>,
    direction: 'forward' | 'reverse' = 'forward'
  ): UniversalStep[] {
    return compileMinDeleteStage3(model, anchorMap, direction);
  }

  public generateStage4(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>,
    direction: 'forward' | 'reverse' = 'forward'
  ): UniversalStep[] {
    return compileMinDeleteStage4(model, anchorMap, direction);
  }
}
