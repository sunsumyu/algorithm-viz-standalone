/**
 * 课程表 III 策略适配器 (CourseScheduleIIIStrategy)
 * 遵循身材红线规范 (LOC < 120 行)，负责提取参数并委托核心编译器
 * 对应 LeetCode 630 / 左程云 089 Code02
 */

import { BaseAlgorithmStrategy } from './base-algorithm-strategy';
import type { IYamlAlgorithmModel } from '../interfaces';
import type { UniversalStep } from '../universal-stage-engine';
import { ResourceGreedyStepCompiler } from './resource-greedy-step-compiler';

export class CourseScheduleIIIStrategy extends BaseAlgorithmStrategy {
  constructor() {
    super('course-schedule-iii');
  }

  protected compileStage(
    model: IYamlAlgorithmModel,
    stage: number,
    direction: 'forward' | 'reverse',
    options?: any
  ): UniversalStep[] {
    const rawCourses =
      options?.customInputs?.courses ??
      options?.customInputs?.['input-courses'] ??
      model.defaultParams?.courses;

    const courses = this.parseCourses(rawCourses);

    return ResourceGreedyStepCompiler.compileCourseScheduleIII(
      model,
      {
        courses,
        direction,
        anchorMap: options?.anchorMap,
      },
      stage
    );
  }

  private parseCourses(raw: any): number[][] {
    const fallback = [[100, 200], [200, 1300], [1000, 1250], [2000, 3200]];
    if (Array.isArray(raw) && raw.length > 0) {
      const valid = raw
        .map((item) => (Array.isArray(item) ? [Number(item[0]), Number(item[1])] : null))
        .filter((c): c is [number, number] => c !== null && !isNaN(c[0]) && !isNaN(c[1]));
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
