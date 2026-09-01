import { describe, it, expect } from 'vitest';
import { PrefixOptGraphVisualizer } from './prefix-opt-graph-renderer';

describe('PrefixOptGraph', () => {
  it('should instantiate PrefixOptGraphVisualizer properly', () => {
    const viz = new PrefixOptGraphVisualizer();
    expect(viz).toBeDefined();
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
