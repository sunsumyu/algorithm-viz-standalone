/**
 * 左程云算法通关课 Class 064: Dijkstra 算法及其扩展
 * 共享类型与纯净沙盘渲染器 (严格遵循 Card 1 纯净沙盘契约：零 h1-h6、零重复决策、零指标药丸)
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Graph064StepBase extends StepBase {
  decision: string;
  message: string;
  log: string;
  codeLine?: any;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
}

/**
 * 渲染通用小根堆 (Priority Queue) 状态
 */
export function renderGraph064PriorityQueue(
  items: Array<{ label: string; priority: number | string; highlight?: boolean }>,
  title: string = '小根堆 (Min-Heap) 波前'
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
    <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 4px; padding: 8px 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <span style="font-size: 11px; font-weight: 700; color: #475569;">${title} (${items.length} 个待扩展):</span>
      </div>
      <div style="display: flex; gap: 6px; flex-wrap: wrap;">${badges}</div>
    </div>
  `;
}

/**
 * 渲染 2D 网格高程/水深/代价沙盘 (用于最小体力消耗、水位上升游泳、状态压缩等)
 */
export function renderGraph064GridSandbox(
  grid: number[][],
  curCoord: [number, number] | null,
  visited: boolean[][],
  highlights?: {
    distGrid?: number[][];
    pathNodes?: Array<[number, number]>;
    customBg?: (r: number, c: number) => string;
    customText?: (r: number, c: number) => string;
  }
): string {
  const m = grid.length;
  const n = grid[0].length;

  let rowsHtml = '';
  for (let r = 0; r < m; r++) {
    let cellsHtml = '';
    for (let c = 0; c < n; c++) {
      const val = grid[r][c];
      const isCur = curCoord && curCoord[0] === r && curCoord[1] === c;
      const isVis = visited && visited[r] && visited[r][c];
      const isPath = highlights?.pathNodes?.some(([pr, pc]) => pr === r && pc === c);

      let bg = '#ffffff';
      if (highlights?.customBg) {
        bg = highlights.customBg(r, c);
      } else if (isCur) {
        bg = '#fef3c7'; // 当前探查 (黄色)
      } else if (isPath) {
        bg = '#d1fae5'; // 最优路径 (绿色)
      } else if (isVis) {
        bg = '#e0f2fe'; // 已锁定 (蓝色)
      }

      let border = isCur ? '2.5px solid #f59e0b' : isPath ? '2px solid #10b981' : '1px solid #cbd5e1';
      let shadow = isCur ? '0 0 10px rgba(245, 158, 11, 0.45)' : 'none';

      let text = `${val}`;
      if (highlights?.customText) {
        text = highlights.customText(r, c);
      }

      const distVal = highlights?.distGrid?.[r]?.[c];
      const distStr = distVal !== undefined ? (distVal === Infinity ? '∞' : String(distVal)) : '';

      cellsHtml += `
        <div style="
          width: 52px;
          height: 52px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: ${bg};
          border: ${border};
          border-radius: 8px;
          box-shadow: ${shadow};
          transition: all 0.2s ease;
          position: relative;
        ">
          <span style="font-size: 13px; font-weight: 800; color: #0f172a;">${text}</span>
          ${distStr ? `<span style="font-size: 9px; font-weight: 700; color: #6366f1; font-family: monospace;">d:${distStr}</span>` : ''}
          <span style="font-size: 8px; color: #94a3b8; font-family: monospace;">(${r},${c})</span>
        </div>
      `;
    }
    rowsHtml += `<div style="display: flex; gap: 8px; justify-content: center;">${cellsHtml}</div>`;
  }

  return `
    <div style="display: flex; flex-direction: column; gap: 8px; align-items: center; justify-content: center; width: 100%; padding: 12px; box-sizing: border-box;">
      <div style="display: flex; flex-direction: column; gap: 8px; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.03);">
        ${rowsHtml}
      </div>
    </div>
  `;
}

/**
 * 渲染图节点最短路状态面板 (用于网络延迟时间、分层图与电动车充电)
 */
export function renderGraph064NodeStatusMatrix(
  nodes: Array<{ id: number | string; label: string; dist: number | string; visited: boolean; isCurrent?: boolean }>,
  title: string = '节点松弛状态表'
): string {
  const cards = nodes.map((node) => {
    const bg = node.isCurrent ? '#fef3c7' : node.visited ? '#ecfdf5' : '#ffffff';
    const border = node.isCurrent ? '2px solid #f59e0b' : node.visited ? '1px solid #10b981' : '1px solid #cbd5e1';
    const textCol = node.isCurrent ? '#b45309' : node.visited ? '#065f46' : '#1e293b';
    const distText = node.dist === Infinity ? '∞' : String(node.dist);

    return `
      <div style="
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-width: 68px;
        padding: 6px 8px;
        background: ${bg};
        border: ${border};
        border-radius: 6px;
        box-sizing: border-box;
      ">
        <span style="font-size: 11px; font-weight: 700; color: ${textCol};">${node.label}</span>
        <span style="font-size: 12px; font-weight: 800; color: #6366f1; font-family: monospace;">${distText}</span>
        <span style="font-size: 9px; color: ${node.visited ? '#10b981' : '#94a3b8'};">${node.visited ? '已锁定' : '未收敛'}</span>
      </div>
    `;
  }).join('');

  return `
    <div style="display: flex; flex-direction: column; gap: 6px; width: 100%; box-sizing: border-box;">
      <span style="font-size: 11px; font-weight: 700; color: #475569;">${title}:</span>
      <div style="display: flex; gap: 8px; flex-wrap: wrap; justify-content: center;">${cards}</div>
    </div>
  `;
}
