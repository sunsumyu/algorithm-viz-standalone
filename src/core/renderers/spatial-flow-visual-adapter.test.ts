import { describe, it, expect } from 'vitest';
import { SpatialFlowVisualAdapter } from './spatial-flow-visual-adapter';

describe('SpatialFlowVisualAdapter Deep Module Guard', () => {
  it('should generate valid marker defs with all 4 arrow headers', () => {
    const defsHtml = SpatialFlowVisualAdapter.getMarkerDefsHtml();
    expect(defsHtml).toContain('id="arrow-forward"');
    expect(defsHtml).toContain('id="arrow-reverse"');
    expect(defsHtml).toContain('id="arrow-top-down"');
    expect(defsHtml).toContain('id="arrow-left-right"');
    expect(defsHtml).toContain('markerWidth="6"');
  });

  it('should gracefully handle null/empty inputs without throwing', () => {
    expect(() => {
      SpatialFlowVisualAdapter.renderGridArrows(null as any, null as any, null, { m: 3, n: 3 });
    }).not.toThrow();
  });
});
