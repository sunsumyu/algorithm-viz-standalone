import { describe, it, expect } from 'vitest';
import { DSUOnTreeVisualizer, DSU_ON_TREE_TEMPLATE } from './dsu-on-tree-renderer';

describe('DSUOnTree (Heavy-Light Merge on Trees)', () => {
  it('should instantiate DSUOnTreeVisualizer properly', () => {
    const viz = new DSUOnTreeVisualizer();
    expect(viz).toBeDefined();
    expect(DSU_ON_TREE_TEMPLATE).toContain('algo-dsu-on-tree-view');
    expect(DSU_ON_TREE_TEMPLATE).toContain('dsu-tree-canvas');
    expect(DSU_ON_TREE_TEMPLATE).toContain('dsu-distinct-badge');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new DSUOnTreeVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'dsu-on-tree',
      viewId: 'algo-dsu-on-tree-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
