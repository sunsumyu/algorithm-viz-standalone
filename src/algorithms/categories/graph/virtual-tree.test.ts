import { describe, it, expect } from 'vitest';
import { VirtualTreeVisualizer, VIRTUAL_TREE_TEMPLATE } from './virtual-tree-renderer';

describe('VirtualTree (Virtual Tree / Auxiliary Tree)', () => {
  it('should instantiate VirtualTreeVisualizer properly', () => {
    const viz = new VirtualTreeVisualizer();
    expect(viz).toBeDefined();
    expect(VIRTUAL_TREE_TEMPLATE).toContain('algo-virtual-tree-view');
    expect(VIRTUAL_TREE_TEMPLATE).toContain('vtree-canvas');
    expect(VIRTUAL_TREE_TEMPLATE).toContain('vtree-scale-badge');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new VirtualTreeVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'virtual-tree',
      viewId: 'algo-virtual-tree-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
