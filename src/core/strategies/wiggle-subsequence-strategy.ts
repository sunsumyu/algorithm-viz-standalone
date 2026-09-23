/**
 * 摆动序列策略适配器 (WiggleSubsequenceStrategy)
 * 遵循身材红线标准 (LOC < 120 行)，负责参数提取与委托核心编译器 TwoPassNeighborStepCompiler
 * 对应 LeetCode 376
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { TwoPassNeighborStepCompiler } from './two-pass-neighbor-step-compiler';

export class WiggleSubsequenceStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('wiggle-subsequence');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawNums = options?.customInputs?.nums ?? model.defaultParams?.nums;
    const nums = this.parseSequence(rawNums, [1, 7, 4, 9, 2, 5]);

    return TwoPassNeighborStepCompiler.compileWiggleSubsequence(
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
