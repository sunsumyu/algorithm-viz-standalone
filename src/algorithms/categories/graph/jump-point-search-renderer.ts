/**
 * Jump Point Search (跳点搜索) 声明式可视化器
 * 核心：从 8-向 A* 对称性泛洪痛点一步一步升级到 JPS 自然邻居剪枝、强迫邻居识别与递归射线跳跃
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import { HighlightTarget } from '../../../core/code-panel';
import {
  JUMP_POINT_SEARCH_PROBLEM_HTML,
  JUMP_POINT_SEARCH_ANALYSIS_HTML,
  JUMP_POINT_SEARCH_CODE_LANGUAGES,
  JPS_CODE_LINES,
} from './jump-point-search-problem-content';

export type JpsStage = 'stage1_astar' | 'stage2_prune' | 'stage3_jump_ray' | 'stage4_jps_full';

export interface JpsRay {
  from: [number, number];
  to: [number, number];
  dir: [number, number];
}

export interface JpsStep extends StepBase {
  grid: number[][];
  start: [number, number];
  goal: [number, number];
  currentNode: [number, number] | null;
  stage: JpsStage;
  stageTitle: string;
  action:
    | 'init'
    | 'poll'
    | 'expand'
    | 'reach-goal'
    | 'prune-natural'
    | 'detect-forced'
    | 'ray-step'
    | 'found-jump-point'
    | 'done';
  rays: JpsRay[];
  jumpPoints: Array<[number, number]>;
  forcedNeighbors: Array<[number, number]>;
  naturalNeighbors: Array<[number, number]>;
  openSet: Array<[number, number]>;
  closedSet: Array<[number, number]>;
  finalPath: Array<[number, number]>;
  g: number;
  h: number;
  f: number;
  astarVisitedCount: number;
  jpsVisitedCount: number;
  statusText: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

// 预设地图定义 (0 为可通过空地，1 为障碍物)
export const JPS_PRESETS: Record<
  string,
  {
    name: string;
    grid: number[][];
    start: [number, number];
    goal: [number, number];
  }
> = {
  plain: {
    name: '开阔平原 (10×14)',
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    start: [1, 1],
    goal: [8, 12],
  },
  corner: {
    name: '经典拐角 (8×10)',
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    start: [1, 1],
    goal: [6, 8],
  },
  maze: {
    name: '迷宫障碍 (12×16)',
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0],
      [0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0],
      [0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0],
      [0, 1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0],
      [0, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    start: [0, 0],
    goal: [11, 15],
  },
};

/** 八角切比雪夫启发函数（适合 8-向移动） */
export function octileDistance(r1: number, c1: number, r2: number, c2: number): number {
  const dr = Math.abs(r1 - r2);
  const dc = Math.abs(c1 - c2);
  return (dr + dc) + (Math.SQRT2 - 2) * Math.min(dr, dc);
}

export function isWalkable(grid: number[][], r: number, c: number): boolean {
  return r >= 0 && r < grid.length && c >= 0 && c < grid[0].length && grid[r][c] === 0;
}

/** 8 个标准方向 */
const DIRS_8: Array<[number, number]> = [
  [-1, 0],  // 上
  [1, 0],   // 下
  [0, -1],  // 左
  [0, 1],   // 右
  [-1, -1], // 左上
  [-1, 1],  // 右上
  [1, -1],  // 左下
  [1, 1],   // 右下
];

/** 判断是否存在强迫邻居 (Forced Neighbor) */
export function hasForcedNeighbor(
  grid: number[][],
  r: number,
  c: number,
  dr: number,
  dc: number
): boolean {
  if (dr !== 0 && dc !== 0) {
    // 对角线移动 (dr, dc)
    // 检查横向阻挡造成拐角：(r - dr, c) 是障碍物且 (r - dr, c + dc) 可走
    if (!isWalkable(grid, r - dr, c) && isWalkable(grid, r - dr, c + dc)) return true;
    // 检查纵向阻挡造成拐角：(r, c - dc) 是障碍物且 (r + dr, c - dc) 可走
    if (!isWalkable(grid, r, c - dc) && isWalkable(grid, r + dr, c - dc)) return true;
  } else if (dr !== 0) {
    // 纵向直行 (dr, 0)
    // 检查左侧阻挡：(r, c - 1) 障碍且 (r + dr, c - 1) 可走
    if (!isWalkable(grid, r, c - 1) && isWalkable(grid, r + dr, c - 1)) return true;
    // 检查右侧阻挡：(r, c + 1) 障碍且 (r + dr, c + 1) 可走
    if (!isWalkable(grid, r, c + 1) && isWalkable(grid, r + dr, c + 1)) return true;
  } else if (dc !== 0) {
    // 横向直行 (0, dc)
    // 检查上方阻挡：(r - 1, c) 障碍且 (r - 1, c + dc) 可走
    if (!isWalkable(grid, r - 1, c) && isWalkable(grid, r - 1, c + dc)) return true;
    // 检查下方阻挡：(r + 1, c) 障碍且 (r + 1, c + dc) 可走
    if (!isWalkable(grid, r + 1, c) && isWalkable(grid, r + 1, c + dc)) return true;
  }
  return false;
}

