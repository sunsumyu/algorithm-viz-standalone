/**
 * 水位上升的泳池中游泳 (Swim In Rising Water - LeetCode 778) 步进推演编译器
 * 左程云《算法通关课》Class 064 Code03
 * 核心：网格图瓶颈最短路、max(dis, grid[nx][ny]) 松弛、Dijkstra 小根堆定向淹没
 */

import { HighlightTarget } from '../../../core/code-panel';
import { snapshotGrid2D } from '../../../core/strategies/grid-snapshot';

export interface SwimStep {
  grid: number[][];
  r: number;
  c: number;
  curWaterLevel: number;
  distGrid: number[][];
  visitedGrid: boolean[][];
  pqSnapshot: Array<{ r: number; c: number; t: number }>;
  bestPath?: Array<{ r: number; c: number }>;
  status: 'init' | 'pop' | 'relax' | 'reach' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export const PRESET_GRIDS: Record<string, number[][]> = {
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

export function buildSwimInRisingWaterSteps(gridType: string = 'leetcode5'): SwimStep[] {
  const grid = PRESET_GRIDS[gridType] || PRESET_GRIDS.leetcode5;
  const n = grid.length;
  const m = grid[0].length;
  const steps: SwimStep[] = [];

  const dist: number[][] = Array.from({ length: n }, () => Array(m).fill(Infinity));
  const visited: boolean[][] = Array.from({ length: n }, () => Array(m).fill(false));
  const parent: Record<string, { r: number; c: number }> = {};

  let curR = 0;
  let curC = 0;
  let curWaterLevel = grid[0][0];
  let finalPath: Array<{ r: number; c: number }> | undefined = undefined;

  const pq: Array<{ r: number; c: number; t: number }> = [];

  const lines = {
    entry: { cpp: 15, java: 18, python: 4, javascript: 2 },
    initDist: { cpp: 17, java: 21, python: 6, javascript: 4 },
    initDistSrc: { cpp: 21, java: 27, python: 9, javascript: 9 },
    initVisited: { cpp: 18, java: 28, python: 7, javascript: 5 },
    initHeap: { cpp: 19, java: 30, python: 10, javascript: 8 },
    pushSrc: { cpp: 22, java: 31, python: 10, javascript: 8 },
    whileHeap: { cpp: 25, java: 34, python: 13, javascript: 12 },
    pollRecord: { cpp: 26, java: 35, python: 14, javascript: 14 },
    checkVisited: { cpp: 27, java: 40, python: 15, javascript: 15 },
    continueVisited: { cpp: 27, java: 41, python: 16, javascript: 15 },
    markVisited: { cpp: 28, java: 43, python: 17, javascript: 16 },
    checkTarget: { cpp: 29, java: 44, python: 18, javascript: 17 },
    returnCost: { cpp: 29, java: 45, python: 19, javascript: 17 },
    forDirs: { cpp: 31, java: 48, python: 21, javascript: 19 },
    checkValidNeighbor: { cpp: 33, java: 51, python: 23, javascript: 21 },
    calcBottleneck: { cpp: 34, java: 53, python: 24, javascript: 22 },
    checkRelax: { cpp: 35, java: 54, python: 25, javascript: 23 },
    updateDist: { cpp: 36, java: 55, python: 26, javascript: 24 },
    pushHeap: { cpp: 37, java: 56, python: 27, javascript: 25 },
    returnFail: { cpp: 42, java: 61, python: 28, javascript: 30 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'init' | 'pop' | 'relax' | 'reach' | 'done',
    r: number = curR,
    c: number = curC,
    t: number = curWaterLevel
  ): void {
    const pqSnap = pq.map((item) => ({ ...item }));
    const distSnap = snapshotGrid2D(dist);
    const visSnap = snapshotGrid2D(visited);
    const pathSnap = finalPath ? finalPath.map((p) => ({ ...p })) : undefined;

    steps.push({
      grid,
      r,
      c,
      curWaterLevel: t,
      distGrid: distSnap,
      visitedGrid: visSnap,
      pqSnapshot: pqSnap,
      bestPath: pathSnap,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-cur-time': `${t}`,
        'metric-cur-pos': `(${r}, ${c})`,
        'metric-pq-size': `${pq.length} 个候选`,
        'metric-swim-phase':
          status === 'done'
            ? '搜索完成'
            : status === 'reach'
              ? '抵达终点'
              : status === 'relax'
                ? '松弛邻格'
                : status === 'pop'
                  ? '出堆探索'
                  : '初始化',
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, `🚀 [算法初始化] swimInWater(grid ${n}x${m})：开启水位上升瓶颈最短路寻路。`, 'swimInWater 入口', 'init');
  makeStep(lines.initDist, `📊 [初始化距离矩阵] 分配 distance[${n}][${m}] 填充 ∞；记录到达各格子所需最小水位。`, 'init distance[][]', 'init');

  dist[0][0] = grid[0][0];
  makeStep(lines.initDistSrc, `🌱 [起点水位初始化] distance[0][0] = grid[0][0] = ${grid[0][0]}；从起点平台高度开始起算。`, `dist[0][0]=${grid[0][0]}`, 'init');
  makeStep(lines.initVisited, `🏷️ [初始化访问标记] boolean[][] visited 记录已最终确定水位的锁定方格。`, 'init visited[][]', 'init');
  makeStep(lines.initHeap, '📦 [初始化小根堆] PriorityQueue 按到达所需最少水位 t 升序排序。', 'init PriorityQueue', 'init');

  pq.push({ r: 0, c: 0, t: grid[0][0] });
  makeStep(lines.pushSrc, `📥 [起点入堆] heap.add([0, 0, ${grid[0][0]}])；起点加入 Dijkstra 前沿！`, `push (0,0,${grid[0][0]})`, 'init', 0, 0, grid[0][0]);

  const dr = [-1, 0, 1, 0];
  const dc = [0, 1, 0, -1];
  let foundTarget = false;

  while (pq.length > 0) {
    makeStep(lines.whileHeap, `🔁 [检查堆非空] while (!heap.isEmpty()) -> 小根堆待选候选数: ${pq.length}。`, '!heap.isEmpty()', 'pop');

    pq.sort((a, b) => a.t - b.t);
    const top = pq.shift()!;
    const { r, c, t } = top;
    curR = r;
    curC = c;
    curWaterLevel = t;

    makeStep(lines.pollRecord, `📤 [弹出最少水位平台] poll() -> (${r}, ${c}) [平台高度 ${grid[r][c]}, 所需最少水位 t=${t}]！`, `poll (${r},${c},t=${t})`, 'pop', r, c, t);

    makeStep(lines.checkVisited, `🔎 [检查是否已探索] if (visited[${r}][${c}]) -> (${visited[r][c]})。`, `visited[${r}][${c}]?`, 'pop', r, c, t);
    if (visited[r][c]) {
      makeStep(lines.continueVisited, `⏭️ [跳过冗余平台] 平台 (${r}, ${c}) 之前已被更低水位锁定，跳过。`, `skip visited (${r},${c})`, 'pop', r, c, t);
      continue;
    }

    visited[r][c] = true;
    makeStep(lines.markVisited, `🔒 [锁定水位状态] visited[${r}][${c}] = true；到达 (${r}, ${c}) 瓶颈水位固定为 ${t}！`, `visited[${r}][${c}]=true`, 'pop', r, c, t);

    makeStep(lines.checkTarget, `🎯 [终点核验] if (r == ${n - 1} && c == ${m - 1}) -> (${r === n - 1 && c === m - 1})。`, 'check target', 'pop', r, c, t);
    if (r === n - 1 && c === m - 1) {
      foundTarget = true;
      const bestPath: Array<{ r: number; c: number }> = [];
      let curr: { r: number; c: number } | undefined = { r, c };
      while (curr) {
        bestPath.push(curr);
        if (curr.r === 0 && curr.c === 0) break;
        curr = parent[`${curr.r},${curr.c}`];
      }
      bestPath.reverse();
      finalPath = bestPath;

      makeStep(lines.returnCost, `🏆 [抵达终点目标] return cost = ${t}！首次弹出右下角，全局瓶颈最小等待时间锁定为 ${t}！`, `return ${t}`, 'reach', r, c, t);
      break;
    }

    // 探索四周 4 个邻接平台
    for (let i = 0; i < 4; ++i) {
      const nr = r + dr[i];
      const nc = c + dc[i];

      makeStep(lines.forDirs, `  ↳ [考察出边] 考察方向 ${i} -> 邻接平台 (${nr}, ${nc})。`, `dir ${i} -> (${nr},${nc})`, 'relax', r, c, t);

      const inBound = nr >= 0 && nr < n && nc >= 0 && nc < m;
      const notVis = inBound && !visited[nr][nc];

      makeStep(lines.checkValidNeighbor, `  🔎 [界内与未访问核验] 界内(${inBound})、未访问(${notVis})。`, `valid (${nr},${nc})?`, 'relax', r, c, t);

      if (inBound && notVis) {
        const nextTime = Math.max(t, grid[nr][nc]);
        makeStep(lines.calcBottleneck, `  🌊 [瓶颈方程计算] ncCost = Math.max(${t}, grid[${nr}][${nc}]=${grid[nr][nc]}) = ${nextTime}。`, `max(${t},${grid[nr][nc]})=${nextTime}`, 'relax', r, c, t);

        makeStep(lines.checkRelax, `  🔎 [松弛检验] if (${nextTime} < distance[${nr}][${nc}]=${dist[nr][nc] === Infinity ? '∞' : dist[nr][nc]})。`, `check relax (${nr},${nc})`, 'relax', r, c, t);

        if (nextTime < dist[nr][nc]) {
          dist[nr][nc] = nextTime;
          parent[`${nr},${nc}`] = { r, c };
          pq.push({ r: nr, c: nc, t: nextTime });

          makeStep(lines.updateDist, `  ⚡ [更新最短水位] distance[${nr}][${nc}] = ${nextTime}。`, `dist[${nr}][${nc}]=${nextTime}`, 'relax', nr, nc, nextTime);
          makeStep(lines.pushHeap, `  📥 [候选入堆] heap.add([${nr}, ${nc}, ${nextTime}])；加入优先队列！`, `push (${nr},${nc},${nextTime})`, 'relax', nr, nc, nextTime);
        }
      }
    }
  }

  if (foundTarget) {
    makeStep(lines.returnCost, `🎉 [寻路完成] 成功构建瓶颈最短路！最少等待时间 t = ${curWaterLevel}，路径长度 ${finalPath?.length} 步！`, `完成: t=${curWaterLevel}`, 'done');
  } else {
    makeStep(lines.returnFail, '❌ [无路可达] return -1：无法连通终点。', 'return -1', 'done');
  }

  return steps;
}
