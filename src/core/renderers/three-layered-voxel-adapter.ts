import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { IVisualRenderer } from './visual-renderer';
import { LayeredVoxelStepAdapter, type LayeredVoxelStepData, type LayeredVoxelCell, type InterLayerDependency } from './layered-voxel-step-adapter';

export interface LayeredVoxelAdapterOptions {
  layers: number;
  rows: number;
  cols: number;
  layerGapY?: number;
  cellSize?: number;
}

interface VoxelMeshNode {
  mesh: THREE.Mesh;
  topCanvas?: HTMLCanvasElement;
  topCtx?: CanvasRenderingContext2D | null;
  topTexture?: THREE.CanvasTexture;
  materials: THREE.Material[];
  k: number;
  r: number;
  c: number;
  targetY: number;
  currentY: number;
  baseY: number;
}

interface EnergyPulse {
  mesh: THREE.Mesh;
  curve: THREE.CatmullRomCurve3;
  progress: number;
  speed: number;
}

export class ThreeLayeredVoxelAdapter implements IVisualRenderer {
  public readonly id = 'three-layered-voxel-adapter';
  private static instance: ThreeLayeredVoxelAdapter | null = null;

  private container: HTMLElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  private animFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // 场景节点结构
  private rootGroup: THREE.Group | null = null;
  private layerGroups: THREE.Group[] = [];
  private voxelMatrix: VoxelMeshNode[][][] = []; // [k][r][c]
  private interLayerTubes: THREE.Mesh[] = [];
  private energyPulses: EnergyPulse[] = [];

  // 几何尺寸配置
  private layers = 3;
  private rows = 2;
  private cols = 2;
  private layerGapY = 3.6;
  private cellSize = 1.4;

  // 运镜与状态
  private currentLayerIndex = 0;
  private cameraTarget = new THREE.Vector3();
  private cameraDesiredTarget = new THREE.Vector3();
  private cameraDesiredPosition = new THREE.Vector3(12, 14, 18);

  public static getInstance(): ThreeLayeredVoxelAdapter {
    if (!ThreeLayeredVoxelAdapter.instance) {
      ThreeLayeredVoxelAdapter.instance = new ThreeLayeredVoxelAdapter();
    }
    return ThreeLayeredVoxelAdapter.instance;
  }

  public getCurrentLayerIndex(): number {
    return this.currentLayerIndex;
  }

  /**
   * 挂载 WebGL 画布到 DOM 容器
   */
  public mount(container: HTMLElement): void {
    if (this.container === container && this.renderer) return;
    this.dispose();

    this.container = container;
    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // 检查 WebGL 是否在当前环境可用 (Node.js / Vitest 环境中安全容错)
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
        powerPreference: 'high-performance'
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      this.scene = new THREE.Scene();

      // 透视摄像机与轨道控制器
      this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
      this.camera.position.copy(this.cameraDesiredPosition);

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2 + 0.1; // 允许稍微俯视观察

      // 灯光设置
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
      this.scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0xe0e7ff, 1.2);
      dirLight.position.set(15, 25, 20);
      dirLight.castShadow = true;
      this.scene.add(dirLight);

      const bluePointLight = new THREE.PointLight(0x38bdf8, 1.5, 50);
      bluePointLight.position.set(-10, 10, -10);
      this.scene.add(bluePointLight);

      // 主场景组
      this.rootGroup = new THREE.Group();
      this.scene.add(this.rootGroup);

      if (this.container.appendChild) {
        this.container.appendChild(this.renderer.domElement);
      }

      // 视口监听
      if (typeof ResizeObserver !== 'undefined') {
        this.resizeObserver = new ResizeObserver(entries => {
          for (const entry of entries) {
            const cr = entry.contentRect;
            if (cr.width > 0 && cr.height > 0) {
              this.onResize(cr.width, cr.height);
            }
          }
        });
        this.resizeObserver.observe(this.container);
      }

