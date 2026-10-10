/**
 * 网络流最大权闭合子图 (Max-Weight Closure) 画布渲染适配器
 * 纯 SVG 沙盘呈现：超级源 S、正权收益点 E、负权成本点 I、超级汇 T、无穷大依赖边、最小割割边与闭合子图选中态
 * 严格遵循架构规范：Card 1 纯 SVG 呈现，杜绝 table 与指标套娃污染
 */

import type { ClosureStep } from '../../../algorithms/categories/graph/max-weight-closure-step-compiler';

export function renderMaxWeightClosureCanvas(container: HTMLElement, step: ClosureStep): void {
  const isSpace = step.chosenNodes.includes('E2') || step.flowEdges.some((e) => e.u === 'E2');
  const nodeCoords: Record<string, { x: number; y: number }> = isSpace
    ? {
        S: { x: 35, y: 105 },
        E1: { x: 105, y: 65 },
        E2: { x: 105, y: 145 },
        I1: { x: 215, y: 45 },
        I2: { x: 215, y: 105 },
        I3: { x: 215, y: 165 },
        T: { x: 285, y: 105 },
      }
    : {
        S: { x: 45, y: 105 },
        E1: { x: 125, y: 105 },
        I1: { x: 205, y: 65 },
        I2: { x: 205, y: 145 },
        T: { x: 285, y: 105 },
      };

  const svgEdges = step.flowEdges
    .map((e) => {
      const p1 = nodeCoords[e.u];
      const p2 = nodeCoords[e.v];
      if (!p1 || !p2) return '';
      const isCut = step.cutEdges.some((ce) => ce.u === e.u && ce.v === e.v);
      const isAct = step.activeEdge && step.activeEdge[0] === e.u && step.activeEdge[1] === e.v;
      const color = isAct ? '#f59e0b' : isCut ? '#ef4444' : e.isInf ? '#38bdf8' : '#475569';
      const width = isAct ? 3.5 : isCut ? 2.5 : 1.5;

      return `
        <g>
          <line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${color}" stroke-width="${width}" ${isCut ? 'stroke-dasharray="4,2"' : ''} />
        </g>
      `;
    })
    .join('');

  const allKeys = Object.keys(nodeCoords);
  const svgNodes = allKeys
    .map((k) => {
      const p = nodeCoords[k];
      if (!p) return '';
      const isST = k === 'S' || k === 'T';
      const isChosen = step.chosenNodes.includes(k);
      const isE = k.startsWith('E');

      const bg = isST ? '#b45309' : isChosen ? '#065f46' : isE ? '#0369a1' : '#7f1d1d';
      const border = isST ? '#f59e0b' : isChosen ? '#10b981' : isE ? '#38bdf8' : '#ef4444';

      return `
        <g>
          <circle cx="${p.x}" cy="${p.y}" r="16" fill="${bg}" stroke="${border}" stroke-width="${isChosen ? 3 : 1.5}" />
          <text x="${p.x}" y="${p.y + 4}" fill="#ffffff" font-size="10.5" font-weight="800" font-family="monospace" text-anchor="middle">${k}</text>
          <text x="${p.x}" y="${p.y + 26}" fill="${isChosen ? '#34d399' : '#94a3b8'}" font-size="8" font-weight="700" text-anchor="middle">${isChosen ? '👑选中' : isST ? '源汇' : isE ? '收益' : '成本'}</text>
        </g>
      `;
    })
    .join('');

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%; min-height: 220px; background: #0f172a; border-radius: 8px; padding: 6px; box-sizing: border-box;">
      <svg style="width: 100%; height: 205px;" viewBox="0 0 320 200">
        ${svgEdges}
        ${svgNodes}
      </svg>
      <div style="font-size: 10.5px; color: #94a3b8; text-align: center; margin-top: 4px;">
        蓝色实线为依赖边 (cap=∞ 不可割) | 红色虚线为最小割割边 | 绿色带皇冠为最终选定的最大权闭合子图
      </div>
    </div>
  `;
}
