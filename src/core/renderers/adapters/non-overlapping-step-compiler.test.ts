// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  parseIntervals,
  buildNonOverlappingSteps,
  NON_OVERLAPPING_CODE_LINES,
} from './non-overlapping-step-compiler';
import { renderNonOverlappingCanvas } from './non-overlapping-canvas-adapter';

describe('non-overlapping-step-compiler and canvas-adapter', () => {
  it('parses raw interval inputs with fallback', () => {
    expect(parseIntervals('[[1, 2], [2, 3]]')).toEqual([[1, 2], [2, 3]]);
    expect(parseIntervals('invalid')).toEqual([[1, 2], [2, 3], [3, 4], [1, 3]]);
  });

  it('handles empty input gracefully', () => {
    const steps = buildNonOverlappingSteps([]);
    expect(steps.length).toBe(1);
    expect(steps[0].action).toBe('done');
    expect(steps[0].removedCount).toBe(0);

    const container = document.createElement('div');
    renderNonOverlappingCanvas(container, steps[0]);
    expect(container.innerHTML).toContain('输入为空');
  });

  it('generates non-overlapping intervals steps correctly', () => {
    const intervals: Array<[number, number]> = [[1, 2], [2, 3], [3, 4], [1, 3]];
    const steps = buildNonOverlappingSteps(intervals);

    expect(steps.length).toBeGreaterThan(2);
    const first = steps[0];
    expect(first.action).toBe('sort');

    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    expect(last.removedCount).toBe(1);
    expect(last.line).toBeGreaterThanOrEqual(1);

    const container = document.createElement('div');
    renderNonOverlappingCanvas(container, steps[1]);
    expect(container.innerHTML).toContain('<svg');
  });
});
