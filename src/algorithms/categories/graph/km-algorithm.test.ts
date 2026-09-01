import { describe, it, expect } from 'vitest';
import { KMAlgorithmVisualizer } from './km-algorithm-renderer';

describe('KMAlgorithm (P6577)', () => {
  it('should instantiate KMAlgorithmVisualizer properly', () => {
    const viz = new KMAlgorithmVisualizer();
    expect(viz).toBeDefined();
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
