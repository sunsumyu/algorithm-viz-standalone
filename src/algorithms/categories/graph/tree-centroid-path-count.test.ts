import { describe, it, expect } from 'vitest';
import { TreeCentroidPathCountVisualizer } from './tree-centroid-path-count-renderer';

describe('TreeCentroidPathCount (POJ 1741 / P3806)', () => {
  it('should instantiate TreeCentroidPathCountVisualizer properly', () => {
    const viz = new TreeCentroidPathCountVisualizer();
    expect(viz).toBeDefined();
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
