/**
 * 树上挂树全景推演画板适配器 (Tree of Trees Canvas Adapter)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 
 * 核心升级（真·二叉树分支拓扑布局）：
 * 1. 彻底消灭单列纵向排列，以二叉树经典中序槽位算法 (Inorder Position Assignment) 呈现真·树型拓扑；
 * 2. 根节点居中，左子调用向左下斜向分支 (c_left.x < p.x)，右子调用向右下斜向分支 (c_right.x > p.x)；
 * 3. 全局全展结构，方便用户一览全景架构进行深度分析 (直观洞察反向中序流)；
 * 4. 活跃帧 (⚡ 活跃)、回溯等待帧 (⏳ 等待)、结算完成帧 (✅ 已结算) 与待执行帧 (💤 待深入) 多态高保真呈现；
 * 5. 内置微缩二叉树沙盘，支持平滑缩放、拖拽与复位；
 * 6. 100% 严守 Card 1 表现层零违规死门禁。
 */

import { TreeNode } from '../tree-svg';

export interface TreeOfTreesNode {
  id: string;
  funcCall: string;
  depth: number;
  branch: 'root' | 'right' | 'left';
  status: 'active' | 'waiting' | 'done' | 'pending' | 'base-null';
  activeNodeVal: number | null;
  activeNodeId?: string | number;
  sum: number;
  valueTransition?: { oldVal: number; newVal: number };
  treeSnapshot: TreeNode | null;
  children: TreeOfTreesNode[];
  leftChild?: TreeOfTreesNode | null;
  rightChild?: TreeOfTreesNode | null;
}

export interface TreeOfTreesRenderOptions {
  activeNodeId?: string;
  primaryColor?: string;
  secondaryColor?: string;
  visitedColor?: string;
}

interface LayoutItem {
  node: TreeOfTreesNode;
  x: number;
  y: number;
  width: number;
  height: number;
  children: LayoutItem[];
  leftChild?: LayoutItem | null;
  rightChild?: LayoutItem | null;
}

interface ViewState {
  scale: number;
  tx: number;
  ty: number;
  isDragging: boolean;
  startX: number;
  startY: number;
}
const viewStateMap = new WeakMap<HTMLElement, ViewState>();

export class TreeOfTreesCanvasAdapter {
  private static getViewState(container: HTMLElement): ViewState {
    let state = viewStateMap.get(container);
    if (!state) {
      state = { scale: 1, tx: 0, ty: 0, isDragging: false, startX: 0, startY: 0 };
      viewStateMap.set(container, state);
    }
    return state;
  }

  /**
   * 采用二叉树经典中序遍历几何排布，确保左孩子恒在左、右孩子恒在右
   * 每个节点搭载完整尺寸的状态二叉树沙盘 (Full State Tree)
   */
  private static computeBinaryTreeLayout(root: TreeOfTreesNode): { items: LayoutItem[]; rootItem: LayoutItem; totalW: number; totalH: number } {
    const cardW = 310;
    const cardH = 224;
    const slotW = cardW + 44;
    const levelH = cardH + 76;
    const topPad = 42;

    // 1. 中序遍历收集节点并分配水平槽位索引 (Inorder Slot Index)
    let slotIndex = 0;
    const slotMap = new Map<TreeOfTreesNode, number>();

    const assignSlots = (n: TreeOfTreesNode | null | undefined) => {
      if (!n) return;
      const l = n.leftChild || n.children.find((c) => c.branch === 'left');
      const r = n.rightChild || n.children.find((c) => c.branch === 'right');
      
      assignSlots(l);
      slotMap.set(n, slotIndex++);
      assignSlots(r);
    };

    assignSlots(root);

    // 2. 构造具有真实几何坐标的 LayoutItem
    const allItems: LayoutItem[] = [];

    const buildItem = (n: TreeOfTreesNode): LayoutItem => {
      const idx = slotMap.get(n) ?? 0;
      const x = 60 + idx * slotW + cardW / 2;
      const y = topPad + n.depth * levelH;

      const lNode = n.leftChild || n.children.find((c) => c.branch === 'left');
      const rNode = n.rightChild || n.children.find((c) => c.branch === 'right');

      const lItem = lNode ? buildItem(lNode) : null;
      const rItem = rNode ? buildItem(rNode) : null;

      const children: LayoutItem[] = [];
      if (lItem) children.push(lItem);
      if (rItem) children.push(rItem);

      const item: LayoutItem = {
        node: n,
        x,
        y,
        width: cardW,
        height: cardH,
        children,
        leftChild: lItem,
        rightChild: rItem,
      };

      allItems.push(item);
      return item;
    };

    const rootItem = buildItem(root);

    const maxX = Math.max(...allItems.map((it) => it.x + it.width / 2)) + 80;
    const maxY = Math.max(...allItems.map((it) => it.y + it.height)) + 80;

    return {
      items: allItems,
      rootItem,
      totalW: Math.max(960, maxX),
      totalH: Math.max(580, maxY),
    };
  }

