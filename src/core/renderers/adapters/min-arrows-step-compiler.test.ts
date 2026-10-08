// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildMinArrowsSteps, parseBalloons } from './min-arrows-step-compiler';
import { renderMinArrowsCanvas } from './min-arrows-canvas-adapter';

describe('MinArrowsStepCompiler', () => {
  it('handles empty input gracefully', () => {
    const steps = buildMinArrowsSteps([]);
    expect(steps.length).toBe(1);
    expect(steps[0].action).toBe('done');
    expect(steps[0].arrowCount).toBe(0);
    expect(steps[0].line).toBeGreaterThanOrEqual(1);
  });

  it('correctly calculates minimum arrows needed', () => {
    const balloons: Array<[number, number]> = [
      [10, 16],
      [2, 8],
      [1, 6],
      [7, 12],
    ];
    const steps = buildMinArrowsSteps(balloons);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].action).toBe('sort');
    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    expect(last.arrowCount).toBe(2);
    for (const step of steps) {
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.message).toBeTruthy();
    }
  });

  it('parses balloons string correctly', () => {
    const parsed = parseBalloons('[[1,2],[3,4]]');
    expect(parsed.length).toBe(2);
    expect(parsed[0]).toEqual([1, 2]);
  });

  it('renders canvas properly', () => {
    const container = document.createElement('div');
    const steps = buildMinArrowsSteps([[1, 2]]);
    renderMinArrowsCanvas(container, steps[0]);
    expect(container.innerHTML).toContain('svg');
    expect(container.innerHTML).toContain('rect');
  });
});
