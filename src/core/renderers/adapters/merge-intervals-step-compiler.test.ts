// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  parseIntervals,
  buildMergeIntervalsSteps,
  MERGE_INTERVALS_CODE_LINES,
} from './merge-intervals-step-compiler';
import { renderMergeIntervalsCanvas } from './merge-intervals-canvas-adapter';

describe('merge-intervals-step-compiler and canvas-adapter', () => {
  it('parses raw interval inputs with fallback', () => {
    expect(parseIntervals('[[1, 2], [2, 3]]')).toEqual([[1, 2], [2, 3]]);
    expect(parseIntervals('invalid')).toEqual([
      [1, 3],
      [2, 6],
      [8, 10],
      [15, 18],
    ]);
  });

  it('handles empty input gracefully', () => {
    const steps = buildMergeIntervalsSteps([]);
    expect(steps.length).toBe(1);
    expect(steps[0].action).toBe('done');
    expect(steps[0].result).toEqual([]);

    const container = document.createElement('div');
    renderMergeIntervalsCanvas(container, steps[0]);
    expect(container.innerHTML).toContain('输入为空');
  });

  it('generates merge intervals steps correctly and renders canvas', () => {
    const intervals: Array<[number, number]> = [
      [1, 3],
      [2, 6],
      [8, 10],
      [15, 18],
    ];
    const steps = buildMergeIntervalsSteps(intervals);

    expect(steps.length).toBeGreaterThan(2);
    const first = steps[0];
    expect(first.action).toBe('sort');

    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    expect(last.result).toEqual([
      [1, 6],
      [8, 10],
      [15, 18],
    ]);
    expect(last.line).toBeGreaterThanOrEqual(1);

    const container = document.createElement('div');
    renderMergeIntervalsCanvas(container, steps[1]);
    expect(container.innerHTML).toContain('<svg');
  });
});