  /**
   * 构造完整二叉树状态沙盘 SVG (Full Complete State Tree SVG)
   * 100% 像素级复刻 tree-svg.ts 完整二叉树几何与样式：
   * - 完整圆节点 r=19、粗体 13px 数值标签、标准 2.5px 枝干连线
   * - 当前活跃/转换节点采用翡翠绿 (#059669) + 琥珀暖光晕聚焦
   * - 其余节点采用经典白底 + 板岩色描边 (#64748b)，彻底告别 6px 微缩缩略图
   */
  private static buildFullStateTreeSvg(
    root: TreeNode | null,
    activeVal: number | null,
    activeNodeId?: string | number,
    boxW = 294,
    boxH = 166
  ): string {
    if (!root) {
      return `<text x="${boxW / 2}" y="${boxH / 2}" text-anchor="middle" font-size="12" font-weight="600" fill="#94a3b8">（空树）</text>`;
    }

    const lh = 46;
    const getSubtreeHeight = (n: TreeNode | null): number => {
      if (!n) return 0;
      return 1 + Math.max(getSubtreeHeight(n.left), getSubtreeHeight(n.right));
    };
    const treeH = getSubtreeHeight(root);
    const startY = treeH === 1 ? 70 : treeH === 2 ? 48 : 36;
    const viewBoxH = treeH === 1 ? 140 : treeH === 2 ? 170 : Math.max(205, (treeH - 1) * lh + 68);

    const lines: string[] = [];
    const nodes: string[] = [];

    const isNodeActive = (n: TreeNode): boolean => {
      if (activeNodeId !== undefined && n.id !== undefined) {
        return String(n.id) === String(activeNodeId);
      }
      return activeVal !== null && n.val === activeVal;
    };

    const draw = (n: TreeNode, x: number, y: number, spread: number) => {
      const isH = isNodeActive(n);

      if (n.left) {
        const lx = x - spread;
        const ly = y + lh;
        lines.push(
          `<line x1="${x}" y1="${y}" x2="${lx}" y2="${ly}" stroke="${isH ? '#94a3b8' : '#cbd5e1'}" stroke-width="2.5" />`
        );
        draw(n.left, lx, ly, spread / 2);
      }

      if (n.right) {
        const rx = x + spread;
        const ry = y + lh;
        lines.push(
          `<line x1="${x}" y1="${y}" x2="${rx}" y2="${ry}" stroke="${isH ? '#94a3b8' : '#cbd5e1'}" stroke-width="2.5" />`
        );
        draw(n.right, rx, ry, spread / 2);
      }

      const fill = isH ? '#059669' : '#ffffff';
      const stroke = isH ? '#059669' : '#64748b';
      const strokeW = isH ? '3.5' : '2.5';
      const textFill = isH ? '#ffffff' : '#0f172a';
      const filterAttr = isH ? 'filter="drop-shadow(0 2px 4px rgba(245,158,11,0.35))"' : '';

      nodes.push(`
        <g>
          <circle cx="${x}" cy="${y}" r="19" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" ${filterAttr}/>
          <text x="${x}" y="${y + 5}" text-anchor="middle" fill="${textFill}" font-family="'JetBrains Mono', Consolas, monospace" font-size="13" font-weight="700">${n.val}</text>
        </g>
      `);
    };

    draw(root, 300, startY, 120);

    return `
      <svg x="0" y="0" width="${boxW}" height="${boxH}" viewBox="55 4 490 ${viewBoxH}" preserveAspectRatio="xMidYMid meet">
        <g class="tot-full-tree-branches">${lines.join('')}</g>
        <g class="tot-full-tree-nodes">${nodes.join('')}</g>
      </svg>
    `;
  }

