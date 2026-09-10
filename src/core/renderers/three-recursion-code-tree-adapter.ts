/**
 * 3D 递归调用代码切片树渲染适配器 (ThreeRecursionCodeTreeAdapter)
 * 核心设计：
 * 1. 空间代码切片 (3D Code Slices)：每次递归调用在 3D 空间实例化为一个带有真实代码投影的半透明科技面板
 * 2. 3D 拓扑分支激光管 (Neon Branching Laser Tubes)：父子递归调用通过带数据流向的三维曲线连接
 * 3. 活跃栈帧聚焦与发光辉光：当前执行的递归帧高亮显示，回溯返回时显示金色数据回传
 * 4. 完整的 OrbitControls 360° 空间拖拽旋转、滚轮缩放与视口自适应
 */

import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export interface CodeTreeNodeData {
  id: string;
  name: string; // 如 'f(0, 0)'
  depth: number;
  i: number;
  j: number;
  codeSnippet: string[];
  activeLineIdx: number; // 0-indexed
  varsText?: string;
  status: 'current' | 'active' | 'completed' | 'pruned' | 'pending';
  returnValue?: number | string;
  children?: CodeTreeNodeData[];
}

export interface Recursion3DSceneInstance {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  animationFrameId: number;
  destroy: () => void;
}

const activeScenesMap = new WeakMap<HTMLElement, Recursion3DSceneInstance>();

export class ThreeRecursionCodeTreeAdapter {
  /**
   * 将 2D 递归树或步骤帧数据转换为标准的 3D 代码切片分形树数据
   */
  public static extractCodeTreeFromStep(step: any): CodeTreeNodeData {
    const s1 = step.s1 || 'abcde';
    const s2 = step.s2 || 'ace';
    const activeI = typeof step.i === 'number' ? step.i : 0;
    const activeJ = typeof step.j === 'number' ? step.j : 0;

    const sampleSnippet = [
      `int f(int i, int j) {`,
      `  if (i < 0 || j < 0) return 0;`,
      `  if (s1[i] == s2[j]) {`,
      `    return 1 + f(i-1, j-1);`,
      `  }`,
      `  return max(f(i-1,j), f(i,j-1));`,
      `}`,
    ];

    // 如果 step 提供了真实递归树根节点，递归遍历生成
    if (step.treeRoot) {
      const convert = (node: any, depth: number = 0): CodeTreeNodeData => {
        const isCur = node.id === step.activeNodeId || (node.r === activeI && node.c === activeJ);
        let activeLine = 0;
        if (node.r < 0 || node.c < 0) activeLine = 1;
        else if (node.r < s1.length && node.c < s2.length && s1[node.r] === s2[node.c]) activeLine = 3;
        else activeLine = 5;

        return {
          id: node.id || `node-${Math.random()}`,
          name: node.val || `f(${node.r ?? 0}, ${node.c ?? 0})`,
          depth,
          i: node.r ?? 0,
          j: node.c ?? 0,
          codeSnippet: sampleSnippet,
          activeLineIdx: activeLine,
          varsText: `s1[${node.r ?? 0}]='${s1[node.r] ?? '∅'}', s2[${node.c ?? 0}]='${s2[node.c] ?? '∅'}'`,
          status: isCur ? 'current' : node.status === 'completed' ? 'completed' : 'active',
          returnValue: node.tag ? String(node.tag).replace('ret=', '') : undefined,
          children: (node.children || []).map((c: any) => convert(c, depth + 1)),
        };
      };

      return convert(step.treeRoot);
    }

    // 兜底：构建由当前执行上下文生成的 3D 拓扑结构
    return {
      id: 'root',
      name: `f(${activeI}, ${activeJ})`,
      depth: 0,
      i: activeI,
      j: activeJ,
      codeSnippet: sampleSnippet,
      activeLineIdx: 3,
      varsText: `i=${activeI}, j=${activeJ}`,
      status: 'current',
      children: [
        {
          id: 'child-1',
          name: `f(${Math.max(0, activeI - 1)}, ${Math.max(0, activeJ - 1)})`,
          depth: 1,
          i: Math.max(0, activeI - 1),
          j: Math.max(0, activeJ - 1),
          codeSnippet: sampleSnippet,
          activeLineIdx: 2,
          varsText: `i-1, j-1 对角匹配`,
          status: 'active',
        },
        {
          id: 'child-2',
          name: `f(${Math.max(0, activeI - 1)}, ${activeJ})`,
          depth: 1,
          i: Math.max(0, activeI - 1),
          j: activeJ,
          codeSnippet: sampleSnippet,
          activeLineIdx: 5,
          varsText: `i-1, j 向上分支`,
          status: 'pending',
        },
      ],
    };
  }

