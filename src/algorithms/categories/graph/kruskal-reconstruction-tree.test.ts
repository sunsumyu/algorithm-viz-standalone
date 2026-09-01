import { describe, it, expect } from 'vitest';
import { KruskalReconstructionTreeVisualizer } from './kruskal-reconstruction-tree-renderer';

describe('KruskalReconstructionTree (P4768)', () => {
  it('should instantiate KruskalReconstructionTreeVisualizer properly', () => {
    const viz = new KruskalReconstructionTreeVisualizer();
    expect(viz).toBeDefined();
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
