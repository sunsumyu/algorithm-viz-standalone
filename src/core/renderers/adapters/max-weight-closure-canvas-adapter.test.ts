/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { renderMaxWeightClosureCanvas } from './max-weight-closure-canvas-adapter';
import { buildMaxWeightClosureSteps } from '../../../algorithms/categories/graph/max-weight-closure-step-compiler';

describe('renderMaxWeightClosureCanvas', () => {
  it('renders SVG closure flow topology correctly without table or title duplication', () => {
    const container = document.createElement('div');
    const steps = buildMaxWeightClosureSteps('space');
    expect(steps.length).toBeGreaterThan(5);

    // Initial step
    renderMaxWeightClosureCanvas(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();

    // Final step
    renderMaxWeightClosureCanvas(container, steps[steps.length - 1]);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(7); // S, E1, E2, I1, I2, I3, T
  });
});
