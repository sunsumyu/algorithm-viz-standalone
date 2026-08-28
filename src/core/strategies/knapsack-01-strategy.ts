import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { KnapsackStepMatrixCompiler, KnapsackDomainConfig } from './knapsack-step-matrix-compiler';

/**
 * 标准 0-1 背包问题 (0-1 Knapsack Problem) 独立算法策略模块
 * 负责参数提取与领域配置装配，推导矩阵委托至 KnapsackStepMatrixCompiler
 */
export class Knapsack01Strategy implements IAlgorithmStrategy {
  public readonly modelId = '01-knapsack';

  public canHandle(modelId: string): boolean {
    return ['01-knapsack', 'knapsack-01', 'knapsack-01-2d', 'knapsack-01-1d'].includes(modelId);
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, isMemo, anchorMap } = params;
    const weights = (model.defaultParams as any)?.weights || [1, 3, 4];
    const values = (model.defaultParams as any)?.values || [15, 20, 30];
    const bagWeight = (model.defaultParams as any)?.bagWeight || (model.defaultParams as any)?.n || 4;

    const domainConfig: KnapsackDomainConfig = {
      modelId: model.id,
      kind: '01-standard',
      items: weights.map((w: number, idx: number) => ({
        index: idx,
        weight: Number(w),
        value: Number(values[idx] ?? w),
        label: `物品${idx}(w=${w},v=${values[idx] ?? w})`
      })),
      capacity: Number(bagWeight),
      anchorMap,
      isMemo: Boolean(isMemo)
    };

    return KnapsackStepMatrixCompiler.compile(domainConfig, stage);
  }
}