  /**
   * 将 3D 递归代码切片树渲染到指定 DOM 容器
   */
  public static render(container: HTMLElement, step: any): void {
    if (!container) return;

    // 清理旧场景实例
    const existing = activeScenesMap.get(container);
    if (existing) {
      existing.destroy();
      activeScenesMap.delete(container);
    }

    container.innerHTML = '';
    const width = container.clientWidth || 400;
    const height = container.clientHeight || 240;

    // 0. 构建外层容器与悬浮控制条
    const wrap = document.createElement('div');
    wrap.style.cssText =
      'position: relative; width: 100%; height: 100%; background: radial-gradient(circle at center, #0f172a 0%, #020617 100%); overflow: hidden; border-radius: 12px; user-select: none;';

    const canvasEl = document.createElement('canvas');
    canvasEl.style.cssText = 'width: 100%; height: 100%; display: block; outline: none;';
    wrap.appendChild(canvasEl);

    const toolbar = document.createElement('div');
    toolbar.style.cssText =
      'position: absolute; top: 8px; right: 8px; z-index: 10; display: flex; gap: 4px; background: rgba(15, 23, 42, 0.85); backdrop-filter: blur(8px); border: 1px solid rgba(56, 189, 248, 0.25); border-radius: 8px; padding: 2px 4px;';
    toolbar.innerHTML = `
      <button id="btn-3d-reset-cam" title="重置视角" style="background: transparent; border: none; color: #38bdf8; font-size: 10px; padding: 2px 6px; cursor: pointer; border-radius: 4px; font-weight: 700;">🔄 重置</button>
      <button id="btn-3d-top-view" title="俯视全局" style="background: transparent; border: none; color: #cbd5e1; font-size: 10px; padding: 2px 6px; cursor: pointer; border-radius: 4px;">📐 俯视</button>
      <button id="btn-3d-autorotate" title="旋转巡航" style="background: transparent; border: none; color: #cbd5e1; font-size: 10px; padding: 2px 6px; cursor: pointer; border-radius: 4px;">💫 巡航</button>
    `;
    wrap.appendChild(toolbar);

    const hintBadge = document.createElement('div');
    hintBadge.style.cssText =
      'position: absolute; bottom: 8px; left: 8px; z-index: 10; font-size: 10px; color: #94a3b8; background: rgba(15, 23, 42, 0.8); border: 1px solid #1e293b; border-radius: 6px; padding: 2px 8px; pointer-events: none;';
    hintBadge.innerHTML = '🧊 <b>3D 递归代码切片空间</b>: 鼠标左键拖拽旋转 · 滚轮缩放 · 右键平移';
    wrap.appendChild(hintBadge);

    container.appendChild(wrap);

    // 1. 初始化 Three.js 场景
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020617, 0.003);

    const camera = new THREE.PerspectiveCamera(45, width / Math.max(1, height), 0.1, 1000);
    camera.position.set(0, 40, 160);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasEl,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    const controls = new OrbitControls(camera, canvasEl);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxDistance = 400;
    controls.minDistance = 30;

