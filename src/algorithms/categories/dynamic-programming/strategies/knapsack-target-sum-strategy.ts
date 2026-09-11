import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { KnapsackStepMatrixCompiler, KnapsackDomainConfig } from './knapsack-step-matrix-compiler';

/**
 * 目标和 (Target Sum, LeetCode 494) 独立算法策略模块
 * 数学转化：P - N = target 且 P + N = sum → P = (sum + target) / 2
 * 等价于 0-1 背包求装满容量 bag 的方案数 (计数累加)
 * 步骤矩阵全量推导委托 KnapsackStepMatrixCompiler 编译流水线。
 */
export class KnapsackTargetSumStrategy implements IAlgorithmStrategy {
  public readonly modelId = 'target-sum';

  public canHandle(modelId: string): boolean {
    return modelId === 'target-sum';
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const { stage, isMemo, anchorMap } = params;

    const rawNums = (model.defaultParams as any)?.nums || [1, 1, 1, 1, 1];
    const nums: number[] = Array.isArray(rawNums)
      ? rawNums.map(Number)
      : String(rawNums).split(',').map((x: string) => Number(x.trim())).filter((x: number) => !isNaN(x));
    const target = Number((model.defaultParams as any)?.target ?? 3);

    const sum = nums.reduce((a, b) => a + b, 0);
    const isValid = Math.abs(target) <= sum && (sum + target) % 2 === 0;
    const bag = isValid ? (sum + target) / 2 : 0;

    const domainConfig: KnapsackDomainConfig = {
      modelId: 'target-sum',
      kind: 'target-sum',
      items: nums.map((num, idx) => ({
        index: idx,
        weight: num,
        value: 1,
        label: `nums[${idx}]=${num}`
      })),
      capacity: bag,
      anchorMap,
      isMemo: Boolean(isMemo),
      oddCheck: {
        hasOddFail: !isValid,
        sum,
        oddMessage: !isValid
          ? `|target|=${Math.abs(target)} > sum=${sum} 或 (sum+target)=${sum + target} 为奇数，无解直接返回 0`
          : undefined
      }
    };

    return KnapsackStepMatrixCompiler.compile(domainConfig, stage);
  }
}
