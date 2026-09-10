import { describe, it, expect } from 'vitest';
import {
  ThreeGraphParticleFlow,
  type FlowParticleEdge,
} from './three-graph-particle-flow';

describe('ThreeGraphParticleFlow Deep Module', () => {
  it('interpolates 3D parabolic arc point between two nodes correctly', () => {
    const p1 = { x: 0, y: 0, z: 0 };
    const p2 = { x: 100, y: 0, z: 0 };

    // t = 0 should be at p1
    const start = ThreeGraphParticleFlow.interpolateArcPoint(p1, p2, 0, 20);
    expect(start.x).toBeCloseTo(0);
    expect(start.y).toBeCloseTo(0);
    expect(start.z).toBeCloseTo(0);

    // t = 1 should be at p2
    const end = ThreeGraphParticleFlow.interpolateArcPoint(p1, p2, 1, 20);
    expect(end.x).toBeCloseTo(100);
    expect(end.y).toBeCloseTo(0);
    expect(end.z).toBeCloseTo(0);

    // t = 0.5 should be at midpoint + arc height on Y/Z
    const mid = ThreeGraphParticleFlow.interpolateArcPoint(p1, p2, 0.5, 20);
    expect(mid.x).toBeCloseTo(50);
    expect(mid.y).toBeGreaterThan(15); // arched upward
  });

  it('initializes and steps particles along flowing edges smoothly', () => {
    const edges: FlowParticleEdge[] = [
      { id: 'S->A', from: { x: 0, y: 0, z: 0 }, to: { x: 50, y: 0, z: 50 }, flow: 8, cap: 10, isActivePath: true },
      { id: 'S->B', from: { x: 0, y: 0, z: 0 }, to: { x: -50, y: 0, z: 50 }, flow: 0, cap: 10 },
      { id: 'A->T', from: { x: 50, y: 0, z: 50 }, to: { x: 0, y: 0, z: 100 }, flow: 10, cap: 10, isSaturated: true },
    ];

    const flowSystem = new ThreeGraphParticleFlow({
      particlesPerEdge: 5,
      baseSpeed: 0.5,
    });

    flowSystem.syncEdges(edges);

    // 应该只为有流量或在活动路径上的边生成流动粒子 (S->A 有8, A->T 有10)
    const initialParticles = flowSystem.getParticles();
    expect(initialParticles.length).toBeGreaterThan(0);
    const initialT = initialParticles[0].t;

    // 步进时间 0.1s
    flowSystem.step(0.1);
    const updatedParticles = flowSystem.getParticles();

    // 粒子沿 t 轴前进
    expect(updatedParticles[0].t).not.toBe(initialT);
    // 所有粒子的 t 始终规范在 [0, 1) 区间
    updatedParticles.forEach((p) => {
      expect(p.t).toBeGreaterThanOrEqual(0);
      expect(p.t).toBeLessThan(1);
      expect(Number.isFinite(p.position.x)).toBe(true);
      expect(Number.isFinite(p.position.y)).toBe(true);
      expect(Number.isFinite(p.position.z)).toBe(true);
    });
  });

  it('maps particle colors accurately based on edge states', () => {
    const activeColor = ThreeGraphParticleFlow.resolveParticleColor({
      id: 'e1',
      from: { x: 0, y: 0, z: 0 },
      to: { x: 10, y: 0, z: 0 },
      flow: 5,
      cap: 10,
      isActivePath: true,
    });
    expect(activeColor).toBe('#f59e0b'); // 金黄高亮

    const saturatedColor = ThreeGraphParticleFlow.resolveParticleColor({
      id: 'e2',
      from: { x: 0, y: 0, z: 0 },
      to: { x: 10, y: 0, z: 0 },
      flow: 10,
      cap: 10,
      isSaturated: true,
    });
    expect(saturatedColor).toBe('#ef4444'); // 饱和红

    const normalFlowColor = ThreeGraphParticleFlow.resolveParticleColor({
      id: 'e3',
      from: { x: 0, y: 0, z: 0 },
      to: { x: 10, y: 0, z: 0 },
      flow: 3,
      cap: 10,
    });
    expect(normalFlowColor).toBe('#38bdf8'); // 清澈水流蓝
  });

  it('handles empty edge list gracefully without errors', () => {
    const flowSystem = new ThreeGraphParticleFlow();
    flowSystem.syncEdges([]);
    expect(flowSystem.getParticles().length).toBe(0);
    expect(() => flowSystem.step(0.016)).not.toThrow();
  });
});