    // 灯光体系
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    dirLight.position.set(60, 100, 80);
    scene.add(dirLight);

    const pointLight = new THREE.PointLight(0x6366f1, 1.5, 300);
    pointLight.position.set(0, 30, 40);
    scene.add(pointLight);

    // 2. 递归生成 3D 代码切片 Mesh 与 空间连线
    const treeData = this.extractCodeTreeFromStep(step);
    const nodePlanesGroup = new THREE.Group();
    const branchLinesGroup = new THREE.Group();
    scene.add(nodePlanesGroup);
    scene.add(branchLinesGroup);

    const planeWidth = 36;
    const planeHeight = 22;

    const buildTree3D = (
      node: CodeTreeNodeData,
      x: number,
      y: number,
      z: number,
      spreadX: number,
      spreadZ: number
    ) => {
      // 2.1 创建代码切片 Plane 纹理
      const canvasTex = this.createCodeSliceTexture(node);
      const mat = new THREE.MeshBasicMaterial({
        map: canvasTex,
        transparent: true,
        side: THREE.DoubleSide,
      });
      const geom = new THREE.PlaneGeometry(planeWidth, planeHeight);
      const mesh = new THREE.Mesh(geom, mat);
      mesh.position.set(x, y, z);
      mesh.lookAt(x, y, z + 10); // 面朝摄像机

      // 若为当前活跃节点，添加发光外边框
      if (node.status === 'current') {
        const borderGeom = new THREE.EdgesGeometry(geom);
        const borderMat = new THREE.LineBasicMaterial({ color: 0x38bdf8, linewidth: 2 });
        const borderMesh = new THREE.LineSegments(borderGeom, borderMat);
        mesh.add(borderMesh);
      }

      nodePlanesGroup.add(mesh);

      // 2.2 递归处理子节点并绘制发光激光连线
      const children = node.children || [];
      const numChildren = children.length;
      if (numChildren > 0) {
        const nextY = y - 38;
        const totalSpan = spreadX * (numChildren - 1);
        const startX = x - totalSpan / 2;

        children.forEach((child, idx) => {
          const childX = numChildren === 1 ? x : startX + idx * spreadX;
          const childZ = z + (idx % 2 === 0 ? spreadZ : -spreadZ);

          // 绘制 3D 贝塞尔光线曲线
          const curve = new THREE.CatmullRomCurve3([
            new THREE.Vector3(x, y - planeHeight / 2, z),
            new THREE.Vector3(x, (y + nextY) / 2, z),
            new THREE.Vector3(childX, (y + nextY) / 2, childZ),
            new THREE.Vector3(childX, nextY + planeHeight / 2, childZ),
          ]);

          const tubeGeom = new THREE.TubeGeometry(curve, 16, 0.4, 6, false);
          const tubeMat = new THREE.MeshBasicMaterial({
            color: node.status === 'current' ? 0x38bdf8 : 0x475569,
            transparent: true,
            opacity: 0.85,
          });
          const tubeMesh = new THREE.Mesh(tubeGeom, tubeMat);
          branchLinesGroup.add(tubeMesh);

          buildTree3D(child, childX, nextY, childZ, spreadX * 0.65, spreadZ * 0.75);
        });
      }
    };

    buildTree3D(treeData, 0, 35, 0, 50, 25);
    controls.target.set(0, 10, 0);

    // 3. 悬浮按钮交互
    let isAutoRotating = false;
    const btnReset = wrap.querySelector('#btn-3d-reset-cam') as HTMLButtonElement | null;
    const btnTop = wrap.querySelector('#btn-3d-top-view') as HTMLButtonElement | null;
    const btnAutoRotate = wrap.querySelector('#btn-3d-autorotate') as HTMLButtonElement | null;

    btnReset?.addEventListener('click', () => {
      camera.position.set(0, 40, 160);
      controls.target.set(0, 10, 0);
      controls.update();
    });

