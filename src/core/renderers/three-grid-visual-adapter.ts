import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { UniversalStep } from '../universal-stage-engine';
import { GridRenderOptions } from './grid-visual-adapter';

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

  // 场景元素
  private boardGroup: THREE.Group | null = null;
  private voxelCells: VoxelCellMesh[][] = [];
  private adventurerMesh: THREE.Group | null = null;
  private riverMesh: THREE.Mesh | null = null;
  private transferTubes: THREE.Mesh[] = [];
  private pointLight: THREE.PointLight | null = null;

  // 动画状态
  private m: number = 3;
  private n: number = 4;
  private charCurrentPos: THREE.Vector3 = new THREE.Vector3();
  private charTargetPos: THREE.Vector3 = new THREE.Vector3();
  private charJumpProgress: number = 1.0;
  private charJumpStartPos: THREE.Vector3 = new THREE.Vector3();
  private clock: THREE.Clock = new THREE.Clock();

  public static getInstance(): ThreeGridVisualAdapter {
    if (!ThreeGridVisualAdapter.instance) {
      ThreeGridVisualAdapter.instance = new ThreeGridVisualAdapter();
    }
    return ThreeGridVisualAdapter.instance;
  }

  /**
   * 初始化与挂载 WebGL 画布到容器
   */
  public mount(container: HTMLElement): void {
    if (this.container === container && this.renderer) return;
    this.dispose();

    this.container = container;
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 300;

    // 1. 渲染器配置 (启用抗锯齿与真实软阴影)
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
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.domElement.style.outline = 'none';
    this.renderer.domElement.className = 'w-full h-full block cursor-grab active:cursor-grabbing';

    container.innerHTML = '';
    container.appendChild(this.renderer.domElement);

    // 2. 场景与摄像机构建
    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 100);
    this.resetCameraPosition();

    // 3. 轨道控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.maxPolarAngle = Math.PI / 2 - 0.05; // 禁止穿透地面以下
    this.controls.minDistance = 3;
    this.controls.maxDistance = 25;

    // 4. 灯光系统
    this.setupLights();

    // 5. 尺寸自适应监听
    this.resizeObserver = new ResizeObserver(() => this.handleResize());
    this.resizeObserver.observe(container);

    // 6. 开启渲染循环
    this.startAnimationLoop();
  }

  /**
   * 设置专业 PBR 光影
   */
  private setupLights(): void {
    if (!this.scene) return;

    // 环境漫反射光 (模拟天空蓝与地面反射)
    const hemiLight = new THREE.HemisphereLight(0xffffff, 0xe2e8f0, 0.75);
    hemiLight.position.set(0, 20, 0);
    this.scene.add(hemiLight);

    // 主定向日光 (投射软阴影)
    const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
    sunLight.position.set(10, 16, 8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 40;
    const shadowD = 8;
    sunLight.shadow.camera.left = -shadowD;
    sunLight.shadow.camera.right = shadowD;
    sunLight.shadow.camera.top = shadowD;
    sunLight.shadow.camera.bottom = -shadowD;
    this.scene.add(sunLight);

    // 侧方微蓝冷光补光
    const fillLight = new THREE.DirectionalLight(0x93c5fd, 0.45);
    fillLight.position.set(-10, 10, -10);
    this.scene.add(fillLight);

    // 动态焦点聚光点光源 (跟随当前活动格发光)
    this.pointLight = new THREE.PointLight(0x3b82f6, 2.0, 6);
    this.pointLight.position.set(0, 2, 0);
    this.scene.add(this.pointLight);
  }

  /**
   * 重置摄像机至等轴测最佳观察视角
   */
  public resetCameraPosition(): void {
    if (!this.camera) return;
    const centerOffsetZ = (this.m * 1.15) / 2;
    const centerOffsetX = (this.n * 1.15) / 2;

    this.camera.position.set(
      centerOffsetX + Math.max(this.n * 1.6, 6.5),
      Math.max(this.m, this.n) * 2.1 + 4.5,
      centerOffsetZ + Math.max(this.m * 1.6, 6.5)
    );
    this.camera.lookAt(centerOffsetX, 0.2, centerOffsetZ);

    if (this.controls) {
      this.controls.target.set(centerOffsetX, 0.2, centerOffsetZ);
      this.controls.update();
    }
  }

  /**
   * 构建 3D 体素网格沙盘
   */
  public buildBoard(m: number, n: number, options: GridRenderOptions): void {
    if (!this.scene) return;
    this.m = m;
    this.n = n;

    // 清理旧沙盘
    if (this.boardGroup) {
      this.scene.remove(this.boardGroup);
      this.disposeHierarchy(this.boardGroup);
      this.boardGroup = null;
    }
    this.voxelCells = [];
    this.transferTubes.forEach(t => {
      this.scene?.remove(t);
      t.geometry.dispose();
      (t.material as THREE.Material).dispose();
    });
    this.transferTubes = [];

    const isGridProblem = options.isGridProblem ?? (options.modelId ? ['unique-paths', 'unique-paths-ii', 'min-path-sum'].includes(options.modelId) : true);

    this.boardGroup = new THREE.Group();
    const cellSize = 1.0;
    const cellGap = 0.12;
    const blockHeight = 0.32;
    const stride = cellSize + cellGap;

    // 1. 底座悬浮托盘 (Pedestal Slab)
    const baseW = n * stride + 0.35;
    const baseH = m * stride + 0.35;
    const baseGeo = new THREE.BoxGeometry(baseW, 0.15, baseH);
    const baseMat = new THREE.MeshStandardMaterial({
      color: 0xf1f5f9,
      roughness: 0.4,
      metalness: 0.1
    });
    const baseMesh = new THREE.Mesh(baseGeo, baseMat);
    baseMesh.position.set((n - 1) * stride / 2, -0.08, (m - 1) * stride / 2);
    baseMesh.receiveShadow = true;
    this.boardGroup.add(baseMesh);

    // 2. 3D 体素地砖方块阵列
    for (let r = 0; r < m; r++) {
      this.voxelCells[r] = [];
      for (let c = 0; c < n; c++) {
        // 创建动态 Canvas 贴图 (256x256 高清 DPI)
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d')!;
        const texture = new THREE.CanvasTexture(canvas);
        texture.anisotropy = 4;

        // 顶面专属贴图材质
        const topMaterial = new THREE.MeshStandardMaterial({
          map: texture,
          roughness: 0.25,
          metalness: 0.05
        });

        // 侧面瓷白质感材质
        const sideMaterial = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          roughness: 0.3,
          metalness: 0.08
        });

        // 6 个面的材质阵列 [right, left, top, bottom, front, back]
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
          currentY: blockHeight / 2
        };
      }
    }

    // 3. 3D 边界河流 (仅在网格迷宫问题显示)
    if (isGridProblem) {
      const riverGeo = new THREE.BoxGeometry(baseW, 0.12, 0.45);
      const riverMat = new THREE.MeshPhysicalMaterial({
        color: 0x0284c7,
        roughness: 0.1,
        metalness: 0.1,
        transmission: 0.6,
        transparent: true,
        opacity: 0.85,
        ior: 1.333
      });
      this.riverMesh = new THREE.Mesh(riverGeo, riverMat);
      this.riverMesh.position.set((n - 1) * stride / 2, -0.04, m * stride - 0.15);
      this.riverMesh.receiveShadow = true;
      this.boardGroup.add(this.riverMesh);
    }

    // 4. 3D 探险家角色 (3D Billboard Explorer)
    if (isGridProblem) {
      this.adventurerMesh = this.createAdventurer3DGroup();
      this.boardGroup.add(this.adventurerMesh);
    }

    this.scene.add(this.boardGroup);
    this.resetCameraPosition();
  }

  /**
   * 创建 3D 探险家角色精灵模型
   */
  private createAdventurer3DGroup(): THREE.Group {
    const group = new THREE.Group();

    // 绘制高清小人 Canvas 贴图
    const charCanvas = document.createElement('canvas');
    charCanvas.width = 256;
    charCanvas.height = 256;
    const ctx = charCanvas.getContext('2d')!;

    // 绘制探险家 SVG/矢量风格图形
    ctx.clearRect(0, 0, 256, 256);
    
    // 帽子
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.ellipse(128, 70, 75, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#92400e';
    ctx.beginPath();
    ctx.arc(128, 62, 35, Math.PI, 0);
    ctx.fill();
    // 脸部
    ctx.fillStyle = '#fed7aa';
    ctx.beginPath();
    ctx.arc(128, 95, 34, 0, Math.PI * 2);
    ctx.fill();
    // 眼睛与笑容
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(114, 90, 4, 0, Math.PI * 2);
    ctx.arc(142, 90, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#c2410c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(128, 100, 14, 0.2, Math.PI - 0.2);
    ctx.stroke();
    // 身体 (蓝色探险服)
    ctx.fillStyle = '#0284c7';
    ctx.beginPath();
    ctx.roundRect(100, 130, 56, 60, [10, 10, 4, 4]);
    ctx.fill();
    // 腰带与金扣
    ctx.fillStyle = '#78350f';
    ctx.fillRect(100, 155, 56, 12);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(120, 153, 16, 16);
    // 鞋子
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.roundRect(104, 192, 20, 16, 6);
    ctx.roundRect(132, 192, 20, 16, 6);
    ctx.fill();

    const charTex = new THREE.CanvasTexture(charCanvas);
    charTex.anisotropy = 4;

    const spriteMat = new THREE.SpriteMaterial({
      map: charTex,
      transparent: true
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(0.9, 0.9, 0.9);
    sprite.position.set(0, 0.65, 0);
    group.add(sprite);

    // 脚底接触阴影面
    const shadowGeo = new THREE.PlaneGeometry(0.6, 0.6);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x000000,
      transparent: true,
      opacity: 0.35,
      depthWrite: false
    });
    const shadowMesh = new THREE.Mesh(shadowGeo, shadowMat);
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    group.add(shadowMesh);

    return group;
  }

  /**
   * 绘制 3D 体素方块顶面 Canvas 纹理
   */
  private drawTileTopTexture(
    ctx: CanvasRenderingContext2D,
    r: number,
    c: number,
    val: number | null,
    status: 'cur' | 'done' | 'top' | 'left' | 'obstacle' | 'trail' | 'empty'
  ): void {
    ctx.clearRect(0, 0, 256, 256);

    // 背景底色与渐变
    let bgGrad = ctx.createLinearGradient(0, 0, 256, 256);
    let borderColor = '#cbd5e1';
    let coordColor = '#64748b';
    let valColor = '#0f172a';

    if (status === 'cur') {
      bgGrad.addColorStop(0, '#dbeafe');
      bgGrad.addColorStop(1, '#bfdbfe');
      borderColor = '#3b82f6';
      coordColor = '#1d4ed8';
      valColor = '#1e3a8a';
    } else if (status === 'top') {
      bgGrad.addColorStop(0, '#f3e8ff');
      bgGrad.addColorStop(1, '#e9d5ff');
      borderColor = '#c084fc';
      coordColor = '#7e22ce';
      valColor = '#581c87';
    } else if (status === 'left') {
      bgGrad.addColorStop(0, '#fef3c7');
      bgGrad.addColorStop(1, '#fde68a');
      borderColor = '#fbbf24';
      coordColor = '#b45309';
      valColor = '#78350f';
    } else if (status === 'done') {
      bgGrad.addColorStop(0, '#ffffff');
      bgGrad.addColorStop(1, '#f8fafc');
      borderColor = '#94a3b8';
      coordColor = '#64748b';
      valColor = '#0f172a';
    } else if (status === 'obstacle') {
      bgGrad.addColorStop(0, '#94a3b8');
      bgGrad.addColorStop(1, '#64748b');
      borderColor = '#475569';
      coordColor = '#e2e8f0';
      valColor = '#f8fafc';
    } else {
      bgGrad.addColorStop(0, '#ffffff');
      bgGrad.addColorStop(1, '#f8fafc');
      borderColor = '#e2e8f0';
      coordColor = '#94a3b8';
      valColor = '#94a3b8';
    }

    ctx.fillStyle = bgGrad;
    ctx.beginPath();
    ctx.roundRect(8, 8, 240, 240, 24);
    ctx.fill();

    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 8;
    ctx.stroke();

    // 坐标标注 (左上角)
    ctx.fillStyle = coordColor;
    ctx.font = 'bold 36px "JetBrains Mono", monospace';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`${r},${c}`, 28, 24);

    // 状态徽章 (右上角)
    if (status === 'cur') {
      ctx.fillStyle = '#2563eb';
      ctx.beginPath();
      ctx.roundRect(140, 20, 92, 40, 12);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('当前', 186, 40);
    } else if (status === 'top') {
      ctx.fillStyle = '#9333ea';
      ctx.beginPath();
      ctx.roundRect(140, 20, 92, 40, 12);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('↑上', 186, 40);
    } else if (status === 'left') {
      ctx.fillStyle = '#d97706';
      ctx.beginPath();
      ctx.roundRect(140, 20, 92, 40, 12);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('←左', 186, 40);
    }

    // 中心 DP 数值或障碍物图标
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    if (status === 'obstacle') {
      ctx.font = '72px sans-serif';
      ctx.fillText('🚧', 128, 145);
    } else {
      ctx.fillStyle = valColor;
      ctx.font = 'bold 84px "JetBrains Mono", sans-serif';
      const displayText = val !== null && val !== undefined ? String(val) : '-';
      ctx.fillText(displayText, 128, 145);
    }
  }

  /**
   * 响应演化步骤更新 3D 体素状态与动画
   */
  public updateStep(step: UniversalStep, options: GridRenderOptions): void {
    if (!this.boardGroup || this.voxelCells.length === 0) {
      this.buildBoard(options.m, options.n, options);
    }

    const { m, n } = options;
    const stride = 1.0 + 0.12;
    const blockBaseH = 0.32;

    const curI = step.i;
    const curJ = step.j;
    const topI = step.topI;
    const topJ = step.topJ;
    const leftI = step.leftI;
    const leftJ = step.leftJ;
    const gridData = step.grid || [];

    // 1. 更新所有体素地砖状态与顶面贴图
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
          targetY = blockBaseH / 2 + 0.15;
        } else if (isCur) {
          status = 'cur';
          targetY = blockBaseH / 2 + 0.35; // 当前活动格向上浮起
        } else if (isTop) {
          status = 'top';
          targetY = blockBaseH / 2 + 0.18;
        } else if (isLeft) {
          status = 'left';
          targetY = blockBaseH / 2 + 0.18;
        } else if (val !== null) {
          status = 'done';
          targetY = blockBaseH / 2;
        }

        cell.targetY = targetY;
        this.drawTileTopTexture(cell.topCtx, r, c, val, status);
        cell.topTexture.needsUpdate = true;
      }
    }

    // 2. 更新聚光点光源位置
    if (this.pointLight && curI !== undefined && curJ !== undefined && curI >= 0 && curJ >= 0) {
      this.pointLight.position.set(curJ * stride, 1.8, curI * stride);
      this.pointLight.intensity = 2.5;
    }

    // 3. 更新探险家小人跳跃目标
    if (this.adventurerMesh && curI !== undefined && curJ !== undefined && curI >= 0 && curJ >= 0) {
      const nextTarget = new THREE.Vector3(curJ * stride, blockBaseH / 2 + 0.35, curI * stride);
      if (this.charTargetPos.distanceTo(nextTarget) > 0.05) {
        this.charJumpStartPos.copy(this.charCurrentPos);
        this.charTargetPos.copy(nextTarget);
        this.charJumpProgress = 0.0;
      }
    }

    // 4. 重建 3D 空间弧形光管 (3D Bezier Transfer Tubes)
    this.buildTransferTubes(step, options);
  }

  /**
   * 构建 3D 空间状态转移贝塞尔弧线光管
   */
  private buildTransferTubes(step: UniversalStep, options: GridRenderOptions): void {
    if (!this.scene) return;
    const stride = 1.0 + 0.12;

    // 清理旧光管
    this.transferTubes.forEach(t => {
      this.scene?.remove(t);
      t.geometry.dispose();
      (t.material as THREE.Material).dispose();
    });
    this.transferTubes = [];

    const { m, n } = options;
    const curI = step.i;
    const curJ = step.j;
    if (curI === undefined || curJ === undefined || curI < 0 || curJ < 0) return;

    const curVec = new THREE.Vector3(curJ * stride, 0.75, curI * stride);

    const createTube = (fromI: number, fromJ: number, color: number) => {
      if (fromI < 0 || fromI >= m || fromJ < 0 || fromJ >= n) return;
      const fromVec = new THREE.Vector3(fromJ * stride, 0.55, fromI * stride);
      const midVec = new THREE.Vector3(
        (fromVec.x + curVec.x) / 2,
        Math.max(fromVec.y, curVec.y) + 0.6,
        (fromVec.z + curVec.z) / 2
      );

      const curve = new THREE.QuadraticBezierCurve3(fromVec, midVec, curVec);
      const tubeGeo = new THREE.TubeGeometry(curve, 32, 0.05, 12, false);
      const tubeMat = new THREE.MeshStandardMaterial({
        color,
        emissive: color,
        emissiveIntensity: 0.6,
        roughness: 0.2,
        metalness: 0.1
      });
      const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
      this.scene?.add(tubeMesh);
      this.transferTubes.push(tubeMesh);
    };

    if (step.topI !== undefined && step.topI >= 0 && step.topJ !== undefined && step.topJ >= 0) {
      createTube(step.topI, step.topJ, 0x9333ea); // 紫色上方依赖
    }
    if (step.leftI !== undefined && step.leftI >= 0 && step.leftJ !== undefined && step.leftJ >= 0) {
      createTube(step.leftI, step.leftJ, 0xd97706); // 金色左方依赖
    }
  }

  /**
   * 渲染循环帧动画
   */
  private startAnimationLoop(): void {
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);

      const delta = this.clock.getDelta();
      const time = this.clock.getElapsedTime();

      // 1. 方块平滑弹性升降插值
      for (let r = 0; r < this.voxelCells.length; r++) {
        for (let c = 0; c < this.voxelCells[r].length; c++) {
          const cell = this.voxelCells[r][c];
          cell.currentY += (cell.targetY - cell.currentY) * Math.min(delta * 12, 1);
          cell.mesh.position.y = cell.currentY;
        }
      }

      // 2. 探险家 3D 抛物线起跳与降落动画
      if (this.adventurerMesh) {
        if (this.charJumpProgress < 1.0) {
          this.charJumpProgress = Math.min(1.0, this.charJumpProgress + delta * 3.5);
          const p = this.charJumpProgress;
          // X-Z 水平平滑插值
          this.charCurrentPos.lerpVectors(this.charJumpStartPos, this.charTargetPos, p);
          // Y 轴抛物线弧度
          const arcY = Math.sin(p * Math.PI) * 0.75;
          this.adventurerMesh.position.copy(this.charCurrentPos);
          this.adventurerMesh.position.y += arcY;
        } else {
          this.charCurrentPos.copy(this.charTargetPos);
          this.adventurerMesh.position.copy(this.charTargetPos);
          // 待机呼吸微浮动
          this.adventurerMesh.position.y += Math.sin(time * 3) * 0.03;
        }
      }

      // 3. 边界河流动态水波微晃
      if (this.riverMesh) {
        this.riverMesh.position.y = -0.04 + Math.sin(time * 2.5) * 0.015;
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
