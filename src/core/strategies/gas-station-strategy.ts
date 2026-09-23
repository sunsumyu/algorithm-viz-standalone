/**
 * 加油站算法策略适配器 (GasStationStrategy)
 * 遵循身材红线标准 (LOC < 120 行)，仅负责参数提取、归约转换与委托核心编译器
 * 对应 LeetCode 134
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { ResourceGreedyStepCompiler } from './resource-greedy-step-compiler';

export class GasStationStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('gas-station');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawGas = options?.customInputs?.gas ?? model.defaultParams?.gas;
    const rawCost = options?.customInputs?.cost ?? model.defaultParams?.cost;
    const gas = this.parseSequence(rawGas, [1, 2, 3, 4, 5]);
    const cost = this.parseSequence(rawCost, [3, 4, 5, 1, 2]);

    return ResourceGreedyStepCompiler.compileGasStation(
      model,
      {
        gas,
        cost,
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
