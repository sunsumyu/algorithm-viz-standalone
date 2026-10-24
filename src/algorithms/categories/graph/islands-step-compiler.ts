/**
 * 岛屿数量 (Number of Islands · LeetCode 200) 步骤编译器
 * 支持 Stage 1 (DFS 沉岛) / Stage 2 (BFS 波浪扩散) / Stage 3 (并查集连通分量) 三阶段认知演化
 * 严格遵从 Strict One-Line-One-Step 单行代码行号联动与探险家小人状态机
 */

import { snapshotGrid2D } from '../../../core/strategies/grid-snapshot';

export type CellState = 'water' | 'land' | 'visited';

export interface AdventurerState {
  r: number;
  c: number;
  state: 'scanning' | 'walking' | 'swimming' | 'success';
  isHopping?: boolean;
  isFinish?: boolean;
}

export interface IslandsStep {
  grid: number[][];
  states: CellState[][];
  current: [number, number] | null;
  scan: [number, number] | null;
  queue?: [number, number][];
  count: number;
  visitedLand: number;
  action: string;
  stage: string;
  message: string;
  log: string;
  codeLine: number | Record<string, number>;
  adventurer: AdventurerState | null;
  metrics?: Record<string, string>;
}

export const PRESET_CASES: Record<string, { label: string; grid: number[][] }> = {
  classic: { label: '经典 3 岛屿 [4×5]', grid: [[1, 1, 0, 0, 0], [1, 1, 0, 0, 0], [0, 0, 1, 0, 0], [0, 0, 0, 1, 1]] },
  single: { label: '单座大岛 [4×4]', grid: [[1, 1, 1, 0], [1, 1, 0, 0], [1, 0, 0, 0], [0, 0, 0, 0]] },
  scattered: { label: '多散点 4 岛屿 [4×5]', grid: [[1, 0, 1, 0, 1], [0, 0, 0, 0, 0], [1, 0, 0, 0, 0], [0, 0, 0, 0]] },
};

export const DEFAULT_GRID = PRESET_CASES.classic.grid;

export const DFS_LINES: Record<string, Record<string, number>> = {
  init: { java: 3, cpp: 4, python: 3, javascript: 2 },
  scan: { java: 6, cpp: 7, python: 14, javascript: 13 },
  found: { java: 8, cpp: 9, python: 16, javascript: 15 },
  dfsCall: { java: 9, cpp: 10, python: 17, javascript: 16 },
  baseCheck: { java: 16, cpp: 16, python: 6, javascript: 5 },
  mark: { java: 17, cpp: 17, python: 8, javascript: 6 },
  down: { java: 18, cpp: 18, python: 9, javascript: 7 },
  up: { java: 19, cpp: 19, python: 10, javascript: 8 },
  right: { java: 20, cpp: 20, python: 11, javascript: 9 },
  left: { java: 21, cpp: 21, python: 12, javascript: 10 },
  returnCount: { java: 13, cpp: 13, python: 18, javascript: 17 },
};

export const BFS_LINES: Record<string, Record<string, number>> = {
  init: { java: 3, cpp: 4, python: 3, javascript: 2 },
  scan: { java: 7, cpp: 7, python: 7, javascript: 6 },
  found: { java: 9, cpp: 9, python: 9, javascript: 8 },
  markStart: { java: 10, cpp: 10, python: 10, javascript: 9 },
  enqueue: { java: 12, cpp: 12, python: 11, javascript: 11 },
  dequeue: { java: 14, cpp: 14, python: 13, javascript: 13 },
  checkNeighbor: { java: 17, cpp: 17, python: 16, javascript: 16 },
  markNeighbor: { java: 18, cpp: 18, python: 17, javascript: 17 },
  pushNeighbor: { java: 19, cpp: 19, python: 18, javascript: 18 },
  done: { java: 21, cpp: 21, python: 19, javascript: 23 },
};

