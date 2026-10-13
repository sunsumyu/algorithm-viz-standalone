import { assertVisualizerLifecycleContract } from '../../../core/testing/contract-assertions';
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
    await assertVisualizerLifecycleContract(KnapsackDungeonVisualizer, {
      algorithmId: 'knapsack-dungeon',
      viewId: 'algo-knapsack-dungeon-view',
    });
  });
});
