import { describe, it, expect } from 'vitest';
import { BipartiteGameVisualizer, BIPARTITE_GAME_TEMPLATE } from './bipartite-game-renderer';

describe('BipartiteGame (Bipartite Graph Game Winning Nodes)', () => {
  it('should instantiate BipartiteGameVisualizer properly', () => {
    const viz = new BipartiteGameVisualizer();
    expect(viz).toBeDefined();
    expect(BIPARTITE_GAME_TEMPLATE).toContain('algo-bipartite-game-view');
    expect(BIPARTITE_GAME_TEMPLATE).toContain('bpgame-canvas');
    expect(BIPARTITE_GAME_TEMPLATE).toContain('bpgame-winners-badge');
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
