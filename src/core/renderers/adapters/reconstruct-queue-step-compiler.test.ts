// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import {
  parsePeople,
  buildReconstructQueueSteps,
  RECONSTRUCT_QUEUE_CODE_LINES,
} from './reconstruct-queue-step-compiler';
import { renderReconstructQueueCanvas } from './reconstruct-queue-canvas-adapter';

describe('reconstruct-queue-step-compiler and canvas-adapter', () => {
  it('parses raw people inputs with fallback', () => {
    expect(parsePeople('[[7, 0], [4, 4]]')).toEqual([
      [7, 0],
      [4, 4],
    ]);
    expect(parsePeople('invalid')).toEqual([
      [7, 0],
      [4, 4],
      [7, 1],
      [5, 0],
      [6, 1],
      [5, 2],
    ]);
  });

  it('handles empty input gracefully', () => {
    const steps = buildReconstructQueueSteps([]);
    expect(steps.length).toBe(1);
    expect(steps[0].action).toBe('done');
    expect(steps[0].queue).toEqual([]);

    const container = document.createElement('div');
    renderReconstructQueueCanvas(container, steps[0]);
    expect(container.innerHTML).toContain('输入为空');
  });

  it('generates reconstruction steps correctly and renders canvas', () => {
    const people: Array<[number, number]> = [
      [7, 0],
      [4, 4],
      [7, 1],
      [5, 0],
      [6, 1],
      [5, 2],
    ];
    const steps = buildReconstructQueueSteps(people);

    expect(steps.length).toBeGreaterThan(2);
    const first = steps[0];
    expect(first.action).toBe('sort');

    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    expect(last.queue).toEqual([
      [5, 0],
      [7, 0],
      [5, 2],
      [6, 1],
      [4, 4],
      [7, 1],
    ]);
    expect(last.line).toBeGreaterThanOrEqual(1);

    const container = document.createElement('div');
    renderReconstructQueueCanvas(container, steps[1]);
    expect(container.innerHTML).toContain('重建后的队列');
  });
});
