/**
 * 3D 空间图论自适应布局引擎 (ThreeGraphLayoutEngine)
 * 遵循深度模块设计原则与纯函数策略模式：
 * 纯算法数学计算，0 DOM / 0 WebGL 依赖。
 * 提供三大空间布局算法：
 * 1. 分层立交布局 (Layered Plaza Layout) - 针对网络流层次图 (BFS depth)、DAG 拓扑分层、二分图
 * 2. 平面升维投影 (2D-to-3D Projection) - 保持平面相对坐标并按度数/权重赋予高程落差
 * 3. 3D 空间力导向布局 (Force-Directed 3D) - 库仑斥力与弹簧引力自然舒展
 */

export interface Graph3DNode {
  id: string | number;
  label?: string;
  x?: number;
  y?: number;
  z?: number;
  level?: number;
  layer?: number;
  group?: string | number;
}

export interface Graph3DEdge {
  from: string | number;
  to: string | number;
  weight?: number | string;
  flow?: number;
  cap?: number;
  isDirected?: boolean;
}

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface LayoutBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export interface Graph3DLayoutResult {
  nodes: Map<string | number, Vector3D>;
  bounds: LayoutBounds;
  layers: Map<number, Array<string | number>>;
}

export interface LayeredLayoutOptions {
  layerSpacing?: number;
  radiusScale?: number;
  layerAxis?: 'x' | 'y' | 'z';
}

export interface ProjectionLayoutOptions {
  elevationByDegree?: boolean;
  elevationStep?: number;
  centerXY?: boolean;
}

export interface ForceLayoutOptions {
  iterations?: number;
  k?: number;
  damping?: number;
}

export class ThreeGraphLayoutEngine {
  /**
   * 1. 计算分层立交布局 (Layered Plaza Layout)
   * 将节点按照 level / layer 沿指定主轴 (默认 Z 轴) 递增分层
   * 同层节点在正交平面上呈环状/网格均匀分布，避免视线遮挡
   */
  public static computeLayeredLayout(
    nodes: Graph3DNode[],
    _edges: Graph3DEdge[],
    options: LayeredLayoutOptions = {}
  ): Graph3DLayoutResult {
    const spacing = options.layerSpacing ?? 60;
    const radiusScale = options.radiusScale ?? 45;
    const axis = options.layerAxis ?? 'z';

    const result = new Map<string | number, Vector3D>();
    const layers = new Map<number, Array<string | number>>();

    if (nodes.length === 0) {
      return {
        nodes: result,
        bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
        layers,
      };
    }

    // 按 level 分组
    nodes.forEach((node) => {
      const lvl = node.level ?? node.layer ?? 0;
      if (!layers.has(lvl)) {
        layers.set(lvl, []);
      }
      layers.get(lvl)!.push(node.id);
    });

    // 针对每一层进行平面排布
    layers.forEach((nodeIds, lvl) => {
      const count = nodeIds.length;
      const primaryCoord = lvl * spacing;

      if (count === 1) {
        const id = nodeIds[0];
        if (axis === 'z') result.set(id, { x: 0, y: 0, z: primaryCoord });
        else if (axis === 'x') result.set(id, { x: primaryCoord, y: 0, z: 0 });
        else result.set(id, { x: 0, y: primaryCoord, z: 0 });
      } else {
        const radius = Math.max(radiusScale, count * 15);
        nodeIds.forEach((id, idx) => {
          // 极坐标均匀分布
          const angle = (2 * Math.PI * idx) / count + (lvl % 2 === 1 ? Math.PI / count : 0);
          const u = Math.cos(angle) * radius;
          const v = Math.sin(angle) * radius;

          if (axis === 'z') result.set(id, { x: u, y: v, z: primaryCoord });
          else if (axis === 'x') result.set(id, { x: primaryCoord, y: u, z: v });
          else result.set(id, { x: u, y: primaryCoord, z: v });
        });
      }
    });

    return {
      nodes: result,
      bounds: this.computeBounds(result),
      layers,
    };
  }

  /**
   * 2. 平面升维投影布局 (2D-to-3D Projection Layout)
   * 保留原平面节点相对拓扑，根据节点连通度数或权值赋予高程落差 (Z 轴)
   */
  public static computeProjectionLayout(
    nodes: Graph3DNode[],
    edges: Graph3DEdge[],
    options: ProjectionLayoutOptions = {}
  ): Graph3DLayoutResult {
    const result = new Map<string | number, Vector3D>();
    const layers = new Map<number, Array<string | number>>();

    if (nodes.length === 0) {
      return {
        nodes: result,
        bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
        layers,
      };
    }

    // 统计各节点度数
    const degrees = new Map<string | number, number>();
    edges.forEach((e) => {
      degrees.set(e.from, (degrees.get(e.from) || 0) + 1);
      degrees.set(e.to, (degrees.get(e.to) || 0) + 1);
    });

    // 计算中心偏置
    let sumX = 0;
    let sumY = 0;
    let hasCoords = false;
    nodes.forEach((n) => {
      if (n.x !== undefined && n.y !== undefined) {
        sumX += n.x;
        sumY += n.y;
        hasCoords = true;
      }
    });

    const centerX = hasCoords ? sumX / nodes.length : 0;
    const centerY = hasCoords ? sumY / nodes.length : 0;
    const elevationStep = options.elevationStep ?? 15;

    nodes.forEach((node, idx) => {
      const origX = node.x ?? idx * 50;
      const origY = node.y ?? 0;
      const deg = degrees.get(node.id) || 0;
      const elevation = options.elevationByDegree ? deg * elevationStep : (node.z ?? 0);

      result.set(node.id, {
        x: origX - (options.centerXY ? centerX : 0),
        y: origY - (options.centerXY ? centerY : 0),
        z: elevation,
      });
    });

    return {
      nodes: result,
      bounds: this.computeBounds(result),
      layers,
    };
  }

