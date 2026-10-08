// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildGasStationSteps } from './gas-station-step-compiler';
import { renderGasStationCanvas } from './gas-station-canvas-adapter';

describe('GasStationStepCompiler', () => {
  it('handles empty input gracefully', () => {
    const steps = buildGasStationSteps([], []);
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].action).toBe('failed');
    expect(steps[0].startStation).toBe(-1);
    expect(steps[0].line).toBeGreaterThanOrEqual(1);
  });

  it('correctly determines valid starting station', () => {
    const steps = buildGasStationSteps([1, 2, 3, 4, 5], [3, 4, 5, 1, 2]);
    expect(steps.length).toBeGreaterThan(2);
    const last = steps[steps.length - 1];
    expect(last.action).toBe('success');
    expect(last.startStation).toBe(3);
    for (const step of steps) {
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.decision).toBeTruthy();
      expect(step.log).toBeTruthy();
    }
  });

  it('correctly determines impossible route', () => {
    const steps = buildGasStationSteps([2, 3, 4], [3, 4, 3]);
    const last = steps[steps.length - 1];
    expect(last.action).toBe('failed');
    expect(last.startStation).toBe(-1);
  });

  it('renders canvas properly', () => {
    const container = document.createElement('div');
    const emptySteps = buildGasStationSteps([], []);
    renderGasStationCanvas(container, emptySteps[0]);
    expect(container.innerHTML).toContain('输入为空');

    const steps = buildGasStationSteps([1, 2], [2, 1]);
    renderGasStationCanvas(container, steps[1]);
    expect(container.innerHTML).toContain('当前候选起点');
  });
});
