import { assertVisualizerLifecycleContract } from '../../../core/testing/contract-assertions';
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
    await assertVisualizerLifecycleContract(NQueenBattleVisualizer, {
      algorithmId: 'nqueen-battle',
      viewId: 'algo-nqueen-battle-view',
    });
  });
});
