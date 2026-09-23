/**
 * 最多可以参加的会议数目 策略适配器 (MeetingOneDayStrategy)
 * 遵循身材红线标准 (LOC < 120 行)，负责提取参数并委托统一核心编译器
 * 对应 LeetCode 1353 / 左程云 090 Code04
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { IntervalSchedulingStepCompiler } from './interval-scheduling-step-compiler';

export class MeetingOneDayStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('meeting-one-day');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawEvents =
      options?.customInputs?.events ??
      options?.customInputs?.['input-events'] ??
      model.defaultParams?.events;

    const events = this.parseEvents(rawEvents);

    return IntervalSchedulingStepCompiler.compileMeetingOneDay(
      model,
      events,
      stage,
      direction,
      options?.anchorMap
    );
  }

  private parseEvents(raw: any): [number, number][] {
    const fallback: [number, number][] = [[1, 2], [2, 3], [3, 4], [1, 2]];
    if (Array.isArray(raw) && raw.length > 0) {
      const valid = raw
        .map((item) => (Array.isArray(item) ? [Number(item[0]), Number(item[1])] : null))
        .filter((iv): iv is [number, number] => iv !== null && !isNaN(iv[0]) && !isNaN(iv[1]));
      if (valid.length > 0) return valid;
    }
    if (typeof raw === 'string') {
      const pairs = raw.split(/[;；\n]+/).map((s) => s.trim()).filter(Boolean);
      const res: [number, number][] = [];
      for (const p of pairs) {
        const nums = p.split(/[,，\s]+/).map(Number).filter((n) => !isNaN(n));
        if (nums.length >= 2) res.push([Math.min(nums[0], nums[1]), Math.max(nums[0], nums[1])]);
      }
      if (res.length > 0) return res;
    }
    return fallback;
  }
}
