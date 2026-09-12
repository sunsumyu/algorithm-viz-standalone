/**
 * 3D 递归调用栈 — 网格与纹理构建模块 (ThreeRecursionStackMesh)
 *
 * 从 three-recursion-stack-adapter 拆出的纯构建层（SRP）：
 * 代码帧玻璃卡片网格 / 640x320 Canvas 纹理绘制 / 激光管连线 / 树数据归一化。
 * 全部为无实例状态的纯函数 —— 场景生命周期与运镜见 three-recursion-stack-adapter。
 */

import * as THREE from 'three';
import type { CodeStackFrameNode, RecursionStack3DData } from './three-recursion-stack-adapter';

export interface FrameMeshObject {
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

export interface LaserTubeObject {
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

export function normalizeTreeNodes(data: RecursionStack3DData): CodeStackFrameNode | null {
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

export function createCodeFrameMesh(
  node: CodeStackFrameNode,
  data: RecursionStack3DData,
  renderer: THREE.WebGLRenderer | null
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
    drawCodeFrameTexture(ctx, node, data);
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
    if (renderer) {
      texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
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

export function drawCodeFrameTexture(
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

export function createLaserTube(
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
