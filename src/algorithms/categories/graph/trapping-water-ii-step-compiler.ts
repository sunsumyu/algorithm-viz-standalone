/**
 * 二维接雨水 II (Trapping Rain Water II - LeetCode 407) 推演编译器
 * 核心：外围木桶最短板出堆、小根堆贪心收缩、大根水面蔓延 max(water, height)、木桶短板效应
 */

import { snapshotGrid2D } from '../../../core/strategies/grid-snapshot';

export interface Trap2Step {
  grid: number[][];
  waterLevel: number[][];
  visited: boolean[][];
  curR: number;
  curC: number;
  curBoardHeight: number;
  totalWater: number;
  heapList: Array<{ r: number; c: number; w: number }>;
  activeArray?: 'water' | 'visited' | 'heap';
  activeSlot?: [number, number];
  status: 'init_border' | 'pop_board' | 'fill_water' | 'spread' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
  metrics?: Record<string, string | number>;
}

export function buildTrappingWaterIISteps(preset: string = 'classic_3x6'): Trap2Step[] {
  const steps: Trap2Step[] = [];
  const is3x3 = preset === 'simple_3x3';

  // 网格地形
  const grid: number[][] = is3x3
    ? [
        [3, 3, 3],
        [3, 1, 3],
        [3, 3, 3],
      ]
    : [
        [1, 4, 3, 1, 3, 2],
        [3, 2, 1, 3, 2, 4],
        [2, 3, 3, 2, 3, 1],
      ];

  const n = grid.length;
  const m = grid[0].length;

  const waterLevel: number[][] = snapshotGrid2D(grid);
  const visited: boolean[][] = Array.from({ length: n }, () => new Array(m).fill(false));
  const heap: Array<{ r: number; c: number; w: number }> = [];

  let totalWater = 0;
  let curR = 0;
  let curC = 0;
  let curBoardHeight = 0;

  function pushHeap(r: number, c: number, w: number): void {
    heap.push({ r, c, w });
    heap.sort((a, b) => a.w - b.w);
  }

  function pollHeap(): { r: number; c: number; w: number } {
    return heap.shift()!;
  }

  function makeStep(
    codeLine: number | number[],
    message: string,
    log: string,
    status: 'init_border' | 'pop_board' | 'fill_water' | 'spread' | 'done',
    activeArray?: 'water' | 'visited' | 'heap',
    activeSlot?: [number, number]
  ): void {
    const boardStr = `(${curR}, ${curC}) 高度: ${curBoardHeight}`;
    const phaseStr =
      status === 'done'
        ? '积水计算完成'
        : status === 'fill_water'
          ? '内部低洼蓄水'
          : status === 'spread'
            ? '水线向内推移'
            : status === 'pop_board'
              ? '提取木桶最短板'
              : '四周木桶边界初始化';

    steps.push({
      grid: snapshotGrid2D(grid),
      waterLevel: snapshotGrid2D(waterLevel),
      visited: snapshotGrid2D(visited),
      curR,
      curC,
      curBoardHeight,
      totalWater,
      heapList: heap.map((item) => ({ ...item })),
      activeArray,
      activeSlot,
      status,
      message,
      log,
      codeLine,
      metrics: {
        'metric-trap2-total': `${totalWater} 滴`,
        'metric-trap2-board': boardStr,
        'metric-trap2-heap': `${heap.length} 个`,
        'metric-trap2-phase': phaseStr,
      },
    });
  }

  // ==================== 1. 初始化四周木桶外围 ====================
  // 行 2: trapRainWater
  makeStep(2, `🚀 [算法初始化] 建立 ${n}x${m} 二维地形高度矩阵，小根堆模拟木桶原理。`, 'trapRainWater 入口', 'init_border');

  // 行 7: 分配 PriorityQueue 与 visited
  makeStep(7, '📦 [构建小根堆与访问表] 优先队列 heap 维护木桶外围水线，visited 记录已锁定的单元格。', '分配 heap 与 visited', 'init_border');

  // 行 11: 四周边框入堆
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < m; j++) {
      if (i === 0 || i === n - 1 || j === 0 || j === m - 1) {
        visited[i][j] = true;
        pushHeap(i, j, grid[i][j]);
        curR = i;
        curC = j;
        curBoardHeight = grid[i][j];
        makeStep(12, `🧱 [外围边界入堆] 边界单元格 (${i}, ${j}, 高度=${grid[i][j]}) 作为木桶围栏压入小根堆。`, `边界 (${i}, ${j}) 入堆`, 'init_border', 'visited', [i, j]);
      }
    }
  }

  // 行 20: int ans = 0;
  makeStep(20, '💧 [积水总量初始化] 累计积水量 ans = 0。', 'ans = 0', 'init_border');

  // ==================== 2. 小根堆收缩主循环 ====================
  const dirs = [
    [-1, 0],
    [0, 1],
    [1, 0],
    [0, -1],
  ];

  while (heap.length > 0) {
    // 行 24: cur = heap.poll();
    const top = pollHeap();
    curR = top.r;
    curC = top.c;
    curBoardHeight = top.w;
    makeStep(24, `🪵 [提取木桶最短板] 弹出当前全局最短围栏板 (${curR}, ${curC})，有效水线为 ${curBoardHeight}！`, `poll (${curR}, ${curC}, w=${curBoardHeight})`, 'pop_board');

    // 行 28: 遍历上下左右邻居
    for (const [dr, dc] of dirs) {
      const nr = curR + dr;
      const nc = curC + dc;

      if (nr >= 0 && nr < n && nc >= 0 && nc < m && !visited[nr][nc]) {
        visited[nr][nc] = true;
        const neighborH = grid[nr][nc];

        // 行 32: 检查是否有落差产生积水
        if (neighborH < curBoardHeight) {
          const diff = curBoardHeight - neighborH;
          totalWater += diff;
          waterLevel[nr][nc] = curBoardHeight;
          makeStep(33, `💦 [内部低洼蓄水] 发现内部低洼格 (${nr}, ${nc}, 原高=${neighborH})！低于木桶水线 ${curBoardHeight}！蓄水 ${diff} 滴！总积水增至 ${totalWater}！`, `蓄水 (${nr}, ${nc}) +${diff}`, 'fill_water', 'water', [nr, nc]);
        } else {
          makeStep(30, `⛰️ [遇到更高山峰] 邻格 (${nr}, ${nc}, 高度=${neighborH}) >= 木桶水线 (${curBoardHeight})，无积水产生。`, `高地 (${nr}, ${nc})`, 'spread');
        }

        // 行 35: 新水线入堆
        const nextW = Math.max(curBoardHeight, neighborH);
        pushHeap(nr, nc, nextW);
        makeStep(35, `🌊 [水线向内推移入堆] 单元格 (${nr}, ${nc}) 水线更新为 max(${curBoardHeight}, ${neighborH}) = ${nextW} 并压入小根堆！`, `push (${nr}, ${nc}, w=${nextW})`, 'spread', 'heap');
      }
    }
  }

  // 终态
  makeStep(39, `🎉 [二维接雨水求解完成] 所有内部低洼单元格已全部由外向内蔓延灌满，全网最终总蓄水量为 ${totalWater} 滴！木桶最短板贪心原理保证了结果的最优性！`, '计算结束', 'done');

  return steps;
}
