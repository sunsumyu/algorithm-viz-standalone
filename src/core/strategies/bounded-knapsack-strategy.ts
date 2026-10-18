import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { KnapsackStepMatrixCompiler, type KnapsackDomainConfig } from './knapsack-step-matrix-compiler';

/**
 * 多重背包朴素枚举 (Bounded Knapsack Naive / 洛谷 P1776) 独立算法策略模块
 * 负责参数提取与领域配置装配，推导矩阵委托至 KnapsackStepMatrixCompiler
 */
export class BoundedKnapsackStrategy implements IAlgorithmStrategy {
  public readonly modelId = 'bounded-knapsack-naive';

  public canHandle(modelId: string): boolean {
    return [
      'bounded-knapsack-naive',
      'class075-code01',
      'bounded-knapsack-naive-075',
      'multiple-knapsack-naive',
      'luogu-p1776-naive',
    ].includes(modelId);
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, isMemo, anchorMap } = params;
    const rawWeights = (model.defaultParams as any)?.weights ?? [2, 3, 5];
    const rawValues = (model.defaultParams as any)?.values ?? [3, 4, 7];
    const rawNums = (model.defaultParams as any)?.nums ?? [2, 3, 2];
    const rawBag = (model.defaultParams as any)?.bagWeight ?? (model.defaultParams as any)?.t ?? 10;

    const weights: number[] = Array.isArray(rawWeights) ? rawWeights.map(Number) : String(rawWeights).split(',').map(Number);
    const values: number[] = Array.isArray(rawValues) ? rawValues.map(Number) : String(rawValues).split(',').map(Number);
    const nums: number[] = Array.isArray(rawNums) ? rawNums.map(Number) : String(rawNums).split(',').map(Number);
    const bagWeight = Number(rawBag);

    const domainConfig: KnapsackDomainConfig = {
      modelId: model.id,
      kind: 'multiple-knapsack',
      items: weights.map((w, idx) => ({
        index: idx,
        weight: w,
        value: values[idx] ?? w,
        count: nums[idx] ?? 1,
        label: `宝物${idx + 1}(w=${w},v=${values[idx] ?? w},限${nums[idx] ?? 1}件)`,
      })),
      capacity: bagWeight,
      anchorMap,
      isMemo: Boolean(isMemo),
    };

    return KnapsackStepMatrixCompiler.compile(domainConfig, stage);
  }
}
