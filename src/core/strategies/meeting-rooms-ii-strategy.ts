/**
 * 会议室 II 策略适配器 (MeetingRoomsIIStrategy)
 * 遵循身材红线标准 (LOC < 120 行)，负责参数提取与委托核心编译器
 * 对应 LeetCode 253 / 左程云 089 Code05
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { IntervalSchedulingStepCompiler } from './interval-scheduling-step-compiler';

export class MeetingRoomsIIStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('meeting-rooms-ii');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawIntervals =
      options?.customInputs?.intervals ??
      options?.customInputs?.['input-intervals'] ??
      model.defaultParams?.intervals;

    const intervals = this.parseIntervals(rawIntervals);

    return IntervalSchedulingStepCompiler.compileMeetingRoomsII(
      model,
      intervals,
      stage,
      direction,
      options?.anchorMap
    );
  }

  private parseIntervals(raw: any): number[][] {
    const fallback = [[0, 30], [5, 10], [15, 20], [7, 12]];
    if (Array.isArray(raw) && raw.length > 0) {
      const valid = raw
        .map((item) => (Array.isArray(item) ? [Number(item[0]), Number(item[1])] : null))
        .filter((iv): iv is [number, number] => iv !== null && !isNaN(iv[0]) && !isNaN(iv[1]));
      if (valid.length > 0) return valid;
    }
    if (typeof raw === 'string') {
      const pairs = raw.split(/[;；]+/).map((s) => s.trim()).filter(Boolean);
      const res: number[][] = [];
      for (const p of pairs) {
        const nums = p.split(/[,，\s]+/).map(Number).filter((n) => !isNaN(n));
        if (nums.length >= 2) res.push([nums[0], nums[1]]);
      }
      if (res.length > 0) return res;
    }
    return fallback;
  }
}
