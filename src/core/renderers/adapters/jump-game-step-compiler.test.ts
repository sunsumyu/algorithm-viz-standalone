// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildJumpGameSteps } from './jump-game-step-compiler';
import { renderJumpGameCanvas } from './jump-game-canvas-adapter';

describe('JumpGameStepCompiler', () => {
  it('handles length <= 1 gracefully', () => {
    const steps = buildJumpGameSteps([0]);
    expect(steps.length).toBe(1);
    expect(steps[0].action).toBe('done');
    expect(steps[0].jumpCount).toBe(0);
    expect(steps[0].line).toBeGreaterThanOrEqual(1);
  });

  it('correctly calculates minimum jumps', () => {
    const steps = buildJumpGameSteps([2, 3, 1, 1, 4]);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].jumpCount).toBe(0);
    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    expect(last.jumpCount).toBe(2);
    for (const step of steps) {
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
    }
  });

  it('renders canvas properly', () => {
    const container = document.createElement('div');
    const emptySteps = buildJumpGameSteps([]);
    renderJumpGameCanvas(container, emptySteps[0]);
    expect(container.innerHTML).toContain('输入为空');

    const steps = buildJumpGameSteps([2, 3, 1]);
    renderJumpGameCanvas(container, steps[1]);
    expect(container.innerHTML).toContain('当前步边界');
  });
});
