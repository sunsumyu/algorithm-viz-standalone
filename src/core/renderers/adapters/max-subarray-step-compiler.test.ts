// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildMaxSubarraySteps } from './max-subarray-step-compiler';
import { renderMaxSubarrayCanvas } from './max-subarray-canvas-adapter';

describe('MaxSubarrayStepCompiler', () => {
  it('handles empty input gracefully', () => {
    const steps = buildMaxSubarraySteps([]);
    expect(steps.length).toBe(1);
    expect(steps[0].phase).toBe('done');
    expect(steps[0].maxSum).toBe(0);
    expect(steps[0].line).toBeGreaterThanOrEqual(1);
  });

  it('correctly calculates max subarray sum', () => {
    const steps = buildMaxSubarraySteps([-2, 1, -3, 4, -1, 2, 1, -5, 4]);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].phase).toBe('init');
    const last = steps[steps.length - 1];
    expect(last.phase).toBe('done');
    expect(last.maxSum).toBe(6);
    for (const step of steps) {
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
    }
  });

  it('renders canvas properly', () => {
    const container = document.createElement('div');
    const emptySteps = buildMaxSubarraySteps([]);
    renderMaxSubarrayCanvas(container, emptySteps[0]);
    expect(container.innerHTML).toContain('输入为空');

    const steps = buildMaxSubarraySteps([1, -2, 3]);
    renderMaxSubarrayCanvas(container, steps[1]);
    expect(container.innerHTML).toContain('当前扫描区间');
  });
});
