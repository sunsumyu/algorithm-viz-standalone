import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { UniversalStep } from '../universal-stage-engine';
import { GridRenderOptions } from './grid-visual-adapter';
import { ThreeActorStateMachine } from './three-actor-state-machine';

interface VoxelCellMesh {
  mesh: THREE.Mesh;
  topCanvas: HTMLCanvasElement;
  topCtx: CanvasRenderingContext2D;
  topTexture: THREE.CanvasTexture;
  materials: THREE.Material[];
  r: number;
  c: number;
  targetY: number;
  currentY: number;
  status: 'cur' | 'done' | 'top' | 'left' | 'obstacle' | 'trail' | 'empty';
}

import { IVisualRenderer } from './visual-renderer';
import { VoxelActorBuilder } from './voxel-actor-builder';
import { VoxelSceneComposer, type RiverEnvironment } from './voxel-scene-composer';
import { VisualThemeManager } from '../theme/visual-theme-manager';
import { ThreeCameraOrbitController } from './three-camera-orbit-controller';

interface EnergySpark {
  mesh: THREE.Mesh;
  curve: THREE.Curve<THREE.Vector3>;
  progress: number;
  speed: number;
}

export class ThreeGridVisualAdapter implements IVisualRenderer {
  public readonly id = 'three-grid-visual-adapter';
  private static instance: ThreeGridVisualAdapter | null = null;

  private container: HTMLElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private cameraOrbitController: ThreeCameraOrbitController | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  private animFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // 场景节点
  private boardGroup: THREE.Group | null = null;
  private voxelCells: VoxelCellMesh[][] = [];
  private adventurer3D: THREE.Group | null = null;
  private activeGlowRing: THREE.Mesh | null = null;
  private riverMesh: THREE.Mesh | null = null;
  private riverBedMesh: THREE.Mesh | null = null;
  private riverFoamRings: THREE.Mesh[] = [];
  private waterSparkles: THREE.Points | null = null;
  private originalWaterPositions: Float32Array | null = null;
  private transferTubes: THREE.Mesh[] = [];
  private energySparks: EnergySpark[] = [];
  private pointLight: THREE.PointLight | null = null;

  // 动画状态与物理插值
  private m: number = 3;
  private n: number = 4;
  private charCurrentPos: THREE.Vector3 = new THREE.Vector3();
  private charTargetPos: THREE.Vector3 = new THREE.Vector3();
  private charJumpStartPos: THREE.Vector3 = new THREE.Vector3();
  private charBounceApexPos: THREE.Vector3 | null = null;
  private isBounceJump: boolean = false;
  private hasTriggeredMidSplash: boolean = false;
  private charJumpProgress: number = 1.0;
  private charSquash: number = 1.0;
  private charSquashVelocity: number = 0.0;
  private charCurrentHeading: number = 0;
  private charTargetHeading: number = 0;
  private splashTimer: number = 0;
  private splashX: number = 0;
  private splashZ: number = 0;
  private clock: THREE.Clock = new THREE.Clock();

  public static getInstance(): ThreeGridVisualAdapter {
    if (!ThreeGridVisualAdapter.instance) {
      ThreeGridVisualAdapter.instance = new ThreeGridVisualAdapter();
    }
    return ThreeGridVisualAdapter.instance;
  }

  /**
   * 挂载 WebGL 画布到 DOM 容器
   */
  public mount(container: HTMLElement): void {
    if (this.container === container && this.renderer) return;
    this.dispose();

    this.container = container;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;

    // 1. WebGL 物理渲染器 (开启全分辨率抗锯齿、对数深度缓冲与电影级色调映射)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      logarithmicDepthBuffer: true, // 彻底消除近距多重透明平面的 Z-Fighting 深度冲突闪烁
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.25;
    this.renderer.domElement.style.outline = 'none';
    this.renderer.domElement.className = 'w-full h-full block cursor-grab active:cursor-grabbing';

    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    // 2. 场景与透视摄像机 (委托 ThreeCameraOrbitController 深模块)
    this.scene = new THREE.Scene();
    this.cameraOrbitController = new ThreeCameraOrbitController(width, height);
    this.camera = this.cameraOrbitController.getCamera();
    this.controls = this.cameraOrbitController.attachControls(this.renderer.domElement);
    this.resetCameraPosition();

    // 4. 搭建多重电影级灯光
    this.setupStudioLights();

    // 5. 尺寸自适应监听
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);

