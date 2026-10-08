// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildCandySteps } from './candy-step-compiler';
import { renderCandyCanvas } from './candy-canvas-adapter';

describe('CandyStepCompiler', () => {
  it('handles empty input gracefully', () => {
    const steps = buildCandySteps([]);
    expect(steps.length).toBe(1);
    expect(steps[0].action).toBe('done');
    expect(steps[0].candies.length).toBe(0);
    expect(steps[0].line).toBeGreaterThanOrEqual(1);
  });

  it('correctly calculates minimum candies with two-pass greedy', () => {
    const steps = buildCandySteps([1, 0, 2]);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].action).toBe('init');
    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    expect(last.candies).toEqual([2, 1, 2]);
    for (const step of steps) {
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.message).toBeTruthy();
    }
  });

  it('handles equal ratings correctly', () => {
    const steps = buildCandySteps([1, 2, 2]);
    const last = steps[steps.length - 1];
    expect(last.candies).toEqual([1, 2, 1]);
  });

  it('renders canvas properly', () => {
    const container = document.createElement('div');
    const steps = buildCandySteps([1, 0, 2]);
    renderCandyCanvas(container, steps[1]);
    expect(container.innerHTML).toContain('遍历阶段');
    expect(container.innerHTML).toContain('当前糖果总数');
  });
});
