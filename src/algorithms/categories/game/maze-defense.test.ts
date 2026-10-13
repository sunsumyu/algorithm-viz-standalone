import { assertVisualizerLifecycleContract } from '../../../core/testing/contract-assertions';
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
    await assertVisualizerLifecycleContract(MazeDefenseVisualizer, {
      algorithmId: 'maze-defense',
      viewId: 'algo-maze-defense-view',
    });
  });
});
