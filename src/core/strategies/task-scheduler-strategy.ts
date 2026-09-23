/**
 * 任务调度器策略适配器 (TaskSchedulerStrategy)
 * 遵循身材红线标准 (LOC < 120 行)，负责参数提取与委托核心编译器 ResourceGreedyStepCompiler
 * 对应 LeetCode 621
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { ResourceGreedyStepCompiler } from './resource-greedy-step-compiler';

export class TaskSchedulerStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('task-scheduler');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawTasks = options?.customInputs?.tasks ?? model.defaultParams?.tasks;
    const tasks = this.parseTasks(rawTasks, ['A', 'A', 'A', 'B', 'B', 'B']);
    const rawN = options?.customInputs?.n ?? model.defaultParams?.n ?? 2;
    const n = typeof rawN === 'number' ? rawN : (parseInt(String(rawN), 10) || 2);

    return ResourceGreedyStepCompiler.compileTaskScheduler(
      model,
      {
        tasks,
        n,
        direction,
        anchorMap: options?.anchorMap,
      },
      stage
    );
  }

  private parseTasks(raw: any, fallback: string[]): string[] {
    if (Array.isArray(raw) && raw.length > 0) return raw.map(String);
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed.map(String);
        } catch {
          // ignore
        }
      }
      return trimmed.toUpperCase().replace(/[^A-Z]/g, '').split('');
    }
    return fallback;
  }
}
