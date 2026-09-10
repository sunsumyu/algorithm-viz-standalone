/**
 * 自适应 SVG 递归调用树与状态依赖图可视化适配器 (RecursionTreeAdapter Deep Module)
 * 遵循深度模块原则：
 * 将树结构度量、坐标布局、自适应视口平滑聚焦与状态着色封装为自治的渲染模块。
 */

export interface RecursionTreeViewportState {
  scale: number;
  tx: number;
  ty: number;
  userTouched: boolean;
  activeX: number | null;
  activeY: number | null;
  totalW: number;
  totalH: number;
}

const containerViewStates = new WeakMap<HTMLElement, RecursionTreeViewportState>();
const containerInitialized = new WeakSet<HTMLElement>();
const INJECTED_STYLE_ID = 'recursion-tree-adapter-style';

function ensureTreeStyles(): void {
  if (typeof document === 'undefined' || !document.head) return;
  let style = document.getElementById(INJECTED_STYLE_ID) as HTMLStyleElement | null;
  if (!style) {
    style = document.createElement('style');
    style.id = INJECTED_STYLE_ID;
    document.head.appendChild(style);
  }
  style.textContent = `
    .tree-tb-btn {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 2px 7px;
      font-size: 11px;
      font-weight: 600;
      color: #334155;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 3px;
      transition: all 0.15s ease;
      user-select: none;
      height: 22px;
      line-height: 1;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
    }
    .tree-tb-btn:hover {
      background: #eff6ff;
      border-color: #93c5fd;
      color: #1d4ed8;
      transform: translateY(-1px);
      box-shadow: 0 2px 4px rgba(37, 99, 235, 0.12);
    }
    .tree-tb-btn:active {
      background: #dbeafe;
      transform: translateY(0);
    }
  `;
}

export class RecursionTreeAdapter {
  /**
   * 获取或初始化容器关联的视口状态
   */
  public static getViewState(container: HTMLElement): RecursionTreeViewportState {
    let st = containerViewStates.get(container);
    if (!st) {
      st = { scale: 1, tx: 0, ty: 0, userTouched: false, activeX: null, activeY: null, totalW: 600, totalH: 400 };
      containerViewStates.set(container, st);
    }
    return st;
  }

  /**
   * 重置指定容器的视口变换
   */
  public static resetViewState(container: HTMLElement | null): void {
    if (!container) return;
    const st = this.getViewState(container);
    st.scale = 1;
    st.tx = 0;
    st.ty = 0;
    st.userTouched = false;
  }

