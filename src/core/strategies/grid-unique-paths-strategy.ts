import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import { type UniversalStep } from '../universal-stage-engine';
import { GridUniquePathsCompiler } from './grid-unique-paths-compiler';

/**
 * 不同路径 (Unique Paths / Unique Paths II / Min Path Sum / Dungeon Game) 领域策略适配器
 * 遵循策略模式 (Strategy Pattern) 与深模块哲学，入参提取与规约后全权委托给核心族群编译器 GridUniquePathsCompiler
 */
export class GridUniquePathsStrategy implements IAlgorithmStrategy {
  public readonly modelId: string;

  constructor(modelId: 'unique-paths' | 'unique-paths-ii' | 'min-path-sum' | 'dungeon-game-reverse-dp' = 'unique-paths') {
    this.modelId = modelId;
  }

  public canHandle(modelId: string): boolean {
    return modelId === this.modelId;
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    return GridUniquePathsCompiler.compile(model, params);
  }
}
