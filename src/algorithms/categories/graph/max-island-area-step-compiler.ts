/**
 * 岛屿的最大面积 (LC 695) 步骤推演编译器 (Step Compiler)
 */

import { CellState } from './islands-step-compiler';
import { snapshotGrid2D } from '../../../core/strategies/grid-snapshot';
import { HighlightTarget } from '../../../core/code-panel';

export const MAX_ISLAND_AREA_CODE_LINES: Record<string, Record<string, number | number[]>> = {
  init: { java: 3, cpp: 4, python: 8, javascript: 2 },
  scan: { java: [4, 5], cpp: [5, 6], python: [9, 10], javascript: [9, 10] },
  found: { java: [6, 7], cpp: [7, 8], python: [11, 12], javascript: [11, 12] },
  mark: { java: [14, 15], cpp: [15, 16], python: [4, 6], javascript: [5, 6] },
  updatemax: { java: 7, cpp: 8, python: 12, javascript: 12 },
  done: { java: 11, cpp: 12, python: 13, javascript: 16 },
};

const lines = MAX_ISLAND_AREA_CODE_LINES;

export interface MIAStep {
  grid: number[][];
  states: CellState[][];
  current: [number, number] | null;
  scan: [number, number] | null;
  currentArea: number;
  maxArea: number;
  action: 'init' | 'scan' | 'found' | 'mark' | 'accumulate' | 'update-max' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string>;
}

export function buildMIASteps(grid: number[][]): MIAStep[] {
  const steps: MIAStep[] = [];
  const m = grid.length;
  if (m === 0) return steps;
  const n = grid[0].length;
  const states: CellState[][] = grid.map((row) => row.map((v) => (v === 1 ? 'land' : 'water')));
  let maxArea = 0;
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  const snapshot = (extra: Partial<MIAStep>): void => {
    steps.push({
      grid,
      states: snapshotGrid2D(states),
      current: extra.current ?? null,
      scan: extra.scan ?? null,
      currentArea: extra.currentArea ?? 0,
      maxArea,
      action: extra.action ?? 'scan',
      message: extra.message ?? '',
      log: extra.log ?? '',
      codeLine: extra.codeLine ?? lines.init,
    });
  };

  snapshot({
    action: 'init',
    message: `初始化 ${m}×${n} 二进制矩阵。准备扫描统计最大岛屿面积。`,
    log: `初始化矩阵 ${m}x${n}`,
    codeLine: lines.init,
  });

  const dfs = (r: number, c: number, runningAreaRef: { val: number }): number => {
    if (r < 0 || r >= m || c < 0 || c >= n || states[r][c] !== 'land') {
      return 0;
    }

    states[r][c] = 'visited';
    runningAreaRef.val++;
    let myArea = 1;

    snapshot({
      current: [r, c],
      scan: [r, c],
      currentArea: runningAreaRef.val,
      action: 'mark',
      message: `访问并沉没陆地 (${r}, ${c})，当前岛屿面积累加至 ${runningAreaRef.val}。`,
      log: `  沉没陆地 (${r}, ${c}) -> 面积=${runningAreaRef.val}`,
      codeLine: lines.mark,
    });

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < m && nc >= 0 && nc < n && states[nr][nc] === 'land') {
        myArea += dfs(nr, nc, runningAreaRef);
      }
    }

    return myArea;
  };

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (states[r][c] === 'land') {
        const areaRef = { val: 0 };
        snapshot({
          scan: [r, c],
          current: [r, c],
          currentArea: 0,
          action: 'found',
          message: `🎯 在 (${r}, ${c}) 发现新岛屿！启动 DFS 递归计算该连通块面积。`,
          log: `发现新岛屿起点 (${r}, ${c})`,
          codeLine: lines.found,
        });

        const thisArea = dfs(r, c, areaRef);
        const prevMax = maxArea;
        maxArea = Math.max(maxArea, thisArea);

        snapshot({
          scan: [r, c],
          current: [r, c],
          currentArea: thisArea,
          action: 'update-max',
          message: `岛屿面积计算完毕：${thisArea}。更新全局最大面积 max(${prevMax}, ${thisArea}) = ${maxArea}。`,
          log: `本岛面积=${thisArea}, maxArea=${maxArea}`,
          codeLine: lines.updatemax,
        });
      } else {
        snapshot({
          scan: [r, c],
          current: null,
          currentArea: 0,
          action: 'scan',
          message: `扫描格 (${r}, ${c})：${states[r][c] === 'water' ? '水域 (0)' : '已统计陆地'}，跳过。`,
          log: `扫描 (${r}, ${c}): 跳过`,
          codeLine: lines.scan,
        });
      }
    }
  }

  snapshot({
    action: 'done',
    current: null,
    scan: null,
    currentArea: 0,
    message: `🎉 全网格扫描探索完成！最大岛屿面积为 ${maxArea}。`,
    log: `✓ 统计完成: maxArea = ${maxArea}`,
    codeLine: lines.done,
  });

  return steps;
}

export function withMIAMetrics(steps: MIAStep[]): any[] {
  return steps.map((s) => ({
    ...s,
    metrics: {
      'metric-scan': s.scan ? `(${s.scan[0]}, ${s.scan[1]})` : '—',
      'metric-curr': s.current ? `(${s.current[0]}, ${s.current[1]})` : '—',
      'metric-cur-area': `${s.currentArea}`,
      'metric-max-area': `${s.maxArea}`,
      action:
        s.action === 'update-max'
          ? `maxArea = Math.max(maxArea, ${s.currentArea}) -> ${s.maxArea}`
          : s.action === 'mark'
          ? `grid[${s.current?.[0]}][${s.current?.[1]}] = 0 (area=${s.currentArea})`
          : s.action === 'done'
          ? `探索完毕: maxArea = ${s.maxArea}`
          : 'area = 1 + dfs(上) + dfs(下) + dfs(左) + dfs(右)',
    },
  }));
}
