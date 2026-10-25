/**
 * 通用二叉树 SVG 渲染原语 (TreeSVG)
 *
 * TreeNode / renderTreeSVG 与具体算法无关，属于 core 渲染层。
 * 从 algorithms/categories/tree/tree-template.ts 提取（review #5 依赖倒置），
 * tree-template 保留 re-export 门面以兼容既有树算法消费方。
 */

/** 二叉树节点（支持按唯一身份 id 或数值定位高亮） */
export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
  id?: number | string;
}

export function renderTreeSVG(
  container: HTMLElement,
  root: TreeNode | null,
  highlight: Set<number | string>,
  highlightColor: string,
  secondaryHighlight?: Set<number | string>,
  secondaryColor?: string,
  labels?: Map<number | string, string>,
  visitedHighlight?: Set<number | string>,
  visitedColor?: string,
): void {
  if (!root) { container.innerHTML = '<span style="color: #94a3b8; font-size: 13px; font-weight: 500;">（空树）</span>'; return; }
  container.innerHTML = '';
  const lh = 44;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '280');
  svg.setAttribute('viewBox', '0 0 600 280');

  const hasStringId = (set?: Set<number | string>): boolean => {
    if (!set) return false;
    for (const item of set) {
      if (typeof item === 'string') return true;
    }
    return false;
  };

  const primaryHasId = hasStringId(highlight);
  const secondaryHasId = hasStringId(secondaryHighlight);
  const visitedHasId = hasStringId(visitedHighlight);

  const matchNode = (set: Set<number | string> | undefined, hasId: boolean, node: TreeNode): boolean => {
    if (!set || set.size === 0) return false;
    if (node.id !== undefined && set.has(node.id)) return true;
    if (hasId) return false;
    return set.has(node.val);
  };

  const draw = (node: TreeNode, x: number, y: number, spread: number) => {
    const isH = matchNode(highlight, primaryHasId, node);
    const isS = matchNode(secondaryHighlight, secondaryHasId, node);
    const isV = matchNode(visitedHighlight, visitedHasId, node);
    if (node.left) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(x)); line.setAttribute('y1', String(y));
      line.setAttribute('x2', String(x - spread)); line.setAttribute('y2', String(y + lh));
      line.setAttribute('stroke', '#cbd5e1'); line.setAttribute('stroke-width', '2.5');
      svg.appendChild(line);
      draw(node.left, x - spread, y + lh, spread / 2);
    }
    if (node.right) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(x)); line.setAttribute('y1', String(y));
      line.setAttribute('x2', String(x + spread)); line.setAttribute('y2', String(y + lh));
      line.setAttribute('stroke', '#cbd5e1'); line.setAttribute('stroke-width', '2.5');
      svg.appendChild(line);
      draw(node.right, x + spread, y + lh, spread / 2);
    }
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', String(x)); c.setAttribute('cy', String(y)); c.setAttribute('r', '19');
    let fill = '#ffffff', stroke = '#64748b';
    if (isH) {
      fill = highlightColor || '#0284c7'; stroke = highlightColor || '#0284c7';
    } else if (isS && secondaryColor) {
      fill = secondaryColor; stroke = secondaryColor;
    } else if (isV && visitedColor) {
      fill = visitedColor; stroke = visitedColor;
    }
    c.setAttribute('fill', fill); c.setAttribute('stroke', stroke); c.setAttribute('stroke-width', '2.5');
    svg.appendChild(c);
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', String(x)); t.setAttribute('y', String(y + 5));
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('fill', isH || isS || isV ? '#ffffff' : '#0f172a');
    t.setAttribute('font-family', "'JetBrains Mono', monospace");
    t.setAttribute('font-size', '13');
    t.setAttribute('font-weight', '700');
    t.textContent = String(node.val);
    svg.appendChild(t);
    const label = (node.id !== undefined ? labels?.get(node.id) : undefined) ?? labels?.get(node.val);
    if (label) {
      const lb = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lb.setAttribute('x', String(x)); lb.setAttribute('y', String(y - 23));
      lb.setAttribute('text-anchor', 'middle');
      lb.setAttribute('fill', isH ? (highlightColor || '#0284c7') : (isV ? (visitedColor || '#059669') : '#059669'));
      lb.setAttribute('font-family', "'JetBrains Mono', monospace");
      lb.setAttribute('font-size', '11');
      lb.setAttribute('font-weight', '700');
      lb.textContent = label;
      svg.appendChild(lb);
    }
  };
  draw(root, 300, 30, 120);
  container.appendChild(svg);
}
