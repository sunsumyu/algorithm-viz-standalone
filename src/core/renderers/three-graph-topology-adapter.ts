/**
 * 3D 空间图论拓扑与网络流粒子沙盘表现器 (ThreeGraphTopologyAdapter)
 * 遵循深度模块与适配器模式 (Adapter Pattern)：
 * 实现 IVisualRenderer 标准接口，无缝接管图论算法的 3D 空间交互沙盘。
 * 核心特性：
 * 1. 3D 悬浮节点球体与霓虹光晕（支持当前探测、已访问、队列中、增广路径等状态）
 * 2. 空间流光能量管道与粒子流转引擎（流量越大粒子越快，活动路径金黄高亮，饱和溢流警戒红）
 * 3. 分层立体底盘 (Layered Plazas) 沿 Z 轴展示 BFS/拓扑分层网格
 * 4. OrbitControls 360° 全视角旋转与平滑运镜
 * 5. 零内存泄漏生命周期管理 (Zero Memory Leak)
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { IVisualRenderer } from './visual-renderer';
import {
  ThreeGraphLayoutEngine,
  type Graph3DNode,
  type Graph3DEdge,
  type Vector3D,
} from './adapters/three-graph-layout-engine';
import {
  ThreeGraphParticleFlow,
  type FlowParticleEdge,
} from './adapters/three-graph-particle-flow';

export interface GraphTopologyNodeItem {
  id: string | number;
  label?: string;
  level?: number;
  layer?: number;
  status?: 'current' | 'visited' | 'queued' | 'active' | 'default';
  color?: string;
  metrics?: string;
  x?: number;
  y?: number;
}

export interface GraphTopologyEdgeItem {
  from: string | number;
  to: string | number;
  weight?: number | string;
  flow?: number;
  cap?: number;
  isActivePath?: boolean;
  isSaturated?: boolean;
  color?: string;
}

export interface GraphTopologyStepData {
  nodes: GraphTopologyNodeItem[];
  edges: GraphTopologyEdgeItem[];
  layoutMode?: 'layered' | 'force' | 'projection';
  activePath?: Array<string | number>;
  focusedNodeId?: string | number;
}

export class ThreeGraphTopologyAdapter implements IVisualRenderer {
  public readonly id = 'three-graph-topology-adapter';

  private container: HTMLElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  private animFrameId: number | null = null;
  private lastTime = 0;

  // 场景节点组
  private rootGroup: THREE.Group | null = null;
  private nodesGroup: THREE.Group | null = null;
  private edgesGroup: THREE.Group | null = null;
  private plazasGroup: THREE.Group | null = null;
  private particlesMesh: THREE.InstancedMesh | null = null;

  // 粒子与计算引擎
  private particleEngine = new ThreeGraphParticleFlow({
    particlesPerEdge: 4,
    baseSpeed: 0.45,
    defaultArcHeight: 8,
  });

  // 当前数据快照
  private currentState: GraphTopologyStepData | null = null;
  private currentLayoutMode: 'layered' | 'force' | 'projection' = 'layered';
  private nodePositions = new Map<string | number, Vector3D>();

  /**
   * 挂载 3D 画布到 DOM 容器
   */
  public mount(container: HTMLElement): void {
    if (this.container === container && this.renderer) return;
    this.dispose();

    this.container = container;
    const width = container.clientWidth || 640;
    const height = container.clientHeight || 420;

    let isWebGLSupported = true;
    try {
      if (typeof document === 'undefined' || typeof window === 'undefined') {
        isWebGLSupported = false;
      }
    } catch {
      isWebGLSupported = false;
    }

    if (!isWebGLSupported) return;

    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

      this.scene = new THREE.Scene();

      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 2000);
      this.camera.position.set(0, 160, 240);

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.15; // 允许稍微仰视

      // 光照系统 (环境光 + 主定向光源 + 霓虹补光)
      const ambient = new THREE.AmbientLight(0xffffff, 0.8);
      this.scene.add(ambient);

      const dirLight = new THREE.DirectionalLight(0xe0e7ff, 1.2);
      dirLight.position.set(50, 100, 80);
      this.scene.add(dirLight);

      const blueLight = new THREE.PointLight(0x38bdf8, 1.5, 300);
      blueLight.position.set(-60, 40, -50);
      this.scene.add(blueLight);

      // 分组层次
      this.rootGroup = new THREE.Group();
      this.plazasGroup = new THREE.Group();
      this.edgesGroup = new THREE.Group();
      this.nodesGroup = new THREE.Group();

      this.rootGroup.add(this.plazasGroup);
      this.rootGroup.add(this.edgesGroup);
      this.rootGroup.add(this.nodesGroup);
      this.scene.add(this.rootGroup);

      if (typeof container.appendChild === 'function') {
        container.appendChild(this.renderer.domElement);
      }

      this.startAnimationLoop();
    } catch {
      // 容错环境（如无完整 WebGL 上下文）
      this.renderer = null;
    }
  }

  /**
   * 渲染/同步图论单步状态
   */
  public render(data: GraphTopologyStepData): void {
    this.currentState = data;
    if (data.layoutMode) {
      this.currentLayoutMode = data.layoutMode;
    }

    // 1. 空间布局计算
    const graphNodes: Graph3DNode[] = data.nodes.map((n) => ({
      id: n.id,
      label: n.label,
      level: n.level,
      layer: n.layer,
      x: n.x,
      y: n.y,
    }));

    const graphEdges: Graph3DEdge[] = data.edges.map((e) => ({
      from: e.from,
      to: e.to,
      weight: e.weight,
      flow: e.flow,
      cap: e.cap,
    }));

    let layoutResult;
    if (this.currentLayoutMode === 'force') {
      layoutResult = ThreeGraphLayoutEngine.computeForceLayout(graphNodes, graphEdges);
    } else if (this.currentLayoutMode === 'projection') {
      layoutResult = ThreeGraphLayoutEngine.computeProjectionLayout(graphNodes, graphEdges);
    } else {
      layoutResult = ThreeGraphLayoutEngine.computeLayeredLayout(graphNodes, graphEdges, {
        layerSpacing: 65,
        radiusScale: 45,
      });
    }

    this.nodePositions = layoutResult.nodes;

    // 2. 同步粒子系统边集
    const flowEdges: FlowParticleEdge[] = data.edges.map((e) => {
      const p1 = this.nodePositions.get(e.from) || { x: 0, y: 0, z: 0 };
      const p2 = this.nodePositions.get(e.to) || { x: 0, y: 0, z: 0 };
      const isActive =
        e.isActivePath ||
        (data.activePath &&
          data.activePath.includes(e.from) &&
          data.activePath.includes(e.to) &&
          data.activePath.indexOf(e.to) === data.activePath.indexOf(e.from) + 1);

      return {
        id: `${e.from}->${e.to}`,
        from: p1,
        to: p2,
        flow: e.flow,
        cap: e.cap,
        weight: e.weight,
        isActivePath: Boolean(isActive),
        isSaturated: e.isSaturated,
        arcHeight: 8,
      };
    });

    this.particleEngine.syncEdges(flowEdges);

    // 3. 构建 Three.js 网格实体 (仅在有效 WebGL 场景下)
    if (this.scene && this.rootGroup) {
      this.rebuildThreeVisuals(data, layoutResult.layers);
    }
  }

  /**
   * 切换布局模式
   */
  public setLayoutMode(mode: 'layered' | 'force' | 'projection'): void {
    this.currentLayoutMode = mode;
    if (this.currentState) {
      this.currentState.layoutMode = mode;
      this.render(this.currentState);
    }
  }

  public getCurrentLayoutMode(): 'layered' | 'force' | 'projection' {
    return this.currentLayoutMode;
  }

  public getCurrentState(): GraphTopologyStepData | null {
    return this.currentState;
  }

  /**
   * 统一视觉适配器契约更新接口 (IVisualRenderer)
   * 具备通用深模块自适应能力：自动自反射推导图拓扑节点集合与边状态，
   * 兼容 Dinic、费用流、上下界网络流、二分图匹配与通用图算法
   */
  public updateStep(step: any): void {
    if (!step) return;

    if (step.nodes && step.edges) {
      this.render(step as GraphTopologyStepData);
      return;
    }

    const rawEdges: any[] = step.flowEdges || step.edges || [];
    if (rawEdges.length > 0 || step.levels || step.activePath) {
      const nodeIds = new Set<string | number>();

      if (step.levels && typeof step.levels === 'object') {
        Object.keys(step.levels).forEach((k) => nodeIds.add(k));
      }
      if (Array.isArray(rawEdges)) {
        rawEdges.forEach((e: any) => {
          const from = e.u !== undefined ? e.u : e.from;
          const to = e.v !== undefined ? e.v : e.to;
          if (from !== undefined) nodeIds.add(from);
          if (to !== undefined) nodeIds.add(to);
        });
      }
      if (Array.isArray(step.activePath)) {
        step.activePath.forEach((id: any) => nodeIds.add(id));
      }
      if (nodeIds.size === 0) {
        ['S', 'A', 'B', 'T'].forEach((k) => nodeIds.add(k));
      }

      const activePathNodes = new Set(Array.isArray(step.activePath) ? step.activePath.map(String) : []);

      const nodes: GraphTopologyNodeItem[] = Array.from(nodeIds).map((id) => {
        const idStr = String(id);
        let status: 'default' | 'active' | 'visited' | 'queued' | 'current' = 'default';
        if (activePathNodes.has(idStr)) {
          status = 'active';
        } else if (step.currentNode !== undefined && String(step.currentNode) === idStr) {
          status = 'current';
        } else if (step.visitedNodes && (step.visitedNodes.includes(id) || step.visitedNodes.includes(idStr))) {
          status = 'visited';
        }

        const level =
          step.levels && step.levels[id] !== undefined
            ? Number(step.levels[id])
            : step.levels && step.levels[idStr] !== undefined
              ? Number(step.levels[idStr])
              : 0;

        return {
          id: idStr,
          label: String(id),
          level,
          status,
        };
      });

      const edges = rawEdges.map((e: any) => {
        const from = String(e.u !== undefined ? e.u : e.from);
        const to = String(e.v !== undefined ? e.v : e.to);
        const flow = typeof e.flow === 'number' ? e.flow : undefined;
        const cap = typeof e.cap === 'number' ? e.cap : typeof e.capacity === 'number' ? e.capacity : undefined;
        const isSaturated = cap !== undefined && flow !== undefined && flow >= cap && cap > 0;

        let isActivePath = false;
        if (Array.isArray(step.activePath) && step.activePath.length >= 2) {
          for (let i = 0; i < step.activePath.length - 1; i++) {
            if (String(step.activePath[i]) === from && String(step.activePath[i + 1]) === to) {
              isActivePath = true;
              break;
            }
          }
        }

        return {
          from,
          to,
          flow,
          cap,
          cost: e.cost,
          isActivePath,
          isSaturated,
        };
      });

      this.render({
        nodes,
        edges,
        activePath: step.activePath ? step.activePath.map(String) : undefined,
        layoutMode: step.layoutMode || this.currentLayoutMode || 'layered',
      });
    }
  }

  /**
   * 彻底销毁并释放资源 (IVisualRenderer)
   */
  public dispose(): void {
    this.cleanUpResources();
  }

  public destroy(): void {
    this.dispose();
  }

  private cleanUpResources(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }

    if (this.renderer) {
      if (this.renderer.domElement && this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
      this.renderer.dispose();
      this.renderer = null;
    }

    this.clearGroup(this.plazasGroup);
    this.clearGroup(this.edgesGroup);
    this.clearGroup(this.nodesGroup);
    this.clearGroup(this.rootGroup);

    this.particlesMesh = null;
    this.scene = null;
    this.camera = null;
    this.container = null;
    this.currentState = null;
    this.nodePositions.clear();
  }

  /**
   * 递归清空组与释放几何体材质
   */
  private clearGroup(group: THREE.Group | null): void {
    if (!group) return;
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
      if ((obj as any).geometry) {
        (obj as any).geometry.dispose();
      }
      if ((obj as any).material) {
        if (Array.isArray((obj as any).material)) {
          (obj as any).material.forEach((m: any) => m.dispose());
        } else {
          (obj as any).material.dispose();
        }
      }
    }
  }

  /**
   * 重构 3D 几何实体
   */
  private rebuildThreeVisuals(
    data: GraphTopologyStepData,
    layers: Map<number, Array<string | number>>
  ): void {
    if (!this.plazasGroup || !this.edgesGroup || !this.nodesGroup) return;

    this.clearGroup(this.plazasGroup);
    this.clearGroup(this.edgesGroup);
    this.clearGroup(this.nodesGroup);

    // 1. 分层立交底盘 (Layer Plazas)
    if (this.currentLayoutMode === 'layered' && layers.size > 1) {
      layers.forEach((_nodeIds, lvl) => {
        const z = lvl * 65;
        const plazaGeo = new THREE.PlaneGeometry(120, 120, 4, 4);
        const plazaMat = new THREE.MeshBasicMaterial({
          color: 0x1e293b,
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide,
          wireframe: true,
        });
        const plaza = new THREE.Mesh(plazaGeo, plazaMat);
        plaza.position.set(0, 0, z);
        this.plazasGroup!.add(plaza);
      });
    }

    // 2. 节点球体与文字标头
    const sphereGeo = new THREE.SphereGeometry(6, 24, 24);

    data.nodes.forEach((node) => {
      const pos = this.nodePositions.get(node.id) || { x: 0, y: 0, z: 0 };
      const isOnPath = data.activePath && data.activePath.includes(node.id);

      let hexColor = 0x64748b;
      let emissiveColor = 0x0f172a;

      if (isOnPath) {
        hexColor = 0xf59e0b;
        emissiveColor = 0xb45309;
      } else if (node.status === 'current') {
        hexColor = 0xef4444;
        emissiveColor = 0x991b1b;
      } else if (node.status === 'visited') {
        hexColor = 0x38bdf8;
        emissiveColor = 0x0369a1;
      } else if (node.status === 'queued') {
        hexColor = 0xa855f7;
        emissiveColor = 0x6b21a8;
      }

      const mat = new THREE.MeshStandardMaterial({
        color: hexColor,
        emissive: emissiveColor,
        roughness: 0.3,
        metalness: 0.6,
      });

      const sphere = new THREE.Mesh(sphereGeo, mat);
      sphere.position.set(pos.x, pos.y, pos.z);
      this.nodesGroup!.add(sphere);

      // 文字 Sprite
      const labelText = node.label || String(node.id);
      const sprite = this.createTextSprite(labelText, isOnPath ? '#fbbf24' : '#ffffff');
      sprite.position.set(pos.x, pos.y + 11, pos.z);
      this.nodesGroup!.add(sprite);
    });

    // 3. 边管道与箭头
    data.edges.forEach((edge) => {
      const p1 = this.nodePositions.get(edge.from);
      const p2 = this.nodePositions.get(edge.to);
      if (!p1 || !p2) return;

      const v1 = new THREE.Vector3(p1.x, p1.y, p1.z);
      const v2 = new THREE.Vector3(p2.x, p2.y, p2.z);
      const dist = v1.distanceTo(v2);
      if (dist < 0.1) return;

      const isOnPath =
        edge.isActivePath ||
        (data.activePath &&
          data.activePath.includes(edge.from) &&
          data.activePath.includes(edge.to) &&
          data.activePath.indexOf(edge.to) === data.activePath.indexOf(edge.from) + 1);
      const isSaturated = edge.isSaturated || (edge.flow && edge.cap && edge.flow === edge.cap);

      const colorHex = isOnPath ? 0xf59e0b : isSaturated ? 0xef4444 : 0x334155;
      const radius = isOnPath ? 1.6 : 0.8;

      // 构造圆柱管道
      const cylGeo = new THREE.CylinderGeometry(radius, radius, dist, 12);
      const cylMat = new THREE.MeshStandardMaterial({
        color: colorHex,
        emissive: isOnPath ? 0x78350f : 0x000000,
        roughness: 0.4,
      });

      const cylinder = new THREE.Mesh(cylGeo, cylMat);
      cylinder.position.copy(v1).add(v2).multiplyScalar(0.5);
      cylinder.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        v2.clone().sub(v1).normalize()
      );
      this.edgesGroup!.add(cylinder);

      // 箭头锥体
      const coneGeo = new THREE.ConeGeometry(2.8, 6, 12);
      const coneMat = new THREE.MeshBasicMaterial({ color: colorHex });
      const cone = new THREE.Mesh(coneGeo, coneMat);
      const dir = v2.clone().sub(v1).normalize();
      cone.position.copy(v2).sub(dir.clone().multiplyScalar(7));
      cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir);
      this.edgesGroup!.add(cone);
    });

    // 4. 初始化粒子实例网格
    this.rebuildParticlesInstancedMesh();
  }

  /**
   * 重构 InstancedMesh 粒子群
   */
  private rebuildParticlesInstancedMesh(): void {
    if (!this.edgesGroup) return;

    if (this.particlesMesh) {
      this.edgesGroup.remove(this.particlesMesh);
      this.particlesMesh.geometry.dispose();
      (this.particlesMesh.material as THREE.Material).dispose();
      this.particlesMesh = null;
    }

    const particles = this.particleEngine.getParticles();
    if (particles.length === 0) return;

    const partGeo = new THREE.SphereGeometry(1.5, 8, 8);
    const partMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    this.particlesMesh = new THREE.InstancedMesh(partGeo, partMat, particles.length);
    this.particlesMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    this.edgesGroup.add(this.particlesMesh);
  }

  /**
   * 创建文字公告板 Sprite
   */
  private createTextSprite(text: string, color: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 128;
    canvas.height = 48;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.roundRect?.(4, 4, 120, 40, 8);
      ctx.fill();
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = color;
      ctx.font = 'bold 20px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, 64, 24);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, depthTest: false });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(16, 6, 1);
    return sprite;
  }

  /**
   * 动画主循环：更新时钟、粒子位置与轨道控制器
   */
  private startAnimationLoop(): void {
    this.lastTime = performance.now();

    const animate = (now: number) => {
      this.animFrameId = requestAnimationFrame(animate);

      const deltaSeconds = Math.min((now - this.lastTime) / 1000, 0.1);
      this.lastTime = now;

      // 步进粒子流动
      this.particleEngine.step(deltaSeconds);

      // 更新 InstancedMesh
      if (this.particlesMesh) {
        const particles = this.particleEngine.getParticles();
        const dummy = new THREE.Object3D();
        const colorHelper = new THREE.Color();

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];
          dummy.position.set(p.position.x, p.position.y, p.position.z);
          dummy.scale.setScalar(p.size / 2);
          dummy.updateMatrix();
          this.particlesMesh.setMatrixAt(i, dummy.matrix);

          colorHelper.set(p.color);
          this.particlesMesh.setColorAt(i, colorHelper);
        }
        this.particlesMesh.instanceMatrix.needsUpdate = true;
        if (this.particlesMesh.instanceColor) {
          this.particlesMesh.instanceColor.needsUpdate = true;
        }
      }

      if (this.controls) {
        this.controls.update();
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };

    this.animFrameId = requestAnimationFrame(animate);
  }
}
