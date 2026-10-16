/**
 * 最小体力消耗路径 (Path With Minimum Effort) 画布适配器
 * 核心原语：二维网格探险家模式 (BinaryGridCanvasAdapter + GridVisualAdapter 探险家体系)、Dijkstra 搜索推演树
 * 严格遵循深模块规范 (Deep Module, LOC < 120) 与表现层契约
 */

import { BinaryGridCanvasAdapter } from './binary-grid-canvas-adapter';
import { RecursionTreeAdapter } from '../recursion-tree-adapter';
import type { EffortStep } from '../../../algorithms/categories/graph/path-min-effort-step-compiler';

export class PathMinEffortCanvasAdapter {
  static render(container: HTMLElement, step: EffortStep): void {
    const { grid, dist, visited, curR, curC, pathNodes, status } = step;
    const rows = grid.length;
    const cols = grid[0].length;
    const isDone = status === 'done';
    const isExploring = status === 'explore' || (status === 'start' && curR === 0 && curC === 0);
    const isHopping = isExploring;
    const pathSet = new Set(pathNodes.map(([r, c]) => `${r},${c}`));

    BinaryGridCanvasAdapter.renderGridCanvas(container, {
      rows,
      cols,
      variant: 'adventurer',
      showCoords: true,
      targetPos: [rows - 1, cols - 1],
      adventurer: {
        r: curR,
        c: curC,
        state: isDone ? 'cheering' : (isHopping ? 'jumping' : 'walking'),
        isFinish: isDone,
        isHopping,
      },
      getCell: (r, c) => {
        const isCur = r === curR && c === curC;
        const isPath = pathSet.has(`${r},${c}`);
        const isTarget = r === rows - 1 && c === cols - 1;
        const isStart = r === 0 && c === 0;
        const h = grid[r][c];
        const d = dist[r][c];
        const isVis = visited[r][c];
        const isProbing = Boolean(step.activeSlot && step.activeSlot[0] === r && step.activeSlot[1] === c && !isCur);

        let bg = '#ffffff';
        let border = '1.5px solid #cbd5e1';
        let color = '#1e293b';

        if (isDone && isPath) {
          bg = '#ecfdf5';
          border = '2px solid #10b981';
          color = '#065f46';
        } else if (isCur) {
          bg = '#fef3c7';
          border = '2px solid #f59e0b';
          color = '#92400e';
        } else if (isProbing) {
          bg = '#eff6ff';
          border = '2px dashed #3b82f6';
          color = '#1d4ed8';
        } else if (isVis) {
          bg = '#f8fafc';
          border = '1.5px solid #94a3b8';
          color = '#475569';
        }

        let effLabel = d !== Infinity ? `<div style="font-size: 10px; font-weight: 600; opacity: 0.75; margin-top: 2px;">落差: ${d}</div>` : '';
        if (isProbing) {
          effLabel = `<div style="font-size: 10px; font-weight: 700; color: #2563eb; margin-top: 2px;">🔍 探测中</div>`;
        }

        const boxShadow = isCur
          ? '0 0 0 3px rgba(245, 158, 11, 0.35)'
          : isProbing
            ? '0 0 0 3px rgba(59, 130, 246, 0.35)'
            : (isPath && isDone)
              ? '0 0 0 2px rgba(16, 185, 129, 0.3)'
              : 'none';
        const transform = isCur ? 'scale(1.06)' : isProbing ? 'scale(1.04)' : 'none';
        const zIndex = isCur ? 20 : isProbing ? 15 : isPath ? 10 : 1;

        return {
          text: `${h}m`,
          extraHtml: effLabel,
          bg,
          border,
          color,
          boxShadow,
          transform,
          zIndex,
          title: `${isStart ? '起点 ' : ''}${isTarget ? '终点 ' : ''}${isCur ? '探索 ' : ''}${isProbing ? '探测 ' : ''}${isPath && isDone ? '最优 ' : ''}(${r},${c}) 高度: ${h}m · 落差: ${d === Infinity ? '∞' : d}`,
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
