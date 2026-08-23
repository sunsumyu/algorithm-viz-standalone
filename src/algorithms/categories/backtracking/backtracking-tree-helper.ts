/**
 * 回溯决策树共享模块
 * 提供 TreeNode 接口、布局算法、SVG 渲染函数
 * 供所有回溯算法可视化器复用
 */

import { HighlightTarget } from '../../../core/code-panel';
import type { StepVar } from '../../../core/interfaces';

/* ── Tree node ────────────────────────────────────────────── */
export interface BacktrackTreeNode {
  id: string;
  value: string;
  path: (number | string)[];
  children: BacktrackTreeNode[];
  isLeaf: boolean;
  isPruned: boolean;
  isDirectPrune?: boolean;
  parentId: string | null;
  depth: number;
  /** layout coords, computed after layout */
  x?: number;
  y?: number;
}

/* ── Step data shared across all backtrack visualizers ────── */
export interface BacktrackTreeStep {
  nodes: BacktrackTreeNode[];
  currentNodeId: string;
  visitedNodeIds: string[];
  foundPathIds: string[];
  prunedNodeIds: string[];
  path: (number | string)[];
  message: string;
  codeLine: HighlightTarget;
  /** Extra stats to display (key-value pairs) */
  stats?: Record<string, string | number>;
  /** 变量快照，用于变量监视面板 */
  vars?: StepVar[];
}

/* ── Layout constants ─────────────────────────────────────── */
export const LEVEL_HEIGHT = 110;
export const NODE_RADIUS = 20;
export const HORIZONTAL_GAP = 75;

/* ── Flatten tree to list ─────────────────────────────────── */
export function flattenTree(root: BacktrackTreeNode): BacktrackTreeNode[] {
  const list: BacktrackTreeNode[] = [];
  function walk(n: BacktrackTreeNode) {
    list.push(n);
    n.children.forEach(walk);
  }
  walk(root);
  return list;
}

/* ── Layout: compute x,y coordinates ──────────────────────── */
export function layoutTree(
  root: BacktrackTreeNode,
  options?: { horizontalGap?: number; levelHeight?: number }
): void {
  const gap = options?.horizontalGap ?? HORIZONTAL_GAP;
  const levelH = options?.levelHeight ?? LEVEL_HEIGHT;

  function assignWidth(n: BacktrackTreeNode): number {
    if (n.children.length === 0) {
      (n as BacktrackTreeNode & { _sw: number })._sw = gap;
      return gap;
    }
    let total = 0;
    n.children.forEach(c => { total += assignWidth(c); });
    total = Math.max(total, gap);
    (n as BacktrackTreeNode & { _sw: number })._sw = total;
    return total;
  }

  function position(n: BacktrackTreeNode, left: number): void {
    const sw = (n as BacktrackTreeNode & { _sw: number })._sw || gap;
    n.x = left + sw / 2;
    n.y = n.depth * levelH + 40;

    let cur = left;
    n.children.forEach(c => {
      position(c, cur);
      cur += (c as BacktrackTreeNode & { _sw: number })._sw || gap;
    });
  }

  assignWidth(root);
  position(root, 0);

  function cleanup(n: BacktrackTreeNode) {
    delete (n as BacktrackTreeNode & { _sw?: number })._sw;
    n.children.forEach(cleanup);
  }
  cleanup(root);
}

/* ── Check if nodeId is on the path from currentNodeId to root */
export function isNodeOnPath(
  nodeId: string,
  nodeMap: Map<string, BacktrackTreeNode>,
  currentNodeId: string
): boolean {
  if (nodeId === currentNodeId) return true;
  let cur: string | null = currentNodeId;
  while (cur) {
    if (cur === nodeId) return true;
    const p = nodeMap.get(cur);
    cur = p?.parentId ?? null;
  }
  return false;
}

/* ── Render SVG decision tree ─────────────────────────────── */
interface ViewportState {
  scale: number;
  tx: number;
  ty: number;
  userTouched: boolean;
}