/** 获取强迫邻居的具体坐标列表 */
export function getForcedNeighbors(
  grid: number[][],
  r: number,
  c: number,
  dr: number,
  dc: number
): Array<[number, number]> {
  const result: Array<[number, number]> = [];
  if (dr !== 0 && dc !== 0) {
    if (!isWalkable(grid, r - dr, c) && isWalkable(grid, r - dr, c + dc)) {
      result.push([r - dr, c + dc]);
    }
    if (!isWalkable(grid, r, c - dc) && isWalkable(grid, r + dr, c - dc)) {
      result.push([r + dr, c - dc]);
    }
  } else if (dr !== 0) {
    if (!isWalkable(grid, r, c - 1) && isWalkable(grid, r + dr, c - 1)) {
      result.push([r + dr, c - 1]);
    }
    if (!isWalkable(grid, r, c + 1) && isWalkable(grid, r + dr, c + 1)) {
      result.push([r + dr, c + 1]);
    }
  } else if (dc !== 0) {
    if (!isWalkable(grid, r - 1, c) && isWalkable(grid, r - 1, c + dc)) {
      result.push([r - 1, c + dc]);
    }
    if (!isWalkable(grid, r + 1, c) && isWalkable(grid, r + 1, c + dc)) {
      result.push([r + 1, c + dc]);
    }
  }
  return result;
}

/** 核心递归跳跃扫描函数 */
export function jump(
  grid: number[][],
  r: number,
  c: number,
  dr: number,
  dc: number,
  goal: [number, number]
): [number, number] | null {
  const nr = r + dr;
  const nc = c + dc;
  if (!isWalkable(grid, nr, nc)) return null;
  if (nr === goal[0] && nc === goal[1]) return [nr, nc];
  if (hasForcedNeighbor(grid, nr, nc, dr, dc)) return [nr, nc];

  // 对角线移动时，先水平和垂直分量探测
  if (dr !== 0 && dc !== 0) {
    if (jump(grid, nr, nc, dr, 0, goal) !== null) return [nr, nc];
    if (jump(grid, nr, nc, 0, dc, goal) !== null) return [nr, nc];
  }
  return jump(grid, nr, nc, dr, dc, goal);
}

/** 计算传统 A* 遍历的节点总数（作为对照基准） */
export function calculateAStarVisitedCount(
  grid: number[][],
  start: [number, number],
  goal: [number, number]
): number {
  interface Node {
    r: number;
    c: number;
    g: number;
    f: number;
  }
  const open: Node[] = [
    { r: start[0], c: start[1], g: 0, f: octileDistance(start[0], start[1], goal[0], goal[1]) },
  ];
  const closed = new Set<string>();
  const openMap = new Map<string, number>();
  openMap.set(`${start[0]},${start[1]}`, open[0].f);

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const cur = open.shift()!;
    openMap.delete(`${cur.r},${cur.c}`);
    closed.add(`${cur.r},${cur.c}`);
    if (cur.r === goal[0] && cur.c === goal[1]) break;

    for (const [dr, dc] of DIRS_8) {
      const nr = cur.r + dr;
      const nc = cur.c + dc;
      if (!isWalkable(grid, nr, nc)) continue;
      const key = `${nr},${nc}`;
      if (closed.has(key)) continue;

      const moveCost = dr !== 0 && dc !== 0 ? Math.SQRT2 : 1.0;
      const ng = cur.g + moveCost;
      const nf = ng + octileDistance(nr, nc, goal[0], goal[1]);

      const existingF = openMap.get(key);
      if (existingF === undefined || nf < existingF) {
        openMap.set(key, nf);
        open.push({ r: nr, c: nc, g: ng, f: nf });
      }
    }
  }
  return closed.size;
}

