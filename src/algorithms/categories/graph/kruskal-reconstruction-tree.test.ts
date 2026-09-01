import { describe, it, expect } from 'vitest';
import { KruskalReconstructionTreeVisualizer, KRUSKAL_TREE_TEMPLATE } from './kruskal-reconstruction-tree-renderer';

describe('KruskalReconstructionTree (Kruskal Tree & LCA Bottleneck)', () => {
  it('should instantiate KruskalReconstructionTreeVisualizer properly', () => {
    const viz = new KruskalReconstructionTreeVisualizer();
    expect(viz).toBeDefined();
    expect(KRUSKAL_TREE_TEMPLATE).toContain('algo-kruskal-reconstruction-tree-view');
    expect(KRUSKAL_TREE_TEMPLATE).toContain('kruskal-tree-canvas');
    expect(KRUSKAL_TREE_TEMPLATE).toContain('ktree-status-badge');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new KruskalReconstructionTreeVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'kruskal-reconstruction-tree',
      viewId: 'algo-kruskal-reconstruction-tree-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
