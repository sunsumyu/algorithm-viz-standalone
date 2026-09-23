/**
 * 最大子数组和策略适配器 (MaxSubarrayStrategy)
 * 遵循身材红线标准 (LOC < 120 行)，负责参数提取与委托核心编译器 TwoPassNeighborStepCompiler
 * 对应 LeetCode 53
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { TwoPassNeighborStepCompiler } from './two-pass-neighbor-step-compiler';

export class MaxSubarrayStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('max-subarray');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawNums = options?.customInputs?.nums ?? model.defaultParams?.nums;
    const nums = this.parseSequence(rawNums, [-2, 1, -3, 4, -1, 2, 1, -5, 4]);

    return TwoPassNeighborStepCompiler.compileMaxSubarray(
      model,
      {
        nums,
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
