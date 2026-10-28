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
  autoFollow: boolean;
  /** 用户手动调整过的缩放比例（跨步骤持久记忆，绝不在下一步时重置回默认缩放） */
  userScale: number | null;
  /** 上一步锁定的活跃调用节点 ID，确保中间过渡帧绝不丢失焦点或跳回根节点 */
  lastActiveNodeId: string | null;
  isDragging: boolean;
  startX: number;
  startY: number;
}
const viewStateMap = new WeakMap<HTMLElement, ViewState>();

export class TreeOfTreesCanvasAdapter {
  /**
   * 解析持久化状态宿主节点：
   * 即使上层适配器（如 BstToGstCanvasAdapter）在每一步重建内部 canvasBox 子容器，
   * 也能向上溯源锚定持久化的 #dsp-sandbox-container / #dsp-deduction-container 或父容器，
   * 确保用户的缩放比例 (userScale) 与视口状态跨步骤 100% 持久记忆。
   */
  private static resolveStateHost(container: HTMLElement): HTMLElement {
    const persistentHost = container.closest(
      '#dsp-sandbox-container, #dsp-deduction-container, .dsp-sandbox-wrap, .dsp-deduction-wrap'
    ) as HTMLElement | null;
    if (persistentHost) return persistentHost;
    if (
      container.parentElement &&
      container.parentElement !== document.body &&
      container.parentElement !== document.documentElement
    ) {
      return container.parentElement;
    }
    return container;
  }

  private static getViewState(container: HTMLElement): ViewState {
    const host = this.resolveStateHost(container);
    let state = viewStateMap.get(host);
    if (!state) {
      state = {
        scale: 1,
        tx: 0,
        ty: 0,
        autoFollow: true,
        userScale: null,
        lastActiveNodeId: null,
        isDragging: false,
        startX: 0,
        startY: 0,
      };
      viewStateMap.set(host, state);
    }
    return state;
  }

