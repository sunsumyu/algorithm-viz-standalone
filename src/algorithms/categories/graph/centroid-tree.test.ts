import { describe, it, expect } from 'vitest';
import { CentroidTreeVisualizer, CENTROID_TREE_TEMPLATE } from './centroid-tree-renderer';

describe('CentroidTree (Dynamic Centroid Decomposition & Centroid Tree)', () => {
  it('should instantiate CentroidTreeVisualizer properly', () => {
    const viz = new CentroidTreeVisualizer();
    expect(viz).toBeDefined();
    expect(CENTROID_TREE_TEMPLATE).toContain('algo-centroid-tree-view');
    expect(CENTROID_TREE_TEMPLATE).toContain('ctree-canvas');
    expect(CENTROID_TREE_TEMPLATE).toContain('ctree-height-badge');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new CentroidTreeVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'centroid-tree',
      viewId: 'algo-centroid-tree-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
