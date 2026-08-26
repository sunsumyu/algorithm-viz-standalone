import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import { UniversalStageEngine, type UniversalStep } from '../universal-stage-engine';

/**
 * 线性一维 DP (斐波那契数 / 爬楼梯) 独立策略
 */
export class Linear1DStrategy implements IAlgorithmStrategy {
  public readonly modelId: string;

  constructor(modelId: 'fibonacci' | 'climb-stairs') {
    this.modelId = modelId;
  }

  public canHandle(modelId: string): boolean {
    return modelId === this.modelId;
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, m, n, isMemo, anchorMap } = params;
    const len = Math.max(m, n);

    switch (stage) {
      case 1:
      case 2:
        return UniversalStageEngine.generate1DStage1or2Steps(model, len, Boolean(isMemo), anchorMap);
      case 3:
        return UniversalStageEngine.generate1DStage3Steps(model, len, anchorMap);
      case 4:
        return UniversalStageEngine.generate1DStage4Steps(model, len, anchorMap);
      default:
        return [];
    }
  }
}