  /**
   * 紧凑型二叉树轮廓布局算法 (Compact Contour Binary Tree Layout)
   * 1. 基于左右子树每层轮廓线 (Level Contours) 动态紧缩水平间距，彻底消灭传统全局中序槽位造成的中间巨型空白断层；
   * 2. 严格维持左孩子在左 (left.x < parent.x)、右孩子在右 (right.x > parent.x) 的真·二叉树几何拓扑；
   * 3. 每个节点搭载完整尺寸的状态二叉树沙盘 (Full State Tree)。
   */
  private static computeBinaryTreeLayout(root: TreeOfTreesNode): { items: LayoutItem[]; rootItem: LayoutItem; totalW: number; totalH: number } {
    const cardW = 316;
    const cardH = 220;
    const siblingGap = 38;
    const singleBranchOffset = 175;
    const levelH = cardH + 54;
    const topPad = 36;

    const allItems: LayoutItem[] = [];

    const shiftSubtree = (item: LayoutItem | null | undefined, dx: number) => {
      if (!item || dx === 0) return;
      item.x += dx;
      shiftSubtree(item.leftChild, dx);
      shiftSubtree(item.rightChild, dx);
    };

    const getContours = (
      item: LayoutItem,
      minMap = new Map<number, number>(),
      maxMap = new Map<number, number>()
    ): { minMap: Map<number, number>; maxMap: Map<number, number> } => {
      const d = item.node.depth;
      const leftEdge = item.x - item.width / 2;
      const rightEdge = item.x + item.width / 2;
      minMap.set(d, Math.min(minMap.get(d) ?? Infinity, leftEdge));
      maxMap.set(d, Math.max(maxMap.get(d) ?? -Infinity, rightEdge));
      if (item.leftChild) getContours(item.leftChild, minMap, maxMap);
      if (item.rightChild) getContours(item.rightChild, minMap, maxMap);
      return { minMap, maxMap };
    };

    const buildCompactItem = (n: TreeOfTreesNode): LayoutItem => {
      const lNode = n.leftChild || n.children.find((c) => c.branch === 'left');
      const rNode = n.rightChild || n.children.find((c) => c.branch === 'right');

      const lItem = lNode ? buildCompactItem(lNode) : null;
      const rItem = rNode ? buildCompactItem(rNode) : null;

      let myX = 0;
      if (lItem && rItem) {
        const lContours = getContours(lItem);
        const rContours = getContours(rItem);
        let requiredShift = 0;
        for (const [depth, lMax] of lContours.maxMap.entries()) {
          const rMin = rContours.minMap.get(depth);
          if (rMin !== undefined) {
            const overlap = lMax + siblingGap - rMin;
            if (overlap > requiredShift) {
              requiredShift = overlap;
            }
          }
        }
        // 确保左右孩子自身中心点间距至少为 cardW + siblingGap
        const minChildDist = cardW + siblingGap - (rItem.x - lItem.x);
        if (minChildDist > requiredShift) {
          requiredShift = minChildDist;
        }
        if (requiredShift > 0) {
          shiftSubtree(rItem, requiredShift);
        }
        myX = (lItem.x + rItem.x) / 2;
      } else if (lItem) {
        myX = lItem.x + singleBranchOffset;
      } else if (rItem) {
        myX = rItem.x - singleBranchOffset;
      }

      const children: LayoutItem[] = [];
      if (lItem) children.push(lItem);
      if (rItem) children.push(rItem);

      const item: LayoutItem = {
        node: n,
        x: myX,
        y: topPad + n.depth * levelH,
        width: cardW,
        height: cardH,
        children,
        leftChild: lItem,
        rightChild: rItem,
      };

      allItems.push(item);
      return item;
    };

    const rootItem = buildCompactItem(root);

    // 归一化水平坐标，左起留白 50px
    const minLeft = Math.min(...allItems.map((it) => it.x - it.width / 2));
    const offsetX = 50 - minLeft;
    shiftSubtree(rootItem, offsetX);

    const maxX = Math.max(...allItems.map((it) => it.x + it.width / 2)) + 50;
    const maxY = Math.max(...allItems.map((it) => it.y + it.height)) + 50;

    return {
      items: allItems,
      rootItem,
      totalW: Math.max(920, maxX),
      totalH: Math.max(560, maxY),
    };
  }

