import { describe, it, expect } from 'vitest';
import { ConvexHull3DVisualizer, CONVEX_HULL_3D_TEMPLATE } from './convex-hull-3d-renderer';

describe('ConvexHull3D (3D Convex Hull - Incremental Algorithm - P4724)', () => {
  it('should instantiate ConvexHull3DVisualizer properly', () => {
    const viz = new ConvexHull3DVisualizer();
    expect(viz).toBeDefined();
    expect(CONVEX_HULL_3D_TEMPLATE).toContain('algo-convex-hull-3d-view');
    expect(CONVEX_HULL_3D_TEMPLATE).toContain('convex-hull-3d-canvas');
    expect(CONVEX_HULL_3D_TEMPLATE).toContain('hull3d-euler-badge');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new ConvexHull3DVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'convex-hull-3d',
      viewId: 'algo-convex-hull-3d-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
