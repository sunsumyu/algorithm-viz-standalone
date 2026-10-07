/**
 * 沉没孤岛 (LC 130) 步骤推演编译器 (Step Compiler)
 */

import { snapshotGrid2D } from '../../../core/strategies/grid-snapshot';

const lines: Record<string, number | number[]> = {
  init: [1, 2, 3],
  borderprotect: [19, 20, 21, 22],
  sink: 13,
  restore: 14,
  done: 17,
};

export interface SinkStep {
  grid: number[][]; // 0: water/sunk, 1: land, 2: protected
  rows: number;
  cols: number;
  currentCell: [number, number] | null;
  stage: string;
  protectedCount: number;
  sunkCount: number;
  action: 'init' | 'border-protect' | 'sink' | 'restore' | 'done';
  statusText: string;
  message?: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string>;
}

export const DEFAULT_SINK_GRID = [
  [1, 1, 1, 1, 1],
  [1, 0, 1, 0, 1],
  [1, 1, 1, 0, 1],
  [0, 1, 0, 1, 0],
  [1, 1, 1, 1, 1],
];

const DIRS = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
];

export function buildSinkSteps(initialGrid: number[][] = DEFAULT_SINK_GRID): SinkStep[] {
  const steps: SinkStep[] = [];
  const R = initialGrid.length;
  const C = initialGrid[0].length;
  const grid = snapshotGrid2D(initialGrid);

  let protectedCount = 0;
  let sunkCount = 0;

  steps.push({
    grid: snapshotGrid2D(grid),
    rows: R,
    cols: C,
    currentCell: null,
    stage: '准备开始',
    protectedCount,
    sunkCount,
    action: 'init',
    statusText: `初始化 ${R}×${C} 网格。第一阶段：将从四周边缘出发将连通陆地标记为受保护 (2)。`,
    log: `初始化: ${R}×${C} 网格地图`,
    codeLine: lines.init,
  });

  const dfsProtect = (r: number, c: number) => {
    if (r < 0 || r >= R || c < 0 || c >= C || grid[r][c] !== 1) return;
    grid[r][c] = 2;
    protectedCount++;

    steps.push({
      grid: snapshotGrid2D(grid),
      rows: R,
      cols: C,
      currentCell: [r, c],
      stage: '边缘连通保护',
      protectedCount,
      sunkCount,
      action: 'border-protect',
      statusText: `边缘保护 DFS 访问 (${r}, ${c})，标记为受保护陆地 (2)。当前受保护陆地: ${protectedCount} 格。`,
      log: `保护边沿陆地: (${r}, ${c}) -> 受保护 (2)`,
      codeLine: lines.borderprotect,
    });

    for (const [dr, dc] of DIRS) {
      dfsProtect(r + dr, c + dc);
    }
  };

  for (let r = 0; r < R; r++) {
    if (grid[r][0] === 1) dfsProtect(r, 0);
    if (grid[r][C - 1] === 1) dfsProtect(r, C - 1);
  }

  for (let c = 0; c < C; c++) {
    if (grid[0][c] === 1) dfsProtect(0, c);
    if (grid[R - 1][c] === 1) dfsProtect(R - 1, c);
  }

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === 1) {
        grid[r][c] = 0;
        sunkCount++;
        steps.push({
          grid: snapshotGrid2D(grid),
          rows: R,
          cols: C,
          currentCell: [r, c],
          stage: '淹没真正孤岛',
          protectedCount,
          sunkCount,
          action: 'sink',
          statusText: `检测到孤立陆地 (${r}, ${c}) 未与边缘相连，将其淹没为水域 (0)。已淹没孤岛: ${sunkCount} 格。`,
          log: `淹没孤岛: (${r}, ${c}) 1 -> 0`,
          codeLine: lines.sink,
        });
      } else if (grid[r][c] === 2) {
        grid[r][c] = 1;
        steps.push({
          grid: snapshotGrid2D(grid),
          rows: R,
          cols: C,
          currentCell: [r, c],
          stage: '还原保护区',
          protectedCount,
          sunkCount,
          action: 'restore',
          statusText: `将受保护陆地 (${r}, ${c}) 还原为正常陆地 (1)。`,
          log: `还原陆地: (${r}, ${c}) 2 -> 1`,
          codeLine: lines.restore,
        });
      }
    }
  }

  steps.push({
    grid: snapshotGrid2D(grid),
    rows: R,
    cols: C,
    currentCell: null,
    stage: '处理完成',
    protectedCount,
    sunkCount,
    action: 'done',
    statusText: `🎉 沉没孤岛计算完成！成功淹没 ${sunkCount} 格被包围的孤立陆地。`,
    log: `✓ 处理完成: 共淹没 ${sunkCount} 格孤岛`,
    codeLine: lines.done,
  });

  return steps;
}

export function withSinkMetrics(steps: SinkStep[]): any[] {
  return steps.map((s) => ({
    ...s,
    message: s.statusText,
    metrics: {
      'metric-cur-cell': s.currentCell ? `(${s.currentCell[0]}, ${s.currentCell[1]})` : '—',
      'metric-stage': s.stage,
      'metric-protected-count': `${s.protectedCount}`,
      'metric-sunk-count': `${s.sunkCount}`,
      action:
        s.action === 'border-protect'
          ? `DFS: (${s.currentCell ? s.currentCell.join(',') : ''}) 标记为 2 (受保护)`
          : s.action === 'sink'
          ? `孤岛判定: (${s.currentCell ? s.currentCell.join(',') : ''}) 1 -> 0 (淹没)`
          : s.action === 'restore'
          ? `还原: (${s.currentCell ? s.currentCell.join(',') : ''}) 2 -> 1 (保护区保留)`
          : '1. 边缘连通 DFS (1->2) 2. 内部孤岛沉没 (1->0) 与还原 (2->1)',
    },
  }));
}