  /**
   * 恒定比例三层上下文平滑运镜算法 (Constant-Scale Smooth Context Camera)
   * 核心设计：
   * 1. 缩放比例恒定连续（Zero Scale Jumping）：默认缩放比仅由画布总尺寸与单卡标准尺寸决定（固定容纳约 3.1 列宽 × 3.05 层高），
   *    跨步骤推演时 scale 保持 100% 恒定连续，彻底杜绝因不同节点子树宽窄不同导致镜头在两种缩放尺寸间反复跳变；
   * 2. 若用户手动调整过缩放比例 (userScale)，全程严格沿用 userScale；
   * 3. 视口中心融合【上一棵父树 + 当前活跃树 + 下一棵子树】的直系三层重心（当前树权重 65% + 上下层直系亲属权重 35%），
   *    实现如丝般顺滑的连续平移跟拍，同时确保上一棵树、当前树与下一棵树同框可见。
   */
  private static computeFocusCamera(
    targetItem: LayoutItem,
    flatItems: LayoutItem[],
    totalW: number,
    totalH: number,
    userScale?: number | null
  ): { scale: number; tx: number; ty: number } {
    const family: LayoutItem[] = [targetItem];

    const findParent = (child: LayoutItem): LayoutItem | undefined =>
      flatItems.find((it) => it.leftChild === child || it.rightChild === child);

    const parentItem = findParent(targetItem);
    if (parentItem) {
      family.push(parentItem);
    }
    if (targetItem.leftChild) family.push(targetItem.leftChild);
    if (targetItem.rightChild) family.push(targetItem.rightChild);

    // 边界补偿：叶子节点向上纳入祖父节点，根节点向下纳入孙节点，保持垂直三层视野连续
    if (!targetItem.leftChild && !targetItem.rightChild && parentItem) {
      const grandParent = findParent(parentItem);
      if (grandParent) family.push(grandParent);
    }

    // 1. 恒定默认缩放比：仅取决于 (totalW, totalH, cardW, cardH)，在所有步骤间 100% 恒定不变，绝不随节点位置忽大忽小
    const fixedWindowW = targetItem.width * 3.1;
    const fixedWindowH = targetItem.height * 3.05;
    const defaultScale = Math.max(
      1.08,
      Math.min(1.32, Math.min(totalW / fixedWindowW, totalH / fixedWindowH))
    );
    const scale =
      userScale != null
        ? Math.max(0.4, Math.min(3.2, userScale))
        : defaultScale;

    // 2. 连续平滑重心：以当前活跃树为主锚点 (65%)，融合直系上下层父子树的几何中心 (35%)
    const minX = Math.min(...family.map((it) => it.x - it.width / 2));
    const maxX = Math.max(...family.map((it) => it.x + it.width / 2));
    const minY = Math.min(...family.map((it) => it.y));
    const maxY = Math.max(...family.map((it) => it.y + it.height));

    const familyCenterX = (minX + maxX) / 2;
    const familyCenterY = (minY + maxY) / 2;
    const centerX = targetItem.x * 0.65 + familyCenterX * 0.35;
    const centerY = (targetItem.y + targetItem.height / 2) * 0.65 + familyCenterY * 0.35;

    return {
      scale,
      tx: totalW / 2 - centerX * scale,
      ty: totalH / 2 - centerY * scale,
    };
  }

