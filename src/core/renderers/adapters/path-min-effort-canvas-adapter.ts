/**
 * 最小体力消耗路径 (Path With Minimum Effort) 画布适配器
 * 核心原语：2D 二维网格标准适配器、Dijkstra 探险家动效、终点旗帜、动态搜索推演树
 * 严格遵循深模块规范 (Deep Module, LOC < 120) 与表现层标准
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
    const isDone = status === 'done';

    BinaryGridCanvasAdapter.renderGridCanvas(container, {
      rows,
      cols,
      variant: 'adventurer',
      showCoords: true,
      adventurer: {
        r: curR,
        c: curC,
        state: isDone ? 'cheering' : 'walking',
        isFinish: isDone,
      },
      targetPos: [rows - 1, cols - 1],
      getCell: (r, c) => {
        const isCur = r === curR && c === curC;
        const isPath = pathSet.has(`${r},${c}`);
        const isTarget = r === rows - 1 && c === cols - 1;
        const isStart = r === 0 && c === 0;
        const h = grid[r][c];
        const d = dist[r][c];
        const isVis = visited[r][c];
        const diffText = d === Infinity ? '∞' : String(d);

        let bg = '#ffffff';
        let border = '1.5px solid #e2e8f0';
        let color = '#334155';

        if (isDone && isPath) {
          bg = '#ecfdf5';
          border = '2px solid #10b981';
          color = '#065f46';
        } else if (isCur) {
          bg = '#fef3c7';
          border = '2px solid #f59e0b';
          color = '#92400e';
        } else if (isVis) {
          bg = '#f1f5f9';
          border = '1.5px solid #cbd5e1';
          color = '#475569';
        }

        const roleBadge = isStart ? '起点' : isTarget ? '终点' : isCur ? '探索' : (isPath && isDone) ? '最优' : '';
        const roleHtml = roleBadge ? `<span style="font-size: 9px; font-weight: 700; opacity: 0.8; margin-bottom: 1px;">[${roleBadge}]</span>` : '';
        const diffHtml = `<span style="font-size: 10px; font-weight: 700; opacity: 0.85;">落差: ${diffText}</span>`;

        return {
          text: `${h}m`,
          extraHtml: `<div style="display: flex; flex-direction: column; align-items: center; justify-content: center; line-height: 1.1;">${roleHtml}${diffHtml}</div>`,
          bg,
          border,
          color,
          boxShadow: isCur ? '0 0 0 3px rgba(245, 158, 11, 0.35)' : (isPath && isDone) ? '0 0 0 2px rgba(16, 185, 129, 0.3)' : 'none',
          transform: isCur ? 'scale(1.06)' : 'none',
          zIndex: isCur ? 20 : isPath ? 10 : 1,
          title: `${isStart ? '🚩 起点 ' : ''}${isTarget ? '🏁 终点 ' : ''}${isCur ? '🔍 探索 ' : ''}${isPath && isDone ? '✨ 最优 ' : ''}(${r},${c}) 高度: ${h}m · 落差: ${diffText}`,
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
