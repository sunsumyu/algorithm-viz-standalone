import { describe, it, expect } from 'vitest';
import {
  ThreeGraphLayoutEngine,
  type Graph3DNode,
  type Graph3DEdge,
} from './three-graph-layout-engine';

describe('ThreeGraphLayoutEngine Deep Module', () => {
  it('computes layered plaza layout along Z-axis based on node levels', () => {
    const nodes: Graph3DNode[] = [
      { id: 'S', level: 0 },
      { id: 'A', level: 1 },
      { id: 'B', level: 1 },
      { id: 'C', level: 2 },
      { id: 'T', level: 3 },
    ];
    const edges: Graph3DEdge[] = [
      { from: 'S', to: 'A' },
      { from: 'S', to: 'B' },
      { from: 'A', to: 'C' },
      { from: 'B', to: 'C' },
      { from: 'C', to: 'T' },
    ];

    const result = ThreeGraphLayoutEngine.computeLayeredLayout(nodes, edges, {
      layerSpacing: 60,
      radiusScale: 40,
    });

    // 检查所有节点均有有效且非 NaN 的 3D 坐标
    expect(result.nodes.size).toBe(5);
    for (const node of nodes) {
      const pos = result.nodes.get(node.id);
      expect(pos).toBeDefined();
      expect(Number.isFinite(pos!.x)).toBe(true);
      expect(Number.isFinite(pos!.y)).toBe(true);
      expect(Number.isFinite(pos!.z)).toBe(true);
    }

    // 验证 Z 轴深度随 level 严格递增/分层
    const posS = result.nodes.get('S')!;
    const posA = result.nodes.get('A')!;
    const posB = result.nodes.get('B')!;
    const posC = result.nodes.get('C')!;
    const posT = result.nodes.get('T')!;

    expect(posS.z).toBe(0);
    expect(posA.z).toBe(60);
    expect(posB.z).toBe(60);
    expect(posC.z).toBe(120);
    expect(posT.z).toBe(180);

    // 同一层级的 A 与 B 应该在 X-Y 平面错开，避免重叠
    const distAB = Math.hypot(posA.x - posB.x, posA.y - posB.y);
    expect(distAB).toBeGreaterThan(10);

    // 验证 layers 分组
    expect(result.layers.get(1)).toContain('A');
    expect(result.layers.get(1)).toContain('B');
  });

  it('computes 2D-to-3D projection layout preserving relative XY positions and adding elevation', () => {
    const nodes: Graph3DNode[] = [
      { id: 1, x: 100, y: 50 },
      { id: 2, x: 200, y: 150 },
      { id: 3, x: 300, y: 50 },
    ];
    const edges: Graph3DEdge[] = [
      { from: 1, to: 2, weight: 10 },
      { from: 2, to: 3, weight: 5 },
    ];

    const result = ThreeGraphLayoutEngine.computeProjectionLayout(nodes, edges, {
      elevationByDegree: true,
      elevationStep: 15,
    });

    expect(result.nodes.size).toBe(3);
    const p1 = result.nodes.get(1)!;
    const p2 = result.nodes.get(2)!;
    const p3 = result.nodes.get(3)!;

    // XY 相对中心化
    expect(p2.x).toBeGreaterThan(p1.x);
    expect(p3.x).toBeGreaterThan(p2.x);

    // 度数最高的节点 2 (deg=2) 具有更高的高程
    expect(p2.z).toBeGreaterThan(p1.z);
    expect(p2.z).toBeGreaterThan(p3.z);
  });

  it('computes 3D force-directed layout for unlayered graphs without NaN or collisions', () => {
    const nodes: Graph3DNode[] = [
      { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' }
    ];
    const edges: Graph3DEdge[] = [
      { from: '1', to: '2' },
      { from: '2', to: '3' },
      { from: '3', to: '4' },
      { from: '4', to: '5' },
      { from: '5', to: '1' },
      { from: '1', to: '3' },
    ];

    const result = ThreeGraphLayoutEngine.computeForceLayout(nodes, edges, {
      iterations: 50,
      k: 50,
    });

    expect(result.nodes.size).toBe(5);
    const positions = Array.from(result.nodes.values());

    // 检查所有坐标均为有限数值
    positions.forEach((p) => {
      expect(Number.isFinite(p.x)).toBe(true);
      expect(Number.isFinite(p.y)).toBe(true);
      expect(Number.isFinite(p.z)).toBe(true);
    });

    // 检查任意两节点间距非零（无重合碰撞）
    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const d = Math.hypot(
          positions[i].x - positions[j].x,
          positions[i].y - positions[j].y,
          positions[i].z - positions[j].z
        );
        expect(d).toBeGreaterThan(5);
      }
    }
  });

  it('handles empty or single-node graphs gracefully', () => {
    const emptyResult = ThreeGraphLayoutEngine.computeLayeredLayout([], []);
    expect(emptyResult.nodes.size).toBe(0);

    const singleResult = ThreeGraphLayoutEngine.computeLayeredLayout([{ id: 'solo' }], []);
    expect(singleResult.nodes.size).toBe(1);
    const solo = singleResult.nodes.get('solo')!;
    expect(solo).toEqual({ x: 0, y: 0, z: 0 });
  });
});
