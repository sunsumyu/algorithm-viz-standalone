import { describe, it, expect } from 'vitest';
import {
  buildCourseScheduleStage1Steps,
  buildCourseScheduleStage2Steps,
  buildCourseScheduleStage3Steps,
  parseCourseScheduleInput,
} from './course-schedule-iii-step-compiler';

describe('Course Schedule III Step Compiler', () => {
  const sampleCourses = [[100, 200], [200, 1300], [1000, 1250], [2000, 3200]];

  it('Stage 1 generates valid brute force steps', () => {
    const steps = buildCourseScheduleStage1Steps([[100, 200], [200, 1300]]);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');
    expect(steps[steps.length - 1].selectedCount).toBe(2);
  });

  it('Stage 2 generates regret greedy steps with heap and line linkage', () => {
    const steps = buildCourseScheduleStage2Steps(sampleCourses);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].line).toBeGreaterThanOrEqual(1);
    const last = steps[steps.length - 1];
    expect(last.selectedCount).toBe(3);

    // Test regret case
    const regretSteps = buildCourseScheduleStage2Steps([[5, 5], [4, 6], [2, 6]]);
    const regretStep = regretSteps.find((s) => s.regretEvent !== undefined);
    expect(regretStep).toBeDefined();
    expect(regretStep?.regretEvent?.replacedDuration).toBe(5);
    expect(regretStep?.regretEvent?.newDuration).toBe(4);
  });

  it('Stage 3 generates exchange argument steps', () => {
    const steps = buildCourseScheduleStage3Steps(sampleCourses);
    expect(steps.length).toBeGreaterThanOrEqual(2);
    expect(steps[0].decision).toContain('阶段 3');
  });

  it('parseCourseScheduleInput handles custom inputs across all stages', () => {
    const s1 = parseCourseScheduleInput({ 'input-courses': '5,5; 4,6; 2,6' }, 1);
    const s2 = parseCourseScheduleInput({ 'input-courses': '5,5; 4,6; 2,6' }, 2);
    const s3 = parseCourseScheduleInput({ 'input-courses': '5,5; 4,6; 2,6' }, 3);
    expect(s1.length).toBeGreaterThan(0);
    expect(s2.length).toBeGreaterThan(0);
    expect(s3.length).toBeGreaterThan(0);
  });
});
