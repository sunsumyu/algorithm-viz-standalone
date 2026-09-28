import { describe, it, expect } from 'vitest';
import { buildDijkstraBasic061Steps } from './dijkstra-basic-061-renderer';
import { buildDijkstraHeap061Steps } from './dijkstra-heap-061-renderer';
import { buildBellmanFord061Steps } from './bellman-ford-061-renderer';
import { buildSpfa061Steps } from './spfa-061-renderer';
import { buildFloyd061Steps } from './floyd-061-renderer';
import { buildNegativeCycle061Steps } from './negative-cycle-061-renderer';

describe('左程云算法通关课 Class 061: 最短路全解专题测试套件', () => {
  // 1. Code01: 朴素 Dijkstra (O(V²))
  describe('Code01: 朴素 Dijkstra (Dijkstra Naive · O(V²))', () => {
    it('在 5 节点经典拓扑图中正确计算最短路径并逐步锁定顶点', () => {
      const steps = buildDijkstraBasic061Steps('default_5nodes');
      expect(steps.length).toBeGreaterThan(4);
      const last = steps[steps.length - 1];
      expect(last.dist[0]).toBe(0);
      expect(last.dist[1]).toBe(3); // 0->2(1) + 2->1(2) = 3 < 0->1(4)
      expect(last.dist[2]).toBe(1);
      expect(last.dist[3]).toBe(4); // 0->2->1(3) + 1->3(1) = 4
      expect(last.dist[4]).toBe(7); // 4 + 3 = 7
      expect(steps.every((s) => s.codeLine !== undefined)).toBe(true);
    });

    it('在 4 节点稠密图中正确完成多路径扫描与松弛', () => {
      const steps = buildDijkstraBasic061Steps('dense_4nodes');
      const last = steps[steps.length - 1];
      expect(last.dist[0]).toBe(0);
      expect(last.dist[1]).toBe(3);
      expect(last.dist[2]).toBe(4); // 0->1(3) + 1->2(1) = 4 < 0->2(5)
      expect(last.dist[3]).toBe(6); // 0->1->2(4) + 2->3(2) = 6
    });
  });

  // 2. Code02: 堆优化 Dijkstra (O(E log V))
  describe('Code02: 堆优化 Dijkstra (Dijkstra Heap · O(E log V))', () => {
    it('在 5 节点拓扑中利用小根堆正确完成优先队列松弛', () => {
      const steps = buildDijkstraHeap061Steps('default_5nodes');
      expect(steps.length).toBeGreaterThan(5);
      const last = steps[steps.length - 1];
      expect(last.dist[0]).toBe(0);
      expect(last.dist[1]).toBe(2);
      expect(last.dist[2]).toBe(3);
      expect(last.dist[3]).toBe(6);
      expect(last.dist[4]).toBe(7);
      expect(last.statusBadge?.text).toBe('计算完成');
      expect(steps.some((s) => s.pqSnapshot && s.pqSnapshot.length > 0)).toBe(true);
    });

    it('在 6 节点分支拓扑中正确比较多分支堆顶弹出', () => {
      const steps = buildDijkstraHeap061Steps('branch_6nodes');
      const last = steps[steps.length - 1];
      expect(last.dist[5]).toBe(6);
      expect(steps.every((s) => s.decision.length > 0)).toBe(true);
    });
  });

  // 3. Code03: Bellman-Ford 算法 (V-1 轮松弛)
  describe('Code03: Bellman-Ford 算法 (V-1 轮全边暴力松弛)', () => {
    it('在含负权边拓扑中正确计算负权缩短并提前早停', () => {
      const steps = buildBellmanFord061Steps('negative_weight');
      expect(steps.length).toBeGreaterThan(4);
      const last = steps[steps.length - 1];
      expect(last.dist[0]).toBe(0);
      expect(last.dist[1]).toBe(3); // 0->2(4) + 2->1(-1) = 3 < 6
      expect(last.dist[2]).toBe(4);
      expect(last.dist[3]).toBe(1); // 0->2->1(3) + 1->3(-2) = 1
      expect(last.dist[4]).toBe(3); // 0->2->1->3(1) + 3->4(2) = 3
      // 验证早停优化被触发
      expect(steps.some((s) => s.decision.includes('早停优化触发'))).toBe(true);
    });

    it('在简单正权图中稳健收敛', () => {
      const steps = buildBellmanFord061Steps('positive_simple');
      const last = steps[steps.length - 1];
      expect(last.dist[0]).toBe(0);
      expect(last.dist[1]).toBe(2);
      expect(last.dist[2]).toBe(3); // 0->1(2) + 1->2(1) = 3 < 5
      expect(last.dist[3]).toBe(4); // 0->1->2(3) + 2->3(1) = 4 < 6
    });
  });

  // 4. Code04: SPFA 算法 (队列优化)
  describe('Code04: SPFA 算法 (Shortest Path Faster Algorithm)', () => {
    it('在含负权链拓扑中动态出入队并计算最短路', () => {
      const steps = buildSpfa061Steps('negative_chain');
      expect(steps.length).toBeGreaterThan(4);
      const last = steps[steps.length - 1];
      expect(last.dist[0]).toBe(0);
      expect(last.dist[1]).toBe(2);
      expect(last.dist[2]).toBe(0); // 0->1(2) + 1->2(-2) = 0 < 5
      expect(last.dist[3]).toBe(3); // 0->1->2(0) + 2->3(3) = 3
      expect(last.dist[4]).toBe(5); // 0->1->2->3(3) + 3->4(2) = 5
      expect(last.queue.length).toBe(0);
    });

    it('在稠密正权图中正确维护 inQueue 状态', () => {
      const steps = buildSpfa061Steps('dense_positive');
      const last = steps[steps.length - 1];
      expect(last.dist[0]).toBe(0);
      expect(last.dist[3]).toBe(6); // 0->1(3) + 1->2(1) + 2->3(2) = 6
    });
  });

  // 5. Code05: Floyd-Warshall 全源最短路
  describe('Code05: Floyd-Warshall 全源最短路算法 (O(V³))', () => {
    it('在 4 节点交叉图中正确求解任意两点间的最短距离矩阵', () => {
      const steps = buildFloyd061Steps('default_4nodes');
      expect(steps.length).toBeGreaterThan(6);
      const last = steps[steps.length - 1];
      const dp = last.dp;
      // 0->2: 0->1(3) + 1->2(2) = 5 < 8
      expect(dp[0][2]).toBe(5);
      // 0->3: 0->1(3) + 1->2(2) + 2->3(1) = 6
      expect(dp[0][3]).toBe(6);
      // 3->1: 3->0(2) + 0->1(3) = 5
      expect(dp[3][1]).toBe(5);
      // 对角线为 0
      for (let i = 0; i < 4; i++) {
        expect(dp[i][i]).toBe(0);
      }
    });

    it('在环形图中完成全联通闭包扩散', () => {
      const steps = buildFloyd061Steps('directed_cycle');
      const last = steps[steps.length - 1];
      const dp = last.dp;
      expect(dp[0][3]).toBe(6); // 1 + 2 + 3 = 6
      expect(dp[3][2]).toBe(7); // 3->0(4) + 0->1(1) + 1->2(2) = 7
    });
  });

  // 6. Code06: 负权环判定 (洛谷 P3385)
  describe('Code06: 负权环判定算法 (洛谷 P3385 · SPFA 计数判环)', () => {
    it('在包含负权环的拓扑中准确捕获 count >= n 并警报', () => {
      const steps = buildNegativeCycle061Steps('has_cycle');
      expect(steps.length).toBeGreaterThan(3);
      const last = steps[steps.length - 1];
      expect(last.hasCycle).toBe(true);
      expect(last.statusBadge?.type).toBe('danger');
      expect(last.decision).toContain('负权环警报触发');
      expect(steps.some((s) => s.count.some((c) => c >= 4))).toBe(true);
    });

    it('在无负权环的拓扑中安全清空队列并返回 false', () => {
      const steps = buildNegativeCycle061Steps('no_cycle');
      const last = steps[steps.length - 1];
      expect(last.hasCycle).toBe(false);
      expect(last.statusBadge?.type).toBe('success');
      expect(last.decision).toContain('判定无负权环');
    });
  });
});
