/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { renderMinPathCoverCanvas } from './min-path-cover-canvas-adapter';
import { buildMinPathCoverSteps } from '../../../algorithms/categories/graph/min-path-cover-step-compiler';

describe('renderMinPathCoverCanvas', () => {
  it('renders SVG split-node bipartite topology correctly without table or title duplication', () => {
    const container = document.createElement('div');
    const steps = buildMinPathCoverSteps('standard');
    expect(steps.length).toBeGreaterThan(5);

    // Initial step
    renderMinPathCoverCanvas(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();

    // Final step
    renderMinPathCoverCanvas(container, steps[steps.length - 1]);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(8); // 4 out + 4 in
    expect(container.querySelectorAll('line').length).toBe(3); // 3 matched lines
  });
});
