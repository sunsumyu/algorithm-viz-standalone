import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { IVisualRenderer } from './visual-renderer';

export interface CodeStackFrameNode {
  id: string;
  depth: number;
  funcName: string;
  r: number;
  c: number;
  val: string;
  status: 'current' | 'done' | 'active' | 'base' | 'visiting' | 'pruned' | 'pending';
  edgeLabel?: string;
  tag?: string;
  vars?: Array<{ name: string; value: string; color?: string }>;
  activeLine?: number;
  children: CodeStackFrameNode[];
}

export interface RecursionStack3DData {
  rootNode?: CodeStackFrameNode | null;
  treeRoot?: any;
  activeNodeId?: string;
  currentCall?: string;
  i?: number;
  j?: number;
  s1?: string;
  s2?: string;
  vars?: Array<{ name: string; value: string }>;
  callStack?: Array<{ label: string; [key: string]: any }>;
}

interface FrameMeshObject {
  group: THREE.Group;
  node: CodeStackFrameNode;
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
  mesh: THREE.Mesh;
  outlineMesh: THREE.LineSegments;
  targetPos: THREE.Vector3;
  currentPos: THREE.Vector3;
  targetScale: THREE.Vector3;
}

interface LaserTubeObject {
  tubeMesh: THREE.Mesh;
  parentPos: THREE.Vector3;
  childPos: THREE.Vector3;
  pulseProgress: number;
  pulseMesh?: THREE.Mesh;
}

/**
 * 3D 递归代码层叠调用栈与调用树样板适配器 (ThreeRecursionStackAdapter)
 * 核心特性：
 * 1. 每一层递归函数调用渲染为一张悬浮于 3D 空间的玻璃拟态暗色代码决策微切片卡片；
 * 2. 自动聚焦与智能运镜 (Camera Auto-Focus & Tracking)：自动计算活跃节点坐标，无缝平滑缓动运镜；
 * 3. 活跃层物理 Z 轴前置 (+1.4) 与最高渲染优先级，彻底消除遮挡；
 * 4. 640x320 Retina 级超清矢量纹理与大字号排版，清晰易读；
 * 5. 拓扑树与层叠栈模式自由切换，支持 360° 旋转、全景复位与自动漫游。
 */
export class ThreeRecursionStackAdapter implements IVisualRenderer {
  public readonly id = 'three-recursion-stack-adapter';
  private static instance: ThreeRecursionStackAdapter | null = null;

  private container: HTMLElement | null = null;
  private renderer: THREE.WebGLRenderer | null = null;
  private scene: THREE.Scene | null = null;
  private camera: THREE.PerspectiveCamera | null = null;
  private controls: OrbitControls | null = null;
  private animFrameId: number | null = null;
  private resizeObserver: ResizeObserver | null = null;

  // 场景节点
  private rootGroup: THREE.Group | null = null;
  private frameMeshes: FrameMeshObject[] = [];
  private laserTubes: LaserTubeObject[] = [];
  private pointLight: THREE.PointLight | null = null;

  // 布局与视图模式: 'tree' (3D 递归代码树) | 'stack' (3D 阶梯层叠栈)
  private layoutMode: 'stack' | 'tree' = 'tree';
  private isAutoRotating: boolean = false;
  private isAutoTracking: boolean = true;
  private cameraDesiredTarget: THREE.Vector3 = new THREE.Vector3(0, 0, 0);
  private cameraDesiredPosition: THREE.Vector3 = new THREE.Vector3(0, 0.5, 5.2);
  private isCameraInitialized: boolean = false;
  private clock: THREE.Clock = new THREE.Clock();

  // 当前数据缓存
  private lastData: RecursionStack3DData | null = null;
  private previousBackground: string = '';

  public static getInstance(): ThreeRecursionStackAdapter {
    if (!ThreeRecursionStackAdapter.instance) {
      ThreeRecursionStackAdapter.instance = new ThreeRecursionStackAdapter();
    }
    return ThreeRecursionStackAdapter.instance;
  }

  public setLayoutMode(mode: 'stack' | 'tree'): void {
    this.layoutMode = mode;
    if (this.lastData) {
      this.updateScene(this.lastData);
    }
  }

  public getLayoutMode(): 'stack' | 'tree' {
    return this.layoutMode;
  }

  public toggleAutoRotate(): boolean {
    this.isAutoRotating = !this.isAutoRotating;
    if (this.controls) {
      this.controls.autoRotate = this.isAutoRotating;
      this.controls.autoRotateSpeed = 1.2;
    }
    return this.isAutoRotating;
  }

  public toggleAutoTracking(): boolean {
    this.isAutoTracking = !this.isAutoTracking;
    this.updateAutoFocusButtonState();
    return this.isAutoTracking;
  }

  public switchLayout(): 'stack' | 'tree' {
    this.layoutMode = this.layoutMode === 'tree' ? 'stack' : 'tree';
    if (this.lastData) {
      this.updateScene(this.lastData);
    }
    return this.layoutMode;
  }

