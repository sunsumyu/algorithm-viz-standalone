import { describe, it, expect } from 'vitest';
import { buildIslandsSteps } from './islands-renderer';
import { buildDJBSteps } from './dijkstra-basic-renderer';

describe('Graph Algorithms Step Generation (图论核心算法推导测试)', () => {
  describe('Number of Islands (岛屿数量 LeetCode 200 - 网格 DFS)', () => {
    it('1. 包含 3 座独立岛屿的网格正确返回 count=3', () => {
      const grid = [
        [1, 1, 0, 0, 0],
        [1, 1, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 1, 1],
      ];
      const steps = buildIslandsSteps(grid);
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.count).toBe(3);
    });

    it('2. 全水域网格返回 count=0', () => {
      const grid = [
        [0, 0],
        [0, 0],
      ];
      const steps = buildIslandsSteps(grid);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.count).toBe(0);
    });
  });

  describe('Dijkstra Basic (朴素 Dijkstra 单源最短路径)', () => {
    it('3. 从源点 0 出发正确计算到达所有 5 个节点的最短距离', () => {
      const steps = buildDJBSteps();
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      // 0->0: 0, 0->2: 1, 0->2->1: 3, 0->2->1->3: 4, 0->2->1->3->4: 7
      expect(lastStep.dist).toEqual([0, 3, 1, 4, 7]);
    });
  });
});
