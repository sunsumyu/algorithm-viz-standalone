/**
 * Bellman-Ford / SPFA / 负权回路 图论画布渲染适配器 (BellmanFordCanvasAdapter)
 * 遵循 Matt Pocock 深模块哲学与单一事实来源 (Single Source of Truth)
 * 统一管理负权有向图 SVG 沙盘拓扑排布与状态监控表格渲染
 */

import { visualState } from '../visual-state-tokens';
import {
  BF_NODES,
  BF_EDGES,
  BF_NODE_POSITIONS,
  type BFStep,
} from '../../../algorithms/categories/graph/bellman-ford-step-compiler';
import type { SPFAStep } from '../../../algorithms/categories/graph/spfa-step-compiler';
import {
  NC_NODES,
  NC_EDGES,
  NC_NODE_POS,
  type NCStep,
} from '../../../algorithms/categories/graph/negative-cycle-step-compiler';

export { BF_NODES, BF_EDGES, BF_NODE_POSITIONS };
export { NC_NODES, NC_EDGES, NC_NODE_POS };

const INF = Infinity;

/**
 * 渲染标准 Bellman-Ford 主视觉：有向带权图 SVG + dist 距离监控表
 */
export function renderBellmanFordCanvas(container: HTMLElement, step: BFStep): void {
  const { dist, currentEdge, action } = step;

  const idleStyle = visualState('idle');
  const comparingStyle = visualState('comparing');
  const discoveredStyle = visualState('discovered');
  const unvisitedStyle = visualState('unvisited');

  let svgHtml = `<svg viewBox="0 0 500 250" style="width:100%; height:100%; max-height:240px;">
    <defs>
      <marker id="arrow-bf" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${idleStyle.border}" />
      </marker>
      <marker id="arrow-bf-relax" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${discoveredStyle.border}" />
      </marker>
      <marker id="arrow-bf-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${comparingStyle.border}" />
      </marker>
    </defs>`;

  for (const e of BF_EDGES) {
    const p1 = BF_NODE_POSITIONS[e.from];
    const p2 = BF_NODE_POSITIONS[e.to];
    const isCurrent = currentEdge && currentEdge.from === e.from && currentEdge.to === e.to;
    const isRelaxed = isCurrent && action === 'relax';

    const strokeColor = isRelaxed ? discoveredStyle.border : isCurrent ? comparingStyle.border : idleStyle.border;
    const strokeWidth = isCurrent ? 3.5 : 1.8;
    const marker = isRelaxed ? 'url(#arrow-bf-relax)' : isCurrent ? 'url(#arrow-bf-active)' : 'url(#arrow-bf)';

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2 + (e.from === 1 && e.to === 2 ? 12 : -8);

    svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;
    svgHtml += `<rect x="${midX - 12}" y="${midY - 8}" width="24" height="15" rx="3" fill="#ffffff" stroke="${strokeColor}" stroke-width="1" />`;
    svgHtml += `<text x="${midX}" y="${midY + 3}" fill="${e.w < 0 ? '#ef4444' : '#0f172a'}" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${e.w}</text>`;
  }

  BF_NODES.forEach((node) => {
    const p = BF_NODE_POSITIONS[node];
    const dVal = dist[node];
    const isSrc = node === 0;
    const isTarget = currentEdge && currentEdge.to === node;

    let fill = idleStyle.bg;
    let stroke = idleStyle.border;
    if (isTarget && action === 'relax') {
      fill = discoveredStyle.bg;
      stroke = discoveredStyle.border;
    } else if (isSrc) {
      fill = comparingStyle.bg;
      stroke = comparingStyle.border;
    }

    svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
    svgHtml += `<text x="${p.x}" y="${p.y + 4}" fill="${idleStyle.text}" font-size="12" font-weight="800" text-anchor="middle">${node}</text>`;
    svgHtml += `<text x="${p.x}" y="${p.y + 32}" fill="${dVal === INF ? '#94a3b8' : '#2563eb'}" font-size="11" font-family="monospace" font-weight="800" text-anchor="middle">${dVal === INF ? '∞' : dVal}</text>`;
  });

  svgHtml += `</svg>`;

  const tableRows = BF_NODES.map((node) => {
    const dVal = dist[node];
    const isCur = currentEdge && currentEdge.to === node;
    return `<tr style="${isCur ? 'background: rgba(239, 246, 255, 0.7); font-weight: 600;' : ''}">
      <td style="padding: 6px 12px; text-align: center; font-family: monospace; font-weight: 700; color: #1e293b;">${node}</td>
      <td style="padding: 6px 12px; text-align: center; font-family: monospace; font-weight: 800; color: ${dVal === INF ? unvisitedStyle.text : comparingStyle.text};">${dVal === INF ? '∞' : dVal}</td>
    </tr>`;
  }).join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; gap: 16px; padding: 8px; box-sizing: border-box;">
      <div style="flex: 1.5; min-width: 0; height: 100%;">${svgHtml}</div>
      <div style="flex: 0.5; min-width: 0; align-self: center;">
        <table style="border-collapse: collapse; width: 100%; font-size: 12px; background: ${idleStyle.bg}; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.1);">
          <thead>
            <tr style="background: ${unvisitedStyle.bg};">
              <th style="padding: 6px 12px; text-align: center; font-family: monospace; color: ${unvisitedStyle.text};">节点</th>
              <th style="padding: 6px 12px; text-align: center; font-family: monospace; color: ${unvisitedStyle.text};">dist</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * 渲染 SPFA 队列优化主视觉：有向带权图 SVG（在队着色）+ dist/inQueue 状态表
 */
export function renderSpfaCanvas(container: HTMLElement, step: SPFAStep): void {
  const { dist, inQueue, currentNode, relaxEdge, action } = step;

  const idleStyle = visualState('idle');
  const comparingStyle = visualState('comparing');
  const discoveredStyle = visualState('discovered');
  const pivotStyle = visualState('pivot');

  let svgHtml = `<svg viewBox="0 0 500 250" style="width:100%; height:100%; max-height:240px;">
    <defs>
      <marker id="arrow-spfa" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
      </marker>
      <marker id="arrow-spfa-relax" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${discoveredStyle.border}" />
      </marker>
      <marker id="arrow-spfa-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="${comparingStyle.border}" />
      </marker>
    </defs>`;

  for (const e of BF_EDGES) {
    const p1 = BF_NODE_POSITIONS[e.from];
    const p2 = BF_NODE_POSITIONS[e.to];
    const isCurrent = relaxEdge && relaxEdge.from === e.from && relaxEdge.to === e.to;
    const isRelaxed = isCurrent && action === 'relax';

    const strokeColor = isRelaxed ? discoveredStyle.border : isCurrent ? comparingStyle.border : '#cbd5e1';
    const strokeWidth = isCurrent ? 3.5 : 1.8;
    const marker = isRelaxed ? 'url(#arrow-spfa-relax)' : isCurrent ? 'url(#arrow-spfa-active)' : 'url(#arrow-spfa)';

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2 + (e.from === 1 && e.to === 2 ? 12 : -8);

    svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;
    svgHtml += `<rect x="${midX - 12}" y="${midY - 8}" width="24" height="15" rx="3" fill="#ffffff" stroke="${strokeColor}" stroke-width="1" />`;
    svgHtml += `<text x="${midX}" y="${midY + 3}" fill="${e.w < 0 ? '#ef4444' : '#0f172a'}" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${e.w}</text>`;
  }

  BF_NODES.forEach((node) => {
    const p = BF_NODE_POSITIONS[node];
    const dVal = dist[node];
    const isInQ = inQueue[node];
    const isCur = currentNode === node;
    const isTarget = relaxEdge && relaxEdge.to === node;

    let fill = '#ffffff';
    let stroke = '#cbd5e1';
    if (isTarget && action === 'relax') {
      fill = discoveredStyle.bg;
      stroke = discoveredStyle.border;
    } else if (isCur) {
      fill = pivotStyle.bg;
      stroke = pivotStyle.border;
    } else if (isInQ) {
      fill = comparingStyle.bg;
      stroke = comparingStyle.border;
    }

    svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
    svgHtml += `<text x="${p.x}" y="${p.y + 4}" fill="#0f172a" font-size="12" font-weight="800" text-anchor="middle">${node}</text>`;
    svgHtml += `<text x="${p.x}" y="${p.y + 32}" fill="${dVal === INF ? '#94a3b8' : '#2563eb'}" font-size="11" font-family="monospace" font-weight="800" text-anchor="middle">${dVal === INF ? '∞' : dVal}</text>`;
  });

  svgHtml += `</svg>`;

  const tableRows = BF_NODES.map((node) => {
    const dVal = dist[node];
    const isInQ = inQueue[node];
    const isCur = currentNode === node;
    return `<tr style="${isCur ? 'background: rgba(254, 249, 195, 0.7); font-weight: 600;' : ''}">
      <td style="padding: 6px 12px; text-align: center; font-family: monospace; font-weight: 700; color: #1e293b;">${node}</td>
      <td style="padding: 6px 12px; text-align: center; font-family: monospace; font-weight: 800; color: ${dVal === INF ? '#94a3b8' : '#2563eb'};">${dVal === INF ? '∞' : dVal}</td>
      <td style="padding: 6px 12px; text-align: center; font-family: monospace; font-weight: 700; color: ${isInQ ? '#2563eb' : '#94a3b8'};">${isInQ ? 'true' : 'false'}</td>
    </tr>`;
  }).join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; gap: 16px; padding: 8px; box-sizing: border-box;">
      <div style="flex: 1.5; min-width: 0; height: 100%;">${svgHtml}</div>
      <div style="flex: 0.5; min-width: 0; align-self: center;">
        <table style="border-collapse: collapse; width: 100%; font-size: 12px; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 1px 3px rgba(15, 23, 42, 0.1);">
          <thead>
            <tr style="background: #f1f5f9;">
              <th style="padding: 6px 12px; text-align: center; font-family: monospace; color: #475569;">节点</th>
              <th style="padding: 6px 12px; text-align: center; font-family: monospace; color: #475569;">dist</th>
              <th style="padding: 6px 12px; text-align: center; font-family: monospace; color: #475569;">在队</th>
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
    </div>
  `;
}

/**
 * 渲染负权回路检测主视觉：有向带权图 SVG（负环红色高亮）+ dist 数组芯片条
 */
export function renderNegativeCycleCanvas(container: HTMLElement, step: NCStep): void {
  const { dist, currentEdge, relaxedEdge, hasCycle, cycleEdges } = step;

  let svgHtml = `<svg viewBox="0 0 460 250" style="width:100%; height:100%; max-height:240px;">
    <defs>
      <marker id="nc-arrow-gray" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#94a3b8" />
      </marker>
      <marker id="nc-arrow-blue" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#2563eb" />
      </marker>
      <marker id="nc-arrow-green" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#16a34a" />
      </marker>
      <marker id="nc-arrow-red" markerWidth="8" markerHeight="8" refX="22" refY="4" orient="auto">
        <path d="M0,0 L8,4 L0,8 Z" fill="#dc2626" />
      </marker>
    </defs>`;

  for (const e of NC_EDGES) {
    const p1 = NC_NODE_POS[e.u];
    const p2 = NC_NODE_POS[e.v];
    const isCurrent = currentEdge && currentEdge.u === e.u && currentEdge.v === e.v;
    const isCycleEdge = cycleEdges.some((ce) => ce.u === e.u && ce.v === e.v);

    let strokeColor = '#cbd5e1';
    let strokeWidth = 2;
    let marker = 'url(#nc-arrow-gray)';

    if (isCycleEdge) {
      strokeColor = '#dc2626';
      strokeWidth = 3.5;
      marker = 'url(#nc-arrow-red)';
    } else if (isCurrent && relaxedEdge) {
      strokeColor = '#16a34a';
      strokeWidth = 3;
      marker = 'url(#nc-arrow-green)';
    } else if (isCurrent) {
      strokeColor = '#2563eb';
      strokeWidth = 3;
      marker = 'url(#nc-arrow-blue)';
    }

    const midX = (p1.x + p2.x) / 2;
    const midY = (p1.y + p2.y) / 2 + (e.u === 1 && e.v === 2 ? -10 : e.u === 3 && e.v === 1 ? 12 : 0);

    svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;
    svgHtml += `<rect x="${midX - 12}" y="${midY - 8}" width="24" height="15" rx="3" fill="#ffffff" stroke="${strokeColor}" stroke-width="1" />`;
    svgHtml += `<text x="${midX}" y="${midY + 3}" fill="${e.w < 0 ? '#dc2626' : '#0f172a'}" font-size="10" font-weight="800" font-family="monospace" text-anchor="middle">${e.w}</text>`;
  }

  NC_NODES.forEach((node) => {
    const p = NC_NODE_POS[node];
    const dVal = dist[node];
    const isCurrentTarget = currentEdge && currentEdge.v === node;
    const inCycle = hasCycle && (node === 1 || node === 2 || node === 3);

    let fill = '#ffffff';
    let stroke = '#cbd5e1';
    if (inCycle) {
      fill = '#fee2e2';
      stroke = '#dc2626';
    } else if (isCurrentTarget && relaxedEdge) {
      fill = '#dcfce7';
      stroke = '#16a34a';
    } else if (isCurrentTarget) {
      fill = '#dbeafe';
      stroke = '#2563eb';
    } else if (node === 0) {
      fill = '#eff6ff';
      stroke = '#3b82f6';
    }

    svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="18" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
    svgHtml += `<text x="${p.x}" y="${p.y + 4}" fill="#0f172a" font-size="12" font-weight="800" text-anchor="middle">${node}</text>`;
    svgHtml += `<text x="${p.x}" y="${p.y + 30}" fill="${dVal >= 999999 ? '#94a3b8' : '#2563eb'}" font-size="10.5" font-family="monospace" font-weight="800" text-anchor="middle">${dVal >= 999999 ? 'INF' : dVal}</text>`;
  });

  svgHtml += `</svg>`;

  const distChips = NC_NODES.map((node) => {
    const dVal = dist[node];
    const isTarget = currentEdge && currentEdge.v === node;
    const chipStyle = isTarget
      ? 'display: flex; flex-direction: column; align-items: center; padding: 6px; border-radius: 6px; border: 1px solid #93c5fd; background: #eff6ff;'
      : 'display: flex; flex-direction: column; align-items: center; padding: 6px; border-radius: 6px; border: 1px solid #e2e8f0; background: #f8fafc;';
    return `<div style="${chipStyle}">
      <span style="font-size: 10px; color: #64748b; font-family: monospace;">dist[${node}]</span>
      <span style="font-size: 12px; font-family: monospace; font-weight: 700; color: ${dVal >= 999999 ? '#94a3b8' : '#2563eb'};">${dVal >= 999999 ? 'INF' : dVal}</span>
    </div>`;
  }).join('');

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 8px; box-sizing: border-box;">
      <div style="width: 100%;">${svgHtml}</div>
      <div style="display: flex; gap: 8px; justify-content: center; width: 100%;">${distChips}</div>
    </div>
  `;
}

/**
 * 领域视觉适配器静态门面类 (BellmanFordCanvasAdapter)
 */
export class BellmanFordCanvasAdapter {
  static renderBF(container: HTMLElement, step: BFStep): void {
    renderBellmanFordCanvas(container, step);
  }

  static renderSPFA(container: HTMLElement, step: SPFAStep): void {
    renderSpfaCanvas(container, step);
  }

  static renderNegativeCycle(container: HTMLElement, step: NCStep): void {
    renderNegativeCycleCanvas(container, step);
  }
}
