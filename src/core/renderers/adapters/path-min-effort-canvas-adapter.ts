/**
 * 最小体力消耗路径 (Path With Minimum Effort) 画布适配器
 * 核心原语：2D 网格高程等高线阶梯色渲染、Dijkstra 探索格聚焦、最小瓶颈落差胶囊
 * 严格遵循深模块规范 (Deep Module) 与 Card 1 纯净沙盘契约
 */

import { BinaryGridCanvasAdapter } from './binary-grid-canvas-adapter';
import type { EffortStep } from '../../../algorithms/categories/graph/path-min-effort-step-compiler';

export class PathMinEffortCanvasAdapter {
  static render(container: HTMLElement, step: EffortStep): void {
    const { grid, dist, visited, curR, curC, pathNodes, status } = step;
    const rows = grid.length;
    const cols = grid[0].length;
    const pathSet = new Set(pathNodes.map(([r, c]) => `${r},${c}`));

    // 计算当前网格海拔范围，构建高程等高线阶梯色
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

        // 地形高程热力底色
        const ratio = maxH > minH ? (h - minH) / (maxH - minH) : 0;
        let bg = '#ffffff';
        let border = '1.5px solid #e2e8f0';
        let color = '#334155';

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
        } else {
          // 根据地形等高比拟温暖渐变
          if (ratio > 0.7) {
            bg = '#fef2f2';
            border = '1.5px solid #fecaca';
            color = '#991b1b';
          } else if (ratio > 0.4) {
            bg = '#fff7ed';
            border = '1.5px solid #fed7aa';
            color = '#9a3412';
          } else {
            bg = '#f0fdf4';
            border = '1.5px solid #bbf7d0';
            color = '#166534';
          }
        }

        // 角色标记徽章
        let badgeHtml = '';
        if (isStart) {
          badgeHtml = '<span style="font-size: 9px; font-weight: 800; background: #3b82f6; color: #ffffff; padding: 1px 5px; border-radius: 4px;">起点</span>';
        } else if (isTarget) {
          badgeHtml = '<span style="font-size: 9px; font-weight: 800; background: #10b981; color: #ffffff; padding: 1px 5px; border-radius: 4px;">终点</span>';
        } else if (isCur) {
          badgeHtml = '<span style="font-size: 9px; font-weight: 800; background: #f59e0b; color: #ffffff; padding: 1px 5px; border-radius: 4px;">探索</span>';
        } else if (isPath && isDone) {
          badgeHtml = '<span style="font-size: 9px; font-weight: 800; background: #059669; color: #ffffff; padding: 1px 5px; border-radius: 4px;">最优</span>';
        } else if (isVis) {
          badgeHtml = '<span style="font-size: 9px; font-weight: 700; color: #94a3b8;">已确认</span>';
        }

        // 瓶颈体力差胶囊底色
        let diffBadgeBg = '#f1f5f9';
        let diffBadgeColor = '#64748b';
        if (d !== Infinity) {
          if (isCur) {
            diffBadgeBg = '#fef3c7';
            diffBadgeColor = '#b45309';
          } else if (isPath && isDone) {
            diffBadgeBg = '#d1fae5';
            diffBadgeColor = '#047857';
          } else if (isVis) {
            diffBadgeBg = '#e2e8f0';
            diffBadgeColor = '#334155';
          }
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
          boxShadow: isCur
            ? '0 0 0 4px rgba(245, 158, 11, 0.4), 0 6px 16px rgba(245, 158, 11, 0.25)'
            : isPath
            ? '0 0 0 3px rgba(16, 185, 129, 0.35), 0 4px 12px rgba(16, 185, 129, 0.15)'
            : '0 1px 3px rgba(0, 0, 0, 0.04)',
          transform: isCur ? 'scale(1.06)' : 'none',
          zIndex: isCur ? 25 : isPath ? 15 : 2,
          title: `${isStart ? '🚩 起点 ' : ''}${isTarget ? '🏁 终点 ' : ''}(${r},${c}) 海拔高度: ${h}m · 最小落差瓶颈: ${d === Infinity ? '∞' : d}`,
        };
      },
    });
  }
}

export function renderPathMinEffortCanvas(container: HTMLElement, step: EffortStep): void {
  PathMinEffortCanvasAdapter.render(container, step);
}
