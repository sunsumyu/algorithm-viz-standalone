import { describe, it, expect } from 'vitest';
import { buildNQueenSteps, MAX_STEPS } from './nqueen-renderer';

describe('NQueen (回溯算法推导与约束检查)', () => {
  it('1. n=1 应当立即找到 1 个解', () => {
    const steps = buildNQueenSteps(1);
    expect(steps.length).toBeGreaterThan(0);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.action).toBe('done');
    expect(lastStep.solutions).toBe(1);
    expect(lastStep.message).toContain('共找到 1 个解');
  });

  it('2. n=2 和 n=3 应当无解', () => {
    const steps2 = buildNQueenSteps(2);
    const lastStep2 = steps2[steps2.length - 1];
    expect(lastStep2.solutions).toBe(0);
    expect(lastStep2.message).toContain('无解');

    const steps3 = buildNQueenSteps(3);
    const lastStep3 = steps3[steps3.length - 1];
    expect(lastStep3.solutions).toBe(0);
    expect(lastStep3.message).toContain('无解');
  });

  it('3. n=4 应当找到 2 个解并产生回溯与冲突记录', () => {
    const steps = buildNQueenSteps(4);
    expect(steps.length).toBeGreaterThan(0);
    const lastStep = steps[steps.length - 1];
    expect(lastStep.solutions).toBe(2);

    const conflictSteps = steps.filter((s) => s.action === 'conflict');
    expect(conflictSteps.length).toBeGreaterThan(0);
    expect(conflictSteps[0].conflicts.length).toBeGreaterThan(0);

    const backtrackSteps = steps.filter((s) => s.action === 'backtrack');
    expect(backtrackSteps.length).toBeGreaterThan(0);
  });

  it('4. 大规模输入步数应当受到 MAX_STEPS 截断限制', () => {
    const steps = buildNQueenSteps(8);
    expect(steps.length).toBeLessThanOrEqual(MAX_STEPS + 1);
  });
});
