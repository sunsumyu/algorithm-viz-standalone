import * as THREE from 'three';
import {
  createCodeFrameMesh,
  createLaserTube,
  normalizeTreeNodes,
} from './three-recursion-stack-mesh';
import type { FrameMeshObject, LaserTubeObject } from './three-recursion-stack-mesh';
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
  private resizeRafId: number | null = null;
  private lastWidth = 0;
  private lastHeight = 0;

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
      this.renderer.setSize(width, height, false);
      this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      this.renderer.outputColorSpace = THREE.SRGBColorSpace;
      this.renderer.domElement.style.outline = 'none';
      this.renderer.domElement.style.width = '100%';
      this.renderer.domElement.style.height = '100%';
      this.renderer.domElement.className = 'w-full h-full block cursor-grab active:cursor-grabbing';

      this.lastWidth = width;
      this.lastHeight = height;

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

      // 视口动态监听 (防抖 + 脏检查 + 阻止内联像素污染)
      this.resizeObserver = new ResizeObserver(() => {
        if (!this.container || !this.renderer || !this.camera) return;
        if (this.resizeRafId !== null) {
          cancelAnimationFrame(this.resizeRafId);
        }
        this.resizeRafId = requestAnimationFrame(() => {
          this.resizeRafId = null;
          if (!this.container || !this.renderer || !this.camera) return;
          const w = Math.floor(this.container.clientWidth) || 400;
          const h = Math.floor(this.container.clientHeight) || 280;
          if (Math.abs(w - this.lastWidth) < 2 && Math.abs(h - this.lastHeight) < 2) {
            return;
          }
          this.lastWidth = w;
          this.lastHeight = h;
          this.camera.aspect = w / h;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(w, h, false);
        });
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
    const rootNode = normalizeTreeNodes(data);
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
      const frameMesh = createCodeFrameMesh(node, data, this.renderer);
      this.frameMeshes.push(frameMesh);
      this.rootGroup!.add(frameMesh.group);

      // 构建连向子节点的激光管道
      (node.children || []).forEach((child) => {
        const tubeObj = createLaserTube(node, child);
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
      if (typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(this.animFrameId);
      }
      this.animFrameId = null;
    }
    if (this.resizeRafId !== null) {
      if (typeof cancelAnimationFrame === 'function') {
        cancelAnimationFrame(this.resizeRafId);
      }
      this.resizeRafId = null;
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