  public resetCamera(): void {
    if (!this.camera || !this.controls) return;
    this.isAutoTracking = true;
    this.updateAutoFocusButtonState();
    if (this.lastData) {
      this.updateScene(this.lastData);
    }
  }

  public setOverviewCamera(): void {
    if (!this.camera || !this.controls) return;
    this.isAutoTracking = false;
    this.updateAutoFocusButtonState();
    this.cameraDesiredTarget.set(0, 0, 0);
    this.cameraDesiredPosition.set(0, 1.6, 7.5);
  }

  private updateAutoFocusButtonState(): void {
    if (!this.container) return;
    const btn = this.container.querySelector('#btn-stack-autofocus') as HTMLButtonElement | null;
    const label = this.container.querySelector('#label-autofocus') as HTMLElement | null;
    if (btn) {
      btn.style.background = this.isAutoTracking ? '#e0f2fe' : '#f8fafc';
      btn.style.color = this.isAutoTracking ? '#0284c7' : '#475569';
      btn.style.borderColor = this.isAutoTracking ? '#7dd3fc' : '#e2e8f0';
    }
    if (label) {
      label.textContent = this.isAutoTracking ? '追踪中' : '聚焦';
    }
  }

  /**
   * 挂载 WebGL 3D 视口到 DOM 容器
   */
  public mount(container: HTMLElement): void {
    const isCanvasInContainer =
      this.renderer &&
      this.renderer.domElement &&
      container.contains(this.renderer.domElement);

    if (this.container === container && isCanvasInContainer) {
      return;
    }
    this.dispose();

    this.previousBackground = (container && container.style && container.style.background) || '';
    this.container = container;
    this.container.innerHTML = '';
    if (this.container && this.container.style) {
      this.container.style.position = 'relative';
      this.container.style.overflow = 'hidden';
      this.container.style.background = 'radial-gradient(circle at 50% 30%, #f8fafc 0%, #f1f5f9 60%, #e2e8f0 100%)';
    }

    const width = container.clientWidth || 400;
    const height = container.clientHeight || 280;

    // Node / Vitest 环境安全回退
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return;
    }

