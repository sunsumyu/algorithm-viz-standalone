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
   */
  private static computeBinaryTreeLayout(root: TreeOfTreesNode): { items: LayoutItem[]; rootItem: LayoutItem; totalW: number; totalH: number } {
    const cardW = 164;
    const cardH = 118;
    const slotW = cardW + 32;
    const levelH = 176;
    const topPad = 36;

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
      const x = 50 + idx * slotW + cardW / 2;
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

    const maxX = Math.max(...allItems.map((it) => it.x + it.width / 2)) + 60;
    const maxY = Math.max(...allItems.map((it) => it.y + it.height)) + 60;

    return {
      items: allItems,
      rootItem,
      totalW: Math.max(900, maxX),
      totalH: Math.max(520, maxY),
    };
  }

  /**
   * 收集微缩二叉树几何结构
   */
  private static buildMiniTreeSvg(
    root: TreeNode | null,
    activeVal: number | null,
    visitedVals: Set<number>,
    boxW = 148,
    boxH = 60
  ): string {
    if (!root) {
      return `<text x="${boxW / 2}" y="${boxH / 2}" text-anchor="middle" font-size="9" fill="#94a3b8">空树</text>`;
    }

    interface MiniNode {
      val: number;
      x: number;
      y: number;
      left?: MiniNode | null;
      right?: MiniNode | null;
    }

    const getTreeDepth = (n: TreeNode | null): number => {
      if (!n) return 0;
      return 1 + Math.max(getTreeDepth(n.left), getTreeDepth(n.right));
    };

    const totalDepth = Math.max(1, getTreeDepth(root));
    const levelHeight = totalDepth > 3 ? 14 : 16;

    const placeNodes = (n: TreeNode | null, depth: number, x: number, spanX: number): MiniNode | null => {
      if (!n) return null;
      const y = 10 + depth * levelHeight;
      const childSpan = spanX / 2;
      return {
        val: n.val,
        x,
        y,
        left: placeNodes(n.left, depth + 1, x - childSpan, childSpan),
        right: placeNodes(n.right, depth + 1, x + childSpan, childSpan),
      };
    };

    const layoutRoot = placeNodes(root, 0, boxW / 2, boxW / 4);
    if (!layoutRoot) return '';

    const lines: string[] = [];
    const circles: string[] = [];

    const traverse = (mn: MiniNode) => {
      if (mn.left) {
        lines.push(
          `<line x1="${mn.x}" y1="${mn.y}" x2="${mn.left.x}" y2="${mn.left.y}" stroke="#cbd5e1" stroke-width="1.2" />`
        );
        traverse(mn.left);
      }
      if (mn.right) {
        lines.push(
          `<line x1="${mn.x}" y1="${mn.y}" x2="${mn.right.x}" y2="${mn.right.y}" stroke="#cbd5e1" stroke-width="1.2" />`
        );
        traverse(mn.right);
      }

      const isActive = activeVal !== null && mn.val === activeVal;
      const isVisited = visitedVals.has(mn.val);

      const r = 6.8;
      const fill = isActive ? '#fef3c7' : isVisited ? '#ecfdf5' : '#ffffff';
      const stroke = isActive ? '#f59e0b' : isVisited ? '#10b981' : '#94a3b8';
      const strokeW = isActive ? '2.2' : '1.2';
      const textFill = isActive ? '#b45309' : isVisited ? '#047857' : '#334155';

      circles.push(`
        <g>
          ${isActive ? `<circle cx="${mn.x}" cy="${mn.y}" r="${r + 2.5}" fill="none" stroke="#fde68a" stroke-width="1.5" opacity="0.9"/>` : ''}
          <circle cx="${mn.x}" cy="${mn.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}"/>
          <text x="${mn.x}" y="${mn.y + 2.4}" text-anchor="middle" font-size="6.5" font-family="'JetBrains Mono', Consolas, monospace" font-weight="800" fill="${textFill}">${mn.val}</text>
        </g>
      `);
    };

    traverse(layoutRoot);

    return `
      <g>
        ${lines.join('')}
        ${circles.join('')}
      </g>
    `;
  }

  /**
   * 收集树中所有已访问/转换的节点值集合
   */
  private static collectVisitedVals(tree: TreeNode | null, currentVal: number | null): Set<number> {
    const s = new Set<number>();
    if (!tree) return s;
    const walk = (n: TreeNode | null) => {
      if (!n) return;
      if (currentVal !== null && n.val >= currentVal) {
        s.add(n.val);
      }
      walk(n.left);
      walk(n.right);
    };
    walk(tree);
    return s;
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
      'position: absolute; right: 10px; bottom: 10px; display: inline-flex; gap: 4px; z-index: 20; background: rgba(255, 255, 255, 0.9); padding: 3px; border-radius: 6px; border: 1px solid #cbd5e1; box-shadow: 0 2px 5px rgba(0,0,0,0.06);';
    ctrlBar.innerHTML = `
      <button id="tot-zoom-in" style="border:none; background:#f1f5f9; border-radius:4px; padding:2px 7px; font-size:11px; font-weight:700; cursor:pointer; color:#334155;">＋</button>
      <button id="tot-zoom-out" style="border:none; background:#f1f5f9; border-radius:4px; padding:2px 7px; font-size:11px; font-weight:700; cursor:pointer; color:#334155;">－</button>
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
      <marker id="tot-arrow-gray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94a3b8"/>
      </marker>
      <filter id="tot-card-shadow" x="-8%" y="-8%" width="120%" height="125%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.08"/>
      </filter>
      <filter id="tot-active-glow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#2563eb" flood-opacity="0.35"/>
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
        const marker = isChildActive ? 'url(#tot-arrow-blue)' : 'url(#tot-arrow-gray)';
        const strokeW = isChildActive ? '2.2' : '1.5';

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
        const labelX = (pX + cX) / 2 + (isRight ? 16 : -16);
        const labelY = midY - 2;
        const labelText = isRight ? '右深入 ➔' : '左深入 ➔';

        const labelG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        labelG.innerHTML = `
          <rect x="${labelX - 22}" y="${labelY - 7}" width="44" height="14" rx="3" fill="#ffffff" stroke="${strokeColor}" stroke-width="1" opacity="0.95"/>
          <text x="${labelX}" y="${labelY + 3.2}" text-anchor="middle" font-size="8" font-family="'JetBrains Mono', Consolas, sans-serif" font-weight="700" fill="${isChildActive ? '#1d4ed8' : '#64748b'}">${labelText}</text>
        `;
        connectorsGroup.appendChild(labelG);
      }
    }
    mainG.appendChild(connectorsGroup);

    // 4. 绘制二叉树拓扑节点上的微缩状态卡片 (Tree Node State Cards)
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
      const borderW = isActive ? '2.4' : isDone ? '1.5' : '1';
      const borderDash = isWaiting ? 'stroke-dasharray="4,2"' : isPending ? 'stroke-dasharray="3,3"' : '';
      const headerBg = isActive ? '#eff6ff' : isDone ? '#ecfdf5' : isWaiting ? '#f0f9ff' : '#f8fafc';
      const titleColor = isActive ? '#1d4ed8' : isDone ? '#047857' : isWaiting ? '#0284c7' : '#64748b';

      const statusPillText = isActive ? '⚡ 活跃' : isDone ? '✅ 已结算' : isWaiting ? '⏳ 等待' : '💤 待深入';
      const statusPillBg = isActive ? '#dbeafe' : isDone ? '#dcfce7' : isWaiting ? '#e0f2fe' : '#f1f5f9';
      const statusPillColor = isActive ? '#1e40af' : isDone ? '#15803d' : isWaiting ? '#0369a1' : '#94a3b8';

      // 产生该卡片对应的数据状态树
      const visitedSet = this.collectVisitedVals(node.treeSnapshot, node.activeNodeVal);
      const miniTreeSvg = this.buildMiniTreeSvg(node.treeSnapshot, node.activeNodeVal, visitedSet, w - 16, 60);

      // 底部累加和转折
      let footerText = `sum = ${node.sum}`;
      if (node.valueTransition) {
        footerText = `${node.valueTransition.oldVal} ➔ ${node.valueTransition.newVal} (sum=${node.sum})`;
      } else if (isPending) {
        footerText = '等待递归深入...';
      }

      cardG.innerHTML = `
        <!-- 卡片外框与投影 -->
        <rect x="0" y="0" width="${w}" height="${h}" rx="8" fill="#ffffff" stroke="${borderColor}" stroke-width="${borderW}" ${borderDash} filter="${isActive ? 'url(#tot-active-glow)' : 'url(#tot-card-shadow)'}"/>
        
        <!-- 卡片顶栏 -->
        <path d="M 0 8 Q 0 0 8 0 L ${w - 8} 0 Q ${w} 0 ${w} 8 L ${w} 22 L 0 22 Z" fill="${headerBg}"/>
        <line x1="0" y1="22" x2="${w}" y2="22" stroke="${isActive ? '#bfdbfe' : '#e2e8f0'}" stroke-width="1"/>
        
        <text x="7" y="14.5" font-size="8.8" font-family="'JetBrains Mono', Consolas, monospace" font-weight="800" fill="${titleColor}">
          d=${node.depth} · ${node.funcCall}
        </text>
        
        <!-- 状态徽章 -->
        <rect x="${w - 48}" y="4" width="44" height="14" rx="3" fill="${statusPillBg}"/>
        <text x="${w - 26}" y="14" text-anchor="middle" font-size="7.5" font-family="sans-serif" font-weight="700" fill="${statusPillColor}">
          ${statusPillText}
        </text>

        <!-- 中部微缩二叉树沙盘 -->
        <g transform="translate(8, 25)">
          <rect x="0" y="0" width="${w - 16}" height="66" rx="5" fill="#f8fafc" stroke="#f1f5f9" stroke-width="1"/>
          <g transform="translate(0, 3)">
            ${miniTreeSvg}
          </g>
        </g>

        <!-- 卡片底栏：累加值监控条 -->
        <line x1="0" y1="${h - 22}" x2="${w}" y2="${h - 22}" stroke="#f1f5f9" stroke-width="1"/>
        <rect x="0" y="${h - 22}" width="${w}" height="22" rx="0" fill="#ffffff"/>
        <text x="8" y="${h - 8}" font-size="8" font-family="'JetBrains Mono', Consolas, monospace" font-weight="700" fill="${isActive ? '#2563eb' : isDone ? '#059669' : '#64748b'}">
          💰 ${footerText}
        </text>
      `;

      cardsGroup.appendChild(cardG);
    }
    mainG.appendChild(cardsGroup);

    wrapper.appendChild(svg);
    container.appendChild(wrapper);

    // 5. 绑定平移与滚轮缩放事件
    const syncTransform = () => {
      mainG.setAttribute(
        'transform',
        `translate(${state.tx}, ${state.ty}) scale(${state.scale})`
      );
    };

    const zoomInBtn = ctrlBar.querySelector('#tot-zoom-in') as HTMLButtonElement | null;
    const zoomOutBtn = ctrlBar.querySelector('#tot-zoom-out') as HTMLButtonElement | null;
    const resetBtn = ctrlBar.querySelector('#tot-reset') as HTMLButtonElement | null;

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
