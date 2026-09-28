/**
 * Class 059: 拓扑排序与 Kahn 算法 自动化测试套件
 */

import { describe, it, expect } from 'vitest';
import { buildCourseScheduleSteps } from './course-schedule-059-renderer';
import { CODE01_COURSE_SCHEDULE_CODES } from './graph-059-stage-codes';
import { renderCourseScheduleBoard } from './graph-059-shared';

function verify1BasedCodeLines(steps: any[], codes: Record<string, string[]>, desc: string) {
  expect(steps.length).toBeGreaterThan(0);
  for (const step of steps) {
    if (step.codeLine) {
      for (const lang of ['java', 'cpp', 'python', 'javascript']) {
        const line = step.codeLine[lang];
        expect(line, `${desc}: Missing line mapping for ${lang}`).toBeDefined();
        expect(line, `${desc}: Line must be >= 1 for ${lang}`).toBeGreaterThanOrEqual(1);
        expect(
          line,
          `${desc}: Line ${line} exceeds code length ${codes[lang].length} for ${lang}`
        ).toBeLessThanOrEqual(codes[lang].length);
      }
    }
  }
}

describe('左神拓扑排序与 Kahn 算法 (Class 059) 测试套件', () => {
  it('标准菱形 DAG 用例: 4门课程顺利完成修读', () => {
    const steps = buildCourseScheduleSteps(4, [
      [1, 0],
      [2, 0],
      [3, 1],
      [3, 2],
    ]);
    expect(steps.length).toBeGreaterThan(0);

    const last = steps[steps.length - 1];
    expect(last.topoOrder.length).toBe(4);
    expect(last.statusBadge?.type).toBe('success');
    expect(last.isCycle).toBe(false);

    verify1BasedCodeLines(steps, CODE01_COURSE_SCHEDULE_CODES, 'Code01');
  });

  it('成环死锁用例: 0->1->2->0 导致无法完成全部课程', () => {
    const steps = buildCourseScheduleSteps(3, [
      [1, 0],
      [2, 1],
      [0, 2],
    ]);
    expect(steps.length).toBeGreaterThan(0);

    const last = steps[steps.length - 1];
    expect(last.topoOrder.length).toBeLessThan(3);
    expect(last.statusBadge?.type).toBe('error');
    expect(last.isCycle).toBe(true);
  });

  it('沙盘渲染纯净契约: 零 h1~h6, 零 [object Object]', () => {
    const steps = buildCourseScheduleSteps();
    for (const step of steps) {
      const html = renderCourseScheduleBoard(step);
      expect(html).not.toMatch(/<h[1-6]/i);
      expect(html).not.toContain('[object Object]');
    }
  });
});
