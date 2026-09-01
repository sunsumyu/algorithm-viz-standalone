import { describe, it, expect } from 'vitest';
import { HeavyLightDecompositionVisualizer, HLD_TEMPLATE } from './heavy-light-decomposition-renderer';

describe('HeavyLightDecomposition (HLD Tree & Path Query)', () => {
  it('should instantiate HeavyLightDecompositionVisualizer properly', () => {
    const viz = new HeavyLightDecompositionVisualizer();
    expect(viz).toBeDefined();
    expect(HLD_TEMPLATE).toContain('algo-heavy-light-decomposition-view');
    expect(HLD_TEMPLATE).toContain('hld-canvas');
    expect(HLD_TEMPLATE).toContain('hld-dfn-array');
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
