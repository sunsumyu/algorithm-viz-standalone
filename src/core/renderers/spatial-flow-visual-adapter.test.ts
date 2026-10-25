// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { SpatialFlowVisualAdapter } from './spatial-flow-visual-adapter';

describe('SpatialFlowVisualAdapter Deep Module Guard', () => {
  it('should generate valid marker defs with all arrow headers including diagonal', () => {
    const defsHtml = SpatialFlowVisualAdapter.getMarkerDefsHtml();
    expect(defsHtml).toContain('id="arrow-forward"');
    expect(defsHtml).toContain('id="arrow-reverse"');
    expect(defsHtml).toContain('id="arrow-top-down"');
    expect(defsHtml).toContain('id="arrow-left-right"');
    expect(defsHtml).toContain('id="arrow-diag"');
    expect(defsHtml).toContain('markerWidth="6"');
  });

  it('should gracefully handle null/empty inputs without throwing', () => {
    expect(() => {
      SpatialFlowVisualAdapter.renderGridArrows(null as any, null as any, null, { m: 3, n: 3 });
    }).not.toThrow();
  });

  it('should draw dependency arrows for Stage 3 step', () => {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const container = document.createElement('div');
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const cell = document.createElement('div');
        cell.setAttribute('data-coord', `${r},${c}`);
        container.appendChild(cell);
      }
    }

    const step = {
      type: 'update',
      i: 1,
      j: 1,
      topI: 0,
      topJ: 1,
      leftI: 0,
      leftJ: 0,
    };

    SpatialFlowVisualAdapter.renderGridArrows(svg, container, step, { m: 3, n: 3, isGridProblem: false });
    const lines = svg.querySelectorAll('line');
    expect(lines.length).toBe(2);
  });
});
