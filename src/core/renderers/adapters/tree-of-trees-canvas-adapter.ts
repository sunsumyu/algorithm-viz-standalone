/**
 * 树上挂树全景推演画板适配器 (Tree of Trees Canvas Adapter)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 
 * 核心设计：
 * 1. 外层母树：以函数递归调用图 (Call Tree) 为宏观骨架，呈现父子调用分支与回溯流；
 * 2. 内嵌子沙盘：母树的每个递归调用节点挂载一个高保真微缩二叉树状态沙盘 (Mini State Tree)，
 *    实时反映该层调用时的二叉树结构、当前焦点节点与累加值演变；
 * 3. 视口交互：内置平滑缩放 (Mouse Wheel Zoom)、手势拖拽平移 (Pan) 与视口复位控制；
 * 4. 纯净合规：零 h1~h6 违规，零指标卡套娃，100% 严守 Card 1 表现层死门禁。
 */

import { TreeNode } from '../tree-svg';

export interface TreeOfTreesNode {
  id: string;
  funcCall: string;
  depth: number;
  branch: 'root' | 'right' | 'left';
  status: 'active' | 'waiting' | 'done' | 'base-null';
  activeNodeVal: number | null;
  sum: number;
  valueTransition?: { oldVal: number; newVal: number };
  treeSnapshot: TreeNode | null;
  children: TreeOfTreesNode[];
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
}

