import { describe, it, expect } from 'vitest';
import {
  buildTaskSchedulerSteps,
  TASK_SCHEDULER_CODES,
} from './task-scheduler-step-compiler';

describe('Task Scheduler Step Compiler', () => {
  it('generates steps for standard case with idle slots', () => {
    const steps = buildTaskSchedulerSteps('AAABBB', 2);
    expect(steps.length).toBeGreaterThanOrEqual(5);
    expect(steps[0].decision).toContain('主函数入口');
    expect(steps[0].line).toBeGreaterThanOrEqual(1);

    const last = steps[steps.length - 1];
    expect(last.totalTime).toBe(8);
    expect(last.idleCount).toBe(2);
  });

  it('generates steps when tasks are diverse without idle slots', () => {
    const steps = buildTaskSchedulerSteps('AAABBBCCCDDDEEE', 2);
    const last = steps[steps.length - 1];
    expect(last.totalTime).toBe(15);
    expect(last.idleCount).toBe(0);
  });

  it('has four language code definitions', () => {
    expect(TASK_SCHEDULER_CODES.java).toBeDefined();
    expect(TASK_SCHEDULER_CODES.cpp).toBeDefined();
    expect(TASK_SCHEDULER_CODES.python).toBeDefined();
    expect(TASK_SCHEDULER_CODES.javascript).toBeDefined();
  });
});
