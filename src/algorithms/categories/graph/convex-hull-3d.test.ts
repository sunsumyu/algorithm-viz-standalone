import { describe, it, expect } from 'vitest';
import { ConvexHull3DVisualizer } from './convex-hull-3d-renderer';

describe('ConvexHull3D (3D Convex Hull - P4724)', () => {
  it('should instantiate ConvexHull3DVisualizer properly', () => {
    const viz = new ConvexHull3DVisualizer();
    expect(viz).toBeDefined();
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
