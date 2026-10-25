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
        <marker id="arrow-diag" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 1 L 9 5 L 0 9 z" fill="#0891b2" />
        </marker>
      </defs>
    `;
  }

  /**
   * 获取指定单元格相对于当前 SVG 坐标系的中心点，彻底免疫外层弹性居中与 Margin/Padding 漂移
   */
  private static getCellCenter(cell: HTMLElement, svg: SVGElement): { x: number; y: number } {
    if (typeof svg.getBoundingClientRect === 'function' && typeof cell.getBoundingClientRect === 'function') {
      const sRect = svg.getBoundingClientRect();
      const cRect = cell.getBoundingClientRect();
      if (sRect.width > 0 || sRect.height > 0 || cRect.width > 0 || cRect.height > 0) {
        return {
          x: cRect.left + cRect.width / 2 - sRect.left,
          y: cRect.top + cRect.height / 2 - sRect.top,
        };
      }
    }
    return {
      x: (cell.offsetLeft || 0) + (cell.offsetWidth || 0) / 2,
      y: (cell.offsetTop || 0) + (cell.offsetHeight || 0) / 2,
    };
  }

  /**
   * 优先通过 data-coord 寻找单元格，索引兜底
   */
  private static findCell(container: HTMLElement, r: number, c: number, n: number): HTMLElement | null {
    if (!container) return null;
    if (typeof container.querySelector === 'function') {
      const byCoord = container.querySelector(`[data-coord="${r},${c}"]`) as HTMLElement | null;
      if (byCoord) return byCoord;
    }
    const idx = r * n + c;
    return (container.children && container.children[idx] as HTMLElement) || null;
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
      (options.modelId ? ['unique-paths', 'unique-paths-ii', 'min-path-sum', 'dungeon-game-reverse-dp'].includes(options.modelId) : true);
    const rawStack = Array.isArray(step.activeStack) ? step.activeStack : (Array.isArray(step.activeTrail) ? step.activeTrail : []);
    const activeStackList: string[] = [];
    for (const item of rawStack) {
      if (typeof item === 'string') {
        const match = item.match(/(-?\d+)\s*,\s*(-?\d+)/);
        if (match) {
          activeStackList.push(`${parseInt(match[1], 10)},${parseInt(match[2], 10)}`);
        }
      } else if (item && typeof item === 'object') {
        const r = item.i ?? item.row ?? item.r;
        const c = item.j ?? item.col ?? item.c;
        if (typeof r === 'number' && typeof c === 'number' && !Number.isNaN(r) && !Number.isNaN(c)) {
          activeStackList.push(`${r},${c}`);
        }
      }
    }

    // 1. 递归路径足迹连线 (Stage 1 & Stage 2) - 仅在网格迷宫问题上绘制空间探索足迹连线
    if (isGridProblem && activeStackList.length >= 2 && typeof document.createElementNS === 'function') {
      for (let i = 0; i < activeStackList.length - 1; i++) {
        const [r1, c1] = activeStackList[i].split(',').map(Number);
        const [r2, c2] = activeStackList[i + 1].split(',').map(Number);

        const cellEl1 = this.findCell(container, r1, c1, n);
        if (!cellEl1) continue;

        const p1 = this.getCellCenter(cellEl1, svg);

        if (r2 < m && c2 < n && r2 >= 0 && c2 >= 0) {
          const cellEl2 = this.findCell(container, r2, c2, n);
          if (!cellEl2) continue;

          const p2 = this.getCellCenter(cellEl2, svg);

          const dx = p2.x - p1.x;
          const dy = p2.y - p1.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const sx = p1.x + (dx / dist) * 12;
          const sy = p1.y + (dy / dist) * 12;
          const ex = p2.x - (dx / dist) * 14;
          const ey = p2.y - (dy / dist) * 14;

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
          let targetY = p1.y + 36;
          if (riverBarrier && typeof riverBarrier.getBoundingClientRect === 'function' && typeof svg.getBoundingClientRect === 'function') {
            const sRect = svg.getBoundingClientRect();
            const rRect = riverBarrier.getBoundingClientRect();
            if (sRect.height > 0 || rRect.height > 0) {
              targetY = rRect.top - sRect.top + rRect.height / 2;
            }
          }
          const sx = p1.x;
          const sy = p1.y + 12;
          const ex = p1.x;
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
          const sx = p1.x + 12;
          const sy = p1.y;
          const ex = p1.x + (cellEl1.offsetWidth || 40) / 2 + 14;
          const ey = p1.y;

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
          const sx = p1.x;
          const sy = p1.y - 12;
          const ex = p1.x;
          const ey = Math.max(0, p1.y - (cellEl1.offsetHeight || 40) / 2 - 14);

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
          const sx = p1.x - 12;
          const sy = p1.y;
          const ex = Math.max(0, p1.x - (cellEl1.offsetWidth || 40) / 2 - 14);
          const ey = p1.y;

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
        (step.leftI !== undefined && step.leftI >= 0) ||
        (step.diagI !== undefined && step.diagI >= 0)) &&
      typeof document.createElementNS === 'function' &&
      typeof step.i === 'number' &&
      typeof step.j === 'number'
    ) {
      const curCell = this.findCell(container, step.i, step.j, n);
      if (curCell) {
        const curCenter = this.getCellCenter(curCell, svg);

        const drawArrow = (srcI: number, srcJ: number, strokeColor: string, markerId: string) => {
          if (srcI < 0 || srcI >= m || srcJ < 0 || srcJ >= n) return;
          const srcCell = this.findCell(container, srcI, srcJ, n);
          if (!srcCell) return;
          const srcCenter = this.getCellCenter(srcCell, svg);

          const dx = curCenter.x - srcCenter.x;
          const dy = curCenter.y - srcCenter.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;

          // 从源单元格边缘指向当前计算单元格边缘，留出标头空隙
          const sx = srcCenter.x + (dx / dist) * 14;
          const sy = srcCenter.y + (dy / dist) * 14;
          const ex = curCenter.x - (dx / dist) * 16;
          const ey = curCenter.y - (dy / dist) * 16;

          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', String(sx));
          line.setAttribute('y1', String(sy));
          line.setAttribute('x2', String(ex));
          line.setAttribute('y2', String(ey));
          line.setAttribute('stroke', strokeColor);
          line.setAttribute('stroke-width', '2.2');
          line.setAttribute('marker-end', `url(#${markerId})`);
          svg.appendChild(line);
        };

        if (step.topI !== undefined && step.topI >= 0 && step.topJ !== undefined && step.topJ >= 0) {
          drawArrow(step.topI, step.topJ, '#9333ea', 'arrow-top-down');
        }

        if (step.leftI !== undefined && step.leftI >= 0 && step.leftJ !== undefined && step.leftJ >= 0) {
          drawArrow(step.leftI, step.leftJ, '#d97706', 'arrow-left-right');
        }

        if (step.diagI !== undefined && step.diagI >= 0 && step.diagJ !== undefined && step.diagJ >= 0) {
          drawArrow(step.diagI, step.diagJ, '#0891b2', 'arrow-diag');
        }
      }
    }
  }
}
