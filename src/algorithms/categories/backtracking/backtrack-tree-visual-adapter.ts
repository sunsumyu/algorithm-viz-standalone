import {
  BacktrackTreeNode,
  BacktrackTreeStep,
  TreeLayoutEngine,
  NODE_RADIUS
} from './tree-layout-engine';

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

interface ViewportState {
  scale: number;
  tx: number;
  ty: number;
  userTouched: boolean;
}

const containerViewStates = new WeakMap<HTMLElement, ViewportState>();
const containerInitialized = new WeakSet<HTMLElement>();
const injectedPrefixes = new Set<string>();

/**
 * 回溯决策树视觉表现适配器 (BacktrackTreeVisualAdapter) - 适配器模式 (Adapter Pattern)
 * 封装 SVG 决策树渲染、平移缩放手势控制与树形高亮状态样式。
 */
export class BacktrackTreeVisualAdapter {
  public static getContainerViewState(container: HTMLElement): ViewportState {
    let st = containerViewStates.get(container);
    if (!st) {
      st = { scale: 1, tx: 0, ty: 0, userTouched: false };
      containerViewStates.set(container, st);
    }
    return st;
  }

  /**
   * 确保指定 prefix 的决策树样式已注入 document（每个 prefix 只注入一次）
   */
  public static ensureBacktrackTreeCSS(prefix: string = 'cs'): void {
    if (injectedPrefixes.has(prefix)) return;
    injectedPrefixes.add(prefix);
    if (typeof document === 'undefined' || !document.head) return;
    const style = document.createElement('style');
    style.setAttribute('data-backtrack-tree-css', prefix);
    style.textContent = this.getBacktrackTreeCSS(prefix);
    document.head.appendChild(style);
  }