  /**
   * 构造完整二叉树状态沙盘 SVG (Full Complete State Tree SVG)
   * 100% 像素级复刻 tree-svg.ts 完整二叉树几何与样式：
   * - 完整圆节点 r=19、粗体 13.5px 数值标签、标准 2.5px 枝干连线
   * - 当前活跃/转换节点采用翡翠绿 (#059669) + 光环聚焦
   * - 已完成转换的节点采用薄荷绿底 (#ecfdf5) + 翠绿描边 (#10b981)
   * - 未转换节点保持经典白底 + 板岩色描边 (#64748b)
   */
  private static buildFullStateTreeSvg(
    root: TreeNode | null,
    activeVal: number | null,
    activeNodeId?: string | number,
    valueTransition?: { oldVal: number; newVal: number },
    boxW = 300,
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
    const startY = treeH === 1 ? 70 : treeH === 2 ? 48 : 38;
    const viewBoxH = treeH === 1 ? 136 : treeH === 2 ? 166 : Math.max(198, (treeH - 1) * lh + 64);

    const lines: string[] = [];
    const nodes: string[] = [];

    const isNodeActive = (n: TreeNode): boolean => {
      if (activeNodeId !== undefined && n.id !== undefined) {
        return String(n.id) === String(activeNodeId);
      }
      return activeVal !== null && n.val === activeVal;
    };

    const isNodeConverted = (n: TreeNode): boolean => {
      if (n.id !== undefined && String(n.id).startsWith('orig-')) {
        const orig = Number(String(n.id).replace('orig-', ''));
        if (!Number.isNaN(orig) && n.val !== orig) {
          return true;
        }
      }
      return false;
    };

    const draw = (n: TreeNode, x: number, y: number, spread: number) => {
      const isH = isNodeActive(n);
      const isConv = !isH && isNodeConverted(n);

      if (n.left) {
        const lx = x - spread;
        const ly = y + lh;
        lines.push(
          `<line x1="${x}" y1="${y}" x2="${lx}" y2="${ly}" stroke="${isH ? '#10b981' : isConv ? '#94a3b8' : '#cbd5e1'}" stroke-width="${isH ? '3' : '2.5'}" />`
        );
        draw(n.left, lx, ly, spread / 2);
      }

      if (n.right) {
        const rx = x + spread;
        const ry = y + lh;
        lines.push(
          `<line x1="${x}" y1="${y}" x2="${rx}" y2="${ry}" stroke="${isH ? '#10b981' : isConv ? '#94a3b8' : '#cbd5e1'}" stroke-width="${isH ? '3' : '2.5'}" />`
        );
        draw(n.right, rx, ry, spread / 2);
      }

      const fill = isH ? '#059669' : isConv ? '#ecfdf5' : '#ffffff';
      const stroke = isH ? '#047857' : isConv ? '#10b981' : '#64748b';
      const strokeW = isH ? '3.5' : '2.5';
      const textFill = isH ? '#ffffff' : isConv ? '#047857' : '#0f172a';
      const filterAttr = isH ? 'filter="drop-shadow(0 2px 5px rgba(5,150,105,0.45))"' : '';

      // 活跃节点外圈呼吸光环与原值➔新值悬浮胶囊标签
      const activeRing = isH
        ? `<circle cx="${x}" cy="${y}" r="23.5" fill="none" stroke="#6ee7b7" stroke-width="2" opacity="0.9"/>`
        : '';
      const transitionBadge =
        isH && valueTransition
          ? `<g transform="translate(${x}, ${y - 29})">
               <rect x="-28" y="-8" width="56" height="15" rx="4" fill="#fef3c7" stroke="#f59e0b" stroke-width="1.2"/>
               <text x="0" y="2.8" text-anchor="middle" font-size="9.5" font-family="'JetBrains Mono', Consolas, monospace" font-weight="800" fill="#b45309">${valueTransition.oldVal}➔${valueTransition.newVal}</text>
             </g>`
          : '';

      nodes.push(`
        <g>
          ${activeRing}
          <circle cx="${x}" cy="${y}" r="19" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" ${filterAttr}/>
          <text x="${x}" y="${y + 5}" text-anchor="middle" fill="${textFill}" font-family="'JetBrains Mono', Consolas, monospace" font-size="13.5" font-weight="800">${n.val}</text>
          ${transitionBadge}
        </g>
      `);
    };

    draw(root, 300, startY, 120);

    return `
      <svg x="0" y="0" width="${boxW}" height="${boxH}" viewBox="68 4 464 ${viewBoxH}" preserveAspectRatio="xMidYMid meet">
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

    // 1. 紧凑型二叉树轮廓布局度量
    const { items: flatItems, rootItem, totalW, totalH } = this.computeBinaryTreeLayout(rootNode);

    // 1.5 连续焦点追踪与恒定缩放：
    // 注意 flatItems 为后序遍历序列（根节点在末尾），回退查找 waiting 节点时必须取最大深度节点或延续上一步焦点，严禁 .pop() 误取根节点导致镜头跳回顶部！
    const waitingItems = flatItems.filter((it) => it.node.status === 'waiting');
    const deepestWaiting =
      waitingItems.length > 0
        ? waitingItems.reduce((a, b) => (b.node.depth >= a.node.depth ? b : a))
        : undefined;
    const rememberedItem = state.lastActiveNodeId
      ? flatItems.find((it) => it.node.id === state.lastActiveNodeId)
      : undefined;

    const activeItem =
      flatItems.find((it) => it.node.status === 'active') ||
      rememberedItem ||
      deepestWaiting ||
      rootItem;

    if (activeItem) {
      state.lastActiveNodeId = activeItem.node.id;
    }

    if (state.autoFollow && activeItem) {
      const cam = this.computeFocusCamera(activeItem, flatItems, totalW, totalH, state.userScale);
      state.scale = cam.scale;
      state.tx = cam.tx;
      state.ty = cam.ty;
    }

    // 2. 构建外层画板容器 DOM
    const wrapper = document.createElement('div');
    wrapper.style.cssText =
      'width: 100%; height: 100%; min-height: 0; position: relative; overflow: hidden; background: #f8fafc; border-radius: 8px; user-select: none;';

    // 视口平移缩放控制工具栏
    const ctrlBar = document.createElement('div');
    ctrlBar.style.cssText =
      'position: absolute; right: 10px; bottom: 10px; display: inline-flex; gap: 4px; z-index: 20; background: rgba(255, 255, 255, 0.94); padding: 4px 6px; border-radius: 6px; border: 1px solid #cbd5e1; box-shadow: 0 2px 8px rgba(0,0,0,0.08);';
    const isAuto = state.autoFollow;
    ctrlBar.innerHTML = `
      <button id="tot-zoom-in" title="放大" style="border:none; background:#f1f5f9; border-radius:4px; padding:2px 8px; font-size:11px; font-weight:700; cursor:pointer; color:#334155;">＋</button>
      <button id="tot-zoom-out" title="缩小" style="border:none; background:#f1f5f9; border-radius:4px; padding:2px 8px; font-size:11px; font-weight:700; cursor:pointer; color:#334155;">－</button>
      <button id="tot-focus" title="自动聚焦并放大当前活跃状态树" style="border:1px solid ${isAuto ? '#10b981' : 'transparent'}; background:${isAuto ? '#ecfdf5' : '#f1f5f9'}; border-radius:4px; padding:2px 8px; font-size:10.5px; font-weight:700; cursor:pointer; color:#059669;">🎯 聚焦活跃</button>
      <button id="tot-reset" title="查看全景总览" style="border:none; background:#f1f5f9; border-radius:4px; padding:2px 8px; font-size:10.5px; font-weight:600; cursor:pointer; color:#1d4ed8;">⟲ 全景重置</button>
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
    mainG.style.transition = state.isDragging ? 'none' : 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)';
    mainG.setAttribute(
      'transform',
      `translate(${state.tx}, ${state.ty}) scale(${state.scale})`
    );
    svg.appendChild(mainG);

