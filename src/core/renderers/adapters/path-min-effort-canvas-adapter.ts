/**
 * 最小体力消耗路径 (Path With Minimum Effort) 画布适配器
 * 核心原语：2D 网格高程等高线阶梯色渲染、Dijkstra 探索格聚焦、最小瓶颈落差胶囊
 * 严格遵循深模块规范 (Deep Module) 与 Card 1 纯净沙盘契约
 */

import { BinaryGridCanvasAdapter } from './binary-grid-canvas-adapter';
import { RecursionTreeAdapter } from '../recursion-tree-adapter';
import type { EffortStep } from '../../../algorithms/categories/graph/path-min-effort-step-compiler';

export class PathMinEffortCanvasAdapter {
  static render(container: HTMLElement, step: EffortStep): void {
    const { grid, dist, visited, curR, curC, pathNodes, status } = step;
    const rows = grid.length;
    const cols = grid[0].length;
    const pathSet = new Set(pathNodes.map(([r, c]) => `${r},${c}`));

    let minH = Infinity;
    let maxH = -Infinity;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] < minH) minH = grid[r][c];
        if (grid[r][c] > maxH) maxH = grid[r][c];
      }
    }

    const isDone = status === 'done';

    BinaryGridCanvasAdapter.renderGridCanvas(container, {
      rows,
      cols,
      cellSize: rows <= 3 ? '104px' : rows <= 4 ? '90px' : '76px',
      gap: '10px',
      variant: 'topology',
      showCoords: false,
      maxWidth: '560px',
      getCell: (r, c) => {
        const isCur = r === curR && c === curC;
        const isPath = pathSet.has(`${r},${c}`);
        const isTarget = r === rows - 1 && c === cols - 1;
        const isStart = r === 0 && c === 0;
        const h = grid[r][c];
        const d = dist[r][c];
        const isVis = visited[r][c];

        const ratio = maxH > minH ? (h - minH) / (maxH - minH) : 0;
        let bg = ratio > 0.7 ? '#fef2f2' : ratio > 0.4 ? '#fff7ed' : '#f0fdf4';
        let border = ratio > 0.7 ? '1.5px solid #fecaca' : ratio > 0.4 ? '1.5px solid #fed7aa' : '1.5px solid #bbf7d0';
        let color = ratio > 0.7 ? '#991b1b' : ratio > 0.4 ? '#9a3412' : '#166534';

        if (isDone && isPath) {
          bg = 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)';
          border = '2.5px solid #10b981';
          color = '#065f46';
        } else if (isCur) {
          bg = 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)';
          border = '2.5px solid #f59e0b';
          color = '#92400e';
        } else if (isVis) {
          bg = '#f1f5f9';
          border = '1.5px solid #cbd5e1';
          color = '#475569';
        }

        const badgeHtml = isStart
          ? '<span style="font-size: 9px; font-weight: 800; background: #3b82f6; color: #fff; padding: 1px 5px; border-radius: 4px;">起点</span>'
          : isTarget
          ? '<span style="font-size: 9px; font-weight: 800; background: #10b981; color: #fff; padding: 1px 5px; border-radius: 4px;">终点</span>'
          : isCur
          ? '<span style="font-size: 9px; font-weight: 800; background: #f59e0b; color: #fff; padding: 1px 5px; border-radius: 4px;">探索</span>'
          : isPath && isDone
          ? '<span style="font-size: 9px; font-weight: 800; background: #059669; color: #fff; padding: 1px 5px; border-radius: 4px;">最优</span>'
          : isVis
          ? '<span style="font-size: 9px; font-weight: 700; color: #94a3b8;">已确认</span>'
          : '';

        let diffBadgeBg = '#f1f5f9';
        let diffBadgeColor = '#64748b';
        if (d !== Infinity) {
          diffBadgeBg = isCur ? '#fef3c7' : (isPath && isDone) ? '#d1fae5' : isVis ? '#e2e8f0' : '#f1f5f9';
          diffBadgeColor = isCur ? '#b45309' : (isPath && isDone) ? '#047857' : isVis ? '#334155' : '#64748b';
        }

        return {
          text: '',
          extraHtml: `
            <div style="display: flex; flex-direction: column; width: 100%; height: 100%; padding: 6px 8px; box-sizing: border-box; justify-content: space-between;">
              <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; min-height: 18px;">
                <span style="font-size: 10px; font-weight: 700; color: #94a3b8; font-family: 'JetBrains Mono', monospace;">${r}, ${c}</span>
                ${badgeHtml}
              </div>
              <div style="display: flex; align-items: baseline; justify-content: center; margin: 2px 0;">
                <span style="font-size: 22px; font-weight: 900; line-height: 1; letter-spacing: -0.5px;">${h}</span>
                <span style="font-size: 12px; font-weight: 700; opacity: 0.65; margin-left: 2px;">m</span>
              </div>
              <div style="display: flex; justify-content: center;">
                <span style="font-size: 10px; font-weight: 800; font-family: 'JetBrains Mono', monospace; padding: 2px 7px; border-radius: 5px; background: ${diffBadgeBg}; color: ${diffBadgeColor}; white-space: nowrap; line-height: 1.2;">
                  落差: ${d === Infinity ? '∞' : d}
                </span>
              </div>
            </div>
          `,
          bg,
          border,
          color,
          boxShadow: isCur ? '0 0 0 4px rgba(245, 158, 11, 0.4), 0 6px 16px rgba(245, 158, 11, 0.25)' : isPath ? '0 0 0 3px rgba(16, 185, 129, 0.35)' : '0 1px 3px rgba(0, 0, 0, 0.04)',
          transform: isCur ? 'scale(1.06)' : 'none',
          zIndex: isCur ? 25 : isPath ? 15 : 2,
          title: `${isStart ? '🚩 起点 ' : ''}${isTarget ? '🏁 终点 ' : ''}(${r},${c}) 海拔高度: ${h}m · 最小落差瓶颈: ${d === Infinity ? '∞' : d}`,
        };
      },
    });
  }

  static renderCustomMetrics(container: HTMLElement, step: EffortStep): void {
    if (!container || !step.treeRoot) return;
    container.style.height = '100%';
    container.style.minHeight = '180px';
    container.style.overflow = 'hidden';
    RecursionTreeAdapter.renderRecursionTree(container, step.treeRoot, step.activeNodeId);
  }
}

export function renderPathMinEffortCanvas(container: HTMLElement, step: EffortStep): void {
  PathMinEffortCanvasAdapter.render(container, step);
}

export function renderPathMinEffortCustomMetrics(container: HTMLElement, step: EffortStep): void {
  PathMinEffortCanvasAdapter.renderCustomMetrics(container, step);
}
