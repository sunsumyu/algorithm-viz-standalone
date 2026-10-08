// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildMaxSumKSteps } from './maximize-sum-k-step-compiler';
import { renderMaximizeSumKCanvas } from './maximize-sum-k-canvas-adapter';

describe('MaximizeSumKStepCompiler', () => {
  it('handles empty input gracefully', () => {
    const steps = buildMaxSumKSteps([], 2);
    expect(steps.length).toBe(1);
    expect(steps[0].action).toBe('done');
    expect(steps[0].currentSum).toBe(0);
    expect(steps[0].line).toBeGreaterThanOrEqual(1);
  });

  it('correctly calculates maximized sum after k negations', () => {
    const steps = buildMaxSumKSteps([4, 2, 3], 1);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].action).toBe('sort');
    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    expect(last.currentSum).toBe(5); // 4 + 3 - 2 = 5
    for (const step of steps) {
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.message).toBeTruthy();
    }
  });

  it('renders canvas properly', () => {
    const container = document.createElement('div');
    const steps = buildMaxSumKSteps([4, 2, 3], 1);
    renderMaximizeSumKCanvas(container, steps[1]);
    expect(container.innerHTML).toContain('按绝对值降序排列');
  });
});
