import { describe, it, expect } from 'vitest';
import {
  buildEatOrangesStage1Steps,
  buildEatOrangesStage2Steps,
  buildEatOrangesStage3Steps,
  parseEatOrangesInput,
} from './minimum-eat-oranges-step-compiler';

describe('Minimum Eat Oranges Step Compiler', () => {
  it('Stage 1 generates brute force steps with tree', () => {
    const steps = buildEatOrangesStage1Steps(6);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].decision).toContain('主函数入口');
    expect(steps[steps.length - 1].finalAns).toBe(3);
  });

  it('Stage 2 generates greedy jump memoized steps with line linkage', () => {
    const steps = buildEatOrangesStage2Steps(10);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].line).toBeGreaterThanOrEqual(1);
    const last = steps[steps.length - 1];
    expect(last.finalAns).toBe(4);
  });

  it('Stage 3 generates jump invariant proof steps', () => {
    const steps = buildEatOrangesStage3Steps(10);
    expect(steps.length).toBeGreaterThanOrEqual(3);
    expect(steps[0].decision).toContain('阶段 3');
  });

  it('parseEatOrangesInput parses numeric input across stages', () => {
    const s1 = parseEatOrangesInput({ 'input-n': 6 }, 1);
    const s2 = parseEatOrangesInput({ 'input-n': 6 }, 2);
    const s3 = parseEatOrangesInput({ 'input-n': 6 }, 3);
    expect(s1.length).toBeGreaterThan(0);
    expect(s2.length).toBeGreaterThan(0);
    expect(s3.length).toBeGreaterThan(0);
  });
});
