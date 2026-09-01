import { describe, it, expect } from 'vitest';
import { BlockCutTreeVisualizer, BLOCK_CUT_TREE_TEMPLATE } from './block-cut-tree-renderer';

describe('BlockCutTree (Cactus & v-BCC Block-Cut Tree)', () => {
  it('should instantiate BlockCutTreeVisualizer properly', () => {
    const viz = new BlockCutTreeVisualizer();
    expect(viz).toBeDefined();
    expect(BLOCK_CUT_TREE_TEMPLATE).toContain('algo-block-cut-tree-view');
    expect(BLOCK_CUT_TREE_TEMPLATE).toContain('bct-canvas');
    expect(BLOCK_CUT_TREE_TEMPLATE).toContain('bct-square-badge');
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