  /**
   * 核心渲染主入口
   */
  public static render(
    container: HTMLElement,
    rootNode: TreeOfTreesNode | null,
    options: TreeOfTreesRenderOptions = {}
  ): void {
    if (!container) return;
    container.innerHTML = '';

    if (!rootNode) {
      container.innerHTML = `
        <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 260px; width: 100%; color: #64748b;">
          <span style="font-size: 24px; margin-bottom: 6px;">🌳</span>
          <span style="font-size: 11px;">（暂无调用推演数据）</span>
        </div>
      `;
      return;
    }

    const state = this.getViewState(container);

    // 1. 二叉树中序槽位空间度量
    const { items: flatItems, totalW, totalH } = this.computeBinaryTreeLayout(rootNode);

    // 2. 构建外层画板容器 DOM
    const wrapper = document.createElement('div');
    wrapper.style.cssText =
      'width: 100%; height: 100%; min-height: 0; position: relative; overflow: hidden; background: #f8fafc; border-radius: 8px; user-select: none;';

    // 视口平移缩放控制工具栏
    const ctrlBar = document.createElement('div');
    ctrlBar.style.cssText =
      'position: absolute; right: 10px; bottom: 10px; display: inline-flex; gap: 4px; z-index: 20; background: rgba(255, 255, 255, 0.92); padding: 3px 5px; border-radius: 6px; border: 1px solid #cbd5e1; box-shadow: 0 2px 6px rgba(0,0,0,0.06);';
    ctrlBar.innerHTML = `
      <button id="tot-zoom-in" style="border:none; background:#f1f5f9; border-radius:4px; padding:2px 7px; font-size:11px; font-weight:700; cursor:pointer; color:#334155;">＋</button>
      <button id="tot-zoom-out" style="border:none; background:#f1f5f9; border-radius:4px; padding:2px 7px; font-size:11px; font-weight:700; cursor:pointer; color:#334155;">－</button>
      <button id="tot-focus" style="border:none; background:#ecfdf5; border-radius:4px; padding:2px 7px; font-size:10.5px; font-weight:600; cursor:pointer; color:#059669;">🎯 聚焦活跃</button>
      <button id="tot-reset" style="border:none; background:#f1f5f9; border-radius:4px; padding:2px 7px; font-size:10.5px; font-weight:600; cursor:pointer; color:#1d4ed8;">⟲ 重置</button>
    `;
    wrapper.appendChild(ctrlBar);

    // SVG 主舞台
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', `0 0 ${totalW} ${totalH}`);
    svg.style.cursor = 'grab';

    // 箭头定义与滤镜
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <marker id="tot-arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#2563eb"/>
      </marker>
      <marker id="tot-arrow-green" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#10b981"/>
      </marker>
      <marker id="tot-arrow-gray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94a3b8"/>
      </marker>
      <filter id="tot-card-shadow" x="-8%" y="-8%" width="120%" height="125%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.08"/>
      </filter>
      <filter id="tot-active-glow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#2563eb" flood-opacity="0.38"/>
      </filter>
    `;
    svg.appendChild(defs);

    const mainG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    mainG.setAttribute('id', 'tot-main-group');
    mainG.setAttribute(
      'transform',
      `translate(${state.tx}, ${state.ty}) scale(${state.scale})`
    );
    svg.appendChild(mainG);

    // 3. 绘制真·二叉树分支斜向枝干 (Diagonal Tree Connectors)
    const connectorsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    for (const parent of flatItems) {
      const pX = parent.x;
      const pY = parent.y + parent.height;

      const childrenWithBranch = [
        { item: parent.leftChild, isRight: false },
        { item: parent.rightChild, isRight: true },
      ].filter((entry): entry is { item: LayoutItem; isRight: boolean } => Boolean(entry.item));

      for (const { item: child, isRight } of childrenWithBranch) {
        const cX = child.x;
        const cY = child.y;

        const isChildActive = child.node.status === 'active';
        const isChildDone = child.node.status === 'done';
        const strokeColor = isChildActive ? '#2563eb' : isChildDone ? '#10b981' : '#cbd5e1';
        const marker = isChildActive
          ? 'url(#tot-arrow-blue)'
          : isChildDone
          ? 'url(#tot-arrow-green)'
          : 'url(#tot-arrow-gray)';
        const strokeW = isChildActive ? '2.5' : '1.8';

        // 平滑对角斜向贝塞尔曲线
        const midY = (pY + cY) / 2;
        const pathData = `M ${pX} ${pY} C ${pX} ${midY}, ${cX} ${midY}, ${cX} ${cY - 4}`;

        const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathEl.setAttribute('d', pathData);
        pathEl.setAttribute('fill', 'none');
        pathEl.setAttribute('stroke', strokeColor);
        pathEl.setAttribute('stroke-width', strokeW);
        pathEl.setAttribute('marker-end', marker);
        connectorsGroup.appendChild(pathEl);

        // 分支标签 (右深入 ➔ / 左深入 ➔)
        const labelX = (pX + cX) / 2 + (isRight ? 18 : -18);
        const labelY = midY - 2;
        const labelText = isRight ? '右深入 ➔' : '左深入 ➔';

        const labelG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        labelG.innerHTML = `
          <rect x="${labelX - 26}" y="${labelY - 8}" width="52" height="16" rx="4" fill="#ffffff" stroke="${strokeColor}" stroke-width="1.2" opacity="0.96"/>
          <text x="${labelX}" y="${labelY + 3.5}" text-anchor="middle" font-size="9" font-family="'JetBrains Mono', Consolas, sans-serif" font-weight="700" fill="${isChildActive ? '#1d4ed8' : isChildDone ? '#047857' : '#64748b'}">${labelText}</text>
        `;
        connectorsGroup.appendChild(labelG);
      }
    }
    mainG.appendChild(connectorsGroup);

    // 4. 绘制每个递归层级挂载的完整二叉树状态卡片 (Full State Tree Cards)
    const cardsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    for (const item of flatItems) {
      const { node, x, y, width: w, height: h } = item;
      const left = x - w / 2;
      const isActive = node.status === 'active';
      const isDone = node.status === 'done';
      const isWaiting = node.status === 'waiting';
      const isPending = node.status === 'pending';

      const cardG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      cardG.setAttribute('transform', `translate(${left}, ${y})`);
      cardG.style.cursor = 'pointer';

      const borderColor = isActive ? '#2563eb' : isDone ? '#10b981' : isWaiting ? '#93c5fd' : '#cbd5e1';
      const borderW = isActive ? '2.8' : isDone ? '1.8' : '1.2';
      const borderDash = isWaiting ? 'stroke-dasharray="5,3"' : isPending ? 'stroke-dasharray="4,4"' : '';
      const headerBg = isActive ? '#eff6ff' : isDone ? '#ecfdf5' : isWaiting ? '#f0f9ff' : '#f8fafc';
      const titleColor = isActive ? '#1d4ed8' : isDone ? '#047857' : isWaiting ? '#0284c7' : '#64748b';

      const statusPillText = isActive ? '⚡ 活跃' : isDone ? '✅ 已结算' : isWaiting ? '⏳ 等待' : '💤 待深入';
      const statusPillBg = isActive ? '#dbeafe' : isDone ? '#dcfce7' : isWaiting ? '#e0f2fe' : '#f1f5f9';
      const statusPillColor = isActive ? '#1e40af' : isDone ? '#15803d' : isWaiting ? '#0369a1' : '#94a3b8';

      // 构建当前递归帧挂载的完整状态二叉树 SVG
      const fullTreeBoxW = w - 16;
      const fullTreeBoxH = h - 54;
      const fullTreeSvg = this.buildFullStateTreeSvg(
        node.treeSnapshot,
        node.activeNodeVal,
        node.activeNodeId,
        fullTreeBoxW,
        fullTreeBoxH
      );

      // 底部累加和转折
      let footerText = `sum = ${node.sum}`;
      if (node.valueTransition) {
        footerText = `${node.valueTransition.oldVal} ➔ ${node.valueTransition.newVal} (sum=${node.sum})`;
      } else if (isPending) {
        footerText = '等待递归深入...';
      }

      cardG.innerHTML = `
        <!-- 卡片外框与投影 -->
        <rect x="0" y="0" width="${w}" height="${h}" rx="10" fill="#ffffff" stroke="${borderColor}" stroke-width="${borderW}" ${borderDash} filter="${isActive ? 'url(#tot-active-glow)' : 'url(#tot-card-shadow)'}"/>
        
        <!-- 卡片顶栏 -->
        <path d="M 0 10 Q 0 0 10 0 L ${w - 10} 0 Q ${w} 0 ${w} 10 L ${w} 26 L 0 26 Z" fill="${headerBg}"/>
        <line x1="0" y1="26" x2="${w}" y2="26" stroke="${isActive ? '#bfdbfe' : '#e2e8f0'}" stroke-width="1"/>
        
        <text x="10" y="17" font-size="10.5" font-family="'JetBrains Mono', Consolas, monospace" font-weight="800" fill="${titleColor}">
          d=${node.depth} · ${node.funcCall}
        </text>
        
        <!-- 状态徽章 -->
        <rect x="${w - 58}" y="5" width="50" height="16" rx="4" fill="${statusPillBg}"/>
        <text x="${w - 33}" y="16" text-anchor="middle" font-size="8.5" font-family="sans-serif" font-weight="700" fill="${statusPillColor}">
          ${statusPillText}
        </text>

        <!-- 中部完整二叉树状态沙盘 (Full State Tree Sandbox) -->
        <g transform="translate(8, 29)">
          <rect x="0" y="0" width="${fullTreeBoxW}" height="${fullTreeBoxH}" rx="6" fill="#ffffff" stroke="#f1f5f9" stroke-width="1"/>
          ${fullTreeSvg}
        </g>

        <!-- 卡片底栏：累加值监控条 -->
        <line x1="0" y1="${h - 24}" x2="${w}" y2="${h - 24}" stroke="#f1f5f9" stroke-width="1"/>
        <text x="10" y="${h - 8}" font-size="9.5" font-family="'JetBrains Mono', Consolas, monospace" font-weight="700" fill="${isActive ? '#2563eb' : isDone ? '#059669' : '#64748b'}">
          💰 ${footerText}
        </text>
      `;

      cardsGroup.appendChild(cardG);
    }
    mainG.appendChild(cardsGroup);

    wrapper.appendChild(svg);
    container.appendChild(wrapper);

    // 5. 绑定平移、聚焦与滚轮缩放事件
    const syncTransform = () => {
      mainG.setAttribute(
        'transform',
        `translate(${state.tx}, ${state.ty}) scale(${state.scale})`
      );
    };

    const zoomInBtn = ctrlBar.querySelector('#tot-zoom-in') as HTMLButtonElement | null;
    const zoomOutBtn = ctrlBar.querySelector('#tot-zoom-out') as HTMLButtonElement | null;
    const focusBtn = ctrlBar.querySelector('#tot-focus') as HTMLButtonElement | null;
    const resetBtn = ctrlBar.querySelector('#tot-reset') as HTMLButtonElement | null;

    if (focusBtn) {
      focusBtn.onclick = (e) => {
        e.stopPropagation();
        const activeItem = flatItems.find((it) => it.node.status === 'active') || flatItems[0];
        if (activeItem) {
          state.scale = 1.15;
          state.tx = totalW / 2 - activeItem.x * state.scale;
          state.ty = totalH / 2 - (activeItem.y + activeItem.height / 2) * state.scale;
          syncTransform();
        }
      };
    }

    if (zoomInBtn) {
      zoomInBtn.onclick = (e) => {
        e.stopPropagation();
        state.scale = Math.min(2.5, state.scale + 0.15);
        syncTransform();
      };
    }
    if (zoomOutBtn) {
      zoomOutBtn.onclick = (e) => {
        e.stopPropagation();
        state.scale = Math.max(0.4, state.scale - 0.15);
        syncTransform();
      };
    }
    if (resetBtn) {
      resetBtn.onclick = (e) => {
        e.stopPropagation();
        state.scale = 1;
        state.tx = 0;
        state.ty = 0;
        syncTransform();
      };
    }

    svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      state.scale = Math.max(0.4, Math.min(2.5, state.scale + delta));
      syncTransform();
    });

    svg.addEventListener('mousedown', (e) => {
      if (e.target instanceof SVGElement && e.target.closest('button')) return;
      state.isDragging = true;
      state.startX = e.clientX - state.tx;
      state.startY = e.clientY - state.ty;
      svg.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
      if (!state.isDragging) return;
      state.tx = e.clientX - state.startX;
      state.ty = e.clientY - state.startY;
      syncTransform();
    });

    window.addEventListener('mouseup', () => {
      if (state.isDragging) {
        state.isDragging = false;
        svg.style.cursor = 'grab';
      }
    });
  }
}