const containerViewStates = new WeakMap<HTMLElement, ViewportState>();
const containerInitialized = new WeakSet<HTMLElement>();

export function getContainerViewState(container: HTMLElement): ViewportState {
  let st = containerViewStates.get(container);
  if (!st) {
    st = { scale: 1, tx: 0, ty: 0, userTouched: false };
    containerViewStates.set(container, st);
  }
  return st;
}

export interface RenderTreeOptions {
  container: HTMLElement;
  step: BacktrackTreeStep;
  /** CSS class prefix (default: 'cs') */
  cssPrefix?: string;
  /** Node label override (default: nd.value or '[]' for root) */
  nodeLabel?: (nd: BacktrackTreeNode) => string;
  /** Extra class for specific nodes */
  extraNodeClass?: (nd: BacktrackTreeNode, step: BacktrackTreeStep) => string;
  /** Whether a node counts as "found" for rendering. Override for non-leaf found nodes. */
  isFoundNode?: (nd: BacktrackTreeNode, step: BacktrackTreeStep) => boolean;
}

/* ── Auto-inject tree CSS once per prefix ─────────────────── */
const injectedPrefixes = new Set<string>();

/**
 * 确保指定 prefix 的决策树样式已注入 document（每个 prefix 只注入一次）。
 */
export function ensureBacktrackTreeCSS(prefix: string = 'cs'): void {
  if (injectedPrefixes.has(prefix)) return;
  injectedPrefixes.add(prefix);
  if (typeof document === 'undefined') return;
  const style = document.createElement('style');
  style.setAttribute('data-backtrack-tree-css', prefix);
  style.textContent = getBacktrackTreeCSS(prefix);
  document.head.appendChild(style);
}

