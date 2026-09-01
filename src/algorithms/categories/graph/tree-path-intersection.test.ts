import { describe, it, expect } from 'vitest';
import { TreePathIntersectionVisualizer, TREE_INTERSECT_TEMPLATE } from './tree-path-intersection-renderer';

describe('TreePathIntersection (Tree Path Intersection & LCA)', () => {
  it('should instantiate TreePathIntersectionVisualizer properly', () => {
    const viz = new TreePathIntersectionVisualizer();
    expect(viz).toBeDefined();
    expect(TREE_INTERSECT_TEMPLATE).toContain('algo-tree-path-intersection-view');
    expect(TREE_INTERSECT_TEMPLATE).toContain('tree-intersect-canvas');
    expect(TREE_INTERSECT_TEMPLATE).toContain('intersect-result-badge');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new TreePathIntersectionVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'tree-path-intersection',
      viewId: 'algo-tree-path-intersection-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