    const syncTransform = (withTransition = false) => {
      mainG.style.transition = withTransition
        ? 'transform 0.28s cubic-bezier(0.22, 1, 0.36, 1)'
        : 'none';
      mainG.setAttribute(
        'transform',
        `translate(${state.tx}, ${state.ty}) scale(${state.scale})`
      );
    };

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
        const strokeW = isChildActive ? '2.8' : '1.8';

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
          <rect x="${labelX - 28}" y="${labelY - 8}" width="56" height="16" rx="4" fill="#ffffff" stroke="${strokeColor}" stroke-width="1.2" opacity="0.96"/>
          <text x="${labelX}" y="${labelY + 3.5}" text-anchor="middle" font-size="9.5" font-family="'JetBrains Mono', Consolas, sans-serif" font-weight="700" fill="${isChildActive ? '#1d4ed8' : isChildDone ? '#047857' : '#64748b'}">${labelText}</text>
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
      const borderW = isActive ? '3' : isDone ? '1.8' : '1.2';
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
        node.valueTransition,
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
        
        <text x="10" y="17.5" font-size="11" font-family="'JetBrains Mono', Consolas, monospace" font-weight="800" fill="${titleColor}">
          d=${node.depth} · ${node.funcCall}
        </text>
        
        <!-- 状态徽章 -->
        <rect x="${w - 60}" y="5" width="52" height="16" rx="4" fill="${statusPillBg}"/>
        <text x="${w - 34}" y="16" text-anchor="middle" font-size="9" font-family="sans-serif" font-weight="700" fill="${statusPillColor}">
          ${statusPillText}
        </text>

