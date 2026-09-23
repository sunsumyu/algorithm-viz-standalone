/**
 * 完成任务的最少初始能量 策略适配器 (MinimumInitialEnergyStrategy)
 * 遵循身材红线规范 (LOC < 120 行)，归约为差值排序贪心族群，委托统一深模块编译器
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { ResourceGreedyStepCompiler } from './resource-greedy-step-compiler';

export class MinimumInitialEnergyStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('minimum-initial-energy-to-finish-tasks');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawTasks =
      options?.customInputs?.tasks ??
      options?.customInputs?.['input-tasks'] ??
      options?.tasks ??
      model.defaultParams?.tasks ??
      [[1, 2], [2, 4], [4, 8]];

    const tasks = this.parseTasks(rawTasks, [[1, 2], [2, 4], [4, 8]]);

    return ResourceGreedyStepCompiler.compileMinimumInitialEnergy(
      model,
      {
        tasks,
        direction,
        anchorMap: options?.anchorMap,
        problemId: this.modelId,
      },
      stage
    );
  }

  private parseTasks(raw: any, fallback: [number, number][]): [number, number][] {
    if (Array.isArray(raw) && raw.length > 0) {
      if (Array.isArray(raw[0])) {
        return raw.map((item: any) => [Number(item[0]) || 0, Number(item[1]) || 0]);
      }
    }
    if (typeof raw === 'string') {
      const parsed = raw.split(';').map(t => {
        const parts = t.trim().split(/[,，\s]+/).map(s => parseInt(s.trim(), 10));
        return [parts[0] || 0, parts[1] || 0] as [number, number];
      }).filter(([a, m]) => a > 0 || m > 0);
      if (parsed.length > 0) return parsed;
    }
    return fallback;
  }
}
