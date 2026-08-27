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

    const leafCount = countLeaves(root);
    const maxDepth = getDepth(root);
    const maxValLen = getMaxValLen(root);

    let nodeW = Math.max(66, Math.round(maxValLen * 8.2 + 18));
    let nodeH = 26;
    let minGap = 16;
    let levelH = 56;
    let fontSize = 10.5;
    let tagFontSize = 8;
    const topPad = 46;

    if (leafCount >= 10 || maxDepth >= 4) {
      nodeW = Math.max(52, Math.round(maxValLen * 7.0 + 14));
      nodeH = 20;
      minGap = 8;
      levelH = 46;
      fontSize = 8.5;
      tagFontSize = 7;
    } else if (leafCount >= 6 || maxDepth >= 3) {
      nodeW = Math.max(60, Math.round(maxValLen * 7.6 + 16));
      nodeH = 23;
      minGap = 12;
      levelH = 50;
      fontSize = 9.5;
      tagFontSize = 7.5;
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
    const totalW = Math.max(360, measured.width + 48);
    const rootPos = assign(measured, 0, (totalW - measured.width) / 2);
    const totalH = Math.max(180, topPad + maxDepth * levelH + nodeH + 40);

    const lines: string[] = [];
    const nodes: string[] = [];
    let activeX: number | null = null;
    let activeY: number | null = null;

    function draw(n: any): void {
      for (const c of n.children) {
        const startX = n.x;
        const startY = n.y + nodeH / 2;
        const endX = c.x;
        const endY = c.y - nodeH / 2;
        const midX = (startX + endX) / 2;
        const midY = (startY + endY) / 2;

        const isCurrentBranch = n.id === activeNodeId || c.id === activeNodeId;
        const stroke = isCurrentBranch ? '#3b82f6' : '#cbd5e1';
        const strokeW = isCurrentBranch ? '2' : '1.3';
        const strokeDash = c.status === 'pruned' ? '3,3' : 'none';

        lines.push(
          `<path d="M ${startX} ${startY} C ${startX} ${midY}, ${endX} ${midY}, ${endX} ${endY}" fill="none" stroke="${stroke}" stroke-width="${strokeW}" stroke-dasharray="${strokeDash}" />`
        );

        if (c.edgeLabel) {
          const edgeText = String(c.edgeLabel);
          const edgeW = Math.max(22, edgeText.length * 9.5 + 8);
          lines.push(`
            <g transform="translate(${midX}, ${midY})">
              <rect x="${-edgeW / 2}" y="-6.5" width="${edgeW}" height="13" rx="4" fill="#ffffff" stroke="${isCurrentBranch ? '#3b82f6' : '#94a3b8'}" stroke-width="1" />
              <text x="0" y="2.5" text-anchor="middle" fill="${isCurrentBranch ? '#1d4ed8' : '#475569'}" font-size="7.5" font-weight="700" font-family="sans-serif">${edgeText}</text>
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
        const badgeW = Math.min(nodeW + 8, Math.max(26, String(n.tag).length * 6.5 + 8));
        badgeHtml = `
          <g transform="translate(0, ${nodeH / 2 + 7})">
            <rect x="${-badgeW / 2}" y="-5.5" width="${badgeW}" height="11" rx="3" fill="${tagBg}" />
            <text x="0" y="2.5" text-anchor="middle" fill="#ffffff" font-size="${tagFontSize}" font-weight="700" font-family="JetBrains Mono, monospace">${n.tag}</text>
          </g>
        `;
      }

      let animalHtml = '';
      if (isCurrent) {
        animalHtml = `
          <g transform="translate(0, ${-nodeH / 2 - 13})">
            <ellipse cx="0" cy="5" rx="10" ry="3.5" fill="#3b82f6" opacity="0.22" />
            <text x="0" y="0" text-anchor="middle" font-size="${Math.max(13, fontSize + 3.5)}" class="animal-frog select-none" style="filter: drop-shadow(0 2px 3px rgba(0,0,0,0.15));">🐸</text>
          </g>
        `;
      }

      nodes.push(`
        <g transform="translate(${n.x}, ${n.y})" ${filterGlow}>
          <rect x="${-nodeW / 2}" y="${-nodeH / 2}" width="${nodeW}" height="${nodeH}" rx="5" fill="${fill}" stroke="${stroke}" stroke-width="${strokeW}" />
          <text x="0" y="3.5" text-anchor="middle" fill="${textColor}" font-size="${fontSize}" font-weight="700" font-family="JetBrains Mono, monospace">${n.val}</text>
          ${badgeHtml}
          ${animalHtml}
        </g>
      `);
    }

    draw(rootPos);

    const svgContent = `
      <svg id="tree-svg-canvas" width="${totalW}" height="${totalH}" viewBox="0 0 ${totalW} ${totalH}" style="min-width: ${totalW}px; min-height: ${totalH}px; display: block; margin: 0 auto;">
        ${lines.join('')}
        ${nodes.join('')}
      </svg>
    `;

    let scrollBox = container.querySelector('#tree-scroll-box') as HTMLElement | null;
    const isFirstMount = !scrollBox;

    if (!scrollBox) {
      container.innerHTML = `
        <div id="tree-scroll-box" class="w-full h-full flex items-start justify-start overflow-auto p-2">
          ${svgContent}
        </div>
      `;
      scrollBox = container.querySelector('#tree-scroll-box');
    } else {
      // 保持现有 scrollBox DOM 容器，仅更新内部 SVG 内容，绝对不粗暴重置滚动坐标
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
