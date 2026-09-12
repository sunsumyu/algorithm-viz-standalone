import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import { type UniversalStep } from '../universal-stage-engine';
import { generateGridUniquePathsStage12 } from './grid-unique-paths-stage12';
import { generateGridUniquePathsStage3 } from './grid-unique-paths-stage3';
import { generateGridUniquePathsStage4 } from './grid-unique-paths-stage4';

/**
 * 不同路径 (Unique Paths / Unique Paths II) 独立算法策略模块
 * 遵循策略模式 (Strategy Pattern)，封装 4 阶段推演逻辑
 */
export class GridUniquePathsStrategy implements IAlgorithmStrategy {
  public readonly modelId: string;

  constructor(modelId: 'unique-paths' | 'unique-paths-ii' | 'min-path-sum' = 'unique-paths') {
    this.modelId = modelId;
  }

  public canHandle(modelId: string): boolean {
    return modelId === this.modelId;
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, m, n, direction, isMemo, stageVariant, anchorMap } = params;

    switch (stage) {
      case 1:
      case 2:
        return this.generateStage1or2(model, m, n, direction === 'reverse' ? 'reverse' : 'forward', Boolean(isMemo), anchorMap, stageVariant);
      case 3:
        return this.generateStage3(model, m, n, direction === 'reverse' ? 'reverse' : 'forward', anchorMap);
      case 4:
        return this.generateStage4(model, m, n, direction === 'reverse' ? 'reverse' : 'forward', (stageVariant === 'for' ? 'for' : 'if'), anchorMap);
      default:
        return [];
    }
  }



  private generateStage1or2(
    model: IYamlAlgorithmModel,
    mVal: number,
    nVal: number,
    direction: 'forward' | 'reverse',
    isMemo: boolean,
    anchorMap?: Record<string, number>,
    variant: string = 'terminal'
  ): UniversalStep[] {
    return generateGridUniquePathsStage12(model, mVal, nVal, direction, isMemo, anchorMap, variant);
  }

  private generateStage3(
    model: IYamlAlgorithmModel,
    mVal: number,
    nVal: number,
    direction: 'forward' | 'reverse',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    return generateGridUniquePathsStage3(model, mVal, nVal, direction, anchorMap);
  }

  private generateStage4(
    model: IYamlAlgorithmModel,
    mVal: number,
    nVal: number,
    direction: 'forward' | 'reverse',
    variant: 'if' | 'for',
    anchorMap?: Record<string, number>
  ): UniversalStep[] {
    return generateGridUniquePathsStage4(model, mVal, nVal, direction, variant, anchorMap);
  }
}