  /**
   * 渲染回溯 N 叉决策树 SVG
   */
  public static render(options: RenderTreeOptions): void {
    const { container, step, cssPrefix = 'cs', nodeLabel, extraNodeClass, isFoundNode } = options;
    const { nodes, currentNodeId, visitedNodeIds, foundPathIds, prunedNodeIds } = step;

    this.ensureBacktrackTreeCSS(cssPrefix);

    if (!nodes || nodes.length === 0 || typeof document === 'undefined') return;

    const pfx = cssPrefix;
    const st = this.getContainerViewState(container);

    const bounds = TreeLayoutEngine.computeBounds(nodes, 60, 60, NODE_RADIUS);
    const { vMinX, vMinY, vWidth, vHeight } = bounds;

    // Build lookup
    const nodeMap = new Map<string, BacktrackTreeNode>();
    nodes.forEach((nd) => nodeMap.set(nd.id, nd));

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

      const zoomTo = (newScale: number, targetSvgX?: number, targetSvgY?: number) => {
        const clampedScale = Math.max(0.3, Math.min(4.0, newScale));
        const oldScale = st.scale;
        if (clampedScale === oldScale) return;

        const cx = targetSvgX ?? vMinX + vWidth / 2;
        const cy = targetSvgY ?? vMinY + vHeight / 2;

        const ratio = clampedScale / oldScale;
        st.tx = cx - (cx - st.tx) * ratio;
        st.ty = cy - (cy - st.ty) * ratio;
        st.scale = clampedScale;
        st.userTouched = true;
        applyTransform();
      };

      // Mouse Wheel Zoom
      container.addEventListener(
        'wheel',
        (e) => {
          e.preventDefault();
          const rect = container.getBoundingClientRect ? container.getBoundingClientRect() : { width: 400, height: 300, left: 0, top: 0 };
          const mouseRelX = rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0.5;
          const mouseRelY = rect.height > 0 ? (e.clientY - rect.top) / rect.height : 0.5;

          const svgMouseX = vMinX + mouseRelX * vWidth;
          const svgMouseY = vMinY + mouseRelY * vHeight;

          const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
          zoomTo(st.scale * zoomFactor, svgMouseX, svgMouseY);
        },
        { passive: false }
      );

      // Mouse Drag Pan
      let isDragging = false;
      let startX = 0,
        startY = 0;

      container.addEventListener('pointerdown', (e) => {
        if ((e.target as HTMLElement)?.closest?.(`.${pfx}-tree-toolbar`)) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        container.style.cursor = 'grabbing';
        try {
          container.setPointerCapture?.(e.pointerId);
        } catch {}
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
          try {
            container.releasePointerCapture?.(e.pointerId);
          } catch {}
        }
      };
      container.addEventListener('pointerup', endDrag);
      container.addEventListener('pointercancel', endDrag);

      // Toolbar Actions
      tb.addEventListener('click', (e) => {
        const btn = (e.target as HTMLElement)?.closest?.('[data-act]');
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

      const treeCenterX = vMinX + vWidth / 2;
      const treeCenterY = vMinY + vHeight / 2;

      const targetTx = (treeCenterX - curNd.x) * st.scale;
      const targetTy = (treeCenterY - curNd.y) * st.scale;

      const maxShiftX = vWidth * 0.35 * st.scale;
      const maxShiftY = vHeight * 0.25 * st.scale;

      st.tx = Math.max(-maxShiftX, Math.min(maxShiftX, targetTx));
      st.ty = Math.max(-maxShiftY, Math.min(maxShiftY, targetTy));
      st.userTouched = true;
      applyTransform();
    }

    // Clear existing SVG
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
      parent.children.forEach((child) => {
        const px = parent.x ?? 0,
          py = parent.y ?? 0;
        const cx = child.x ?? 0,
          cy = child.y ?? 0;

        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(px));
        line.setAttribute('y1', String(py + NODE_RADIUS));
        line.setAttribute('x2', String(cx));
        line.setAttribute('y2', String(cy - NODE_RADIUS));

        const isActive = visitedNodeIds.includes(parent.id) && visitedNodeIds.includes(child.id);
        const isFound =
          foundPathIds.includes(child.id) || (child.isLeaf && visitedNodeIds.includes(child.id));
        const isPruned = prunedNodeIds.includes(child.id);
        const isCurrentPath = TreeLayoutEngine.isNodeOnPath(child.id, nodeMap, currentNodeId);
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
    nodes.forEach((nd) => {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      const cx = nd.x ?? 0,
        cy = nd.y ?? 0;
      g.setAttribute('transform', `translate(${cx},${cy})`);

      const isActive = visitedNodeIds.includes(nd.id);
      const isCurrent = nd.id === currentNodeId;
      const isFound = isFoundNode ? isFoundNode(nd, step) : nd.isLeaf && foundPathIds.includes(nd.id);
      const isPruned = prunedNodeIds.includes(nd.id);
      const isDirectPruned = nd.isDirectPrune ?? (nd.isPruned && nd.parentId === 'root');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('r', String(NODE_RADIUS));

      let cls = `${pfx}-node-circle`;
      if (isCurrent) cls += ` ${pfx}-node-current`;
      else if (isFound) cls += ` ${pfx}-node-found`;
      else if (isPruned && isDirectPruned) cls += ` ${pfx}-node-pruned-direct`;
      else if (isPruned) cls += ` ${pfx}-node-pruned-implicit`;
      else if (isActive) cls += ` ${pfx}-node-visited`;
      else cls += ` ${pfx}-node-dim`;

      if (extraNodeClass) {
        const extra = extraNodeClass(nd, step);
        if (extra) cls += ` ${extra}`;
      }

      circle.setAttribute('class', cls);
      g.appendChild(circle);

      // Node label
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('class', `${pfx}-node-text`);

      const lbl = nodeLabel ? nodeLabel(nd) : nd.value || (nd.id === 'root' ? '[]' : '');
      text.textContent = lbl;
      g.appendChild(text);

      viewportG.appendChild(g);
    });

    svg.appendChild(viewportG);
    container.appendChild(svg);
  }

  public static getBacktrackTreeCSS(prefix: string = 'cs'): string {
    return `
      .${prefix}-tree-toolbar {
        position: absolute;
        top: 10px;
        right: 10px;
        display: flex;
        align-items: center;
        gap: 4px;
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(8px);
        padding: 3px 6px;
        border-radius: 10px;
        border: 1px solid #e2e8f0;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        z-index: 20;
      }
      .${prefix}-tb-btn {
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 6px;
        padding: 3px 6px !important;
        font-size: 11px !important;
        color: #334155 !important;
        cursor: pointer;
        transition: all 0.15s ease;
        white-space: nowrap !important;
        display: inline-flex !important;
        align-items: center !important;
        justify-content: center !important;
        min-width: auto !important;
        height: 24px !important;
        line-height: 1 !important;
      }
      .${prefix}-tb-btn:hover {
        background: #eff6ff !important;
        border-color: #93c5fd !important;
        color: #1d4ed8 !important;
        transform: translateY(-1px);
      }
      .${prefix}-tb-badge {
        font-size: 11px;
        font-weight: 700;
        color: #64748b;
        min-width: 36px;
        text-align: center;
        font-family: 'JetBrains Mono', monospace;
      }
      .${prefix}-keyboard-tip {
        position: absolute;
        bottom: 8px;
        right: 10px;
        font-size: 10.5px;
        color: #94a3b8;
        background: rgba(255, 255, 255, 0.88);
        backdrop-filter: blur(6px);
        padding: 2px 6px;
        border-radius: 6px;
        border: 1px solid #e2e8f0;
        pointer-events: none;
        z-index: 10;
      }
      .${prefix}-edge {
        stroke: #e2e8f0;
        stroke-width: 2;
        transition: all 0.2s ease;
      }
      .${prefix}-edge-active {
        stroke: #3b82f6;
        stroke-width: 3;
      }
      .${prefix}-edge-found {
        stroke: #10b981;
        stroke-width: 3;
      }
      .${prefix}-edge-pruned-direct, .${prefix}-edge-pruned-implicit {
        stroke: #fca5a5;
        stroke-dasharray: 4 3;
      }
      .${prefix}-edge-dim {
        stroke: #f1f5f9;
      }
      .${prefix}-edge-label {
        fill: #64748b;
        font-weight: 600;
      }
      .${prefix}-node-circle {
        fill: #ffffff;
        stroke: #cbd5e1;
        stroke-width: 2;
        transition: all 0.2s ease;
      }
      .${prefix}-node-current {
        fill: #dbeafe;
        stroke: #2563eb;
        stroke-width: 3.5;
        filter: drop-shadow(0 0 6px rgba(37, 99, 235, 0.4));
      }
      .${prefix}-node-found {
        fill: #d1fae5;
        stroke: #059669;
        stroke-width: 3;
      }
      .${prefix}-node-pruned-direct, .${prefix}-node-pruned-implicit {
        fill: #fee2e2;
        stroke: #ef4444;
        stroke-dasharray: 3 2;
      }
      .${prefix}-node-visited {
        fill: #f8fafc;
        stroke: #94a3b8;
      }
      .${prefix}-node-dim {
        fill: #f8fafc;
        stroke: #e2e8f0;
        opacity: 0.6;
      }
      .${prefix}-node-text {
        font-size: 11px;
        font-weight: 600;
        fill: #1e293b;
        user-select: none;
      }
    `;
  }
}
