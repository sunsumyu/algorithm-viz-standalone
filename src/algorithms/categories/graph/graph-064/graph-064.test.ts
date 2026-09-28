import { describe, it, expect } from 'vitest';
import { buildNetworkDelay064Steps } from './network-delay-time-064-renderer';
import { buildPathMinEffort064Steps } from './path-min-effort-064-renderer';
import { buildSwimInRisingWater064Steps } from './swim-in-rising-water-064-renderer';
import { buildLayeredDijkstra064Steps } from './layered-dijkstra-064-renderer';
import { buildEVCharge064Steps } from './ev-charge-dijkstra-064-renderer';
import { buildStateComp064Steps } from './state-compression-bfs-064-renderer';

describe('左程云算法通关课 Class 064: Dijkstra 算法及其扩展测试套件', () => {
  // 1. Code01: 网络延迟时间 (LeetCode 743)
  describe('Code01: 网络延迟时间 (Network Delay Time · LeetCode 743)', () => {
    it('在经典 4 节点网络中正确计算全网延迟 2ms 并输出完整步骤', () => {
      const steps = buildNetworkDelay064Steps('classic_4nodes');
      expect(steps.length).toBeGreaterThan(4);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.maxDelaySoFar).toBe(2);
      expect(lastStep.decision).toContain('2ms');
      expect(steps.every((s) => s.codeLine !== undefined)).toBe(true);
    });

    it('在存在孤立节点时正确检测全网不可达并返回 -1', () => {
      const steps = buildNetworkDelay064Steps('disconnected_nodes');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.maxDelaySoFar).toBe(-1);
      expect(lastStep.decision).toContain('-1');
    });

    it('在链状广播拓扑中正常完成逐步松弛', () => {
      const steps = buildNetworkDelay064Steps('line_chain');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.maxDelaySoFar).toBe(7);
    });
  });

  // 2. Code02: 最小体力消耗路径 (LeetCode 1631)
  describe('Code02: 最小体力消耗路径 (Path With Minimum Effort · LeetCode 1631)', () => {
    it('在 3x3 经典山脉地图中正确求出瓶颈体力消耗 2', () => {
      const steps = buildPathMinEffort064Steps('classic_mountain_3x3');
      expect(steps.length).toBeGreaterThan(4);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.['最终体力消耗']).toBe(2);
      expect(lastStep.decision).toContain('2');
    });

    it('在 2x2 平坦地形特判中体力消耗为 0', () => {
      const steps = buildPathMinEffort064Steps('flat_2x2');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.['最终体力消耗']).toBe(0);
    });

    it('在险峻山谷地图中正确松弛并达成终点', () => {
      const steps = buildPathMinEffort064Steps('valley_3x3');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.['最终体力消耗']).toBe(1);
    });
  });

  // 3. Code03: 水位上升泳池中游泳 (LeetCode 778)
  describe('Code03: 水位上升泳池中游泳 (Swim In Rising Water · LeetCode 778)', () => {
    it('在 5x5 官方经典泳池中求出最少用时 20', () => {
      const steps = buildSwimInRisingWater064Steps('leetcode5');
      expect(steps.length).toBeGreaterThan(4);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.['最终最少用时']).toBe(20);
      expect(lastStep.curWaterLevel).toBe(20);
    });

    it('在 3x3 递增阶梯中正确求出最少用时 8', () => {
      const steps = buildSwimInRisingWater064Steps('simple3');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.['最终最少用时']).toBe(8);
    });

    it('在 4x4 断崖迷宫中正确完成定向淹没搜索', () => {
      const steps = buildSwimInRisingWater064Steps('cliff4');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.metrics?.['最终最少用时']).toBe(6);
    });
  });

  // 4. Code04: 飞行路线分层图 (洛谷 P4568)
  describe('Code04: 飞行路线 (Flight Routes · 洛谷 P4568)', () => {
    it('在 5 城市标准分层图中正确使用 1 次免费票获得最优费用 4', () => {
      const steps = buildLayeredDijkstra064Steps('p4568_standard');
      expect(steps.length).toBeGreaterThan(4);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.bestCostSoFar).toBe(4);
      expect(lastStep.decision).toContain('4');
    });

    it('在 3 城市入门双层图中正确使用免票直达终点获得最优费用 0', () => {
      const steps = buildLayeredDijkstra064Steps('simple_3node');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.bestCostSoFar).toBe(0);
    });
  });

  // 5. Code05: 电动车游历城市最小费用 (LeetCode LCP 35)
  describe('Code05: 电动车游历城市 (Electric Vehicle Charging · LeetCode LCP 35)', () => {
    it('在 3 城市标准充电网中获得最优耗时 10s', () => {
      const steps = buildEVCharge064Steps('lcp35_3cities');
      expect(steps.length).toBeGreaterThan(4);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.decision).toContain('10');
    });

    it('在捷径电价权衡用例中获得最优耗时 11s', () => {
      const steps = buildEVCharge064Steps('lcp35_shortcut');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.decision).toContain('11');
    });
  });

  // 6. Code06: 访问所有节点的最短路径 (LeetCode 847)
  describe('Code06: 访问所有节点最短路径 (Shortest Path Visiting All Nodes · LeetCode 847)', () => {
    it('在 4 节点星形拓扑中通过状态压缩广搜求出最优步数 4', () => {
      const steps = buildStateComp064Steps('star_4nodes');
      expect(steps.length).toBeGreaterThan(4);
      const lastStep = steps[steps.length - 1];
      expect(lastStep.curDist).toBe(4);
      expect(lastStep.decision).toContain('4');
    });

    it('在 3 节点三角形连通图中求出最优步数 2', () => {
      const steps = buildStateComp064Steps('triangle_3nodes');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.curDist).toBe(2);
    });

    it('在 4 节点线性链状图中求出最优步数 3', () => {
      const steps = buildStateComp064Steps('chain_4nodes');
      const lastStep = steps[steps.length - 1];
      expect(lastStep.curDist).toBe(3);
    });
  });
});
