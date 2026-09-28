/**
 * 左程云算法通关课 Class 061: 最短路全解专题 (朴素/堆优化 Dijkstra, Bellman-Ford, SPFA, Floyd, 负环)
 * 共享类型与纯净沙盘渲染器 (严格遵循 Card 1 纯净沙盘契约：零 h1-h6、零重复决策、零指标药丸)
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Graph061StepBase extends StepBase {
  decision: string;
  message: string;
  log: string;
  codeLine?: any;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
}

/**
 * 拓扑图节点坐标定义
 */
export interface Graph061NodeCoord {
  id: number;
  x: number;
  y: number;
  label?: string;
}

/**
 * 渲染拓扑有向图 SVG 沙盘
 */
export function renderGraph061SvgTopology(
  nodes: Graph061NodeCoord[],
  edges: Array<{ from: number; to: number; w: number }>,
  highlights?: {
    currentNode?: number | null;
    visitedNodes?: Set<number> | boolean[];
    activeEdge?: { from: number; to: number } | null;
    distMap?: number[];
  }
): string {
  const width = 500;
  const height = 220;

  // 1. 渲染边与箭头
  const edgesSvg = edges.map((e) => {
    const fromNode = nodes.find((n) => n.id === e.from);
    const toNode = nodes.find((n) => n.id === e.to);
    if (!fromNode || !toNode) return '';

    const isActive = highlights?.activeEdge &&
      highlights.activeEdge.from === e.from &&
      highlights.activeEdge.to === e.to;

    const stroke = isActive ? '#f59e0b' : '#94a3b8';
    const strokeWidth = isActive ? 3 : 1.5;

    // 偏移中心连线
    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return '';

    const r = 18;
    const x1 = fromNode.x + (dx * r) / dist;
    const y1 = fromNode.y + (dy * r) / dist;
    const x2 = toNode.x - (dx * r) / dist;
    const y2 = toNode.y - (dy * r) / dist;

    // 中点权重标注
    const midX = (x1 + x2) / 2 + (dy / dist) * 8;
    const midY = (y1 + y2) / 2 - (dx / dist) * 8;

    return `
      <g>
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" />
        <circle cx="${x2}" cy="${y2}" r="3" fill="${stroke}" />
        <rect x="${midX - 10}" y="${midY - 8}" width="20" height="14" rx="3" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
        <text x="${midX}" y="${midY + 3}" text-anchor="middle" font-size="10" font-weight="700" fill="${isActive ? '#d97706' : '#475569'}" font-family="monospace">${e.w}</text>
      </g>
    `;
  }).join('');

  // 2. 渲染节点
  const nodesSvg = nodes.map((n) => {
    const isCur = highlights?.currentNode === n.id;
    let isVis = false;
    if (highlights?.visitedNodes) {
      if (highlights.visitedNodes instanceof Set) {
        isVis = highlights.visitedNodes.has(n.id);
      } else if (Array.isArray(highlights.visitedNodes)) {
        isVis = Boolean(highlights.visitedNodes[n.id]);
      }
    }

    const fill = isCur ? '#fef3c7' : isVis ? '#ecfdf5' : '#ffffff';
    const stroke = isCur ? '#f59e0b' : isVis ? '#10b981' : '#64748b';
    const strokeWidth = isCur ? 3 : 2;
    const textCol = isCur ? '#b45309' : isVis ? '#047857' : '#0f172a';

    const distVal = highlights?.distMap?.[n.id];
    const distText = distVal !== undefined ? (distVal === Infinity ? '∞' : String(distVal)) : '';

    return `
      <g transform="translate(${n.x}, ${n.y})">
        <circle r="18" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
        <text y="4" text-anchor="middle" font-size="12" font-weight="800" fill="${textCol}" font-family="monospace">${n.label || n.id}</text>
        ${distText ? `<text y="30" text-anchor="middle" font-size="10" font-weight="700" fill="#6366f1" font-family="monospace">d:${distText}</text>` : ''}
      </g>
    `;
  }).join('');

  return `
    <div style="display: flex; justify-content: center; width: 100%; overflow: hidden;">
      <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="max-width: 100%; height: auto;">
        ${edgesSvg}
        ${nodesSvg}
      </svg>
    </div>
  `;
}

/**
 * 渲染全网节点距离监控卡片条
 */
export function renderGraph061DistGrid(
  dist: number[],
  visited?: Set<number> | boolean[],
  currentNode?: number | null,
  title: string = 'dist 最短距离表'
): string {
  const cards = dist.map((d, idx) => {
    const isCur = currentNode === idx;
    let isVis = false;
    if (visited) {
      if (visited instanceof Set) isVis = visited.has(idx);
      else if (Array.isArray(visited)) isVis = Boolean(visited[idx]);
    }

    const bg = isCur ? '#fef3c7' : isVis ? '#ecfdf5' : '#ffffff';
    const border = isCur ? '2px solid #f59e0b' : isVis ? '1px solid #10b981' : '1px solid #cbd5e1';
    const textCol = isCur ? '#b45309' : isVis ? '#047857' : '#1e293b';

    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 54px; padding: 4px 6px; background: ${bg}; border: ${border}; border-radius: 6px; box-sizing: border-box;">
        <span style="font-size: 9px; color: #64748b;">Node ${idx}</span>
        <span style="font-size: 12px; font-weight: 800; color: #6366f1; font-family: monospace;">${d === Infinity ? '∞' : d}</span>
        <span style="font-size: 8px; color: ${isVis ? '#10b981' : '#94a3b8'};">${isVis ? '已收敛' : '未锁定'}</span>
      </div>
    `;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 4px; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; max-width: 500px; box-sizing: border-box;">
      <span style="font-size: 11px; font-weight: 700; color: #475569;">${title}:</span>
      <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: center;">${cards}</div>
    </div>
  `;
}

/**
 * 渲染通用小根堆 (Priority Queue) 状态
 */
export function renderGraph061PriorityQueue(
  items: Array<{ label: string; priority: number | string; highlight?: boolean }>,
  title: string = '小根堆 (Min-Heap) 优先队列'
): string {
  if (items.length === 0) {
    return `
      <div style="margin-top: 8px; padding: 8px 12px; background: #f8fafc; border-radius: 6px; border: 1px dashed #cbd5e1; text-align: center; color: #64748b; font-size: 11px; font-family: monospace;">
        ${title}: [ 优先队列当前为空 ]
      </div>
    `;
  }

  const badges = items.slice(0, 8).map((it, idx) => {
    const isTop = idx === 0;
    const bg = isTop ? '#ecfdf5' : it.highlight ? '#fef3c7' : '#f1f5f9';
    const border = isTop ? '1px solid #10b981' : it.highlight ? '1px solid #f59e0b' : '1px solid #e2e8f0';
    const textCol = isTop ? '#047857' : it.highlight ? '#b45309' : '#334155';
    return `
      <div style="display: flex; align-items: center; gap: 4px; padding: 3px 8px; background: ${bg}; border: ${border}; border-radius: 4px; font-size: 11px; font-family: monospace; color: ${textCol};">
        ${isTop ? '<span style="font-size: 10px;">👑</span>' : ''}
        <span>${it.label}</span>
        <strong style="color: #6366f1;">(${it.priority})</strong>
      </div>
    `;
  }).join('');

  return `
    <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 4px; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; width: 100%; max-width: 500px; box-sizing: border-box;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 11px; font-weight: 700; color: #475569;">${title} (${items.length} 个待扩展):</span>
      </div>
      <div style="display: flex; gap: 6px; flex-wrap: wrap;">${badges}</div>
    </div>
  `;
}

