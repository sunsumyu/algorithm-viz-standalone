import { describe, it, expect } from 'vitest';
import { KMAlgorithmVisualizer, KM_ALGORITHM_TEMPLATE } from './km-algorithm-renderer';

describe('KMAlgorithm (Kuhn-Munkres Bipartite Matching)', () => {
  it('should instantiate KMAlgorithmVisualizer properly', () => {
    const viz = new KMAlgorithmVisualizer();
    expect(viz).toBeDefined();
    expect(KM_ALGORITHM_TEMPLATE).toContain('algo-km-algorithm-view');
    expect(KM_ALGORITHM_TEMPLATE).toContain('km-canvas');
    expect(KM_ALGORITHM_TEMPLATE).toContain('km-weight-val');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new KMAlgorithmVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'km-algorithm',
      viewId: 'algo-km-algorithm-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
