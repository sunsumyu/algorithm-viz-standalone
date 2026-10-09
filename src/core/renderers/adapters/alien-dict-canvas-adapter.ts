/**
 * 火星词典拓扑排序 (Alien Dictionary) 领域视觉适配器
 * 核心：环形拓扑分布算法、有向偏序依赖箭头、字符节点状态分色与入度徽章
 * 规范：Matt Pocock 深模块架构，Card 1 零 HTML 表格污染，保持纯净矢量图面
 */

import { AlienStep } from '../../../algorithms/categories/graph/alien-dict-step-compiler';

export class AlienDictCanvasAdapter {
  public static render(container: HTMLElement, step: AlienStep): void {
    const numChars = step.charList.length || 1;
    const centerX = 180;
    const centerY = 100;
    const radius = 62;

    const coords: Record<string, { x: number; y: number }> = {};
    step.charList.forEach((ch, idx) => {
      const angle = (2 * Math.PI * idx) / numChars - Math.PI / 2;
      coords[ch] = {
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });

    const svgEdges = step.edges
      .map(([u, v]) => {
        const p1 = coords[u];
        const p2 = coords[v];
        if (!p1 || !p2) return '';

        const isActive = step.activeEdge && step.activeEdge[0] === u && step.activeEdge[1] === v;
        const color = isActive ? '#f59e0b' : 'rgba(100, 116, 139, 0.65)';
        const width = isActive ? 3 : 1.6;

        return `
          <g class="graph-edge">
            <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}"
                  stroke="${color}" stroke-width="${width}" marker-end="url(#alien-arrow)" />
          </g>
        `;
      })
      .join('');

    const svgNodes = step.charList
      .map((ch) => {
        const p = coords[ch];
        if (!p) return '';

        const isOrdered = step.topoOrder.includes(ch);
        const inQ = step.queue?.includes(ch);
        const isAct = step.activeChar === ch;
        const isErr = step.status === 'error';

        let bg = '#0f172a';
        let border = '#334155';
        let strokeWidth = 2;
        let halo = '';

        if (isOrdered) {
          bg = '#064e3b';
          border = '#10b981';
        } else if (inQ) {
          bg = '#1e3a8a';
          border = '#38bdf8';
        }

        if (isErr) {
          bg = '#7f1d1d';
          border = '#ef4444';
        }

        if (isAct) {
          border = '#f59e0b';
          strokeWidth = 3.5;
          halo = `<circle cx="${p.x}" cy="${p.y}" r="24" fill="none" stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.8" />`;
        }

        const deg = step.inDegrees[ch] ?? 0;

        return `
          <g class="graph-node">
            ${halo}
            <circle cx="${p.x}" cy="${p.y}" r="17" fill="${bg}" stroke="${border}" stroke-width="${strokeWidth}" />
            <text x="${p.x}" y="${p.y + 4.5}" fill="#ffffff" font-size="12" font-weight="800" font-family="monospace" text-anchor="middle">${ch}</text>
            <text x="${p.x}" y="${p.y + 28}" fill="#94a3b8" font-size="9" font-weight="700" text-anchor="middle">入度:${deg}</text>
          </g>
        `;
      })
      .join('');

    container.innerHTML = `
      <div class="w-full h-full flex flex-col justify-center items-center select-none bg-slate-950/80 rounded-lg p-2 box-border">
        <svg viewBox="0 0 360 210" class="w-full h-full max-h-[380px]" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="alien-bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#090d16" />
              <stop offset="100%" stop-color="#020617" />
            </linearGradient>
            <marker id="alien-arrow" viewBox="0 0 10 10" refX="23" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#94a3b8" />
            </marker>
          </defs>
          <rect width="360" height="210" fill="url(#alien-bg-grad)" rx="8" />
          ${svgEdges}
          ${svgNodes}
          <text x="180" y="198" fill="#64748b" font-size="9.5" text-anchor="middle">
            单词表: [${step.wordList.join(', ')}] | 提取相邻首异字符偏序建边 (u ➔ v)
          </text>
        </svg>
      </div>
    `;
  }
}