/** Stage 1: DFS 深度优先沉岛法 */
export function buildIslandsDfsSteps(grid: number[][]): IslandsStep[] {
  const steps: IslandsStep[] = [];
  const m = grid.length;
  if (m === 0) return steps;
  const n = grid[0].length;
  const states: CellState[][] = grid.map((row) => row.map((v) => (v === 1 ? 'land' : 'water')));
  let count = 0;
  let visitedLand = 0;

  const pushStep = (extra: Partial<IslandsStep> & { codeLine: number | Record<string, number> }): void => {
    steps.push({
      grid,
      states: snapshotGrid2D(states),
      current: extra.current ?? null,
      scan: extra.scan ?? null,
      count,
      visitedLand,
      action: extra.action ?? 'scan',
      stage: 'Stage 1: DFS 递归沉岛',
      message: extra.message ?? '',
      log: extra.log ?? '',
      codeLine: extra.codeLine,
      adventurer: extra.adventurer ?? null,
    });
  };

  pushStep({
    action: 'init',
    message: `初始化 ${m}×${n} 网格，准备双重循环寻找未访问陆地 (1)。`,
    log: `初始化网格 ${m}×${n}，岛屿计数 count = 0`,
    codeLine: DFS_LINES.init,
    adventurer: { r: 0, c: 0, state: 'scanning' },
  });

  const dfs = (r: number, c: number, from: [number, number] | null): void => {
    pushStep({
      current: [r, c],
      scan: from,
      action: 'baseCheck',
      message: `探险家进入 (${r}, ${c}) 执行边界与有效性检查。`,
      log: `  dfs(${r}, ${c}): 边界判定`,
      codeLine: DFS_LINES.baseCheck,
      adventurer: { r, c, state: 'walking', isHopping: true },
    });

    if (r < 0 || r >= m || c < 0 || c >= n || states[r][c] !== 'land') {
      return;
    }

    states[r][c] = 'visited';
    visitedLand++;

    pushStep({
      current: [r, c],
      scan: from,
      action: 'mark',
      message: `染色沉没 (${r}, ${c})：将陆地标记为已访问并沉没，防止重复遍历。`,
      log: `  沉没陆地 (${r}, ${c})`,
      codeLine: DFS_LINES.mark,
      adventurer: { r, c, state: 'swimming', isHopping: false },
    });

    const dirs: Array<{ dr: number; dc: number; line: Record<string, number>; name: string }> = [
      { dr: 1, dc: 0, line: DFS_LINES.down, name: '向下' },
      { dr: -1, dc: 0, line: DFS_LINES.up, name: '向上' },
      { dr: 0, dc: 1, line: DFS_LINES.right, name: '向右' },
      { dr: 0, dc: -1, line: DFS_LINES.left, name: '向左' },
    ];

    for (const d of dirs) {
      const nr = r + d.dr;
      const nc = c + d.dc;
      if (nr >= 0 && nr < m && nc >= 0 && nc < n && states[nr][nc] === 'land') {
        pushStep({
          current: [r, c],
          scan: [nr, nc],
          action: 'dfs-recurse',
          message: `从 (${r}, ${c}) ${d.name}探测到相邻陆地 (${nr}, ${nc})，深入递归调用 dfs。`,
          log: `  -> 从 (${r}, ${c}) ${d.name}递归 (${nr}, ${nc})`,
          codeLine: d.line,
          adventurer: { r, c, state: 'walking' },
        });
        dfs(nr, nc, [r, c]);
      }
    }
  };

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (states[r][c] === 'land') {
        count++;
        pushStep({
          scan: [r, c],
          current: [r, c],
          action: 'found',
          message: `🎯 在 (${r}, ${c}) 发现新岛屿！计数 count++ 达到 ${count}。`,
          log: `[新岛屿 #${count}] 发现起点 (${r}, ${c})`,
          codeLine: DFS_LINES.found,
          adventurer: { r, c, state: 'success', isHopping: true },
        });

        pushStep({
          scan: [r, c],
          current: [r, c],
          action: 'dfs-call',
          message: `以 (${r}, ${c}) 为根节点启动 DFS 连通分量遍历。`,
          log: `  启动 dfs(${r}, ${c})`,
          codeLine: DFS_LINES.dfsCall,
          adventurer: { r, c, state: 'walking' },
        });

        dfs(r, c, null);
      } else {
        pushStep({
          scan: [r, c],
          current: null,
          action: 'scan',
          message: `扫描格 (${r}, ${c})：${states[r][c] === 'water' ? '水域 (0)' : '已沉没陆地'}，跳过。`,
          log: `扫描 (${r}, ${c}): ${states[r][c]}`,
          codeLine: DFS_LINES.scan,
          adventurer: { r, c, state: 'scanning' },
        });
      }
    }
  }

  pushStep({
    action: 'done',
    current: null,
    scan: null,
    message: `🎉 DFS 全网格探索完成！共发现 ${count} 座独立岛屿，共计沉没 ${visitedLand} 格陆地。`,
    log: `✓ DFS 探索完毕，岛屿总数 = ${count}`,
    codeLine: DFS_LINES.returnCount,
    adventurer: { r: m - 1, c: n - 1, state: 'success', isFinish: true },
  });

  return steps;
}

