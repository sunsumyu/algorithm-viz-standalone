/**
 * 左程云算法通关课 Class 064: 最小体力消耗路径 (Path With Minimum Effort · LeetCode 1631) - 步进推演编译器
 */

import { snapshotGrid2D } from '../../../../core/strategies/grid-snapshot';
import { PATH_MIN_EFFORT_064_LINES } from './graph-064-stage-codes';
import { Graph064StepBase } from './graph-064-shared';

export interface PathMinEffortStep extends Graph064StepBase {
  grid: number[][];
  curCoord: [number, number] | null;
  distGrid: number[][];
  visited: boolean[][];
  pqSnapshot: Array<{ r: number; c: number; effort: number }>;
  pathNodes: Array<[number, number]>;
}

export function buildPathMinEffort064Steps(preset: string = 'classic_mountain_3x3'): PathMinEffortStep[] {
  const steps: PathMinEffortStep[] = [];
  const lines = PATH_MIN_EFFORT_064_LINES;

  let grid: number[][];
  if (preset === 'valley_3x3') {
    grid = [
      [1, 3, 5],
      [2, 8, 4],
      [1, 1, 2],
    ];
  } else if (preset === 'flat_2x2') {
    grid = [
      [1, 1],
      [1, 1],
    ];
  } else {
    grid = [
      [1, 2, 2],
      [3, 8, 2],
      [5, 3, 4],
    ];
  }

  const m = grid.length;
  const n = grid[0].length;

  const dist = Array.from({ length: m }, () => new Array(n).fill(Infinity));
  const visited = Array.from({ length: m }, () => new Array(n).fill(false));
  const parent: Record<string, [number, number]> = {};

  dist[0][0] = 0;
  const pq: Array<{ r: number; c: number; effort: number }> = [{ r: 0, c: 0, effort: 0 }];

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
    curCoord: null,
    distGrid: snapshotGrid2D(dist),
    visited: snapshotGrid2D(visited),
    pqSnapshot: [...pq],
    pathNodes: [[0, 0]],
    decision: `1. 初始化网格瓶颈距离矩阵：起点 (0, 0) 瓶颈 effort = 0，其余单元格置为 ∞`,
    message: `准备利用小根堆探索从左上角到右下角的最小高度落差极大值。`,
    log: `Init dist[0][0]=0, dims=${m}x${n}`,
    line: lines.initDist.javascript,
    codeLine: lines.initDist,
    metrics: { '网格尺寸': `${m}x${n}`, '起点': '(0,0)', '目标': `(${m-1},${n-1})` },
    statusBadge: { text: '初始化起点', type: 'info' },
  });

  const dirs = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];

  while (pq.length > 0) {
    pq.sort((a, b) => a.effort - b.effort);
    const { r, c, effort: d } = pq.shift()!;

    if (visited[r][c]) continue;
    visited[r][c] = true;

    const currentPath = reconstructPath(r, c);

    if (r === m - 1 && c === n - 1) {
      steps.push({
        grid,
        curCoord: [r, c],
        distGrid: snapshotGrid2D(dist),
        visited: snapshotGrid2D(visited),
        pqSnapshot: [...pq],
        pathNodes: currentPath,
        decision: `到达右下角终点 (${r}, ${c})！堆顶弹出确认全局最优解：最小体力消耗为 ${d}`,
        message: `根据 Dijkstra 贪心性质，首次从堆顶弹出的终点状态即为全局瓶颈最短路。`,
        log: `Hit target (${r}, ${c}) with effort ${d}`,
        line: lines.checkTarget.javascript,
        codeLine: lines.checkTarget,
        metrics: { '最终体力消耗': d, '最优路径长度': currentPath.length },
        statusBadge: { text: `达成终点: 体力=${d}`, type: 'success' },
      });
      break;
    }

    steps.push({
      grid,
      curCoord: [r, c],
      distGrid: snapshotGrid2D(dist),
      visited: snapshotGrid2D(visited),
      pqSnapshot: [...pq],
      pathNodes: currentPath,
      decision: `弹出当前瓶颈最小单元格 (${r}, ${c}) [高度=${grid[r][c]}, 当前瓶颈=${d}]，向 4 向邻居探查`,
      message: `以此格为基准，尝试松弛未探索或可进一步缩小高度差的邻居。`,
      log: `Poll cell (${r}, ${c}) effort=${d}`,
      line: lines.pollCell.javascript,
      codeLine: lines.pollCell,
      metrics: { '当前位置': `(${r},${c})`, '当前高度': grid[r][c], '当前累计瓶颈': d },
      statusBadge: { text: `探查: (${r},${c})`, type: 'info' },
    });

    for (const [dr, dc] of dirs) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr >= 0 && nr < m && nc >= 0 && nc < n) {
        const diff = Math.abs(grid[r][c] - grid[nr][nc]);
        const nextEffort = Math.max(d, diff);

        if (nextEffort < dist[nr][nc]) {
          dist[nr][nc] = nextEffort;
          parent[`${nr},${nc}`] = [r, c];
          pq.push({ r: nr, c: nc, effort: nextEffort });

          steps.push({
            grid,
            curCoord: [r, c],
            distGrid: snapshotGrid2D(dist),
            visited: snapshotGrid2D(visited),
            pqSnapshot: [...pq],
            pathNodes: reconstructPath(r, c),
            decision: `向相邻格 (${nr}, ${nc}) [高度=${grid[nr][nc]}] 松弛：落差 |${grid[r][c]} - ${grid[nr][nc]}| = ${diff}，新瓶颈 max(${d}, ${diff}) = ${nextEffort}`,
            message: `松弛成功：dist[${nr}][${nc}] 更新为更优值 ${nextEffort} 并推入优先队列。`,
            log: `Relax (${r},${c}) -> (${nr},${nc}) diff=${diff} newEffort=${nextEffort}`,
            line: lines.relaxGrid.javascript,
            codeLine: lines.relaxGrid,
            metrics: { '落差高度': diff, '松弛新瓶颈': nextEffort, '目标邻居': `(${nr},${nc})` },
            statusBadge: { text: `松弛: (${nr},${nc})`, type: 'info' },
          });
        }
      }
    }
  }

  return steps;
}
