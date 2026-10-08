/**
 * Class 064 最短路进阶与分层图 step-compiler 独立伴生测试
 */

import { describe, it, expect } from 'vitest';
import { buildNetworkDelay064Steps } from './network-delay-time-064-step-compiler';
import { buildPathMinEffort064Steps } from './path-min-effort-064-step-compiler';
import { buildSwimInRisingWater064Steps } from './swim-in-rising-water-064-step-compiler';
import { buildLayeredDijkstra064Steps } from './layered-dijkstra-064-step-compiler';
import { buildEVCharge064Steps } from './ev-charge-dijkstra-064-step-compiler';
import { buildStateComp064Steps } from './state-compression-bfs-064-step-compiler';

describe('Class 064 Step Compilers 伴生契约测试', () => {
  it('buildNetworkDelay064Steps 堆优化广播最短路与行号覆盖', () => {
    const steps = buildNetworkDelay064Steps('classic_4nodes');
    expect(steps.length).toBeGreaterThan(4);
    expect(steps.every((s) => typeof s.line === 'number' && s.line >= 1)).toBe(true);
    expect(steps.every((s) => typeof s.decision === 'string' && s.decision.length > 0)).toBe(true);
    expect(steps[steps.length - 1].maxDelaySoFar).toBe(2);
  });

  it('buildPathMinEffort064Steps 瓶颈最短路落差松弛', () => {
    const steps = buildPathMinEffort064Steps('classic_mountain_3x3');
    expect(steps.length).toBeGreaterThan(4);
    expect(steps.every((s) => typeof s.line === 'number' && s.line >= 1)).toBe(true);
    expect(steps[steps.length - 1].metrics?.['最终体力消耗']).toBe(2);
  });

  it('buildSwimInRisingWater064Steps 定向淹没泳池用时', () => {
    const steps = buildSwimInRisingWater064Steps('simple3');
    expect(steps.length).toBeGreaterThan(4);
    expect(steps.every((s) => typeof s.line === 'number' && s.line >= 1)).toBe(true);
    expect(steps[steps.length - 1].curWaterLevel).toBe(8);
  });

  it('buildLayeredDijkstra064Steps 分层图双决策免票跨层', () => {
    const steps = buildLayeredDijkstra064Steps('p4568_standard');
    expect(steps.length).toBeGreaterThan(4);
    expect(steps.every((s) => typeof s.line === 'number' && s.line >= 1)).toBe(true);
    expect(steps[steps.length - 1].bestCostSoFar).toBe(4);
  });

  it('buildEVCharge064Steps 电动车状态扩维充放电权衡', () => {
    const steps = buildEVCharge064Steps('lcp35_3cities');
    expect(steps.length).toBeGreaterThan(4);
    expect(steps.every((s) => typeof s.line === 'number' && s.line >= 1)).toBe(true);
    expect(steps[steps.length - 1].decision).toContain('10');
  });

  it('buildStateComp064Steps 状压 BFS 多源并发全点点亮', () => {
    const steps = buildStateComp064Steps('triangle_3nodes');
    expect(steps.length).toBeGreaterThan(4);
    expect(steps.every((s) => typeof s.line === 'number' && s.line >= 1)).toBe(true);
    expect(steps[steps.length - 1].curDist).toBe(2);
  });
});
