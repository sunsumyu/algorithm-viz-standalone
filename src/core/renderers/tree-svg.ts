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

export interface RenderTreeSvgOptions {
  dimUnvisited?: boolean;
  nullProbe?: { parentVal: number | string; branch: 'left' | 'right' };
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
  options?: RenderTreeSvgOptions,
): void {
  if (!root) { container.innerHTML = '<span style="color: #94a3b8; font-size: 13px; font-weight: 500;">（空树）</span>'; return; }
  container.innerHTML = '';
  const lh = 46;
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
    const isUnvisited = Boolean(options?.dimUnvisited && !isH && !isS && !isV);
    const nodeOpacity = isUnvisited ? '0.35' : '1';

    // 1. 左子树连线
    if (node.left) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(x)); line.setAttribute('y1', String(y));
      line.setAttribute('x2', String(x - spread)); line.setAttribute('y2', String(y + lh));
      line.setAttribute('stroke', isH || isV ? '#94a3b8' : '#cbd5e1');
      line.setAttribute('stroke-width', '2.5');
      if (isUnvisited) line.setAttribute('opacity', '0.35');
      svg.appendChild(line);
      draw(node.left, x - spread, y + lh, spread / 2);
    } else if (
      options?.nullProbe &&
      options.nullProbe.branch === 'left' &&
      (String(node.val) === String(options.nullProbe.parentVal) ||
        (node.id !== undefined && String(node.id) === String(options.nullProbe.parentVal)))
    ) {
      // 动态空节点探针 (Left Null)
      const nx = x - spread;
      const ny = y + lh;
      const nullLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      nullLine.setAttribute('x1', String(x)); nullLine.setAttribute('y1', String(y));
      nullLine.setAttribute('x2', String(nx)); nullLine.setAttribute('y2', String(ny));
      nullLine.setAttribute('stroke', '#3b82f6'); nullLine.setAttribute('stroke-width', '2');
      nullLine.setAttribute('stroke-dasharray', '3,3');
      svg.appendChild(nullLine);

      const nullBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      nullBox.setAttribute('x', String(nx - 22)); nullBox.setAttribute('y', String(ny - 12));
      nullBox.setAttribute('width', '44'); nullBox.setAttribute('height', '24');
      nullBox.setAttribute('rx', '6'); nullBox.setAttribute('fill', '#eff6ff');
      nullBox.setAttribute('stroke', '#3b82f6'); nullBox.setAttribute('stroke-width', '2');
      svg.appendChild(nullBox);

      const nullTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      nullTxt.setAttribute('x', String(nx)); nullTxt.setAttribute('y', String(ny + 4));
      nullTxt.setAttribute('text-anchor', 'middle'); nullTxt.setAttribute('fill', '#1d4ed8');
      nullTxt.setAttribute('font-family', "'JetBrains Mono', monospace");
      nullTxt.setAttribute('font-size', '11'); nullTxt.setAttribute('font-weight', '700');
      nullTxt.textContent = 'null:0';
      svg.appendChild(nullTxt);
    }

    // 2. 右子树连线
    if (node.right) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(x)); line.setAttribute('y1', String(y));
      line.setAttribute('x2', String(x + spread)); line.setAttribute('y2', String(y + lh));
      line.setAttribute('stroke', isH || isV ? '#94a3b8' : '#cbd5e1');
      line.setAttribute('stroke-width', '2.5');
      if (isUnvisited) line.setAttribute('opacity', '0.35');
      svg.appendChild(line);
      draw(node.right, x + spread, y + lh, spread / 2);
    } else if (
      options?.nullProbe &&
      options.nullProbe.branch === 'right' &&
      (String(node.val) === String(options.nullProbe.parentVal) ||
        (node.id !== undefined && String(node.id) === String(options.nullProbe.parentVal)))
    ) {
      // 动态空节点探针 (Right Null)
      const nx = x + spread;
      const ny = y + lh;
      const nullLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      nullLine.setAttribute('x1', String(x)); nullLine.setAttribute('y1', String(y));
      nullLine.setAttribute('x2', String(nx)); nullLine.setAttribute('y2', String(ny));
      nullLine.setAttribute('stroke', '#3b82f6'); nullLine.setAttribute('stroke-width', '2');
      nullLine.setAttribute('stroke-dasharray', '3,3');
      svg.appendChild(nullLine);

      const nullBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      nullBox.setAttribute('x', String(nx - 22)); nullBox.setAttribute('y', String(ny - 12));
      nullBox.setAttribute('width', '44'); nullBox.setAttribute('height', '24');
      nullBox.setAttribute('rx', '6'); nullBox.setAttribute('fill', '#eff6ff');
      nullBox.setAttribute('stroke', '#3b82f6'); nullBox.setAttribute('stroke-width', '2');
      svg.appendChild(nullBox);

      const nullTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      nullTxt.setAttribute('x', String(nx)); nullTxt.setAttribute('y', String(ny + 4));
      nullTxt.setAttribute('text-anchor', 'middle'); nullTxt.setAttribute('fill', '#1d4ed8');
      nullTxt.setAttribute('font-family', "'JetBrains Mono', monospace");
      nullTxt.setAttribute('font-size', '11'); nullTxt.setAttribute('font-weight', '700');
      nullTxt.textContent = 'null:0';
      svg.appendChild(nullTxt);
    }

    // 3. 节点圆圈与文本组
    const gNode = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    if (isUnvisited) gNode.setAttribute('opacity', nodeOpacity);

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
    c.setAttribute('fill', fill); c.setAttribute('stroke', stroke); c.setAttribute('stroke-width', isH ? '3.5' : '2.5');
    if (isH) {
      c.setAttribute('filter', 'drop-shadow(0 2px 4px rgba(245,158,11,0.35))');
    }
    gNode.appendChild(c);

    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', String(x)); t.setAttribute('y', String(y + 5));
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('fill', isH || isS || isV ? '#ffffff' : '#0f172a');
    t.setAttribute('font-family', "'JetBrains Mono', monospace");
    t.setAttribute('font-size', '13');
    t.setAttribute('font-weight', '700');
    t.textContent = String(node.val);
    gNode.appendChild(t);

    // 4. 高度/状态胶囊徽章 (Capsule Badge)
    const label = (node.id !== undefined ? labels?.get(node.id) : undefined) ?? labels?.get(node.val);
    if (label) {
      const isDanger = label.includes('-1') || label.includes('剪枝') || label.includes('失衡');
      const isSuccess = label.includes('h=') || label.includes('平衡');
      const bgFill = isDanger ? '#fee2e2' : isSuccess ? '#dcfce7' : '#eff6ff';
      const strokeColor = isDanger ? '#fca5a5' : isSuccess ? '#86efac' : '#bfdbfe';
      const textColor = isDanger ? '#b91c1c' : isSuccess ? '#15803d' : '#1d4ed8';

      const textWidth = Math.max(34, label.length * 7.5 + 8);
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', String(x - textWidth / 2));
      rect.setAttribute('y', String(y - 34));
      rect.setAttribute('width', String(textWidth));
      rect.setAttribute('height', '18');
      rect.setAttribute('rx', '9');
      rect.setAttribute('fill', bgFill);
      rect.setAttribute('stroke', strokeColor);
      rect.setAttribute('stroke-width', '1.5');
      gNode.appendChild(rect);

      const lb = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lb.setAttribute('x', String(x));
      lb.setAttribute('y', String(y - 21));
      lb.setAttribute('text-anchor', 'middle');
      lb.setAttribute('fill', textColor);
      lb.setAttribute('font-family', "'JetBrains Mono', monospace");
      lb.setAttribute('font-size', '10.5');
      lb.setAttribute('font-weight', '700');
      lb.textContent = label;
      gNode.appendChild(lb);
    }

    svg.appendChild(gNode);
  };

  draw(root, 300, 36, 120);
  container.appendChild(svg);
}