    // 6. 开启渲染主循环
    this.startAnimationLoop();
  }

  /**
   * 搭建「纪念碑谷」影棚级柔和物理光照
   */
  private setupStudioLights(): void {
    if (!this.scene) return;
    const lights = VoxelSceneComposer.setupStudioLights(this.scene);
    this.pointLight = lights.pointLight;
  }

  /**
   * 重置摄像机至等轴测最佳黄金视角 - 委托 ThreeCameraOrbitController 深模块
   */
  public resetCameraPosition(): void {
    if (this.cameraOrbitController) {
      this.cameraOrbitController.resetCameraPosition(this.m, this.n);
    }
  }

  /**
   * 构建 3D 纪念碑谷风格体素沙盘
   */
  public buildBoard(m: number, n: number, options: GridRenderOptions): void {
    if (!this.scene) return;
    this.m = m;
    this.n = n;

    // 清理已有节点
    if (this.boardGroup) {
      this.scene.remove(this.boardGroup);
      VoxelSceneComposer.disposeHierarchy(this.boardGroup);
      this.boardGroup = null;
    }
    this.voxelCells = [];
    this.clearTransferTubes();

    const isGridProblem = options.isGridProblem ?? (options.modelId ? ['unique-paths', 'unique-paths-ii', 'min-path-sum'].includes(options.modelId) : true);

    this.boardGroup = new THREE.Group();
    const cellSize = 1.0;
    const cellGap = 0.14;
    const blockHeight = 0.42;
    const stride = cellSize + cellGap;

    // 1. 纪念碑谷风格悬浮亚克力晶体底座 (Floating Island Base)
    const baseW = n * stride + 0.45;
    const baseD = m * stride + 0.45;
    const centerX = (n - 1) * stride / 2;
    const centerZ = (m - 1) * stride / 2;
    const { baseMesh, rimMesh } = VoxelSceneComposer.buildIslandBase(baseW, baseD, centerX, centerZ);
    this.boardGroup.add(baseMesh, rimMesh);

    const isStairs = (options.modelId === 'climb-stairs' || options.modelId === 'min-cost' || options.modelId === 'min-cost-climbing-stairs');
    const stepRise = isStairs ? 0.32 : 0;

    // 2. 构建 3D 倒角体素方块阵列 (阶梯式动规算法具有自底向上真实阶梯立体高程)
    for (let r = 0; r < m; r++) {
      this.voxelCells[r] = [];
      for (let c = 0; c < n; c++) {
        // 创建 512×512 超清动态 Canvas 贴图
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d')!;
        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 8;

        // 顶面材质 (高光陶瓷/玉石)
        const topMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.2,
          metalness: 0.04
        });

        // 侧面材质 (柔和白瓷倒角)
        const sideMaterial = new THREE.MeshStandardMaterial({
          color: 0xf8fafc,
          roughness: 0.25,
          metalness: 0.05
        });

        const materials = [
          sideMaterial,
          sideMaterial,
          topMaterial,
          sideMaterial,
          sideMaterial,
          sideMaterial
        ];

        const stairElevation = c * stepRise;
        const actualBlockHeight = blockHeight + stairElevation;
        const geo = new THREE.BoxGeometry(cellSize, actualBlockHeight, cellSize);
        const mesh = new THREE.Mesh(geo, materials);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(c * stride, actualBlockHeight / 2, r * stride);

        this.boardGroup.add(mesh);

        this.voxelCells[r][c] = {
          mesh,
          topCanvas: canvas,
          topCtx: ctx,
          topTexture: texture,
          materials,
          r,
          c,
          targetY: actualBlockHeight / 2,
          currentY: actualBlockHeight / 2,
          status: 'empty'
        };
      }
    }

    // 3. 当前活动格底部发光能量光环 (Rotating Neon Ring)
    const ringGeo = new THREE.RingGeometry(0.55, 0.72, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      depthWrite: false, // 彻底消除与底座顶面的 Z-Fighting 闪烁
      side: THREE.DoubleSide
    });
    this.activeGlowRing = new THREE.Mesh(ringGeo, ringMat);
    this.activeGlowRing.rotation.x = -Math.PI / 2;
    this.activeGlowRing.position.set(0, 0.02, 0);
    this.activeGlowRing.renderOrder = 5;
    this.boardGroup.add(this.activeGlowRing);

    // 4. 3D 四周环绕高质感水晶流动护岛深水河 (Surrounding Island Crystal River)
    const riverMargin = 1.35;
    const riverEnv = VoxelSceneComposer.buildRiverEnvironment(baseW, baseD, centerX, centerZ, riverMargin);
    this.riverBedMesh = riverEnv.riverBedMesh;
    this.riverMesh = riverEnv.riverMesh;
    this.riverFoamRings = [riverEnv.innerFoamMesh];
    this.waterSparkles = riverEnv.waterSparkles;
    this.originalWaterPositions = riverEnv.originalWaterPositions;
    this.boardGroup.add(
      riverEnv.riverBedMesh,
      riverEnv.outerBankMesh,
      riverEnv.riverMesh,
      riverEnv.innerFoamMesh,
      riverEnv.waterSparkles
    );

    // 5. 真正的 3D 萌系体素小人 (Crossy Road / Minecraft Voxel Explorer)
    this.adventurer3D = VoxelActorBuilder.buildAdventurerMesh();
    this.charCurrentPos.set(0, blockHeight / 2 + 0.45, 0);
    this.charTargetPos.set(0, blockHeight / 2 + 0.45, 0);
    this.charJumpStartPos.set(0, blockHeight / 2 + 0.45, 0);
    this.charJumpProgress = 1.0;
    this.adventurer3D.position.copy(this.charCurrentPos);
    this.boardGroup.add(this.adventurer3D);

    this.scene.add(this.boardGroup);
    this.resetCameraPosition();
  }

  /**
   * 绘制「纪念碑谷」高对比度高质感顶面贴图 (512×512，与全局视觉主题调色板完全联动)
   */
  private drawTileTopTexture(
    ctx: CanvasRenderingContext2D,
    r: number,
    c: number,
    val: number | null,
    status: 'cur' | 'done' | 'top' | 'left' | 'obstacle' | 'trail' | 'empty',
    modelId?: string
  ): void {
    ctx.clearRect(0, 0, 512, 512);

    const palette = VisualThemeManager.getInstance().getCurrentVoxelPalette();

    // 1. 柔和马卡龙/电光渐变底色
    let bgGrad = ctx.createLinearGradient(0, 0, 512, 512);
    let borderColor = palette.cellEmptyBorder;
    let coordColor = palette.coordColor;
    let valColor = palette.valColor;

    if (status === 'cur') {
      bgGrad.addColorStop(0, palette.cellCurBg[0]);
      bgGrad.addColorStop(1, palette.cellCurBg[1]);
      borderColor = palette.cellCurBorder;
      coordColor = palette.cellCurText;
      valColor = palette.cellCurText;
    } else if (status === 'top') {
      bgGrad.addColorStop(0, palette.cellTopBg[0]);
      bgGrad.addColorStop(1, palette.cellTopBg[1]);
      borderColor = palette.cellTopBorder;
      coordColor = palette.cellTopText;
      valColor = palette.cellTopText;
    } else if (status === 'left') {
      bgGrad.addColorStop(0, palette.cellLeftBg[0]);
      bgGrad.addColorStop(1, palette.cellLeftBg[1]);
      borderColor = palette.cellLeftBorder;
      coordColor = palette.cellLeftText;
      valColor = palette.cellLeftText;
    } else if (status === 'done') {
      bgGrad.addColorStop(0, palette.cellDoneBg[0]);
      bgGrad.addColorStop(1, palette.cellDoneBg[1]);
      borderColor = palette.cellDoneBorder;
      coordColor = palette.coordColor;
      valColor = palette.valColor;
    } else if (status === 'obstacle') {
      bgGrad.addColorStop(0, palette.cellObstacleBg[0]);
      bgGrad.addColorStop(1, palette.cellObstacleBg[1]);
      borderColor = palette.cellObstacleBorder;
      coordColor = palette.cellObstacleText;
      valColor = palette.cellObstacleText;
    } else {
      bgGrad.addColorStop(0, palette.cellEmptyBg[0]);
      bgGrad.addColorStop(1, palette.cellEmptyBg[1]);
      borderColor = palette.cellEmptyBorder;
      coordColor = palette.cellEmptyText;
      valColor = palette.cellEmptyText;
    }

    // 绘制圆角方块顶面卡片
    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(16, 16, 480, 480, 48);
    ctx.fill();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 14;
    ctx.stroke();

    // 2. 坐标标注 (左上角 JetBrains Mono 粗体)
    ctx.fillStyle = coordColor;
    ctx.font = 'bold 64px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    const isStairs = (modelId === 'climb-stairs' || modelId === 'min-cost' || modelId === 'min-cost-climbing-stairs');
    const coordLabel = isStairs
      ? (c === 0 ? '0阶(地面)' : (c === this.n - 1 ? `${c}阶 🏆` : `${c} 阶`))
      : `${r},${c}`;
    ctx.fillText(coordLabel, 44, 40);

    // 3. 状态徽章 (右上角胶囊)
    if (status === 'cur') {
      ctx.fillStyle = palette.cellCurBorder;
      ctx.beginPath();
      ctx.roundRect(280, 36, 180, 72, 24);
      ctx.fill();
      ctx.fillStyle = palette.isDark ? '#0f172a' : '#ffffff';
      ctx.font = 'bold 42px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('当前', 370, 72);
    } else if (status === 'top') {
      ctx.fillStyle = palette.cellTopBorder;
      ctx.beginPath();
      ctx.roundRect(280, 36, 180, 72, 24);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('↑上', 370, 72);
    } else if (status === 'left') {
      ctx.fillStyle = palette.cellLeftBorder;
      ctx.beginPath();
      ctx.roundRect(280, 36, 180, 72, 24);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('←左', 370, 72);
    }

    // 4. 中心 DP 状态值 (超大字号 + 软阴影保证任何俯仰角极高可读性)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (status === 'obstacle') {
      ctx.font = '140px sans-serif';
      ctx.fillText('🚧', 256, 290);
    } else {
      ctx.fillStyle = valColor;
      ctx.font = 'bold 168px "JetBrains Mono", sans-serif';
      ctx.shadowColor = 'rgba(0, 0, 0, 0.15)';
      ctx.shadowBlur = 12;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 4;
      const displayText = val !== null && val !== undefined ? String(val) : '-';
      ctx.fillText(displayText, 256, 290);
      ctx.shadowColor = 'transparent';
    }
  }

  /**
   * 响应演化步骤更新 3D 场景状态与物理动画
   */
  public updateStep(step: UniversalStep, options: GridRenderOptions): void {
    if (!this.boardGroup || this.voxelCells.length === 0 || this.m !== options.m || this.n !== options.n) {
      this.buildBoard(options.m, options.n, options);
    }

    const { m, n } = options;
    const stride = 1.0 + 0.14;
    const blockBaseH = 0.42;
    const isStairs = (options.modelId === 'climb-stairs' || options.modelId === 'min-cost' || options.modelId === 'min-cost-climbing-stairs');
    const stepRise = isStairs ? 0.32 : 0;

    const curI = step.i;
    const curJ = step.j;
    const topI = step.topI;
    const topJ = step.topJ;
    const leftI = step.leftI;
    const leftJ = step.leftJ;
    const gridData = step.grid || [];

    // 1. 更新所有体素方块状态与顶面贴图
    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        const cell = this.voxelCells[r]?.[c];
        if (!cell) continue;

        const val = gridData[r]?.[c] ?? null;
        const isCur = curI === r && curJ === c;
        const isTop = topI !== undefined && topI === r && topJ === c;
        const isLeft = leftI !== undefined && leftI === r && leftJ === c;
        const isObstacle = (step.obstacleGrid?.[r]?.[c] === 1);

        const stairElevation = c * stepRise;
        const actualBlockH = blockBaseH + stairElevation;

        let status: 'cur' | 'done' | 'top' | 'left' | 'obstacle' | 'trail' | 'empty' = 'empty';
        let targetY = actualBlockH / 2;

        if (isObstacle) {
          status = 'obstacle';
          targetY = actualBlockH / 2 + 0.28;
        } else if (isCur) {
          status = 'cur';
          targetY = actualBlockH / 2 + 0.28; // 当前活动阶梯微微悬浮点亮
        } else if (isTop) {
          status = 'top';
          targetY = actualBlockH / 2 + 0.14;
        } else if (isLeft) {
          status = 'left';
          targetY = actualBlockH / 2 + 0.14;
        } else if (val !== null) {
          status = 'done';
          targetY = actualBlockH / 2;
        }

        cell.status = status;
        cell.targetY = targetY;
        this.drawTileTopTexture(cell.topCtx, r, c, val, status, options.modelId);
        cell.topTexture.needsUpdate = true;
      }
    }

    // 2. 更新焦点聚光灯与动态光环
    const isInsideBoard = curI !== undefined && curJ !== undefined && curI >= 0 && curI < m && curJ >= 0 && curJ < n;
    const activeStairElevation = (curJ !== undefined ? curJ : 0) * stepRise;
    if (isInsideBoard) {
      if (this.pointLight) {
        this.pointLight.position.set(curJ * stride, 2.2 + activeStairElevation, curI * stride);
        this.pointLight.intensity = 3.0;
        this.pointLight.visible = true;
      }
      if (this.activeGlowRing) {
        this.activeGlowRing.position.set(curJ * stride, 0.02 + activeStairElevation, curI * stride);
        this.activeGlowRing.visible = true;
      }
    } else {
      if (this.pointLight) this.pointLight.visible = false;
      if (this.activeGlowRing) this.activeGlowRing.visible = false;
    }

    // 3. 基于有限状态机驱动 3D 探险家小人物理动力学与落水/撞墙/庆祝动画 (FSM Driven Kinematics)
    if (this.adventurer3D) {
      const resolution = ThreeActorStateMachine.resolve(step, m, n, stride, blockBaseH, options.modelId);
      this.adventurer3D.visible = resolution.visible; // 🌟 恒为 true

      const nextTarget = new THREE.Vector3(
        resolution.targetPosition.x,
        resolution.targetPosition.y,
        resolution.targetPosition.z
      );

      const facingTargetX = resolution.targetFacing ? resolution.targetFacing.x : nextTarget.x;
      const facingTargetZ = resolution.targetFacing ? resolution.targetFacing.z : nextTarget.z;
      const dx = facingTargetX - this.charCurrentPos.x;
      const dz = facingTargetZ - this.charCurrentPos.z;
      if (Math.hypot(dx, dz) > 0.05) {
        this.charTargetHeading = Math.atan2(dx, dz);
      }

      if (resolution.isBounceJump && resolution.bounceApexPosition) {
        this.charJumpStartPos.set(
          resolution.targetPosition.x,
          resolution.targetPosition.y,
          resolution.targetPosition.z
        );
        this.charBounceApexPos = new THREE.Vector3(
          resolution.bounceApexPosition.x,
          resolution.bounceApexPosition.y,
          resolution.bounceApexPosition.z
        );
        this.charTargetPos.copy(nextTarget);
        this.isBounceJump = true;
        this.charJumpProgress = 0.0;
        this.hasTriggeredMidSplash = false;
        this.charSquash = 1.0;
      } else if (this.charTargetPos.distanceTo(nextTarget) > 0.05) {
        this.charJumpStartPos.copy(this.charCurrentPos);
        this.charBounceApexPos = null;
        this.isBounceJump = false;
        this.charTargetPos.copy(nextTarget);
        this.charJumpProgress = 0.0;
        this.charSquash = resolution.squash;

        if (resolution.splashWater) {
          this.splashTimer = 1.0;
          this.splashX = resolution.splashPosition ? resolution.splashPosition.x : nextTarget.x;
          this.splashZ = resolution.splashPosition ? resolution.splashPosition.z : nextTarget.z;
        }
      } else {
        this.charBounceApexPos = null;
        this.isBounceJump = false;
        this.charSquash = resolution.squash;
        if (resolution.splashWater) {
          this.splashTimer = 1.0;
          this.splashX = resolution.splashPosition ? resolution.splashPosition.x : nextTarget.x;
          this.splashZ = resolution.splashPosition ? resolution.splashPosition.z : nextTarget.z;
        }
      }
    }

    // 4. 重建 3D 空间霓虹流光光管与流动粒子
    this.buildTransferTubes(step, options);
  }

  /**
   * 构建 3D 空间状态转移贝塞尔霓虹弧线光管与飞行粒子
   */
  private buildTransferTubes(step: UniversalStep, options: GridRenderOptions): void {
    if (!this.scene) return;
    const stride = 1.0 + 0.14;

    this.clearTransferTubes();

    const { m, n } = options;
    const curI = step.i;
    const curJ = step.j;
    if (curI === undefined || curJ === undefined || curI < 0 || curJ < 0) return;

    const curVec = new THREE.Vector3(curJ * stride, 0.85, curI * stride);

    const createTubeWithSpark = (fromI: number, fromJ: number, color: number) => {
      if (fromI < 0 || fromI >= m || fromJ < 0 || fromJ >= n) return;
      const fromVec = new THREE.Vector3(fromJ * stride, 0.65, fromI * stride);
      const midVec = new THREE.Vector3(
        (fromVec.x + curVec.x) / 2,
        Math.max(fromVec.y, curVec.y) + 0.75,
        (fromVec.z + curVec.z) / 2
      );

      const curve = new THREE.QuadraticBezierCurve3(fromVec, midVec, curVec);
      const tubeGeo = new THREE.TubeGeometry(curve, 36, 0.045, 12, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.8,
        roughness: 0.15,
        metalness: 0.1
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      this.scene?.add(tubeMesh);
      this.transferTubes.push(tubeMesh);

      // 飞行能量火花球 (Energy Spark)
      const sparkGeo = new THREE.SphereGeometry(0.08, 16, 16);
      const sparkMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
      const sparkMesh = new THREE.Mesh(sparkGeo, sparkMat);
      this.scene?.add(sparkMesh);

      this.energySparks.push({
        mesh: sparkMesh,
        curve,
        progress: 0,
        speed: 1.8
      });
    };

    if (step.topI !== undefined && step.topI >= 0 && step.topJ !== undefined && step.topJ >= 0) {
      createTubeWithSpark(step.topI, step.topJ, 0xa855f7); // 紫色上方依赖
    }
    if (step.leftI !== undefined && step.leftI >= 0 && step.leftJ !== undefined && step.leftJ >= 0) {
      createTubeWithSpark(step.leftI, step.leftJ, 0xf59e0b); // 蜜金左方依赖
    }
  }

  private clearTransferTubes(): void {
    this.transferTubes.forEach(t => {
      this.scene?.remove(t);
      t.geometry.dispose();
      (t.material as THREE.Material).dispose();
    });
    this.transferTubes = [];

    this.energySparks.forEach(s => {
      this.scene?.remove(s.mesh);
      s.mesh.geometry.dispose();
      (s.mesh.material as THREE.Material).dispose();
    });
    this.energySparks = [];
  }

  /**
   * 渲染帧动画主循环
   */
  private startAnimationLoop(): void {
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);

      const delta = this.clock.getDelta();
      const time = this.clock.getElapsedTime();

      // 1. 体素方块平滑弹性升降
      for (let r = 0; r < this.voxelCells.length; r++) {
        for (let c = 0; c < this.voxelCells[r].length; c++) {
          const cell = this.voxelCells[r][c];
          cell.currentY += (cell.targetY - cell.currentY) * Math.min(delta * 14, 1);
          cell.mesh.position.y = cell.currentY;
        }
      }

      // 2. 探险家 3D 物理跳跃与落地挤压弹性形变 (Crossy Road Hop & Squash)
      if (this.adventurer3D) {
        // 朝向平滑插值
        this.charCurrentHeading += (this.charTargetHeading - this.charCurrentHeading) * Math.min(delta * 10, 1);
        this.adventurer3D.rotation.y = this.charCurrentHeading;

        if (this.charJumpProgress < 1.0) {
          this.charJumpProgress = Math.min(1.0, this.charJumpProgress + delta * 1.6);
          const p = this.charJumpProgress;

          if (this.isBounceJump && this.charBounceApexPos) {
            // 双段抛物线物理动画：第一段飞向水面/高墙，第二段撞水/撞墙弹回陆地
            if (p <= 0.5) {
              const t = p / 0.5;
              this.charCurrentPos.lerpVectors(this.charJumpStartPos, this.charBounceApexPos, t);
              const arcY = Math.sin(t * Math.PI) * 0.65;
              this.adventurer3D.position.copy(this.charCurrentPos);
              this.adventurer3D.position.y += arcY;

              this.adventurer3D.rotation.x = Math.sin(t * Math.PI) * 0.35;
              this.adventurer3D.scale.set(0.9, 1.15, 0.9);

              if (p >= 0.45 && !this.hasTriggeredMidSplash) {
                this.hasTriggeredMidSplash = true;
                this.splashTimer = 1.0;
                this.splashX = this.charBounceApexPos.x;
                this.splashZ = this.charBounceApexPos.z;
                this.charSquash = 0.65; // 触水压扁
              }
            } else {
              const t = (p - 0.5) / 0.5;
              this.charCurrentPos.lerpVectors(this.charBounceApexPos, this.charTargetPos, t);
              const arcY = Math.sin(t * Math.PI) * 0.85;
              this.adventurer3D.position.copy(this.charCurrentPos);
              this.adventurer3D.position.y += arcY;

              this.adventurer3D.rotation.x = -Math.sin(t * Math.PI) * 0.25;
              this.adventurer3D.scale.set(1.1, 0.9, 1.1);
            }
          } else {
            // 正常单段抛物线跳跃
            this.charCurrentPos.lerpVectors(this.charJumpStartPos, this.charTargetPos, p);
            const arcY = Math.sin(p * Math.PI) * 0.85;
            this.adventurer3D.position.copy(this.charCurrentPos);
            this.adventurer3D.position.y += arcY;
            this.adventurer3D.rotation.x = Math.sin(p * Math.PI) * 0.25;
            this.adventurer3D.scale.set(0.9, 1.15, 0.9);
          }
        } else {
          // 落地挤压与弹簧阻尼回弹 (Squash & Stretch Spring)
          if (this.charSquash > 1.0 || this.charSquash < 1.0) {
            const springForce = (1.0 - this.charSquash) * 35;
            this.charSquashVelocity += springForce * delta;
            this.charSquashVelocity *= 0.82; // 阻尼
            this.charSquash += this.charSquashVelocity * delta;
          }
          this.charCurrentPos.copy(this.charTargetPos);
          this.adventurer3D.position.copy(this.charTargetPos);
          this.adventurer3D.rotation.x = 0;

          // 待机呼吸微浮动
          this.adventurer3D.position.y += Math.sin(time * 3) * 0.035;
          this.adventurer3D.scale.set(
            1.0 / Math.sqrt(this.charSquash || 1),
            this.charSquash,
            1.0 / Math.sqrt(this.charSquash || 1)
          );
        }
      }

      // 3. 活动光环旋转脉冲
      if (this.activeGlowRing) {
        this.activeGlowRing.rotation.z = time * 1.5;
        const scale = 1.0 + Math.sin(time * 4) * 0.08;
        this.activeGlowRing.scale.set(scale, scale, scale);
      }

      // 4. 水晶河流温和柔光波浪演化与落水水花扩散 (温和振幅规避穿插与频闪)
      if (this.riverMesh && this.originalWaterPositions) {
        const geo = this.riverMesh.geometry as THREE.BufferGeometry;
        const pos = geo.attributes.position;
        const orig = this.originalWaterPositions;
        const count = pos.count;

        if (this.splashTimer > 0) {
          this.splashTimer = Math.max(0, this.splashTimer - delta * 1.5);
        }

        for (let i = 0; i < count; i++) {
          const vx = orig[i * 3];
          const vz = orig[i * 3 + 2];
          const wave1 = Math.sin(vx * 1.5 + time * 1.8) * 0.006;
          const wave2 = Math.cos(vz * 1.5 + time * 1.5) * 0.005;
          const ripple = Math.sin((vx + vz) * 2.2 + time * 2.0) * 0.003;

          let splashWave = 0;
          if (this.splashTimer > 0) {
            const dist = Math.hypot(vx - this.splashX, vz - this.splashZ);
            splashWave =
              Math.sin(dist * 5.0 - (1.0 - this.splashTimer) * 10.0) *
              Math.exp(-dist * 1.5) *
              this.splashTimer *
              0.02;
          }

          pos.setY(i, wave1 + wave2 + ripple + splashWave);
        }
        pos.needsUpdate = true;
      }

      // 4.2 岸边浪花微缩放脉冲
      for (const foam of this.riverFoamRings) {
        const fScale = 1.0 + Math.sin(time * 2.6) * 0.015;
        foam.scale.set(fScale, 1.0, fScale);
      }

      // 4.3 水花微光浮动
      if (this.waterSparkles) {
        const pAttr = this.waterSparkles.geometry.attributes.position;
        for (let i = 0; i < pAttr.count; i++) {
          const py = -0.035 + Math.sin(time * 3.2 + i * 1.5) * 0.012;
          pAttr.setY(i, py);
        }
        pAttr.needsUpdate = true;
      }

      // 5. 飞行能量火花球更新
      for (const spark of this.energySparks) {
        spark.progress = (spark.progress + delta * spark.speed) % 1.0;
        const pt = spark.curve.getPointAt(spark.progress);
        spark.mesh.position.copy(pt);
      }

      if (this.controls) {
        this.controls.update();
      }

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };
    animate();
  }

  /**
   * 容器尺寸改变事件 - 委托 ThreeCameraOrbitController 深模块
   */
  private handleResize(): void {
    if (!this.container || !this.renderer) return;
    const width = this.container.clientWidth || 400;
    const height = this.container.clientHeight || 300;
    if (this.cameraOrbitController) {
      this.cameraOrbitController.handleResize(width, height);
    }
    this.renderer.setSize(width, height);
  }

  /**
   * 销毁场景与释放 WebGL 显存
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
    if (this.cameraOrbitController) {
      this.cameraOrbitController.disposeControls();
      this.cameraOrbitController = null;
    }
    this.camera = null;
    this.controls = null;
    if (this.scene) {
      VoxelSceneComposer.disposeHierarchy(this.scene);
      this.scene = null;
    }
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
      this.renderer = null;
    }
    this.boardGroup = null;
    this.voxelCells = [];
    this.transferTubes = [];
    this.energySparks = [];
    this.riverMesh = null;
    this.riverBedMesh = null;
    this.riverFoamRings = [];
    this.waterSparkles = null;
    this.originalWaterPositions = null;
    this.container = null;
  }
}
