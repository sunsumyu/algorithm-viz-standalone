import { describe, it, expect } from 'vitest';
import { LCABinaryLiftingVisualizer, LCA_TEMPLATE } from './lca-binary-lifting-renderer';

describe('LCABinaryLifting', () => {
  it('should instantiate LCABinaryLiftingVisualizer properly', () => {
    const viz = new LCABinaryLiftingVisualizer();
    expect(viz).toBeDefined();
    expect(LCA_TEMPLATE).toContain('algo-lca-binary-lifting-view');
    expect(LCA_TEMPLATE).toContain('lca-canvas');
    expect(LCA_TEMPLATE).toContain('lca-res-val');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new LCABinaryLiftingVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'lca-binary-lifting',
      viewId: 'algo-lca-binary-lifting-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
