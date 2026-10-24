// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { UnboundedKnapsackSandboxAdapter } from './unbounded-knapsack-sandbox-adapter';
import type { UniversalStep } from '../../universal-stage-engine';

describe('UnboundedKnapsackSandboxAdapter', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  describe('parseHerbsAndCapacity', () => {
    it('should parse items and capacity from step and options', () => {
      const step: UniversalStep = {
        description: 'complete knapsack step',
        items: [
          { weight: 1, value: 15 },
          { weight: 3, value: 20 },
          { weight: 4, value: 30 },
        ],
        capacity: 4,
      } as any;

      const result = UnboundedKnapsackSandboxAdapter.parseHerbsAndCapacity(step, { modelId: 'complete-knapsack' });
      expect(result.capacity).toBe(4);
      expect(result.items.length).toBe(3);
      expect(result.items[0]).toEqual({ id: 0, weight: 1, value: 15, name: '草药 #0' });
      expect(result.items[1]).toEqual({ id: 1, weight: 3, value: 20, name: '草药 #1' });
      expect(result.items[2]).toEqual({ id: 2, weight: 4, value: 30, name: '草药 #2' });
    });

    it('should fallback to defaults when step has no items', () => {
      const step: UniversalStep = { description: 'empty' };
      const result = UnboundedKnapsackSandboxAdapter.parseHerbsAndCapacity(step, { modelId: 'unknown' });
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.capacity).toBeGreaterThan(0);
    });
  });

  describe('backtrackHerbs', () => {
    it('should accurately backtrack duplicate counts for unbounded items from grid', () => {
      const items = [
        { id: 0, weight: 1, value: 15, name: '草药 #0' },
        { id: 1, weight: 3, value: 20, name: '草药 #1' },
      ];

      // Grid for 2 items, capacity 4:
      // Row 0 (Item 0, w=1, v=15): j=0->0, j=1->15, j=2->30, j=3->45, j=4->60 (chose 4 times)
      // Row 1 (Item 1, w=3, v=20): j=4-> max(dp[0][4]=60, dp[1][1]+20 = 15+20=35) -> 60
      const grid = [
        [0, 15, 30, 45, 60],
        [0, 15, 30, 45, 60],
      ];

      const inventory = UnboundedKnapsackSandboxAdapter.backtrackHerbs(1, 4, items, grid);
      expect(inventory.length).toBe(1);
      expect(inventory[0].id).toBe(0);
      expect(inventory[0].count).toBe(4);
      expect(inventory[0].totalWeight).toBe(4);
      expect(inventory[0].totalValue).toBe(60);
    });
  });

  describe('render', () => {
    it('should render infinite herb pool and cumulative knapsack container with capacity meters', () => {
      const step: UniversalStep = {
        description: 'Complete knapsack step',
        i: 0,
        j: 4,
        items: [
          { weight: 1, value: 15 },
          { weight: 3, value: 20 },
        ],
        capacity: 4,
        decision: '同行转移 dp[0][4] = 60',
        grid: [
          [0, 15, 30, 45, 60],
          [0, 15, 30, 45, 60],
        ],
      } as any;

      UnboundedKnapsackSandboxAdapter.render(container, step, { modelId: 'complete-knapsack' });

      // 验证无限草药池
      expect(container.innerHTML).toContain('无限草药采摘池');
      expect(container.innerHTML).toContain('草药 #0');
      expect(container.innerHTML).toContain('采药耗时');
      expect(container.innerHTML).toContain('药用价值');

      // 验证自叠加背包舱
      expect(container.innerHTML).toContain('自叠加采药背包舱');
      expect(container.innerHTML).toContain('已耗时间');
      expect(container.innerHTML).toContain('总药用价值');
      expect(container.innerHTML).toContain('同行自叠加机制');
    });
  });
});
