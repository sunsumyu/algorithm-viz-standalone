// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { canJumpSteps } from './can-jump-step-compiler';
import { renderCanJumpCanvas } from './can-jump-canvas-adapter';

describe('CanJumpStepCompiler', () => {
  it('handles length <= 1 gracefully', () => {
    const steps = canJumpSteps([0]);
    expect(steps.length).toBe(1);
    expect(steps[0].action).toBe('success');
    expect(steps[0].canJump).toBe(true);
    expect(steps[0].line).toBeGreaterThanOrEqual(1);
  });

  it('correctly calculates reachability for valid jumps', () => {
    const steps = canJumpSteps([2, 3, 1, 1, 4]);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].action).toBe('init');
    const last = steps[steps.length - 1];
    expect(last.action).toBe('success');
    expect(last.canJump).toBe(true);
    for (const step of steps) {
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.message).toBeTruthy();
    }
  });

  it('correctly calculates blocked scenario', () => {
    const steps = canJumpSteps([3, 2, 1, 0, 4]);
    const last = steps[steps.length - 1];
    expect(last.action).toBe('blocked');
    expect(last.canJump).toBe(false);
  });

  it('renders canvas properly', () => {
    const container = document.createElement('div');
    const steps = canJumpSteps([2, 3, 1, 1, 4]);
    renderCanJumpCanvas(container, steps[1]);
    expect(container.innerHTML).toContain('当前最远覆盖范围');
  });
});
