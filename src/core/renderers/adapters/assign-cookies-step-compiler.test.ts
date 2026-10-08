// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { assignCookiesSteps } from './assign-cookies-step-compiler';
import { renderAssignCookiesCanvas } from './assign-cookies-canvas-adapter';

describe('AssignCookiesStepCompiler', () => {
  it('correctly satisfies children greedily', () => {
    const steps = assignCookiesSteps([1, 2, 3], [1, 1]);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].phase).toBe('init');
    const last = steps[steps.length - 1];
    expect(last.phase).toBe('done');
    expect(last.satisfiedCount).toBe(1);
    for (const step of steps) {
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.message).toBeTruthy();
    }
  });

  it('correctly satisfies all children when cookies are sufficient', () => {
    const steps = assignCookiesSteps([1, 2], [1, 2, 3]);
    const last = steps[steps.length - 1];
    expect(last.phase).toBe('done');
    expect(last.satisfiedCount).toBe(2);
  });

  it('renders canvas properly', () => {
    const container = document.createElement('div');
    const steps = assignCookiesSteps([1, 2], [1, 2]);
    renderAssignCookiesCanvas(container, steps[1]);
    expect(container.innerHTML).toContain('孩子胃口数组');
    expect(container.innerHTML).toContain('饼干尺寸数组');
  });
});
