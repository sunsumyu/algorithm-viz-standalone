import { describe, it, expect } from 'vitest';
import { PrefixOptGraphVisualizer, PREFIX_OPT_TEMPLATE } from './prefix-opt-graph-renderer';

describe('PrefixOptGraph (Prefix Optimization Graph Building)', () => {
  it('should instantiate PrefixOptGraphVisualizer properly', () => {
    const viz = new PrefixOptGraphVisualizer();
    expect(viz).toBeDefined();
    expect(PREFIX_OPT_TEMPLATE).toContain('algo-prefix-opt-graph-view');
    expect(PREFIX_OPT_TEMPLATE).toContain('prefix-opt-canvas');
    expect(PREFIX_OPT_TEMPLATE).toContain('prefix-edge-badge');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new PrefixOptGraphVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'prefix-opt-graph',
      viewId: 'algo-prefix-opt-graph-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
