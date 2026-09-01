import { describe, it, expect } from 'vitest';
import { TreeCentroidPathCountVisualizer, TREE_PATH_COUNT_TEMPLATE } from './tree-centroid-path-count-renderer';

describe('TreeCentroidPathCount (Tree Centroid Path Counting - POJ 1741 / P3806)', () => {
  it('should instantiate TreeCentroidPathCountVisualizer properly', () => {
    const viz = new TreeCentroidPathCountVisualizer();
    expect(viz).toBeDefined();
    expect(TREE_PATH_COUNT_TEMPLATE).toContain('algo-tree-centroid-path-count-view');
    expect(TREE_PATH_COUNT_TEMPLATE).toContain('tree-centroid-path-canvas');
    expect(TREE_PATH_COUNT_TEMPLATE).toContain('pathcount-pairs-badge');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new TreeCentroidPathCountVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'tree-centroid-path-count',
      viewId: 'algo-tree-centroid-path-count-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
