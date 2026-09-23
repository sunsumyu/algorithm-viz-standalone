/**
 * 吃掉 N 个橘子的最少天数 策略适配器 (MinimumEatOrangesStrategy)
 * 遵循身材红线规范 (LOC < 120 行)，负责提取参数并委托核心编译器
 * 对应 LeetCode 1553 / 左程云 089 Code04
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { ResourceGreedyStepCompiler } from './resource-greedy-step-compiler';

export class MinimumEatOrangesStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('minimum-eat-oranges');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawN =
      options?.customInputs?.n ??
      options?.customInputs?.['input-n'] ??
      model.defaultParams?.n;

    const n = this.parseN(rawN);

    return ResourceGreedyStepCompiler.compileMinimumEatOranges(
      model,
      {
        n,
        direction,
        anchorMap: options?.anchorMap,
      },
      stage
    );
  }

  private parseN(raw: any): number {
    const fallback = 10;
    if (typeof raw === 'number' && !isNaN(raw) && raw >= 1) {
      return Math.min(Math.floor(raw), 1000);
    }
    if (typeof raw === 'string') {
      const parsed = parseInt(raw.trim(), 10);
      if (!isNaN(parsed) && parsed >= 1) {
        return Math.min(parsed, 1000);
      }
    }
    return fallback;
  }
}
