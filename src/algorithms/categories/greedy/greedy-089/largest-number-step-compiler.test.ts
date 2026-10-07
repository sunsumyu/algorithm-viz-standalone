import { describe, it, expect } from 'vitest';
import {
  buildLargestNumberStage1Steps,
  buildLargestNumberStage2Steps,
  buildLargestNumberStage3Steps,
  parseLargestNumberInput,
} from './largest-number-step-compiler';

describe('Largest Number Step Compiler', () => {
  it('Stage 1 generates valid permutation steps', () => {
    const steps = buildLargestNumberStage1Steps([10, 2]);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');
    expect(steps[steps.length - 1].finalAns).toBe('210');
  });

  it('Stage 2 generates greedy sorting steps with exchange balance and leading zero guard', () => {
    const steps = buildLargestNumberStage2Steps([3, 30, 34, 5, 9]);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].line).toBeGreaterThanOrEqual(1);
    const last = steps[steps.length - 1];
    expect(last.finalAns).toBe('9534330');

    // Test zero guard
    const zeroSteps = buildLargestNumberStage2Steps([0, 0]);
    expect(zeroSteps[zeroSteps.length - 1].finalAns).toBe('0');
  });

  it('Stage 3 generates exchange argument steps', () => {
    const steps = buildLargestNumberStage3Steps([10, 2]);
    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(steps[0].decision).toContain('阶段 3');
  });

  it('parseLargestNumberInput handles presets and custom inputs', () => {
    const s1 = parseLargestNumberInput({ 'input-nums': '10, 2' }, 1);
    const s2 = parseLargestNumberInput({ 'input-nums': '10, 2' }, 2);
    const s3 = parseLargestNumberInput({ 'input-nums': '10, 2' }, 3);
    expect(s1.length).toBeGreaterThan(0);
    expect(s2.length).toBeGreaterThan(0);
    expect(s3.length).toBeGreaterThan(0);
  });
});
