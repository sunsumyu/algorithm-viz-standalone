import { describe, it, expect } from 'vitest';
import {
  ShortestPathSummaryVisualizer,
  buildSPSSteps,
  SPS_ALGOS,
} from './shortest-path-summary-renderer';

describe('ShortestPathSummary (五大最短路算法总结篇)', () => {
  it('应当能正确实例化 ShortestPathSummaryVisualizer', () => {
    const viz = new ShortestPathSummaryVisualizer();
    expect(viz).toBeDefined();
  });

  it('应当涵盖五大最短路算法卡片 (Dijkstra, Bellman-Ford, SPFA, Floyd, A*)', () => {
    expect(SPS_ALGOS.length).toBe(5);
    const ids = SPS_ALGOS.map((a) => a.id);
    expect(ids).toContain('dijkstra');
    expect(ids).toContain('bellman-ford');
    expect(ids).toContain('spfa');
    expect(ids).toContain('floyd');
    expect(ids).toContain('a-star');
  });

  it('应当生成结构完整且具备详细说明的步骤序列', () => {
    const steps = buildSPSSteps();
    expect(steps.length).toBe(7); // 1 概述 + 5 算法详情 + 1 总结

    for (const step of steps) {
      expect(step.message).toBeTruthy();
      expect(step.log).toBeTruthy();
      expect(step.cards).toHaveLength(5);
    }

    const dijkstraStep = steps.find((s) => s.activeAlgo === 'dijkstra');
    expect(dijkstraStep).toBeDefined();
    expect(dijkstraStep?.detail).toContain('贪心策略');
  });
});
