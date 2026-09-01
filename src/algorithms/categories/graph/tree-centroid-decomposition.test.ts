import { describe, it, expect } from 'vitest';
import { TreeCentroidVisualizer, TREE_CENTROID_TEMPLATE } from './tree-centroid-decomposition-renderer';

describe('TreeCentroidDecomposition', () => {
  it('should instantiate TreeCentroidVisualizer properly', () => {
    const viz = new TreeCentroidVisualizer();
    expect(viz).toBeDefined();
    expect(TREE_CENTROID_TEMPLATE).toContain('algo-tree-centroid-decomposition-view');
    expect(TREE_CENTROID_TEMPLATE).toContain('centroid-canvas');
    expect(TREE_CENTROID_TEMPLATE).toContain('centroid-dist-panel');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new TreeCentroidVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'tree-centroid-decomposition',
      viewId: 'algo-tree-centroid-decomposition-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
