import { describe, it, expect } from 'vitest';
import { DominatorTreeVisualizer, DOMINATOR_TREE_TEMPLATE } from './dominator-tree-renderer';

describe('DominatorTree (DAG Dominator Tree on Control Flow Graph)', () => {
  it('should instantiate DominatorTreeVisualizer properly', () => {
    const viz = new DominatorTreeVisualizer();
    expect(viz).toBeDefined();
    expect(DOMINATOR_TREE_TEMPLATE).toContain('algo-dominator-tree-view');
    expect(DOMINATOR_TREE_TEMPLATE).toContain('domtree-canvas');
    expect(DOMINATOR_TREE_TEMPLATE).toContain('domtree-idom-badge');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new DominatorTreeVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'dominator-tree',
      viewId: 'algo-dominator-tree-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
