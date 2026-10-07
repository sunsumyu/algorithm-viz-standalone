/**
 * 孤岛总面积 (Total Island Area) 步骤推演编译器 (Step Compiler)
 */

import { snapshotGrid2D } from '../../../core/strategies/grid-snapshot';

const lines: Record<string, number | number[]> = {
  init: [1, 2, 3],
  found: [7, 8, 9],
  explore: [17, 18, 19, 20],
  islanddone: 8,
  done: 12,
};

export type TotalIslandCellState = 'water' | 'land' | 'visited' | 'explored';

export interface TotalIslandAreaStep {
  grid: number[][];
  states: TotalIslandCellState[][];
  rows: number;
  cols: number;
  currentCell: [number, number] | null;
  currentArea: number;
  totalArea: number;
  islandCount: number;
  action: 'init' | 'scan' | 'found' | 'explore' | 'island-done' | 'done';
  statusText: string;
  message?: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export const DEFAULT_GRID = [
  [1, 1, 0, 0, 0],
  [1, 1, 0, 0, 0],
  [0, 0, 1, 0, 0],
  [0, 0, 0, 1, 1],
];

const DIRS: [number, number][] = [
  [0, 1],
  [1, 0],
  [0, -1],
  [-1, 0],
];

export function buildTotalIslandAreaSteps(grid: number[][] = DEFAULT_GRID): TotalIslandAreaStep[] {
  const steps: TotalIslandAreaStep[] = [];
  const R = grid.length;
  const C = grid[0].length;
  const states: TotalIslandCellState[][] = grid.map((row) =>
    row.map((v) => (v === 1 ? 'land' : 'water'))
  );

  let totalArea = 0;
  let islandCount = 0;
  let currentArea = 0;

  steps.push({
    grid: snapshotGrid2D(grid),
    states: snapshotGrid2D(states),
    rows: R,
    cols: C,
    currentCell: null,
    currentArea: 0,
    totalArea: 0,
    islandCount: 0,
    action: 'init',
    statusText: `初始化 ${R}×${C} 网格地图，开始遍历寻找所有连通岛屿并计算总面积。`,
    log: `初始化: ${R}×${C} 网格`,
    codeLine: lines.init,
  });

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (states[r][c] === 'land') {
        islandCount++;
        currentArea = 1;
        states[r][c] = 'visited';

        steps.push({
          grid: snapshotGrid2D(grid),
          states: snapshotGrid2D(states),
          rows: R,
          cols: C,
          currentCell: [r, c],
          currentArea,
          totalArea,
          islandCount,
          action: 'found',
          statusText: `扫描到 (${r}, ${c}) 为陆地！发现第 ${islandCount} 座岛屿，启动 DFS 探索连通面积。`,
          log: `发现岛屿 #${islandCount} 于 (${r}, ${c})`,
          codeLine: lines.found,
        });

        const queue: [number, number][] = [[r, c]];
        while (queue.length > 0) {
          const [cr, cc] = queue.shift()!;
          for (const [dr, dc] of DIRS) {
            const nr = cr + dr;
            const nc = cc + dc;
            if (nr >= 0 && nr < R && nc >= 0 && nc < C && states[nr][nc] === 'land') {
              states[nr][nc] = 'visited';
              currentArea++;
              queue.push([nr, nc]);

              steps.push({
                grid: snapshotGrid2D(grid),
                states: snapshotGrid2D(states),
                rows: R,
                cols: C,
                currentCell: [nr, nc],
                currentArea,
                totalArea,
                islandCount,
                action: 'explore',
                statusText: `DFS 扩展至 (${nr}, ${nc})，当前岛屿面积增长为 ${currentArea}。`,
                log: `扩展陆地 (${nr}, ${nc}) -> 当前岛屿面积 = ${currentArea}`,
                codeLine: lines.explore,
              });
            }
          }
        }

        totalArea += currentArea;
        for (let a = 0; a < R; a++) {
          for (let b = 0; b < C; b++) {
            if (states[a][b] === 'visited') states[a][b] = 'explored';
          }
        }

        steps.push({
          grid: snapshotGrid2D(grid),
          states: snapshotGrid2D(states),
          rows: R,
          cols: C,
          currentCell: null,
          currentArea,
          totalArea,
          islandCount,
          action: 'island-done',
          statusText: `岛屿 #${islandCount} 探索完成，面积为 ${currentArea} 格。累计总面积更新为 ${totalArea}。`,
          log: `✓ 岛屿 #${islandCount} 结算: 面积 = ${currentArea}，累计总面积 = ${totalArea}`,
          codeLine: lines.islanddone,
        });
      }
    }
  }

  steps.push({
    grid: snapshotGrid2D(grid),
    states: snapshotGrid2D(states),
    rows: R,
    cols: C,
    currentCell: null,
    currentArea: 0,
    totalArea,
    islandCount,
    action: 'done',
    statusText: `🎉 孤岛总面积统计完成！共发现 ${islandCount} 座独立岛屿，总面积为 ${totalArea} 格。`,
    log: `✓ 统计完成: 岛屿总数 = ${islandCount}，总面积 = ${totalArea}`,
    codeLine: lines.done,
  });

  return steps;
}

export function withTotalIslandMetrics(steps: TotalIslandAreaStep[]): any[] {
  return steps.map((s) => ({
    ...s,
    message: s.statusText,
    metrics: {
      'metric-cur-cell': s.currentCell ? `(${s.currentCell[0]}, ${s.currentCell[1]})` : '—',
      'metric-cur-area': `${s.currentArea}`,
      'metric-island-count': `${s.islandCount}`,
      'metric-total-area': `${s.totalArea}`,
      action:
        s.action === 'explore'
          ? `DFS: (${s.currentCell ? s.currentCell.join(',') : ''}) -> currArea = ${s.currentArea}`
          : s.action === 'island-done'
          ? `岛屿结算: totalArea += ${s.currentArea} -> 总面积 = ${s.totalArea}`
          : 'totalArea = sum(islandAreas)',
    },
  }));
}
