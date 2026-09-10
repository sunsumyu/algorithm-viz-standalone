import { describe, it, expect } from 'vitest';
import { buildIslandsSteps } from './islands-renderer';
import { buildIslandsBFSSteps } from './islands-bfs-renderer';
import { buildMIASteps } from './max-island-area-renderer';
import { buildDJBSteps } from './dijkstra-basic-renderer';
import { buildDJHSteps } from './dijkstra-heap-renderer';
import { buildBFSteps } from './bellman-ford-renderer';
import { buildSPFASteps } from './spfa-renderer';
import { buildFloydSteps } from './floyd-renderer';
import { buildAStarSteps } from './a-star-renderer';
import { buildPrimSteps } from './mst-prim-renderer';
import { buildKruskalSteps } from './mst-kruskal-renderer';
import { buildTopoSteps } from './topological-sort-renderer';
import { buildRedundantSteps } from './redundant-edge-renderer';
import { buildRedundantIISteps } from './redundant-edge-ii-renderer';

describe('Graph Algorithms Step Generation (图论全家桶算法推导与正确性测试)', () => {
  describe('Number of Islands (岛屿数量 DFS & BFS)', () => {
    it('1. DFS 包含 3 座独立岛屿的网格正确返回 count=3', () => {
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

    it('3. BFS 包含 3 座独立岛屿的网格正确返回 count=3', () => {
      const grid = [
        [1, 1, 0, 0, 0],
        [1, 1, 0, 0, 0],
        [0, 0, 1, 0, 0],
        [0, 0, 0, 1, 1],
      ];
      const steps = buildIslandsBFSSteps(grid);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.count).toBe(3);
    });
  });

  describe('Max Island Area (岛屿的最大面积)', () => {
    it('4. 正确计算最大连通陆地面积为 5', () => {
      const grid = [
        [0, 0, 1, 0, 0],
        [1, 1, 1, 0, 0],
        [0, 1, 0, 0, 1],
        [0, 0, 0, 1, 1],
      ];
      const steps = buildMIASteps(grid);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.maxArea).toBe(5);
    });
  });

  describe('Dijkstra Single-Source Shortest Path (朴素 & 堆优化)', () => {
    it('5. 朴素 Dijkstra 计算到达所有节点的最短距离', () => {
      const steps = buildDJBSteps();
      expect(steps.length).toBeGreaterThan(0);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.dist).toEqual([0, 3, 1, 4, 7]);
    });

    it('6. 堆优化 Dijkstra 求解最短路与朴素版本一致', () => {
      const steps = buildDJHSteps();
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.dist).toEqual([0, 3, 1, 4, 7]);
    });
  });

  describe('Bellman-Ford & SPFA (负权最短路径)', () => {
    it('7. Bellman-Ford 含负权边图求得正确最短距离', () => {
      const steps = buildBFSteps();
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.dist).toEqual([0, 4, 2, 5, 3]);
    });

    it('8. SPFA 队列优化最短路求解结果与 Bellman-Ford 一致', () => {
      const steps = buildSPFASteps();
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.dist).toEqual([0, 4, 2, 5, 3]);
    });
  });

  describe('Floyd-Warshall All-Pairs Shortest Path (全源最短路)', () => {
    it('9. 动态规划矩阵更新求得全源最短路矩阵', () => {
      const steps = buildFloydSteps();
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      // 0->1: 5, 0->2: 8, 0->3: 9 (0->1->2->3 is 5+3+1=9 < 10)
      expect(lastStep.matrix[0][3]).toBe(9);
      expect(lastStep.matrix[0][2]).toBe(8);
      expect(lastStep.matrix[1][3]).toBe(4);
    });
  });

  describe('A* Heuristic Search (启发式寻路)', () => {
    it('10. A* 启发式搜索成功绕过障碍到达终点', () => {
      const steps = buildAStarSteps();
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.finalPath.length).toBeGreaterThan(0);
      expect(lastStep.finalPath[0]).toEqual([0, 0]);
      expect(lastStep.finalPath[lastStep.finalPath.length - 1]).toEqual([4, 5]);
    });
  });

  describe('Minimum Spanning Tree (MST Prim & Kruskal)', () => {
    it('11. Prim 算法加点法成功构建权值为 16 的最小生成树', () => {
      const steps = buildPrimSteps();
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.mstEdges.length).toBe(4);
      expect(lastStep.totalWeight).toBe(16);
    });

    it('12. Kruskal 算法加边法成功构建权值为 16 的最小生成树', () => {
      const steps = buildKruskalSteps();
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.mstEdges.length).toBe(4);
      expect(lastStep.totalWeight).toBe(16);
    });
  });

  describe('Topological Sort (DAG 拓扑排序)', () => {
    it('13. Kahn 算法成功计算出合法的拓扑排序线性序列', () => {
      const steps = buildTopoSteps();
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.order.length).toBe(6);
      // 5 comes before 2 and 0; 4 comes before 0 and 1; 2 comes before 3; 3 comes before 1
      const order = lastStep.order;
      expect(order.indexOf(5)).toBeLessThan(order.indexOf(2));
      expect(order.indexOf(5)).toBeLessThan(order.indexOf(0));
      expect(order.indexOf(4)).toBeLessThan(order.indexOf(0));
      expect(order.indexOf(4)).toBeLessThan(order.indexOf(1));
      expect(order.indexOf(2)).toBeLessThan(order.indexOf(3));
      expect(order.indexOf(3)).toBeLessThan(order.indexOf(1));
    });
  });

  describe('Redundant Connection I & II (冗余连接并查集)', () => {
    it('14. LC 684 正确检测无向环冗余边 [1, 4]', () => {
      const steps = buildRedundantSteps();
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.redundantEdge).toEqual([1, 4]);
    });

    it('15. LC 685 正确识别有向双父冲突冗余边 [2, 3]', () => {
      const steps = buildRedundantIISteps();
      const lastStep = steps[steps.length - 1];
      expect(lastStep.action).toBe('done');
      expect(lastStep.resultEdge).toEqual([2, 3]);
    });
  });
});