/** Stage 2: BFS 广度优先队列波浪扩散 */
export function buildIslandsBfsSteps(grid: number[][]): IslandsStep[] {
  const steps: IslandsStep[] = [];
  const m = grid.length;
  if (m === 0) return steps;
  const n = grid[0].length;
  const states: CellState[][] = grid.map((row) => row.map((v) => (v === 1 ? 'land' : 'water')));
  let count = 0;
  let visitedLand = 0;

  const pushStep = (extra: Partial<IslandsStep> & { codeLine: number | Record<string, number> }): void => {
    steps.push({
      grid,
      states: snapshotGrid2D(states),
      current: extra.current ?? null,
      scan: extra.scan ?? null,
      queue: extra.queue ? [...extra.queue] : [],
      count,
      visitedLand,
      action: extra.action ?? 'scan',
      stage: 'Stage 2: BFS 队列波浪扩散',
      message: extra.message ?? '',
      log: extra.log ?? '',
      codeLine: extra.codeLine,
      adventurer: extra.adventurer ?? null,
    });
  };

  pushStep({
    action: 'init',
    message: `初始化 ${m}×${n} 网格与方向向量 dirs，准备 BFS 队列探索。`,
    log: `初始化网格 ${m}×${n}，岛屿计数 count = 0`,
    codeLine: BFS_LINES.init,
    adventurer: { r: 0, c: 0, state: 'scanning' },
  });

  const dirs: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (states[r][c] === 'land') {
        count++;
        pushStep({
          scan: [r, c],
          current: [r, c],
          action: 'found',
          message: `🎯 发现新岛屿起点 (${r}, ${c})！count = ${count}。`,
          log: `[新岛屿 #${count}] 发现起点 (${r}, ${c})`,
          codeLine: BFS_LINES.found,
          adventurer: { r, c, state: 'success', isHopping: true },
        });

        // 入队立即沉岛
        states[r][c] = 'visited';
        visitedLand++;
        pushStep({
          scan: [r, c],
          current: [r, c],
          action: 'markStart',
          message: `入队即染色！将起点 (${r}, ${c}) 置为已访问并沉没，防止重复入队。`,
          log: `  起点 (${r}, ${c}) 沉岛染色`,
          codeLine: BFS_LINES.markStart,
          adventurer: { r, c, state: 'swimming' },
        });

        const queue: [number, number][] = [[r, c]];
        pushStep({
          scan: [r, c],
          current: [r, c],
          queue,
          action: 'queueOffer',
          message: `将起点 (${r}, ${c}) 加入 BFS 队列中。当前队列长度: 1。`,
          log: `  入队: (${r}, ${c})`,
          codeLine: BFS_LINES.enqueue,
          adventurer: { r, c, state: 'walking' },
        });

        while (queue.length > 0) {
          const [curR, curC] = queue.shift()!;
          pushStep({
            scan: null,
            current: [curR, curC],
            queue,
            action: 'queuePoll',
            message: `从队首弹出单元格 (${curR}, ${curC})，探险家立足此格，向四周波浪式扫描。`,
            log: `  出队探索: (${curR}, ${curC})，剩余队列: ${queue.length}`,
            codeLine: BFS_LINES.dequeue,
            adventurer: { r: curR, c: curC, state: 'walking', isHopping: true },
          });

          for (const [dr, dc] of dirs) {
            const nr = curR + dr;
            const nc = curC + dc;
            if (nr >= 0 && nr < m && nc >= 0 && nc < n && states[nr][nc] === 'land') {
              pushStep({
                scan: [nr, nc],
                current: [curR, curC],
                queue,
                action: 'checkNeighbor',
                message: `探测四邻：发现相邻陆地 (${nr}, ${nc})。`,
                log: `    发现相连陆地 (${nr}, ${nc})`,
                codeLine: BFS_LINES.checkNeighbor,
                adventurer: { r: curR, c: curC, state: 'walking' },
              });

              states[nr][nc] = 'visited';
              visitedLand++;
              pushStep({
                scan: [nr, nc],
                current: [curR, curC],
                queue,
                action: 'markNeighbor',
                message: `即时沉岛：将相邻陆地 (${nr}, ${nc}) 染色沉没。`,
                log: `    沉没陆地 (${nr}, ${nc})`,
                codeLine: BFS_LINES.markNeighbor,
                adventurer: { r: nr, c: nc, state: 'swimming' },
              });

              queue.push([nr, nc]);
              pushStep({
                scan: [nr, nc],
                current: [curR, curC],
                queue,
                action: 'pushNeighbor',
                message: `将 (${nr}, ${nc}) 加入 BFS 队列波前。队列更新为 ${queue.length} 个元素。`,
                log: `    入队: (${nr}, ${nc})`,
                codeLine: BFS_LINES.pushNeighbor,
                adventurer: { r: nr, c: nc, state: 'walking' },
              });
            }
          }
        }
      } else {
        pushStep({
          scan: [r, c],
          current: null,
          action: 'scan',
          message: `扫描格 (${r}, ${c})：${states[r][c] === 'water' ? '水域 (0)' : '已沉没陆地'}，跳过。`,
          log: `扫描 (${r}, ${c}): ${states[r][c]}`,
          codeLine: BFS_LINES.scan,
          adventurer: { r, c, state: 'scanning' },
        });
      }
    }
  }

  pushStep({
    action: 'done',
    current: null,
    scan: null,
    message: `🎉 BFS 队列波浪探索完成！共发现 ${count} 座独立岛屿，共计访问 ${visitedLand} 格陆地。`,
    log: `✓ BFS 探索完毕，岛屿总数 = ${count}`,
    codeLine: BFS_LINES.done,
    adventurer: { r: m - 1, c: n - 1, state: 'success', isFinish: true },
  });

  return steps;
}

