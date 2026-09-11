/**
 * 通用二叉树 SVG 渲染原语 (TreeSVG)
 *
 * TreeNode / renderTreeSVG 与具体算法无关，属于 core 渲染层。
 * 从 algorithms/categories/tree/tree-template.ts 提取（review #5 依赖倒置），
 * tree-template 保留 re-export 门面以兼容既有树算法消费方。
 */

/** 二叉树节点（按值定位高亮） */
export interface TreeNode {
  val: number;
  left: TreeNode | null;
  right: TreeNode | null;
}

export function renderTreeSVG(
  container: HTMLElement,
  root: TreeNode | null,
  highlight: Set<number>,
  highlightColor: string,
  secondaryHighlight?: Set<number>,
  secondaryColor?: string,
  labels?: Map<number, string>,
): void {
  if (!root) { container.innerHTML = '<span style="color:#6c7086">空树</span>'; return; }
  container.innerHTML = '';
  const lh = 44;
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '280');
  svg.setAttribute('viewBox', '0 0 600 280');

  const draw = (node: TreeNode, x: number, y: number, spread: number) => {
    const isH = highlight.has(node.val);
    const isS = secondaryHighlight?.has(node.val);
    if (node.left) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(x)); line.setAttribute('y1', String(y));
      line.setAttribute('x2', String(x - spread)); line.setAttribute('y2', String(y + lh));
      line.setAttribute('stroke', '#45475a'); line.setAttribute('stroke-width', '2');
      svg.appendChild(line);
      draw(node.left, x - spread, y + lh, spread / 2);
    }
    if (node.right) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(x)); line.setAttribute('y1', String(y));
      line.setAttribute('x2', String(x + spread)); line.setAttribute('y2', String(y + lh));
      line.setAttribute('stroke', '#45475a'); line.setAttribute('stroke-width', '2');
      svg.appendChild(line);
      draw(node.right, x + spread, y + lh, spread / 2);
    }
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', String(x)); c.setAttribute('cy', String(y)); c.setAttribute('r', '18');
    let fill = '#45475a', stroke = '#6c7086';
    if (isH) { fill = highlightColor; stroke = highlightColor; }
    else if (isS && secondaryColor) { fill = secondaryColor; stroke = secondaryColor; }
    c.setAttribute('fill', fill); c.setAttribute('stroke', stroke); c.setAttribute('stroke-width', '2');
    svg.appendChild(c);
    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', String(x)); t.setAttribute('y', String(y + 5));
    t.setAttribute('text-anchor', 'middle'); t.setAttribute('fill', isH || isS ? '#1e1e2e' : '#cdd6f4');
    t.setAttribute('font-size', '12'); t.setAttribute('font-weight', 'bold');
    t.textContent = String(node.val);
    svg.appendChild(t);
    const label = labels?.get(node.val);
    if (label) {
      const lb = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lb.setAttribute('x', String(x)); lb.setAttribute('y', String(y - 22));
      lb.setAttribute('text-anchor', 'middle'); lb.setAttribute('fill', highlightColor);
      lb.setAttribute('font-size', '10'); lb.textContent = label;
      svg.appendChild(lb);
    }
  };
  draw(root, 300, 30, 120);
  container.appendChild(svg);
}
