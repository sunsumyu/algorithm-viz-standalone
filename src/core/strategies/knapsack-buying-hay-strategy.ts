import type { IAlgorithmStrategy, StageExecutionParams } from './algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { compileBuyingHaySteps } from '../renderers/adapters/buying-hay-step-compiler';

/**
 * 购买足量干草的最小花费独立算法策略 (KnapsackBuyingHayStrategy)
 * 覆盖：洛谷 P2918 [USACO08NOV] Buying Hay S / 左程云 Class 074 Code06
 * 遵循深模块架构，委托 compileBuyingHaySteps 生成四阶段全生命周期步进
 */
export class KnapsackBuyingHayStrategy implements IAlgorithmStrategy {
  public readonly modelId: string;

  constructor(modelId: string = 'buying-hay-min-cost') {
    this.modelId = modelId;
  }

  public canHandle(modelId: string): boolean {
    return (
      modelId === this.modelId ||
      modelId === 'buying-hay-min-cost' ||
      modelId === 'class074-code06' ||
      modelId === 'buying-hay-min-cost-074' ||
      modelId === 'buying-hay' ||
      modelId === 'luogu-p2918'
    );
  }

  public generateSteps(model: IYamlAlgorithmModel, params: StageExecutionParams): UniversalStep[] {
    const rawParams = params.params || {};
    const h = Number(rawParams['input-h'] ?? rawParams.h ?? params.h ?? model.defaultParams?.h ?? 15);

    const parseArr = (v: any, fallback: number[]): number[] => {
      if (Array.isArray(v)) return v.map(Number);
      if (typeof v === 'string') {
        try {
          const parsed = JSON.parse(v);
          if (Array.isArray(parsed)) return parsed.map(Number);
        } catch {
          return v.split(',').map((s) => Number(s.trim())).filter((n) => !isNaN(n));
        }
      }
      return fallback;
    };

    const cost = parseArr(
      rawParams['input-costs'] ?? rawParams.cost ?? rawParams.costs ?? params.cost ?? model.defaultParams?.cost,
      [10, 12]
    );
    const val = parseArr(
      rawParams['input-vals'] ?? rawParams.val ?? rawParams.vals ?? params.val ?? model.defaultParams?.val,
      [8, 16]
    );

    return compileBuyingHaySteps(
      h,
      cost,
      val,
      params.stage,
      Boolean(params.isMemo),
      params.anchorMap,
      params.direction
    );
  }
}
