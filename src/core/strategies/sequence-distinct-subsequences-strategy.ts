import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { SequenceStepMatrixCompiler } from './sequence-step-matrix-compiler';

/**
 * 不同的子序列 (Distinct Subsequences) 独立算法策略
 * 遵循策略模式 (Strategy Pattern)，委托 SequenceStepMatrixCompiler 深模块推导 4 阶段步骤
 */
export class SequenceDistinctSubsequencesStrategy implements IAlgorithmStrategy {
  public readonly modelId = 'distinct-subsequences';

  public canHandle(modelId: string): boolean {
    return modelId === this.modelId;
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, isMemo, anchorMap, direction } = params;
    const dir = direction === 'reverse' ? 'reverse' : 'forward';

    switch (stage) {
      case 1:
      case 2:
        return this.generateStage1or2(model, Boolean(isMemo), anchorMap, dir);
      case 3:
        return this.generateStage3(model, anchorMap, dir, params.stageVariant);
      case 4:
        return this.generateStage4(model, anchorMap, dir, params.stageVariant);
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
    return SequenceStepMatrixCompiler.compileDistinctSubsequencesStage1or2(model, isMemo, anchorMap, direction);
  }

  public generateStage3(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>,
    direction: 'forward' | 'reverse' = 'forward',
    variant: string = 'for'
  ): UniversalStep[] {
    return SequenceStepMatrixCompiler.compileDistinctSubsequencesStage3(model, anchorMap, direction, variant);
  }

  public generateStage4(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>,
    direction: 'forward' | 'reverse' = 'forward',
    variant: string = 'reverse_1d'
  ): UniversalStep[] {
    return SequenceStepMatrixCompiler.compileDistinctSubsequencesStage4(model, anchorMap, direction, variant);
  }
}