  /**
   * 渲染自适应 SVG 递归调用树（支持鼠标滚轮缩放、手势拖拽平移与聚焦控制）
   */
  public static renderRecursionTree(
    container: HTMLElement,
    root: any,
    activeNodeId?: string,
    isMemo = false
  ): void {
    if (!container) return;
    if (!root) {
      container.innerHTML = '<div class="text-xs text-slate-400 py-6">（暂无递归调用树）</div>';
      return;
    }

    ensureTreeStyles();

    function countLeaves(n: any): number {
      if (!n.children || n.children.length === 0) return 1;
      return n.children.reduce((acc: number, c: any) => acc + countLeaves(c), 0);
    }

    function getDepth(n: any): number {
      if (!n.children || n.children.length === 0) return 0;
      return 1 + Math.max(...n.children.map(getDepth));
    }

    function getMaxValLen(n: any): number {
      let maxLen = n.val ? String(n.val).length : 0;
      if (n.children && n.children.length > 0) {
        for (const c of n.children) {
          maxLen = Math.max(maxLen, getMaxValLen(c));
        }
      }
      return maxLen;
    }

    function hasEdgeLabelsOrTags(n: any): boolean {
      if (!n) return false;
      if (n.tag || n.edgeLabel) return true;
      if (n.children && n.children.length > 0) {
        for (const c of n.children) {
          if (c.edgeLabel || hasEdgeLabelsOrTags(c)) return true;
        }
      }
      return false;
    }

    const leafCount = countLeaves(root);
    const maxDepth = getDepth(root);
    const maxValLen = getMaxValLen(root);
    const hasLabels = hasEdgeLabelsOrTags(root);

    // 几何安全尺寸度量：保证分支标签 (edgeLabel) 与返回值徽章 (tag) 绝不遮挡，同时精致紧凑，避免初始节点过大
    let nodeW = Math.max(52, Math.round(maxValLen * 6.5 + 14));
    let nodeH = 22;
    let minGap = 12;
    let levelH = hasLabels ? 52 : 42;
    let fontSize = 9.5;
    let tagFontSize = 7.5;
    const topPad = 26;

    if (leafCount >= 10 || maxDepth >= 4) {
      nodeW = Math.max(46, Math.round(maxValLen * 5.8 + 12));
      nodeH = 20;
      minGap = 8;
      levelH = hasLabels ? 46 : 38;
      fontSize = 8.5;
      tagFontSize = 7;
    } else if (leafCount >= 6 || maxDepth >= 3) {
      nodeW = Math.max(48, Math.round(maxValLen * 6.2 + 13));
      nodeH = 21;
      minGap = 10;
      levelH = hasLabels ? 48 : 40;
      fontSize = 9;
      tagFontSize = 7.5;
    }

    function measure(n: any): any {
      const ch = n.children || [];
      if (ch.length === 0) {
        return { node: n, width: nodeW + minGap, children: [] };
      }
      const measuredCh = ch.map(measure);
      const sumW = measuredCh.reduce((acc: number, c: any) => acc + c.width, 0);
      return { node: n, width: Math.max(nodeW + minGap, sumW), children: measuredCh };
    }

    function assign(mNode: any, depth: number, leftX: number): any {
      const x = leftX + mNode.width / 2;
      const y = topPad + depth * levelH;
      let curL = leftX;
      const placedCh = [];
      for (const c of mNode.children) {
        placedCh.push(assign(c, depth + 1, curL));
        curL += c.width;
      }
      return {
        id: mNode.node.id,
        val: mNode.node.val,
        edgeLabel: mNode.node.edgeLabel,
        status: mNode.node.status,
        tag: mNode.node.tag,
        x,
        y,
        width: mNode.width,
        children: placedCh,
      };
    }

    const measured = measure(root);
    // 容器自适应基线：避免小树时 viewBox 仅有 200px 导致 SVG 整体放大 3 倍使节点巨大
    const clientW = (container.clientWidth && container.clientWidth > 100) ? container.clientWidth : 650;
    const clientH = (container.clientHeight && container.clientHeight > 100) ? container.clientHeight : 380;
    const totalW = Math.max(measured.width + 48, clientW);
    const totalH = Math.max(topPad + maxDepth * levelH + nodeH + 48, clientH);
    const rootPos = assign(measured, 0, (totalW - measured.width) / 2);

    const lines: string[] = [];
    const edgeLabels: string[] = [];
    const nodes: string[] = [];
    let activeX: number | null = null;
    let activeY: number | null = null;

    function draw(n: any): void {
      for (const c of n.children) {
        const startX = n.x;
        const startY = n.y + nodeH / 2;
        const endX = c.x;
        const endY = c.y - nodeH / 2;

        const isCurrentBranch = n.id === activeNodeId || c.id === activeNodeId;
        const stroke = isCurrentBranch ? '#3b82f6' : '#cbd5e1';
        const strokeW = isCurrentBranch ? '2' : '1.3';
        const strokeDash = c.status === 'pruned' ? '3,3' : 'none';

        // 贝塞尔曲线平滑连接
        const curveMidY = (startY + endY) / 2;
        lines.push(
          `<path d="M ${startX} ${startY} C ${startX} ${curveMidY}, ${endX} ${curveMidY}, ${endX} ${endY}" fill="none" stroke="${stroke}" stroke-width="${strokeW}" stroke-dasharray="${strokeDash}" />`
        );

        if (c.edgeLabel) {
          const edgeText = String(c.edgeLabel);
          const edgeW = Math.max(18, edgeText.length * 7.5 + 6);
          const edgeH = 12;

          // 核心几何防重叠：安全垂直净空计算 (Safe Vertical Clearance)
          const parentBottomPad = n.tag ? 11 : 3;
          const childTopPad = c.id === activeNodeId ? 15 : 3;
          const safeTopY = startY + parentBottomPad;
          const safeBottomY = endY - childTopPad;
          const safeMidY = safeTopY < safeBottomY ? (safeTopY + safeBottomY) / 2 : curveMidY;

          // 计算沿贝塞尔 S 弯曲线在 safeMidY 处的真实 X 坐标
          const totalDy = Math.max(1, endY - startY);
          const t = Math.max(0.12, Math.min(0.88, (safeMidY - startY) / totalDy));
          const safeMidX = startX + (endX - startX) * (3 * (1 - t) * t * t + t * t * t);

          edgeLabels.push(`
            <g transform="translate(${safeMidX}, ${safeMidY})">
              <rect x="${-edgeW / 2}" y="${-edgeH / 2}" width="${edgeW}" height="${edgeH}" rx="3" fill="#ffffff" stroke="${isCurrentBranch ? '#2563eb' : '#cbd5e1'}" stroke-width="${isCurrentBranch ? '1.3' : '1'}" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.05))" />
              <text x="0" y="0" dominant-baseline="central" text-anchor="middle" fill="${isCurrentBranch ? '#1d4ed8' : '#475569'}" font-size="7" font-weight="700" font-family="sans-serif">${edgeText}</text>
            </g>
          `);
        }

        draw(c);
      }

      const isCurrent = n.id === activeNodeId;
      if (isCurrent) {
        activeX = n.x;
        activeY = n.y;
      }

      const isBase = n.status === 'base';
      const isPruned = n.status === 'pruned';
      const isOutOfBoundsNode = isPruned && n.tag && n.tag.includes('🚫');
      const isRepeated = n.tag && n.tag.includes('重复');
      const isVisited = n.status === 'visited';

      let stroke = '#cbd5e1';
      let strokeW = '1.2';
      let fill = '#ffffff';
      let textColor = '#334155';
      let filterGlow = '';

      if (isCurrent) {
        stroke = '#2563eb';
        strokeW = '2.5';
        fill = '#eff6ff';
        textColor = '#1d4ed8';
        filterGlow = 'filter="drop-shadow(0 0 6px rgba(59, 130, 246, 0.45))"';
      } else if (isOutOfBoundsNode) {
        stroke = '#ef4444';
        fill = '#fef2f2';
        textColor = '#b91c1c';
      } else if (isPruned) {
        stroke = '#9333ea';
        fill = '#faf5ff';
        textColor = '#7e22ce';
      } else if (isRepeated) {
        stroke = '#d97706';
        fill = '#fffbeb';
        textColor = '#b45309';
      } else if (isBase) {
        stroke = '#16a34a';
        fill = '#f0fdf4';
        textColor = '#15803d';
      } else if (isVisited) {
        stroke = '#10b981';
        fill = '#ffffff';
        textColor = '#047857';
      }

      let badgeHtml = '';
      if (n.tag) {
        const tagBg = isOutOfBoundsNode ? '#ef4444' : isPruned ? '#9333ea' : isRepeated ? '#d97706' : '#10b981';
        const badgeW = Math.min(nodeW + 8, Math.max(22, String(n.tag).length * 6.0 + 6));
        badgeHtml = `
          <g transform="translate(0, ${nodeH / 2 + 5.5})">
            <rect x="${-badgeW / 2}" y="-4.5" width="${badgeW}" height="9.5" rx="2.5" fill="${tagBg}" />
            <text x="0" y="0" dominant-baseline="central" text-anchor="middle" fill="#ffffff" font-size="${tagFontSize}" font-weight="700" font-family="JetBrains Mono, monospace">${n.tag}</text>
          </g>
        `;
      }

      let animalHtml = '';
      if (isCurrent) {
        animalHtml = `
          <g transform="translate(0, ${-nodeH / 2 - 9})">
            <ellipse cx="0" cy="3" rx="6.5" ry="2" fill="#3b82f6" opacity="0.22" />
            <text x="0" y="0" text-anchor="middle" font-size="${Math.max(10.5, fontSize + 1.5)}" class="animal-frog select-none" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.15));">🐸</text>
          </g>
        `;
      }

      nodes.push(`
        <g transform="translate(${n.x}, ${n.y})" ${filterGlow}>
          <rect x="${-nodeW / 2}" y="${-nodeH / 2}" width="${nodeW}" height="${nodeH}" rx="4.5" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" />
          <text x="0" y="3" text-anchor="middle" fill="${textColor}" font-size="${fontSize}" font-weight="700" font-family="JetBrains Mono, monospace">${n.val}</text>
          ${badgeHtml}
          ${animalHtml}
        </g>
      `);
    }

    draw(rootPos);

    const st = this.getViewState(container);
    st.totalW = totalW;
    st.totalH = totalH;
    st.activeX = activeX;
    st.activeY = activeY;

    if (!st.userTouched) {
      st.scale = 1;
      st.tx = 0;
      st.ty = 0;
    }

    const svgTreeBody = `
      <g id="tree-viewport-g" transform="translate(${st.tx}, ${st.ty}) scale(${st.scale})" style="transform-origin: 0 0;">
        ${lines.join('')}
        ${edgeLabels.join('')}
        ${nodes.join('')}
      </g>
    `;

    const svgContent = `
      <svg id="tree-svg-canvas" width="100%" height="100%" viewBox="0 0 ${totalW} ${totalH}" preserveAspectRatio="xMidYMid meet" style="display: block; margin: 0 auto; width: 100%; height: 100%; min-width: 100%; min-height: 100%; overflow: visible; pointer-events: all;">
        ${svgTreeBody}
      </svg>
    `;

    const toolbarStyle = 'position: absolute; top: 8px; right: 8px; display: flex; align-items: center; gap: 4px; background: rgba(255, 255, 255, 0.92); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); border: 1px solid rgba(226, 232, 240, 0.95); padding: 3px 6px; border-radius: 8px; z-index: 20; box-shadow: 0 2px 10px rgba(15, 23, 42, 0.08), 0 1px 3px rgba(15, 23, 42, 0.04);';
    const tipStyle = 'position: absolute; bottom: 6px; right: 8px; font-size: 9.5px; color: #64748b; background: rgba(255, 255, 255, 0.9); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); border: 1px solid rgba(226, 232, 240, 0.85); padding: 2px 7px; border-radius: 6px; pointer-events: none; z-index: 10; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);';

    let scrollBox = container.querySelector('#tree-scroll-box') as HTMLElement | null;

    if (!scrollBox) {
      container.innerHTML = `
        <div id="tree-scroll-box" class="tree-canvas-scroll-container" style="position: relative; width: 100%; height: 100%; overflow: hidden; user-select: none; cursor: grab; box-sizing: border-box; display: flex; align-items: center; justify-content: center; background: #ffffff;">
          <!-- 悬浮缩放控制栏 (统一精致白透毛玻璃设计，与卡片整体风格完全匹配) -->
          <div class="tree-zoom-toolbar" style="${toolbarStyle}">
            <button class="tree-tb-btn" data-tree-act="zoom-in" title="放大 (+)">➕</button>
            <button class="tree-tb-btn" data-tree-act="zoom-out" title="缩小 (-)">➖</button>
            <span class="tree-zoom-badge" id="tree-zoom-val" style="font-size: 10.5px; font-weight: 700; color: #2563eb; min-width: 36px; text-align: center; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;">${Math.round(st.scale * 100)}%</span>
            <button class="tree-tb-btn" data-tree-act="reset" title="重置视角 (100%)">🎯 重置</button>
            <button class="tree-tb-btn" data-tree-act="focus" title="聚焦当前节点">📍 聚焦</button>
          </div>
          <!-- 底部手势提示 -->
          <div class="tree-keyboard-tip" style="${tipStyle}">
            🖱️ 滚轮缩放 · 拖拽平移
          </div>
          ${svgContent}
        </div>
      `;
      scrollBox = container.querySelector('#tree-scroll-box');
    } else {
      // 保持外层容器与工具条，同步最新主题样式与内部 SVG
      scrollBox.style.background = '#ffffff';
      const toolbar = scrollBox.querySelector('.tree-zoom-toolbar') as HTMLElement | null;
      if (toolbar) toolbar.setAttribute('style', toolbarStyle);
      const tip = scrollBox.querySelector('.tree-keyboard-tip') as HTMLElement | null;
      if (tip) tip.setAttribute('style', tipStyle);
      const badge = scrollBox.querySelector('#tree-zoom-val') as HTMLElement | null;
      if (badge) badge.style.color = '#2563eb';

      const existingSvg = scrollBox.querySelector('#tree-svg-canvas');
      if (existingSvg) {
        if (typeof existingSvg.setAttribute === 'function') {
          existingSvg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
        }
        existingSvg.innerHTML = svgTreeBody;
      } else {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = svgContent;
        if (tempDiv.firstElementChild) {
          scrollBox.appendChild(tempDiv.firstElementChild);
        }
      }
    }

    const applyTransform = () => {
      if (!scrollBox) return;
      const g = scrollBox.querySelector('#tree-viewport-g');
      if (g && typeof g.setAttribute === 'function') {
        g.setAttribute('transform', `translate(${st.tx.toFixed(2)}, ${st.ty.toFixed(2)}) scale(${st.scale.toFixed(3)})`);
      }
      const badge = scrollBox.querySelector('#tree-zoom-val');
      if (badge) {
        badge.textContent = `${Math.round(st.scale * 100)}%`;
      }
    };

    const zoomTo = (newScale: number, targetSvgX?: number, targetSvgY?: number) => {
      const clampedScale = Math.max(0.25, Math.min(3.5, newScale));
      const oldScale = st.scale;
      if (clampedScale === oldScale) return;

      const cx = targetSvgX ?? st.totalW / 2;
      const cy = targetSvgY ?? st.totalH / 2;

      const ratio = clampedScale / oldScale;
      st.tx = cx - (cx - st.tx) * ratio;
      st.ty = cy - (cy - st.ty) * ratio;
      st.scale = clampedScale;
      st.userTouched = true;
      applyTransform();
    };

    const focusActiveNode = () => {
      if (st.activeX === null || st.activeY === null) {
        st.scale = 1;
        st.tx = 0;
        st.ty = 0;
        st.userTouched = false;
        applyTransform();
        return;
      }
      const targetScale = Math.max(1.1, st.scale);
      st.scale = targetScale;
      st.tx = (st.totalW / 2 - st.activeX) * targetScale;
      st.ty = (st.totalH / 2 - st.activeY) * targetScale;
      st.userTouched = true;
      applyTransform();
    };

    // 事件仅在 DOM 初始化时挂载一次
    if (scrollBox && !containerInitialized.has(scrollBox) && typeof scrollBox.addEventListener === 'function') {
      containerInitialized.add(scrollBox);

      // 1. 鼠标滚轮缩放
      scrollBox.addEventListener(
        'wheel',
        (e: WheelEvent) => {
          e.preventDefault();
          const rect = typeof scrollBox?.getBoundingClientRect === 'function'
            ? scrollBox.getBoundingClientRect()
            : { width: st.totalW, height: st.totalH, left: 0, top: 0 };
          const mouseRelX = rect.width > 0 ? (e.clientX - rect.left) / rect.width : 0.5;
          const mouseRelY = rect.height > 0 ? (e.clientY - rect.top) / rect.height : 0.5;

          const svgMouseX = mouseRelX * st.totalW;
          const svgMouseY = mouseRelY * st.totalH;

          const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
          zoomTo(st.scale * zoomFactor, svgMouseX, svgMouseY);
        },
        { passive: false }
      );

      // 2. 指针拖拽平移 (Pointer Drag Pan)
      let isDragging = false;
      let startX = 0;
      let startY = 0;

      scrollBox.addEventListener('pointerdown', (e: PointerEvent) => {
        if ((e.target as HTMLElement)?.closest?.('.tree-zoom-toolbar')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        scrollBox!.style.cursor = 'grabbing';
        try {
          scrollBox?.setPointerCapture?.(e.pointerId);
        } catch {}
      });

      scrollBox.addEventListener('pointermove', (e: PointerEvent) => {
        if (!isDragging) return;
        const rect = typeof scrollBox?.getBoundingClientRect === 'function'
          ? scrollBox.getBoundingClientRect()
          : { width: st.totalW, height: st.totalH };
        const scaleX = st.totalW / Math.max(1, rect.width || st.totalW);
        const scaleY = st.totalH / Math.max(1, rect.height || st.totalH);

        const dx = (e.clientX - startX) * scaleX;
        const dy = (e.clientY - startY) * scaleY;
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
          if (scrollBox) scrollBox.style.cursor = 'grab';
          try {
            scrollBox?.releasePointerCapture?.(e.pointerId);
          } catch {}
        }
      };
      scrollBox.addEventListener('pointerup', endDrag);
      scrollBox.addEventListener('pointercancel', endDrag);

      // 3. 工具栏点击交互
      const toolbar = scrollBox.querySelector('.tree-zoom-toolbar');
      if (toolbar && typeof toolbar.addEventListener === 'function') {
        toolbar.addEventListener('click', (e: Event) => {
          const btn = (e.target as HTMLElement)?.closest?.('[data-tree-act]');
          if (!btn) return;
          const act = btn.getAttribute('data-tree-act');
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
    }

    applyTransform();

    // 兼容原有的 DOM 滚动条行为检测
    if (scrollBox && typeof scrollBox.scrollTo === 'function') {
      const clientW = scrollBox.clientWidth || 0;
      const clientH = scrollBox.clientHeight || 0;
      if (activeX !== null && clientW > 0) {
        scrollBox.scrollLeft = Math.max(0, activeX - clientW / 2);
      }
      if (activeY !== null && clientH > 0) {
        scrollBox.scrollTop = Math.max(0, activeY - clientH / 2);
      }
    }
  }
}
