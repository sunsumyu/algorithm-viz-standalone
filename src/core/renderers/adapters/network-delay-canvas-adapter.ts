/**
 * 网络延迟时间拓扑画布渲染适配器 (NetworkDelayCanvasAdapter)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 纯净 SVG 拓扑沙盘渲染、零内联标题、零镜像指标、统一 visualState 状态规范
 */

import { visualState } from '../visual-state-tokens';
import type { NetworkDelayStep } from '../../../algorithms/categories/graph/network-delay-time-step-compiler';

export function renderNetworkDelayCanvas(container: HTMLElement, step: NetworkDelayStep): void {
  const n = step.distList.length - 1;
  const is4 = n === 4;

  const nodeCoords: Record<number, { x: number; y: number }> = is4
    ? {
        2: { x: 60, y: 90 },
        1: { x: 160, y: 45 },
        3: { x: 160, y: 135 },
        4: { x: 260, y: 90 },
      }
    : {
        1: { x: 60, y: 90 },
        2: { x: 160, y: 90 },
        3: { x: 260, y: 90 },
      };

  const edges: Array<[number, number, number]> = is4
    ? [
        [2, 1, 1],
        [2, 3, 1],
        [3, 4, 1],
      ]
    : [[1, 2, 1]];

  const idleStyle = visualState('idle');
  const comparingStyle = visualState('comparing');
  const sortedStyle = visualState('sorted');
  const pivotStyle = visualState('pivot');
  const discoveredStyle = visualState('discovered');
  const unvisitedStyle = visualState('unvisited');

  let svgHtml = `<svg viewBox="0 0 320 180" style="width:100%; height:100%; max-height:240px;">
    <defs>
      <marker id="delay-arrow-base" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${idleStyle.border}" />
      </marker>
      <marker id="delay-arrow-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${comparingStyle.border}" />
      </marker>
      <marker id="delay-arrow-relaxed" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${discoveredStyle.border}" />
      </marker>
    </defs>`;

  for (const [u, v, w] of edges) {
    const p1 = nodeCoords[u];
    const p2 = nodeCoords[v];
    if (!p1 || !p2) continue;

    const isAct = step.activeEdge && step.activeEdge[0] === u && step.activeEdge[1] === v;
    const isRelaxed = isAct && step.status === 'relax';

    const strokeColor = isRelaxed ? discoveredStyle.border : isAct ? comparingStyle.border : idleStyle.border;
    const strokeWidth = isAct ? 3.5 : 1.8;
    const marker = isRelaxed ? 'url(#delay-arrow-relaxed)' : isAct ? 'url(#delay-arrow-active)' : 'url(#delay-arrow-base)';

    const mx = (p1.x + p2.x) / 2;
    const my = (p1.y + p2.y) / 2 + (is4 && u === 2 && v === 3 ? 8 : -4);

    svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;
    svgHtml += `<rect x="${mx - 12}" y="${my - 8}" width="24" height="15" rx="3" fill="#ffffff" stroke="${strokeColor}" stroke-width="1" />`;
    svgHtml += `<text x="${mx}" y="${my + 3}" fill="${idleStyle.text}" font-size="9" font-weight="800" font-family="monospace" text-anchor="middle">${w}ms</text>`;
  }

  const nodes = is4 ? [1, 2, 3, 4] : [1, 2, 3];
  nodes.forEach((u) => {
    const p = nodeCoords[u];
    if (!p) return;

    const isCur = step.curNode === u && step.status !== 'done';
    const isVis = step.visitedList[u];
    const dVal = step.distList[u];
    const isInf = dVal === Infinity;
    const dStr = isInf ? '∞' : `${dVal}ms`;

    let fill = idleStyle.bg;
    let stroke = idleStyle.border;
    if (isCur) {
      fill = pivotStyle.bg;
      stroke = pivotStyle.border;
    } else if (isInf && step.status === 'done') {
      fill = '#fee2e2';
      stroke = '#ef4444';
    } else if (isVis) {
      fill = sortedStyle.bg;
      stroke = sortedStyle.border;
    } else if (!isInf) {
      fill = comparingStyle.bg;
      stroke = comparingStyle.border;
    }

    svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
    svgHtml += `<text x="${p.x}" y="${p.y + 4}" fill="${idleStyle.text}" font-size="12" font-weight="800" text-anchor="middle">${u}</text>`;
    svgHtml += `<text x="${p.x}" y="${p.y + 32}" fill="${isInf && step.status === 'done' ? '#ef4444' : isInf ? unvisitedStyle.text : isVis ? sortedStyle.text : comparingStyle.text}" font-size="11" font-family="monospace" font-weight="800" text-anchor="middle">d:${dStr}</text>`;
  });

  svgHtml += `</svg>`;

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; padding: 4px; box-sizing: border-box;">
      <div style="width: 100%; max-width: 600px; height: 100%; max-height: 250px; display: flex; align-items: center; justify-content: center;">
        ${svgHtml}
      </div>
    </div>
  `;
}

export class NetworkDelayCanvasAdapter {
  public static render(container: HTMLElement, step: NetworkDelayStep): void {
    renderNetworkDelayCanvas(container, step);
  }
}
