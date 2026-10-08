/**
 * A* 算法网格寻路 (A* Grid Pathfinding Journey) 步进推演编译器
 * 左程云 Class 065 Code01
 * 核心：曼哈顿启发函数 h(x,y)、综合代价 f = g + h、优先队列小根堆定向加速寻路
 */

import { HighlightTarget } from '../../../core/code-panel';
import { snapshotGrid2D } from '../../../core/strategies/grid-snapshot';

export interface AStarJourneyStep {
  grid: number[][];
  curR: number;
  curC: number;
  openSet: Array<[number, number]>;
  closedSet: Array<[number, number]>;
  path: Array<[number, number]>;
  fScore: Record<string, number>;
  distanceGrid: number[][];
  activeArray?: 'dist' | 'f' | 'open';
  activeSlot?: [number, number];
  status: 'start' | 'search' | 'reach' | 'done';
  message: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export const PRESET_JOURNEY_MAPS: Record<string, { label: string; grid: number[][] }> = {
  classic_3x4: {
    label: '3x4 经典障碍地图 (中心障碍，绕行最短步数 5)',
    grid: [
      [1, 1, 1, 1],
      [1, 0, 1, 1],
      [1, 1, 1, 1],
    ],
  },
  line_3x3: {
    label: '3x3 对角线绕行地图 (中心障碍，对称双向，最短步数 4)',
    grid: [
      [1, 1, 1],
      [1, 0, 1],
      [1, 1, 1],
    ],
  },
};

export function buildAStarJourneySteps(preset: string = 'classic_3x4'): AStarJourneyStep[] {
  const steps: AStarJourneyStep[] = [];
  const grid = PRESET_JOURNEY_MAPS[preset]?.grid || PRESET_JOURNEY_MAPS.classic_3x4.grid;

  const n = grid.length;
  const m = grid[0].length;
  const targetX = n - 1;
  const targetY = m - 1;

  function h(x: number, y: number): number {
    return Math.abs(x - targetX) + Math.abs(y - targetY);
  }

  const distance: number[][] = Array.from({ length: n }, () => Array(m).fill(Infinity));
  const closedSet: boolean[][] = Array.from({ length: n }, () => Array(m).fill(false));
  const parentMap: Record<string, [number, number]> = {};
  const fRecord: Record<string, number> = {};

  const openHeap: Array<{ x: number; y: number; g: number; f: number }> = [];

  function pushHeap(x: number, y: number, g: number, f: number): void {
    openHeap.push({ x, y, g, f });
    openHeap.sort((a, b) => a.f - b.f || a.g - b.g);
  }

  function pollHeap(): { x: number; y: number; g: number; f: number } {
    return openHeap.shift()!;
  }

  let curX = 0;
  let curY = 0;
  let currentF = h(0, 0);
  let reached = false;
  let finalPath: Array<[number, number]> = [];

  const lines = {
    entry: { cpp: 18, java: 9, python: 4, javascript: 2 },
    initDist: { cpp: 20, java: 12, python: 6, javascript: 4 },
    initDistSrc: { cpp: 23, java: 15, python: 9, javascript: 9 },
    initClosed: { cpp: 21, java: 16, python: 7, javascript: 5 },
    initHeap: { cpp: 22, java: 18, python: 10, javascript: 8 },
    pushSrc: { cpp: 24, java: 19, python: 10, javascript: 8 },
    whileHeap: { cpp: 27, java: 21, python: 13, javascript: 12 },
    pollCur: { cpp: 28, java: 22, python: 14, javascript: 14 },
    checkClosed: { cpp: 30, java: 24, python: 15, javascript: 15 },
    markClosed: { cpp: 31, java: 25, python: 17, javascript: 16 },
    checkTarget: { cpp: 32, java: 26, python: 18, javascript: 17 },
    forDirs: { cpp: 34, java: 28, python: 21, javascript: 19 },
    calcCost: { cpp: 38, java: 31, python: 24, javascript: 22 },
    updateDist: { cpp: 40, java: 32, python: 26, javascript: 24 },
    pushHeap: { cpp: 41, java: 33, python: 27, javascript: 25 },
    returnFailed: { cpp: 46, java: 38, python: 28, javascript: 30 },
  };

  function getClosedArray(): Array<[number, number]> {
    const list: Array<[number, number]> = [];
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < m; c++) {
        if (closedSet[r][c]) list.push([r, c]);
      }
    }
    return list;
  }

  function makeStep(
    codeLine: HighlightTarget,
    message: string,
    log: string,
    status: 'start' | 'search' | 'reach' | 'done',
    activeArray?: 'dist' | 'f' | 'open',
    activeSlot?: [number, number]
  ): void {
    const curPath: Array<[number, number]> = [];
    if (reached) {
      curPath.push(...finalPath);
    } else {
      let curr: [number, number] | undefined = [curX, curY];
      while (curr) {
        curPath.unshift(curr);
        if (curr[0] === 0 && curr[1] === 0) break;
        curr = parentMap[`${curr[0]},${curr[1]}`];
      }
    }

    const phaseStr =
      status === 'done'
        ? 'A* 寻路完成'
        : status === 'reach'
          ? '到达终点'
          : status === 'search'
            ? '启发式拓展波前'
            : '初始化';

    steps.push({
      grid: snapshotGrid2D(grid),
      curR: curX,
      curC: curY,
      openSet: openHeap.map((item) => [item.x, item.y]),
      closedSet: getClosedArray(),
      path: curPath,
      fScore: { ...fRecord },
      distanceGrid: snapshotGrid2D(distance),
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-astar-coord': `(${curX}, ${curY})`,
        'metric-astar-f': `${currentF}`,
        'metric-open-size': `${openHeap.length} 个候选`,
        'metric-astar-phase': phaseStr,
      },
    });
  }

  // 1. 初始化
  makeStep(lines.entry, `🚀 [算法初始化] aStarSearch(grid ${n}x${m})：开启曼哈顿启发式网格寻路。`, 'aStarSearch 入口', 'start');
  makeStep(lines.initDist, `📊 [初始化步数矩阵] distance[${n}][${m}] 填充 ∞；记录各点实际最短距离 g(x,y)。`, 'init distance[][]', 'start', 'dist');

  distance[0][0] = 0;
  makeStep(lines.initDistSrc, '🌱 [起点步数初始化] distance[0][0] = 0；起点自身代价为 0。', 'distance[0][0] = 0', 'start', 'dist', [0, 0]);
  makeStep(lines.initClosed, `🏷️ [初始化锁定集] closedSet[${n}][${m}] = false；记录已出堆固定最优代价的格。`, 'init closedSet', 'start');
  makeStep(lines.initHeap, '📦 [初始化优先队列] PriorityQueue<Node> 按 f(n) = g(n) + h(n) 升序排列。', 'init PriorityQueue', 'start', 'open');

  fRecord['0,0'] = h(0, 0);
  pushHeap(0, 0, 0, fRecord['0,0']);
  makeStep(lines.pushSrc, `📥 [起点入堆] openSet.add([0, 0, g=0, f=${fRecord['0,0']}])；综合代价估值 f 驱动启发前沿！`, `push (0,0,f=${fRecord['0,0']})`, 'start', 'open', [0, 0]);

  const dx = [-1, 1, 0, 0];
  const dy = [0, 0, -1, 1];

  while (openHeap.length > 0) {
    makeStep(lines.whileHeap, `🔁 [检查堆非空] while (!openSet.isEmpty()) -> 待探索候选节点数: ${openHeap.length}。`, '!openSet.isEmpty()', 'search');

    const top = pollHeap();
    curX = top.x;
    curY = top.y;
    currentF = top.f;

    makeStep(lines.pollCur, `📤 [弹出最优估价值格] poll() -> (${curX}, ${curY}) [已走步数 g=${top.g}, 启发估值 f=${top.f}]！`, `poll (${curX},${curY},f=${top.f})`, 'search', 'open', [curX, curY]);

    makeStep(lines.checkClosed, `🔎 [检查锁定状态] closedSet[${curX}][${curY}] == ${closedSet[curX][curY]}。`, `closed[${curX}][${curY}]?`, 'search');
    if (closedSet[curX][curY]) continue;

    closedSet[curX][curY] = true;
    makeStep(lines.markClosed, `🔒 [锁定最优估价] closedSet[${curX}][${curY}] = true；该格已被全局最优启发式锁定！`, `closed[${curX}][${curY}]=true`, 'search');

    makeStep(lines.checkTarget, `🎯 [终点核验] if (x == ${targetX} && y == ${targetY}) -> (${curX === targetX && curY === targetY})。`, 'check target', 'search');
    if (curX === targetX && curY === targetY) {
      reached = true;
      let curr: [number, number] | undefined = [targetX, targetY];
      const p: Array<[number, number]> = [];
      while (curr) {
        p.unshift(curr);
        if (curr[0] === 0 && curr[1] === 0) break;
        curr = parentMap[`${curr[0]},${curr[1]}`];
      }
      finalPath = p;
      makeStep(lines.checkTarget, `🏆 [抵达目标终点] 首次弹出终点 (${targetX}, ${targetY})，A* 搜索保证到达代价全局最优！`, 'reach target', 'reach', 'dist', [curX, curY]);
      break;
    }

    const g = top.g;
    for (let i = 0; i < 4; i++) {
      const nx = curX + dx[i];
      const ny = curY + dy[i];

      makeStep(lines.forDirs, `  ↳ [考察出边] 探索邻接格 (${nx}, ${ny})。`, `dir ${i} -> (${nx},${ny})`, 'search');

      if (nx >= 0 && nx < n && ny >= 0 && ny < m && grid[nx][ny] === 1 && !closedSet[nx][ny]) {
        makeStep(lines.calcCost, `  📐 [计算启发综合估价] nextG=${g + 1}, nextH=${h(nx, ny)}, nextF=${g + 1 + h(nx, ny)}。`, `g=${g + 1},h=${h(nx, ny)}`, 'search');

        if (g + 1 < distance[nx][ny]) {
          distance[nx][ny] = g + 1;
          parentMap[`${nx},${ny}`] = [curX, curY];
          const nextH = h(nx, ny);
          const nextF = g + 1 + nextH;
          fRecord[`${nx},${ny}`] = nextF;
          pushHeap(nx, ny, g + 1, nextF);

          makeStep(lines.updateDist, `  ⚡ [更新到达步数] 发现更优路径！distance[${nx}][${ny}] = ${g + 1}。`, `dist[${nx}][${ny}]=${g + 1}`, 'search', 'dist', [nx, ny]);
          makeStep(lines.pushHeap, `  📥 [启发式入堆] 计算综合估价 f = g(${g + 1}) + h(${nextH}) = ${nextF}；加入 OpenSet！`, `push (${nx},${ny}, f=${nextF})`, 'search', 'open', [nx, ny]);
        }
      }
    }
  }

  if (reached) {
    makeStep(lines.checkTarget, `🎉 [A* 寻路完成] 成功构建最短路径！总共经过 ${finalPath.length} 个格子，启发式引导大幅缩减搜索面积！`, `寻路完成，路径长度 ${finalPath.length}`, 'done');
  } else {
    makeStep(lines.returnFailed, '❌ [无路可达] return -1：所有通路均已尝试但无法连通目标终点。', 'return -1', 'done');
  }

  return steps;
}
