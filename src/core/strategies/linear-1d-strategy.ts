import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { LinearStepMatrixCompiler } from './linear-step-matrix-compiler';

export type LinearModelId =
  | 'fibonacci'
  | 'climb-stairs'
  | 'min-cost'
  | 'min-cost-climbing-stairs'
  | 'integer-break'
  | 'unique-bst'
  | 'decode-ways';

/**
 * 线性一维 DP 多态策略门面 (Linear1DStrategy Facade)
 * 遵循策略模式 (Strategy Pattern) 与门面模式 (Facade Pattern)：
 * 将 5 阶段演化推演全权委托给 LinearStepMatrixCompiler 编译器流水线。
 */
export class Linear1DStrategy implements IAlgorithmStrategy {
  public readonly modelId: string;

  constructor(modelId: LinearModelId | string) {
    this.modelId = modelId;
  }

  public canHandle(modelId: string): boolean {
    return (
      modelId === this.modelId ||
      (this.modelId === 'min-cost' && modelId === 'min-cost-climbing-stairs') ||
      (this.modelId === 'min-cost-climbing-stairs' && modelId === 'min-cost')
    );
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, m, n, isMemo, anchorMap } = params;
    const len = Math.max(m, n);

    return LinearStepMatrixCompiler.compile(model, {
      modelId: this.modelId,
      stage,
      n: len,
      isMemo: Boolean(isMemo),
      anchorMap
    });
  }

  /**
   * 向后兼容单元测试直接调用辅助接口
   */
  public generateStage1or2(
    model: IYamlAlgorithmModel,
    nVal: number,
    isMemo: boolean = false,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    return LinearStepMatrixCompiler.compileStage1or2(model, nVal, isMemo, anchorMap);
  }

  public generateStage3(
    model: IYamlAlgorithmModel,
    nVal: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    return LinearStepMatrixCompiler.compileStage3(model, nVal, anchorMap);
  }

  public generateStage4(
    model: IYamlAlgorithmModel,
    nVal: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    return LinearStepMatrixCompiler.compileStage4(model, nVal, anchorMap);
  }

  public generateStage5(
    model: IYamlAlgorithmModel,
    nVal: number,
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    return LinearStepMatrixCompiler.compileStage5(model, nVal, anchorMap);
  }
}
