import { describe, it, expect } from 'vitest';
import { HeavyLightDecompositionVisualizer } from './heavy-light-decomposition-renderer';

describe('HeavyLightDecomposition (P3384)', () => {
  it('should instantiate HeavyLightDecompositionVisualizer properly', () => {
    const viz = new HeavyLightDecompositionVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new HeavyLightDecompositionVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'heavy-light-decomposition',
      viewId: 'algo-heavy-light-decomposition-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
