import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';

export interface StageExecutionParams {
  stage: number; // 1 = 纯递归, 2 = 记忆化搜索, 3 = 动态规划二维/自底向上, 4 = 空间压缩/一维优化
  m: number;
  n: number;
  direction?: 'forward' | 'reverse' | string;
  isMemo?: boolean;
  stageVariant?: 'if' | 'for' | 'terminal' | string;
  anchorMap?: Record<string, number>;
  weightsGrid?: number[][];
  obstacleGrid?: number[][];
}

/**
 * 算法推演策略统一接缝 (Algorithm Strategy Seam)
 * 遵循策略模式 (Strategy Pattern) 与单一职责原则 (SRP)
 */
export interface IAlgorithmStrategy {
  readonly modelId: string;
  canHandle(modelId: string): boolean;
  generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[];
}
