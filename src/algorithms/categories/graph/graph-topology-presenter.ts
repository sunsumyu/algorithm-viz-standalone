/**
 * 图论拓扑空间与矢量流向渲染器 (GraphTopologyPresenter)
 * 遵循建造者模式 (Builder Pattern) 与适配器模式 (Adapter Pattern)：
 * 统一封装图论节点、有向/无向带权边、箭头几何向量、松弛高亮与状态样式的 SVG 绘制。
 */

export interface GraphNodePosition {
  x: number;
  y: number;
}

export interface GraphNodeVisualItem {
  id: number | string;
  label?: string;
  x: number;
  y: number;
  isCurrent?: boolean;
  isVisited?: boolean;
  isQueued?: boolean;
  statusText?: string;
  customColor?: string;
}

export interface GraphEdgeVisualItem {
  from: number | string;
  to: number | string;
  weight?: number | string;
  isDirected?: boolean;
  isRelaxing?: boolean;
  isRelaxSuccess?: boolean;
  isFromCurrent?: boolean;
  isMstEdge?: boolean;
  customColor?: string;
}

export interface GraphTopologyOptions {
  viewBox?: string;
  width?: string;
  maxWidth?: string;
  height?: string;
  nodeRadius?: number;
  arrowSize?: number;
  prefix?: string;
}

export class GraphTopologyPresenter {
  /**
   * 纯几何向量计算：有向边剪裁末端箭头坐标
   */
  public static computeArrowPoints(
    p1: GraphNodePosition,
    p2: GraphNodePosition,
    nodeRadius: number = 22,
    arrowSize: number = 10
  ): { points: string; arrowTip: GraphNodePosition } {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const ux = dx / len;
    const uy = dy / len;

    const ax = p2.x - ux * (nodeRadius + 4);
    const ay = p2.y - uy * (nodeRadius + 4);

    const perpX = -uy;
    const perpY = ux;

    const pLeftX = ax - ux * arrowSize + perpX * arrowSize * 0.4;
    const pLeftY = ay - uy * arrowSize + perpY * arrowSize * 0.4;
    const pRightX = ax - ux * arrowSize - perpX * arrowSize * 0.4;
    const pRightY = ay - uy * arrowSize - perpY * arrowSize * 0.4;

    return {
      points: `${ax},${ay} ${pLeftX},${pLeftY} ${pRightX},${pRightY}`,
      arrowTip: { x: ax, y: ay }
    };
  }

