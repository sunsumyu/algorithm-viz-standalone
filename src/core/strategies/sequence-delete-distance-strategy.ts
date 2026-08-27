import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { SequenceStepMatrixCompiler } from './sequence-step-matrix-compiler';

/**
 * 两个字符串的删除操作 (Delete Operation for Two Strings) 独立算法策略
 * 遵循策略模式 (Strategy Pattern)，委托 SequenceStepMatrixCompiler 深模块推导 4 阶段步骤
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
        return this.generateStage1or2(model, Boolean(isMemo), anchorMap);
      case 3:
        return this.generateStage3(model, anchorMap);
      case 4:
        return this.generateStage4(model, anchorMap);
      default:
        return [];
    }
  }

  public generateStage1or2(
    model: IYamlAlgorithmModel,
    isMemo: boolean = false,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    return SequenceStepMatrixCompiler.compileDeleteDistanceStage1or2(model, isMemo, anchorMap);
  }

  public generateStage3(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    return SequenceStepMatrixCompiler.compileDeleteDistanceStage3(model, anchorMap);
  }

  public generateStage4(
    model: IYamlAlgorithmModel,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    return SequenceStepMatrixCompiler.compileDeleteDistanceStage4(model, anchorMap);
  }
}
