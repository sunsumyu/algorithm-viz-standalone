/**
 * 2-SAT 问题与强连通缩点 (2-Satisfiability Problem) 领域视觉适配器
 * 核心：纯 SVG 逻辑蕴涵图绘制、字面量节点与 SCC 缩点视觉分色、有向箭头微弯曲防重叠
 * 规范：Matt Pocock 深模块架构，Card 1 零 HTML 表格污染，保持纯 SVG 矢量图面
 */

import { TwoSATStep } from '../../../algorithms/categories/graph/two-sat-step-compiler';

export class TwoSATCanvasAdapter {
  public static render(container: HTMLElement, step: TwoSATStep): void {
    const nodeCoords: Record<string, { x: number; y: number }> = {
      x1: { x: 90, y: 55 },
      '¬x1': { x: 90, y: 155 },
      x2: { x: 270, y: 55 },
      '¬x2': { x: 270, y: 155 },
    };

    const edges: Array<[string, string]> = [
      ['¬x1', 'x2'],
      ['¬x2', 'x1'],
      ['x1', 'x2'],
      ['¬x2', '¬x1'],
      ['x1', '¬x2'],
      ['x2', '¬x1'],
      ['x1', 'x2'],
      ['¬x2', '¬x1'],
    ];

    const svgEdges = edges
      .map(([u, v]) => {
        const p1 = nodeCoords[u];
        const p2 = nodeCoords[v];
        if (!p1 || !p2) return '';

        const isAct = step.activeEdge && step.activeEdge[0] === u && step.activeEdge[1] === v;
        const color = isAct ? '#f59e0b' : 'rgba(100, 116, 139, 0.65)';
        const width = isAct ? 3 : 1.6;

        // 贝塞尔微弯曲线以防双向重叠
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const mx = (p1.x + p2.x) / 2 - dy * 0.12;
        const my = (p1.y + p2.y) / 2 + dx * 0.12;

        return `
          <g class="graph-edge">
            <path d="M ${p1.x} ${p1.y} Q ${mx} ${my} ${p2.x} ${p2.y}" fill="none" stroke="${color}" stroke-width="${width}" marker-end="url(#two-sat-arrow)" />
          </g>
        `;
      })
      .join('');

    const nodes = ['x1', '¬x1', 'x2', '¬x2'];
    const svgNodes = nodes
      .map((u) => {
        const p = nodeCoords[u];
        if (!p) return '';

        const isCur = step.activeNode === u;
        const sccId = step.sccGroup[u] || 0;
        const isTrueLit = !u.startsWith('¬');

        let bg = isTrueLit ? '#0369a1' : '#be123c';
        let border = isTrueLit ? '#38bdf8' : '#fb7185';
        let strokeWidth = 2;
        let halo = '';

        if (sccId > 0) {
          bg = '#0f766e';
          border = '#2dd4bf';
        }

        if (isCur) {
          border = '#facc15';
          strokeWidth = 3.5;
          halo = `<circle cx="${p.x}" cy="${p.y}" r="25" fill="none" stroke="#facc15" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.8" />`;
        }

        return `
          <g class="graph-node">
            ${halo}
            <circle cx="${p.x}" cy="${p.y}" r="18" fill="${bg}" stroke="${border}" stroke-width="${strokeWidth}" />
            <text x="${p.x}" y="${p.y + 4.5}" fill="#ffffff" font-size="11.5" font-weight="800" font-family="monospace" text-anchor="middle">${u}</text>
            <text x="${p.x}" y="${p.y + 29}" fill="${sccId > 0 ? '#5eead4' : '#94a3b8'}" font-size="9.5" font-weight="700" text-anchor="middle">
              ${sccId > 0 ? `SCC:#${sccId}` : '未缩点'}
            </text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div style="width: 100%; height: 100%; display: flex; flex-direction: column; justify-content: center; align-items: center; user-select: none; background: rgba(2, 6, 23, 0.8); border-radius: 8px; padding: 8px; box-sizing: border-box;">
        <svg viewBox="0 0 360 215" style="width: 100%; height: 100%; max-height: 380px;" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="two-sat-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#090d16" />
              <stop offset="100%" stop-color="#020617" />
            </linearGradient>
            <marker id="two-sat-arrow" viewBox="0 0 10 10" refX="24" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#94a3b8" />
            </marker>
          </defs>
          <rect width="360" height="215" fill="url(#two-sat-bg-grad)" rx="8" />
          ${svgEdges}
          ${svgNodes}
          <text x="180" y="202" fill="#64748b" font-size="9.5" text-anchor="middle">
            逻辑蕴涵边 (~u ➔ v) | 同变量 x 与 ¬x 同在强连通分量则 2-SAT 无解 (UNSAT)
          </text>
        </svg>
      </div>
    `;
  }
}
