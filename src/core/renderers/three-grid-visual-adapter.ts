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

interface EnergySpark {
  mesh: THREE.Mesh;
  curve: THREE.Curve<THREE.Vector3>;
  progress: number;
  speed: number;
}

export class ThreeGridVisualAdapter {
  private static instance: ThreeGridVisualAdapter | null = null;

  private container: HTMLElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
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

    // 1. WebGL 物理渲染器 (开启全分辨率抗锯齿与电影级色调映射)
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
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

    // 2. 场景与透视摄像机
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 100);
    this.resetCameraPosition();

    // 3. 轨道控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.08; // 禁止翻转到地下
    this.controls.minDistance = 3.5;
    this.controls.maxDistance = 24;

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

    // 1. 天空/地面半球漫射光 (暖米色天空 + 浅灰蓝地面)
    const hemiLight = new THREE.HemisphereLight(0xfffbeb, 0xe0f2fe, 0.85);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    // 2. 主定向太阳光 (投射细腻软阴影)
    const sunLight = new THREE.DirectionalLight(0xfff7ed, 1.35);
    sunLight.position.set(12, 18, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0003;
    sunLight.shadow.radius = 2.5;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 45;
    const sSize = 9;
    sunLight.shadow.camera.left = -sSize;
    sunLight.shadow.camera.right = sSize;
    sunLight.shadow.camera.top = sSize;
    sunLight.shadow.camera.bottom = -sSize;
    this.scene.add(sunLight);

    // 3. 侧后方冷色轮廓背光 (Rim Light，勾勒方块立体边缘)
    const rimLight = new THREE.DirectionalLight(0xbae6fd, 0.65);
    rimLight.position.set(-12, 12, -12);
    this.scene.add(rimLight);

    // 4. 动态活动格焦点聚光点光源 (Electric Cyan Spotlight)
    this.pointLight = new THREE.PointLight(0x0ea5e9, 2.5, 7, 1.2);
    this.pointLight.position.set(0, 2.2, 0);
    this.scene.add(this.pointLight);
  }

  /**
   * 重置摄像机至等轴测最佳黄金视角
   */
  public resetCameraPosition(): void {
    if (!this.camera) return;
    const stride = 1.0 + 0.14;
    const centerOffsetX = ((this.n - 1) * stride) / 2;
    const centerOffsetZ = ((this.m - 1) * stride) / 2;

    const maxDim = Math.max(this.m, this.n);
    const camDist = maxDim * 1.5 + 4.2;

    this.camera.position.set(
      centerOffsetX + camDist * 0.95,
      camDist * 1.15,
      centerOffsetZ + camDist * 0.95
    );
    this.camera.lookAt(centerOffsetX, 0.3, centerOffsetZ);

    if (this.controls) {
      this.controls.target.set(centerOffsetX, 0.3, centerOffsetZ);
      this.controls.update();
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
      this.disposeHierarchy(this.boardGroup);
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
    const baseGeo = new THREE.BoxGeometry(baseW, 0.22, baseD);
    const baseMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.15,
      metalness: 0.05,
      transmission: 0.35,
      transparent: true,
      opacity: 0.95,
      reflectivity: 0.8
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set((n - 1) * stride / 2, -0.12, (m - 1) * stride / 2);
    baseMesh.receiveShadow = true;
    this.boardGroup.add(baseMesh);

    // 2. 底座边缘悬浮微光金边
    const rimGeo = new THREE.BoxGeometry(baseW + 0.06, 0.04, baseD + 0.06);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.4,
      roughness: 0.3
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.set((n - 1) * stride / 2, -0.22, (m - 1) * stride / 2);
    this.boardGroup.add(rimMesh);

    // 3. 构建 3D 倒角体素方块阵列
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

        const geo = new THREE.BoxGeometry(cellSize, blockHeight, cellSize);
        const mesh = new THREE.Mesh(geo, materials);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.position.set(c * stride, blockHeight / 2, r * stride);

        this.boardGroup.add(mesh);

        this.voxelCells[r][c] = {
          mesh,
          topCanvas: canvas,
          topCtx: ctx,
          topTexture: texture,
          materials,
          r,
          c,
          targetY: blockHeight / 2,
          currentY: blockHeight / 2,
          status: 'empty'
        };
      }
    }

    // 4. 当前活动格底部发光能量光环 (Rotating Neon Ring)
    const ringGeo = new THREE.RingGeometry(0.55, 0.72, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.75,
      side: THREE.DoubleSide
    });
    this.activeGlowRing = new THREE.Mesh(ringGeo, ringMat);
    this.activeGlowRing.rotation.x = -Math.PI / 2;
    this.activeGlowRing.position.set(0, 0.02, 0);
    this.boardGroup.add(this.activeGlowRing);

    // 5. 3D 四周环绕高质感水晶流动护岛深水河 (Surrounding Island Crystal River)
    const riverMargin = 1.35;
    const riverW = baseW + riverMargin * 2;
    const riverD = baseD + riverMargin * 2;
    const centerX = (n - 1) * stride / 2;
    const centerZ = (m - 1) * stride / 2;

    // 5.1 深邃湛蓝河床底槽 (Deep Riverbed Basin)
    const bedGeo = new THREE.BoxGeometry(riverW + 0.36, 0.28, riverD + 0.36);
    const bedMat = new THREE.MeshStandardMaterial({
      color: 0x0284c7,
      roughness: 0.6,
      metalness: 0.1
    });
    this.riverBedMesh = new THREE.Mesh(bedGeo, bedMat);
    this.riverBedMesh.position.set(centerX, -0.26, centerZ);
    this.riverBedMesh.receiveShadow = true;
    this.boardGroup.add(this.riverBedMesh);

    // 5.2 河道外侧微光水晶堤岸 (Outer Embankment Rim)
    const outerBankGeo = new THREE.BoxGeometry(riverW + 0.44, 0.08, riverD + 0.44);
    const outerBankMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.35,
      roughness: 0.25,
      metalness: 0.15
    });
    const outerBankMesh = new THREE.Mesh(outerBankGeo, outerBankMat);
    outerBankMesh.position.set(centerX, -0.16, centerZ);
    this.boardGroup.add(outerBankMesh);

    // 5.3 物理动态波浪高密度水面 (Dynamic Physical Wave Water Surface)
    const waterSegs = Math.min(48, Math.max(28, Math.round(Math.max(riverW, riverD) * 3)));
    const waterGeo = new THREE.PlaneGeometry(riverW, riverD, waterSegs, waterSegs);
    waterGeo.rotateX(-Math.PI / 2);

    const posAttr = waterGeo.attributes.position;
    this.originalWaterPositions = new Float32Array(posAttr.array);

    const waterMat = new THREE.MeshPhysicalMaterial({
      color: 0x06b6d4,            // 清澈电光青蓝
      emissive: 0x0369a1,         // 水底深层荧光
      emissiveIntensity: 0.3,
      roughness: 0.05,
      metalness: 0.05,
      transmission: 0.85,         // 水晶通透度
      transparent: true,
      opacity: 0.88,
      ior: 1.333,                 // 真实水体折射率
      reflectivity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05
    });
    this.riverMesh = new THREE.Mesh(waterGeo, waterMat);
    this.riverMesh.position.set(centerX, -0.05, centerZ);
    this.riverMesh.receiveShadow = true;
    this.boardGroup.add(this.riverMesh);

    // 5.4 岛屿岸边白浪波沫圈 (Island Shoreline Foam Rim)
    const innerFoamGeo = new THREE.BoxGeometry(baseW + 0.14, 0.02, baseD + 0.14);
    const innerFoamMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.55
    });
    const innerFoamMesh = new THREE.Mesh(innerFoamGeo, innerFoamMat);
    innerFoamMesh.position.set(centerX, -0.04, centerZ);
    this.boardGroup.add(innerFoamMesh);
    this.riverFoamRings = [innerFoamMesh];

    // 5.5 水面流动微光星点 (Water Sparkle Glints)
    const sparkleCount = 40;
    const sparkleGeo = new THREE.BufferGeometry();
    const sparklePositions = new Float32Array(sparkleCount * 3);
    for (let i = 0; i < sparkleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const radiusX = (baseW / 2) + 0.15 + Math.random() * (riverMargin - 0.3);
      const radiusZ = (baseD / 2) + 0.15 + Math.random() * (riverMargin - 0.3);
      sparklePositions[i * 3] = centerX + Math.cos(angle) * radiusX;
      sparklePositions[i * 3 + 1] = -0.035;
      sparklePositions[i * 3 + 2] = centerZ + Math.sin(angle) * radiusZ;
    }
    sparkleGeo.setAttribute('position', new THREE.BufferAttribute(sparklePositions, 3));
    const sparkleMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.075,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });
    this.waterSparkles = new THREE.Points(sparkleGeo, sparkleMat);
    this.boardGroup.add(this.waterSparkles);

    // 6. 真正的 3D 萌系体素小人 (Crossy Road / Minecraft Voxel Explorer)
    this.adventurer3D = this.createVoxelAdventurerMesh();
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
   * 创建真正 3D 萌系多部件体素探险家 (True 3D Voxel Adventurer)
   */
  private createVoxelAdventurerMesh(): THREE.Group {
    const explorer = new THREE.Group();

    // 材质定义
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xfed7aa, roughness: 0.4 }); // 暖肉色
    const hatBrimMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.35 }); // 暖棕帽檐
    const hatTopMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.35 }); // 深棕帽顶
    const hatBandMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, roughness: 0.2 }); // 金色帽带
    const eyeMat = new THREE.MeshBasicMaterial({ color: 0x0f172a }); // 萌系黑眼
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xfb7185, transparent: true, opacity: 0.8 }); // 腮红
    const jacketMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3 }); // 蓝色探险服
    const beltMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.4 }); // 皮带
    const buckleMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, metalness: 0.6, roughness: 0.2 }); // 金扣
    const packMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.45 }); // 旅行背包
    const pantsMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 }); // 灰蓝长裤
    const bootMat = new THREE.MeshStandardMaterial({ color: 0x475569, roughness: 0.5 }); // 登山靴

    // 1. 头部组件
    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.72, 0);

    // 头部方块
    const headMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.34, 0.38), skinMat);
    headMesh.castShadow = true;
    headGroup.add(headMesh);

    // 双眼 (立方形高亮黑眼)
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.04), eyeMat);
    eyeL.position.set(-0.09, 0.02, 0.19);
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.04), eyeMat);
    eyeR.position.set(0.09, 0.02, 0.19);
    headGroup.add(eyeL, eyeR);

    // 粉色腮红
    const blushL = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.02), blushMat);
    blushL.position.set(-0.12, -0.06, 0.19);
    const blushR = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.04, 0.02), blushMat);
    blushR.position.set(0.12, -0.06, 0.19);
    headGroup.add(blushL, blushR);

    // 探险家宽檐帽
    const brimMesh = new THREE.Mesh(new THREE.BoxGeometry(0.58, 0.05, 0.58), hatBrimMat);
    brimMesh.position.set(0, 0.16, 0);
    brimMesh.castShadow = true;
    headGroup.add(brimMesh);

    const hatTop = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.18, 0.36), hatTopMat);
    hatTop.position.set(0, 0.27, 0);
    hatTop.castShadow = true;
    headGroup.add(hatTop);

    const hatBand = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.05, 0.38), hatBandMat);
    hatBand.position.set(0, 0.21, 0);
    headGroup.add(hatBand);

    explorer.add(headGroup);

    // 2. 躯干身体组件
    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 0.42, 0);

    const torsoMesh = new THREE.Mesh(new THREE.BoxGeometry(0.38, 0.36, 0.28), jacketMat);
    torsoMesh.castShadow = true;
    bodyGroup.add(torsoMesh);

    // 腰带与金色金属扣
    const beltMesh = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.07, 0.30), beltMat);
    beltMesh.position.set(0, -0.11, 0);
    bodyGroup.add(beltMesh);

    const buckleMesh = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.09, 0.04), buckleMat);
    buckleMesh.position.set(0, -0.11, 0.15);
    bodyGroup.add(buckleMesh);

    // 背部立体探险背包
    const backpack = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.28, 0.14), packMat);
    backpack.position.set(0, 0.02, -0.20);
    backpack.castShadow = true;
    bodyGroup.add(backpack);

    explorer.add(bodyGroup);

    // 3. 手臂组件
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.32, 0.12), jacketMat);
    armL.position.set(-0.25, 0.44, 0);
    armL.castShadow = true;
    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.32, 0.12), jacketMat);
    armR.position.set(0.25, 0.44, 0);
    armR.castShadow = true;
    explorer.add(armL, armR);

    // 4. 腿部与登山靴组件
    const legL = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.22, 0.14), pantsMat);
    legL.position.set(-0.10, 0.14, 0);
    legL.castShadow = true;
    const bootL = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.18), bootMat);
    bootL.position.set(-0.10, 0.04, 0.02);
    bootL.castShadow = true;

    const legR = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.22, 0.14), pantsMat);
    legR.position.set(0.10, 0.14, 0);
    legR.castShadow = true;
    const bootR = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.08, 0.18), bootMat);
    bootR.position.set(0.10, 0.04, 0.02);
    bootR.castShadow = true;

    explorer.add(legL, bootL, legR, bootR);

    // 5. 接触投影椭圆面
    const shadowGeo = new THREE.PlaneGeometry(0.65, 0.65);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.38,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    explorer.add(shadowMesh);

    return explorer;
  }

  /**
   * 绘制「纪念碑谷」高对比度高质感顶面贴图 (512×512)
   */
  private drawTileTopTexture(
    ctx: CanvasRenderingContext2D,
    r: number,
    c: number,
    val: number | null,
    status: 'cur' | 'done' | 'top' | 'left' | 'obstacle' | 'trail' | 'empty'
  ): void {
    ctx.clearRect(0, 0, 512, 512);

    // 1. 柔和马卡龙/电光渐变底色
    let bgGrad = ctx.createLinearGradient(0, 0, 512, 512);
    let borderColor = '#cbd5e1';
    let coordColor = '#64748b';
    let valColor = '#0f172a';

    if (status === 'cur') {
      bgGrad.addColorStop(0, '#e0f2fe');
      bgGrad.addColorStop(1, '#bae6fd');
      borderColor = '#0284c7';
      coordColor = '#0369a1';
      valColor = '#0c4a6e';
    } else if (status === 'top') {
      bgGrad.addColorStop(0, '#faf5ff');
      bgGrad.addColorStop(1, '#f3e8ff');
      borderColor = '#9333ea';
      coordColor = '#7e22ce';
      valColor = '#581c87';
    } else if (status === 'left') {
      bgGrad.addColorStop(0, '#fffbeb');
      bgGrad.addColorStop(1, '#fef3c7');
      borderColor = '#d97706';
      coordColor = '#b45309';
      valColor = '#78350f';
    } else if (status === 'done') {
      bgGrad.addColorStop(0, '#ffffff');
      bgGrad.addColorStop(1, '#f1f5f9');
      borderColor = '#64748b';
      coordColor = '#475569';
      valColor = '#0f172a';
    } else if (status === 'obstacle') {
      bgGrad.addColorStop(0, '#cbd5e1');
      bgGrad.addColorStop(1, '#94a3b8');
      borderColor = '#334155';
      coordColor = '#f8fafc';
      valColor = '#ffffff';
    } else {
      bgGrad.addColorStop(0, '#ffffff');
      bgGrad.addColorStop(1, '#f8fafc');
      borderColor = '#e2e8f0';
      coordColor = '#94a3b8';
      valColor = '#94a3b8';
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
    ctx.fillText(`${r},${c}`, 44, 40);

    // 3. 状态徽章 (右上角胶囊)
    if (status === 'cur') {
      ctx.fillStyle = '#0284c7';
      ctx.beginPath();
      ctx.roundRect(280, 36, 180, 72, 24);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('当前', 370, 72);
    } else if (status === 'top') {
      ctx.fillStyle = '#9333ea';
      ctx.beginPath();
      ctx.roundRect(280, 36, 180, 72, 24);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 42px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('↑上', 370, 72);
    } else if (status === 'left') {
      ctx.fillStyle = '#d97706';
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

        let status: 'cur' | 'done' | 'top' | 'left' | 'obstacle' | 'trail' | 'empty' = 'empty';
        let targetY = blockBaseH / 2;

        if (isObstacle) {
          status = 'obstacle';
          targetY = blockBaseH / 2 + 0.28;
        } else if (isCur) {
          status = 'cur';
          targetY = blockBaseH / 2 + 0.45; // 当前活动格向上悬浮
        } else if (isTop) {
          status = 'top';
          targetY = blockBaseH / 2 + 0.22;
        } else if (isLeft) {
          status = 'left';
          targetY = blockBaseH / 2 + 0.22;
        } else if (val !== null) {
          status = 'done';
          targetY = blockBaseH / 2;
        }

        cell.status = status;
        cell.targetY = targetY;
        this.drawTileTopTexture(cell.topCtx, r, c, val, status);
        cell.topTexture.needsUpdate = true;
      }
    }

    // 2. 更新焦点聚光灯与动态光环
    const isInsideBoard = curI !== undefined && curJ !== undefined && curI >= 0 && curI < m && curJ >= 0 && curJ < n;
    if (isInsideBoard) {
      if (this.pointLight) {
        this.pointLight.position.set(curJ * stride, 2.2, curI * stride);
        this.pointLight.intensity = 3.0;
        this.pointLight.visible = true;
      }
      if (this.activeGlowRing) {
        this.activeGlowRing.position.set(curJ * stride, 0.02, curI * stride);
        this.activeGlowRing.visible = true;
      }
    } else {
      if (this.pointLight) this.pointLight.visible = false;
      if (this.activeGlowRing) this.activeGlowRing.visible = false;
    }

    // 3. 基于有限状态机驱动 3D 探险家小人物理动力学与落水/撞墙/庆祝动画 (FSM Driven Kinematics)
    if (this.adventurer3D) {
      const resolution = ThreeActorStateMachine.resolve(step, m, n, stride, blockBaseH);
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

      // 4. 水晶河流物理波浪演化与落水水花扩散
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
          const wave1 = Math.sin(vx * 1.8 + time * 2.5) * 0.024;
          const wave2 = Math.cos(vz * 1.8 + time * 2.0) * 0.020;
          const ripple = Math.sin((vx + vz) * 3.2 + time * 3.2) * 0.012;
          const swirl = Math.sin(Math.sqrt(vx * vx + vz * vz) * 2.2 - time * 2.8) * 0.014;

          let splashWave = 0;
          if (this.splashTimer > 0) {
            const dist = Math.hypot(vx - this.splashX, vz - this.splashZ);
            splashWave = Math.sin(dist * 6.0 - (1.0 - this.splashTimer) * 14.0) * Math.exp(-dist * 1.2) * this.splashTimer * 0.06;
          }

          pos.setY(i, wave1 + wave2 + ripple + swirl + splashWave);
        }
        pos.needsUpdate = true;
        geo.computeVertexNormals();
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
   * 容器尺寸改变事件
   */
  private handleResize(): void {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth || 400;
    const height = this.container.clientHeight || 300;
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
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
    if (this.controls) {
      this.controls.dispose();
      this.controls = null;
    }
    if (this.scene) {
      this.disposeHierarchy(this.scene);
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

  private disposeHierarchy(obj: THREE.Object3D): void {
    for (let i = obj.children.length - 1; i >= 0; i--) {
      this.disposeHierarchy(obj.children[i]);
    }
    if ((obj as THREE.Mesh).geometry) {
      (obj as THREE.Mesh).geometry.dispose();
    }
    if ((obj as THREE.Mesh).material) {
      const mat = (obj as THREE.Mesh).material;
      if (Array.isArray(mat)) {
        mat.forEach(m => m.dispose());
      } else {
        mat.dispose();
      }
    }
  }
}
