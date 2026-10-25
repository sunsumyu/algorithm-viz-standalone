import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import {
  KnapsackStepMatrixCompiler,
  type KnapsackDomainConfig,
  type KnapsackItem,
} from './knapsack-step-matrix-compiler';

/**
 * 多重背包与二进制拆分专题 (Bounded Knapsack Family / 左程云 Class 075) 统一算法策略模块
 * 支持朴素枚举 (Code01) 与二进制拆分转化为 01 背包 (Code02)
 * 身材红线：LOC < 120 行
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
      'bounded-knapsack-binary',
      'class075-code02',
      'bounded-knapsack-binary-075',
      'multiple-knapsack-binary',
      'luogu-p1776-binary',
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

    const isBinarySplit = [
      'bounded-knapsack-binary',
      'class075-code02',
      'bounded-knapsack-binary-075',
      'multiple-knapsack-binary',
      'luogu-p1776-binary',
    ].includes(model.id);

    let items: KnapsackItem[];
    if (isBinarySplit) {
      items = [];
      let itemIdx = 0;
      for (let i = 0; i < weights.length; i++) {
        let cnt = nums[i] ?? 1;
        const w = weights[i];
        const v = values[i] ?? w;
        for (let k = 1; k <= cnt; k <<= 1) {
          items.push({
            index: itemIdx++,
            weight: k * w,
            value: k * v,
            label: `宝物${i + 1}(×${k},重${k * w},价${k * v})`,
          });
          cnt -= k;
        }
        if (cnt > 0) {
          items.push({
            index: itemIdx++,
            weight: cnt * w,
            value: cnt * v,
            label: `宝物${i + 1}(×${cnt},重${cnt * w},价${cnt * v})`,
          });
        }
      }
    } else {
      items = weights.map((w, idx) => ({
        index: idx,
        weight: w,
        value: values[idx] ?? w,
        count: nums[idx] ?? 1,
        label: `宝物${idx + 1}(w=${w},v=${values[idx] ?? w},限${nums[idx] ?? 1}件)`,
      }));
    }

    const domainConfig: KnapsackDomainConfig = {
      modelId: model.id,
      kind: isBinarySplit ? '01-standard' : 'multiple-knapsack',
      items,
      capacity: bagWeight,
      anchorMap,
      isMemo: Boolean(isMemo),
    };

    return KnapsackStepMatrixCompiler.compile(domainConfig, stage);
  }
}
