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
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (sel: string) => [],
    } as unknown as HTMLElement;

    const viz = new ClashOfAlgorithmsGameVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'clash-of-algorithms',
      viewId: 'algo-clash-of-algorithms-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
