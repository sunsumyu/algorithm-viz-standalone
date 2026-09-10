/**
 * 2D 网格空间连线与转移流动矢量适配器 (SpatialFlowVisualAdapter) - 视觉深模块 (Deep Module)
 * 专门负责网格空间中的：
 * 1. SVG 箭头标头与流动渐变通道定义 (<defs> markers & gradients)
 * 2. 阶段 1 & 2 递归搜索足迹空间连线与物理反弹折线 (Trail & Recoil Wall/River Interception Lines)
 * 3. 阶段 3 二维 DP 填表依赖转移箭头 (Top & Left DP Transition Flow Vectors)
 */

export interface SpatialFlowRenderOptions {
  m: number;
  n: number;
  isReverse?: boolean;
  isGridProblem?: boolean;
  modelId?: string;
}

export class SpatialFlowVisualAdapter {
  /**
   * 初始化 SVG 箭头标记定义
   */
  public static getMarkerDefsHtml(): string {
    return `
      <defs>
        <marker id="arrow-forward" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#0284c7" />
        </marker>
        <marker id="arrow-reverse" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 9 1 L 0 5 L 9 9 z" fill="#0284c7" />
        </marker>
        <marker id="arrow-top-down" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#9333ea" />
        </marker>
        <marker id="arrow-left-right" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#d97706" />
        </marker>
      </defs>
    `;
  }

