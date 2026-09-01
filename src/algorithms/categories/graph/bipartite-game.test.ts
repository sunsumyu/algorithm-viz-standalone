import { describe, it, expect } from 'vitest';
import { BipartiteGameVisualizer } from './bipartite-game-renderer';

describe('BipartiteGame (P4055)', () => {
  it('should instantiate BipartiteGameVisualizer properly', () => {
    const viz = new BipartiteGameVisualizer();
    expect(viz).toBeDefined();
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
      isConnected: true,
    } as unknown as HTMLElement;

    const viz = new BipartiteGameVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'bipartite-game',
      viewId: 'algo-bipartite-game-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