        <!-- 中部完整二叉树状态沙盘 (Full State Tree Sandbox) -->
        <g transform="translate(8, 29)">
          <rect x="0" y="0" width="${fullTreeBoxW}" height="${fullTreeBoxH}" rx="6" fill="#ffffff" stroke="#f1f5f9" stroke-width="1"/>
          ${fullTreeSvg}
        </g>

        <!-- 卡片底栏：累加值监控条 -->
        <line x1="0" y1="${h - 24}" x2="${w}" y2="${h - 24}" stroke="#f1f5f9" stroke-width="1"/>
        <text x="10" y="${h - 8}" font-size="10.5" font-family="'JetBrains Mono', Consolas, monospace" font-weight="800" fill="${isActive ? '#2563eb' : isDone ? '#059669' : '#64748b'}">
          💰 ${footerText}
        </text>
      `;

      // 点击任意卡片可平滑聚焦至该卡片（保留用户自定义缩放比例）
      cardG.addEventListener('click', (e) => {
        e.stopPropagation();
        const cam = this.computeFocusCamera(item, flatItems, totalW, totalH, state.userScale);
        state.scale = cam.scale;
        state.tx = cam.tx;
        state.ty = cam.ty;
        syncTransform(true);
      });

      cardsGroup.appendChild(cardG);
    }
    mainG.appendChild(cardsGroup);

    wrapper.appendChild(svg);
    container.appendChild(wrapper);

    // 5. 绑定平移、聚焦与以视口中心为锚点的缩放事件（持久化记住用户手动调整的缩放比例）
    const zoomAtCenter = (nextScale: number, smooth = true) => {
      const clamped = Math.max(0.4, Math.min(3.2, nextScale));
      const cx = totalW / 2;
      const cy = totalH / 2;
      const worldX = (cx - state.tx) / state.scale;
      const worldY = (cy - state.ty) / state.scale;
      state.scale = clamped;
      state.userScale = clamped;
      state.tx = cx - worldX * state.scale;
      state.ty = cy - worldY * state.scale;
      syncTransform(smooth);
    };

    const zoomInBtn = ctrlBar.querySelector('#tot-zoom-in') as HTMLButtonElement | null;
    const zoomOutBtn = ctrlBar.querySelector('#tot-zoom-out') as HTMLButtonElement | null;
    const focusBtn = ctrlBar.querySelector('#tot-focus') as HTMLButtonElement | null;
    const resetBtn = ctrlBar.querySelector('#tot-reset') as HTMLButtonElement | null;

    if (focusBtn) {
      focusBtn.onclick = (e) => {
        e.stopPropagation();
        state.autoFollow = true;
        if (activeItem) {
          const cam = this.computeFocusCamera(activeItem, flatItems, totalW, totalH, state.userScale);
          state.scale = cam.scale;
          state.tx = cam.tx;
          state.ty = cam.ty;
          syncTransform(true);
        }
      };
    }

    if (zoomInBtn) {
      zoomInBtn.onclick = (e) => {
        e.stopPropagation();
        zoomAtCenter(state.scale * 1.2, true);
      };
    }
    if (zoomOutBtn) {
      zoomOutBtn.onclick = (e) => {
        e.stopPropagation();
        zoomAtCenter(state.scale / 1.2, true);
      };
    }
    if (resetBtn) {
      resetBtn.onclick = (e) => {
        e.stopPropagation();
        state.autoFollow = false;
        state.userScale = null;
        state.scale = 1;
        state.tx = 0;
        state.ty = 0;
        syncTransform(true);
      };
    }

    svg.addEventListener('wheel', (e) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.9 : 1.1;
      zoomAtCenter(state.scale * factor, false);
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
      state.autoFollow = false;
      state.tx = e.clientX - state.startX;
      state.ty = e.clientY - state.startY;
      syncTransform(false);
    });

    window.addEventListener('mouseup', () => {
      if (state.isDragging) {
        state.isDragging = false;
        svg.style.cursor = 'grab';
      }
    });
  }
}
