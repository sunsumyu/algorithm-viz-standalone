// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { buildPartitionLabelsSteps } from './partition-labels-step-compiler';
import { renderPartitionLabelsCanvas } from './partition-labels-canvas-adapter';

describe('PartitionLabelsStepCompiler', () => {
  it('handles empty input gracefully', () => {
    const steps = buildPartitionLabelsSteps('');
    expect(steps.length).toBe(1);
    expect(steps[0].action).toBe('done');
    expect(steps[0].partitions.length).toBe(0);
    expect(steps[0].line).toBeGreaterThanOrEqual(1);
  });

  it('correctly partitions letters greedily', () => {
    const steps = buildPartitionLabelsSteps('ababcbacadefegdehijhklij');
    expect(steps.length).toBeGreaterThan(0);
    expect(steps[0].action).toBe('init');
    const last = steps[steps.length - 1];
    expect(last.action).toBe('done');
    expect(last.partitions).toEqual([9, 7, 8]);
    for (const step of steps) {
      expect(step.line).toBeGreaterThanOrEqual(1);
      expect(step.message).toBeTruthy();
    }
  });

  it('renders canvas properly', () => {
    const container = document.createElement('div');
    const steps = buildPartitionLabelsSteps('abac');
    renderPartitionLabelsCanvas(container, steps[1]);
    expect(container.innerHTML).toContain('当前最远边界');
  });
});