/** Stage 3: 并查集 Union-Find 连通性 */
export function buildIslandsUfSteps(grid: number[][]): IslandsStep[] {
  const steps: IslandsStep[] = [];
  const m = grid.length;
  if (m === 0) return steps;
  const n = grid[0].length;
  const states: CellState[][] = grid.map((row) => row.map((v) => (v === 1 ? 'land' : 'water')));

  // 初始化并查集
  const parent: number[] = [];
  let count = 0;
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      const id = r * n + c;
      parent[id] = id;
      if (grid[r][c] === 1) count++;
    }
  }

  const find = (i: number): number => {
    let root = i;
    while (root !== parent[root]) root = parent[root];
    let curr = i;
    while (curr !== root) {
      const nxt = parent[curr];
      parent[curr] = root;
      curr = nxt;
    }
    return root;
  };

  const union = (x: number, y: number): boolean => {
    const rx = find(x);
    const ry = find(y);
    if (rx !== ry) {
      parent[rx] = ry;
      count--;
      return true;
    }
    return false;
  };

  const pushStep = (extra: Partial<IslandsStep> & { codeLine: number }): void => {
    steps.push({
      grid,
      states: snapshotGrid2D(states),
      current: extra.current ?? null,
      scan: extra.scan ?? null,
      count,
      visitedLand: 0,
      action: extra.action ?? 'scan',
      stage: 'Stage 3: 并查集 Union-Find',
      message: extra.message ?? '',
      log: extra.log ?? '',
      codeLine: extra.codeLine,
      adventurer: extra.adventurer ?? null,
    });
  };

  pushStep({
    action: 'init',
    message: `初始化并查集，每个陆地单元格自成集合。初始陆地总数 = ${count}。`,
    log: `初始化并查集，独立集合数 = ${count}`,
    codeLine: 4,
    adventurer: { r: 0, c: 0, state: 'scanning' },
  });

  const dirs = [[1, 0], [0, 1]];

  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      if (grid[r][c] === 1) {
        pushStep({
          scan: [r, c],
          current: [r, c],
          action: 'found',
          message: `检查陆地格 (${r}, ${c})，准备与向右、向下相邻的陆地进行集合合并。`,
          log: `检查陆地 (${r}, ${c}) 集合合并`,
          codeLine: 8,
          adventurer: { r, c, state: 'walking' },
        });

        for (const [dr, dc] of dirs) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr < m && nc < n && grid[nr][nc] === 1) {
            pushStep({
              scan: [nr, nc],
              current: [r, c],
              action: 'checkNeighbor',
              message: `探测到相邻陆地 (${nr}, ${nc})，进行并查集 union(${r * n + c}, ${nr * n + nc})。`,
              log: `  发现相邻陆地 (${nr}, ${nc})`,
              codeLine: 11,
              adventurer: { r, c, state: 'walking' },
            });

            const merged = union(r * n + c, nr * n + nc);
            if (merged) {
              pushStep({
                scan: [nr, nc],
                current: [r, c],
                action: 'union',
                message: `成功合并！集合连通分量计数递减，当前独立岛屿数 count = ${count}。`,
                log: `  union 成功: (${r}, ${c}) 与 (${nr}, ${nc}) 连通，集合数 -> ${count}`,
                codeLine: 12,
                adventurer: { r: nr, c: nc, state: 'success', isHopping: true },
              });
            }
          }
        }
      } else {
        pushStep({
          scan: [r, c],
          current: null,
          action: 'scan',
          message: `单元格 (${r}, ${c}) 为水域 (0)，跳过。`,
          log: `扫描 (${r}, ${c}): 水域`,
          codeLine: 7,
          adventurer: { r, c, state: 'scanning' },
        });
      }
    }
  }

  pushStep({
    action: 'done',
    current: null,
    scan: null,
    message: `🎉 并查集扫描完毕！最终独立连通集合数（岛屿总数） = ${count}。`,
    log: `✓ 并查集统计算法完成，岛屿总数 = ${count}`,
    codeLine: 18,
    adventurer: { r: m - 1, c: n - 1, state: 'success', isFinish: true },
  });

  return steps;
}