/** 模式 1: 纯粹独立的 JPS 跳点寻路（每一步完美匹配 JPS 代码） */
function buildPureJpsSteps(
  grid: number[][],
  start: [number, number],
  goal: [number, number],
  astarTotalVisited: number
): JpsStep[] {
  interface JpsNode {
    r: number;
    c: number;
    g: number;
    h: number;
    f: number;
    dr: number;
    dc: number;
    parent: JpsNode | null;
  }

  const steps: JpsStep[] = [];
  const openJps: JpsNode[] = [
    {
      r: start[0],
      c: start[1],
      g: 0,
      h: octileDistance(start[0], start[1], goal[0], goal[1]),
      f: octileDistance(start[0], start[1], goal[0], goal[1]),
      dr: 0,
      dc: 0,
      parent: null,
    },
  ];

  const visitedJps = new Map<string, number>();
  const allJumpPoints: Array<[number, number]> = [start];
  let reachedJpsGoal: JpsNode | null = null;

  steps.push({
    grid,
    start,
    goal,
    currentNode: start,
    stage: 'stage4_jps_full',
    stageTitle: 'JPS 跳点极速寻路',
    action: 'init',
    rays: [],
    jumpPoints: [start],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [[start[0], start[1]]],
    closedSet: [],
    finalPath: [],
    g: 0,
    h: Number(openJps[0].h.toFixed(2)),
    f: Number(openJps[0].f.toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: '【JPS 启动】优先队列仅入堆跳点，起点 (S) 初始化入堆。',
    log: `[JPS 初始化] 起点 (${start[0]}, ${start[1]}) 入堆。与传统 A* 逐格探索不同，JPS 沿途普通格子完全不入堆！`,
    codeLine: JPS_CODE_LINES.init,
  });

  let iter = 0;
  while (openJps.length > 0 && iter < 40) {
    iter++;
    openJps.sort((a, b) => a.f - b.f);
    const cur = openJps.shift()!;
    visitedJps.set(`${cur.r},${cur.c}`, cur.g);

    if (cur.r === goal[0] && cur.c === goal[1]) {
      reachedJpsGoal = cur;
      break;
    }

    let searchDirs = DIRS_8;
    if (cur.dr !== 0 || cur.dc !== 0) {
      searchDirs = [];
      if (cur.dr !== 0 && cur.dc !== 0) {
        searchDirs.push([cur.dr, cur.dc], [cur.dr, 0], [0, cur.dc]);
        if (!isWalkable(grid, cur.r - cur.dr, cur.c)) searchDirs.push([-cur.dr, cur.dc]);
        if (!isWalkable(grid, cur.r, cur.c - cur.dc)) searchDirs.push([cur.dr, -cur.dc]);
      } else if (cur.dr !== 0) {
        searchDirs.push([cur.dr, 0]);
        if (!isWalkable(grid, cur.r, cur.c - 1)) searchDirs.push([cur.dr, -1]);
        if (!isWalkable(grid, cur.r, cur.c + 1)) searchDirs.push([cur.dr, 1]);
      } else if (cur.dc !== 0) {
        searchDirs.push([0, cur.dc]);
        if (!isWalkable(grid, cur.r - 1, cur.c)) searchDirs.push([-1, cur.dc]);
        if (!isWalkable(grid, cur.r + 1, cur.c)) searchDirs.push([1, cur.dc]);
      }
    }

    const currentRays: JpsRay[] = [];
    for (const [dr, dc] of searchDirs) {
      const jp = jump(grid, cur.r, cur.c, dr, dc, goal);
      if (jp) {
        currentRays.push({ from: [cur.r, cur.c], to: jp, dir: [dr, dc] });
        const stepDist = octileDistance(cur.r, cur.c, jp[0], jp[1]);
        const ng = cur.g + stepDist;
        const key = `${jp[0]},${jp[1]}`;

        if (!visitedJps.has(key) || ng < visitedJps.get(key)!) {
          visitedJps.set(key, ng);
          allJumpPoints.push(jp);
          const nh = octileDistance(jp[0], jp[1], goal[0], goal[1]);
          openJps.push({
            r: jp[0],
            c: jp[1],
            g: ng,
            h: nh,
            f: ng + nh,
            dr,
            dc,
            parent: cur,
          });

          // 单步发射射线并捕获跳点
          const fn = getForcedNeighbors(grid, jp[0], jp[1], dr, dc);
          steps.push({
            grid,
            start,
            goal,
            currentNode: jp,
            stage: 'stage4_jps_full',
            stageTitle: 'JPS 跳点极速寻路',
            action: 'found-jump-point',
            rays: [{ from: [cur.r, cur.c], to: jp, dir: [dr, dc] }],
            jumpPoints: [...allJumpPoints],
            forcedNeighbors: fn,
            naturalNeighbors: [],
            openSet: openJps.map((n) => [n.r, n.c]),
            closedSet: Array.from(visitedJps.keys()).map((k) => k.split(',').map(Number) as [number, number]),
            finalPath: [],
            g: Number(ng.toFixed(2)),
            h: Number(nh.toFixed(2)),
            f: Number((ng + nh).toFixed(2)),
            astarVisitedCount: astarTotalVisited,
            jpsVisitedCount: allJumpPoints.length,
            statusText: `【捕获跳点】沿方向 (${dr}, ${dc}) 直插滑行，在 (${jp[0]}, ${jp[1]}) 锁定跳点 (JP)！`,
            log: `[射线跳跃] 从 (${cur.r}, ${cur.c}) 向 (${dr}, ${dc}) 发射光束，瞬移掠过所有空闲格，捕获跳点 (${jp[0]}, ${jp[1]}) 入堆。`,
            codeLine: dr !== 0 && dc !== 0 ? JPS_CODE_LINES.diagonalSubJump : JPS_CODE_LINES.checkForced,
          });
        }
      }
    }

    if (reachedJpsGoal) break;
  }

  // 终点路径回溯
  const fullPath: Array<[number, number]> = [];
  if (reachedJpsGoal) {
    let curr: JpsNode | null = reachedJpsGoal;
    const keyNodes: Array<[number, number]> = [];
    while (curr) {
      keyNodes.unshift([curr.r, curr.c]);
      curr = curr.parent;
    }

    for (let i = 0; i < keyNodes.length - 1; i++) {
      const [r1, c1] = keyNodes[i];
      const [r2, c2] = keyNodes[i + 1];
      let cr = r1;
      let cc = c1;
      const sdr = Math.sign(r2 - r1);
      const sdc = Math.sign(c2 - c1);
      while (cr !== r2 || cc !== c2) {
        fullPath.push([cr, cc]);
        cr += sdr;
        cc += sdc;
      }
    }
    fullPath.push(goal);
  }

  steps.push({
    grid,
    start,
    goal,
    currentNode: goal,
    stage: 'stage4_jps_full',
    stageTitle: 'JPS 跳点极速寻路',
    action: 'reach-goal',
    rays: [],
    jumpPoints: [...allJumpPoints],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [],
    closedSet: Array.from(visitedJps.keys()).map((k) => k.split(',').map(Number) as [number, number]),
    finalPath: fullPath.length > 0 ? fullPath : [start, goal],
    g: Number((reachedJpsGoal?.g || 0).toFixed(2)),
    h: 0,
    f: Number((reachedJpsGoal?.g || 0).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: allJumpPoints.length,
    statusText: `【JPS 到达终点！】仅探索 ${allJumpPoints.length} 个跳点（A* 需考察 ${astarTotalVisited} 个节点），效率飞跃！`,
    log: `[寻路完成] 100% 还原最优路径！JPS 探索跳点数 (${allJumpPoints.length}) 远少于 A* 节点数 (${astarTotalVisited})。`,
    codeLine: JPS_CODE_LINES.reachGoal,
  });

  return steps;
}

/** 模式 2: 纯 A* 逐格扩展对比演示 */
function buildPureAStarSteps(
  grid: number[][],
  start: [number, number],
  goal: [number, number]
): JpsStep[] {
  interface AStarNode {
    r: number;
    c: number;
    g: number;
    h: number;
    f: number;
    parent: AStarNode | null;
  }

  const steps: JpsStep[] = [];
  const openList: AStarNode[] = [
    {
      r: start[0],
      c: start[1],
      g: 0,
      h: octileDistance(start[0], start[1], goal[0], goal[1]),
      f: octileDistance(start[0], start[1], goal[0], goal[1]),
      parent: null,
    },
  ];
  const closedMap = new Map<string, number>();
  const openMap = new Map<string, number>();
  openMap.set(`${start[0]},${start[1]}`, openList[0].f);

  steps.push({
    grid,
    start,
    goal,
    currentNode: start,
    stage: 'stage1_astar',
    stageTitle: 'A* 逐格扩展对比模式',
    action: 'init',
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [[start[0], start[1]]],
    closedSet: [],
    finalPath: [],
    g: 0,
    h: openList[0].h,
    f: openList[0].f,
    astarVisitedCount: 1,
    jpsVisitedCount: 0,
    statusText: '【A* 初始化】起点入堆，开始 8-向逐格泛洪扩展。',
    log: `[A* 初始化] 起点 (${start[0]}, ${start[1]})，注意观察泛洪面积与 Open 堆膨胀。`,
    codeLine: JPS_CODE_LINES.init,
  });

  let reachedGoalNode: AStarNode | null = null;
  let count = 0;

  while (openList.length > 0 && count < 50) {
    count++;
    openList.sort((a, b) => a.f - b.f);
    const cur = openList.shift()!;
    openMap.delete(`${cur.r},${cur.c}`);
    closedMap.set(`${cur.r},${cur.c}`, cur.g);

    if (cur.r === goal[0] && cur.c === goal[1]) {
      reachedGoalNode = cur;
      break;
    }

    for (const [dr, dc] of DIRS_8) {
      const nr = cur.r + dr;
      const nc = cur.c + dc;
      if (!isWalkable(grid, nr, nc)) continue;
      const key = `${nr},${nc}`;
      if (closedMap.has(key)) continue;

      const moveCost = dr !== 0 && dc !== 0 ? Math.SQRT2 : 1.0;
      const ng = cur.g + moveCost;
      const nh = octileDistance(nr, nc, goal[0], goal[1]);
      const nf = ng + nh;

      const existingF = openMap.get(key);
      if (existingF === undefined || nf < existingF) {
        openMap.set(key, nf);
        openList.push({ r: nr, c: nc, g: ng, h: nh, f: nf, parent: cur });
      }
    }

    if (count % 2 === 0 || openList.length === 0) {
      steps.push({
        grid,
        start,
        goal,
        currentNode: [cur.r, cur.c],
        stage: 'stage1_astar',
        stageTitle: 'A* 逐格扩展对比模式',
        action: 'poll',
        rays: [],
        jumpPoints: [],
        forcedNeighbors: [],
        naturalNeighbors: [],
        openSet: Array.from(openMap.keys()).map((k) => k.split(',').map(Number) as [number, number]),
        closedSet: Array.from(closedMap.keys()).map((k) => k.split(',').map(Number) as [number, number]),
        finalPath: [],
        g: Number(cur.g.toFixed(2)),
        h: Number(cur.h.toFixed(2)),
        f: Number(cur.f.toFixed(2)),
        astarVisitedCount: closedMap.size,
        jpsVisitedCount: 0,
        statusText: `【A* 泛洪扩展】出堆 (${cur.r}, ${cur.c})，已扩展 ${closedMap.size} 个节点，Open 堆规模 ${openMap.size}。`,
        log: `[A* 扩展] 节点 (${cur.r}, ${cur.c}) 出堆，大量等价对称路径被同时加入优先队列。`,
        codeLine: JPS_CODE_LINES.poll,
      });
    }
  }

  const astarPath: Array<[number, number]> = [];
  let trace: AStarNode | null = reachedGoalNode || openList[0] || null;
  while (trace) {
    astarPath.unshift([trace.r, trace.c]);
    trace = trace.parent;
  }

  steps.push({
    grid,
    start,
    goal,
    currentNode: goal,
    stage: 'stage1_astar',
    stageTitle: 'A* 逐格扩展对比模式',
    action: 'reach-goal',
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: Array.from(openMap.keys()).map((k) => k.split(',').map(Number) as [number, number]),
    closedSet: Array.from(closedMap.keys()).map((k) => k.split(',').map(Number) as [number, number]),
    finalPath: astarPath,
    g: Number((reachedGoalNode?.g || 0).toFixed(2)),
    h: 0,
    f: Number((reachedGoalNode?.g || 0).toFixed(2)),
    astarVisitedCount: closedMap.size,
    jpsVisitedCount: 0,
    statusText: `【A* 寻路完成】累计遍历扩展了 ${closedMap.size} 个节点（切换至 JPS 模式查看优化效果）。`,
    log: `[A* 结果] 最优路径完成，但扩展了 ${closedMap.size} 个节点。请切换至「JPS 跳点极速寻路」查看数十倍的性能压缩！`,
    codeLine: JPS_CODE_LINES.reachGoal,
  });

  return steps;
}

/** 模式 3: 剪枝与强迫邻居原理微观拆解 */
function buildPruningSteps(
  grid: number[][],
  start: [number, number],
  goal: [number, number],
  astarTotalVisited: number
): JpsStep[] {
  const steps: JpsStep[] = [];
  let testR = start[0] + 1;
  let testC = start[1] + 1;
  if (grid.length === 8 && grid[0].length === 10) {
    testR = 2;
    testC = 1;
  }

  const dr = 1, dc = 0;
  const fnList = getForcedNeighbors(grid, testR, testC, dr, dc);
  const naturalList: Array<[number, number]> = [[testR + dr, testC + dc]];

  steps.push({
    grid,
    start,
    goal,
    currentNode: [testR, testC],
    stage: 'stage2_prune',
    stageTitle: '剪枝与强迫邻居原理拆解',
    action: 'prune-natural',
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: naturalList,
    openSet: [],
    closedSet: [],
    finalPath: [],
    g: 2.0,
    h: Number(octileDistance(testR, testC, goal[0], goal[1]).toFixed(2)),
    f: Number((2.0 + octileDistance(testR, testC, goal[0], goal[1])).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【自然邻居剪枝】从父节点向 (${testR}, ${testC}) 直行，只有正前方是自然邻居。`,
    log: `[自然邻居剪枝] 直线移动时，经父节点直接走侧向更优或等价，其余方向全被剪除！唯有绿色标出的正前方属于自然邻居。`,
    codeLine: JPS_CODE_LINES.expandSuccessors,
  });

  steps.push({
    grid,
    start,
    goal,
    currentNode: [testR, testC],
    stage: 'stage2_prune',
    stageTitle: '剪枝与强迫邻居原理拆解',
    action: 'detect-forced',
    rays: [],
    jumpPoints: fnList.length > 0 ? [[testR, testC]] : [],
    forcedNeighbors: fnList,
    naturalNeighbors: naturalList,
    openSet: [],
    closedSet: [],
    finalPath: [],
    g: 2.0,
    h: Number(octileDistance(testR, testC, goal[0], goal[1]).toFixed(2)),
    f: Number((2.0 + octileDistance(testR, testC, goal[0], goal[1])).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: fnList.length > 0
      ? `【强迫邻居触发】障碍物切断了对称捷径！黄色节点成为强迫邻居 (FN)，当前点晋升为跳点 (JP)！`
      : `【无强迫邻居】周围无拐角阻挡，无需转向，可继续高速向前滑行。`,
    log: fnList.length > 0
      ? `[强迫邻居判定] 由于旁边紧邻障碍物，若想以最短路径到达邻居 (${fnList[0][0]}, ${fnList[0][1]})，必须借道当前节点中转！当前格被立为跳点 (JP)。`
      : `[无拐角] 该方向无障碍物产生强迫邻居，光束可直接穿透。`,
    codeLine: JPS_CODE_LINES.checkForced,
  });

  // 射线探测步骤
  steps.push({
    grid,
    start,
    goal,
    currentNode: [testR, testC],
    stage: 'stage3_jump_ray',
    stageTitle: '剪枝与强迫邻居原理拆解',
    action: 'ray-step',
    rays: [{ from: [testR, testC], to: [testR + dr, testC + dc], dir: [dr, dc] }],
    jumpPoints: [[testR, testC]],
    forcedNeighbors: fnList,
    naturalNeighbors: naturalList,
    openSet: [[testR, testC]],
    closedSet: [],
    finalPath: [],
    g: 2.0,
    h: Number(octileDistance(testR, testC, goal[0], goal[1]).toFixed(2)),
    f: Number((2.0 + octileDistance(testR, testC, goal[0], goal[1])).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: '【递归射线探测】跳点确立后，沿方向发射扫描光束寻找下一个跳点。',
    log: '[射线扫描] 只有在遇到终点或强迫邻居时才会立为跳点，中间格子完全无需进入优先队列。',
    codeLine: JPS_CODE_LINES.jumpRayStart,
  });

  return steps;
}

/** 顶层统一步骤调度入口 */
export function buildJumpPointSearchSteps(
  presetKey: string = 'corner',
  mode: string = 'jps'
): JpsStep[] {
  const preset = JPS_PRESETS[presetKey] || JPS_PRESETS.corner;
  const { grid, start, goal } = preset;
  const astarTotalVisited = calculateAStarVisitedCount(grid, start, goal);

  if (mode === 'astar') {
    return withMetrics(buildPureAStarSteps(grid, start, goal));
  }
  if (mode === 'pruning') {
    return withMetrics(buildPruningSteps(grid, start, goal, astarTotalVisited));
  }
  if (mode === 'journey' || mode === 'all') {
    const s1 = buildPureAStarSteps(grid, start, goal);
    const s2 = buildPruningSteps(grid, start, goal, astarTotalVisited);
    const s4 = buildPureJpsSteps(grid, start, goal, astarTotalVisited);
    return withMetrics([...s1, ...s2, ...s4]);
  }

  // 默认：纯粹独立的 JPS 跳点极速寻路
  return withMetrics(buildPureJpsSteps(grid, start, goal, astarTotalVisited));
}

/** 注入四卡片通用指标 */
export function withMetrics(steps: JpsStep[]): JpsStep[] {
  return steps.map((s, idx) => {
    const savings =
      s.astarVisitedCount > 0 && s.jpsVisitedCount > 0
        ? Math.max(0, Math.round(((s.astarVisitedCount - s.jpsVisitedCount) / s.astarVisitedCount) * 100))
        : 0;

    const stageMap: Record<JpsStage, string> = {
      stage1_astar: 'Stage 1: A* 泛洪',
      stage2_prune: 'Stage 2: 邻居剪枝',
      stage3_jump_ray: 'Stage 3: 射线探测',
      stage4_jps_full: 'Stage 4: JPS 实战',
    };

    return {
      ...s,
      stepNumber: idx + 1,
      totalSteps: steps.length,
      metrics: {
        'metric-jps-stage': stageMap[s.stage] || 'JPS',
        'metric-jps-cur': s.currentNode ? `(${s.currentNode[0]}, ${s.currentNode[1]})` : '无',
        'metric-jps-open': s.openSet.length,
        'metric-jps-visited': `${s.stage.includes('astar') ? s.astarVisitedCount : s.jpsVisitedCount} 节点`,
        'metric-jps-saved': savings > 0 ? `⚡ 节约 ${savings}%` : '基准对照',
      },
    };
  });
}

/** 渲染沙盘主画布 */
export function renderJumpPointSearchCanvas(container: HTMLElement, step: JpsStep): void {
  const { grid, start, goal, currentNode, finalPath, openSet, closedSet, jumpPoints, forcedNeighbors, naturalNeighbors, rays } = step;
  const m = grid.length;
  const n = grid[0].length;

  const pathMap = new Set(finalPath.map(([r, c]) => `${r},${c}`));
  const openMap = new Set(openSet.map(([r, c]) => `${r},${c}`));
  const closedMap = new Set(closedSet.map(([r, c]) => `${r},${c}`));
  const jpMap = new Set(jumpPoints.map(([r, c]) => `${r},${c}`));
  const fnMap = new Set(forcedNeighbors.map(([r, c]) => `${r},${c}`));
  const nnMap = new Set(naturalNeighbors.map(([r, c]) => `${r},${c}`));

  // 展开光束射线经过的路径
  const rayMap = new Set<string>();
  for (const ray of rays || []) {
    let cr = ray.from[0];
    let cc = ray.from[1];
    const sdr = Math.sign(ray.to[0] - ray.from[0]);
    const sdc = Math.sign(ray.to[1] - ray.from[1]);
    while (cr !== ray.to[0] || cc !== ray.to[1]) {
      rayMap.add(`${cr},${cc}`);
      cr += sdr;
      cc += sdc;
    }
    rayMap.add(`${ray.to[0]},${ray.to[1]}`);
  }

  const cellSize = Math.min(36, Math.max(22, Math.floor(380 / Math.max(m, n))));
  const fontSize = cellSize >= 30 ? 11 : 9;

  const cellBase = `width: ${cellSize}px; height: ${cellSize}px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: ${fontSize}px; font-weight: 800; border: 1.5px solid transparent; box-sizing: border-box; transition: all 0.15s ease;`;

  let cellsHtml = '';
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      const key = `${r},${c}`;
      const isStart = start[0] === r && start[1] === c;
      const isGoal = goal[0] === r && goal[1] === c;
      const isWall = grid[r][c] === 1;
      const isCurrent = currentNode && currentNode[0] === r && currentNode[1] === c;
      const isPath = pathMap.has(key);
      const isJp = jpMap.has(key);
      const isFn = fnMap.has(key);
      const isNn = nnMap.has(key);
      const isRay = rayMap.has(key);
      const isOpen = openMap.has(key);
      const isClosed = closedMap.has(key);

      let style = cellBase;
      let label = '';

      if (isStart) {
        style += 'background: #dbeafe; color: #1d4ed8; border-color: #3b82f6; box-shadow: 0 0 6px rgba(59,130,246,0.3);';
        label = 'S';
      } else if (isGoal) {
        style += 'background: #dcfce7; color: #15803d; border-color: #22c55e; box-shadow: 0 0 6px rgba(34,197,94,0.3);';
        label = 'G';
      } else if (isWall) {
        style += 'background: #1e293b; color: #64748b; border-color: #334155;';
        label = '■';
      } else if (isPath) {
        style += 'background: #10b981; color: #ffffff; border-color: #059669; font-weight: 900;';
        label = '★';
      } else if (isFn) {
        style += 'background: #fef3c7; color: #b45309; border-color: #f59e0b; font-weight: 900;';
        label = 'FN';
      } else if (isJp) {
        style += 'background: #ede9fe; color: #6d28d9; border-color: #8b5cf6; box-shadow: 0 0 8px rgba(139,92,246,0.4); font-weight: 900;';
        label = 'JP';
      } else if (isNn) {
        style += 'background: #ccfbf1; color: #0f766e; border-color: #14b8a6;';
        label = 'NN';
      } else if (isRay) {
        style += 'background: #e0f2fe; color: #0284c7; border-color: #38bdf8;';
        label = '⚡';
      } else if (isOpen) {
        style += 'background: #fef9c3; color: #a16207; border-color: #ca8a04;';
        label = 'o';
      } else if (isClosed) {
        style += 'background: #f8fafc; color: #94a3b8; border-color: #e2e8f0;';
        label = '·';
      }

      if (isCurrent) {
        style += 'background: #fed7aa; color: #c2410c; border-color: #ea580c; transform: scale(1.08); box-shadow: 0 0 8px rgba(234, 88, 12, 0.4); z-index: 2;';
      }

      cellsHtml += `<div style="${style}"><span>${label}</span></div>`;
    }
  }

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 10px; box-sizing: border-box;">
      <div style="display: inline-grid; grid-template-columns: repeat(${n}, ${cellSize}px); gap: 4px; padding: 12px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; box-shadow: 0 2px 8px rgba(0,0,0,0.04); user-select: none;">
        ${cellsHtml}
      </div>
      <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 11px; font-weight: 600; color: #475569; text-align: center; max-width: 90%;">
        ${step.statusText}
      </div>
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #64748b;">
        f(n) = g(${step.g}) + h(${step.h}) = ${step.f}
      </div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'jump-point-search',
  name: '跳点搜索 (Jump Point Search, JPS)',
  category: 'graph',
  description: '跳过网格对称路径！结合自然邻居剪枝、强迫邻居与递归射线跳跃，相比传统 A* 实现节点访问数量级降低',
  icon: '⚡',
  difficulty: 3,
  levelOrder: 10,
  learningGoal: '掌握均匀网格对称剪枝原理、自然邻居与强迫邻居定义，以及水平/垂直/对角线复合跳跃机制',
  aliases: ['jps', 'jump-point-search-grid', 'a-star-jps'],
  inputs: [
    {
      id: 'preset',
      label: '地图预设',
      type: 'select',
      defaultValue: 'corner',
      options: [
        { label: '经典拐角 (8×10)', value: 'corner' },
        { label: '开阔平原 (10×14)', value: 'plain' },
        { label: '迷宫障碍 (12×16)', value: 'maze' },
      ],
    },
    {
      id: 'mode',
      label: '算法模式',
      type: 'select',
      defaultValue: 'jps',
      options: [
        { label: '⚡ JPS 跳点极速寻路 (推荐默认)', value: 'jps' },
        { label: '🧭 A* 逐格扩展对比', value: 'astar' },
        { label: '🔬 剪枝与强迫邻居原理拆解', value: 'pruning' },
        { label: '📚 四阶段连贯全景演进', value: 'journey' },
      ],
    },
  ],
  presets: [
    { label: '经典拐角 (8×10 JPS 极速寻路)', values: { preset: 'corner', mode: 'jps' } },
    { label: '开阔平原 (10×14 JPS 瞬移穿透)', values: { preset: 'plain', mode: 'jps' } },
    { label: '迷宫障碍 (12×16 JPS 复杂避障)', values: { preset: 'maze', mode: 'jps' } },
    { label: '经典拐角 (A* 逐格泛洪对比)', values: { preset: 'corner', mode: 'astar' } },
    { label: '强迫邻居微观原理拆解', values: { preset: 'corner', mode: 'pruning' } },
  ],
  metrics: [
    { id: 'metric-jps-stage', label: '演进阶段', color: '#8b5cf6' },
    { id: 'metric-jps-cur', label: '当前考察点', color: '#ea580c' },
    { id: 'metric-jps-open', label: 'Open 堆规模', color: '#ca8a04' },
    { id: 'metric-jps-visited', label: '访问/跳点数', color: '#3b82f6' },
    { id: 'metric-jps-saved', label: '性能优化率', color: '#10b981' },
  ],
  legend: [
    { label: '起点 S', state: 'comparing' },
    { label: '终点 G', state: 'sorted' },
    { label: '障碍物', color: '#1e293b' },
    { label: '跳点 (JP)', color: '#8b5cf6' },
    { label: '强迫邻居 (FN)', color: '#f59e0b' },
    { label: '自然邻居 (NN)', color: '#14b8a6' },
    { label: '跳跃射线', color: '#38bdf8' },
    { label: '最优路径', state: 'discovered' },
  ],
  codeLanguages: JUMP_POINT_SEARCH_CODE_LANGUAGES,
  problemHtml: JUMP_POINT_SEARCH_PROBLEM_HTML,
  analysisHtml: JUMP_POINT_SEARCH_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const presetKey = (inputs?.preset as string) || 'corner';
    const mode = (inputs?.mode as string) || 'jps';
    return buildJumpPointSearchSteps(presetKey, mode);
  },
  renderCanvas: (container, step) => renderJumpPointSearchCanvas(container, step as JpsStep),
});


