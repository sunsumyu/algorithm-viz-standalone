/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from 'vitest';
import { renderKonigMinVertexCoverCanvas } from './konig-min-vertex-cover-canvas-adapter';
import { buildKonigSteps } from '../../../algorithms/categories/graph/konig-min-vertex-cover-step-compiler';

describe('renderKonigMinVertexCoverCanvas', () => {
  it('renders SVG topology correctly without table or title duplication', () => {
    const container = document.createElement('div');
    const steps = buildKonigSteps('classic');
    expect(steps.length).toBeGreaterThan(5);

    // Initial step
    renderKonigMinVertexCoverCanvas(container, steps[0]);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelector('table')).toBeNull();

    // Final step
    renderKonigMinVertexCoverCanvas(container, steps[steps.length - 1]);
    expect(container.querySelector('svg')).not.toBeNull();
    expect(container.querySelectorAll('circle').length).toBe(7); // 4 left + 3 right
  });
});
