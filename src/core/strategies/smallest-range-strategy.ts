/**
 * 最小区间 策略适配器 (SmallestRangeStrategy)
 * 遵循身材红线规范 (LOC < 80 行)，负责提取参数并委托统一深模块编译器
 * 对应：LeetCode 632 / 左程云 091 Code06
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { ResourceGreedyStepCompiler } from './resource-greedy-step-compiler';

export class SmallestRangeStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('smallest-range-covering-elements-from-k-lists');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawLists =
      options?.customInputs?.lists ??
      options?.customInputs?.['input-lists'] ??
      model.defaultParams?.lists ??
      [[4, 10, 15, 24, 26], [0, 9, 12, 20], [5, 18, 22, 30]];

    const lists = this.parseLists(rawLists);

    return ResourceGreedyStepCompiler.compileSmallestRange(
      model,
      {
        lists,
        direction,
        anchorMap: options?.anchorMap,
      },
      stage
    );
  }

  private parseLists(raw: any): number[][] {
    const fallback = [[4, 10, 15, 24, 26], [0, 9, 12, 20], [5, 18, 22, 30]];
    if (Array.isArray(raw) && raw.length > 0) {
      const valid = raw
        .map((sub) => (Array.isArray(sub) ? sub.map(Number).filter((n) => !isNaN(n)) : []))
        .filter((sub) => sub.length > 0);
      if (valid.length > 0) return valid;
    }
    if (typeof raw === 'string') {
      try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed
            .map((sub) => (Array.isArray(sub) ? sub.map(Number).filter((n) => !isNaN(n)) : []))
            .filter((sub) => sub.length > 0);
          if (valid.length > 0) return valid;
        }
      } catch {
        // Fallback below
      }
    }
    return fallback;
  }
}
