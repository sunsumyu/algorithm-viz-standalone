/**
 * 最小体力消耗路径 (Path With Minimum Effort - LeetCode 1631) 步进推演编译器
 * 核心：2D 网格 Dijkstra 瓶颈最短路、max(effort, |h1 - h2|) 状态松弛、小根堆贪心搜索
 */

import { HighlightTarget } from '../../../core/code-panel';
import { snapshotGrid2D } from '../../../core/strategies/grid-snapshot';

export interface EffortStep {
  grid: number[][];
  dist: number[][];
  visited: boolean[][];
  curR: number;
  curC: number;
  minEffortSoFar: number;
  pathNodes: Array<[number, number]>;
  pqList: Array<{ r: number; c: number; effort: number }>;
  activeArray?: 'dist' | 'visited' | 'pq';
  activeSlot?: [number, number];
  status: 'start' | 'explore' | 'relax' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export const PRESET_EFFORT_GRIDS: Record<string, { label: string; grid: number[][] }> = {
  classic_mountain_3x3: {
    label: '3x3 经典山脉地图 (右侧绕行, 体力=2)',
    grid: [
      [1, 2, 2],
      [3, 8, 2],
      [5, 3, 4],
    ],
  },
  valley_3x3: {
    label: '3x3 险峻山谷地图 (体力=1)',
    grid: [
      [1, 3, 5],
      [2, 8, 4],
      [1, 1, 2],
    ],
  },
  flat_2x2: {
    label: '2x2 平坦地形特判 (体力=0)',
    grid: [
      [1, 1],
      [1, 1],
    ],
  },
};

export function buildPathMinEffortSteps(preset: string = 'classic_mountain_3x3'): EffortStep[] {
  const steps: EffortStep[] = [];
  const grid = PRESET_EFFORT_GRIDS[preset]?.grid || PRESET_EFFORT_GRIDS.classic_mountain_3x3.grid;

  const rows = grid.length;
  const cols = grid[0].length;

  const distance: number[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(Infinity)
  );
  const visited: boolean[][] = Array.from({ length: rows }, () =>
    new Array(cols).fill(false)
  );
  const pre: Record<string, [number, number]> = {};

  const pq: Array<{ r: number; c: number; effort: number }> = [];

  function pushPq(r: number, c: number, effort: number): void {
    pq.push({ r, c, effort });
    pq.sort((a, b) => a.effort - b.effort);
  }

  function pollPq(): { r: number; c: number; effort: number } {
    return pq.shift()!;
  }

  let curR = 0;
  let curC = 0;
  let minEffortSoFar = 0;
  let reachedTarget = false;

  const lines = {
    entry: { cpp: 18, java: 12, python: 4, javascript: 2 },
    initDist: { cpp: 20, java: 14, python: 6, javascript: 4 },
    initDistSrc: { cpp: 24, java: 18, python: 9, javascript: 9 },
    initVisited: { cpp: 21, java: 20, python: 7, javascript: 5 },
    initHeap: { cpp: 22, java: 22, python: 10, javascript: 8 },
    pushSrc: { cpp: 25, java: 23, python: 10, javascript: 8 },
    whileHeap: { cpp: 29, java: 28, python: 13, javascript: 12 },
    pollCur: { cpp: 30, java: 29, python: 14, javascript: 14 },
    checkVisited: { cpp: 32, java: 32, python: 15, javascript: 15 },
    continueVisited: { cpp: 32, java: 32, python: 16, javascript: 15 },
    markVisited: { cpp: 33, java: 33, python: 17, javascript: 16 },
    checkTarget: { cpp: 34, java: 36, python: 18, javascript: 17 },
    returnCost: { cpp: 34, java: 37, python: 19, javascript: 17 },
    forDirs: { cpp: 36, java: 40, python: 21, javascript: 19 },
    checkValidNeighbor: { cpp: 38, java: 42, python: 23, javascript: 21 },
    calcBottleneck: { cpp: 40, java: 44, python: 24, javascript: 22 },
    checkRelax: { cpp: 41, java: 45, python: 25, javascript: 23 },
    updateDist: { cpp: 42, java: 46, python: 26, javascript: 24 },
    pushHeap: { cpp: 43, java: 47, python: 27, javascript: 25 },
    returnFail: { cpp: 48, java: 52, python: 28, javascript: 30 },
  };

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'start' | 'explore' | 'relax' | 'done',
    activeArray?: 'dist' | 'visited' | 'pq',
    activeSlot?: [number, number]
  ): void {
    const curH = grid[curR][curC];
    const coordStr = `(${curR}, ${curC})`;
    const effortStr = `${minEffortSoFar}`;
    const heightStr = `${curH} m`;

    const phaseStr =
      status === 'done'
        ? '最小体力路径达成'
        : status === 'relax'
          ? '松弛瓶颈体力值'
          : status === 'explore'
            ? '弹出最小体力格'
            : '算法初始化';

    let pathNodes: Array<[number, number]> = [];
    if (status === 'done') {
      let curr: [number, number] | undefined = [rows - 1, cols - 1];
      while (curr) {
        pathNodes.unshift(curr);
        if (curr[0] === 0 && curr[1] === 0) break;
        curr = pre[`${curr[0]},${curr[1]}`];
      }
    } else {
      pathNodes = [[curR, curC]];
    }

    steps.push({
      grid: snapshotGrid2D(grid),
      dist: snapshotGrid2D(distance),
      visited: snapshotGrid2D(visited),
      curR,
      curC,
      minEffortSoFar,
      pathNodes,
      pqList: pq.map((item) => ({ ...item })),
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-cur-coord': coordStr,
        'metric-min-effort': effortStr,
        'metric-cur-height': heightStr,
        'metric-effort-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, `🚀 [算法初始化] minimumEffortPath(heights ${rows}x${cols})：开启最小体力消耗瓶颈路径搜索。`, 'minimumEffortPath 入口', 'start');
  makeStep(lines.initDist, `📊 [初始化体力矩阵] distance[${rows}][${cols}] 全部填充 ∞；记录到达各格子所需最小高度落差。`, 'init distance[][]', 'start', 'dist');

  distance[0][0] = 0;
  makeStep(lines.initDistSrc, '🌱 [起点体力初始化] distance[0][0] = 0；自身移动体力消耗为 0。', 'distance[0][0] = 0', 'start', 'dist', [0, 0]);
  makeStep(lines.initVisited, `🏷️ [初始化锁定矩阵] visited[${rows}][${cols}] = false；记录已出堆锁定的终局格子。`, 'init visited[][]', 'start', 'visited');
  makeStep(lines.initHeap, '📦 [初始化小根堆] PriorityQueue 按体力消耗 effort 升序排序。', 'init PriorityQueue', 'start', 'pq');

  pushPq(0, 0, 0);
  makeStep(lines.pushSrc, '📥 [起点入堆] pq.add([0, 0, effort=0])；起点加入 Dijkstra 搜索前沿！', 'push (0,0,0)', 'start', 'pq', [0, 0]);

  const dr = [-1, 1, 0, 0];
  const dc = [0, 0, -1, 1];

  while (pq.length > 0) {
    makeStep(lines.whileHeap, `🔁 [检查堆非空] while (!pq.isEmpty()) -> 小根堆待选格子数: ${pq.length}。`, '!pq.isEmpty()', 'explore');

    const top = pollPq();
    curR = top.r;
    curC = top.c;
    minEffortSoFar = top.effort;

    makeStep(lines.pollCur, `📤 [弹出体力最小格] poll() -> (${curR}, ${curC}) [高度 ${grid[curR][curC]}, 累计瓶颈体力 effort=${minEffortSoFar}]！`, `poll (${curR},${curC},effort=${minEffortSoFar})`, 'explore', 'pq', [curR, curC]);

    makeStep(lines.checkVisited, `🔎 [检查是否已探索] if (visited[${curR}][${curC}]) -> (${visited[curR][curC]})。`, `visited[${curR}][${curC}]?`, 'explore');
    if (visited[curR][curC]) {
      makeStep(lines.continueVisited, `⏭️ [跳过冗余格子] 格子 (${curR}, ${curC}) 之前已被更小体力锁定，跳过。`, `skip visited (${curR},${curC})`, 'explore');
      continue;
    }

    visited[curR][curC] = true;
    makeStep(lines.markVisited, `🔒 [锁定体力状态] visited[${curR}][${curC}] = true；锁定到达 (${curR}, ${curC}) 的全局最小体力 = ${minEffortSoFar}！`, `visited[${curR}][${curC}]=true`, 'explore', 'visited', [curR, curC]);

    makeStep(lines.checkTarget, `🎯 [终点核验] if (r == ${rows - 1} && c == ${cols - 1}) -> (${curR === rows - 1 && curC === cols - 1})。`, 'check target', 'explore');
    if (curR === rows - 1 && curC === cols - 1) {
      reachedTarget = true;
      makeStep(lines.returnCost, `🏆 [抵达终点目标] return d = ${minEffortSoFar}！首次弹出右下角，最小体力消耗路径锁定为 ${minEffortSoFar}！`, `return ${minEffortSoFar}`, 'done', 'dist', [curR, curC]);
      break;
    }

    for (let i = 0; i < 4; i++) {
      const nr = curR + dr[i];
      const nc = curC + dc[i];

      makeStep(lines.forDirs, `  ↳ [考察出边] 方向 ${i} -> 邻接格 (${nr}, ${nc})。`, `dir ${i} -> (${nr},${nc})`, 'relax');

      const inBound = nr >= 0 && nr < rows && nc >= 0 && nc < cols;
      const notVis = inBound && !visited[nr][nc];

      makeStep(lines.checkValidNeighbor, `  🔎 [界内与未访问核验] 界内(${inBound})、未访问(${notVis})。`, `valid (${nr},${nc})?`, 'relax');

      if (inBound && notVis) {
        const stepEffort = Math.abs(grid[nr][nc] - grid[curR][curC]);
        const nextEffort = Math.max(minEffortSoFar, stepEffort);

        makeStep(lines.calcBottleneck, `  🧗 [落差松弛计算] stepEffort=|${grid[nr][nc]} - ${grid[curR][curC]}|=${stepEffort}, nextEffort=max(${minEffortSoFar}, ${stepEffort})=${nextEffort}。`, `max(${minEffortSoFar},${stepEffort})=${nextEffort}`, 'relax');

        makeStep(lines.checkRelax, `  🔎 [松弛检验] if (${nextEffort} < distance[${nr}][${nc}]=${distance[nr][nc] === Infinity ? '∞' : distance[nr][nc]})。`, `check relax (${nr},${nc})`, 'relax');

        if (nextEffort < distance[nr][nc]) {
          distance[nr][nc] = nextEffort;
          pre[`${nr},${nc}`] = [curR, curC];
          pushPq(nr, nc, nextEffort);

          makeStep(lines.updateDist, `  ⚡ [更新最短体力] distance[${nr}][${nc}] = ${nextEffort}。`, `dist[${nr}][${nc}]=${nextEffort}`, 'relax', 'dist', [nr, nc]);
          makeStep(lines.pushHeap, `  📥 [候选入堆] pq.add([${nr}, ${nc}, ${nextEffort}])；加入小根堆！`, `push (${nr},${nc},${nextEffort})`, 'relax', 'pq', [nr, nc]);
        }
      }
    }
  }

  if (reachedTarget) {
    makeStep(lines.returnCost, `🎉 [寻路完成] 成功构建最小体力消耗路径！全程最大落差仅为 ${minEffortSoFar}！`, `完成: effort=${minEffortSoFar}`, 'done');
  } else {
    makeStep(lines.returnFail, '❌ [无路可达] return 0：无法连通终点。', 'return 0', 'done');
  }

  return steps;
}
