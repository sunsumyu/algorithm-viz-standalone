/**
 * K 次取反后最大化的数组和策略适配器 (MaximizeSumKStrategy)
 * 遵循身材红线标准 (LOC < 120 行)，仅负责参数提取、归约转换与委托核心编译器
 * 对应 LeetCode 1005
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { ResourceGreedyStepCompiler } from './resource-greedy-step-compiler';

export class MaximizeSumKStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('maximize-sum-k');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawNums = options?.customInputs?.nums ?? model.defaultParams?.nums;
    const nums = this.parseSequence(rawNums, [2, -3, -1, 5, -4]);
    const rawK = options?.customInputs?.k ?? model.defaultParams?.k ?? 2;
    const k = typeof rawK === 'number' ? rawK : (parseInt(String(rawK), 10) || 2);

    return ResourceGreedyStepCompiler.compileMaximizeSumK(
      model,
      {
        nums,
        k,
        direction,
        anchorMap: options?.anchorMap,
      },
      stage
    );
  }

  private parseSequence(raw: any, fallback: number[]): number[] {
    if (Array.isArray(raw)) return raw.map(Number);
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed)) return parsed.map(Number);
        } catch {
          // ignore
        }
      }
      return trimmed.split(/[\s,]+/).filter(Boolean).map(Number);
    }
    return fallback;
  }
}
