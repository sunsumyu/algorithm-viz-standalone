/**
 * 分发饼干算法策略适配器 (AssignCookiesStrategy)
 * 遵循身材红线标准 (LOC < 120 行)，仅负责参数提取、归约转换与委托核心编译器
 * 对应 LeetCode 455
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { TwoSequenceGreedyStepCompiler } from './two-sequence-greedy-step-compiler';

export class AssignCookiesStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('assign-cookies');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawG = options?.customInputs?.g ?? model.defaultParams?.g;
    const rawS = options?.customInputs?.s ?? model.defaultParams?.s;
    const g = this.parseSequence(rawG, [1, 2, 3]);
    const s = this.parseSequence(rawS, [1, 2, 4]);

    return TwoSequenceGreedyStepCompiler.compile(
      model,
      {
        seqA: g,
        seqB: s,
        direction,
        domainContext: {
          seqALabel: '孩子胃口 (g)',
          seqBLabel: '饼干尺寸 (s)',
          itemALabel: '孩子',
          itemBLabel: '饼干',
          targetMetric: '满足孩子数',
        },
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
