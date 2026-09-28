/**
 * 左程云算法通关课 Class 060: 拓扑排序扩展专题
 * 共享类型与纯净沙盘渲染器 (严格遵循 Card 1 纯净沙盘契约：零 h1-h6、零重复决策、零指标药丸)
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Graph060StepBase extends StepBase {
  decision: string;
  message: string;
  log: string;
  codeLine?: any;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
}

export interface Graph060NodeCoord {
  id: number;
  x: number;
  y: number;
  label?: string;
}

/**
 * 渲染拓扑 DAG SVG 沙盘
 */
export function renderGraph060SvgTopology(
  nodes: Graph060NodeCoord[],
  edges: Array<{ from: number; to: number; w?: number | string }>,
  highlights?: {
    currentNode?: number | null;
    inQueueNodes?: Set<number> | boolean[] | number[];
    processedNodes?: Set<number> | boolean[];
    activeEdge?: { from: number; to: number } | null;
    nodeValues?: Record<number, string | number> | Array<string | number>;
    valueLabel?: string;
  }
): string {
  const width = 500;
  const height = 220;

  // 1. 渲染有向边与箭头
  const edgesSvg = edges.map((e) => {
    const fromNode = nodes.find((n) => n.id === e.from);
    const toNode = nodes.find((n) => n.id === e.to);
    if (!fromNode || !toNode) return '';

    const isActive = highlights?.activeEdge &&
      highlights.activeEdge.from === e.from &&
      highlights.activeEdge.to === e.to;

    const stroke = isActive ? '#f59e0b' : '#94a3b8';
    const strokeWidth = isActive ? 3 : 1.5;

    const dx = toNode.x - fromNode.x;
    const dy = toNode.y - fromNode.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist === 0) return '';

    const r = 18;
    const x1 = fromNode.x + (dx * r) / dist;
    const y1 = fromNode.y + (dy * r) / dist;
    const x2 = toNode.x - (dx * r) / dist;
    const y2 = toNode.y - (dy * r) / dist;

    const midX = (x1 + x2) / 2 + (dy / dist) * 7;
    const midY = (y1 + y2) / 2 - (dx / dist) * 7;

    return `
      <g>
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" />
        <circle cx="${x2}" cy="${y2}" r="3" fill="${stroke}" />
        ${e.w !== undefined ? `
          <rect x="${midX - 10}" y="${midY - 8}" width="20" height="14" rx="3" fill="#ffffff" stroke="#e2e8f0" stroke-width="1" />
          <text x="${midX}" y="${midY + 3}" text-anchor="middle" font-size="10" font-weight="700" fill="${isActive ? '#d97706' : '#475569'}" font-family="monospace">${e.w}</text>
        ` : ''}
      </g>
    `;
  }).join('');

  // 2. 渲染节点
  const nodesSvg = nodes.map((n) => {
    const isCur = highlights?.currentNode === n.id;
    let inQueue = false;
    if (highlights?.inQueueNodes) {
      if (highlights.inQueueNodes instanceof Set) inQueue = highlights.inQueueNodes.has(n.id);
      else if (Array.isArray(highlights.inQueueNodes)) {
        if (typeof highlights.inQueueNodes[0] === 'number') {
          inQueue = (highlights.inQueueNodes as number[]).includes(n.id);
        } else {
          inQueue = Boolean(highlights.inQueueNodes[n.id]);
        }
      }
    }

    let isDone = false;
    if (highlights?.processedNodes) {
      if (highlights.processedNodes instanceof Set) isDone = highlights.processedNodes.has(n.id);
      else if (Array.isArray(highlights.processedNodes)) isDone = Boolean(highlights.processedNodes[n.id]);
    }

    const fill = isCur ? '#fef3c7' : inQueue ? '#ede9fe' : isDone ? '#ecfdf5' : '#ffffff';
    const stroke = isCur ? '#f59e0b' : inQueue ? '#8b5cf6' : isDone ? '#10b981' : '#64748b';
    const strokeWidth = isCur ? 3 : inQueue ? 2.5 : 2;
    const textCol = isCur ? '#b45309' : inQueue ? '#6d28d9' : isDone ? '#047857' : '#0f172a';

    const val = (highlights?.nodeValues as any)?.[n.id];
    const valText = val !== undefined ? String(val) : '';
    const prefix = highlights?.valueLabel ? `${highlights.valueLabel}:` : '';

    return `
      <g transform="translate(${n.x}, ${n.y})">
        <circle r="18" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}" />
        <text y="4" text-anchor="middle" font-size="12" font-weight="800" fill="${textCol}" font-family="monospace">${n.label || n.id}</text>
        ${valText ? `<text y="30" text-anchor="middle" font-size="10" font-weight="700" fill="#6366f1" font-family="monospace">${prefix}${valText}</text>` : ''}
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
 * 渲染入度与状态监控卡片条
 */
export function renderGraph060InDegreeGrid(
  inDegree: number[],
  currentNode?: number | null,
  processed?: Set<number> | boolean[],
  title: string = '入度表 inDegree[]'
): string {
  const cards = inDegree.map((deg, idx) => {
    const isCur = currentNode === idx;
    let isDone = false;
    if (processed) {
      if (processed instanceof Set) isDone = processed.has(idx);
      else if (Array.isArray(processed)) isDone = Boolean(processed[idx]);
    }

    const isZero = deg === 0 && !isDone;
    const bg = isCur ? '#fef3c7' : isDone ? '#f1f5f9' : isZero ? '#ede9fe' : '#ffffff';
    const border = isCur ? '2px solid #f59e0b' : isZero ? '1.5px solid #8b5cf6' : '1px solid #cbd5e1';
    const textCol = isCur ? '#b45309' : isZero ? '#7c3aed' : '#1e293b';

    return `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; min-width: 50px; padding: 4px 6px; background: ${bg}; border: ${border}; border-radius: 6px; box-sizing: border-box;">
        <span style="font-size: 9px; color: #64748b;">N${idx}</span>
        <span style="font-size: 12px; font-weight: 800; color: ${textCol}; font-family: monospace;">deg: ${deg}</span>
        <span style="font-size: 8px; color: ${isDone ? '#94a3b8' : isZero ? '#8b5cf6' : '#64748b'};">${isDone ? '已处理' : isZero ? '就绪' : '依赖中'}</span>
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
 * 渲染拓扑就绪队列
 */
export function renderGraph060QueuePills(
  queue: number[],
  title: string = '拓扑排序入度为 0 就绪队列'
): string {
  const pills = queue.length > 0
    ? queue.map((node) => `<span style="padding: 2px 8px; background: #8b5cf6; color: #ffffff; border-radius: 4px; font-weight: 700; font-size: 11px;">Node ${node}</span>`).join(' ➔ ')
    : '<span style="color: #94a3b8; font-size: 11px;">队列为空</span>';

  return `
    <div style="display: flex; gap: 12px; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; padding: 6px 14px; border-radius: 6px;">
      <span style="font-size: 11px; font-weight: 700; color: #475569;">${title}:</span>
      <div style="display: flex; gap: 6px; align-items: center;">${pills}</div>
    </div>
  `;
}