/** 统一分发器 */
export function createIslandsStageSteps(stageId: string, grid: number[][]): IslandsStep[] {
  let steps: IslandsStep[];
  if (stageId === 'stage-2') {
    steps = buildIslandsBfsSteps(grid);
  } else if (stageId === 'stage-3') {
    steps = buildIslandsUfSteps(grid);
  } else {
    steps = buildIslandsDfsSteps(grid);
  }
  return withIslandsMetrics(steps);
}

/** 兼容导出 */
export const buildIslandsSteps = buildIslandsDfsSteps;
export const buildIslandsBFSSteps = buildIslandsBfsSteps;

/** 附加监视器指标 */
export function withIslandsMetrics(steps: IslandsStep[]): IslandsStep[] {
  return steps.map((s) => {
    let formula = s.action;
    if (s.action === 'found') {
      formula = `发现新陆地: grid[${s.scan?.[0]}][${s.scan?.[1]}] == '1' -> count = ${s.count}`;
    } else if (s.action === 'mark' || s.action === 'markStart' || s.action === 'markNeighbor') {
      formula = `染色沉岛: grid[${s.current?.[0]}][${s.current?.[1]}] = '0'`;
    } else if (s.action === 'queuePoll') {
      formula = `队列出队: 当前队首 (${s.current?.[0]}, ${s.current?.[1]})`;
    } else if (s.action === 'union') {
      formula = `并查集合并: 集合总数递减至 ${s.count}`;
    } else if (s.action === 'done') {
      formula = `探索完成: 岛屿总数 = ${s.count}`;
    }

    return {
      ...s,
      metrics: {
        'metric-scan': s.scan ? `(${s.scan[0]}, ${s.scan[1]})` : '—',
        'metric-curr': s.current ? `(${s.current[0]}, ${s.current[1]})` : '—',
        'metric-queue-size': s.queue ? `${s.queue.length}` : '—',
        'metric-island-count': `${s.count}`,
        action: formula,
      },
    };
  });
}
