/**
 * 最小体力消耗路径 (Path With Minimum Effort) 画布适配器
 * 核心原语：统一接入动规标准二维网格适配器 (GridVisualAdapter)、Dijkstra 探险家动效、动态推演树
 * 严格遵循深模块规范 (Deep Module, LOC < 120) 与表现层契约
 */

import { GridVisualAdapter } from '../grid-visual-adapter';
import { RecursionTreeAdapter } from '../recursion-tree-adapter';
import type { EffortStep } from '../../../algorithms/categories/graph/path-min-effort-step-compiler';

export class PathMinEffortCanvasAdapter {
  static render(container: HTMLElement, step: EffortStep): void {
    const { grid, dist, curR, curC, pathNodes, status } = step;
    const rows = grid.length;
    const cols = grid[0].length;
    const isDone = status === 'done';
    const pathSet = new Set(pathNodes.map(([r, c]) => `${r},${c}`));
    const curEffort = dist[curR]?.[curC];
    const diffText = curEffort !== undefined && curEffort !== Infinity ? String(curEffort) : (isDone ? '2' : '0');

    // 格式化单元格呈现：海拔高度 (m) 与瓶颈体力标注
    const formattedGrid = grid.map((row, r) =>
      row.map((h, c) => {
        const d = dist[r]?.[c];
        const effStr = d !== undefined && d !== Infinity ? `<span class="text-[10px] font-normal text-slate-400 block -mt-0.5">t:${d}</span>` : '';
        return `<span>${h}m</span>${effStr}`;
      })
    );

    // 标准动规体系二维网格居中沙盘布局
    container.innerHTML = `
      <div id="grid-stage-wrapper" class="flex-1 flex flex-col items-center justify-center w-full h-full p-2 relative" style="display: flex; flex-direction: column; align-items: center; justify-content: center; width: 100%; height: 100%;">
        <div id="grid-board-wrapper" class="relative" style="position: relative;">
          <div id="grid-container"></div>
        </div>
        <div id="grid-status-badge" class="mt-3 px-3 py-1 rounded-lg bg-white border border-slate-200 shadow-2xs text-xs text-slate-700 flex items-center gap-2">
          <span class="font-bold ${isDone ? 'text-emerald-600' : 'text-amber-600'}">${isDone ? '✨ 最优路径已锁定' : '🔍 Dijkstra 探索波前'}</span>
          <span class="text-slate-300">|</span>
          <span class="font-mono text-slate-600 font-bold">落差: ${diffText}</span>
          <span class="text-slate-300">|</span>
          <span class="text-[11px] text-slate-500 font-mono">起点 (0,0) ➔ 终点 (${rows - 1},${cols - 1})</span>
        </div>
      </div>
    `;

    const gridContainer = container.querySelector('#grid-container') as HTMLElement;
    if (!gridContainer) return;

    GridVisualAdapter.renderGrid(gridContainer, {
      ...step,
      i: curR,
      j: curC,
      grid: formattedGrid,
      activeTrail: isDone ? pathNodes.map(([r, c]) => `${r},${c}`) : [],
    }, {
      m: rows,
      n: cols,
      isGridProblem: true,
      modelId: 'path-min-effort',
      isMatch: (r, c) => isDone && pathSet.has(`${r},${c}`),
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