  /**
   * 渲染网格空间覆盖层 SVG 箭头与空间依赖连线
   */
  public static renderGridArrows(
    svg: SVGElement,
    container: HTMLElement,
    step: any,
    options: SpatialFlowRenderOptions
  ): void {
    if (!svg || !container || !step) return;

    svg.innerHTML = this.getMarkerDefsHtml();

    const { m, n } = options;
    const isGridProblem =
      options.isGridProblem ??
      (options.modelId ? ['unique-paths', 'unique-paths-ii', 'min-path-sum'].includes(options.modelId) : true);
    const activeStackList: string[] = Array.isArray(step.activeStack) ? step.activeStack : [];

    // 1. 递归路径足迹连线 (Stage 1 & Stage 2) - 仅在网格迷宫问题上绘制空间探索足迹连线
    if (isGridProblem && activeStackList.length >= 2 && typeof document.createElementNS === 'function') {
      for (let i = 0; i < activeStackList.length - 1; i++) {
        const [r1, c1] = activeStackList[i].split(',').map(Number);
        const [r2, c2] = activeStackList[i + 1].split(',').map(Number);

        const idx1 = r1 * n + c1;
        const cellEl1 = container.children[idx1] as HTMLElement;
        if (!cellEl1 || typeof cellEl1.offsetLeft === 'undefined') continue;

        const x1 = cellEl1.offsetLeft + cellEl1.offsetWidth / 2;
        const y1 = cellEl1.offsetTop + cellEl1.offsetHeight / 2;

        if (r2 < m && c2 < n && r2 >= 0 && c2 >= 0) {
          const idx2 = r2 * n + c2;
          const cellEl2 = container.children[idx2] as HTMLElement;
          if (!cellEl2 || typeof cellEl2.offsetLeft === 'undefined') continue;

          const x2 = cellEl2.offsetLeft + cellEl2.offsetWidth / 2;
          const y2 = cellEl2.offsetTop + cellEl2.offsetHeight / 2;

          const dx = x2 - x1;
          const dy = y2 - y1;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const sx = x1 + (dx / dist) * 12;
          const sy = y1 + (dy / dist) * 12;
          const ex = x2 - (dx / dist) * 14;
          const ey = y2 - (dy / dist) * 14;

          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', String(sx));
          line.setAttribute('y1', String(sy));
          line.setAttribute('x2', String(ex));
          line.setAttribute('y2', String(ey));
          line.setAttribute('stroke', '#0284c7');
          line.setAttribute('stroke-width', '2.5');
          line.setAttribute('stroke-dasharray', '4 2');
          line.setAttribute('marker-end', 'url(#arrow-forward)');
          line.setAttribute('class', 'dp-trail-arrow');
          line.setAttribute('opacity', '0.85');
          svg.appendChild(line);
        } else if (r2 >= m) {
          // 向下跳入深水河流
          const riverBarrier = typeof document.getElementById === 'function' ? document.getElementById('grid-river-barrier') : null;
          const targetY = riverBarrier ? riverBarrier.offsetTop : y1 + cellEl1.offsetHeight / 2 + 16;
          const sx = x1;
          const sy = y1 + 12;
          const ex = x1;
          const ey = targetY;

          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', String(sx));
          line.setAttribute('y1', String(sy));
          line.setAttribute('x2', String(ex));
          line.setAttribute('y2', String(ey));
          line.setAttribute('stroke', '#ef4444');
          line.setAttribute('stroke-width', '2.5');
          line.setAttribute('stroke-dasharray', '4 2');
          line.setAttribute('marker-end', 'url(#arrow-forward)');
          line.setAttribute('class', 'dp-trail-arrow');
          svg.appendChild(line);
        } else if (c2 >= n) {
          // 向右撞墙
          const sx = x1 + 12;
          const sy = y1;
          const ex = x1 + cellEl1.offsetWidth / 2 + 14;
          const ey = y1;

          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', String(sx));
          line.setAttribute('y1', String(sy));
          line.setAttribute('x2', String(ex));
          line.setAttribute('y2', String(ey));
          line.setAttribute('stroke', '#ef4444');
          line.setAttribute('stroke-width', '2.5');
          line.setAttribute('stroke-dasharray', '4 2');
          line.setAttribute('marker-end', 'url(#arrow-forward)');
          line.setAttribute('class', 'dp-trail-arrow');
          svg.appendChild(line);
        } else if (r2 < 0) {
          // 向上撞墙
          const sx = x1;
          const sy = y1 - 12;
          const ex = x1;
          const ey = container.offsetTop - 8;

          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', String(sx));
          line.setAttribute('y1', String(sy));
          line.setAttribute('x2', String(ex));
          line.setAttribute('y2', String(ey));
          line.setAttribute('stroke', '#ef4444');
          line.setAttribute('stroke-width', '2.5');
          line.setAttribute('stroke-dasharray', '4 2');
          line.setAttribute('marker-end', 'url(#arrow-forward)');
          line.setAttribute('class', 'dp-trail-arrow');
          svg.appendChild(line);
        } else if (c2 < 0) {
          // 向左撞墙
          const sx = x1 - 12;
          const sy = y1;
          const ex = container.offsetLeft - 8;
          const ey = y1;

          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', String(sx));
          line.setAttribute('y1', String(sy));
          line.setAttribute('x2', String(ex));
          line.setAttribute('y2', String(ey));
          line.setAttribute('stroke', '#ef4444');
          line.setAttribute('stroke-width', '2.5');
          line.setAttribute('stroke-dasharray', '4 2');
          line.setAttribute('marker-end', 'url(#arrow-forward)');
          line.setAttribute('class', 'dp-trail-arrow');
          svg.appendChild(line);
        }
      }
    }

    // 2. 状态转移箭头 (Stage 3 二维 DP 填表)
    if (
      (step.type === 'update' ||
        step.type === 'update-cell' ||
        (step.topI !== undefined && step.topI >= 0) ||
        (step.leftI !== undefined && step.leftI >= 0)) &&
      typeof document.createElementNS === 'function'
    ) {
      const curIdx = step.i * n + step.j;
      const curCell = container.children[curIdx] as HTMLElement;
      if (curCell && typeof curCell.offsetLeft !== 'undefined') {
        const curX = curCell.offsetLeft + curCell.offsetWidth / 2;
        const curY = curCell.offsetTop + curCell.offsetHeight / 2;

        if (
          step.topI !== undefined &&
          step.topI >= 0 &&
          step.topI < m &&
          step.topJ !== undefined &&
          step.topJ >= 0 &&
          step.topJ < n
        ) {
          const topIdx = step.topI * n + step.topJ;
          const topCell = container.children[topIdx] as HTMLElement;
          if (topCell && typeof topCell.offsetLeft !== 'undefined') {
            const topX = topCell.offsetLeft + topCell.offsetWidth / 2;
            const topY = topCell.offsetTop + topCell.offsetHeight / 2;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', String(topX));
            line.setAttribute('y1', String(topY + 12));
            line.setAttribute('x2', String(curX));
            line.setAttribute('y2', String(curY - 14));
            line.setAttribute('stroke', '#9333ea');
            line.setAttribute('stroke-width', '2.2');
            line.setAttribute('marker-end', 'url(#arrow-top-down)');
            svg.appendChild(line);
          }
        }

        if (
          step.leftI !== undefined &&
          step.leftI >= 0 &&
          step.leftI < m &&
          step.leftJ !== undefined &&
          step.leftJ >= 0 &&
          step.leftJ < n
        ) {
          const leftIdx = step.leftI * n + step.leftJ;
          const leftCell = container.children[leftIdx] as HTMLElement;
          if (leftCell && typeof leftCell.offsetLeft !== 'undefined') {
            const leftX = leftCell.offsetLeft + leftCell.offsetWidth / 2;
            const leftY = leftCell.offsetTop + leftCell.offsetHeight / 2;
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', String(leftX + 12));
            line.setAttribute('y1', String(leftY));
            line.setAttribute('x2', String(curX - 14));
            line.setAttribute('y2', String(curY));
            line.setAttribute('stroke', '#d97706');
            line.setAttribute('stroke-width', '2.2');
            line.setAttribute('marker-end', 'url(#arrow-left-right)');
            svg.appendChild(line);
          }
        }
      }
    }
  }
}
