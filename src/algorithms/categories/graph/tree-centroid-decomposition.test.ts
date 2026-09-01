import { describe, it, expect } from 'vitest';
import { TreeCentroidDecompositionVisualizer } from './tree-centroid-decomposition-renderer';

describe('TreeCentroidDecomposition (POJ 1741)', () => {
  it('should instantiate TreeCentroidDecompositionVisualizer properly', () => {
    const viz = new TreeCentroidDecompositionVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new TreeCentroidDecompositionVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'tree-centroid-decomposition',
      viewId: 'algo-tree-centroid-decomposition-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
