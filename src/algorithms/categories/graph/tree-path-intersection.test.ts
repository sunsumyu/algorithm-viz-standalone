import { describe, it, expect } from 'vitest';
import { TreePathIntersectionVisualizer } from './tree-path-intersection-renderer';

describe('TreePathIntersection', () => {
  it('should instantiate TreePathIntersectionVisualizer properly', () => {
    const viz = new TreePathIntersectionVisualizer();
    expect(viz).toBeDefined();
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
