/**
 * 左程云算法通关课 Class 062: 宽度优先遍历及其扩展
 * 共享类型与纯净沙盘渲染器 (严格遵循 Card 1 纯净沙盘契约：零 h1-h6、零重复决策、零指标药丸)
 */

import { StepBase } from '../../../../core/step-visualizer';

export interface Graph062StepBase extends StepBase {
  decision: string;
  message: string;
  log: string;
  codeLine?: any;
  statusBadge?: { text: string; type: 'success' | 'warning' | 'danger' | 'info' };
  metrics?: Record<string, string | number>;
}

/**
 * 渲染二维网格矩阵 (用于地图分析、移除障碍物、有效路径代价等)
 */
export function renderGridSandbox(
  grid: number[][],
  curCoord: [number, number] | null,
  visited: boolean[][],
  highlights?: {
    distances?: number[][];
    arrows?: number[][];
    customText?: (r: number, c: number) => string;
    customBg?: (r: number, c: number) => string;
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

      let bg = highlights?.customBg ? highlights.customBg(r, c) : (isVis ? '#e0f2fe' : '#ffffff');
      let border = isCur ? '2.5px solid #f59e0b' : '1px solid #cbd5e1';
      let shadow = isCur ? '0 0 10px rgba(245, 158, 11, 0.4)' : 'none';

      let content = `${val}`;
      if (highlights?.customText) {
        content = highlights.customText(r, c);
      } else if (highlights?.arrows) {
        const d = highlights.arrows[r][c];
        const arrowMap: Record<number, string> = { 1: '→', 2: '←', 3: '↓', 4: '↑' };
        content = arrowMap[d] || `${val}`;
      }

      cellsHtml += `
        <div style="
          width: 48px;
          height: 48px;
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
          <span style="font-size: 14px; font-weight: 700; color: #1e293b;">${content}</span>
          <span style="font-size: 9px; color: #64748b; font-family: monospace;">(${r},${c})</span>
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
 * 渲染队列/双端队列状态卡片 (用于 0-1 BFS 与普通 BFS)
 */
export function renderDequeVisualization(
  elements: Array<{ label: string; tag?: string; isFront?: boolean; isBack?: boolean }>,
  title: string = '双端队列 (Deque) 实时流'
): string {
  if (elements.length === 0) {
    return `
      <div style="margin-top: 10px; padding: 10px; background: #f1f5f9; border-radius: 8px; border: 1px dashed #cbd5e1; text-align: center; color: #64748b; font-size: 12px;">
        ${title}: [ 队列当前为空 ]
      </div>
    `;
  }

  const itemsHtml = elements
    .map((el) => {
      let bg = '#ffffff';
      let border = '1px solid #cbd5e1';
      let tagColor = '#0284c7';
      if (el.isFront) {
        bg = '#ecfdf5';
        border = '1.5px solid #10b981';
        tagColor = '#059669';
      } else if (el.isBack) {
        bg = '#eff6ff';
        border = '1.5px solid #3b82f6';
        tagColor = '#2563eb';
      }

      return `
        <div style="
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 4px 10px;
          background: ${bg};
          border: ${border};
          border-radius: 6px;
          font-family: monospace;
          font-size: 12px;
          font-weight: 700;
          color: #1e293b;
        ">
          <span>${el.label}</span>
          ${el.tag ? `<span style="font-size: 10px; color: ${tagColor}; font-weight: 800;">${el.tag}</span>` : ''}
        </div>
      `;
    })
    .join('');

  return `
    <div style="margin-top: 12px; display: flex; flex-direction: column; gap: 6px; width: 100%; max-width: 580px;">
      <div style="display: flex; justify-content: space-between; font-size: 11px; color: #475569; font-weight: 600;">
        <span>👈 队头 (pushFront / pollFirst)</span>
        <span>👉 队尾 (pushBack)</span>
      </div>
      <div style="
        display: flex;
        gap: 8px;
        overflow-x: auto;
        padding: 8px;
        background: #f8fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        align-items: center;
      ">
        ${itemsHtml}
      </div>
    </div>
  `;
}
