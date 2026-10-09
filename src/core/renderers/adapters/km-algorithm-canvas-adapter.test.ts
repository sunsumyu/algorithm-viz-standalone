/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { renderKMAlgorithmCanvas } from './km-algorithm-canvas-adapter';
import { buildKMSteps } from '../../../algorithms/categories/graph/km-algorithm-step-compiler';

describe('renderKMAlgorithmCanvas', () => {
  it('renders SVG topology correctly without table or title duplication', () => {
    const container = document.createElement('div');
    const steps = buildKMSteps('standard');
    expect(steps.length).toBeGreaterThan(5);

    // Initial step
    renderKMAlgorithmCanvas(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();

    // Final step
    renderKMAlgorithmCanvas(container, steps[steps.length - 1]);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(6); // 3 left + 3 right
  });
});
