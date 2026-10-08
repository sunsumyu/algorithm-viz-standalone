// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { wiggleSubsequenceSteps } from './wiggle-subsequence-step-compiler';
import { renderWiggleSubsequenceCanvas } from './wiggle-subsequence-canvas-adapter';

describe('WiggleSubsequenceStepCompiler', () => {
  it('handles length <= 1 gracefully', () => {
    const steps = wiggleSubsequenceSteps([1]);
    expect(steps.length).toBe(1);
    expect(steps[0].action).toBe('done');
    expect(steps[0].length).toBe(1);
    expect(steps[0].line).toBeGreaterThanOrEqual(1);
  });

  it('correctly calculates longest wiggle subsequence', () => {
    const steps = wiggleSubsequenceSteps([1, 17, 5, 10, 13, 15, 10, 5, 16, 8]);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].action).toBe('init');
    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    expect(last.length).toBe(7);
    for (const step of steps) {
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
    }
  });

  it('renders canvas properly', () => {
    const container = document.createElement('div');
    const emptySteps = wiggleSubsequenceSteps([]);
    renderWiggleSubsequenceCanvas(container, emptySteps[0]);
    expect(container.innerHTML).toContain('输入为空');

    const steps = wiggleSubsequenceSteps([1, 7, 4, 9]);
    renderWiggleSubsequenceCanvas(container, steps[1]);
    expect(container.innerHTML).toContain('svg');
    expect(container.innerHTML).toContain('circle');
  });
});
