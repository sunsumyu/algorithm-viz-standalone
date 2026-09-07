/**
 * 自适应 SVG 递归调用树与状态依赖图可视化适配器 (RecursionTreeAdapter Deep Module)
 * 遵循深度模块原则：
 * 将树结构度量、坐标布局、自适应视口平滑聚焦与状态着色封装为自治的渲染模块。
 */

export class RecursionTreeAdapter {
  /**
   * 渲染自适应 SVG 递归调用树
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

    // 几何安全尺寸度量：保证分支标签 (edgeLabel) 与返回值徽章 (tag) 绝不遮挡，同时避免纵向过度拉伸
    let nodeW = Math.max(68, Math.round(maxValLen * 8.0 + 18));
    let nodeH = 26;
    let minGap = 16;
    let levelH = hasLabels ? 66 : 54;
    let fontSize = 10.5;
    let tagFontSize = 8;
    const topPad = 36;

    if (leafCount >= 10 || maxDepth >= 4) {
      nodeW = Math.max(54, Math.round(maxValLen * 7.0 + 14));
      nodeH = 22;
      minGap = 10;
      levelH = hasLabels ? 58 : 46;
      fontSize = 8.5;
      tagFontSize = 7.5;
    } else if (leafCount >= 6 || maxDepth >= 3) {
      nodeW = Math.max(62, Math.round(maxValLen * 7.6 + 16));
      nodeH = 24;
      minGap = 14;
      levelH = hasLabels ? 62 : 50;
      fontSize = 9.5;
      tagFontSize = 8;
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
    const totalW = Math.max(260, measured.width + 36);
    const rootPos = assign(measured, 0, (totalW - measured.width) / 2);
    const totalH = Math.max(140, topPad + maxDepth * levelH + nodeH + 36);

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
          const edgeW = Math.max(20, edgeText.length * 8.5 + 8);
          const edgeH = 13;

          // 核心几何防重叠：安全垂直净空计算 (Safe Vertical Clearance)
          const parentBottomPad = n.tag ? 13 : 3;
          const childTopPad = c.id === activeNodeId ? 18 : 3;
          const safeTopY = startY + parentBottomPad;
          const safeBottomY = endY - childTopPad;
          const safeMidY = safeTopY < safeBottomY ? (safeTopY + safeBottomY) / 2 : curveMidY;

          // 计算沿贝塞尔 S 弯曲线在 safeMidY 处的真实 X 坐标
          const totalDy = Math.max(1, endY - startY);
          const t = Math.max(0.12, Math.min(0.88, (safeMidY - startY) / totalDy));
          const safeMidX = startX + (endX - startX) * (3 * (1 - t) * t * t + t * t * t);

          edgeLabels.push(`
            <g transform="translate(${safeMidX}, ${safeMidY})">
              <rect x="${-edgeW / 2}" y="${-edgeH / 2}" width="${edgeW}" height="${edgeH}" rx="3.5" fill="#ffffff" stroke="${isCurrentBranch ? '#2563eb' : '#cbd5e1'}" stroke-width="${isCurrentBranch ? '1.4' : '1'}" filter="drop-shadow(0 1px 2px rgba(0,0,0,0.05))" />
              <text x="0" y="0" dominant-baseline="central" text-anchor="middle" fill="${isCurrentBranch ? '#1d4ed8' : '#475569'}" font-size="7.5" font-weight="700" font-family="sans-serif">${edgeText}</text>
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
        const badgeW = Math.min(nodeW + 8, Math.max(24, String(n.tag).length * 6.5 + 8));
        badgeHtml = `
          <g transform="translate(0, ${nodeH / 2 + 6.5})">
            <rect x="${-badgeW / 2}" y="-5" width="${badgeW}" height="10" rx="3" fill="${tagBg}" />
            <text x="0" y="0" dominant-baseline="central" text-anchor="middle" fill="#ffffff" font-size="${tagFontSize}" font-weight="700" font-family="JetBrains Mono, monospace">${n.tag}</text>
          </g>
        `;
      }

      let animalHtml = '';
      if (isCurrent) {
        animalHtml = `
          <g transform="translate(0, ${-nodeH / 2 - 11})">
            <ellipse cx="0" cy="4" rx="8" ry="2.5" fill="#3b82f6" opacity="0.22" />
            <text x="0" y="0" text-anchor="middle" font-size="${Math.max(12, fontSize + 2.5)}" class="animal-frog select-none" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.15));">🐸</text>
          </g>
        `;
      }

      nodes.push(`
        <g transform="translate(${n.x}, ${n.y})" ${filterGlow}>
          <rect x="${-nodeW / 2}" y="${-nodeH / 2}" width="${nodeW}" height="${nodeH}" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" />
          <text x="0" y="3" text-anchor="middle" fill="${textColor}" font-size="${fontSize}" font-weight="700" font-family="JetBrains Mono, monospace">${n.val}</text>
          ${badgeHtml}
          ${animalHtml}
        </g>
      `);
    }

    draw(rootPos);

    const svgContent = `
      <svg id="tree-svg-canvas" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}" style="display: block; margin: 0 auto; min-width: ${totalW}px; min-height: ${totalH}px;">
        ${lines.join('')}
        ${edgeLabels.join('')}
        ${nodes.join('')}
      </svg>
    `;

    let scrollBox = container.querySelector('#tree-scroll-box') as HTMLElement | null;
    const isFirstMount = !scrollBox;

    if (!scrollBox) {
      container.innerHTML = `
        <div id="tree-scroll-box" style="width:100%; height:100%; overflow:auto; padding:10px; box-sizing:border-box; display:flex; justify-content:center; align-items:flex-start;">
          ${svgContent}
        </div>
      `;
      scrollBox = container.querySelector('#tree-scroll-box');
    } else {
      scrollBox.innerHTML = svgContent;
    }

    if (scrollBox && typeof scrollBox.scrollTo === 'function') {
      const clientW = scrollBox.clientWidth || 0;
      const scrollW = scrollBox.scrollWidth || 0;
      const clientH = scrollBox.clientHeight || 0;
      const scrollH = scrollBox.scrollHeight || 0;

      let targetLeft = scrollBox.scrollLeft;
      let targetTop = scrollBox.scrollTop;
      let needScroll = false;

      // 水平方向自适应聚焦
      if (activeX !== null && clientW > 0) {
        const curScrollLeft = scrollBox.scrollLeft;
        const leftMargin = 50;
        const leftBound = curScrollLeft + leftMargin;
        const rightBound = curScrollLeft + clientW - leftMargin;

        if (isFirstMount) {
          targetLeft = Math.max(0, activeX - clientW / 2);
          needScroll = true;
        } else if (activeX < leftBound || activeX > rightBound) {
          targetLeft = Math.max(0, activeX - clientW / 2);
          needScroll = true;
        }
      }

      // 垂直方向自适应聚焦 (防止活跃节点被顶部或底部遮挡)
      if (activeY !== null && clientH > 0) {
        const curScrollTop = scrollBox.scrollTop;
        const topMargin = 45;
        const bottomMargin = 45;
        const topBound = curScrollTop + topMargin;
        const bottomBound = curScrollTop + clientH - bottomMargin;

        if (isFirstMount) {
          targetTop = Math.max(0, activeY - clientH / 2);
          needScroll = true;
        } else if (activeY < topBound || activeY > bottomBound) {
          targetTop = Math.max(0, activeY - clientH / 2);
          needScroll = true;
        }
      }

      if (needScroll) {
        if (isFirstMount) {
          scrollBox.scrollLeft = targetLeft;
          scrollBox.scrollTop = targetTop;
        } else {
          scrollBox.scrollTo({ left: targetLeft, top: targetTop, behavior: 'smooth' });
        }
      }
    }
  }
}