export function renderBacktrackTree(options: RenderTreeOptions): void {
  const { container, step, cssPrefix = 'cs', nodeLabel, extraNodeClass, isFoundNode } = options;
  const { nodes, currentNodeId, visitedNodeIds, foundPathIds, prunedNodeIds } = step;

  ensureBacktrackTreeCSS(cssPrefix);

  if (!nodes || nodes.length === 0) return;

  const pfx = cssPrefix;
  const st = getContainerViewState(container);

  // Compute SVG viewBox with full padding bounds
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  nodes.forEach(nd => {
    const x = nd.x ?? 0;
    const y = nd.y ?? 0;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  });
  const padX = 60;
  const padY = 60;
  const vMinX = minX - NODE_RADIUS - padX;
  const vMinY = minY - NODE_RADIUS - padY;
  const vWidth = (maxX - minX) + (NODE_RADIUS + padX) * 2;
  const vHeight = (maxY - minY) + (NODE_RADIUS + padY) * 2;

  // Build lookup
  const nodeMap = new Map<string, BacktrackTreeNode>();
  nodes.forEach(nd => nodeMap.set(nd.id, nd));

  // Initialize interactive controls on container ONCE
  if (!containerInitialized.has(container)) {
    containerInitialized.add(container);
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    container.style.cursor = 'grab';
    container.setAttribute('tabindex', '0');

    // Create floating toolbar overlay
    const tb = document.createElement('div');
    tb.className = `${pfx}-tree-toolbar`;
    tb.innerHTML = `
      <button class="${pfx}-tb-btn" data-act="zoom-in" title="放大 (+)">➕</button>
      <button class="${pfx}-tb-btn" data-act="zoom-out" title="缩小 (-)">➖</button>
      <span class="${pfx}-tb-badge" id="${pfx}-zoom-val">100%</span>
      <button class="${pfx}-tb-btn" data-act="reset" title="重置视角 (0/R)">🎯 重置</button>
      <button class="${pfx}-tb-btn" data-act="focus" title="定位指针 (F)">📍 聚焦</button>
    `;
    container.appendChild(tb);

    // Tip overlay
    const tip = document.createElement('div');
    tip.className = `${pfx}-keyboard-tip`;
    tip.textContent = '滚轮/拖拽/快捷键: + - 0(重置) F(聚焦)';
    container.appendChild(tip);

    // ── Helper: Zoom around specific SVG coordinate (default: center of tree) ──
    const zoomTo = (newScale: number, targetSvgX?: number, targetSvgY?: number) => {
      const clampedScale = Math.max(0.3, Math.min(4.0, newScale));
      const oldScale = st.scale;
      if (clampedScale === oldScale) return;

      const cx = targetSvgX ?? (vMinX + vWidth / 2);
      const cy = targetSvgY ?? (vMinY + vHeight / 2);

      const ratio = clampedScale / oldScale;
      st.tx = cx - (cx - st.tx) * ratio;
      st.ty = cy - (cy - st.ty) * ratio;
      st.scale = clampedScale;
      st.userTouched = true;
      applyTransform();
    };

    // ── Mouse Wheel Zoom (Around Cursor Position) ──
    container.addEventListener('wheel', (e) => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const mouseRelX = rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0.5;
      const mouseRelY = rect.height > 0 ? (e.clientY - rect.top) / rect.height : 0.5;

      const svgMouseX = vMinX + mouseRelX * vWidth;
      const svgMouseY = vMinY + mouseRelY * vHeight;

      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
      zoomTo(st.scale * zoomFactor, svgMouseX, svgMouseY);
    }, { passive: false });

    // ── Mouse Drag Pan ──
    let isDragging = false;
    let startX = 0, startY = 0;

    container.addEventListener('pointerdown', (e) => {
      if ((e.target as HTMLElement).closest(`.${pfx}-tree-toolbar`)) return;
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      container.style.cursor = 'grabbing';
      container.setPointerCapture(e.pointerId);
    });

    container.addEventListener('pointermove', (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      startX = e.clientX;
      startY = e.clientY;
      st.tx += dx;
      st.ty += dy;
      st.userTouched = true;
      applyTransform();
    });

    const endDrag = (e: PointerEvent) => {
      if (isDragging) {
        isDragging = false;
        container.style.cursor = 'grab';
        try { container.releasePointerCapture(e.pointerId); } catch {}
      }
    };
    container.addEventListener('pointerup', endDrag);
    container.addEventListener('pointercancel', endDrag);

    // ── Toolbar Click Actions (Zoom around Center) ──
    tb.addEventListener('click', (e) => {
      const btn = (e.target as HTMLElement).closest('[data-act]');
      if (!btn) return;
      const act = btn.getAttribute('data-act');
      if (act === 'zoom-in') {
        zoomTo(st.scale * 1.25);
      } else if (act === 'zoom-out') {
        zoomTo(st.scale / 1.25);
      } else if (act === 'reset') {
        st.scale = 1;
        st.tx = 0;
        st.ty = 0;
        st.userTouched = false;
        applyTransform();
      } else if (act === 'focus') {
        focusActiveNode();
      }
    });

    // ── Keyboard Shortcuts (Zoom around Center) ──
    container.addEventListener('keydown', (e) => {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomTo(st.scale * 1.2);
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomTo(st.scale / 1.2);
      } else if (e.key === '0' || e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        st.scale = 1;
        st.tx = 0;
        st.ty = 0;
        st.userTouched = false;
        applyTransform();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        focusActiveNode();
      }
    });
  }

  function applyTransform() {
    const viewportG = container.querySelector(`.${pfx}-viewport-g`);
    if (viewportG) {
      viewportG.setAttribute('transform', `translate(${st.tx}, ${st.ty}) scale(${st.scale})`);
    }
    const badge = container.querySelector(`#${pfx}-zoom-val`);
    if (badge) {
      badge.textContent = `${Math.round(st.scale * 100)}%`;
    }
  }

  function focusActiveNode() {
    const curNd = nodeMap.get(currentNodeId);
    if (!curNd || curNd.x == null || curNd.y == null || curNd.id === 'root' || curNd.depth === 0) {
      st.scale = 1;
      st.tx = 0;
      st.ty = 0;
      st.userTouched = false;
      applyTransform();
      return;
    }

    const cW = container.clientWidth;
    const cH = container.clientHeight;
    if (cW === 0 || cH === 0) return;

    // Center translation relative to tree center
    const treeCenterX = vMinX + vWidth / 2;
    const treeCenterY = vMinY + vHeight / 2;

    const targetTx = (treeCenterX - curNd.x) * st.scale;
    const targetTy = (treeCenterY - curNd.y) * st.scale;

    // Clamp translation bounds so tree is never pushed completely off-screen
    const maxShiftX = (vWidth * 0.35) * st.scale;
    const maxShiftY = (vHeight * 0.25) * st.scale;

    st.tx = Math.max(-maxShiftX, Math.min(maxShiftX, targetTx));
    st.ty = Math.max(-maxShiftY, Math.min(maxShiftY, targetTy));
    st.userTouched = true;
    applyTransform();
  }

  // Clear existing SVG (keep toolbar & tip elements)
  const existingSvg = container.querySelector('svg');
  if (existingSvg) existingSvg.remove();

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', `${vMinX} ${vMinY} ${vWidth} ${vHeight}`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.style.cssText = `width:100%;height:100%;min-height:360px;display:block;margin:0 auto;`;

  // Viewport Group for Pan & Zoom
  const viewportG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  viewportG.setAttribute('class', `${pfx}-viewport-g`);
  viewportG.setAttribute('transform', `translate(${st.tx}, ${st.ty}) scale(${st.scale})`);

  // ── Edges ──
  const drawEdges = (parent: BacktrackTreeNode): void => {
    parent.children.forEach(child => {
      const px = parent.x ?? 0, py = parent.y ?? 0;
      const cx = child.x ?? 0, cy = child.y ?? 0;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(px));
      line.setAttribute('y1', String(py + NODE_RADIUS));
      line.setAttribute('x2', String(cx));
      line.setAttribute('y2', String(cy - NODE_RADIUS));

      const isActive = visitedNodeIds.includes(parent.id) && visitedNodeIds.includes(child.id);
      const isFound = foundPathIds.includes(child.id) || (child.isLeaf && visitedNodeIds.includes(child.id));
      const isPruned = prunedNodeIds.includes(child.id);
      const isCurrentPath = isNodeOnPath(child.id, nodeMap, currentNodeId);
      const isDirectPruned = child.isDirectPrune ?? (child.isPruned && parent.id === 'root');

      let cls = `${pfx}-edge`;
      if (isCurrentPath && isActive) cls += ` ${pfx}-edge-active`;
      else if (isFound) cls += ` ${pfx}-edge-found`;
      else if (isPruned && isDirectPruned) cls += ` ${pfx}-edge-pruned-direct`;
      else if (isPruned) cls += ` ${pfx}-edge-pruned-implicit`;
      else if (!isActive) cls += ` ${pfx}-edge-dim`;

      line.setAttribute('class', cls);
      viewportG.appendChild(line);

      // Edge label
      if (isActive && child.id !== 'root') {
        const midX = (px + cx) / 2;
        const midY = (py + cy) / 2;
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', String(midX + 8));
        label.setAttribute('y', String(midY));
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('class', `${pfx}-edge-label`);
        label.textContent = child.value;
        label.setAttribute('font-size', '10');
        viewportG.appendChild(label);
      }
      drawEdges(child);
    });
  };
  drawEdges(nodes[0]);

  // ── Nodes ──
  nodes.forEach(nd => {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    const cx = nd.x ?? 0, cy = nd.y ?? 0;
    g.setAttribute('transform', `translate(${cx},${cy})`);

    const isActive = visitedNodeIds.includes(nd.id);
    const isCurrent = nd.id === currentNodeId;
    const isFound = nd.isLeaf && foundPathIds.includes(nd.id);
    const isPruned = nd.isPruned;
    const isDirectPruned = nd.isDirectPrune ?? (nd.isPruned && nd.parentId === 'root');

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', String(NODE_RADIUS));

    let cls = `${pfx}-node-circle`;
    if (isCurrent) cls += ` ${pfx}-node-current`;
    else if (isFound) cls += ` ${pfx}-node-found`;
    else if (isPruned && isDirectPruned) cls += ` ${pfx}-node-pruned-direct`;
    else if (isPruned) cls += ` ${pfx}-node-pruned-implicit`;
    else if (isActive) cls += ` ${pfx}-node-visited`;

    if (extraNodeClass) {
      const extra = extraNodeClass(nd, step);
      if (extra) cls += ` ${extra}`;
    }

    circle.setAttribute('class', cls);
    g.appendChild(circle);

    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('text-anchor', 'middle');
    text.setAttribute('dominant-baseline', 'central');
    text.setAttribute('class', `${pfx}-node-label`);

    if (nodeLabel) {
      text.textContent = nodeLabel(nd);
      text.setAttribute('font-size', nd.id === 'root' ? '10' : '13');
    } else {
      if (nd.id === 'root') {
        text.textContent = '[]';
        text.setAttribute('font-size', '10');
      } else {
        text.textContent = nd.value;
        text.setAttribute('font-size', '14');
      }
    }
    g.appendChild(text);

    if (isFound) {
      const check = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      check.setAttribute('y', String(-NODE_RADIUS - 6));
      check.setAttribute('text-anchor', 'middle');
      check.setAttribute('class', `${pfx}-node-check`);
      check.textContent = '\u2713';
      g.appendChild(check);
    }

    if (isPruned && isDirectPruned) {
      const xMark = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      xMark.setAttribute('y', String(-NODE_RADIUS - 6));
      xMark.setAttribute('text-anchor', 'middle');
      xMark.setAttribute('class', `${pfx}-node-pruned-mark`);
      xMark.textContent = '\u2717';
      g.appendChild(xMark);
    }

    viewportG.appendChild(g);
  });

  svg.appendChild(viewportG);
  container.appendChild(svg);

  if (!st.userTouched) {
    st.tx = 0;
    st.ty = 0;
    applyTransform();
  }

  const badge = container.querySelector(`#${pfx}-zoom-val`);
  if (badge) {
    badge.textContent = `${Math.round(st.scale * 100)}%`;
  }
}