    btnTop?.addEventListener('click', () => {
      camera.position.set(0, 180, 0.1);
      controls.target.set(0, 0, 0);
      controls.update();
    });

    btnAutoRotate?.addEventListener('click', () => {
      isAutoRotating = !isAutoRotating;
      controls.autoRotate = isAutoRotating;
      controls.autoRotateSpeed = 2.0;
      btnAutoRotate.style.color = isAutoRotating ? '#38bdf8' : '#cbd5e1';
      btnAutoRotate.style.fontWeight = isAutoRotating ? '700' : '400';
    });

    // 4. 渲染动画循环
    let reqId = 0;
    const animate = () => {
      reqId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const instance: Recursion3DSceneInstance = {
      renderer,
      scene,
      camera,
      controls,
      animationFrameId: reqId,
      destroy: () => {
        cancelAnimationFrame(reqId);
        controls.dispose();
        renderer.dispose();
      },
    };

    activeScenesMap.set(container, instance);
  }

  /**
   * 将单层代码切片离屏渲染为高清晰度 Canvas 纹理
   */
  private static createCodeSliceTexture(node: CodeTreeNodeData): THREE.CanvasTexture {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 320;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return new THREE.CanvasTexture(canvas);
    }

    const isCur = node.status === 'current';

    // 1. 底板卡片背景 (深黑科技渐变 + 圆角)
    ctx.fillStyle = isCur ? 'rgba(15, 23, 42, 0.95)' : 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = isCur ? '#38bdf8' : '#334155';
    ctx.lineWidth = isCur ? 5 : 2;

    this.roundRect(ctx, 4, 4, 504, 312, 18);
    ctx.fill();
    ctx.stroke();

    // 2. 顶部状态栏
    ctx.fillStyle = isCur ? '#0284c7' : '#1e293b';
    this.roundRect(ctx, 4, 4, 504, 54, 18, true);
    ctx.fill();

    // 标题文本
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px "JetBrains Mono", Consolas, monospace';
    ctx.fillText(`⚡ ${node.name}`, 20, 36);

    // 深度徽章
    ctx.fillStyle = isCur ? '#38bdf8' : '#94a3b8';
    ctx.font = 'bold 18px "JetBrains Mono", monospace';
    ctx.fillText(`[Depth: ${node.depth}]`, 370, 36);

    // 3. 代码行列表渲染
    let lineY = 88;
    const snippet = node.codeSnippet || [];
    snippet.forEach((lineText, idx) => {
      const isLineActive = idx === node.activeLineIdx;

      if (isLineActive) {
        ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
        ctx.fillRect(8, lineY - 20, 496, 28);

        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 18px monospace';
        ctx.fillText('➔', 14, lineY);
      }

      // 行号
      ctx.fillStyle = isLineActive ? '#38bdf8' : '#64748b';
      ctx.font = '16px "JetBrains Mono", Consolas, monospace';
      ctx.fillText(String(idx + 1).padStart(2, ' '), 34, lineY);

      // 代码内容
      ctx.fillStyle = isLineActive ? '#ffffff' : '#cbd5e1';
      ctx.font = isLineActive ? 'bold 16px "JetBrains Mono", Consolas, monospace' : '16px "JetBrains Mono", Consolas, monospace';
      ctx.fillText(lineText, 70, lineY);

      lineY += 30;
    });

    // 4. 底部变量药丸栏
    if (node.varsText) {
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(4, 270, 504, 46);

      ctx.fillStyle = '#38bdf8';
      ctx.font = '15px "JetBrains Mono", monospace';
      ctx.fillText(`📍 状态: ${node.varsText}`, 18, 298);
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    return texture;
  }

  private static roundRect(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    w: number,
    h: number,
    r: number,
    topOnly = false
  ) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    if (topOnly) {
      ctx.lineTo(x + w, y + h);
      ctx.lineTo(x, y + h);
      ctx.lineTo(x, y + r);
    } else {
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
    }
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
  }
}
