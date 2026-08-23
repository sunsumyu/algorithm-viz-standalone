import type { DpTreeNode } from '../dp-demo-visualizer';

/**
 * 通用 DP 执行/决策/层级树 SVG 渲染适配器
 * 采用自底向上的子树边界宽度分配算法（Collision-Free Hierarchical Layout），彻底消除节点重叠与挤压
 */
export function renderDpTreeSVG(container: HTMLElement, root: DpTreeNode | null): void {
  if (!root) {
    container.innerHTML = '<div style="color:#64748b; font-size:12px; display:flex; align-items:center; justify-content:center; height:100%;">（暂无递归调用树）</div>';
    return;
  }

  interface LayoutNode {
    id: string | number;
    val: string | number;
    status: string;
    tag?: string;
    x: number;
    y: number;
    subtreeWidth: number;
    children: LayoutNode[];
  }

  const nodeW = 68;
  const nodeH = 28;
  const minGap = 16;
  const levelH = 62;
  const topPad = 26;

  // 1. 递归提取子节点
  function getChildren(node: DpTreeNode): DpTreeNode[] {
    const ch = (node.children || []).filter((c): c is DpTreeNode => c !== null);
    if (!ch.length && node.left) ch.push(node.left);
    if (!ch.length && node.right) ch.push(node.right);
    return ch;
  }

  // 2. 第一遍自底向上：计算每个子树所需的最小独立宽度
  function measureSubtree(node: DpTreeNode): { node: DpTreeNode; width: number; children: any[] } {
    const rawChildren = getChildren(node);
    if (rawChildren.length === 0) {
      return { node, width: nodeW + minGap, children: [] };
    }
    const measuredChildren = rawChildren.map(measureSubtree);
    const sumChildrenWidth = measuredChildren.reduce((acc, c) => acc + c.width, 0);
    const width = Math.max(nodeW + minGap, sumChildrenWidth);
    return { node, width, children: measuredChildren };
  }

  // 3. 第二遍自顶向下：分配每个节点的绝对 (x, y) 坐标
  function assignPositions(
    measured: { node: DpTreeNode; width: number; children: any[] },
    depth: number,
    leftX: number
  ): LayoutNode {
    const x = leftX + measured.width / 2;
    const y = topPad + depth * levelH;

    let curLeft = leftX;
    const placedChildren: LayoutNode[] = [];

    for (const child of measured.children) {
      placedChildren.push(assignPositions(child, depth + 1, curLeft));
      curLeft += child.width;
    }

    return {
      id: measured.node.id,
      val: measured.node.val,
      status: measured.node.status || 'normal',
      tag: measured.node.tag,
      x,
      y,
      subtreeWidth: measured.width,
      children: placedChildren,
    };
  }

  // 计算最大深度
  function getMaxDepth(n: LayoutNode): number {
    if (!n.children || n.children.length === 0) return 0;
    return 1 + Math.max(...n.children.map(getMaxDepth));
  }

  const measuredTree = measureSubtree(root);
  const marginX = 24;
  const totalTreeWidth = Math.max(380, measuredTree.width + marginX * 2);
  const rootPos = assignPositions(measuredTree, 0, (totalTreeWidth - measuredTree.width) / 2);
  const maxD = getMaxDepth(rootPos);
  const totalTreeHeight = Math.max(210, topPad + maxD * levelH + 42);

  const lines: string[] = [];
  const nodes: string[] = [];

  function drawNodeAndEdges(n: LayoutNode) {
    for (const c of n.children) {
      // 贝塞尔平滑连线
      const startX = n.x;
      const startY = n.y + nodeH / 2;
      const endX = c.x;
      const endY = c.y - nodeH / 2;
      const midY = (startY + endY) / 2;

      const isCurrentBranch = n.status === 'current' && (c.status === 'current' || c.status === 'visited');
      const strokeColor = isCurrentBranch ? '#38bdf8' : c.status === 'visited' ? '#10b981' : '#475569';
      const strokeWidth = isCurrentBranch ? '2.2' : '1.4';
      const strokeDash = isCurrentBranch ? 'none' : '3,3';

      lines.push(
        `<path d="M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}" ` +
          `fill="none" stroke="${strokeColor}" stroke-width="${strokeWidth}" stroke-dasharray="${strokeDash}" />`
      );

      drawNodeAndEdges(c);
    }

    // 节点样式渲染
    const isCurrent = n.status === 'current';
    const isVisited = n.status === 'visited';
    const isDep = n.status === 'dependency';

    const stroke = isCurrent ? '#38bdf8' : isVisited ? '#10b981' : isDep ? '#f59e0b' : 'rgba(255, 255, 255, 0.16)';
    const strokeWidth = isCurrent ? '2.2' : '1.2';
    const fill = isCurrent
      ? 'rgba(14, 116, 144, 0.92)'
      : isVisited
      ? 'rgba(6, 78, 59, 0.9)'
      : isDep
      ? 'rgba(120, 53, 15, 0.9)'
      : 'rgba(15, 23, 42, 0.88)';
    const textColor = isCurrent ? '#f0f9ff' : isVisited ? '#6ee7b7' : isDep ? '#fde68a' : '#cbd5e1';
    const filterGlow = isCurrent ? 'filter="drop-shadow(0 0 8px rgba(56, 189, 248, 0.55))"' : '';

    const isHit = n.tag?.includes('HIT');
    const tagBg = isHit ? '#8b5cf6' : '#059669';
    const tagText = n.tag ? n.tag.replace('=', '') : '';

    nodes.push(`
      <g transform="translate(${n.x}, ${n.y})" ${filterGlow} style="cursor: default;">
        <rect x="${-nodeW / 2}" y="${-nodeH / 2}" width="${nodeW}" height="${nodeH}" rx="6" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
        <text x="0" y="4" text-anchor="middle" fill="${textColor}" font-size="11.5" font-weight="700" font-family="ui-monospace, monospace">${n.val}</text>
        ${
          n.tag
            ? `
          <g transform="translate(0, ${nodeH / 2 + 10})">
            <rect x="-18" y="-7" width="36" height="14" rx="4" fill="${tagBg}" fill-opacity="0.9" />
            <text x="0" y="3.5" text-anchor="middle" fill="#ffffff" font-size="8.5" font-weight="800" font-family="ui-monospace, monospace">${tagText}</text>
          </g>
        `
            : ''
        }
      </g>
    `);
  }

  drawNodeAndEdges(rootPos);

  container.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 ${totalTreeWidth} ${totalTreeHeight}" preserveAspectRatio="xMidYMid meet" style="overflow: visible; display: block; max-height: 100%;">
      ${lines.join('')}
      ${nodes.join('')}
    </svg>
  `;
}
