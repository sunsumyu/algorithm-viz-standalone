/**
 * 3D 空间图论流光管道与粒子流动引擎 (ThreeGraphParticleFlow)
 * 遵循深度模块设计与纯计算/渲染解耦：
 * 纯状态机计算，0 WebGL 强依赖，对外暴露粒子坐标切片与颜色/尺寸推导。
 * 负责在有向网络边、最大流增广流束与最短路路径上实时模拟流光脉冲。
 */

import type { Vector3D } from './three-graph-layout-engine';

export interface FlowParticleEdge {
  id: string;
  from: Vector3D;
  to: Vector3D;
  flow?: number;
  cap?: number;
  weight?: number | string;
  isActivePath?: boolean;
  isSaturated?: boolean;
  arcHeight?: number;
}

export interface Particle3D {
  id: string;
  edgeId: string;
  t: number;
  speed: number;
  color: string;
  size: number;
  position: Vector3D;
}

export interface ParticleFlowOptions {
  particlesPerEdge?: number;
  baseSpeed?: number;
  defaultArcHeight?: number;
}

export class ThreeGraphParticleFlow {
  private edges: FlowParticleEdge[] = [];
  private particles: Particle3D[] = [];
  private particlesPerEdge: number;
  private baseSpeed: number;
  private defaultArcHeight: number;

  constructor(options: ParticleFlowOptions = {}) {
    this.particlesPerEdge = options.particlesPerEdge ?? 4;
    this.baseSpeed = options.baseSpeed ?? 0.35;
    this.defaultArcHeight = options.defaultArcHeight ?? 12;
  }

  /**
   * 同步当前图状态的有向边集，为活跃边（有流量或在增广路径上）构建粒子群
   */
  public syncEdges(edges: FlowParticleEdge[]): void {
    this.edges = edges;
    this.rebuildParticles();
  }

  /**
   * 纯几何函数：两点间三维抛物线弧面平滑插值
   */
  public static interpolateArcPoint(
    p1: Vector3D,
    p2: Vector3D,
    t: number,
    arcHeight: number = 12
  ): Vector3D {
    // 线性插值
    const lx = p1.x + (p2.x - p1.x) * t;
    const ly = p1.y + (p2.y - p1.y) * t;
    const lz = p1.z + (p2.z - p1.z) * t;

    // 沿 Y 轴的二次抛物线拱起 h = 4 * arcHeight * t * (1 - t)
    const arch = 4 * arcHeight * t * (1 - t);

    return {
      x: lx,
      y: ly + arch,
      z: lz,
    };
  }

  /**
   * 根据边当前状态（活动路径、饱和溢流、正常流）解析粒子发射色彩
   */
  public static resolveParticleColor(edge: FlowParticleEdge): string {
    if (edge.isActivePath) {
      return '#f59e0b'; // 耀眼金黄（当前增广多路阻塞流）
    }
    const isSaturated = edge.isSaturated || (edge.flow !== undefined && edge.cap !== undefined && edge.cap > 0 && edge.flow === edge.cap);
    if (isSaturated) {
      return '#ef4444'; // 警戒红（管道饱和溢流）
    }
    return '#38bdf8'; // 清澈霓虹蓝（正常流淌水体）
  }

  /**
   * 驱动时钟推进：更新所有粒子的参数 t 和三维世界坐标
   */
  public step(deltaSeconds: number): void {
    if (this.particles.length === 0) return;

    const edgeMap = new Map<string, FlowParticleEdge>();
    this.edges.forEach((e) => edgeMap.set(e.id, e));

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const edge = edgeMap.get(p.edgeId);
      if (!edge) continue;

      // 推进进度
      p.t = (p.t + p.speed * deltaSeconds) % 1.0;
      if (p.t < 0) p.t += 1.0;

      const arcH = edge.arcHeight ?? this.defaultArcHeight;
      p.position = ThreeGraphParticleFlow.interpolateArcPoint(edge.from, edge.to, p.t, arcH);
    }
  }

  /**
   * 获取当前所有活跃粒子的快照
   */
  public getParticles(): Particle3D[] {
    return this.particles;
  }

  /**
   * 内部重构粒子群
   */
  private rebuildParticles(): void {
    this.particles = [];

    this.edges.forEach((edge) => {
      // 仅当边有实际流量或者处于增广活动路径时发射水流粒子
      const hasFlow = edge.flow !== undefined && edge.flow > 0;
      const isCandidate = edge.isActivePath || hasFlow;
      if (!isCandidate) return;

      const color = ThreeGraphParticleFlow.resolveParticleColor(edge);
      const flowRatio = edge.cap && edge.cap > 0 ? (edge.flow || 1) / edge.cap : 0.5;
      const speed = this.baseSpeed * (0.8 + flowRatio * 0.6);
      const arcH = edge.arcHeight ?? this.defaultArcHeight;

      for (let i = 0; i < this.particlesPerEdge; i++) {
        // 均匀错开相位
        const t = (i / this.particlesPerEdge + Math.random() * 0.1) % 1.0;
        const pos = ThreeGraphParticleFlow.interpolateArcPoint(edge.from, edge.to, t, arcH);

        this.particles.push({
          id: `${edge.id}_part_${i}`,
          edgeId: edge.id,
          t,
          speed,
          color,
          size: edge.isActivePath ? 2.8 : 2.0,
          position: pos,
        });
      }
    });
  }
}
