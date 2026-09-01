import { describe, it, expect } from 'vitest';
import { BlockCutTreeVisualizer } from './block-cut-tree-renderer';

describe('BlockCutTree (P4320)', () => {
  it('should instantiate BlockCutTreeVisualizer properly', () => {
    const viz = new BlockCutTreeVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new BlockCutTreeVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'block-cut-tree',
      viewId: 'algo-block-cut-tree-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
