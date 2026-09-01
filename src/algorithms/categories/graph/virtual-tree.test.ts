import { describe, it, expect } from 'vitest';
import { VirtualTreeVisualizer } from './virtual-tree-renderer';

describe('VirtualTree (P2495)', () => {
  it('should instantiate VirtualTreeVisualizer properly', () => {
    const viz = new VirtualTreeVisualizer();
    expect(viz).toBeDefined();
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
