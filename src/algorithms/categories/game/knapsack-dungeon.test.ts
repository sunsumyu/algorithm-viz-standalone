import { describe, it, expect } from 'vitest';
import { KnapsackDungeonVisualizer, KNAPSACK_DUNGEON_TEMPLATE } from './knapsack-dungeon-renderer';

describe('KnapsackDungeon (0-1 Knapsack Dungeon Crawler)', () => {
  it('should instantiate KnapsackDungeonVisualizer properly', () => {
    const viz = new KnapsackDungeonVisualizer();
    expect(viz).toBeDefined();
    expect(KNAPSACK_DUNGEON_TEMPLATE).toContain('algo-knapsack-dungeon-view');
    expect(KNAPSACK_DUNGEON_TEMPLATE).toContain('knapsack-chest-grid');
    expect(KNAPSACK_DUNGEON_TEMPLATE).toContain('knapsack-dp-table-container');
  });

  it('should initialize and destroy cleanly with mock root container', async () => {
    const mockElements = new Map<string, any>();
    const mockRoot = {
      querySelector: (sel: string) => mockElements.get(sel) || null,
      querySelectorAll: (_sel: string) => [],
    } as unknown as HTMLElement;

    const viz = new KnapsackDungeonVisualizer();
    await viz.init({
      root: mockRoot,
      algorithmId: 'knapsack-dungeon',
      viewId: 'algo-knapsack-dungeon-view',
    });

    expect(viz).toBeDefined();
    viz.destroy();
  });
});
