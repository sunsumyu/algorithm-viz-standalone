import { describe, it, expect } from 'vitest';
import { NQueenBattleVisualizer, NQUEEN_BATTLE_TEMPLATE } from './nqueen-battle-renderer';

describe('NQueenBattle (N-Queens Chess Battle Game)', () => {
  it('should instantiate NQueenBattleVisualizer properly', () => {
    const viz = new NQueenBattleVisualizer();
    expect(viz).toBeDefined();
    expect(NQUEEN_BATTLE_TEMPLATE).toContain('algo-nqueen-battle-view');
    expect(NQUEEN_BATTLE_TEMPLATE).toContain('nqueen-chess-canvas');
    expect(NQUEEN_BATTLE_TEMPLATE).toContain('nqueen-size-btn');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
    } as unknown as HTMLElement;

    const viz = new NQueenBattleVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'nqueen-battle',
      viewId: 'algo-nqueen-battle-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
