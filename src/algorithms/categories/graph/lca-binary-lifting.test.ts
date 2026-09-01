import { describe, it, expect } from 'vitest';
import { LCABinaryLiftingVisualizer } from './lca-binary-lifting-renderer';

describe('LCABinaryLifting (P3379)', () => {
  it('should instantiate LCABinaryLiftingVisualizer properly', () => {
    const viz = new LCABinaryLiftingVisualizer();
    expect(viz).toBeDefined();
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