  /**
   * 渲染图论拓扑 SVG
   */
  public static render(
    container: HTMLElement,
    nodes: GraphNodeVisualItem[],
    edges: GraphEdgeVisualItem[],
    options?: GraphTopologyOptions
  ): SVGSVGElement | null {
    if (typeof document === 'undefined' || !container) return null;

    container.innerHTML = '';
    const nodeR = options?.nodeRadius ?? 22;
    const arrowSize = options?.arrowSize ?? 10;
    const pfx = options?.prefix ?? 'djb';

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', options?.viewBox || '0 0 540 280');
    svg.style.width = options?.width || '100%';
    svg.style.maxWidth = options?.maxWidth || '540px';
    svg.style.height = options?.height || '280px';

    const nodePosMap = new Map<number | string, GraphNodePosition>();
    nodes.forEach((n) => nodePosMap.set(n.id, { x: n.x, y: n.y }));

    // 1. 绘制边集 (Edges)
    for (const edge of edges) {
      const p1 = nodePosMap.get(edge.from);
      const p2 = nodePosMap.get(edge.to);
      if (!p1 || !p2) continue;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add(`${pfx}-edge`);

      const isDirected = edge.isDirected !== false;
      const isRelaxSuccess = Boolean(edge.isRelaxSuccess);
      const isRelaxing = Boolean(edge.isRelaxing);
      const isFromCurrent = Boolean(edge.isFromCurrent);
      const isMst = Boolean(edge.isMstEdge);

      let strokeColor = 'rgba(59, 130, 246, 0.2)';
      let strokeWidth = '1.5';

      if (isRelaxSuccess) {
        strokeColor = '#22c55e';
        strokeWidth = '3.5';
      } else if (isRelaxing) {
        strokeColor = '#f59e0b';
        strokeWidth = '3';
      } else if (isMst) {
        strokeColor = '#10b981';
        strokeWidth = '3';
      } else if (isFromCurrent) {
        strokeColor = 'rgba(59, 130, 246, 0.5)';
        strokeWidth = '2';
      } else if (edge.customColor) {
        strokeColor = edge.customColor;
      }

      // Line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(p1.x));
      line.setAttribute('y1', String(p1.y));
      line.setAttribute('x2', String(p2.x));
      line.setAttribute('y2', String(p2.y));
      line.setAttribute('stroke', strokeColor);
      line.setAttribute('stroke-width', strokeWidth);
      if (isRelaxSuccess) {
        line.style.animation = 'pathPulse 0.8s infinite';
      }
      g.appendChild(line);

      // 有向箭头
      if (isDirected) {
        const { points } = this.computeArrowPoints(p1, p2, nodeR, arrowSize);
        const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        arrow.setAttribute('points', points);
        arrow.setAttribute('fill', strokeColor);
        g.appendChild(arrow);
      }

      // 权重标牌 (Weight Badge)
      if (edge.weight !== undefined && edge.weight !== null) {
        const mx = (p1.x + p2.x) / 2;
        const my = (p1.y + p2.y) / 2;

        const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        bg.setAttribute('x', String(mx - 12));
        bg.setAttribute('y', String(my - 10));
        bg.setAttribute('width', '24');
        bg.setAttribute('height', '20');
        bg.setAttribute('rx', '4');

        const bgColor = isRelaxSuccess
          ? 'rgba(34, 197, 94, 0.3)'
          : isRelaxing
          ? 'rgba(245, 158, 11, 0.3)'
          : 'rgba(30, 30, 50, 0.8)';
        const borderColor = isRelaxSuccess
          ? '#22c55e'
          : isRelaxing
          ? '#f59e0b'
          : 'rgba(156, 163, 175, 0.4)';

        bg.setAttribute('fill', bgColor);
        bg.setAttribute('stroke', borderColor);
        bg.setAttribute('stroke-width', '1');
        g.appendChild(bg);

        const wt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        wt.setAttribute('x', String(mx));
        wt.setAttribute('y', String(my + 5));
        wt.setAttribute('text-anchor', 'middle');
        wt.setAttribute('fill', isRelaxSuccess ? '#22c55e' : isRelaxing ? '#f59e0b' : 'rgba(156, 163, 175, 0.7)');
        wt.setAttribute('font-size', '12');
        wt.setAttribute('font-weight', '700');
        wt.setAttribute('font-family', 'ui-monospace, monospace');
        wt.textContent = String(edge.weight);
        g.appendChild(wt);
      }

      svg.appendChild(g);
    }

    // 2. 绘制节点集 (Nodes)
    for (const node of nodes) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add(`${pfx}-node`);

      const isCurrent = Boolean(node.isCurrent);
      const isVisited = Boolean(node.isVisited);
      const isQueued = Boolean(node.isQueued);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(node.x));
      circle.setAttribute('cy', String(node.y));
      circle.setAttribute('r', String(nodeR));

      let fillColor = 'rgba(59, 130, 246, 0.12)';
      let strokeColor = '#3b82f6';
      let strokeWidth = '2';

      if (isCurrent) {
        fillColor = 'rgba(245, 158, 11, 0.5)';
        strokeColor = '#f59e0b';
        strokeWidth = '3';
        circle.style.animation = 'pulse 1s infinite';
      } else if (isVisited) {
        fillColor = 'rgba(34, 197, 94, 0.3)';
        strokeColor = '#22c55e';
        strokeWidth = '2';
      } else if (isQueued) {
        fillColor = 'rgba(168, 85, 247, 0.3)';
        strokeColor = '#a855f7';
        strokeWidth = '2';
      } else if (node.customColor) {
        fillColor = node.customColor;
      }

      circle.setAttribute('fill', fillColor);
      circle.setAttribute('stroke', strokeColor);
      circle.setAttribute('stroke-width', strokeWidth);
      g.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(node.x));
      text.setAttribute('y', String(node.y + 6));
      text.setAttribute('text-anchor', 'middle');
      const textColor = isCurrent ? '#fff' : isVisited ? '#22c55e' : isQueued ? '#a855f7' : '#3b82f6';
      text.setAttribute('fill', textColor);
      text.setAttribute('font-size', '15');
      text.setAttribute('font-weight', '700');
      text.setAttribute('font-family', 'ui-monospace, monospace');
      text.textContent = node.label !== undefined ? node.label : String(node.id);
      g.appendChild(text);

      svg.appendChild(g);
    }

    container.appendChild(svg);
    return svg;
  }
}
