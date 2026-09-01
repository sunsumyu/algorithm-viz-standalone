import { describe, it, expect } from 'vitest';
import { PlanarGraphDualVisualizer, PLANAR_DUAL_TEMPLATE } from './planar-graph-dual-renderer';

describe('PlanarGraphDual (Planar Graph Min-Cut to Dual Shortest Path)', () => {
  it('should instantiate PlanarGraphDualVisualizer properly', () => {
    const viz = new PlanarGraphDualVisualizer();
    expect(viz).toBeDefined();
    expect(PLANAR_DUAL_TEMPLATE).toContain('algo-planar-graph-dual-view');
    expect(PLANAR_DUAL_TEMPLATE).toContain('planar-dual-canvas');
    expect(PLANAR_DUAL_TEMPLATE).toContain('planar-mincut-badge');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new PlanarGraphDualVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'planar-graph-dual',
      viewId: 'algo-planar-graph-dual-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
