/**
 * Class 061 最短路 step-compiler 独立伴生测试
 */

import { describe, it, expect } from 'vitest';
import { buildDijkstraBasic061Steps } from './dijkstra-basic-061-step-compiler';
import { buildDijkstraHeap061Steps } from './dijkstra-heap-061-step-compiler';
import { buildBellmanFord061Steps } from './bellman-ford-061-step-compiler';
import { buildSpfa061Steps } from './spfa-061-step-compiler';
import { buildFloyd061Steps } from './floyd-061-step-compiler';
import { buildNegativeCycle061Steps } from './negative-cycle-061-step-compiler';

describe('Class 061 Step Compilers 伴生契约测试', () => {
  it('buildDijkstraBasic061Steps 生成完备步进与 1-based 行号', () => {
    const steps = buildDijkstraBasic061Steps('default_5nodes');
    expect(steps.length).toBeGreaterThan(5);
    expect(steps.every((s) => typeof s.line === 'number' && s.line >= 1)).toBe(true);
    expect(steps.every((s) => typeof s.decision === 'string' && s.decision.length > 0)).toBe(true);
    expect(steps[steps.length - 1].dist[4]).toBe(7);
  });

  it('buildDijkstraHeap061Steps 维护优先队列小根堆与有效行号', () => {
    const steps = buildDijkstraHeap061Steps('branch_6nodes');
    expect(steps.length).toBeGreaterThan(6);
    expect(steps.every((s) => typeof s.line === 'number' && s.line >= 1)).toBe(true);
    expect(steps[steps.length - 1].dist[5]).toBe(6);
  });

  it('buildBellmanFord061Steps 能够检测负权边松弛与早停', () => {
    const steps = buildBellmanFord061Steps('negative_weight');
    expect(steps.length).toBeGreaterThan(4);
    expect(steps.every((s) => typeof s.line === 'number' && s.line >= 1)).toBe(true);
    expect(steps.some((s) => s.decision.includes('早停优化触发'))).toBe(true);
  });

  it('buildSpfa061Steps 队列优化动态出入队', () => {
    const steps = buildSpfa061Steps('negative_chain');
    expect(steps.length).toBeGreaterThan(4);
    expect(steps.every((s) => typeof s.line === 'number' && s.line >= 1)).toBe(true);
    expect(steps[steps.length - 1].queue.length).toBe(0);
  });

  it('buildFloyd061Steps 求解全源最短路', () => {
    const steps = buildFloyd061Steps('default_4nodes');
    expect(steps.length).toBeGreaterThan(6);
    expect(steps.every((s) => typeof s.line === 'number' && s.line >= 1)).toBe(true);
    expect(steps[steps.length - 1].dp[0][3]).toBe(6);
  });

  it('buildNegativeCycle061Steps 负环判定警报与安全图', () => {
    const cycleSteps = buildNegativeCycle061Steps('has_cycle');
    expect(cycleSteps[cycleSteps.length - 1].hasCycle).toBe(true);
    expect(cycleSteps.every((s) => typeof s.line === 'number' && s.line >= 1)).toBe(true);

    const safeSteps = buildNegativeCycle061Steps('no_cycle');
    expect(safeSteps[safeSteps.length - 1].hasCycle).toBe(false);
    expect(safeSteps.every((s) => typeof s.line === 'number' && s.line >= 1)).toBe(true);
  });
});
