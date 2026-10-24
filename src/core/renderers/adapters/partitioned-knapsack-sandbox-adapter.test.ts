// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { PartitionedKnapsackSandboxAdapter, type SandboxItem } from './partitioned-knapsack-sandbox-adapter';
import type { UniversalStep } from '../../universal-stage-engine';

describe('PartitionedKnapsackSandboxAdapter', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
  });

  describe('parseItemsAndGroups', () => {
    it('should parse items from step.arr correctly', () => {
      const step: UniversalStep = {
        description: 'test',
        arr: [
          null, // index 0 placeholder
          [10, 15, 1],
          [20, 25, 1],
          [15, 30, 2],
        ],
        capacity: 40,
      };

      const result = PartitionedKnapsackSandboxAdapter.parseItemsAndGroups(step, { modelId: 'test' });
      expect(result.capacity).toBe(40);
      expect(result.items.length).toBe(3);
      expect(result.items[0]).toEqual({ id: 1, cost: 10, val: 15, group: 1 });
      expect(result.items[1]).toEqual({ id: 2, cost: 20, val: 25, group: 1 });
      expect(result.items[2]).toEqual({ id: 3, cost: 15, val: 30, group: 2 });
      expect(result.groups.size).toBe(2);
      expect(result.groups.get(1)?.length).toBe(2);
      expect(result.groups.get(2)?.length).toBe(1);
    });

    it('should parse items from step.items object array', () => {
      const step: UniversalStep = {
        description: 'test',
        items: [
          { cost: 5, val: 10, group: 1 },
          { cost: 8, val: 12, group: 2 },
        ],
        variables: { m: 30 },
      };

      const result = PartitionedKnapsackSandboxAdapter.parseItemsAndGroups(step, { modelId: 'test' });
      expect(result.capacity).toBe(30);
      expect(result.items.length).toBe(2);
      expect(result.items[0]).toEqual({ id: 1, cost: 5, val: 10, group: 1 });
      expect(result.items[1]).toEqual({ id: 2, cost: 8, val: 12, group: 2 });
    });

    it('should fallback to defaults when step has no items', () => {
      const step: UniversalStep = { description: 'empty' };
      const result = PartitionedKnapsackSandboxAdapter.parseItemsAndGroups(step, { modelId: 'unknown' });
      expect(result.items.length).toBeGreaterThan(0);
      expect(result.groups.size).toBeGreaterThan(0);
    });
  });

  describe('backtrackBagItems', () => {
    it('should backtrack chosen items from grid', () => {
      const groups = new Map<number, SandboxItem[]>([
        [
          1,
          [
            { id: 1, cost: 10, val: 20, group: 1 },
            { id: 2, cost: 15, val: 25, group: 1 },
          ],
        ],
        [
          2,
          [
            { id: 3, cost: 20, val: 40, group: 2 },
          ],
        ],
      ]);

      // Construct dummy DP grid for 2 groups, capacity 30
      // Row 0: all 0
      // Row 1 (Group 1): j < 10 -> 0; 10 <= j < 15 -> 20 (chose id 1); j >= 15 -> 25 (chose id 2)
      // Row 2 (Group 2): j = 30 -> chose id 3 (cost 20, val 40) + group 1's j=10 (id 1, val 20) = 60
      const grid: number[][] = [
        new Array(31).fill(0),
        new Array(31).fill(0).map((_, j) => (j >= 15 ? 25 : j >= 10 ? 20 : 0)),
        new Array(31).fill(0).map((_, j) => (j >= 30 ? 60 : j >= 20 ? 40 : j >= 15 ? 25 : 0)),
      ];

      const chosen = PartitionedKnapsackSandboxAdapter.backtrackBagItems(2, 30, groups, grid);
      expect(chosen.length).toBe(2);
      expect(chosen[0].id).toBe(1); // from group 1 at remJ=10
      expect(chosen[1].id).toBe(3); // from group 2 at remJ=30
    });
  });

  describe('render', () => {
    it('should render grouped buckets and knapsack container', () => {
      const step: UniversalStep = {
        description: 'DP step',
        arr: [
          null,
          [10, 15, 1],
          [20, 25, 1],
          [15, 30, 2],
        ],
        i: 1,
        j: 25,
        k: 1,
        decision: 'try',
        capacity: 40,
        grid: [
          new Array(41).fill(0),
          new Array(41).fill(0),
          new Array(41).fill(0),
        ],
      };

      PartitionedKnapsackSandboxAdapter.render(container, step, { modelId: 'partitioned-knapsack-standard' });

      expect(container.innerHTML).toContain('分组存放物品的桶');
      expect(container.innerHTML).toContain('桶 #1');
      expect(container.innerHTML).toContain('桶 #2');
      expect(container.innerHTML).toContain('实体物理背包');
      expect(container.innerHTML).toContain('已占体积');
      expect(container.innerHTML).toContain('剩余容积');
    });

    it('should render mutual exclusion lock status when trialing', () => {
      const step: UniversalStep = {
        description: 'Trial item',
        arr: [
          null,
          [10, 15, 1],
          [20, 25, 1],
        ],
        i: 1,
        j: 25,
        k: 1,
        decision: 'try',
        capacity: 30,
      };

      PartitionedKnapsackSandboxAdapter.render(container, step, { modelId: 'test' });
      // Item 1 is trialed, Item 2 in same group 1 should show mutual exclusion mask
      expect(container.innerHTML).toContain('组内互斥锁止');
      expect(container.innerHTML).toContain('试装入中');
    });
  });
});
