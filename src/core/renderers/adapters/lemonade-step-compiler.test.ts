// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildLemonadeSteps } from './lemonade-step-compiler';
import { renderLemonadeCanvas } from './lemonade-canvas-adapter';

describe('LemonadeStepCompiler', () => {
  it('handles empty customer queue', () => {
    const steps = buildLemonadeSteps([]);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].success).toBe(true);
    expect(steps[0].action).toBe('done');
    expect(steps[0].line).toBeGreaterThanOrEqual(1);
  });

  it('correctly handles successful change with 5, 10, 20', () => {
    const steps = buildLemonadeSteps([5, 5, 5, 10, 20]);
    expect(steps.length).toBeGreaterThan(3);
    const last = steps[steps.length - 1];
    expect(last.success).toBe(true);
    expect(last.action).toBe('done');
    expect(last.fiveCount).toBe(1);
    expect(last.tenCount).toBe(0);
    for (const step of steps) {
      expect(step.line).toBeGreaterThanOrEqual(1);
    }
  });

  it('correctly fails when change is insufficient', () => {
    const steps = buildLemonadeSteps([5, 5, 10, 10, 20]);
    expect(steps.length).toBeGreaterThan(2);
    const last = steps[steps.length - 1];
    expect(last.success).toBe(false);
    expect(last.action).toBe('fail');
  });

  it('renders canvas properly for both empty and normal steps', () => {
    const container = document.createElement('div');
    const emptySteps = buildLemonadeSteps([]);
    renderLemonadeCanvas(container, emptySteps[0]);
    expect(container.innerHTML).toContain('没有顾客排队');

    const steps = buildLemonadeSteps([5, 10]);
    renderLemonadeCanvas(container, steps[1]);
    expect(container.innerHTML).toContain('收银台现钞储备');
  });
});
