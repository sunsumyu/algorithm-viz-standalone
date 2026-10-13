import { assertVisualizerLifecycleContract } from '../../../core/testing/contract-assertions';
import { describe, it, expect } from 'vitest';
import { ClashOfAlgorithmsGameVisualizer, CLASH_GAME_TEMPLATE } from './clash-of-algorithms-renderer';

describe('ClashOfAlgorithms (Playable Game Visualizer)', () => {
  it('should construct ClashOfAlgorithmsGameVisualizer correctly', () => {
    const viz = new ClashOfAlgorithmsGameVisualizer();
    expect(viz).toBeDefined();
    expect(CLASH_GAME_TEMPLATE).toContain('clash-game-canvas');
    expect(CLASH_GAME_TEMPLATE).toContain('clash-elixir-fill');
    expect(CLASH_GAME_TEMPLATE).toContain('clash-troop-card');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    await assertVisualizerLifecycleContract(ClashOfAlgorithmsGameVisualizer, {
      algorithmId: 'clash-of-algorithms',
      viewId: 'algo-clash-of-algorithms-view',
    });
  });
});
