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
  initialDepth?: number;
  /** 全画幅调用链合一树帧数据 (Stack Chain Flow & Multi-Depth Tier Badges) */
  stackFrames?: {
    depth: number;
    nodeVal: number | null;
    funcCall: string;
    branch?: string;
    isCurrent?: boolean;
  }[];
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
  const getSubtreeHeight = (n: TreeNode | null): number => {
    if (!n) return 0;
    return 1 + Math.max(getSubtreeHeight(n.left), getSubtreeHeight(n.right));
  };
  const treeH = getSubtreeHeight(root);
  const startY = treeH === 1 ? 70 : (treeH === 2 ? 48 : 36);
  const viewBoxH = treeH === 1 ? 180 : (treeH === 2 ? 220 : 280);

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '100%');
  svg.setAttribute('height', '280');
  svg.setAttribute('viewBox', `0 0 600 ${viewBoxH}`);

  // 构建调用栈帧速查表与父子调用连线集合
  const stackNodeMap = new Map<number | string, { depth: number; isCurrent: boolean; funcCall: string }>();
  const stackParentChildSet = new Set<string>();
  if (options?.stackFrames && options.stackFrames.length > 0) {
    for (let i = 0; i < options.stackFrames.length; i++) {
      const f = options.stackFrames[i];
      if (f.nodeVal != null) {
        stackNodeMap.set(f.nodeVal, {
          depth: f.depth + 1,
          isCurrent: Boolean(f.isCurrent ?? (i === options.stackFrames.length - 1)),
          funcCall: f.funcCall,
        });
      }
      if (i > 0) {
        const prev = options.stackFrames[i - 1];
        if (prev.nodeVal != null && f.nodeVal != null) {
          stackParentChildSet.add(`${prev.nodeVal}->${f.nodeVal}`);
        }
      }
    }
  }

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

  const draw = (node: TreeNode, x: number, y: number, spread: number, depth = 1) => {
    const isH = matchNode(highlight, primaryHasId, node);
    const isS = matchNode(secondaryHighlight, secondaryHasId, node);
    const isV = matchNode(visitedHighlight, visitedHasId, node);
    const stackInfo = (node.id !== undefined ? stackNodeMap.get(node.id) : undefined) ?? stackNodeMap.get(node.val);
    const isUnvisited = Boolean(options?.dimUnvisited && !isH && !isS && !isV && !stackInfo);
    const nodeOpacity = isUnvisited ? '0.35' : '1';

    // 1. 左子树连线
    if (node.left) {
      const isLeftInStack = stackParentChildSet.has(`${node.val}->${node.left.val}`);
      if (isLeftInStack) {
        // 调用链发光底色光晕
        const glowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        glowLine.setAttribute('x1', String(x)); glowLine.setAttribute('y1', String(y));
        glowLine.setAttribute('x2', String(x - spread)); glowLine.setAttribute('y2', String(y + lh));
        glowLine.setAttribute('stroke', '#60a5fa'); glowLine.setAttribute('stroke-width', '5.5');
        glowLine.setAttribute('opacity', '0.5');
        svg.appendChild(glowLine);
      }

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(x)); line.setAttribute('y1', String(y));
      line.setAttribute('x2', String(x - spread)); line.setAttribute('y2', String(y + lh));
      line.setAttribute('stroke', isLeftInStack ? '#2563eb' : (isH || isV ? '#94a3b8' : '#cbd5e1'));
      line.setAttribute('stroke-width', isLeftInStack ? '3.5' : '2.5');
      if (isLeftInStack) line.setAttribute('stroke-dasharray', '5,3');
      if (isUnvisited) line.setAttribute('opacity', '0.35');
      svg.appendChild(line);
      draw(node.left, x - spread, y + lh, spread / 2, depth + 1);
    } else if (
      options?.nullProbe &&
      options.nullProbe.branch === 'left' &&
      (String(node.val) === String(options.nullProbe.parentVal) ||
        (node.id !== undefined && String(node.id) === String(options.nullProbe.parentVal)))
    ) {
      // 动态空节点探针 (Left Null)
      const nx = x - spread;
      const ny = y + lh;
      const nullFrame = options?.stackFrames?.find((f) => f.nodeVal == null && (f.branch === 'left' || f.isCurrent));
      const isNullActive = Boolean(nullFrame?.isCurrent);
      const probeDepth = nullFrame ? nullFrame.depth + 1 : undefined;

      if (isNullActive) {
        // 调用链发光底色光晕
        const glowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        glowLine.setAttribute('x1', String(x)); glowLine.setAttribute('y1', String(y));
        glowLine.setAttribute('x2', String(nx)); glowLine.setAttribute('y2', String(ny));
        glowLine.setAttribute('stroke', '#60a5fa'); glowLine.setAttribute('stroke-width', '5.5');
        glowLine.setAttribute('opacity', '0.5');
        svg.appendChild(glowLine);
      }

      const nullLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      nullLine.setAttribute('x1', String(x)); nullLine.setAttribute('y1', String(y));
      nullLine.setAttribute('x2', String(nx)); nullLine.setAttribute('y2', String(ny));
      nullLine.setAttribute('stroke', isNullActive ? '#2563eb' : '#3b82f6');
      nullLine.setAttribute('stroke-width', isNullActive ? '3.5' : '2');
      nullLine.setAttribute('stroke-dasharray', isNullActive ? '5,3' : '3,3');
      svg.appendChild(nullLine);

      const nullLabel = probeDepth ? `d=${probeDepth} null:0` : 'null:0';
      const boxWidth = probeDepth ? 62 : 44;

      const nullBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      nullBox.setAttribute('x', String(nx - boxWidth / 2)); nullBox.setAttribute('y', String(ny - 12));
      nullBox.setAttribute('width', String(boxWidth)); nullBox.setAttribute('height', '24');
      nullBox.setAttribute('rx', '6');
      nullBox.setAttribute('fill', isNullActive ? '#fef3c7' : '#eff6ff');
      nullBox.setAttribute('stroke', isNullActive ? '#f59e0b' : '#3b82f6');
      nullBox.setAttribute('stroke-width', isNullActive ? '2.5' : '2');
      svg.appendChild(nullBox);

      const nullTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      nullTxt.setAttribute('x', String(nx)); nullTxt.setAttribute('y', String(ny + 4));
      nullTxt.setAttribute('text-anchor', 'middle');
      nullTxt.setAttribute('fill', isNullActive ? '#b45309' : '#1d4ed8');
      nullTxt.setAttribute('font-family', "'JetBrains Mono', monospace");
      nullTxt.setAttribute('font-size', '11'); nullTxt.setAttribute('font-weight', '700');
      nullTxt.textContent = nullLabel;
      svg.appendChild(nullTxt);
    }

    // 2. 右子树连线
    if (node.right) {
      const isRightInStack = stackParentChildSet.has(`${node.val}->${node.right.val}`);
      if (isRightInStack) {
        // 调用链发光底色光晕
        const glowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        glowLine.setAttribute('x1', String(x)); glowLine.setAttribute('y1', String(y));
        glowLine.setAttribute('x2', String(x + spread)); glowLine.setAttribute('y2', String(y + lh));
        glowLine.setAttribute('stroke', '#60a5fa'); glowLine.setAttribute('stroke-width', '5.5');
        glowLine.setAttribute('opacity', '0.5');
        svg.appendChild(glowLine);
      }

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(x)); line.setAttribute('y1', String(y));
      line.setAttribute('x2', String(x + spread)); line.setAttribute('y2', String(y + lh));
      line.setAttribute('stroke', isRightInStack ? '#2563eb' : (isH || isV ? '#94a3b8' : '#cbd5e1'));
      line.setAttribute('stroke-width', isRightInStack ? '3.5' : '2.5');
      if (isRightInStack) line.setAttribute('stroke-dasharray', '5,3');
      if (isUnvisited) line.setAttribute('opacity', '0.35');
      svg.appendChild(line);
      draw(node.right, x + spread, y + lh, spread / 2, depth + 1);
    } else if (
      options?.nullProbe &&
      options.nullProbe.branch === 'right' &&
      (String(node.val) === String(options.nullProbe.parentVal) ||
        (node.id !== undefined && String(node.id) === String(options.nullProbe.parentVal)))
    ) {
      // 动态空节点探针 (Right Null)
      const nx = x + spread;
      const ny = y + lh;
      const nullFrame = options?.stackFrames?.find((f) => f.nodeVal == null && (f.branch === 'right' || f.isCurrent));
      const isNullActive = Boolean(nullFrame?.isCurrent);
      const probeDepth = nullFrame ? nullFrame.depth + 1 : undefined;

      if (isNullActive) {
        // 调用链发光底色光晕
        const glowLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        glowLine.setAttribute('x1', String(x)); glowLine.setAttribute('y1', String(y));
        glowLine.setAttribute('x2', String(nx)); glowLine.setAttribute('y2', String(ny));
        glowLine.setAttribute('stroke', '#60a5fa'); glowLine.setAttribute('stroke-width', '5.5');
        glowLine.setAttribute('opacity', '0.5');
        svg.appendChild(glowLine);
      }

      const nullLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      nullLine.setAttribute('x1', String(x)); nullLine.setAttribute('y1', String(y));
      nullLine.setAttribute('x2', String(nx)); nullLine.setAttribute('y2', String(ny));
      nullLine.setAttribute('stroke', isNullActive ? '#2563eb' : '#3b82f6');
      nullLine.setAttribute('stroke-width', isNullActive ? '3.5' : '2');
      nullLine.setAttribute('stroke-dasharray', isNullActive ? '5,3' : '3,3');
      svg.appendChild(nullLine);

      const nullLabel = probeDepth ? `d=${probeDepth} null:0` : 'null:0';
      const boxWidth = probeDepth ? 62 : 44;

      const nullBox = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      nullBox.setAttribute('x', String(nx - boxWidth / 2)); nullBox.setAttribute('y', String(ny - 12));
      nullBox.setAttribute('width', String(boxWidth)); nullBox.setAttribute('height', '24');
      nullBox.setAttribute('rx', '6');
      nullBox.setAttribute('fill', isNullActive ? '#fef3c7' : '#eff6ff');
      nullBox.setAttribute('stroke', isNullActive ? '#f59e0b' : '#3b82f6');
      nullBox.setAttribute('stroke-width', isNullActive ? '2.5' : '2');
      svg.appendChild(nullBox);

      const nullTxt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      nullTxt.setAttribute('x', String(nx)); nullTxt.setAttribute('y', String(ny + 4));
      nullTxt.setAttribute('text-anchor', 'middle');
      nullTxt.setAttribute('fill', isNullActive ? '#b45309' : '#1d4ed8');
      nullTxt.setAttribute('font-family', "'JetBrains Mono', monospace");
      nullTxt.setAttribute('font-size', '11'); nullTxt.setAttribute('font-weight', '700');
      nullTxt.textContent = nullLabel;
      svg.appendChild(nullTxt);
    }

    // 3. 节点圆圈与文本组
    const gNode = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    if (isUnvisited) gNode.setAttribute('opacity', nodeOpacity);

    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('cx', String(x)); c.setAttribute('cy', String(y)); c.setAttribute('r', '19');
    let fill = '#ffffff', stroke = '#64748b';
    if (stackInfo) {
      if (stackInfo.isCurrent) {
        fill = '#f59e0b'; stroke = '#d97706';
        c.setAttribute('stroke-width', '3.5');
        c.setAttribute('filter', 'drop-shadow(0 0 8px rgba(245,158,11,0.65))');
      } else {
        fill = '#38bdf8'; stroke = '#0284c7';
        c.setAttribute('stroke-width', '3');
        c.setAttribute('filter', 'drop-shadow(0 0 5px rgba(56,189,248,0.5))');
      }
    } else if (isH) {
      fill = highlightColor || '#0284c7'; stroke = highlightColor || '#0284c7';
      c.setAttribute('stroke-width', '3.5');
      c.setAttribute('filter', 'drop-shadow(0 2px 4px rgba(245,158,11,0.35))');
    } else if (isS && secondaryColor) {
      fill = secondaryColor; stroke = secondaryColor;
      c.setAttribute('stroke-width', '2.5');
    } else if (isV && visitedColor) {
      fill = visitedColor; stroke = visitedColor;
      c.setAttribute('stroke-width', '2.5');
    } else {
      c.setAttribute('stroke-width', '2.5');
    }
    c.setAttribute('fill', fill); c.setAttribute('stroke', stroke);
    gNode.appendChild(c);

    const t = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    t.setAttribute('x', String(x)); t.setAttribute('y', String(y + 5));
    t.setAttribute('text-anchor', 'middle');
    t.setAttribute('fill', stackInfo || isH || isS || isV ? '#ffffff' : '#0f172a');
    t.setAttribute('font-family', "'JetBrains Mono', monospace");
    t.setAttribute('font-size', '13');
    t.setAttribute('font-weight', '700');
    t.textContent = String(node.val);
    gNode.appendChild(t);

    // 4. 复合胶囊徽章 (Stack Depth Badge / Height Badge)
    const baseLabel = (node.id !== undefined ? labels?.get(node.id) : undefined) ?? labels?.get(node.val);
    let displayBadgeText = '';
    let badgeBg = '#eff6ff';
    let badgeStroke = '#bfdbfe';
    let badgeTextFill = '#1d4ed8';

    if (stackInfo) {
      // 处于调用栈链路上的节点：优先展示深度与活跃/等待状态
      const statusText = stackInfo.isCurrent ? '⚡活跃' : '⏳等待';
      const actualDepth = stackInfo.depth ?? depth;
      displayBadgeText = baseLabel ? `d=${actualDepth} ${statusText} · ${baseLabel}` : `d=${actualDepth} ${statusText}`;
      if (stackInfo.isCurrent) {
        badgeBg = '#fef3c7'; badgeStroke = '#f59e0b'; badgeTextFill = '#b45309';
      } else {
        badgeBg = '#eff6ff'; badgeStroke = '#93c5fd'; badgeTextFill = '#1e40af';
      }
    } else if (baseLabel) {
      // 已结算非栈节点：展示深度与高度/状态徽章，永远保留深度层级，绝不中途丢失深度
      displayBadgeText = options?.stackFrames ? `d=${depth} · ${baseLabel}` : baseLabel;
      const isDanger = baseLabel.includes('-1') || baseLabel.includes('剪枝') || baseLabel.includes('失衡');
      const isSuccess = baseLabel.includes('h=') || baseLabel.includes('平衡');
      badgeBg = isDanger ? '#fee2e2' : isSuccess ? '#dcfce7' : '#eff6ff';
      badgeStroke = isDanger ? '#fca5a5' : isSuccess ? '#86efac' : '#bfdbfe';
      badgeTextFill = isDanger ? '#b91c1c' : isSuccess ? '#15803d' : '#1d4ed8';
    } else if (options?.stackFrames && options.stackFrames.length > 0) {
      // 未访问节点 (当启用了全景调用栈树时)：常驻展示该节点所属物理深度 d=N，绝不会一下多一个一下不见了！
      displayBadgeText = `d=${depth}`;
      badgeBg = '#f8fafc';
      badgeStroke = '#cbd5e1';
      badgeTextFill = '#64748b';
    }

    if (displayBadgeText) {
      const textWidth = Math.max(36, displayBadgeText.length * 7.2 + 10);
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', String(x - textWidth / 2));
      rect.setAttribute('y', String(y - 34));
      rect.setAttribute('width', String(textWidth));
      rect.setAttribute('height', '18');
      rect.setAttribute('rx', '9');
      rect.setAttribute('fill', badgeBg);
      rect.setAttribute('stroke', badgeStroke);
      rect.setAttribute('stroke-width', '1.5');
      gNode.appendChild(rect);

      const lb = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lb.setAttribute('x', String(x));
      lb.setAttribute('y', String(y - 21));
      lb.setAttribute('text-anchor', 'middle');
      lb.setAttribute('fill', badgeTextFill);
      lb.setAttribute('font-family', "'JetBrains Mono', monospace");
      lb.setAttribute('font-size', '10');
      lb.setAttribute('font-weight', '700');
      lb.textContent = displayBadgeText;
      gNode.appendChild(lb);
    }

    svg.appendChild(gNode);
  };

  draw(root, 300, startY, 120, options?.initialDepth ?? 1);
  container.appendChild(svg);
}
