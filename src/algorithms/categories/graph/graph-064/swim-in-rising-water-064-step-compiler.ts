/**
 * 左程云算法通关课 Class 064: 水位上升的泳池中游泳 (Swim In Rising Water · LeetCode 778) - 步进推演编译器
 */

import { snapshotGrid2D } from '../../../../core/strategies/grid-snapshot';
import { SWIM_IN_WATER_064_LINES } from './graph-064-stage-codes';
import { Graph064StepBase } from './graph-064-shared';

export interface SwimStep extends Graph064StepBase {
  grid: number[][];
  curCoord: [number, number] | null;
  curWaterLevel: number;
  distGrid: number[][];
  visitedGrid: boolean[][];
  pqSnapshot: Array<{ r: number; c: number; t: number }>;
  bestPath?: Array<[number, number]>;
}

export const PRESET_GRIDS_064: Record<string, number[][]> = {
  leetcode5: [
    [0, 2, 1, 3, 4],
    [10, 11, 14, 12, 5],
    [23, 22, 21, 15, 16],
    [18, 17, 19, 20, 24],
    [9, 8, 7, 6, 13],
  ],
  simple3: [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
  ],
  cliff4: [
    [0, 3, 2, 1],
    [12, 13, 14, 4],
    [11, 15, 10, 5],
    [9, 8, 7, 6],
  ],
};

export function buildSwimInRisingWater064Steps(gridType: string = 'leetcode5'): SwimStep[] {
  const grid = PRESET_GRIDS_064[gridType] || PRESET_GRIDS_064.leetcode5;
  const n = grid.length;
  const steps: SwimStep[] = [];
  const lines = SWIM_IN_WATER_064_LINES;

  const dist = Array.from({ length: n }, () => new Array(n).fill(Infinity));
  const visited = Array.from({ length: n }, () => new Array(n).fill(false));
  const parent: Record<string, [number, number]> = {};

  dist[0][0] = grid[0][0];
  const pq: Array<{ r: number; c: number; t: number }> = [{ r: 0, c: 0, t: grid[0][0] }];

  const reconstructPath = (endR: number, endC: number): Array<[number, number]> => {
    const res: Array<[number, number]> = [];
    let curKey: string | null = `${endR},${endC}`;
    while (curKey) {
      const [r, c] = curKey.split(',').map(Number);
      res.push([r, c]);
      const p: [number, number] | undefined = parent[curKey];
      curKey = p ? `${p[0]},${p[1]}` : null;
    }
    return res.reverse();
  };

  steps.push({
    grid,
    curCoord: [0, 0],
    curWaterLevel: grid[0][0],
    distGrid: snapshotGrid2D(dist),
    visitedGrid: snapshotGrid2D(visited),
    pqSnapshot: [...pq],
    bestPath: [[0, 0]],
    decision: `1. 初始化泳池水位与优先队列：起点 (0, 0) 初始蓄水高度为 grid[0][0] = ${grid[0][0]}，入堆`,
    message: `雨水开始积蓄，需等待水位上升至至少能容纳当前单元格深度。`,
    log: `Init dist[0][0]=${grid[0][0]}`,
    line: lines.init.javascript,
    codeLine: lines.init,
    metrics: { '初始水位': grid[0][0], '网格尺寸': `${n}x${n}`, '终点坐标': `(${n-1},${n-1})` },
    statusBadge: { text: `起点水位: ${grid[0][0]}`, type: 'info' },
  });

  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  while (pq.length > 0) {
    pq.sort((a, b) => a.t - b.t);
    const { r, c, t } = pq.shift()!;

    if (visited[r][c]) continue;
    visited[r][c] = true;

    const curPath = reconstructPath(r, c);

    if (r === n - 1 && c === n - 1) {
      steps.push({
        grid,
        curCoord: [r, c],
        curWaterLevel: t,
        distGrid: snapshotGrid2D(dist),
        visitedGrid: snapshotGrid2D(visited),
        pqSnapshot: [...pq],
        bestPath: curPath,
        decision: `到达右下角泳池终点 (${r}, ${c})！堆顶首次弹出确认全局最优最少时间 t = ${t}`,
        message: `根据小根堆波前单调性，此时水位 ${t} 已经开辟了一条从起点到终点的畅通水路！`,
        log: `Hit pool end (${r}, ${c}) at waterLevel=${t}`,
        line: lines.hitTarget.javascript,
        codeLine: lines.hitTarget,
        metrics: { '最终最少用时': t, '畅通泳道长度': curPath.length },
        statusBadge: { text: `到达终点: t=${t}`, type: 'success' },
      });
      break;
    }

    steps.push({
      grid,
      curCoord: [r, c],
      curWaterLevel: t,
      distGrid: snapshotGrid2D(dist),
      visitedGrid: snapshotGrid2D(visited),
      pqSnapshot: [...pq],
      bestPath: curPath,
      decision: `堆顶定向淹没至单元格 (${r}, ${c}) [原深度=${grid[r][c]}, 当前水位=${t}]，探查 4 向水流渗透`,
      message: `优先向当前能接触到的最浅处水洼延伸，模拟流体浸润过程。`,
      log: `Poll water cell (${r}, ${c}) t=${t}`,
      line: lines.pollCell.javascript,
      codeLine: lines.pollCell,
      metrics: { '淹没坐标': `(${r},${c})`, '当前水深': grid[r][c], '有效水位': t },
      statusBadge: { text: `渗透: (${r},${c})`, type: 'info' },
    });

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < n && nc >= 0 && nc < n) {
        const nextT = Math.max(t, grid[nr][nc]);
        if (nextT < dist[nr][nc]) {
          dist[nr][nc] = nextT;
          parent[`${nr},${nc}`] = [r, c];
          pq.push({ r: nr, c: nc, t: nextT });

          steps.push({
            grid,
            curCoord: [r, c],
            curWaterLevel: t,
            distGrid: snapshotGrid2D(dist),
            visitedGrid: snapshotGrid2D(visited),
            pqSnapshot: [...pq],
            bestPath: reconstructPath(r, c),
            decision: `水流向相邻格 (${nr}, ${nc}) [高程=${grid[nr][nc]}] 渗透：新到达时刻 max(${t}, ${grid[nr][nc]}) = ${nextT}`,
            message: `松弛成功：dist[${nr}][${nc}] 更新为 ${nextT} 并推入水位小根堆。`,
            log: `Relax water (${r},${c}) -> (${nr},${nc}) newT=${nextT}`,
            line: lines.relaxCell.javascript,
            codeLine: lines.relaxCell,
            metrics: { '渗透格高度': grid[nr][nc], '所需水位': nextT, '目标坐标': `(${nr},${nc})` },
            statusBadge: { text: `漫延: (${nr},${nc})`, type: 'info' },
          });
        }
      }
    }
  }

  return steps;
}