// 容器视口状态弱引用缓存
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
   * 递归计算母树各节点的空间尺寸 (Tidy Hierarchy Measure)
   */
  private static measureNode(node: TreeOfTreesNode): { width: number; height: number; childMeasures: any[] } {
    const isNull = node.status === 'base-null';
    const cardW = isNull ? 110 : 210;
    const cardH = isNull ? 56 : 148;
    const gapX = 28;

    if (!node.children || node.children.length === 0) {
      return { width: cardW + gapX, height: cardH, childMeasures: [] };
    }

    const childMeasures = node.children.map((c) => this.measureNode(c));
    const totalChildW = childMeasures.reduce((sum, cm) => sum + cm.width, 0);
    return {
      width: Math.max(cardW + gapX, totalChildW),
      height: cardH,
      childMeasures,
    };
  }

  /**
   * 递归分配母树节点的 (x, y) 几何坐标
   */
  private static assignCoordinates(
    node: TreeOfTreesNode,
    measure: any,
    depth: number,
    leftX: number,
    topPad = 32
  ): LayoutItem {
    const isNull = node.status === 'base-null';
    const cardW = isNull ? 110 : 210;
    const cardH = isNull ? 56 : 148;
    const levelH = 210;

    const x = leftX + measure.width / 2;
    const y = topPad + depth * levelH;

    const children: LayoutItem[] = [];
    let curChildX = leftX;
    for (let i = 0; i < (node.children || []).length; i++) {
      const child = node.children[i];
      const childMeasure = measure.childMeasures[i];
      children.push(this.assignCoordinates(child, childMeasure, depth + 1, curChildX, topPad));
      curChildX += childMeasure.width;
    }

    return {
      node,
      x,
      y,
      width: cardW,
      height: cardH,
      children,
    };
  }

  /**
   * 扁平化收集布局树项
   */
  private static flattenLayout(item: LayoutItem, acc: LayoutItem[] = []): LayoutItem[] {
    acc.push(item);
    for (const child of item.children) {
      this.flattenLayout(child, acc);
    }
    return acc;
  }

  /**
   * 收集微缩二叉树几何结构
   */
  private static buildMiniTreeSvg(
    root: TreeNode | null,
    activeVal: number | null,
    visitedVals: Set<number>,
    boxW = 190,
    boxH = 76
  ): string {
    if (!root) {
      return `<text x="${boxW / 2}" y="${boxH / 2}" text-anchor="middle" font-size="10" fill="#94a3b8">空树</text>`;
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
    const levelHeight = totalDepth > 3 ? 18 : 22;

    const placeNodes = (n: TreeNode | null, depth: number, x: number, spanX: number): MiniNode | null => {
      if (!n) return null;
      const y = 14 + depth * levelHeight;
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

      const r = 8.5;
      const fill = isActive ? '#fef3c7' : isVisited ? '#ecfdf5' : '#ffffff';
      const stroke = isActive ? '#f59e0b' : isVisited ? '#10b981' : '#94a3b8';
      const strokeW = isActive ? '2.5' : '1.5';
      const textFill = isActive ? '#b45309' : isVisited ? '#047857' : '#334155';

      circles.push(`
        <g>
          ${isActive ? `<circle cx="${mn.x}" cy="${mn.y}" r="${r + 3.5}" fill="none" stroke="#fde68a" stroke-width="2" opacity="0.8"/>` : ''}
          <circle cx="${mn.x}" cy="${mn.y}" r="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}"/>
          <text x="${mn.x}" y="${mn.y + 3}" text-anchor="middle" font-size="7.5" font-family="'JetBrains Mono', Consolas, monospace" font-weight="800" fill="${textFill}">${mn.val}</text>
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
      // 在 BST to GST 中，值大于等于初始最大值的节点即为已处理
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

    // 1. 度量母树尺寸与坐标排布
    const measure = this.measureNode(rootNode);
    const layoutRoot = this.assignCoordinates(rootNode, measure, 0, 20, 24);
    const flatItems = this.flattenLayout(layoutRoot);

    // 计算包围盒
    const maxX = Math.max(...flatItems.map((item) => item.x + item.width / 2)) + 60;
    const maxY = Math.max(...flatItems.map((item) => item.y + item.height)) + 60;
    const totalW = Math.max(860, maxX);
    const totalH = Math.max(480, maxY);

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
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#3b82f6"/>
      </marker>
      <marker id="tot-arrow-gray" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#94a3b8"/>
      </marker>
      <filter id="tot-card-shadow" x="-8%" y="-8%" width="120%" height="125%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.08"/>
      </filter>
      <filter id="tot-active-glow" x="-15%" y="-15%" width="130%" height="130%">
        <feDropShadow dx="0" dy="0" stdDeviation="5" flood-color="#3b82f6" flood-opacity="0.35"/>
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

    // 3. 绘制母树连接枝干 (Mother Tree Connectors)
    const connectorsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    for (const parent of flatItems) {
      const pX = parent.x;
      const pY = parent.y + parent.height;

      for (const child of parent.children) {
        const cX = child.x;
        const cY = child.y;

        const isChildActive = child.node.status === 'active';
        const strokeColor = isChildActive ? '#3b82f6' : '#cbd5e1';
        const marker = isChildActive ? 'url(#tot-arrow-blue)' : 'url(#tot-arrow-gray)';
        const strokeW = isChildActive ? '2.2' : '1.5';

        // 平滑贝塞尔曲线
        const midY = (pY + cY) / 2;
        const pathData = `M ${pX} ${pY} C ${pX} ${midY}, ${cX} ${midY}, ${cX} ${cY - 4}`;

        const pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        pathEl.setAttribute('d', pathData);
        pathEl.setAttribute('fill', 'none');
        pathEl.setAttribute('stroke', strokeColor);
        pathEl.setAttribute('stroke-width', strokeW);
        pathEl.setAttribute('marker-end', marker);
        connectorsGroup.appendChild(pathEl);

        // 分支标签 (右深入 / 左深入)
        const labelX = (pX + cX) / 2 + (child.node.branch === 'right' ? 12 : -12);
        const labelY = midY - 4;
        const labelText =
          child.node.branch === 'right' ? '右深入 ➔' : child.node.branch === 'left' ? '左深入 ➔' : '递归调用';

        const labelG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        labelG.innerHTML = `
          <rect x="${labelX - 22}" y="${labelY - 8}" width="44" height="15" rx="3" fill="#ffffff" stroke="${strokeColor}" stroke-width="1" opacity="0.95"/>
          <text x="${labelX}" y="${labelY + 3}" text-anchor="middle" font-size="8.5" font-family="'JetBrains Mono', Consolas, sans-serif" font-weight="700" fill="${isChildActive ? '#1d4ed8' : '#64748b'}">${labelText}</text>
        `;
        connectorsGroup.appendChild(labelG);
      }
    }
    mainG.appendChild(connectorsGroup);

    // 4. 绘制母树挂载的各层二叉树状态沙盘卡片 (Embedded State Tree Cards)
    const cardsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    for (const item of flatItems) {
      const { node, x, y, width: w, height: h } = item;
      const left = x - w / 2;
      const isActive = node.status === 'active';
      const isDone = node.status === 'done';
      const isNull = node.status === 'base-null';

      const cardG = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      cardG.setAttribute('transform', `translate(${left}, ${y})`);
      cardG.style.cursor = 'pointer';

      if (isNull) {
        // 空节点触底基准卡片
        cardG.innerHTML = `
          <rect x="0" y="0" width="${w}" height="${h}" rx="8" fill="#ffffff" stroke="${isActive ? '#3b82f6' : '#e2e8f0'}" stroke-width="${isActive ? '2' : '1'}" filter="url(#tot-card-shadow)"/>
          <rect x="0" y="0" width="${w}" height="20" rx="8" fill="${isActive ? '#eff6ff' : '#f8fafc'}"/>
          <text x="8" y="14" font-size="9" font-family="'JetBrains Mono', monospace" font-weight="700" fill="${isActive ? '#1d4ed8' : '#64748b'}">d=${node.depth} · null</text>
          <text x="${w / 2}" y="38" text-anchor="middle" font-size="9.5" font-family="sans-serif" font-weight="600" fill="#94a3b8">🍃 触底返回 null</text>
        `;
      } else {
        // 高保真微缩状态树卡片
        const borderColor = isActive ? '#2563eb' : isDone ? '#10b981' : '#cbd5e1';
        const borderW = isActive ? '2.5' : isDone ? '1.5' : '1';
        const headerBg = isActive ? '#eff6ff' : isDone ? '#ecfdf5' : '#f8fafc';
        const titleColor = isActive ? '#1d4ed8' : isDone ? '#047857' : '#334155';

        const statusPillText = isActive ? '⚡ 活跃' : isDone ? '✅ 已结算' : '⏳ 等待回溯';
        const statusPillBg = isActive ? '#dbeafe' : isDone ? '#dcfce7' : '#f1f5f9';
        const statusPillColor = isActive ? '#1e40af' : isDone ? '#15803d' : '#64748b';

        // 产生该卡片对应的数据状态树
        const visitedSet = this.collectVisitedVals(node.treeSnapshot, node.activeNodeVal);
        const miniTreeSvg = this.buildMiniTreeSvg(node.treeSnapshot, node.activeNodeVal, visitedSet, w - 16, 76);

        // 底部累加和转折
        let footerText = `sum = ${node.sum}`;
        if (node.valueTransition) {
          footerText = `${node.valueTransition.oldVal} ➔ ${node.valueTransition.newVal} (sum=${node.sum})`;
        }

        cardG.innerHTML = `
          <!-- 卡片外框与投影 -->
          <rect x="0" y="0" width="${w}" height="${h}" rx="10" fill="#ffffff" stroke="${borderColor}" stroke-width="${borderW}" filter="${isActive ? 'url(#tot-active-glow)' : 'url(#tot-card-shadow)'}"/>
          
          <!-- 卡片顶栏 -->
          <path d="M 0 10 Q 0 0 10 0 L ${w - 10} 0 Q ${w} 0 ${w} 10 L ${w} 26 L 0 26 Z" fill="${headerBg}"/>
          <line x1="0" y1="26" x2="${w}" y2="26" stroke="${isActive ? '#bfdbfe' : '#e2e8f0'}" stroke-width="1"/>
          
          <text x="8" y="17" font-size="9.5" font-family="'JetBrains Mono', Consolas, monospace" font-weight="800" fill="${titleColor}">
            d=${node.depth} · ${node.funcCall}
          </text>
          
          <!-- 状态徽章 -->
          <rect x="${w - 56}" y="6" width="50" height="15" rx="4" fill="${statusPillBg}"/>
          <text x="${w - 31}" y="17" text-anchor="middle" font-size="8" font-family="sans-serif" font-weight="700" fill="${statusPillColor}">
            ${statusPillText}
          </text>

          <!-- 中部微缩二叉树沙盘 -->
          <g transform="translate(8, 30)">
            <rect x="0" y="0" width="${w - 16}" height="86" rx="6" fill="#f8fafc" stroke="#f1f5f9" stroke-width="1"/>
            <g transform="translate(0, 4)">
              ${miniTreeSvg}
            </g>
          </g>

          <!-- 卡片底栏：累加值监控条 -->
          <line x1="0" y1="${h - 24}" x2="${w}" y2="${h - 24}" stroke="#f1f5f9" stroke-width="1"/>
          <rect x="0" y="${h - 24}" width="${w}" height="24" rx="0" fill="#ffffff"/>
          <text x="10" y="${h - 8}" font-size="9" font-family="'JetBrains Mono', Consolas, monospace" font-weight="700" fill="${isActive ? '#2563eb' : '#059669'}">
            💰 ${footerText}
          </text>
        `;
      }

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
