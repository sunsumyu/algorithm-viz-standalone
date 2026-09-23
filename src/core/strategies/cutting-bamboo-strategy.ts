/**
 * 砍竹子 II 策略适配器 (CuttingBambooStrategy)
 * 遵循身材红线规范 (LOC < 120 行)，负责提取参数并委托核心深模块编译器
 * 对应 LeetCode 343 / 剑指 Offer 14-II / 左程云 090 Code01
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { ResourceGreedyStepCompiler } from './resource-greedy-step-compiler';

export class CuttingBambooStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('cutting-bamboo');
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
      options?.customInputs?.bamboo_len ??
      model.defaultParams?.n;

    const n = this.parseN(rawN);

    return ResourceGreedyStepCompiler.compileCuttingBamboo(
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
    if (typeof raw === 'number' && !isNaN(raw) && raw >= 2) {
      return Math.min(Math.floor(raw), 1000);
    }
    if (typeof raw === 'string') {
      const parsed = parseInt(raw.trim(), 10);
      if (!isNaN(parsed) && parsed >= 2) {
        return Math.min(parsed, 1000);
      }
    }
    return fallback;
  }
}