    try {
      this.renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance',
      });
      this.renderer.setSize(width, height);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.container.appendChild(this.renderer.domElement);

      this.scene = new THREE.Scene();

      this.camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
      this.camera.position.set(0, 3.2, 4.8);

      this.controls = new OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.08;
      this.controls.target.set(0, 0, 0);
      this.controls.maxDistance = 45;
      this.controls.minDistance = 2.0;

      this.controls.addEventListener('start', () => {
        // 用户手动拖拽运镜时暂停自动跟踪，避免镜头对抗
        this.isAutoTracking = false;
        this.updateAutoFocusButtonState();
      });

      // 灯光系统 (赛博暗黑未来风格点光与环境光)
      const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
      this.scene.add(ambientLight);

      const dirLight = new THREE.DirectionalLight(0x93c5fd, 1.8);
      dirLight.position.set(10, 20, 15);
      this.scene.add(dirLight);

      this.pointLight = new THREE.PointLight(0x38bdf8, 2.5, 30);
      this.pointLight.position.set(0, 4, 6);
      this.scene.add(this.pointLight);

      this.rootGroup = new THREE.Group();
      this.scene.add(this.rootGroup);

      // 挂载悬浮工具栏
      this.mountFloatingControls(this.container);

      // 视口动态监听
      this.resizeObserver = new ResizeObserver(() => {
        if (!this.container || !this.renderer || !this.camera) return;
        const w = this.container.clientWidth || 400;
        const h = this.container.clientHeight || 280;
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(w, h);
      });
      this.resizeObserver.observe(this.container);

      // 启动渲染循环
      this.startRenderLoop();
    } catch (e) {
      console.warn('[ThreeRecursionStackAdapter] WebGL 初始化回退:', e);
    }
  }

  /**
   * 挂载 3D 浮动控制工具栏 (聚焦、拓扑树/层叠栈、全景、漫游)
   */
  private mountFloatingControls(container: HTMLElement): void {
    const bar = document.createElement('div');
    bar.className = 'three-stack-floating-bar';
    bar.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      display: flex;
      align-items: center;
      gap: 5px;
      background: rgba(255, 255, 255, 0.92);
      backdrop-filter: blur(10px);
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 3px 6px;
      z-index: 30;
      box-shadow: 0 4px 12px rgba(0,0,0,0.06);
      user-select: none;
    `;

    bar.innerHTML = `
      <button id="btn-stack-autofocus" title="智能自动聚焦当前活跃节点 (切步时平滑运镜)" style="
        background: #e0f2fe;
        border: 1px solid #7dd3fc;
        color: #0284c7;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 3px;
        transition: all 0.15s;
      ">
        <span>🎯</span>
        <span id="label-autofocus">追踪中</span>
      </button>

      <button id="btn-stack-mode-toggle" title="切换 3D 空间拓扑树 / 3D 阶梯层叠栈" style="
        background: #f1f5f9;
        border: 1px solid #cbd5e1;
        color: #334155;
        font-size: 10px;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 3px;
        transition: all 0.15s;
      ">
        <span>🌲</span>
        <span id="label-stack-mode">${this.layoutMode === 'tree' ? '拓扑树' : '层叠栈'}</span>
      </button>

      <button id="btn-stack-overview" title="全景视角 (查看全树拓扑)" style="
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        color: #475569;
        font-size: 10px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 2px;
        transition: all 0.15s;
      ">
        <span>🌐</span>
        <span>全景</span>
      </button>

      <button id="btn-stack-autorotate" title="开启/关闭 3D 自动环绕漫游" style="
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        color: #475569;
        font-size: 10px;
        font-weight: 600;
        padding: 2px 6px;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 2px;
        transition: all 0.15s;
      ">
        <span>💫</span>
        <span id="label-autorotate">漫游</span>
      </button>

      <div style="
        display: flex;
        align-items: center;
        gap: 4px;
        margin-left: 2px;
        padding-left: 5px;
        border-left: 1px solid #e2e8f0;
        font-size: 9.5px;
        color: #64748b;
      ">
        <span style="color: #0284c7;">🖱️ 拖拽旋转</span>
        <span style="opacity: 0.5;">|</span>
        <span style="color: #7c3aed;">滚轮缩放</span>
      </div>
    `;

    container.appendChild(bar);

    // 绑定事件
    const btnAutoFocus = bar.querySelector('#btn-stack-autofocus') as HTMLButtonElement | null;
    if (btnAutoFocus) {
      btnAutoFocus.onclick = (e) => {
        e.stopPropagation();
        this.toggleAutoTracking();
        if (this.isAutoTracking) {
          this.resetCamera();
        }
      };
    }

    const btnMode = bar.querySelector('#btn-stack-mode-toggle') as HTMLButtonElement | null;
    const labelMode = bar.querySelector('#label-stack-mode') as HTMLElement | null;
    if (btnMode) {
      btnMode.onclick = (e) => {
        e.stopPropagation();
        this.setLayoutMode(this.layoutMode === 'tree' ? 'stack' : 'tree');
        if (labelMode) {
          labelMode.textContent = this.layoutMode === 'tree' ? '拓扑树' : '层叠栈';
        }
        this.resetCamera();
      };
    }

    const btnOverview = bar.querySelector('#btn-stack-overview') as HTMLButtonElement | null;
    if (btnOverview) {
      btnOverview.onclick = (e) => {
        e.stopPropagation();
        this.setOverviewCamera();
      };
    }

    const btnRotate = bar.querySelector('#btn-stack-autorotate') as HTMLButtonElement | null;
    const labelRotate = bar.querySelector('#label-autorotate') as HTMLElement | null;
    if (btnRotate) {
      btnRotate.onclick = (e) => {
        e.stopPropagation();
        const active = this.toggleAutoRotate();
        if (labelRotate) {
          labelRotate.textContent = active ? '暂停' : '漫游';
        }
        btnRotate.style.background = active ? '#ede9fe' : '#f8fafc';
        btnRotate.style.color = active ? '#7c3aed' : '#475569';
        btnRotate.style.borderColor = active ? '#c4b5fd' : '#e2e8f0';
      };
    }
  }

  /**
   * 渲染 3D 递归代码栈
   */
  public render(container: HTMLElement, data: RecursionStack3DData): void {
    const isCanvasInContainer =
      this.renderer &&
      this.renderer.domElement &&
      container.contains(this.renderer.domElement);

    if (this.container !== container || !isCanvasInContainer) {
      this.mount(container);
    }
    this.lastData = data;
    this.updateScene(data);
  }

  /**
   * 契约适配：统一视觉适配器更新步骤
   */
  public updateStep(step: any, context?: any): void {
    if (this.container && step) {
      this.render(this.container, step);
    }
  }

  /**
   * 更新场景网格与连接光束
   */
  private updateScene(data: RecursionStack3DData): void {
    if (!this.rootGroup) return;

    // 清空现有网格
    while (this.rootGroup.children.length > 0) {
      const obj = this.rootGroup.children[0];
      this.rootGroup.remove(obj);
      if (obj instanceof THREE.Mesh) {
        obj.geometry?.dispose();
        if (Array.isArray(obj.material)) {
          obj.material.forEach((m) => m.dispose());
        } else {
          obj.material?.dispose();
        }
      }
    }

    this.frameMeshes.forEach((fm) => {
      fm.texture?.dispose();
      fm.mesh?.geometry?.dispose();
    });
    this.frameMeshes = [];
    this.laserTubes = [];

    // 从 treeRoot 提取或由 callStack 生成标准化调用栈节点
    const rootNode = this.normalizeTreeNodes(data);
    if (!rootNode) return;

    // 扁平化收集所有节点
    const allNodes: CodeStackFrameNode[] = [];
    const collectNodes = (node: CodeStackFrameNode) => {
      allNodes.push(node);
      (node.children || []).forEach(collectNodes);
    };
    collectNodes(rootNode);

    // 根据模式计算 3D 坐标
    if (this.layoutMode === 'stack') {
      this.computeStackPositions(rootNode);
    } else {
      this.computeTreePositions(rootNode);
    }

    // 构建各节点的 3D 代码卡片 Mesh 与光束连接
    allNodes.forEach((node) => {
      const frameMesh = this.createCodeFrameMesh(node, data);
      this.frameMeshes.push(frameMesh);
      this.rootGroup!.add(frameMesh.group);

      // 构建连向子节点的激光管道
      (node.children || []).forEach((child) => {
        const tubeObj = this.createLaserTube(node, child);
        this.laserTubes.push(tubeObj);
        this.rootGroup!.add(tubeObj.tubeMesh);
        if (tubeObj.pulseMesh) {
          this.rootGroup!.add(tubeObj.pulseMesh);
        }
      });
    });

    // 若首次初始化，立刻同步镜头，无需渐变过度
    if (!this.isCameraInitialized && this.camera && this.controls) {
      this.camera.position.copy(this.cameraDesiredPosition);
      this.controls.target.copy(this.cameraDesiredTarget);
      this.isCameraInitialized = true;
    }
  }

  /**
   * 计算【3D 阶梯层叠栈】模式下的空间坐标 (自底向上或自顶向下层叠)
   */
  private computeStackPositions(root: CodeStackFrameNode): void {
    // 收集当前活跃路径链条
    const activePath: CodeStackFrameNode[] = [];
    let cur: CodeStackFrameNode | null = root;
    while (cur) {
      activePath.push(cur);
      if (cur.children && cur.children.length > 0) {
        const next: CodeStackFrameNode | undefined =
          cur.children.find((c) => c.status === 'current' || c.status === 'active' || c.status === 'visiting') ||
          cur.children[cur.children.length - 1];
        cur = next ?? null;
      } else {
        cur = null;
      }
    }

    const total = activePath.length;
    activePath.forEach((node, idx) => {
      const yOffset = (idx - total / 2) * 1.8;
      const zOffset = (idx - total / 2) * 0.9;
      const xOffset = (idx - total / 2) * 0.35;
      (node as any)._pos = new THREE.Vector3(xOffset, yOffset, zOffset);
    });

    // 其它分支非活跃节点排列在侧翼浅色展示
    const setRemainingPos = (node: CodeStackFrameNode, parentPos: THREE.Vector3) => {
      if (!(node as any)._pos) {
        (node as any)._pos = new THREE.Vector3(
          parentPos.x + 3.4,
          parentPos.y - 0.8,
          parentPos.z - 1.2
        );
      }
      (node.children || []).forEach((c) => setRemainingPos(c, (node as any)._pos));
    };
    setRemainingPos(root, (root as any)._pos || new THREE.Vector3(0, 0, 0));

    const activeNode = activePath[activePath.length - 1] || root;
    if (activeNode && (activeNode as any)._pos) {
      const aPos = (activeNode as any)._pos as THREE.Vector3;
      this.cameraDesiredTarget.set(aPos.x, aPos.y, aPos.z);
      this.cameraDesiredPosition.set(aPos.x + 0.5, aPos.y + 3.2, aPos.z + 4.2);
    }
  }

  /**
   * 计算【3D 递归代码树】模式下的空间坐标 (立体等轴阶梯树：优化的层级落差与台阶透视，前排不挡后排)
   */
  private computeTreePositions(root: CodeStackFrameNode): void {
    const levelHeight = 1.75;
    const levelZDepth = 2.1;
    const leafGap = 2.4;

    const measureWidth = (n: CodeStackFrameNode): number => {
      if (!n.children || n.children.length === 0) return leafGap;
      const sum = n.children.reduce((acc, c) => acc + measureWidth(c), 0);
      return Math.max(leafGap, sum);
    };

    const getMaxDepth = (n: CodeStackFrameNode): number => {
      if (!n.children || n.children.length === 0) return 1;
      return 1 + Math.max(...n.children.map(getMaxDepth));
    };

    const totalWidth = measureWidth(root);
    const maxDepth = getMaxDepth(root);

    const assignPos = (
      n: CodeStackFrameNode,
      depth: number,
      leftX: number,
      parentZ = 0,
      childIdx = 0,
      siblingCount = 1
    ) => {
      const width = measureWidth(n);
      const x = leftX + width / 2;
      const y = (maxDepth * levelHeight) / 2 - depth * levelHeight;

      // 沿 Z 轴随着递归层级加深向镜头阶梯式递进 (+levelZDepth)
      let z = -((maxDepth * levelZDepth) / 2) + depth * levelZDepth;
      if (siblingCount > 1) {
        // 多分支在 Z 轴上呈立体扇面纵深拉开，消灭平面共线重叠遮挡
        const zOffset = (childIdx - (siblingCount - 1) / 2) * 1.3;
        z += zOffset;
      }
      (n as any)._pos = new THREE.Vector3(x, y, z);

      let curL = leftX;
      const children = n.children || [];
      children.forEach((c, idx) => {
        const cWidth = measureWidth(c);
        assignPos(c, depth + 1, curL, z, idx, children.length);
        curL += cWidth;
      });
    };

    assignPos(root, 0, -totalWidth / 2, 0, 0, 1);

    // 找到当前活跃节点，适度在 Z 轴前浮 (+0.9)，立体凸显且不贴脸切边
    let activeNode: CodeStackFrameNode | null = null;
    const findActive = (n: CodeStackFrameNode) => {
      if (
        n.status === 'current' ||
        n.status === 'active' ||
        (this.lastData?.activeNodeId && n.id === this.lastData.activeNodeId)
      ) {
        activeNode = n;
      }
      (n.children || []).forEach(findActive);
    };
    findActive(root);
    if (!activeNode) activeNode = root;

    if (activeNode && (activeNode as any)._pos) {
      // 活跃节点在 Z 轴优雅前浮 +0.9
      (activeNode as any)._pos.z += 0.9;

      const aPos = (activeNode as any)._pos as THREE.Vector3;
      // 镜头焦点对准活跃节点中心偏上，确保卡片完整在视区中央
      this.cameraDesiredTarget.set(aPos.x, aPos.y + 0.1, aPos.z);
      // 适中拉远等轴机位：视距舒适，全览阶梯纵深，下部文字完整不被底框截断
      this.cameraDesiredPosition.set(aPos.x + 0.6, aPos.y + 2.2, aPos.z + 5.0);
    }
  }

  /**
   * 创建单张 3D 拟态暗色代码决策微切片卡片 Mesh
   */
  private createCodeFrameMesh(
    node: CodeStackFrameNode,
    data: RecursionStack3DData
  ): FrameMeshObject {
    const group = new THREE.Group();
    const pos = (node as any)._pos || new THREE.Vector3(0, 0, 0);
    group.position.copy(pos);

    // 1. 动态生成 2D 高清 Canvas 纹理 (640x320 Retina 级超清清晰度)
    let canvas: HTMLCanvasElement;
    let ctx: CanvasRenderingContext2D;
    try {
      canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 320;
      ctx = canvas.getContext('2d')!;
      this.drawCodeFrameTexture(ctx, node, data);
    } catch {
      canvas = { width: 640, height: 320 } as any;
      ctx = {} as any;
    }

    let texture: THREE.CanvasTexture;
    try {
      texture = new THREE.CanvasTexture(canvas);
      texture.generateMipmaps = true;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      if (this.renderer) {
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
      }
    } catch {
      texture = {} as any;
    }

    // 2. 3D 黄金比例切片几何体 (宽 3.0, 高 1.5, 厚 0.04)
    const cardGeo = new THREE.BoxGeometry(3.0, 1.5, 0.04);
    // 物理卡片倾斜倾角：~ -35° 经典立体阶梯微俯角，层层台阶清晰可见，前排不遮挡后排，文字清晰舒展
    group.rotation.x = -Math.PI / 5.2;

    const isActive = node.status === 'current' || node.status === 'active';
    const isBase = node.status === 'base';
    const isDone = node.status === 'done';

    // 材质：正面为超清代码纹理，活跃节点 100% 不透明，非活跃节点 55% 晶体微透减少遮挡干扰
    const frontMat = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.15,
      metalness: 0.15,
      transparent: true,
      opacity: isActive ? 1.0 : 0.55,
      depthWrite: true,
      depthTest: true,
    });

    const sideMat = new THREE.MeshStandardMaterial({
      color: isActive ? 0x38bdf8 : isDone ? 0x10b981 : 0x1e293b,
      metalness: 0.8,
      roughness: 0.2,
      transparent: true,
      opacity: isActive ? 0.95 : 0.45,
      depthWrite: true,
      depthTest: true,
    });

    const materials = [
      sideMat, // right
      sideMat, // left
      sideMat, // top
      sideMat, // bottom
      frontMat, // front
      sideMat, // back
    ];

    const mesh = new THREE.Mesh(cardGeo, materials);
    // 活跃卡片赋予最高渲染层级
    mesh.renderOrder = isActive ? 999 : 10;
    group.add(mesh);

    // 3. 边框发光线框
    const edgesGeo = new THREE.EdgesGeometry(cardGeo);
    const outlineColor = isActive
      ? 0x38bdf8
      : isBase
      ? 0xf59e0b
      : isDone
      ? 0x10b981
      : 0x475569;
    const outlineMat = new THREE.LineBasicMaterial({
      color: outlineColor,
      linewidth: isActive ? 3.0 : 1.2,
      transparent: true,
      opacity: isActive ? 1.0 : 0.55,
      depthTest: true,
    });
    const outlineMesh = new THREE.LineSegments(edgesGeo, outlineMat);
    outlineMesh.renderOrder = isActive ? 1000 : 11;
    group.add(outlineMesh);

    // 4. 活跃节点顶部加挂发光标记光环
    if (isActive) {
      const ringGeo = new THREE.RingGeometry(0.14, 0.22, 20);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x0284c7,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.95,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.set(0, 0.92, 0.05);
      ringMesh.renderOrder = 1001;
      group.add(ringMesh);
    }

    if (isActive) {
      group.scale.set(1.08, 1.08, 1.08);
    }

    return {
      group,
      node,
      canvas,
      ctx,
      texture,
      mesh,
      outlineMesh,
      targetPos: pos,
      currentPos: pos.clone(),
      targetScale: isActive ? new THREE.Vector3(1.08, 1.08, 1.08) : new THREE.Vector3(1, 1, 1),
    };
  }

  /**
   * 绘制 3D 决策微切片卡片的 2D Canvas 纹理 (640x320 高清矢量级渲染，字号大而清晰)
   */
  private drawCodeFrameTexture(
    ctx: CanvasRenderingContext2D,
    node: CodeStackFrameNode,
    data: RecursionStack3DData
  ): void {
    if (!ctx || !ctx.fillRect) return;
    const w = 640;
    const h = 320;

    const isActive = node.status === 'current' || node.status === 'active';
    const isBase = node.status === 'base';
    const isDone = node.status === 'done';

    const s1 = data.s1 || 'abcde';
    const s2 = data.s2 || 'ace';
    const r = node.r;
    const c = node.c;
    const isOutOfBounds = r >= s1.length || c >= s2.length;
    const isCharMatch = !isOutOfBounds && s1[r] === s2[c];

    // 1. 卡片底色 (浅色高质感晶体微渐变)
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    if (isActive) {
      bgGrad.addColorStop(0, '#ffffff');
      bgGrad.addColorStop(1, '#f8fafc');
    } else {
      bgGrad.addColorStop(0, '#f8fafc');
      bgGrad.addColorStop(1, '#f1f5f9');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // 外框线
    ctx.strokeStyle = isActive ? '#0284c7' : '#cbd5e1';
    ctx.lineWidth = isActive ? 3.5 : 1.5;
    ctx.strokeRect(0, 0, w, h);

    // 2. 顶栏 Header (Mac 控制点 + 函数签名)
    ctx.fillStyle = isActive ? '#f0f9ff' : '#f1f5f9';
    ctx.fillRect(0, 0, w, 52);

    // 三色点
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(24, 26, 6.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(44, 26, 6.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(64, 26, 6.5, 0, Math.PI * 2);
    ctx.fill();

    // 标题：f(i, j)
    ctx.font = 'bold 23px "JetBrains Mono", Consolas, monospace';
    ctx.fillStyle = isActive ? '#0369a1' : '#1e293b';
    ctx.fillText(`${node.funcName || `f(${node.r}, ${node.c})`}`, 90, 34);

    // 深度/状态胶囊 Badge
    let statusText = `深度 #${node.depth || 1}`;
    let badgeColor = '#475569';
    let badgeBg = '#e2e8f0';

    if (isActive) {
      statusText = '⚡ 执行中';
      badgeColor = '#0284c7';
      badgeBg = '#e0f2fe';
    } else if (isOutOfBounds || isBase) {
      statusText = '🎯 触底 return 0';
      badgeColor = '#b45309';
      badgeBg = '#fef3c7';
    } else if (isCharMatch) {
      statusText = '✨ 字符匹配 +1';
      badgeColor = '#15803d';
      badgeBg = '#dcfce7';
    } else if (isDone) {
      statusText = `✓ 返回: ${node.val || '0'}`;
      badgeColor = '#15803d';
      badgeBg = '#dcfce7';
    }

    ctx.font = 'bold 15px "JetBrains Mono", monospace';
    const badgeW = ctx.measureText(statusText).width + 18;
    ctx.fillStyle = badgeBg;
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(w - badgeW - 16, 12, badgeW, 28, 6);
    } else {
      ctx.rect(w - badgeW - 16, 12, badgeW, 28);
    }
    ctx.fill();

    ctx.fillStyle = badgeColor;
    ctx.fillText(statusText, w - badgeW - 7, 31);

    // 3. 核心决策微切片区域 (字号放大，清晰高对比)
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    if (ctx.roundRect) {
      ctx.roundRect(16, 64, w - 32, 182, 8);
    } else {
      ctx.rect(16, 64, w - 32, 182);
    }
    ctx.fill();
    ctx.strokeStyle = isActive ? '#7dd3fc' : '#e2e8f0';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // 判定条件与动作提取
    let conditionText = '';
    let conditionColor = '#334155';
    let actionText = '';
    let actionColor = '#0369a1';
    let resultText = '';

    if (isOutOfBounds) {
      conditionText = `📌 条件: i>=${s1.length} || j>=${s2.length} (到达串尾)`;
      conditionColor = '#d97706';
      actionText = `▶ return 0;`;
      actionColor = '#b45309';
      resultText = `触底回溯，返回基础解 0`;
    } else if (isCharMatch) {
      conditionText = `📌 比较: s1[${r}]('${s1[r]}') == s2[${c}]('${s2[c]}') 【匹配成功】`;
      conditionColor = '#15803d';
      actionText = `▶ return 1 + f(${r + 1}, ${c + 1});`;
      actionColor = '#15803d';
      resultText = `累加公共字符长度 1，向对角推进`;
    } else {
      conditionText = `📌 比较: s1[${r}]('${s1[r]}') ≠ s2[${c}]('${s2[c]}') 【不匹配】`;
      conditionColor = '#e11d48';
      actionText = `▶ return max(f(${r + 1}, ${c}), f(${r}, ${c + 1}));`;
      actionColor = '#0284c7';
      resultText = `分支探索：向下删s1 或 向右删s2`;
    }

    // 绘制判定行
    ctx.font = 'bold 17px "JetBrains Mono", monospace';
    ctx.fillStyle = conditionColor;
    ctx.fillText(conditionText, 32, 102);

    // 绘制高亮动作行
    ctx.fillStyle = isActive ? '#eff6ff' : '#f8fafc';
    ctx.fillRect(28, 120, w - 56, 54);
    ctx.strokeStyle = isActive ? '#60a5fa' : '#cbd5e1';
    ctx.lineWidth = 1.2;
    ctx.strokeRect(28, 120, w - 56, 54);

    ctx.font = 'bold 20px "JetBrains Mono", Consolas, monospace';
    ctx.fillStyle = actionColor;
    ctx.fillText(actionText, 42, 155);

    // 绘制语义说明
    ctx.font = 'bold 14.5px "JetBrains Mono", sans-serif';
    ctx.fillStyle = '#64748b';
    ctx.fillText(`💡 语义: ${resultText}`, 32, 215);

    // 4. 底栏局部变量监视 Bar (Variables Watch Bar)
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(0, h - 50, w, 50);
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(0, h - 50);
    ctx.lineTo(w, h - 50);
    ctx.stroke();

    const varsList = [
      { name: 'i', val: String(r), color: '#0284c7' },
      { name: 'j', val: String(c), color: '#0284c7' },
      { name: 's1[i]', val: r < s1.length ? `"${s1[r]}"` : 'Ø', color: '#15803d' },
      { name: 's2[j]', val: c < s2.length ? `"${s2[c]}"` : 'Ø', color: '#15803d' },
      { name: 'ans', val: node.val || '?', color: '#d97706' },
    ];

    let chipX = 20;
    ctx.font = 'bold 14.5px "JetBrains Mono", monospace';

    varsList.forEach((v) => {
      const text = `${v.name}:${v.val}`;
      const chipW = ctx.measureText(text).width + 16;

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(chipX, h - 40, chipW, 28, 5);
      } else {
        ctx.rect(chipX, h - 40, chipW, 28);
      }
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.fillStyle = v.color;
      ctx.fillText(text, chipX + 8, h - 22);

      chipX += chipW + 10;
    });
  }

  /**
   * 创建父子递归调用之间的发光激光管道连接 (Laser Tube)
   */
  private createLaserTube(
    parent: CodeStackFrameNode,
    child: CodeStackFrameNode
  ): LaserTubeObject {
    const parentPos = (parent as any)._pos as THREE.Vector3;
    const childPos = (child as any)._pos as THREE.Vector3;

    const theta = -Math.PI / 5.2;
    const halfH = 0.75;
    const dy = halfH * Math.cos(theta);
    const dz = halfH * Math.sin(theta);

    const pBottom = new THREE.Vector3(parentPos.x, parentPos.y - dy, parentPos.z - dz - 0.04);
    const cTop = new THREE.Vector3(childPos.x, childPos.y + dy, childPos.z + dz - 0.04);
    const midPoint = new THREE.Vector3(
      (pBottom.x + cTop.x) / 2,
      (pBottom.y + cTop.y) / 2 + 0.15,
      (pBottom.z + cTop.z) / 2
    );

    const curve = new THREE.CatmullRomCurve3([pBottom, midPoint, cTop]);

    const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.024, 8, false);
    const isChildActive = child.status === 'current' || child.status === 'active';
    const tubeColor = isChildActive ? 0x38bdf8 : 0x6366f1;

    const tubeMat = new THREE.MeshStandardMaterial({
      color: tubeColor,
      emissive: tubeColor,
      emissiveIntensity: isChildActive ? 0.9 : 0.35,
      transparent: true,
      opacity: 0.8,
      roughness: 0.3,
      depthTest: true,
    });

    const tubeMesh = new THREE.Mesh(tubeGeo, tubeMat);
    tubeMesh.renderOrder = 5;

    const pulseGeo = new THREE.SphereGeometry(0.055, 12, 12);
    const pulseMat = new THREE.MeshBasicMaterial({
      color: isChildActive ? 0x38bdf8 : 0xa855f7,
    });
    const pulseMesh = new THREE.Mesh(pulseGeo, pulseMat);
    pulseMesh.position.copy(parentPos);
    pulseMesh.renderOrder = 6;

    return {
      tubeMesh,
      parentPos,
      childPos,
      pulseProgress: 0,
      pulseMesh,
    };
  }

  /**
   * 将原始算法步骤数据规范化为标准化的 CodeStackFrameNode 树
   */
  private normalizeTreeNodes(data: RecursionStack3DData): CodeStackFrameNode | null {
    if (data.rootNode) return data.rootNode;

    const origRoot = (data as any).treeRoot;
    if (origRoot) {
      const convert = (node: any, depth = 1): CodeStackFrameNode => {
        const isCur = node.id === data.activeNodeId || node.status === 'current';
        return {
          id: node.id || `node-${depth}`,
          depth,
          funcName: `f(${node.r ?? 0}, ${node.c ?? 0})`,
          r: node.r ?? 0,
          c: node.c ?? 0,
          val: node.val || '?',
          status: isCur ? 'current' : node.status || 'visiting',
          edgeLabel: node.edgeLabel,
          tag: node.tag,
          children: (node.children || []).map((c: any) => convert(c, depth + 1)),
        };
      };
      return convert(origRoot, 1);
    }

    const stack = data.callStack || [{ label: `f(${data.i ?? 0}, ${data.j ?? 0})` }];
    let root: CodeStackFrameNode = {
      id: 'frame-0',
      depth: 1,
      funcName: stack[0]?.label || 'f(0, 0)',
      r: data.i ?? 0,
      c: data.j ?? 0,
      val: '?',
      status: stack.length === 1 ? 'current' : 'visiting',
      children: [],
    };

    let cur = root;
    for (let i = 1; i < stack.length; i++) {
      const child: CodeStackFrameNode = {
        id: `frame-${i}`,
        depth: i + 1,
        funcName: stack[i].label,
        r: (data.i ?? 0) + i,
        c: (data.j ?? 0) + i,
        val: '?',
        status: i === stack.length - 1 ? 'current' : 'visiting',
        children: [],
      };
      cur.children.push(child);
      cur = child;
    }

    return root;
  }

  /**
   * 启动帧渲染、自动平滑运镜插值与光效粒子循环
   */
  private startRenderLoop(): void {
    const animate = () => {
      this.animFrameId = requestAnimationFrame(animate);

      const delta = this.clock.getDelta();
      const time = this.clock.getElapsedTime();

      // 核心平滑运镜：当开启智能自动追踪时，平滑插值镜头位置与焦点
      if (this.isAutoTracking && this.camera && this.controls) {
        this.controls.target.lerp(this.cameraDesiredTarget, 0.08);
        this.camera.position.lerp(this.cameraDesiredPosition, 0.08);
      }

      if (this.controls) {
        this.controls.update();
      }

      if (this.pointLight) {
        this.pointLight.position.x = Math.sin(time * 0.8) * 4;
        this.pointLight.position.z = 6 + Math.cos(time * 0.8) * 2;
      }

      this.laserTubes.forEach((lt) => {
        if (lt.pulseMesh) {
          lt.pulseProgress = (lt.pulseProgress + delta * 0.6) % 1.0;
          const x = THREE.MathUtils.lerp(lt.parentPos.x, lt.childPos.x, lt.pulseProgress);
          const y = THREE.MathUtils.lerp(lt.parentPos.y - 0.8, lt.childPos.y + 0.8, lt.pulseProgress);
          const z = THREE.MathUtils.lerp(lt.parentPos.z - 0.06, lt.childPos.z - 0.06, lt.pulseProgress);
          lt.pulseMesh.position.set(x, y, z);
        }
      });

      this.frameMeshes.forEach((fm) => {
        if (fm.node.status === 'current' || fm.node.status === 'active') {
          const hoverY = Math.sin(time * 3.0) * 0.05;
          fm.group.position.y = fm.targetPos.y + hoverY;
        }
      });

      if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
      }
    };

    animate();
  }

  /**
   * 销毁场景并释放显存
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
    if (this.renderer) {
      this.renderer.dispose();
      if (this.renderer.domElement && this.renderer.domElement.parentElement) {
        this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
      }
      this.renderer = null;
    }
    this.scene = null;
    this.camera = null;
    if (this.container) {
      if (this.container.style) {
        this.container.style.background = this.previousBackground || '';
      }
      this.container = null;
    }
    this.frameMeshes = [];
    this.laserTubes = [];
    this.isCameraInitialized = false;
  }
}
