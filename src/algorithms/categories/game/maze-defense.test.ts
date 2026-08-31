import { describe, it, expect } from 'vitest';
import { MazeDefenseVisualizer, MAZE_DEFENSE_TEMPLATE } from './maze-defense-renderer';

describe('MazeDefense (Maze Tower Defense Game)', () => {
  it('should instantiate MazeDefenseVisualizer properly', () => {
    const viz = new MazeDefenseVisualizer();
    expect(viz).toBeDefined();
    expect(MAZE_DEFENSE_TEMPLATE).toContain('algo-maze-defense-view');
    expect(MAZE_DEFENSE_TEMPLATE).toContain('maze-defense-canvas');
    expect(MAZE_DEFENSE_TEMPLATE).toContain('maze-tool-btn');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
    } as unknown as HTMLElement;

    const viz = new MazeDefenseVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'maze-defense',
      viewId: 'algo-maze-defense-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