  /**
   * 3. 3D 空间力导向布局 (Force-Directed 3D)
   * 库仑斥力 + 弹簧胡克引力，迭代退火收敛
   */
  public static computeForceLayout(
    nodes: Graph3DNode[],
    edges: Graph3DEdge[],
    options: ForceLayoutOptions = {}
  ): Graph3DLayoutResult {
    const result = new Map<string | number, Vector3D>();
    const layers = new Map<number, Array<string | number>>();

    if (nodes.length === 0) {
      return {
        nodes: result,
        bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
        layers,
      };
    }

    const count = nodes.length;
    const k = options.k ?? 60;
    const iterations = options.iterations ?? 50;
    const damping = options.damping ?? 0.85;

    // 初始位置分布：球面上斐波那契螺旋分布，避免奇异重合
    nodes.forEach((node, idx) => {
      const phi = Math.acos(1 - (2 * (idx + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * (idx + 0.5);
      const radius = k * 1.2;
      result.set(node.id, {
        x: radius * Math.sin(phi) * Math.cos(theta),
        y: radius * Math.sin(phi) * Math.sin(theta),
        z: radius * Math.cos(phi),
      });
    });

    const velocities = new Map<string | number, Vector3D>();
    nodes.forEach((node) => velocities.set(node.id, { x: 0, y: 0, z: 0 }));

    // 迭代模拟力场
    for (let iter = 0; iter < iterations; iter++) {
      const forces = new Map<string | number, Vector3D>();
      nodes.forEach((node) => forces.set(node.id, { x: 0, y: 0, z: 0 }));

      // 1. 库仑斥力 (所有节点对之间)
      for (let i = 0; i < count; i++) {
        const idA = nodes[i].id;
        const posA = result.get(idA)!;
        const forceA = forces.get(idA)!;

        for (let j = i + 1; j < count; j++) {
          const idB = nodes[j].id;
          const posB = result.get(idB)!;
          const forceB = forces.get(idB)!;

          let dx = posA.x - posB.x;
          let dy = posA.y - posB.y;
          let dz = posA.z - posB.z;
          let dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
          if (dist < 0.1) {
            dx = (Math.random() - 0.5) * 2;
            dy = (Math.random() - 0.5) * 2;
            dz = (Math.random() - 0.5) * 2;
            dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;
          }

          const rep = (k * k) / dist;
          const fx = (dx / dist) * rep;
          const fy = (dy / dist) * rep;
          const fz = (dz / dist) * rep;

          forceA.x += fx;
          forceA.y += fy;
          forceA.z += fz;

          forceB.x -= fx;
          forceB.y -= fy;
          forceB.z -= fz;
        }
      }

      // 2. 弹簧引力 (沿边相连的节点之间)
      edges.forEach((edge) => {
        const posA = result.get(edge.from);
        const posB = result.get(edge.to);
        if (!posA || !posB) return;

        const forceA = forces.get(edge.from)!;
        const forceB = forces.get(edge.to)!;

        const dx = posA.x - posB.x;
        const dy = posA.y - posB.y;
        const dz = posA.z - posB.z;
        const dist = Math.sqrt(dx * dx + dy * dy + dz * dz) || 1;

        const att = (dist * dist) / k;
        const fx = (dx / dist) * att;
        const fy = (dy / dist) * att;
        const fz = (dz / dist) * att;

        forceA.x -= fx;
        forceA.y -= fy;
        forceA.z -= fz;

        forceB.x += fx;
        forceB.y += fy;
        forceB.z += fz;
      });

      // 3. 更新速度与位置
      nodes.forEach((node) => {
        const vel = velocities.get(node.id)!;
        const force = forces.get(node.id)!;
        const pos = result.get(node.id)!;

        vel.x = (vel.x + force.x * 0.05) * damping;
        vel.y = (vel.y + force.y * 0.05) * damping;
        vel.z = (vel.z + force.z * 0.05) * damping;

        pos.x += vel.x;
        pos.y += vel.y;
        pos.z += vel.z;
      });
    }

    return {
      nodes: result,
      bounds: this.computeBounds(result),
      layers,
    };
  }

  /**
   * 计算包围盒尺寸
   */
  public static computeBounds(positions: Map<string | number, Vector3D>): LayoutBounds {
    if (positions.size === 0) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 };
    }

    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    positions.forEach((p) => {
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
      if (p.z < minZ) minZ = p.z;
      if (p.z > maxZ) maxZ = p.z;
    });

    return { minX, maxX, minY, maxY, minZ, maxZ };
  }
}
