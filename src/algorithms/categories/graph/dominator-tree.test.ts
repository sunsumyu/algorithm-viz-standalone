import { describe, it, expect } from 'vitest';
import { DominatorTreeVisualizer } from './dominator-tree-renderer';

describe('DominatorTree (P2597)', () => {
  it('should instantiate DominatorTreeVisualizer properly', () => {
    const viz = new DominatorTreeVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new DominatorTreeVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'dominator-tree',
      viewId: 'algo-dominator-tree-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
