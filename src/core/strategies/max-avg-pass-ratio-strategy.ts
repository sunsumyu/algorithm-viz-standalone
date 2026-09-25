/**
 * 最大平均通过率 策略适配器 (MaxAvgPassRatioStrategy)
 * 遵循身材红线规范 (LOC < 120 行)，归约为边际增量大根堆与有限资源调度族群，委托统一深模块编译器
 * 对应 LeetCode 1792
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { ResourceGreedyStepCompiler } from './resource-greedy-step-compiler';

export class MaxAvgPassRatioStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('max-avg-pass-ratio');
  }

  public override canHandle(modelId: string): boolean {
    return modelId === 'max-avg-pass-ratio';
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    let classes =
      options?.customInputs?.classes ??
      options?.customInputs?.['input-classes'] ??
      options?.classes ??
      model.defaultParams?.classes;

    let extraStudents =
      options?.customInputs?.extraStudents ??
      options?.customInputs?.['input-extra'] ??
      options?.extraStudents ??
      model.defaultParams?.extraStudents;

    if (typeof classes === 'string') {
      try {
        const parsed = JSON.parse(classes);
        if (Array.isArray(parsed)) {
          classes = parsed.map((c: any) => [Number(c[0] ?? 0), Number(c[1] ?? 1)]);
        }
      } catch {
        classes = classes
          .split(';')
          .map((pair: string) => {
            const parts = pair.trim().split(',').map((s: string) => parseInt(s.trim(), 10));
            return [parts[0] || 0, parts[1] || 1] as [number, number];
          })
          .filter(([, t]: [number, number]) => t > 0);
      }
    }

    if (typeof extraStudents === 'string') {
      extraStudents = parseInt(extraStudents.trim(), 10);
    }

    if (!Array.isArray(classes) || classes.length === 0) {
      classes = [[1, 2], [3, 5], [2, 2]];
    }
    if (typeof extraStudents !== 'number' || isNaN(extraStudents) || extraStudents < 0) {
      extraStudents = 2;
    }

    return ResourceGreedyStepCompiler.compile(
      model,
      {
        problemId: 'max-avg-pass-ratio',
        classes,
        extraStudents,
        direction,
        anchorMap: options?.anchorMap,
      },
      stage
    );
  }
}