      // 启动渲染循环
      this.startAnimationLoop();
    } catch {
      // 容错处理环境缺失 WebGL
      this.renderer = null;
    }
  }

  private onResize(width: number, height: number): void {
    if (!this.renderer || !this.camera) return;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  private startAnimationLoop(): void {
    const tick = () => {
      if (!this.renderer || !this.scene || !this.camera) return;

      // 平滑插值摄像机目标
      if (this.controls) {
        this.cameraTarget.lerp(this.cameraDesiredTarget, 0.08);
        this.controls.target.copy(this.cameraTarget);
        this.controls.update();
      }

      // 动态更新体素悬浮升降
      for (const layer of this.voxelMatrix) {
        for (const row of layer) {
          for (const cell of row) {
            if (Math.abs(cell.currentY - cell.targetY) > 0.01) {
              cell.currentY += (cell.targetY - cell.currentY) * 0.15;
              cell.mesh.position.y = cell.currentY;
            }
          }
        }
      }

      // 动态脉冲粒子沿着贝塞尔管道流动
      for (const pulse of this.energyPulses) {
        pulse.progress = (pulse.progress + pulse.speed) % 1.0;
        const point = pulse.curve.getPointAt(pulse.progress);
        pulse.mesh.position.copy(point);
      }

      this.renderer.render(this.scene, this.camera);
      this.animFrameId = requestAnimationFrame(tick);
    };

    this.animFrameId = requestAnimationFrame(tick);
  }

  /**
   * 渲染多层 3D 体素切片沙盘
   */
  public render(
    stepData: LayeredVoxelStepData,
    options?: LayeredVoxelAdapterOptions
  ): void {
    if (options) {
      if (options.layers !== this.layers || options.rows !== this.rows || options.cols !== this.cols) {
        this.layers = options.layers;
        this.rows = options.rows;
        this.cols = options.cols;
        this.layerGapY = options.layerGapY ?? 3.6;
        this.cellSize = options.cellSize ?? 1.4;
        this.rebuildGeometryGrid();
      }
    }

    this.currentLayerIndex = stepData.currentK;

    // 若场景不可用（如测试或无 WebGL），仅维护状态
    if (!this.scene || !this.rootGroup || this.voxelMatrix.length === 0) return;

    // 1. 同步各层体素颜色与贴图
    const cube = stepData.cube;
    for (let k = 0; k < Math.min(this.layers, cube.length); k++) {
      for (let r = 0; r < Math.min(this.rows, cube[k].length); r++) {
        for (let c = 0; c < Math.min(this.cols, cube[k][r].length); c++) {
          const cellData = cube[k][r][c];
          const node = this.voxelMatrix[k]?.[r]?.[c];
          if (node) {
            this.updateVoxelNode(node, cellData, k === this.currentLayerIndex);
          }
        }
      }
    }

    // 2. 渲染跨层能量管道与光束 (Inter-layer tubes)
    this.renderInterLayerBeams(stepData.interLayerDependencies || []);
  }

  /**
   * 实现 IVisualRenderer 契约更新步骤
   */
  public updateStep(step: any, context?: any): void {
    const kLayers = Math.max(3, step.maxMove ? step.maxMove + 1 : 4);
    const m = context?.m || (step.grid ? step.grid.length : this.rows);
    const n = context?.n || (step.grid && step.grid[0] ? step.grid[0].length : this.cols);
    const stepData = LayeredVoxelStepAdapter.adapt(step, {
      layers: kLayers,
      rows: m,
      cols: n
    });
    this.render(stepData, {
      layers: kLayers,
      rows: m,
      cols: n
    });
  }

  /**
   * 重构多层晶圆几何网格
   */
  private rebuildGeometryGrid(): void {
    if (!this.rootGroup) return;

    // 清空现有组与网格
    while (this.rootGroup.children.length > 0) {
      const child = this.rootGroup.children[0];
      this.rootGroup.remove(child);
      if ((child as any).geometry) (child as any).geometry.dispose();
      if ((child as any).material) {
        if (Array.isArray((child as any).material)) {
          (child as any).material.forEach((m: any) => m.dispose());
        } else {
          (child as any).material.dispose();
        }
      }
    }

    this.layerGroups = [];
    this.voxelMatrix = [];
    this.interLayerTubes = [];
    this.energyPulses = [];

    const cellGeom = new THREE.BoxGeometry(this.cellSize, this.cellSize * 0.45, this.cellSize);
    const offsetX = -((this.cols - 1) * (this.cellSize + 0.2)) / 2;
    const offsetZ = -((this.rows - 1) * (this.cellSize + 0.2)) / 2;

    for (let k = 0; k < this.layers; k++) {
      const layerGroup = new THREE.Group();
      const baseY = k * this.layerGapY;
      layerGroup.position.y = baseY;

      // 1. 每层底座半透明网格基座 (Grid Base Plane)
      const planeWidth = this.cols * (this.cellSize + 0.2) + 0.8;
      const planeDepth = this.rows * (this.cellSize + 0.2) + 0.8;
      const basePlane = new THREE.Mesh(
        new THREE.PlaneGeometry(planeWidth, planeDepth),
        new THREE.MeshBasicMaterial({
          color: 0x1e293b,
          transparent: true,
          opacity: 0.35,
          side: THREE.DoubleSide
        })
      );
      basePlane.rotation.x = -Math.PI / 2;
      basePlane.position.y = -0.15;
      layerGroup.add(basePlane);

      // 边框轮廓线
      const edges = new THREE.EdgesGeometry(new THREE.PlaneGeometry(planeWidth, planeDepth));
      const line = new THREE.LineSegments(
        edges,
        new THREE.LineBasicMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.5 })
      );
      line.rotation.x = -Math.PI / 2;
      line.position.y = -0.14;
      layerGroup.add(line);

      // 2. 悬浮霓虹层标牌 (Layer Badge)
      const badge = this.createLayerBadge(k);
      badge.position.set(offsetX - 1.2, 0.4, 0);
      layerGroup.add(badge);

      // 3. 构建当前层的体素阵列
      const layerNodes: VoxelMeshNode[][] = [];
      for (let r = 0; r < this.rows; r++) {
        const rowNodes: VoxelMeshNode[] = [];
        for (let c = 0; c < this.cols; c++) {
          const posX = offsetX + c * (this.cellSize + 0.2);
          const posZ = offsetZ + r * (this.cellSize + 0.2);

          // 制作顶部数值贴图 Canvas
          let topCanvas: HTMLCanvasElement | undefined;
          let topCtx: CanvasRenderingContext2D | null = null;
          let topTexture: THREE.CanvasTexture | undefined;

          if (typeof document !== 'undefined') {
            topCanvas = document.createElement('canvas');
            topCanvas.width = 128;
            topCanvas.height = 128;
            topCtx = topCanvas.getContext('2d');
            topTexture = new THREE.CanvasTexture(topCanvas);
          }

          // 材质集合: [right, left, top, bottom, front, back]
          const sideMat = new THREE.MeshStandardMaterial({
            color: 0x0f172a,
            roughness: 0.2,
            metalness: 0.1,
            transparent: true,
            opacity: 0.8
          });

          const topMat = topTexture
            ? new THREE.MeshStandardMaterial({
                map: topTexture,
                roughness: 0.3,
                transparent: true,
                opacity: 0.95
              })
            : sideMat;

          const materials = [sideMat, sideMat, topMat, sideMat, sideMat, sideMat];
          const mesh = new THREE.Mesh(cellGeom, materials);
          mesh.position.set(posX, 0, posZ);
          mesh.castShadow = true;
          mesh.receiveShadow = true;
          layerGroup.add(mesh);

          rowNodes.push({
            mesh,
            topCanvas,
            topCtx,
            topTexture,
            materials,
            k,
            r,
            c,
            baseY,
            currentY: 0,
            targetY: 0
          });
        }
        layerNodes.push(rowNodes);
      }

      this.voxelMatrix.push(layerNodes);
      this.layerGroups.push(layerGroup);
      this.rootGroup.add(layerGroup);
    }

    // 更新相机聚焦中心
    this.focusAll();
  }

  /**
   * 创建发光霓虹层标牌
   */
  private createLayerBadge(k: number): THREE.Sprite {
    if (typeof document === 'undefined') {
      return new THREE.Sprite();
    }
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 80;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.roundRect?.(4, 4, 248, 72, 12);
      ctx.fill();
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = '#38bdf8';
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`Layer ${k}: k=${k}`, 128, 40);
    }

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMat = new THREE.SpriteMaterial({ map: texture, transparent: true });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.4, 0.75, 1);
    return sprite;
  }

  /**
   * 状态变化时更新体素外观与数值
   */
  private updateVoxelNode(node: VoxelMeshNode, cell: LayeredVoxelCell, isCurrentLayer: boolean): void {
    const { topCanvas, topCtx, topTexture, materials } = node;
    const sideMat = materials[0] as THREE.MeshStandardMaterial;
    const topMat = materials[2] as THREE.MeshStandardMaterial;

    // 1. 绘制顶部文字贴图
    if (topCanvas && topCtx && topTexture) {
      topCtx.clearRect(0, 0, 128, 128);

      // 背景微调
      let bg = '#1e293b';
      let textColor = '#cbd5e1';

      if (cell.status === 'active') {
        bg = '#0284c7';
        textColor = '#ffffff';
      } else if (cell.status === 'dependency') {
        bg = '#d97706';
        textColor = '#ffffff';
      } else if (cell.status === 'computed') {
        bg = '#0f172a';
        textColor = '#38bdf8';
      }

      topCtx.fillStyle = bg;
      topCtx.fillRect(0, 0, 128, 128);

      topCtx.fillStyle = textColor;
      topCtx.font = 'bold 42px monospace';
      topCtx.textAlign = 'center';
      topCtx.textBaseline = 'middle';
      topCtx.fillText(String(cell.value), 64, 64);
      topTexture.needsUpdate = true;
    }

    // 2. 根据体素状态分配透明度与高亮浮动
    if (cell.status === 'active') {
      node.targetY = 0.5; // 升起悬浮
      sideMat.color.setHex(0x0284c7);
      sideMat.emissive?.setHex?.(0x0369a1);
      sideMat.opacity = 1.0;
    } else if (cell.status === 'dependency') {
      node.targetY = 0.2;
      sideMat.color.setHex(0xf59e0b);
      sideMat.emissive?.setHex?.(0xb45309);
      sideMat.opacity = 0.95;
    } else if (cell.status === 'computed') {
      node.targetY = 0;
      sideMat.color.setHex(0x1e293b);
      sideMat.emissive?.setHex?.(0x000000);
      sideMat.opacity = isCurrentLayer ? 0.85 : 0.45; // 历史层半透明冰晶
    } else {
      node.targetY = 0;
      sideMat.color.setHex(0x0f172a);
      sideMat.emissive?.setHex?.(0x000000);
      sideMat.opacity = 0.2;
    }
  }

  /**
   * 渲染跨层能量管道与光流脉冲
   */
  private renderInterLayerBeams(deps: InterLayerDependency[]): void {
    if (!this.rootGroup) return;

    // 清空现有管道与粒子
    for (const tube of this.interLayerTubes) {
      this.rootGroup.remove(tube);
      tube.geometry.dispose();
      (tube.material as THREE.Material).dispose();
    }
    for (const pulse of this.energyPulses) {
      this.rootGroup.remove(pulse.mesh);
      pulse.mesh.geometry.dispose();
      (pulse.mesh.material as THREE.Material).dispose();
    }
    this.interLayerTubes = [];
    this.energyPulses = [];

    const offsetX = -((this.cols - 1) * (this.cellSize + 0.2)) / 2;
    const offsetZ = -((this.rows - 1) * (this.cellSize + 0.2)) / 2;

    const getPos = (k: number, r: number, c: number) => {
      return new THREE.Vector3(
        offsetX + c * (this.cellSize + 0.2),
        k * this.layerGapY + 0.2,
        offsetZ + r * (this.cellSize + 0.2)
      );
    };

    const pulseGeom = new THREE.SphereGeometry(0.18, 12, 12);
    const pulseMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });

    for (const dep of deps) {
      const pStart = getPos(dep.from.k, dep.from.r, dep.from.c);
      const pEnd = getPos(dep.to.k, dep.to.r, dep.to.c);

      // 控制点产生平滑 S 型曲线
      const midY = (pStart.y + pEnd.y) / 2;
      const pMid = new THREE.Vector3(
        (pStart.x + pEnd.x) / 2,
        midY,
        (pStart.z + pEnd.z) / 2 + 0.4
      );

      const curve = new THREE.CatmullRomCurve3([pStart, pMid, pEnd]);
      const tubeGeom = new THREE.TubeGeometry(curve, 24, 0.06, 8, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        transparent: true,
        opacity: 0.65
      });
      const tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
      this.rootGroup.add(tubeMesh);
      this.interLayerTubes.push(tubeMesh);

      // 脉冲能量球
      const pulseMesh = new THREE.Mesh(pulseGeom, pulseMat);
      this.rootGroup.add(pulseMesh);
      this.energyPulses.push({
        mesh: pulseMesh,
        curve,
        progress: 0,
        speed: 0.02 + Math.random() * 0.01
      });
    }
  }

  /**
   * 运镜聚焦到指定层
   */
  public focusLayer(k: number): void {
    const safeK = Math.max(0, Math.min(this.layers - 1, k));
    const targetY = safeK * this.layerGapY;
    this.cameraDesiredTarget.set(0, targetY, 0);
  }

  /**
   * 运镜聚焦到全景总体视图
   */
  public focusAll(): void {
    const totalHeight = (this.layers - 1) * this.layerGapY;
    this.cameraDesiredTarget.set(0, totalHeight / 2, 0);
  }

  /**
   * 彻底销毁释放 WebGL 资源 (Zero-Leak)
   */
  public dispose(): void {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
      this.resizeObserver = null;
    }

    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }

    if (this.rootGroup) {
      while (this.rootGroup.children.length > 0) {
        const child = this.rootGroup.children[0];
        this.rootGroup.remove(child);
      }
      this.rootGroup = null;
    }

    if (this.renderer) {
      if (this.renderer.domElement && this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
      this.renderer.dispose();
      this.renderer = null;
    }

    this.scene = null;
    this.camera = null;
    this.container = null;
    this.layerGroups = [];
    this.voxelMatrix = [];
    this.interLayerTubes = [];
    this.energyPulses = [];
  }
}
