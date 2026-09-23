/**
 * 根据身高重建队列策略适配器 (ReconstructQueueStrategy)
 * 遵循身材红线标准 (LOC < 120 行)，负责参数提取与委托核心编译器 TwoSequenceGreedyStepCompiler
 * 对应 LeetCode 406
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { TwoSequenceGreedyStepCompiler } from './two-sequence-greedy-step-compiler';

export class ReconstructQueueStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('reconstruct-queue');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawPeople = options?.customInputs?.people ?? model.defaultParams?.people;
    const people = this.parsePeople(rawPeople, [[7, 0], [4, 4], [7, 1], [5, 0], [6, 1], [5, 2]]);

    return TwoSequenceGreedyStepCompiler.compileReconstructQueue(
      model,
      {
        people,
        direction,
        anchorMap: options?.anchorMap,
      },
      direction,
      stage
    );
  }

  private parsePeople(raw: any, fallback: number[][]): number[][] {
    if (Array.isArray(raw) && raw.length > 0 && Array.isArray(raw[0])) {
      return raw.map(pair => [Number(pair[0]), Number(pair[1])]);
    }
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      if (trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          if (Array.isArray(parsed) && parsed.length > 0 && Array.isArray(parsed[0])) {
            return parsed.map(pair => [Number(pair[0]), Number(pair[1])]);
          }
        } catch {
          // ignore
        }
      }
    }
    return fallback;
  }
}
