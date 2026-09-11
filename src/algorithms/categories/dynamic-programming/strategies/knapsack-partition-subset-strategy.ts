import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { KnapsackStepMatrixCompiler, KnapsackDomainConfig } from './knapsack-step-matrix-compiler';

/**
 * 分割等和子集 (Partition Equal Subset Sum) 0-1 背包 DP 独立策略
 * 遵循深模块设计原则与单一职责原则，策略门面仅负责参数解析与领域配置组装，
 * 步骤矩阵全量推导演化全权委托给 KnapsackStepMatrixCompiler 编译流水线。
 */
export class KnapsackPartitionSubsetStrategy implements IAlgorithmStrategy {
  public readonly modelId = 'partition-equal-subset-sum';

  public canHandle(modelId: string): boolean {
    return modelId === this.modelId;
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, isMemo, anchorMap } = params;
    const rawNums = (model.defaultParams as any)?.nums || [1, 5, 11, 5];
    const nums: number[] = Array.isArray(rawNums) ? rawNums : String(rawNums).split(',').map(Number);
    const sum = nums.reduce((a, b) => a + b, 0);
    const hasOddFail = sum % 2 !== 0;
    const target = hasOddFail ? 0 : sum / 2;

    const domainConfig: KnapsackDomainConfig = {
      modelId: this.modelId,
      kind: 'partition-subset',
      items: nums.map((num, idx) => ({
        index: idx,
        weight: num,
        value: num,
        label: `nums[${idx}]=${num}`
      })),
      capacity: target,
      anchorMap,
      isMemo: Boolean(isMemo),
      oddCheck: {
        hasOddFail,
        sum
      }
    };

    return KnapsackStepMatrixCompiler.compile(domainConfig, stage);
  }
}
