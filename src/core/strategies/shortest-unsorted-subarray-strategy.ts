/**
 * 最短无序连续子数组 策略适配器 (ShortestUnsortedSubarrayStrategy)
 * 遵循身材红线规范 (LOC < 80 行)，负责提取参数并委托统一深模块编译器
 * 对应：LeetCode 581 / 左程云 091 Code01
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { TwoPassNeighborStepCompiler } from './two-pass-neighbor-step-compiler';

export class ShortestUnsortedSubarrayStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('shortest-unsorted-continuous-subarray');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawNums =
      options?.customInputs?.nums ??
      options?.customInputs?.['input-nums'] ??
      model.defaultParams?.nums ??
      [2, 6, 4, 8, 10, 9, 15];

    const nums = this.parseNums(rawNums);

    return TwoPassNeighborStepCompiler.compileShortestUnsortedSubarray(
      model,
      nums,
      {
        direction,
        anchorMap: options?.anchorMap,
      },
      stage
    );
  }

  private parseNums(raw: any): number[] {
    const fallback = [2, 6, 4, 8, 10, 9, 15];
    if (Array.isArray(raw) && raw.length > 0) {
      const nums = raw.map(Number).filter((n) => !isNaN(n));
      if (nums.length > 0) return nums;
    }
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const nums = parsed.map(Number).filter((n) => !isNaN(n));
          if (nums.length > 0) return nums;
        }
      } catch {
        const parts = raw.split(/[\s,，]+/).map((s) => s.trim()).filter(Boolean);
        const nums = parts.map(Number).filter((n) => !isNaN(n));
        if (nums.length > 0) return nums;
      }
    }
    return fallback;
  }
}