/* ── Render log lines ─────────────────────────────────────── */
export function renderBacktrackLog(
  logEl: HTMLElement | null,
  steps: BacktrackTreeStep[],
  currentIndex: number,
  cssPrefix: string = 'cs'
): void {
  if (!logEl) return;
  ensureBacktrackTreeCSS(cssPrefix);
  logEl.innerHTML = '';
  steps.slice(0, currentIndex + 1).forEach((s, i) => {
    const line = document.createElement('div');
    line.className = i === currentIndex ? `${cssPrefix}-log-line ${cssPrefix}-log-active` : `${cssPrefix}-log-line`;
    line.innerHTML = `<span class="${cssPrefix}-log-num">${String(i + 1).padStart(2, '0')}.</span> ${s.message}`;
    logEl?.appendChild(line);
  });
  logEl.scrollTop = logEl.scrollHeight;
}

/* ── CSS snippet to embed in HTML templates ───────────────── */
export function getBacktrackTreeCSS(prefix: string = 'cs'): string {
  return `
    /* Toolbar Overlay & Keyboard Tip */
    .${prefix}-tree-toolbar {
      position: absolute;
      top: 12px;
      right: 12px;
      z-index: 20;
      display: flex;
      align-items: center;
      gap: 6px;
      background: rgba(18, 18, 32, 0.85);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 10px;
      padding: 4px 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
    }
    .${prefix}-tb-btn {
      background: rgba(255, 255, 255, 0.08);
      border: 1px solid rgba(255, 255, 255, 0.12);
      color: #cdd6f4;
      border-radius: 6px;
      padding: 4px 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 4px;
      transition: all 0.2s ease;
      user-select: none;
    }
    .${prefix}-tb-btn:hover {
      background: rgba(96, 165, 250, 0.25);
      border-color: #60a5fa;
      color: #ffffff;
    }
    .${prefix}-tb-badge {
      color: #94a3b8;
      font-family: 'JetBrains Mono', monospace;
      font-size: 11px;
      font-weight: 700;
      padding: 0 4px;
      min-width: 42px;
      text-align: center;
    }
    .${prefix}-keyboard-tip {
      position: absolute;
      bottom: 12px;
      right: 12px;
      z-index: 10;
      font-size: 11px;
      color: rgba(148, 163, 184, 0.7);
      background: rgba(12, 12, 24, 0.65);
      padding: 4px 10px;
      border-radius: 6px;
      pointer-events: none;
      border: 1px solid rgba(255, 255, 255, 0.06);
    }

    /* Edges */
    .${prefix}-edge { stroke: rgba(255,255,255,0.1); stroke-width: 1.5; transition: all .3s; }
    .${prefix}-edge-active { stroke: #fb923c; stroke-width: 2.5; filter: drop-shadow(0 0 4px rgba(251,146,60,.5)); }
    .${prefix}-edge-found { stroke: #34d399; stroke-width: 2; }
    .${prefix}-edge-pruned-direct { stroke: rgba(248,113,113,0.45); stroke-dasharray: 4 3; }
    .${prefix}-edge-pruned-implicit { stroke: rgba(255,255,255,0.03); stroke-dasharray: 2 2; }
    .${prefix}-edge-dim { stroke: rgba(255,255,255,0.05); }
    .${prefix}-edge-label { fill: #94a3b8; font-family: 'JetBrains Mono', monospace; }

    /* Nodes */
    .${prefix}-node-circle { fill: #1e1e2e; stroke: #45475a; stroke-width: 2; transition: all .3s; }
    .${prefix}-node-current {
      fill: rgba(251,146,60,0.45) !important;
      stroke: #ff9800 !important;
      stroke-width: 3.5 !important;
      transform-box: fill-box;
      transform-origin: center;
      animation: ${prefix}-tree-pulse 0.9s ease-in-out infinite alternate !important;
    }
    .${prefix}-node-found { fill: rgba(52,211,153,0.3); stroke: #34d399; stroke-width: 2.5; }
    .${prefix}-node-visited { fill: rgba(192,132,252,0.2); stroke: rgba(192,132,252,0.5); stroke-width: 2; }
    .${prefix}-node-pruned { fill: rgba(100,100,120,0.15); stroke: rgba(100,100,120,0.3); stroke-width: 1.5; stroke-dasharray: 4 3; }
    .${prefix}-node-pruned-direct { stroke: rgba(248,113,113,0.55); stroke-dasharray: 4 3; }
    .${prefix}-node-pruned-implicit { stroke: rgba(100,100,120,0.2); stroke-dasharray: 2 2; opacity: 0.35; }
    .${prefix}-node-label { fill: #cdd6f4; font-family: 'JetBrains Mono', monospace; font-weight: 700; }
    .${prefix}-node-check { fill: #34d399; font-size: 14px; font-weight: 900; }
    .${prefix}-node-pruned-mark { fill: #f87171; font-size: 12px; font-weight: 900; }

    /* Log */
    .${prefix}-log-line { display: flex; gap: 8px; padding: 1px 0; color: #94a3b8; font-size: 12px; line-height: 1.65; }
    .${prefix}-log-line .${prefix}-log-num { color: #64748b; flex-shrink: 0; }
    .${prefix}-log-line.${prefix}-log-active { color: #fdba74; font-weight: 600; }
    .${prefix}-log-line.${prefix}-log-active .${prefix}-log-num { color: #fb923c; }

    /* Animations: ONLY currentNodeId pulses */
    @keyframes ${prefix}-tree-pulse {
      0% {
        transform: scale(1.0);
        filter: drop-shadow(0 0 4px rgba(255,152,0,0.6));
      }
      100% {
        transform: scale(1.22);
        filter: drop-shadow(0 0 18px rgba(255,152,0,1)) drop-shadow(0 0 32px rgba(251,146,60,0.85));
      }
    }
  `;
}
