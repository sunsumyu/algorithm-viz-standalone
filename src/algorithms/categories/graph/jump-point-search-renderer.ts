/**
 * Jump Point Search (跳点搜索, JPS)
 *
 * 顶层声明式架构多阶段演化实现:
 * 阶段 1: 传统 8-向 A* 搜索 (基准对标，展示等价对称路径泛洪与堆膨胀)
 * 阶段 2: 自然邻居与强迫邻居剪枝 (核心突破，微观几何证明与拐角判定)
 * 阶段 3: 递归射线跳跃探测 (跳跃展开，直行穿透与对角线正交子探测)
 * 阶段 4: JPS 完整跳点搜索 (实战终局，大幅压缩优先队列，严谨欧几里得最优解)
 */

import { StepBase } from '../../../core/step-visualizer';
import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import {
  JUMP_POINT_SEARCH_PROBLEM_HTML,
  JUMP_POINT_SEARCH_ANALYSIS_HTML,
  STAGE1_ASTAR_CODE,
  STAGE1_LINES,
  STAGE2_PRUNING_CODE,
  STAGE2_LINES,
  STAGE3_RAY_CODE,
  STAGE3_LINES,
  STAGE4_JPS_CODE,
  STAGE4_LINES,
  JUMP_POINT_SEARCH_CODE_LANGUAGES,
  JPS_CODE_LINES,
} from './jump-point-search-problem-content';

export type JpsStage = 'stage1_astar' | 'stage2_prune' | 'stage3_jump_ray' | 'stage4_jps_full';

export interface JumpRay {
  from: [number, number];
  to: [number, number];
  dir: [number, number];
}

export interface JpsStep extends StepBase {
  grid: number[][]; // 0: 可通行, 1: 障碍物
  start: [number, number];
  goal: [number, number];
  currentNode: [number, number] | null;
  stage: JpsStage;
  stageTitle: string;
  action: string;
  rays: JumpRay[];
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
  codeLine?: number | number[] | Record<string, number | number[]>;
  stepNumber?: number;
  totalSteps?: number;
  metrics?: Record<string, string | number>;
  diagonalTrajectory?: { from: [number, number]; to: [number, number] };
  keyObstacle?: [number, number];
  showFinalPathSegments?: boolean;
  openListDetails?: JpsOpenListItem[];
}

export interface JpsOpenListItem {
  name: string;
  g: number;
  h: number;
  f: number;
  note: string;
}

// 8 个方向: 上、下、左、右、左上、右上、左下、右下
const DIRS_8: Array<[number, number]> = [
  [-1, 0], [1, 0], [0, -1], [0, 1],
  [-1, -1], [-1, 1], [1, -1], [1, 1],
];

export interface MapPreset {
  grid: number[][];
  start: [number, number];
  goal: [number, number];
}

export const JPS_PRESETS: Record<string, MapPreset> = {
  diagonal: {
    grid: [
      [0, 0, 0, 0, 1, 0, 0, 0], // 0: G 位于 (0,6), 墙壁 (0,4)
      [0, 0, 0, 0, 1, 0, 0, 0], // 1: 墙壁 (1,4)
      [0, 0, 0, 0, 1, 0, 0, 0], // 2: 墙壁 (2,4)
      [0, 0, 0, 0, 0, 1, 0, 0], // 3: 核心关键墙 (3,5)，强迫邻居位于 (3,6)
      [0, 1, 1, 0, 0, 0, 0, 0], // 4: 障碍 (4,1),(4,2), 枢纽 X(4,3), 墙缝 (4,4), 跳点 J(4,5)
      [0, 0, 0, 0, 1, 0, 0, 0], // 5: 墙壁 (5,4)
      [0, 0, 0, 0, 1, 0, 0, 0], // 6: 墙壁 (6,4)
      [0, 0, 0, 0, 1, 0, 0, 0], // 7: 起点 S(7,0), 墙壁 (7,4)
    ],
    start: [7, 0],
    goal: [0, 6],
  },
  corner: {
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 1, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 1, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    start: [1, 1],
    goal: [6, 8],
  },
  plain: {
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
  maze: {
    grid: [
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0],
      [0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0],
      [0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0],
      [0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 0],
      [0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0],
      [0, 0, 1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 0],
      [0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0],
      [0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
    start: [2, 3],
    goal: [6, 8],
  },
};

export function isWalkable(grid: number[][], r: number, c: number): boolean {
  return r >= 0 && r < grid.length && c >= 0 && c < grid[0].length && grid[r][c] === 0;
}

export function octileDistance(r1: number, c1: number, r2: number, c2: number): number {
  const dr = Math.abs(r1 - r2);
  const dc = Math.abs(c1 - c2);
  return (dr + dc) + (Math.SQRT2 - 2) * Math.min(dr, dc);
}

/** 判定强迫邻居 (Forced Neighbor) */
export function getForcedNeighbors(
  grid: number[][],
  r: number,
  c: number,
  dr: number,
  dc: number
): Array<[number, number]> {
  const forced: Array<[number, number]> = [];

  if (dr === 0 || dc === 0) {
    // 直行推进 (水平或垂直)
    const pr = dc;
    const pc = dr;
    // 侧翼 1 存在障碍物且其前方为空
    if (!isWalkable(grid, r + pr, c + pc) && isWalkable(grid, r + pr + dr, c + pc + dc)) {
      forced.push([r + pr + dr, c + pc + dc]);
    }
    // 侧翼 2 存在障碍物且其前方为空
    if (!isWalkable(grid, r - pr, c - pc) && isWalkable(grid, r - pr + dr, c - pc + dc)) {
      forced.push([r - pr + dr, c - pc + dc]);
    }
  } else {
    // 对角线推进
    if (!isWalkable(grid, r - dr, c) && isWalkable(grid, r - dr, c + dc)) {
      forced.push([r - dr, c + dc]);
    }
    if (!isWalkable(grid, r, c - dc) && isWalkable(grid, r + dr, c - dc)) {
      forced.push([r + dr, c - dc]);
    }
  }

  return forced;
}

export function hasForcedNeighbor(grid: number[][], r: number, c: number, dr: number, dc: number): boolean {
  return getForcedNeighbors(grid, r, c, dr, dc).length > 0;
}

/** 核心跳跃函数 (Jump Function) */
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

  // 对角线跳跃时，递归探测正交分量
  if (dr !== 0 && dc !== 0) {
    if (jump(grid, nr, nc, dr, 0, goal) !== null) return [nr, nc];
    if (jump(grid, nr, nc, 0, dc, goal) !== null) return [nr, nc];
  }

  return jump(grid, nr, nc, dr, dc, goal);
}

/** 计算标准 A* 在该网格上探索的节点总数（用于对照基准） */
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
  const open: Node[] = [{ r: start[0], c: start[1], g: 0, f: octileDistance(start[0], start[1], goal[0], goal[1]) }];
  const closed = new Set<string>();

  while (open.length > 0) {
    open.sort((a, b) => a.f - b.f);
    const cur = open.shift()!;
    const key = `${cur.r},${cur.c}`;
    if (closed.has(key)) continue;
    closed.add(key);

    if (cur.r === goal[0] && cur.c === goal[1]) break;

    for (const [dr, dc] of DIRS_8) {
      const nr = cur.r + dr;
      const nc = cur.c + dc;
      if (!isWalkable(grid, nr, nc)) continue;
      const nKey = `${nr},${nc}`;
      if (closed.has(nKey)) continue;

      const stepCost = dr !== 0 && dc !== 0 ? Math.SQRT2 : 1.0;
      const g = cur.g + stepCost;
      const f = g + octileDistance(nr, nc, goal[0], goal[1]);
      open.push({ r: nr, c: nc, g, f });
    }
  }

  return closed.size;
}

// ==========================================
// 阶段 1: 传统 8-向 A* 搜索步骤生成器
// ==========================================
export function buildStage1Steps(presetKey: string = 'corner'): JpsStep[] {
  const preset = JPS_PRESETS[presetKey] || JPS_PRESETS.corner;
  const { grid, start, goal } = preset;
  const steps: JpsStep[] = [];

  interface AStarNode {
    r: number;
    c: number;
    g: number;
    h: number;
    f: number;
    parent: AStarNode | null;
  }

  const startH = octileDistance(start[0], start[1], goal[0], goal[1]);
  const openList: AStarNode[] = [{
    r: start[0],
    c: start[1],
    g: 0,
    h: startH,
    f: startH,
    parent: null,
  }];
  const closedMap = new Map<string, number>();
  const openMap = new Map<string, number>();
  openMap.set(`${start[0]},${start[1]}`, openList[0].f);

  steps.push({
    grid,
    start,
    goal,
    currentNode: start,
    stage: 'stage1_astar',
    stageTitle: 'A* 逐格扩展对比',
    action: 'init',
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [[start[0], start[1]]],
    closedSet: [],
    finalPath: [],
    g: 0,
    h: Number(startH.toFixed(2)),
    f: Number(startH.toFixed(2)),
    astarVisitedCount: 1,
    jpsVisitedCount: 0,
    statusText: `【A* 初始化】起点 (${start[0]}, ${start[1]}) 入堆，开始 8-向逐格泛洪扩展。`,
    log: `[A* 初始化] 起点入堆，h = ${startH.toFixed(2)}。传统 A* 即将面临对称路径导致的海量冗余入堆。`,
    codeLine: STAGE1_LINES.init,
  });

  let reachedGoalNode: AStarNode | null = null;
  let count = 0;

  while (openList.length > 0 && count < 60) {
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

    steps.push({
      grid,
      start,
      goal,
      currentNode: [cur.r, cur.c],
      stage: 'stage1_astar',
      stageTitle: 'A* 逐格扩展对比',
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
      codeLine: STAGE1_LINES.poll,
    });
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
    stageTitle: 'A* 逐格扩展对比',
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
    statusText: `【A* 寻路完成】累计遍历扩展了 ${closedMap.size} 个节点。请切换阶段对比 JPS 极速跳跃！`,
    log: `[A* 终局] 找到最优路径，但遍历扩展了 ${closedMap.size} 个节点。点击顶栏【阶段 2】查看 JPS 对称性剪枝原理。`,
    codeLine: STAGE1_LINES.reachGoal,
  });

  return withMetrics(steps);
}

// ==========================================
// 阶段 2: 邻居对称性剪枝步骤生成器 (经典拐角对照)
// ==========================================
export function buildStage2CornerSteps(presetKey: string = 'corner'): JpsStep[] {
  const preset = JPS_PRESETS[presetKey] || JPS_PRESETS.corner;
  const { grid, start, goal } = preset;
  const astarTotalVisited = calculateAStarVisitedCount(grid, start, goal);
  const steps: JpsStep[] = [];

  // ==========================================
  // Part 1: 直行剪枝微观推导 (Straight Motion Pruning)
  // 选择位于 (sR, sC)，父节点 (sPr, sPc)，方向 (sDr, sDc)
  // ==========================================
  let sR = 2, sC = 1;
  let sPr = 1, sPc = 1;
  let sDr = 1, sDc = 0;
  if (!isWalkable(grid, sR, sC) || !isWalkable(grid, sPr, sPc)) {
    sPr = start[0];
    sPc = start[1];
    sR = start[0] + 1 < grid.length && isWalkable(grid, start[0] + 1, start[1]) ? start[0] + 1 : start[0];
    sC = start[1];
    sDr = Math.sign(sR - sPr);
    sDc = Math.sign(sC - sPc);
    if (sDr === 0 && sDc === 0) {
      sDr = 0;
      sDc = 1;
    }
  }

  // 正交侧向分量
  const sRx = sDc, sRy = sDr;
  // 侧翼 1
  const side1Obstacle = !isWalkable(grid, sR + sRx, sC + sRy);
  const side1Pass = isWalkable(grid, sR + sRx + sDr, sC + sRy + sDc);
  const hasFn1 = side1Obstacle && side1Pass;
  const fn1Coord: [number, number] = [sR + sRx + sDr, sC + sRy + sDc];

  // 侧翼 2
  const side2Obstacle = !isWalkable(grid, sR - sRx, sC - sRy);
  const side2Pass = isWalkable(grid, sR - sRx + sDr, sC - sRy + sDc);
  const hasFn2 = side2Obstacle && side2Pass;
  const fn2Coord: [number, number] = [sR - sRx + sDr, sC - sRy + sDc];

  const sNaturalCoord: [number, number] = [sR + sDr, sC + sDc];
  const sHasNatural = isWalkable(grid, sNaturalCoord[0], sNaturalCoord[1]);

  const sAccumulatedNatural: Array<[number, number]> = [];
  const sAccumulatedForced: Array<[number, number]> = [];

  const sG = 1.0;
  const sH = Number(octileDistance(sR, sC, goal[0], goal[1]).toFixed(2));
  const sF = Number((sG + sH).toFixed(2));

  // Step 1: 函数入口
  steps.push({
    grid,
    start,
    goal,
    currentNode: [sR, sC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'straight-fn-entry',
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [],
    closedSet: [[sPr, sPc]],
    finalPath: [],
    g: sG,
    h: sH,
    f: sF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【函数入口】开始对直行节点 (${sR}, ${sC}) 执行邻居剪枝推导，父节点为 (${sPr}, ${sPc})。`,
    log: `[函数调用] pruneNeighbors(grid, cur=[${sR}, ${sC}], parent=[${sPr}, ${sPc}]) 开始执行。`,
    codeLine: STAGE2_LINES.fnEntry,
  });

  // Step 2: 计算方向向量
  steps.push({
    grid,
    start,
    goal,
    currentNode: [sR, sC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'straight-calc-dir',
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [],
    closedSet: [[sPr, sPc]],
    finalPath: [],
    g: sG,
    h: sH,
    f: sF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【方向计算】推进方向向量 dx = ${sDr}, dy = ${sDc}，属于正交直线推进。`,
    log: `[方向向量] 计算向量：dx = ${sDr}, dy = ${sDc}。`,
    codeLine: STAGE2_LINES.calcDir,
  });

  // Step 3: 初始化列表
  steps.push({
    grid,
    start,
    goal,
    currentNode: [sR, sC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'straight-init-list',
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [],
    closedSet: [[sPr, sPc]],
    finalPath: [],
    g: sG,
    h: sH,
    f: sF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【初始化】初始化候选邻居集合 neighbors = []。`,
    log: `[列表初始化] List<int[]> neighbors = new ArrayList<>() 创建完成。`,
    codeLine: STAGE2_LINES.initList,
  });

  // Step 4: 直行分支判断
  steps.push({
    grid,
    start,
    goal,
    currentNode: [sR, sC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'straight-branch',
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [],
    closedSet: [[sPr, sPc]],
    finalPath: [],
    g: sG,
    h: sH,
    f: sF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【分支判定】dx === ${sDr}, dy === ${sDc}，满足 (dx == 0 || dy == 0)，进入直行剪枝分支！`,
    log: `[直行分支] 条件 (dx == 0 || dy == 0) 为 true，进入直行对称性剪枝规则。`,
    codeLine: STAGE2_LINES.straightBranch,
  });

  // Step 5: 正前自然邻居探测
  steps.push({
    grid,
    start,
    goal,
    currentNode: [sR, sC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'straight-natural-check',
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [],
    closedSet: [[sPr, sPc]],
    finalPath: [],
    g: sG,
    h: sH,
    f: sF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【正前探测】探测正前方向 (${sNaturalCoord[0]}, ${sNaturalCoord[1]}) 是否可通行：${sHasNatural ? '可通行' : '不可通行'}。`,
    log: `[正前检测] isWalkable(grid, ${sNaturalCoord[0]}, ${sNaturalCoord[1]}) => ${sHasNatural}。`,
    codeLine: STAGE2_LINES.straightNatural,
  });

  // Step 6: 加入正前自然邻居
  if (sHasNatural) {
    sAccumulatedNatural.push(sNaturalCoord);
  }
  steps.push({
    grid,
    start,
    goal,
    currentNode: [sR, sC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'prune-straight-natural',
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [...sAccumulatedNatural],
    openSet: [],
    closedSet: [[sPr, sPc]],
    finalPath: [],
    g: sG,
    h: sH,
    f: sF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: sHasNatural
      ? `【自然邻居确立】正前 (${sNaturalCoord[0]}, ${sNaturalCoord[1]}) 为唯一直行自然邻居 (NN)！几何证明其余 7 方向经父节点直达更优或等价，全部剪除！`
      : `【正前受阻】正前方为障碍物或边界，无可通行自然邻居。`,
    log: sHasNatural
      ? `[自然邻居 NN] neighbors.add([${sNaturalCoord[0]}, ${sNaturalCoord[1]}])。直线推进时仅正前为自然邻居，其余 7 个方向被剪除。`
      : `[正前阻断] 正前方无法通行。`,
    codeLine: STAGE2_LINES.straightNatural,
  });

  // Step 7: 计算侧向正交法向
  steps.push({
    grid,
    start,
    goal,
    currentNode: [sR, sC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'straight-orthogonal',
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [...sAccumulatedNatural],
    openSet: [],
    closedSet: [[sPr, sPc]],
    finalPath: [],
    g: sG,
    h: sH,
    f: sF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【正交法向】计算侧向正交分量 rx = ${sRx}, ry = ${sRy}，准备逐侧探测侧向障碍物与强迫邻居。`,
    log: `[正交法向] int rx = dy, ry = dx => rx=${sRx}, ry=${sRy}。`,
    codeLine: STAGE2_LINES.straightCheckSide,
  });

  // Step 8: 检查侧翼 1
  steps.push({
    grid,
    start,
    goal,
    currentNode: [sR, sC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'straight-side1-check',
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [...sAccumulatedNatural],
    openSet: [],
    closedSet: [[sPr, sPc]],
    finalPath: [],
    g: sG,
    h: sH,
    f: sF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【侧翼 1 检测】检查右侧翼 (${sR + sRx}, ${sC + sRy})：${side1Obstacle ? '存在障碍物阻挡' : '通畅无阻挡'}；其前方 (${fn1Coord[0]}, ${fn1Coord[1]})：${side1Pass ? '可行走空地' : '不可通行'}。`,
    log: `[侧翼 1] !isWalkable(side)=${side1Obstacle} && isWalkable(front)=${side1Pass} => ${hasFn1}。`,
    codeLine: STAGE2_LINES.straightCheckSide1,
  });

  // Step 9: 侧翼 1 强迫邻居判定与跳点晋升
  if (hasFn1) {
    sAccumulatedForced.push(fn1Coord);
  }
  steps.push({
    grid,
    start,
    goal,
    currentNode: [sR, sC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'detect-straight-forced',
    rays: [],
    jumpPoints: hasFn1 ? [[sR, sC]] : [],
    forcedNeighbors: [...sAccumulatedForced],
    naturalNeighbors: [...sAccumulatedNatural],
    openSet: [],
    closedSet: [[sPr, sPc]],
    finalPath: [],
    g: sG,
    h: sH,
    f: sF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: hasFn1
      ? `【侧翼 1 强迫邻居成立】侧翼障碍阻断了对称捷径！黄色节点 (${fn1Coord[0]}, ${fn1Coord[1]}) 必须借道当前格到达，确立为强迫邻居 (FN)，当前格成功晋升为跳点 (JP)！`
      : `【侧翼 1 无强迫邻居】侧翼无阻断或前方不可通行，未产生强迫邻居。`,
    log: hasFn1
      ? `[强迫邻居 FN] neighbors.add([${fn1Coord[0]}, ${fn1Coord[1]}])！障碍阻断绕行捷径，当前格晋升跳点。`
      : `[侧翼 1 通过] 未触发强迫邻居。`,
    codeLine: hasFn1 ? STAGE2_LINES.straightForced1 : STAGE2_LINES.straightCheckSide1,
  });

  // Step 10: 检查侧翼 2
  steps.push({
    grid,
    start,
    goal,
    currentNode: [sR, sC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'straight-side2-check',
    rays: [],
    jumpPoints: sAccumulatedForced.length > 0 ? [[sR, sC]] : [],
    forcedNeighbors: [...sAccumulatedForced],
    naturalNeighbors: [...sAccumulatedNatural],
    openSet: [],
    closedSet: [[sPr, sPc]],
    finalPath: [],
    g: sG,
    h: sH,
    f: sF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【侧翼 2 检测】检查左侧翼 (${sR - sRx}, ${sC - sRy})：${side2Obstacle ? '存在障碍物阻挡' : '通畅无阻挡'}；其前方 (${fn2Coord[0]}, ${fn2Coord[1]})：${side2Pass ? '可行走空地' : '不可通行'}。`,
    log: `[侧翼 2] !isWalkable(side)=${side2Obstacle} && isWalkable(front)=${side2Pass} => ${hasFn2}。`,
    codeLine: STAGE2_LINES.straightCheckSide2,
  });

  // Step 11: 侧翼 2 强迫邻居判定
  if (hasFn2) {
    sAccumulatedForced.push(fn2Coord);
  }
  steps.push({
    grid,
    start,
    goal,
    currentNode: [sR, sC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'straight-side2-forced',
    rays: [],
    jumpPoints: sAccumulatedForced.length > 0 ? [[sR, sC]] : [],
    forcedNeighbors: [...sAccumulatedForced],
    naturalNeighbors: [...sAccumulatedNatural],
    openSet: [],
    closedSet: [[sPr, sPc]],
    finalPath: [],
    g: sG,
    h: sH,
    f: sF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: hasFn2
      ? `【侧翼 2 强迫邻居成立】左侧翼障碍触发！黄色节点 (${fn2Coord[0]}, ${fn2Coord[1]}) 确立为强迫邻居 (FN)！`
      : `【侧翼 2 无强迫邻居】左侧翼未产生强迫邻居。`,
    log: hasFn2
      ? `[强迫邻居 FN] neighbors.add([${fn2Coord[0]}, ${fn2Coord[1]}])！`
      : `[侧翼 2 通过] 未触发强迫邻居。`,
    codeLine: hasFn2 ? STAGE2_LINES.straightForced2 : STAGE2_LINES.straightCheckSide2,
  });

  // Step 12: 直行剪枝结算与返回
  const sFinalNeighbors = [...sAccumulatedNatural, ...sAccumulatedForced];
  steps.push({
    grid,
    start,
    goal,
    currentNode: [sR, sC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'straight-return',
    rays: [],
    jumpPoints: sAccumulatedForced.length > 0 ? [[sR, sC]] : [],
    forcedNeighbors: [...sAccumulatedForced],
    naturalNeighbors: [...sAccumulatedNatural],
    openSet: [],
    closedSet: [[sPr, sPc]],
    finalPath: [],
    g: sG,
    h: sH,
    f: sF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【直行推导完成】原本 8 个候选方向剪除 ${8 - sFinalNeighbors.length} 个，仅返回 ${sFinalNeighbors.length} 个必要邻居！准备进入对角线推导。`,
    log: `[直行返回] return neighbors (共 ${sFinalNeighbors.length} 个元素)。`,
    codeLine: STAGE2_LINES.straightReturn,
  });

  // ==========================================
  // Part 2: 对角线剪枝微观推导 (Diagonal Motion Pruning)
  // 选择位于 (dR, dC)，父节点 (dPr, dPc)，方向 (dDr, dDc)
  // ==========================================
  let dPr = 3, dPc = 4;
  let dR = 4, dC = 5;
  let dDr = 1, dDc = 1;
  if (!isWalkable(grid, dR, dC) || !isWalkable(grid, dPr, dPc)) {
    dPr = start[0];
    dPc = start[1];
    dR = Math.min(grid.length - 1, start[0] + 1);
    dC = Math.min(grid[0].length - 1, start[1] + 1);
    if (!isWalkable(grid, dR, dC)) {
      dR = start[0];
      dC = start[1];
    }
    dDr = Math.sign(dR - dPr) || 1;
    dDc = Math.sign(dC - dPc) || 1;
  }

  // 自然邻居三方向
  const dNaturalH: [number, number] = [dR + dDr, dC];
  const dNaturalV: [number, number] = [dR, dC + dDc];
  const dNaturalDiag: [number, number] = [dR + dDr, dC + dDc];
  const isWalkH = isWalkable(grid, dNaturalH[0], dNaturalH[1]);
  const isWalkV = isWalkable(grid, dNaturalV[0], dNaturalV[1]);
  const isWalkDiag = isWalkable(grid, dNaturalDiag[0], dNaturalDiag[1]);

  // 拐角 1
  const corner1Obstacle = !isWalkable(grid, dR - dDr, dC);
  const corner1Pass = isWalkable(grid, dR - dDr, dC + dDc);
  const hasDiagFn1 = corner1Obstacle && corner1Pass;
  const diagFn1Coord: [number, number] = [dR - dDr, dC + dDc];

  // 拐角 2
  const corner2Obstacle = !isWalkable(grid, dR, dC - dDc);
  const corner2Pass = isWalkable(grid, dR + dDr, dC - dDc);
  const hasDiagFn2 = corner2Obstacle && corner2Pass;
  const diagFn2Coord: [number, number] = [dR + dDr, dC - dDc];

  const dAccumulatedNatural: Array<[number, number]> = [];
  const dAccumulatedForced: Array<[number, number]> = [];

  const dG = Number((Math.SQRT2 * 2).toFixed(2));
  const dH = Number(octileDistance(dR, dC, goal[0], goal[1]).toFixed(2));
  const dF = Number((dG + dH).toFixed(2));

  // Step 13: 函数入口 (对角线)
  steps.push({
    grid,
    start,
    goal,
    currentNode: [dR, dC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'diag-fn-entry',
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [],
    closedSet: [[dPr, dPc]],
    finalPath: [],
    g: dG,
    h: dH,
    f: dF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【函数入口】切换视角至对角线推进节点 (${dR}, ${dC})，父节点为 (${dPr}, ${dPc})。`,
    log: `[函数调用] pruneNeighbors(grid, cur=[${dR}, ${dC}], parent=[${dPr}, ${dPc}]) 启动。`,
    codeLine: STAGE2_LINES.fnEntry,
  });

  // Step 14: 计算对角方向向量
  steps.push({
    grid,
    start,
    goal,
    currentNode: [dR, dC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'diag-calc-dir',
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [],
    closedSet: [[dPr, dPc]],
    finalPath: [],
    g: dG,
    h: dH,
    f: dF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【方向计算】对角推进方向向量 dx = ${dDr}, dy = ${dDc}。`,
    log: `[方向向量] 计算向量：dx = ${dDr}, dy = ${dDc}。`,
    codeLine: STAGE2_LINES.calcDir,
  });

  // Step 15: 初始化列表 (对角)
  steps.push({
    grid,
    start,
    goal,
    currentNode: [dR, dC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'diag-init-list',
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [],
    closedSet: [[dPr, dPc]],
    finalPath: [],
    g: dG,
    h: dH,
    f: dF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【初始化】初始化对角候选邻居集合 neighbors = []。`,
    log: `[列表初始化] neighbors = new ArrayList<>()。`,
    codeLine: STAGE2_LINES.initList,
  });

  // Step 16: 对角分支判断 (else)
  steps.push({
    grid,
    start,
    goal,
    currentNode: [dR, dC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'diag-branch',
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [],
    closedSet: [[dPr, dPc]],
    finalPath: [],
    g: dG,
    h: dH,
    f: dF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【分支判定】dx === ${dDr} 且 dy === ${dDc} 均为非零，不满足直行条件，进入 else 对角线剪枝分支！`,
    log: `[对角分支] 条件 (dx == 0 || dy == 0) 为 false，进入 else 对角线规则。`,
    codeLine: STAGE2_LINES.diagonalBranch,
  });

  // Step 17: 自然邻居 1 (水平正交)
  if (isWalkH) {
    dAccumulatedNatural.push(dNaturalH);
  }
  steps.push({
    grid,
    start,
    goal,
    currentNode: [dR, dC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'diag-natural-h',
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [...dAccumulatedNatural],
    openSet: [],
    closedSet: [[dPr, dPc]],
    finalPath: [],
    g: dG,
    h: dH,
    f: dF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: isWalkH
      ? `【对角自然邻居 1】水平正交分量 (${dNaturalH[0]}, ${dNaturalH[1]}) 可通行，加入自然邻居列表。`
      : `【水平正交阻断】(${dNaturalH[0]}, ${dNaturalH[1]}) 不可通行。`,
    log: isWalkH
      ? `[自然邻居 NN] neighbors.add([${dNaturalH[0]}, ${dNaturalH[1]}]) (水平分量)。`
      : `[水平分量不可行] 跳过。`,
    codeLine: STAGE2_LINES.diagonalNaturalH,
  });

  // Step 18: 自然邻居 2 (垂直正交)
  if (isWalkV) {
    dAccumulatedNatural.push(dNaturalV);
  }
  steps.push({
    grid,
    start,
    goal,
    currentNode: [dR, dC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'diag-natural-v',
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [...dAccumulatedNatural],
    openSet: [],
    closedSet: [[dPr, dPc]],
    finalPath: [],
    g: dG,
    h: dH,
    f: dF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: isWalkV
      ? `【对角自然邻居 2】垂直正交分量 (${dNaturalV[0]}, ${dNaturalV[1]}) 可通行，加入自然邻居列表。`
      : `【垂直正交阻断】(${dNaturalV[0]}, ${dNaturalV[1]}) 不可通行。`,
    log: isWalkV
      ? `[自然邻居 NN] neighbors.add([${dNaturalV[0]}, ${dNaturalV[1]}]) (垂直分量)。`
      : `[垂直分量不可行] 跳过。`,
    codeLine: STAGE2_LINES.diagonalNaturalV,
  });

  // Step 19: 自然邻居 3 (正前对角)
  if (isWalkDiag) {
    dAccumulatedNatural.push(dNaturalDiag);
  }
  steps.push({
    grid,
    start,
    goal,
    currentNode: [dR, dC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'prune-diagonal-natural',
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [...dAccumulatedNatural],
    openSet: [],
    closedSet: [[dPr, dPc]],
    finalPath: [],
    g: dG,
    h: dH,
    f: dF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: isWalkDiag
      ? `【对角自然邻居 3】正前对角分量 (${dNaturalDiag[0]}, ${dNaturalDiag[1]}) 可通行，共确定 ${dAccumulatedNatural.length} 个自然邻居，其余 5 个方向安全剪除！`
      : `【正前对角受阻】(${dNaturalDiag[0]}, ${dNaturalDiag[1]}) 不可通行。`,
    log: isWalkDiag
      ? `[自然邻居 NN] neighbors.add([${dNaturalDiag[0]}, ${dNaturalDiag[1]}])。对角线天然保留 3 个自然邻居，其余 5 个方向被剪除。`
      : `[正前对角受阻] 跳过。`,
    codeLine: STAGE2_LINES.diagonalNaturalDiag,
  });

  // Step 20: 拐角障碍 1 检测
  steps.push({
    grid,
    start,
    goal,
    currentNode: [dR, dC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'diag-corner1-check',
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [...dAccumulatedNatural],
    openSet: [],
    closedSet: [[dPr, dPc]],
    finalPath: [],
    g: dG,
    h: dH,
    f: dF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【拐角障碍 1 检测】检测内侧节点 (${dR - dDr}, ${dC})：${corner1Obstacle ? '为障碍物阻断！' : '通畅无阻挡'}；其绕行侧前方 (${diagFn1Coord[0]}, ${diagFn1Coord[1]})：${corner1Pass ? '为空地' : '不可通行'}。`,
    log: `[拐角 1 检测] !isWalkable(${dR - dDr}, ${dC})=${corner1Obstacle} && isWalkable(${diagFn1Coord[0]}, ${diagFn1Coord[1]})=${corner1Pass} => ${hasDiagFn1}。`,
    codeLine: STAGE2_LINES.diagonalCheckCorner1,
  });

  // Step 21: 拐角 1 强迫邻居判定
  if (hasDiagFn1) {
    dAccumulatedForced.push(diagFn1Coord);
  }
  steps.push({
    grid,
    start,
    goal,
    currentNode: [dR, dC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'detect-diagonal-forced',
    rays: [],
    jumpPoints: hasDiagFn1 ? [[dR, dC]] : [],
    forcedNeighbors: [...dAccumulatedForced],
    naturalNeighbors: [...dAccumulatedNatural],
    openSet: [],
    closedSet: [[dPr, dPc]],
    finalPath: [],
    g: dG,
    h: dH,
    f: dF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: hasDiagFn1
      ? `【对角强迫邻居 1 成立】内侧拐角障碍阻断了对称捷径！黄色节点 (${diagFn1Coord[0]}, ${diagFn1Coord[1]}) 必须经由当前格到达，当前格晋升为跳点 (JP)！`
      : `【拐角 1 无强迫邻居】未触发拐角强迫邻居。`,
    log: hasDiagFn1
      ? `[强迫邻居 FN] neighbors.add([${diagFn1Coord[0]}, ${diagFn1Coord[1]}])！当前格晋升跳点 JP。`
      : `[拐角 1 通过] 未触发强迫邻居。`,
    codeLine: hasDiagFn1 ? STAGE2_LINES.diagonalForced1 : STAGE2_LINES.diagonalCheckCorner1,
  });

  // Step 22: 拐角障碍 2 检测
  steps.push({
    grid,
    start,
    goal,
    currentNode: [dR, dC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'diag-corner2-check',
    rays: [],
    jumpPoints: dAccumulatedForced.length > 0 ? [[dR, dC]] : [],
    forcedNeighbors: [...dAccumulatedForced],
    naturalNeighbors: [...dAccumulatedNatural],
    openSet: [],
    closedSet: [[dPr, dPc]],
    finalPath: [],
    g: dG,
    h: dH,
    f: dF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【拐角障碍 2 检测】检测另一内侧节点 (${dR}, ${dC - dDc})：${corner2Obstacle ? '为障碍物阻断！' : '通畅无阻挡'}；其绕行侧前方 (${diagFn2Coord[0]}, ${diagFn2Coord[1]})：${corner2Pass ? '为空地' : '不可通行'}。`,
    log: `[拐角 2 检测] !isWalkable(${dR}, ${dC - dDc})=${corner2Obstacle} && isWalkable(${diagFn2Coord[0]}, ${diagFn2Coord[1]})=${corner2Pass} => ${hasDiagFn2}。`,
    codeLine: STAGE2_LINES.diagonalCheckCorner2,
  });

  // Step 23: 拐角 2 强迫邻居判定
  if (hasDiagFn2) {
    dAccumulatedForced.push(diagFn2Coord);
  }
  steps.push({
    grid,
    start,
    goal,
    currentNode: [dR, dC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'diag-corner2-forced',
    rays: [],
    jumpPoints: dAccumulatedForced.length > 0 ? [[dR, dC]] : [],
    forcedNeighbors: [...dAccumulatedForced],
    naturalNeighbors: [...dAccumulatedNatural],
    openSet: [],
    closedSet: [[dPr, dPc]],
    finalPath: [],
    g: dG,
    h: dH,
    f: dF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: hasDiagFn2
      ? `【对角强迫邻居 2 成立】另一内侧拐角障碍阻断！黄色节点 (${diagFn2Coord[0]}, ${diagFn2Coord[1]}) 确立为强迫邻居 (FN)！`
      : `【拐角 2 无强迫邻居】未触发拐角强迫邻居。`,
    log: hasDiagFn2
      ? `[强迫邻居 FN] neighbors.add([${diagFn2Coord[0]}, ${diagFn2Coord[1]}])！`
      : `[拐角 2 通过] 未触发强迫邻居。`,
    codeLine: hasDiagFn2 ? STAGE2_LINES.diagonalForced2 : STAGE2_LINES.diagonalCheckCorner2,
  });

  // Step 24: 对角剪枝结算与返回
  const dFinalNeighbors = [...dAccumulatedNatural, ...dAccumulatedForced];
  steps.push({
    grid,
    start,
    goal,
    currentNode: [dR, dC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'diag-return',
    rays: [],
    jumpPoints: dAccumulatedForced.length > 0 ? [[dR, dC]] : [],
    forcedNeighbors: [...dAccumulatedForced],
    naturalNeighbors: [...dAccumulatedNatural],
    openSet: [],
    closedSet: [[dPr, dPc]],
    finalPath: [],
    g: dG,
    h: dH,
    f: dF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【对角推导完成】对角线 8 个候选方向剪除 ${8 - dFinalNeighbors.length} 个，返回精简邻居列表（共 ${dFinalNeighbors.length} 个）。`,
    log: `[对角返回] return neighbors (共 ${dFinalNeighbors.length} 个元素)。`,
    codeLine: STAGE2_LINES.returnNeighbors,
  });

  // Step 25: 剪枝总结与过渡至阶段 3
  steps.push({
    grid,
    start,
    goal,
    currentNode: [dR, dC],
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'prune-summary',
    rays: [],
    jumpPoints: dAccumulatedForced.length > 0 ? [[dR, dC]] : [],
    forcedNeighbors: [...dAccumulatedForced],
    naturalNeighbors: [...dAccumulatedNatural],
    openSet: [],
    closedSet: [[dPr, dPc]],
    finalPath: [],
    g: dG,
    h: dH,
    f: dF,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【阶段 2 总结】自然剪枝过滤了海量对称路径，只有遭遇拐角障碍物逼出强迫邻居时才生成跳点！点击顶栏【阶段 3 射线跳跃】查看射线如何高速穿透！`,
    log: `[剪枝总结] 邻居对称性剪枝推导完毕。进入阶段 3 查看光束射线如何高速穿透跳跃。`,
    codeLine: STAGE2_LINES.returnNeighbors,
  });

  return withMetrics(steps);
}

// ==========================================
// 阶段 2: 邻居对称性剪枝步骤生成器 (8×8 对角线原理精解)
// ==========================================
export function buildStage2DiagonalPrincipleSteps(): JpsStep[] {
  const preset = JPS_PRESETS.diagonal;
  const { grid, start, goal } = preset;
  const astarTotalVisited = calculateAStarVisitedCount(grid, start, goal);
  const steps: JpsStep[] = [];

  const dX: [number, number] = [4, 3];
  const dSlit: [number, number] = [4, 4];
  const dJ: [number, number] = [4, 5];
  const dWall: [number, number] = [3, 5];
  const dFN: [number, number] = [3, 6];

  // Step 1: 对角线自然剪枝演示 (在枢纽 X 处)
  steps.push({
    grid,
    start,
    goal,
    currentNode: dX,
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'prune-diagonal-natural',
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [dSlit, [3, 3], [3, 4]],
    openSet: [dX],
    closedSet: [start, [5, 2]],
    finalPath: [],
    g: 4.24,
    h: 5.0,
    f: 9.24,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: '【对角线自然剪枝：枢纽 X(3,3)】从 (2,2) 沿对角线进入 X(3,3)，推进方向为右上 (+1, +1)。8 个候选方向中仅保留 3 个自然邻居：正前对角 (4,4)、水平分量 (4,3 墙缝)、垂直分量 (3,4)！其余 5 个方向被几何证明完全对称，直接安全剪除！',
    log: '[对角自然剪枝] pruneNeighbors(cur=X(3,3), parent=(2,2)): dx=1, dy=1 进入 else 对角线分支，仅保留 3 个自然邻居，其余 5 方向剪除。',
    codeLine: STAGE2_LINES.diagonalBranch,
    openListDetails: [
      { name: 'X (3,3)', g: 4.24, h: 5.0, f: 9.24, note: '对角线推进考察点' },
    ],
  });

  // Step 2: 水平直行穿缝
  steps.push({
    grid,
    start,
    goal,
    currentNode: dSlit,
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'straight-branch',
    rays: [{ from: dX, to: dJ, dir: [0, 1] }],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [dX],
    closedSet: [start, [5, 2]],
    finalPath: [],
    g: 5.24,
    h: 4.5,
    f: 9.74,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: '【直行光束穿缝】雷达从 X(3,3) 沿水平向右推进，穿过隔离大墙唯一的狭窄缝隙 (4,3)，进入 J(5,3)！推进方向 dx=1, dy=0，满足 (dx == 0 || dy == 0)，进入直行剪枝规则。',
    log: '[直行穿缝] 水平光束穿透墙缝 (4,3)，推进向量 dx=1, dy=0，满足直行推进条件。',
    codeLine: STAGE2_LINES.straightBranch,
    openListDetails: [
      { name: 'X (3,3)', g: 4.24, h: 5.0, f: 9.24, note: '发射正交水平雷达' },
    ],
  });

  // Step 3: 直行确立唯一正前自然邻居 (6,3) [4, 6]
  steps.push({
    grid,
    start,
    goal,
    currentNode: dJ,
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'prune-straight-natural',
    rays: [{ from: dX, to: dJ, dir: [0, 1] }],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [[4, 6]],
    openSet: [dX],
    closedSet: [start, [5, 2]],
    finalPath: [],
    g: 6.24,
    h: 4.1,
    f: 10.34,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: '【直行唯一自然邻居】对于水平推进节点 J(5,3)，正前方 (6,3) 为唯一直行自然邻居 (NN)！若无拐角障碍物，其余 7 个方向全部被剪除，光束将无阻碍直穿。',
    log: '[自然邻居 NN] neighbors.add([6, 3])。直线推进仅正前方为自然邻居，其余 7 方向剪除。',
    codeLine: STAGE2_LINES.straightNatural,
    openListDetails: [
      { name: 'J (5,3)', g: 6.24, h: 4.1, f: 10.34, note: '水平探测抵达待判定点' },
    ],
  });

  // Step 4: 侧向障碍检测：发现上方隔离墙 (5,4) [3, 5]
  steps.push({
    grid,
    start,
    goal,
    currentNode: dJ,
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'detect-straight-forced',
    rays: [{ from: dX, to: dJ, dir: [0, 1] }],
    jumpPoints: [],
    forcedNeighbors: [],
    keyObstacle: dWall,
    naturalNeighbors: [[4, 6]],
    openSet: [dX],
    closedSet: [start, [5, 2]],
    finalPath: [],
    g: 6.24,
    h: 4.1,
    f: 10.34,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: '【侧翼障碍检测】正交检测上方 (5,4)：赫然出现黑色隔离墙！原本从父节点可以斜切绕行的对称捷径被彻底截断！',
    log: '[侧翼障碍] 检测上方 (5,4) 存在墙壁阻碍！!isWalkable(5, 4) = true，触发强迫邻居判定。',
    codeLine: STAGE2_LINES.straightCheckSide1,
    openListDetails: [
      { name: 'J (5,3)', g: 6.24, h: 4.1, f: 10.34, note: '上方发现隔离墙阻碍' },
    ],
  });

  // Step 5: 强迫邻居成立与跳点晋级：死角 (6,4) [3, 6] 确立，J(5,3) 晋级跳点
  steps.push({
    grid,
    start,
    goal,
    currentNode: dJ,
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'detect-straight-forced',
    rays: [{ from: dX, to: dJ, dir: [0, 1] }],
    jumpPoints: [dJ],
    forcedNeighbors: [dFN],
    keyObstacle: dWall,
    naturalNeighbors: [[4, 6]],
    openSet: [dX, dJ],
    closedSet: [start, [5, 2]],
    finalPath: [],
    g: 6.24,
    h: 4.1,
    f: 10.34,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 2,
    statusText: '【强迫邻居成立与跳点晋级】因上方墙壁阻断，死角 (6,4) 必须强制经由当前节点 J(5,3) 转弯才能以最短代价到达！(6,4) 确立为强迫邻居 (FN)，J(5,3) 成功晋升为关键跳点 (JP)！',
    log: '[强迫邻居 FN] neighbors.add([6, 4])！拐角障碍迫使 (6,4) 必须借道 J，J 成功晋升跳点！',
    codeLine: STAGE2_LINES.straightForced1,
    openListDetails: [
      { name: 'J (5,3)', g: 6.24, h: 4.1, f: 10.34, note: '★ 强迫邻居成立！晋升跳点' },
    ],
  });

  // Step 6: 跳点传导：X 升格为跳点，总结与过渡
  steps.push({
    grid,
    start,
    goal,
    currentNode: dX,
    stage: 'stage2_prune',
    stageTitle: '邻居对称性剪枝',
    action: 'detect-diagonal-forced',
    rays: [{ from: dX, to: dJ, dir: [0, 1] }],
    jumpPoints: [dX, dJ],
    forcedNeighbors: [dFN],
    keyObstacle: dWall,
    naturalNeighbors: [[4, 6]],
    openSet: [dX, dJ],
    closedSet: [start, [5, 2]],
    finalPath: [],
    g: 4.24,
    h: 5.0,
    f: 9.24,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 2,
    statusText: '【跳点传导：X 升格为跳点】J(5,3) 晋升跳点的信号瞬间传回对角线枢纽 X(3,3)。X 绝不能盲目朝右上继续撞墙，自身必须停下建档、升格为跳点！点击顶栏【阶段 3 射线跳跃】查看完整穿透动画！',
    log: '[阶段总结] 邻居对称性剪枝推导完毕：直行剪除 7 个方向，对角剪除 5 个方向；拐角障碍催生强迫邻居，精准锁定跳点！',
    codeLine: STAGE2_LINES.returnNeighbors,
    openListDetails: [
      { name: 'X (3,3)', g: 4.24, h: 5.0, f: 9.24, note: '★ 核心变道点！入队' },
      { name: 'J (5,3)', g: 6.24, h: 4.1, f: 10.34, note: '墙角通道跳点入队' },
    ],
  });

  return withMetrics(steps);
}

/** 阶段 2 统一步骤入口：支持 8×8 对角线侦察原理精解与 8×10 经典拐角对照 */
export function buildStage2Steps(presetKey: string = 'diagonal'): JpsStep[] {
  if (presetKey === 'diagonal') {
    return buildStage2DiagonalPrincipleSteps();
  }
  return buildStage2CornerSteps(presetKey);
}

// ==========================================
// 阶段 3: 对角线侦察原理精解 (8-Step Canonical Interactive Story)
// ==========================================
export function buildStage3DiagonalPrincipleSteps(): JpsStep[] {
  const preset = JPS_PRESETS.diagonal;
  const { grid, start, goal } = preset;
  const astarTotalVisited = calculateAStarVisitedCount(grid, start, goal);
  const steps: JpsStep[] = [];

  const hStart = Number(octileDistance(start[0], start[1], goal[0], goal[1]).toFixed(2));

  // Step 0: 任务初始化
  steps.push({
    grid,
    start,
    goal,
    currentNode: start,
    stage: 'stage3_jump_ray',
    stageTitle: '对角线侦察原理精解',
    action: 'init',
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [start],
    closedSet: [],
    finalPath: [],
    g: 0,
    h: hStart,
    f: hStart,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: '【初始全局视野】起点在左下角 S(0,0)，终点在右上深处的 G(6,7)！中间整排黑色隔离墙直挺挺走绝对过不去，必须寻找穿透或绕过墙壁的通道。',
    log: '[任务初始化] 寻找通往终点 G 的路径。起点入队，终点位于墙后的 G(6,7)。',
    codeLine: STAGE3_LINES.fnEntry,
    openListDetails: [
      { name: 'S (0,0)', g: 0, h: hStart, f: hStart, note: '起点入队，终点位于深处 G(6,7)' },
    ],
  });

  // Step 1: 对角线第 1 步 (1,1) -> [6, 1]
  const d1: [number, number] = [6, 1];
  const g1 = 1.41;
  const h1 = Number(octileDistance(d1[0], d1[1], goal[0], goal[1]).toFixed(2));
  steps.push({
    grid,
    start,
    goal,
    currentNode: d1,
    stage: 'stage3_jump_ray',
    stageTitle: '对角线侦察原理精解',
    action: 'diagonal-ray-step',
    diagonalTrajectory: { from: start, to: d1 },
    rays: [
      { from: d1, to: [6, 3], dir: [0, 1] },
      { from: d1, to: [5, 1], dir: [-1, 0] },
    ],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [],
    closedSet: [start],
    finalPath: [],
    g: g1,
    h: h1,
    f: Number((g1 + h1).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: '【对角线第 1 步：到达 (1,1)】侦察兵朝右上迈出一步，水平与垂直探查均未发现异常拐角，无跳点。保持惯性，继续斜冲！',
    log: '[对角线迈进] jump(grid, 1, 1, dx=1, dy=1)。水平与垂直探查未见跳点，继续对角推进。',
    codeLine: STAGE3_LINES.diagonalBranch,
    openListDetails: [
      { name: 'S (0,0)', g: 0, h: hStart, f: hStart, note: '已出队' },
    ],
  });

  // Step 2: 对角线第 2 步 (2,2) -> [5, 2]
  const d2: [number, number] = [5, 2];
  const g2 = 2.83;
  const h2 = Number(octileDistance(d2[0], d2[1], goal[0], goal[1]).toFixed(2));
  steps.push({
    grid,
    start,
    goal,
    currentNode: d2,
    stage: 'stage3_jump_ray',
    stageTitle: '对角线侦察原理精解',
    action: 'diagonal-ray-step',
    diagonalTrajectory: { from: start, to: d2 },
    rays: [
      { from: d2, to: [5, 3], dir: [0, 1] },
      { from: d2, to: [4, 2], dir: [-1, 0] },
    ],
    keyObstacle: [4, 2],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [],
    closedSet: [start],
    finalPath: [],
    g: g2,
    h: h2,
    f: Number((g2 + h2).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: '【对角线第 2 步：到达 (2,2)】垂直向上扫描撞上 (2,3) 障碍，水平正常，没有产生跳点的必要条件。继续对角线跳跃！',
    log: '[对角线迈进] 垂直向上扫描撞障返回 null，水平探查通畅，继续对角跳跃。',
    codeLine: STAGE3_LINES.checkWalkable,
    openListDetails: [
      { name: 'S (0,0)', g: 0, h: hStart, f: hStart, note: '已出队' },
    ],
  });

  // Step 3: 抵达关键分岔枢纽 X (3,3) -> [4, 3]
  const dX: [number, number] = [4, 3];
  const g3 = 4.24;
  const h3 = Number(octileDistance(dX[0], dX[1], goal[0], goal[1]).toFixed(2));
  steps.push({
    grid,
    start,
    goal,
    currentNode: dX,
    stage: 'stage3_jump_ray',
    stageTitle: '对角线侦察原理精解',
    action: 'diagonal-ray-step',
    diagonalTrajectory: { from: start, to: dX },
    rays: [],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [],
    closedSet: [start],
    finalPath: [],
    g: g3,
    h: h3,
    f: Number((g3 + h3).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: '【抵达关键分岔枢纽 X (3,3)】如果直接往 (4,4) 斜冲，前方就是连绵大黑墙！JPS 规定：在对角线每一步，必须向正右和正上发射射线侦查通道。',
    log: '[抵达节点 X] 抵达分岔枢纽 X(3,3)，前方是大黑墙，启动正交射线扫描。',
    codeLine: STAGE3_LINES.diagonalBranch,
    openListDetails: [
      { name: 'S (0,0)', g: 0, h: hStart, f: hStart, note: '已出队' },
    ],
  });

  // Step 4: X 射出横向侦察雷达穿过缝隙 -> J(5,3) [4, 5]
  const dJ: [number, number] = [4, 5];
  steps.push({
    grid,
    start,
    goal,
    currentNode: dX,
    stage: 'stage3_jump_ray',
    stageTitle: '对角线侦察原理精解',
    action: 'diagonal-sub-jump',
    diagonalTrajectory: { from: start, to: dX },
    rays: [
      { from: dX, to: dJ, dir: [0, 1] },
      { from: dX, to: [2, 3], dir: [-1, 0] },
    ],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [],
    closedSet: [start],
    finalPath: [],
    g: g3,
    h: h3,
    f: Number((g3 + h3).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: '【横向发现穿透墙壁的开口！】横向雷达穿过 (4,3) 这道墙缝，抵达了 (5,3)。此时右上方赫然出现了一堵墙 (5,4)！',
    log: '[横向侦查] jump(grid, 3, 3, dx=1, dy=0) 穿过墙缝抵达 J(5,3)。',
    codeLine: STAGE3_LINES.subJumpH,
    openListDetails: [
      { name: 'S (0,0)', g: 0, h: hStart, f: hStart, note: '已出队' },
    ],
  });

  // Step 5: 发现强制邻居 (6,4) [3, 6] —— 它是拐向终点 G 的咽喉！
  const dFN: [number, number] = [3, 6];
  const gJ = 6.24;
  const hJ = Number(octileDistance(dJ[0], dJ[1], goal[0], goal[1]).toFixed(2));
  steps.push({
    grid,
    start,
    goal,
    currentNode: dJ,
    stage: 'stage3_jump_ray',
    stageTitle: '对角线侦察原理精解',
    action: 'sub-jump-hit',
    diagonalTrajectory: { from: start, to: dX },
    rays: [
      { from: dX, to: dJ, dir: [0, 1] },
    ],
    jumpPoints: [dJ],
    forcedNeighbors: [dFN],
    keyObstacle: [3, 5],
    naturalNeighbors: [],
    openSet: [],
    closedSet: [start],
    finalPath: [],
    g: gJ,
    h: hJ,
    f: Number((gJ + hJ).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 2,
    statusText: '【发现强制邻居 (6,4) —— 它是拐向终点 G 的咽喉！】要想抵达墙后的 G，唯一的最短途径就是从 J(5,3) 贴着墙角拐进 (6,4) 这扇窄门！J 晋升为关键跳点！',
    log: '[强迫邻居触发] (6,4) 必须强行借道 J 转弯才能去往终点，(6,4) 为强制邻居，J 锁定为跳点！',
    codeLine: STAGE3_LINES.hitForced,
    openListDetails: [
      { name: 'S (0,0)', g: 0, h: hStart, f: hStart, note: '已出队' },
      { name: 'J (5,3)', g: 6.24, h: 4.1, f: 10.34, note: '发现强迫邻居(6,4)，候选跳点' },
    ],
  });

  // Step 6: X 升格为跳点！绝不能开过头！
  steps.push({
    grid,
    start,
    goal,
    currentNode: dX,
    stage: 'stage3_jump_ray',
    stageTitle: '对角线侦察原理精解',
    action: 'diagonal-hit-promotion',
    diagonalTrajectory: { from: start, to: dX },
    rays: [
      { from: dX, to: dJ, dir: [0, 1] },
    ],
    jumpPoints: [dX, dJ],
    forcedNeighbors: [dFN],
    keyObstacle: [3, 5],
    naturalNeighbors: [],
    openSet: [dX, dJ],
    closedSet: [start],
    finalPath: [],
    g: g3,
    h: h3,
    f: Number((g3 + h3).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 3,
    statusText: '【X 必须停下来建档（升格为跳点）】因为横向探测到了通往终点的大门 J，X(3,3) 绝对不能盲目继续往右上撞墙，必须把 X 设为跳点加入 OpenList！',
    log: '[立交桥分流道口] X(3,3) 升格为跳点加入 OpenList！从 S 过来的车，请在 X 准备向右转弯去 J！',
    codeLine: STAGE3_LINES.subJumpHitV,
    openListDetails: [
      { name: 'S (0,0)', g: 0, h: hStart, f: hStart, note: '已扩展' },
      { name: 'X (3,3)', g: 4.24, h: 5.0, f: 9.24, note: '★ 核心变道点！入队' },
      { name: 'J (5,3)', g: 6.24, h: 4.1, f: 10.34, note: '墙角通道跳点入队' },
    ],
  });

  // Step 7: 大功告成：从 J 穿过强制邻居直取终点 G！
  const gG = 10.48;
  steps.push({
    grid,
    start,
    goal,
    currentNode: goal,
    stage: 'stage3_jump_ray',
    stageTitle: '对角线侦察原理精解',
    action: 'reach-goal',
    diagonalTrajectory: { from: start, to: dX },
    rays: [],
    jumpPoints: [dX, dJ],
    forcedNeighbors: [dFN],
    keyObstacle: [3, 5],
    naturalNeighbors: [],
    openSet: [goal],
    closedSet: [start, dX, dJ, dFN],
    finalPath: [
      [7, 0], [6, 1], [5, 2], [4, 3],
      [4, 4], [4, 5],
      [3, 6], [2, 6], [1, 6], [0, 6],
    ],
    showFinalPathSegments: true,
    g: gG,
    h: 0,
    f: gG,
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 3,
    statusText: '【大功告成：从 J 穿过强制邻居直取终点 G！】全路径：S(0,0) ➔ X(3,3) ➔ J(5,3) ➔ 贴角穿过强制邻居通道 (6,4) ➔ 一路北上直达终点 G(6,7)！',
    log: '[终点达成] 若当初没有因为强制邻居而把 J 和 X 停下来立牌，整条去往终点 G 的最优捷径就会被彻底视而不见！',
    codeLine: STAGE3_LINES.jumpRecurse,
    openListDetails: [
      { name: 'G (6,7)', g: 10.48, h: 0, f: 10.48, note: '🎉 最终终点达成！完美避开所有黑墙' },
    ],
  });

  return withMetrics(steps);
}

// ==========================================
// 阶段 3: 拐角多步扫描对照步骤生成器
// ==========================================
export function buildStage3CornerSteps(presetKey: string = 'corner'): JpsStep[] {
  const preset = JPS_PRESETS[presetKey] || JPS_PRESETS.corner;
  const { grid, start, goal } = preset;
  const astarTotalVisited = calculateAStarVisitedCount(grid, start, goal);
  const steps: JpsStep[] = [];

  // ==========================================
  // Part 1: 水平直行光束穿透与平原遇障 (Straight Horizontal Ray: Penetration & Wall Hit)
  // 从起点 [1, 1] 沿水平方向 (0, 1) 发射光束向右滑行
  // ==========================================
  const hRayP0 = start;
  const hRayP1: [number, number] = [start[0], start[1] + 1];
  const hRayWall: [number, number] = [start[0], start[1] + 2];

  // 1. 直行射线发射
  steps.push({
    grid,
    start,
    goal,
    currentNode: hRayP0,
    stage: 'stage3_jump_ray',
    stageTitle: '递归射线跳跃探测',
    action: 'ray-straight-fire',
    rays: [{ from: hRayP0, to: hRayP1, dir: [0, 1] }],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [start],
    closedSet: [],
    finalPath: [],
    g: 0,
    h: Number(octileDistance(start[0], start[1], goal[0], goal[1]).toFixed(2)),
    f: Number(octileDistance(start[0], start[1], goal[0], goal[1]).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【直行光束发射】jump(grid, ${hRayP0[0]}, ${hRayP0[1]}, dx=0, dy=1, goal) 启动，计算 nx=${hRayP1[0]}, ny=${hRayP1[1]}。`,
    log: `[直行光束] jump(grid, x=${hRayP0[0]}, y=${hRayP0[1]}, dx=0, dy=1, goal) 启动，向前滑行。`,
    codeLine: STAGE3_LINES.jumpRayStart,
  });

  // 2. 检查通行性 isWalkable
  steps.push({
    grid,
    start,
    goal,
    currentNode: hRayP1,
    stage: 'stage3_jump_ray',
    stageTitle: '递归射线跳跃探测',
    action: 'ray-straight-check-walkable',
    rays: [{ from: hRayP0, to: hRayP1, dir: [0, 1] }],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [start],
    closedSet: [],
    finalPath: [],
    g: 1.0,
    h: Number(octileDistance(hRayP1[0], hRayP1[1], goal[0], goal[1]).toFixed(2)),
    f: Number((1.0 + octileDistance(hRayP1[0], hRayP1[1], goal[0], goal[1])).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【通行性核验】格子 (${hRayP1[0]}, ${hRayP1[1]}) 可正常通行，非边界且非障碍物。`,
    log: `[可通行] isWalkable(grid, ${hRayP1[0]}, ${hRayP1[1]}) 为 true。`,
    codeLine: STAGE3_LINES.checkWalkable,
  });

  // 3. 检查目标节点 nx == goal
  steps.push({
    grid,
    start,
    goal,
    currentNode: hRayP1,
    stage: 'stage3_jump_ray',
    stageTitle: '递归射线跳跃探测',
    action: 'ray-straight-check-goal',
    rays: [{ from: hRayP0, to: hRayP1, dir: [0, 1] }],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [start],
    closedSet: [],
    finalPath: [],
    g: 1.0,
    h: Number(octileDistance(hRayP1[0], hRayP1[1], goal[0], goal[1]).toFixed(2)),
    f: Number((1.0 + octileDistance(hRayP1[0], hRayP1[1], goal[0], goal[1])).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【目标核验】当前格 (${hRayP1[0]}, ${hRayP1[1]}) 非终点 (${goal[0]}, ${goal[1]})，继续核验强迫邻居。`,
    log: `[非终点] (nx == goal[0] && ny == goal[1]) 为 false。`,
    codeLine: STAGE3_LINES.checkGoal,
  });

  // 4. 检查强迫邻居 hasForcedNeighbor
  steps.push({
    grid,
    start,
    goal,
    currentNode: hRayP1,
    stage: 'stage3_jump_ray',
    stageTitle: '递归射线跳跃探测',
    action: 'ray-straight-step',
    rays: [{ from: hRayP0, to: hRayP1, dir: [0, 1] }],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [start],
    closedSet: [],
    finalPath: [],
    g: 1.0,
    h: Number(octileDistance(hRayP1[0], hRayP1[1], goal[0], goal[1]).toFixed(2)),
    f: Number((1.0 + octileDistance(hRayP1[0], hRayP1[1], goal[0], goal[1])).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【平原高速穿透】格子 (${hRayP1[0]}, ${hRayP1[1]}) 属于平原对称路径，无强迫邻居，零入堆直接递归向前滑行！`,
    log: `[零入堆穿透] hasForcedNeighbor 为 false，该格无需压入 Open 堆，直接调用自身递归向前。`,
    codeLine: STAGE3_LINES.checkForced,
  });

  // 5. 递归推进下一格
  steps.push({
    grid,
    start,
    goal,
    currentNode: hRayWall,
    stage: 'stage3_jump_ray',
    stageTitle: '递归射线跳跃探测',
    action: 'ray-straight-recurse',
    rays: [{ from: hRayP0, to: hRayWall, dir: [0, 1] }],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [start],
    closedSet: [],
    finalPath: [],
    g: 2.0,
    h: Number(octileDistance(hRayWall[0], hRayWall[1], goal[0], goal[1]).toFixed(2)),
    f: Number((2.0 + octileDistance(hRayWall[0], hRayWall[1], goal[0], goal[1])).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【光束递归滑行】jump(grid, ${hRayP1[0]}, ${hRayP1[1]}, dx=0, dy=1, goal) 推进至 (${hRayWall[0]}, ${hRayWall[1]})。`,
    log: `[递归调用] return jump(grid, nx, ny, dx, dy, goal) 递归滑行至 (${hRayWall[0]}, ${hRayWall[1]})。`,
    codeLine: STAGE3_LINES.jumpRecurse,
  });

  // 6. 撞墙/遇障返回 null
  steps.push({
    grid,
    start,
    goal,
    currentNode: hRayWall,
    stage: 'stage3_jump_ray',
    stageTitle: '递归射线跳跃探测',
    action: 'ray-straight-hit',
    rays: [{ from: hRayP0, to: hRayWall, dir: [0, 1] }],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [start],
    closedSet: [],
    finalPath: [],
    g: 2.0,
    h: Number(octileDistance(hRayWall[0], hRayWall[1], goal[0], goal[1]).toFixed(2)),
    f: Number((2.0 + octileDistance(hRayWall[0], hRayWall[1], goal[0], goal[1])).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【直行光束终止】前方 (${hRayWall[0]}, ${hRayWall[1]}) 遇到障碍物阻断，无法继续通行，返回 null，整个滑行过程零节点入堆！`,
    log: `[遇障返回 null] !isWalkable 为 true，光束撞墙终止，递归调用安全回退。`,
    codeLine: STAGE3_LINES.hitWall,
  });

  // ==========================================
  // Part 2: 垂直直行光束推进与强迫邻居截获 (Straight Vertical Ray: Forced Neighbor Detection)
  // 从起点 [1, 1] 向下 (1, 0) 发射光束
  // ==========================================
  const vRayP0 = start;
  const vRayP1: [number, number] = [start[0] + 1, start[1]];
  const vFnList = getForcedNeighbors(grid, vRayP1[0], vRayP1[1], 1, 0);

  // 7. 垂直光束发射
  steps.push({
    grid,
    start,
    goal,
    currentNode: vRayP0,
    stage: 'stage3_jump_ray',
    stageTitle: '递归射线跳跃探测',
    action: 'ray-vertical-fire',
    rays: [{ from: vRayP0, to: vRayP1, dir: [1, 0] }],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [start],
    closedSet: [],
    finalPath: [],
    g: 0,
    h: Number(octileDistance(vRayP0[0], vRayP0[1], goal[0], goal[1]).toFixed(2)),
    f: Number(octileDistance(vRayP0[0], vRayP0[1], goal[0], goal[1]).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【垂直光束发射】从 (${vRayP0[0]}, ${vRayP0[1]}) 沿垂直向量 (1, 0) 向下发射光束探测。`,
    log: `[垂直光束] jump(grid, x=${vRayP0[0]}, y=${vRayP0[1]}, dx=1, dy=0, goal) 向下推进。`,
    codeLine: STAGE3_LINES.jumpRayStart,
  });

  // 8. 垂直格子通行性检查
  steps.push({
    grid,
    start,
    goal,
    currentNode: vRayP1,
    stage: 'stage3_jump_ray',
    stageTitle: '递归射线跳跃探测',
    action: 'ray-vertical-walkable',
    rays: [{ from: vRayP0, to: vRayP1, dir: [1, 0] }],
    jumpPoints: [],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [start],
    closedSet: [],
    finalPath: [],
    g: 1.0,
    h: Number(octileDistance(vRayP1[0], vRayP1[1], goal[0], goal[1]).toFixed(2)),
    f: Number((1.0 + octileDistance(vRayP1[0], vRayP1[1], goal[0], goal[1])).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【垂直推进】光束前进至 (${vRayP1[0]}, ${vRayP1[1]})，格子可通行，非目标。`,
    log: `[垂直推进] isWalkable(${vRayP1[0]}, ${vRayP1[1]}) 为 true。`,
    codeLine: STAGE3_LINES.checkWalkable,
  });

  // 9. 强迫邻居核验
  steps.push({
    grid,
    start,
    goal,
    currentNode: vRayP1,
    stage: 'stage3_jump_ray',
    stageTitle: '递归射线跳跃探测',
    action: 'ray-vertical-check-forced',
    rays: [{ from: vRayP0, to: vRayP1, dir: [1, 0] }],
    jumpPoints: [],
    forcedNeighbors: vFnList,
    naturalNeighbors: [],
    openSet: [start],
    closedSet: [],
    finalPath: [],
    g: 1.0,
    h: Number(octileDistance(vRayP1[0], vRayP1[1], goal[0], goal[1]).toFixed(2)),
    f: Number((1.0 + octileDistance(vRayP1[0], vRayP1[1], goal[0], goal[1])).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【拐角检测】hasForcedNeighbor 检测到右侧 (${vRayP1[0]}, ${vRayP1[1] + 1}) 存在障碍物！`,
    log: `[强迫邻居检测] 侧翼正交法向发现障碍物，阻断了局部绕行对称路径。`,
    codeLine: STAGE3_LINES.checkForced,
  });

  // 10. 垂直跳点诞生并入堆
  steps.push({
    grid,
    start,
    goal,
    currentNode: vRayP1,
    stage: 'stage3_jump_ray',
    stageTitle: '递归射线跳跃探测',
    action: 'ray-vertical-hit-jp',
    rays: [{ from: vRayP0, to: vRayP1, dir: [1, 0] }],
    jumpPoints: [vRayP1],
    forcedNeighbors: vFnList,
    naturalNeighbors: [],
    openSet: [start, vRayP1],
    closedSet: [],
    finalPath: [],
    g: 1.0,
    h: Number(octileDistance(vRayP1[0], vRayP1[1], goal[0], goal[1]).toFixed(2)),
    f: Number((1.0 + octileDistance(vRayP1[0], vRayP1[1], goal[0], goal[1])).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 2,
    statusText: `【垂直跳点诞生】强迫邻居确立！垂直光束立即停步，返回关键跳点 JP (${vRayP1[0]}, ${vRayP1[1]})，正式压入 Open 堆！`,
    log: `[跳点确立] return new int[]{nx, ny}，返回坐标 (${vRayP1[0]}, ${vRayP1[1]})，锁定跳点。`,
    codeLine: STAGE3_LINES.hitForced,
  });

  // ==========================================
  // Part 3: 对角线复合跳跃与递归水平/垂直正交子探测 (Diagonal Ray & Recursive Orthogonal Probing)
  // 从 [2, 1] 沿对角 (1, 1) 发射光束
  // ==========================================
  const diagP0 = vRayP1;
  const diagP1: [number, number] = [vRayP1[0] + 1, vRayP1[1] + 1];
  const diagTarget = isWalkable(grid, diagP1[0], diagP1[1]) ? diagP1 : [vRayP1[0] + 1, vRayP1[1]];

  // 11. 对角复合跳跃启动
  steps.push({
    grid,
    start,
    goal,
    currentNode: diagP0,
    stage: 'stage3_jump_ray',
    stageTitle: '递归射线跳跃探测',
    action: 'diagonal-ray-start',
    rays: [{ from: diagP0, to: diagTarget as [number, number], dir: [1, 1] }],
    jumpPoints: [vRayP1],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [start, vRayP1],
    closedSet: [],
    finalPath: [],
    g: 1.0,
    h: Number(octileDistance(diagP0[0], diagP0[1], goal[0], goal[1]).toFixed(2)),
    f: Number((1.0 + octileDistance(diagP0[0], diagP0[1], goal[0], goal[1])).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 2,
    statusText: `【对角跳跃启动】从当前跳点 (${diagP0[0]}, ${diagP0[1]}) 沿对角向量 (1, 1) 向右下推进。`,
    log: `[对角线规则] jump(grid, x=${diagP0[0]}, y=${diagP0[1]}, dx=1, dy=1, goal) 启动。`,
    codeLine: STAGE3_LINES.jumpRayStart,
  });

  // 12. 对角步进一步至 (3, 2)
  steps.push({
    grid,
    start,
    goal,
    currentNode: diagTarget as [number, number],
    stage: 'stage3_jump_ray',
    stageTitle: '递归射线跳跃探测',
    action: 'diagonal-ray-step',
    rays: [{ from: diagP0, to: diagTarget as [number, number], dir: [1, 1] }],
    jumpPoints: [vRayP1],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [start, vRayP1],
    closedSet: [],
    finalPath: [],
    g: Number((1.0 + Math.SQRT2).toFixed(2)),
    h: Number(octileDistance(diagTarget[0], diagTarget[1], goal[0], goal[1]).toFixed(2)),
    f: Number((1.0 + Math.SQRT2 + octileDistance(diagTarget[0], diagTarget[1], goal[0], goal[1])).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 2,
    statusText: `【对角单步前进】光束推进至 (${diagTarget[0]}, ${diagTarget[1]})，可通行，非目标，无自身强迫邻居。`,
    log: `[对角推进] 推进至 (${diagTarget[0]}, ${diagTarget[1]})。`,
    codeLine: STAGE3_LINES.checkWalkable,
  });

  // 13. 对角分支启动正交子探测判定
  steps.push({
    grid,
    start,
    goal,
    currentNode: diagTarget as [number, number],
    stage: 'stage3_jump_ray',
    stageTitle: '递归射线跳跃探测',
    action: 'diagonal-branch-check',
    rays: [{ from: diagP0, to: diagTarget as [number, number], dir: [1, 1] }],
    jumpPoints: [vRayP1],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [start, vRayP1],
    closedSet: [],
    finalPath: [],
    g: Number((1.0 + Math.SQRT2).toFixed(2)),
    h: Number(octileDistance(diagTarget[0], diagTarget[1], goal[0], goal[1]).toFixed(2)),
    f: Number((1.0 + Math.SQRT2 + octileDistance(diagTarget[0], diagTarget[1], goal[0], goal[1])).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 2,
    statusText: `【正交子探测机制】依据规则 if (dx != 0 && dy != 0)，对角线前进每一步必须递归发起水平与垂直正交子探测！`,
    log: `[正交子探测触发] 对角移动时为防止漏判关键支路，必须先探测正交水平与垂直射线。`,
    codeLine: STAGE3_LINES.diagonalBranch,
  });

  // 14. 水平正交子探测发射
  const subHScanTo: [number, number] = [diagTarget[0] + 2 < grid.length ? diagTarget[0] + 2 : diagTarget[0], diagTarget[1]];
  steps.push({
    grid,
    start,
    goal,
    currentNode: diagTarget as [number, number],
    stage: 'stage3_jump_ray',
    stageTitle: '递归射线跳跃探测',
    action: 'diagonal-sub-jump',
    rays: [
      { from: diagP0, to: diagTarget as [number, number], dir: [1, 1] },
      { from: diagTarget as [number, number], to: subHScanTo, dir: [1, 0] },
    ],
    jumpPoints: [vRayP1],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [start, vRayP1],
    closedSet: [],
    finalPath: [],
    g: Number((1.0 + Math.SQRT2).toFixed(2)),
    h: Number(octileDistance(diagTarget[0], diagTarget[1], goal[0], goal[1]).toFixed(2)),
    f: Number((1.0 + Math.SQRT2 + octileDistance(diagTarget[0], diagTarget[1], goal[0], goal[1])).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 2,
    statusText: `【水平正交子探测】发射 jump(grid, x, y, dx=1, dy=0, goal) 向下探测平原。`,
    log: `[水平子探测] 发射子光束：jump(grid, ${diagTarget[0]}, ${diagTarget[1]}, 1, 0, goal)。`,
    codeLine: STAGE3_LINES.subJumpH,
  });

  // 15. 水平子探测未遇到跳点，返回 null
  steps.push({
    grid,
    start,
    goal,
    currentNode: diagTarget as [number, number],
    stage: 'stage3_jump_ray',
    stageTitle: '递归射线跳跃探测',
    action: 'sub-jump-h-null',
    rays: [
      { from: diagP0, to: diagTarget as [number, number], dir: [1, 1] },
      { from: diagTarget as [number, number], to: subHScanTo, dir: [1, 0] },
    ],
    jumpPoints: [vRayP1],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [start, vRayP1],
    closedSet: [],
    finalPath: [],
    g: Number((1.0 + Math.SQRT2).toFixed(2)),
    h: Number(octileDistance(diagTarget[0], diagTarget[1], goal[0], goal[1]).toFixed(2)),
    f: Number((1.0 + Math.SQRT2 + octileDistance(diagTarget[0], diagTarget[1], goal[0], goal[1])).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 2,
    statusText: `【水平子探测返回】水平子光束未遇到强迫邻居或目标，递归返回 null，继续执行垂直正交子探测。`,
    log: `[水平未命中] 水平子探测返回 null，未能触发跳点。`,
    codeLine: STAGE3_LINES.subJumpH,
  });

  // 16. 垂直正交子探测发射
  const subVScanTo: [number, number] = [diagTarget[0], Math.min(grid[0].length - 1, diagTarget[1] + 3)];
  steps.push({
    grid,
    start,
    goal,
    currentNode: diagTarget as [number, number],
    stage: 'stage3_jump_ray',
    stageTitle: '递归射线跳跃探测',
    action: 'diagonal-sub-jump-v',
    rays: [
      { from: diagP0, to: diagTarget as [number, number], dir: [1, 1] },
      { from: diagTarget as [number, number], to: subVScanTo, dir: [0, 1] },
    ],
    jumpPoints: [vRayP1],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [start, vRayP1],
    closedSet: [],
    finalPath: [],
    g: Number((1.0 + Math.SQRT2).toFixed(2)),
    h: Number(octileDistance(diagTarget[0], diagTarget[1], goal[0], goal[1]).toFixed(2)),
    f: Number((1.0 + Math.SQRT2 + octileDistance(diagTarget[0], diagTarget[1], goal[0], goal[1])).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 2,
    statusText: `【垂直正交子探测】发射 jump(grid, x, y, dx=0, dy=1, goal) 向右扫描拐角。`,
    log: `[垂直子探测] 发射垂直正交子光束探测拐角。`,
    codeLine: STAGE3_LINES.subJumpV,
  });

  // 17. 垂直正交子探测命中拐角强迫邻居
  steps.push({
    grid,
    start,
    goal,
    currentNode: diagTarget as [number, number],
    stage: 'stage3_jump_ray',
    stageTitle: '递归射线跳跃探测',
    action: 'sub-jump-hit',
    rays: [
      { from: diagP0, to: diagTarget as [number, number], dir: [1, 1] },
      { from: diagTarget as [number, number], to: subVScanTo, dir: [0, 1] },
    ],
    jumpPoints: [vRayP1],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [start, vRayP1],
    closedSet: [],
    finalPath: [],
    g: Number((1.0 + Math.SQRT2).toFixed(2)),
    h: Number(octileDistance(diagTarget[0], diagTarget[1], goal[0], goal[1]).toFixed(2)),
    f: Number((1.0 + Math.SQRT2 + octileDistance(diagTarget[0], diagTarget[1], goal[0], goal[1])).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 2,
    statusText: `【正交子探测命中】垂直子探测成功在前方拐角截获跳点！子递归成功返回跳点坐标！`,
    log: `[垂直命中] 垂直子探测发现跳点，返回非空坐标！`,
    codeLine: STAGE3_LINES.subJumpHitV,
  });

  // 18. 对角主流程根据垂直命中确立跳点并入堆
  steps.push({
    grid,
    start,
    goal,
    currentNode: diagTarget as [number, number],
    stage: 'stage3_jump_ray',
    stageTitle: '递归射线跳跃探测',
    action: 'diagonal-hit-promotion',
    rays: [{ from: diagP0, to: diagTarget as [number, number], dir: [1, 1] }],
    jumpPoints: [vRayP1, diagTarget as [number, number]],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [start, vRayP1, diagTarget as [number, number]],
    closedSet: [],
    finalPath: [],
    g: Number((1.0 + Math.SQRT2).toFixed(2)),
    h: Number(octileDistance(diagTarget[0], diagTarget[1], goal[0], goal[1]).toFixed(2)),
    f: Number((1.0 + Math.SQRT2 + octileDistance(diagTarget[0], diagTarget[1], goal[0], goal[1])).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 3,
    statusText: `【正交诱发跳点】因为垂直子探测发现跳点，为保证该支路最短路径不漏判，当前对角拐点 (${diagTarget[0]}, ${diagTarget[1]}) 必须立即立为跳点入堆！`,
    log: `[对角跳点确立] return new int[]{nx, ny}，由于垂直子探测命中，对角点自身晋升跳点！`,
    codeLine: STAGE3_LINES.subJumpHitV,
  });

  // 19. 总结
  steps.push({
    grid,
    start,
    goal,
    currentNode: diagTarget as [number, number],
    stage: 'stage3_jump_ray',
    stageTitle: '递归射线跳跃探测',
    action: 'ray-summary',
    rays: [
      { from: start, to: vRayP1, dir: [1, 0] },
      { from: vRayP1, to: diagTarget as [number, number], dir: [1, 1] },
    ],
    jumpPoints: [vRayP1, diagTarget as [number, number]],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [start, vRayP1, diagTarget as [number, number]],
    closedSet: [],
    finalPath: [],
    g: Number((1.0 + Math.SQRT2).toFixed(2)),
    h: Number(octileDistance(diagTarget[0], diagTarget[1], goal[0], goal[1]).toFixed(2)),
    f: Number((1.0 + Math.SQRT2 + octileDistance(diagTarget[0], diagTarget[1], goal[0], goal[1])).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 3,
    statusText: `【射线机制就绪】直行穿透 + 拐角停步 + 对角正交子递归已完备验证，点击顶栏【阶段 4】查看终局寻路！`,
    log: `[射线探测完成] 递归 jump 函数逻辑全部打通，进入阶段 4 启动工业级极速寻路。`,
    codeLine: STAGE3_LINES.jumpRecurse,
  });

  return withMetrics(steps);
}

/** 阶段 3 统一步骤入口：支持对角线侦察原理精解与经典拐角两套用例 */
export function buildStage3Steps(presetKey: string = 'diagonal'): JpsStep[] {
  if (presetKey === 'diagonal') {
    return buildStage3DiagonalPrincipleSteps();
  }
  return buildStage3CornerSteps(presetKey);
}

// ==========================================
// 阶段 4: JPS 完整跳点搜索步骤生成器
// ==========================================
export function buildStage4Steps(presetKey: string = 'corner'): JpsStep[] {
  const preset = JPS_PRESETS[presetKey] || JPS_PRESETS.corner;
  const { grid, start, goal } = preset;
  const astarTotalVisited = calculateAStarVisitedCount(grid, start, goal);
  const steps: JpsStep[] = [];

  interface JpsNode {
    r: number;
    c: number;
    g: number;
    h: number;
    f: number;
    pr: number; // 父节点坐标，用于推导方向
    pc: number;
    parent: JpsNode | null;
  }

  const startH = octileDistance(start[0], start[1], goal[0], goal[1]);
  const openQueue: JpsNode[] = [{
    r: start[0],
    c: start[1],
    g: 0,
    h: startH,
    f: startH,
    pr: start[0],
    pc: start[1],
    parent: null,
  }];

  const visitedMap = new Map<string, number>();
  const jumpPointsRecorded: Array<[number, number]> = [[start[0], start[1]]];
  let reachedGoalNode: JpsNode | null = null;
  let iterations = 0;

  // 初始步骤
  steps.push({
    grid,
    start,
    goal,
    currentNode: start,
    stage: 'stage4_jps_full',
    stageTitle: 'JPS 完整跳点搜索',
    action: 'init',
    rays: [],
    jumpPoints: [[start[0], start[1]]],
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [[start[0], start[1]]],
    closedSet: [],
    finalPath: [],
    g: 0,
    h: Number(startH.toFixed(2)),
    f: Number(startH.toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: 1,
    statusText: `【JPS 极速寻路启动】起点 (${start[0]}, ${start[1]}) 入堆，Open 堆规模仅需存放关键跳点！`,
    log: `[JPS 初始化] 起点入堆，待探索方向将由自然邻居剪枝与射线跳跃自动生成。`,
    codeLine: STAGE4_LINES.init,
  });

  while (openQueue.length > 0 && iterations < 30) {
    iterations++;
    openQueue.sort((a, b) => a.f - b.f);
    const cur = openQueue.shift()!;
    const curKey = `${cur.r},${cur.c}`;

    if (visitedMap.has(curKey) && visitedMap.get(curKey)! <= cur.g) {
      continue;
    }
    visitedMap.set(curKey, cur.g);

    // 跳点出堆单步
    steps.push({
      grid,
      start,
      goal,
      currentNode: [cur.r, cur.c],
      stage: 'stage4_jps_full',
      stageTitle: 'JPS 完整跳点搜索',
      action: 'poll',
      rays: [],
      jumpPoints: Array.from(new Set(jumpPointsRecorded.map(([r, c]) => `${r},${c}`))).map((k) =>
        k.split(',').map(Number) as [number, number]
      ),
      forcedNeighbors: [],
      naturalNeighbors: [],
      openSet: openQueue.map((n) => [n.r, n.c]),
      closedSet: Array.from(visitedMap.keys()).map((k) => k.split(',').map(Number) as [number, number]),
      finalPath: [],
      g: Number(cur.g.toFixed(2)),
      h: Number(cur.h.toFixed(2)),
      f: Number(cur.f.toFixed(2)),
      astarVisitedCount: astarTotalVisited,
      jpsVisitedCount: visitedMap.size,
      statusText: `【跳点出堆】从优先队列弹出最小代价跳点 (${cur.r}, ${cur.c})，g=${cur.g.toFixed(2)}, h=${cur.h.toFixed(2)}。`,
      log: `[跳点出堆] Node cur = open.poll() => (${cur.r}, ${cur.c})。准备确定后继发射方向。`,
      codeLine: STAGE4_LINES.poll,
    });

    if (cur.r === goal[0] && cur.c === goal[1]) {
      reachedGoalNode = cur;
      break;
    }

    // 确定当前跳点需探测的方向
    let searchDirs: Array<[number, number]> = [];
    if (cur.parent === null) {
      searchDirs = [...DIRS_8];
    } else {
      const dr = Math.sign(cur.r - cur.pr);
      const dc = Math.sign(cur.c - cur.pc);
      if (dr === 0 || dc === 0) {
        if (isWalkable(grid, cur.r + dr, cur.c + dc)) searchDirs.push([dr, dc]);
        const fn = getForcedNeighbors(grid, cur.r, cur.c, dr, dc);
        for (const [fr, fc] of fn) {
          searchDirs.push([Math.sign(fr - cur.r), Math.sign(fc - cur.c)]);
        }
      } else {
        if (isWalkable(grid, cur.r + dr, cur.c)) searchDirs.push([dr, 0]);
        if (isWalkable(grid, cur.r, cur.c + dc)) searchDirs.push([0, dc]);
        if (isWalkable(grid, cur.r + dr, cur.c + dc)) searchDirs.push([dr, dc]);
        const fn = getForcedNeighbors(grid, cur.r, cur.c, dr, dc);
        for (const [fr, fc] of fn) {
          searchDirs.push([Math.sign(fr - cur.r), Math.sign(fc - cur.c)]);
        }
      }
    }

    // 后继方向剪枝确定单步
    steps.push({
      grid,
      start,
      goal,
      currentNode: [cur.r, cur.c],
      stage: 'stage4_jps_full',
      stageTitle: 'JPS 完整跳点搜索',
      action: 'expand-dirs',
      rays: [],
      jumpPoints: Array.from(new Set(jumpPointsRecorded.map(([r, c]) => `${r},${c}`))).map((k) =>
        k.split(',').map(Number) as [number, number]
      ),
      forcedNeighbors: [],
      naturalNeighbors: [],
      openSet: openQueue.map((n) => [n.r, n.c]),
      closedSet: Array.from(visitedMap.keys()).map((k) => k.split(',').map(Number) as [number, number]),
      finalPath: [],
      g: Number(cur.g.toFixed(2)),
      h: Number(cur.h.toFixed(2)),
      f: Number(cur.f.toFixed(2)),
      astarVisitedCount: astarTotalVisited,
      jpsVisitedCount: visitedMap.size,
      statusText: `【剪枝方向确定】依据父节点方向剪枝，当前跳点仅需向 ${searchDirs.length} 个合法方向发射光束探测！`,
      log: `[方向过滤] identifySuccessors 过滤出 ${searchDirs.length} 个发射方向，其余方向被几何剪除。`,
      codeLine: STAGE4_LINES.expandSuccessors,
    });

    for (const [dr, dc] of searchDirs) {
      const jp = jump(grid, cur.r, cur.c, dr, dc, goal);
      if (jp) {
        const distCost = octileDistance(cur.r, cur.c, jp[0], jp[1]);
        const ng = cur.g + distCost;
        const nh = octileDistance(jp[0], jp[1], goal[0], goal[1]);
        const nf = ng + nh;
        const jpKey = `${jp[0]},${jp[1]}`;

        if (!visitedMap.has(jpKey) || ng < visitedMap.get(jpKey)!) {
          openQueue.push({
            r: jp[0],
            c: jp[1],
            g: ng,
            h: nh,
            f: nf,
            pr: cur.r,
            pc: cur.c,
            parent: cur,
          });
          jumpPointsRecorded.push(jp);
        }

        // 命中跳点单步
        steps.push({
          grid,
          start,
          goal,
          currentNode: [cur.r, cur.c],
          stage: 'stage4_jps_full',
          stageTitle: 'JPS 完整跳点搜索',
          action: 'ray-hit-jp',
          rays: [{ from: [cur.r, cur.c], to: jp, dir: [dr, dc] }],
          jumpPoints: Array.from(new Set(jumpPointsRecorded.map(([r, c]) => `${r},${c}`))).map((k) =>
            k.split(',').map(Number) as [number, number]
          ),
          forcedNeighbors: [],
          naturalNeighbors: [],
          openSet: openQueue.map((n) => [n.r, n.c]),
          closedSet: Array.from(visitedMap.keys()).map((k) => k.split(',').map(Number) as [number, number]),
          finalPath: [],
          g: Number(cur.g.toFixed(2)),
          h: Number(cur.h.toFixed(2)),
          f: Number(cur.f.toFixed(2)),
          astarVisitedCount: astarTotalVisited,
          jpsVisitedCount: visitedMap.size,
          statusText: `【光束锁定跳点】向 (${dr}, ${dc}) 发射光束穿透平原，成功捕获跳点 (${jp[0]}, ${jp[1]}) 并加入优先队列！`,
          log: `[命中跳点] 光束沿 (${dr}, ${dc}) 滑行至 (${jp[0]}, ${jp[1]}) 截获跳点，入堆 open.offer()。`,
          codeLine: STAGE4_LINES.pushOpen,
        });
      } else {
        // 射线未命中跳点单步（遇障终止）
        steps.push({
          grid,
          start,
          goal,
          currentNode: [cur.r, cur.c],
          stage: 'stage4_jps_full',
          stageTitle: 'JPS 完整跳点搜索',
          action: 'ray-miss',
          rays: [{ from: [cur.r, cur.c], to: [cur.r + dr, cur.c + dc], dir: [dr, dc] }],
          jumpPoints: Array.from(new Set(jumpPointsRecorded.map(([r, c]) => `${r},${c}`))).map((k) =>
            k.split(',').map(Number) as [number, number]
          ),
          forcedNeighbors: [],
          naturalNeighbors: [],
          openSet: openQueue.map((n) => [n.r, n.c]),
          closedSet: Array.from(visitedMap.keys()).map((k) => k.split(',').map(Number) as [number, number]),
          finalPath: [],
          g: Number(cur.g.toFixed(2)),
          h: Number(cur.h.toFixed(2)),
          f: Number(cur.f.toFixed(2)),
          astarVisitedCount: astarTotalVisited,
          jpsVisitedCount: visitedMap.size,
          statusText: `【光束穿透无跳点】向 (${dr}, ${dc}) 发射光束滑行遇障终止，返回 null，沿途零节点入堆！`,
          log: `[光束遇障] 方向 (${dr}, ${dc}) 未发现跳点，零入堆直接跳过。`,
          codeLine: STAGE4_LINES.jumpRayStart,
        });
      }
    }
  }

  // 构建终局最优跳点折线路径
  const jpsPath: Array<[number, number]> = [];
  let trace: JpsNode | null = reachedGoalNode;
  while (trace) {
    jpsPath.unshift([trace.r, trace.c]);
    trace = trace.parent;
  }

  const reduction =
    astarTotalVisited > 0
      ? Math.max(0, Math.round(((astarTotalVisited - visitedMap.size) / astarTotalVisited) * 100))
      : 0;

  steps.push({
    grid,
    start,
    goal,
    currentNode: goal,
    stage: 'stage4_jps_full',
    stageTitle: 'JPS 完整跳点搜索',
    action: 'reach-goal',
    rays: [],
    jumpPoints: Array.from(new Set(jumpPointsRecorded.map(([r, c]) => `${r},${c}`))).map((k) =>
      k.split(',').map(Number) as [number, number]
    ),
    forcedNeighbors: [],
    naturalNeighbors: [],
    openSet: [],
    closedSet: Array.from(visitedMap.keys()).map((k) => k.split(',').map(Number) as [number, number]),
    finalPath: jpsPath,
    g: Number((reachedGoalNode?.g || 0).toFixed(2)),
    h: 0,
    f: Number((reachedGoalNode?.g || 0).toFixed(2)),
    astarVisitedCount: astarTotalVisited,
    jpsVisitedCount: visitedMap.size,
    statusText: `【JPS 终局达成】探索节点仅 ${visitedMap.size} 个，较传统 A* (${astarTotalVisited} 节点) 极致减少 ${reduction}% 运算！`,
    log: `[JPS 寻路达成] 严格最优折线跳点路径已锁定！JPS 完美跳过了所有网格对称折线，堆操作数量级下降。`,
    codeLine: STAGE4_LINES.reachGoal,
  });

  return withMetrics(steps);
}

/** 顶层统一步骤调度入口（兼容旧测试与分发） */
export function buildJumpPointSearchSteps(
  presetKey: string = 'corner',
  modeOrStage: string = 'stage-4'
): JpsStep[] {
  if (modeOrStage === 'stage-1' || modeOrStage === 'stage1' || modeOrStage === 'astar') {
    return buildStage1Steps(presetKey);
  }
  if (modeOrStage === 'stage-2' || modeOrStage === 'stage2' || modeOrStage === 'pruning') {
    return buildStage2Steps(presetKey);
  }
  if (modeOrStage === 'stage-3' || modeOrStage === 'stage3') {
    return buildStage3Steps(presetKey);
  }
  if (modeOrStage === 'stage-4' || modeOrStage === 'stage4' || modeOrStage === 'jps') {
    return buildStage4Steps(presetKey);
  }
  if (modeOrStage === 'journey' || modeOrStage === 'all') {
    const s1 = buildStage1Steps(presetKey);
    const s2 = buildStage2Steps(presetKey);
    const s3 = buildStage3Steps(presetKey);
    const s4 = buildStage4Steps(presetKey);
    return [...s1, ...s2, ...s3, ...s4];
  }
  return buildStage4Steps(presetKey);
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
      stage4_jps_full: 'Stage 4: JPS 终局',
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

  // 展开光束射线经过的路径（备用）
  const rayMap = new Set<string>();
  for (const ray of rays || []) {
    let cr = ray.from[0];
    let cc = ray.from[1];
    const tr = ray.to[0];
    const tc = ray.to[1];
    const sdr = Math.sign(tr - cr);
    const sdc = Math.sign(tc - cc);
    let guard = 0;
    while ((cr !== tr || cc !== tc) && guard < 100) {
      guard++;
      rayMap.add(`${cr},${cc}`);
      if (cr !== tr) cr += sdr;
      if (cc !== tc) cc += sdc;
    }
    rayMap.add(`${tr},${tc}`);
  }

  // 动态尺寸计算
  const cellSize = Math.min(42, Math.max(22, Math.floor(360 / Math.max(m, n))));
  const gap = 3;
  const pad = 10;
  const fontSize = cellSize >= 32 ? 11 : 9;
  const totalWidth = pad * 2 + n * cellSize + (n - 1) * gap;
  const totalHeight = pad * 2 + m * cellSize + (m - 1) * gap;

  const getCenterX = (c: number) => pad + c * (cellSize + gap) + cellSize / 2;
  const getCenterY = (r: number) => pad + r * (cellSize + gap) + cellSize / 2;

  // 判定对角线历经痕迹点 (Trail Dots)
  const trailDots = new Set<string>();
  if (step.diagonalTrajectory) {
    const [fr, fc] = step.diagonalTrajectory.from;
    const [tr, tc] = step.diagonalTrajectory.to;
    const dr = Math.sign(tr - fr);
    const dc = Math.sign(tc - fc);
    if (dr !== 0 && dc !== 0) {
      let cr = fr + dr;
      let cc = fc + dc;
      while ((cr !== tr || cc !== tc) && cr >= 0 && cr < m && cc >= 0 && cc < n) {
        trailDots.add(`${cr},${cc}`);
        cr += dr;
        cc += dc;
      }
    }
  }

  // 拼接单元格 HTML
  let cellsHtml = '';
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      const key = `${r},${c}`;
      const isStart = start[0] === r && start[1] === c;
      const isGoal = goal[0] === r && goal[1] === c;
      const isWall = grid[r][c] === 1;
      const isKeyObstacle = step.keyObstacle && step.keyObstacle[0] === r && step.keyObstacle[1] === c;
      const isCurrent = currentNode && currentNode[0] === r && currentNode[1] === c;
      const isPath = pathMap.has(key);
      const isJp = jpMap.has(key);
      const isFn = fnMap.has(key);
      const isNn = nnMap.has(key);
      const isOpen = openMap.has(key);
      const isClosed = closedMap.has(key);
      const isTrail = trailDots.has(key);

      // 坐标标签 (以左下角为笛卡尔原点，显示 c, m-1-r)
      const coordLabel = `<span style="position: absolute; bottom: 1px; right: 2px; font-size: 8px; color: #475569; pointer-events: none; font-family: 'JetBrains Mono', monospace; line-height: 1;">${c},${m - 1 - r}</span>`;

      // 基础格子样式 (使用避开全局漂白规则的暗黑高质感基底)
      let cellStyle = `width: ${cellSize}px; height: ${cellSize}px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-family: 'JetBrains Mono', monospace; font-size: ${fontSize}px; font-weight: 800; border: 1px solid #142035; background: #0a1122; color: #475569; position: relative; box-sizing: border-box; transition: all 0.15s ease;`;
      let content = '';

      if (isStart) {
        cellStyle += ' background: #1d4ed8; color: #ffffff; border-color: #3b82f6; box-shadow: 0 0 10px rgba(59,130,246,0.5); z-index: 5;';
        content = `<span style="font-weight: 900; font-size: ${fontSize + 2}px;">S</span>`;
      } else if (isGoal) {
        cellStyle += ' background: #be123c; color: #ffffff; border-color: #f43f5e; box-shadow: 0 0 10px rgba(244,63,94,0.5); z-index: 5;';
        content = `<span style="font-weight: 900; font-size: ${fontSize + 2}px;">G</span>`;
      } else if (isKeyObstacle) {
        cellStyle += ' background: #25121e; color: #fb7185; border: 2px solid #f43f5e; box-shadow: 0 0 10px rgba(244,63,94,0.6); outline: 2px solid #f43f5e; outline-offset: 1px; z-index: 4;';
        content = `<span style="font-weight: 900; font-size: 11px;">#</span>`;
      } else if (isWall) {
        cellStyle += ' background: #111a2e; color: #475569; border: 1px solid #1c2b45;';
        content = `<span style="opacity: 0.6;">#</span>`;
      } else if (isFn) {
        cellStyle += ' background: rgba(168, 85, 247, 0.2); color: #d8b4fe; border: 2px dashed #c084fc; box-shadow: 0 0 8px rgba(192,132,252,0.3); z-index: 4;';
        content = `<span style="background: #7e22ce; color: #ffffff; font-size: ${Math.max(7, fontSize - 3)}px; font-weight: 800; padding: 1px 2px; border-radius: 3px; white-space: nowrap;">通道口</span>`;
      } else if (isJp) {
        // 判断是否为 X 晋升的跳点或 J 跳点
        const isX = r === 4 && c === 3;
        const isJ = r === 4 && c === 5;
        cellStyle += ' background: rgba(245, 158, 11, 0.25); color: #fbbf24; border: 2px solid #f59e0b; box-shadow: 0 0 10px rgba(245,158,11,0.5); z-index: 5;';
        if (isX) {
          content = `<span style="background: #f59e0b; color: #020617; font-size: ${Math.max(7, fontSize - 3)}px; font-weight: 900; padding: 1px 2px; border-radius: 3px; white-space: nowrap;">★X跳点</span>`;
        } else if (isJ) {
          content = `<span style="background: #f59e0b; color: #020617; font-size: ${Math.max(7, fontSize - 3)}px; font-weight: 900; padding: 1px 2px; border-radius: 3px; white-space: nowrap;">跳点 J</span>`;
        } else {
          content = `<span style="background: #8b5cf6; color: #ffffff; font-size: ${Math.max(7, fontSize - 3)}px; font-weight: 800; padding: 1px 3px; border-radius: 3px;">JP</span>`;
        }
      } else if (isCurrent) {
        // 当前考察点
        if (r === 4 && c === 3 && step.stage === 'stage3_jump_ray') {
          cellStyle += ' background: rgba(16, 185, 129, 0.2); color: #34d399; border: 2px solid #10b981; box-shadow: 0 0 10px rgba(16,185,129,0.4); z-index: 5;';
          content = `<span style="background: #10b981; color: #020617; font-size: ${Math.max(7, fontSize - 3)}px; font-weight: 800; padding: 1px 2px; border-radius: 3px; white-space: nowrap;">节点 X</span>`;
        } else {
          cellStyle += ' background: rgba(234, 88, 12, 0.25); color: #fdba74; border: 2px solid #f97316; box-shadow: 0 0 8px rgba(249,115,22,0.4); z-index: 5;';
          content = `<span>★</span>`;
        }
      } else if (isPath && !step.showFinalPathSegments) {
        cellStyle += ' background: #059669; color: #ffffff; border-color: #10b981; box-shadow: 0 0 8px rgba(16,185,129,0.4); z-index: 3;';
        content = `<span>★</span>`;
      } else if (isNn) {
        cellStyle += ' background: rgba(20, 184, 166, 0.2); color: #5eead4; border-color: #14b8a6;';
        content = `<span style="font-size: ${Math.max(7, fontSize - 2)}px;">NN</span>`;
      } else if (isOpen) {
        cellStyle += ' background: rgba(234, 179, 8, 0.15); color: #fde047; border-color: rgba(234, 179, 8, 0.4);';
        content = `<span>o</span>`;
      } else if (isClosed) {
        cellStyle += ' background: #090f1d; color: #64748b; border: 1px solid #142035;';
        content = `<span>·</span>`;
      }

      // 历经轨迹点
      if (isTrail && !content) {
        content = `<span style="width: 6px; height: 6px; border-radius: 50%; background: #22d3ee; box-shadow: 0 0 6px #22d3ee;"></span>`;
      }

      cellsHtml += `<div style="${cellStyle}">${content}${coordLabel}</div>`;
    }
  }

  // 拼接 SVG 矢量覆盖层
  let svgVectors = '';
  // 1. 对角线推进线
  if (step.diagonalTrajectory) {
    const x1 = getCenterX(step.diagonalTrajectory.from[1]);
    const y1 = getCenterY(step.diagonalTrajectory.from[0]);
    const x2 = getCenterX(step.diagonalTrajectory.to[1]);
    const y2 = getCenterY(step.diagonalTrajectory.to[0]);
    svgVectors += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#10b981" stroke-width="3.5" stroke-linecap="round" opacity="0.8" marker-end="url(#jps-arrow-emerald)" />`;
  }

  // 2. 扫描射线
  for (const ray of rays || []) {
    const x1 = getCenterX(ray.from[1]);
    const y1 = getCenterY(ray.from[0]);
    const x2 = getCenterX(ray.to[1]);
    const y2 = getCenterY(ray.to[0]);
    svgVectors += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#38bdf8" stroke-width="3" stroke-linecap="round" class="jps-ray-active" marker-end="url(#jps-arrow-cyan)" />`;
  }

  // 3. 终点分段连线 (Step 7 达成)
  if (step.showFinalPathSegments) {
    const ptS = { x: getCenterX(0), y: getCenterY(7) };
    const ptX = { x: getCenterX(3), y: getCenterY(4) };
    const ptJ = { x: getCenterX(5), y: getCenterY(4) };
    const ptFN = { x: getCenterX(6), y: getCenterY(3) };
    const ptG = { x: getCenterX(6), y: getCenterY(0) };

    // S -> X (金色对角高速)
    svgVectors += `<line x1="${ptS.x}" y1="${ptS.y}" x2="${ptX.x}" y2="${ptX.y}" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" />`;
    // X -> J (金色穿缝直行)
    svgVectors += `<line x1="${ptX.x}" y1="${ptX.y}" x2="${ptJ.x}" y2="${ptJ.y}" stroke="#f59e0b" stroke-width="4" stroke-linecap="round" />`;
    // J -> FN (紫色贴角穿越)
    svgVectors += `<line x1="${ptJ.x}" y1="${ptJ.y}" x2="${ptFN.x}" y2="${ptFN.y}" stroke="#c084fc" stroke-width="4" stroke-linecap="round" marker-end="url(#jps-arrow-purple)" />`;
    // FN -> G (玫瑰红直达终点)
    svgVectors += `<line x1="${ptFN.x}" y1="${ptFN.y}" x2="${ptG.x}" y2="${ptG.y}" stroke="#f43f5e" stroke-width="4" stroke-dasharray="8 4" stroke-linecap="round" marker-end="url(#jps-arrow-rose)" />`;
  } else if (finalPath.length > 1) {
    const pointsStr = finalPath.map(([r, c]) => `${getCenterX(c)},${getCenterY(r)}`).join(' ');
    svgVectors += `<polyline points="${pointsStr}" fill="none" stroke="#10b981" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round" opacity="0.9" />`;
  }

  const svgDefs = `
    <defs>
      <marker id="jps-arrow-cyan" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#38bdf8" />
      </marker>
      <marker id="jps-arrow-emerald" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#10b981" />
      </marker>
      <marker id="jps-arrow-gold" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#f59e0b" />
      </marker>
      <marker id="jps-arrow-purple" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#c084fc" />
      </marker>
      <marker id="jps-arrow-rose" viewBox="0 0 10 10" refX="6" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
        <path d="M 0 1 L 10 5 L 0 9 z" fill="#f43f5e" />
      </marker>
    </defs>
  `;

  const keyframeStyle = `
    <style>
      @keyframes jps-scan-ray {
        0% { stroke-dashoffset: 40; }
        100% { stroke-dashoffset: 0; }
      }
      .jps-ray-active {
        stroke-dasharray: 6 3;
        animation: jps-scan-ray 0.8s linear infinite;
      }
    </style>
  `;

  container.innerHTML = `
    ${keyframeStyle}
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 10px; padding: 10px; box-sizing: border-box; background: #050814; border-radius: 12px;">
      <!-- 网格与矢量叠加层沙盘 -->
      <div style="position: relative; display: inline-grid; grid-template-columns: repeat(${n}, ${cellSize}px); grid-template-rows: repeat(${m}, ${cellSize}px); gap: ${gap}px; padding: ${pad}px; background: #080d1a; border-radius: 12px; border: 1px solid #142035; box-shadow: 0 4px 20px rgba(0,0,0,0.5); user-select: none;">
        ${cellsHtml}
        <svg style="position: absolute; top: 0; left: 0; width: ${totalWidth}px; height: ${totalHeight}px; pointer-events: none; z-index: 20;">
          ${svgDefs}
          ${svgVectors}
        </svg>
      </div>

      <!-- 图例标注 -->
      <div style="display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 6px 12px; font-size: 11px; color: #94a3b8; user-select: none;">
        <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 13px; height: 13px; border-radius: 3px; background: #1d4ed8; color: #fff; font-size: 9px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center;">S</span> 起点</span>
        <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 13px; height: 13px; border-radius: 3px; background: #be123c; color: #fff; font-size: 9px; font-weight: 800; display: inline-flex; align-items: center; justify-content: center;">G</span> 终点</span>
        <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 13px; height: 13px; border-radius: 3px; background: #111a2e; border: 1px solid #1c2b45; color: #64748b; font-size: 9px; display: inline-flex; align-items: center; justify-content: center;">#</span> 障碍</span>
        <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 13px; height: 13px; border-radius: 3px; background: rgba(16,185,129,0.2); border: 1.5px solid #10b981; display: inline-block;"></span> 对角探索点 X</span>
        <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 13px; height: 13px; border-radius: 3px; background: rgba(245,158,11,0.25); border: 1.5px solid #f59e0b; display: inline-block;"></span> 转折跳点 J</span>
        <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 13px; height: 13px; border-radius: 3px; background: rgba(168,85,247,0.2); border: 1.5px dashed #c084fc; display: inline-block;"></span> 强制邻居</span>
        <span style="display: inline-flex; align-items: center; gap: 4px;"><span style="width: 16px; height: 2px; background: #38bdf8; display: inline-block;"></span> 扫描雷达</span>
      </div>

      <!-- 动态解说 -->
      <div style="font-family: system-ui, -apple-system, sans-serif; font-size: 11px; font-weight: 600; color: #cbd5e1; text-align: center; max-width: 90%; line-height: 1.5; background: #0b1328; padding: 6px 12px; border-radius: 8px; border: 1px solid #1b2942;">
        ${step.statusText}
      </div>

      <!-- 欧氏/八向距离评估公式 -->
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #64748b;">
        f(n) = g(${step.g.toFixed(2)}) + h(${step.h.toFixed(2)}) = ${step.f.toFixed(2)}
      </div>
    </div>
  `;
}

// ==========================================
// 辅助指标/状态空间监视器 (Card 2: JPS Open List 实时镜像与思想点拨)
// ==========================================
export function renderJumpPointSearchCard2(container: HTMLElement, step: JpsStep): void {
  const openItems = step.openListDetails || (step.openSet || []).map(([r, c]) => ({
    name: `(${c}, ${7 - r})`,
    g: step.g,
    h: step.h,
    f: step.f,
    note: '待评估候选点',
  }));

  const openListHtml = openItems.map((item) => `
    <div style="background: #0c1427; border: 1px solid #1e2c47; border-radius: 8px; padding: 6px 10px; display: flex; align-items: center; justify-content: space-between; gap: 8px; box-sizing: border-box;">
      <div style="display: flex; align-items: center; gap: 8px; min-width: 0;">
        <span style="font-weight: 700; color: #38bdf8; font-family: 'JetBrains Mono', monospace; font-size: 11px; white-space: nowrap;">${item.name}</span>
        <span style="font-size: 10px; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.note}</span>
      </div>
      <div style="display: flex; gap: 6px; font-size: 10px; font-family: 'JetBrains Mono', monospace; white-space: nowrap;">
        <span style="color: #64748b;">g:${item.g}</span>
        <span style="color: #64748b;">h:${item.h}</span>
        <span style="color: #f59e0b; font-weight: 700;">f:${item.f}</span>
      </div>
    </div>
  `).join('');

  const thoughtText = step.stage === 'stage3_jump_ray'
    ? '如果没有将 X 设为跳点，算法就会直勾勾错过转弯去往 J 的机会；因此 X 是从主干高速路切入支线的“立交桥分流道口”！'
    : step.stage === 'stage2_prune'
    ? '通俗大白话：开阔地带走哪都对称等价，只有路过转角被障碍卡住死角时，才会产生必须借道的“强迫邻居”，催生关键跳点！'
    : step.stage === 'stage1_astar'
    ? '传统 A* 对称泛洪：网格中存在大量等价的对称折线路径，导致 Open 堆急剧膨胀，遍历大量冗余节点。'
    : 'JPS 终局：Open 堆仅存放关键跳点，节点访问量骤减 80%~95%，直击欧几里得最优解！';

  container.innerHTML = `
    <div style="display: flex; flex-direction: column; gap: 10px; padding: 4px; box-sizing: border-box; width: 100%;">
      <!-- Open List 实时镜像面板 -->
      <div style="background: #080d1a; border: 1px solid #142035; border-radius: 12px; padding: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.3);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; padding-bottom: 6px; border-bottom: 1px solid #142035; font-size: 11px; font-weight: 600;">
          <span style="color: #e2e8f0; display: inline-flex; align-items: center; gap: 6px;">
            <svg style="width: 14px; height: 14px; color: #818cf8;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
            JPS Open List (待评估跳点队列)
          </span>
          <span style="font-family: 'JetBrains Mono', monospace; font-size: 11px; color: #94a3b8;">${openItems.length} 项</span>
        </div>
        <div style="display: flex; flex-direction: column; gap: 6px; max-height: 140px; overflow-y: auto;">
          ${openListHtml}
        </div>
      </div>

      <!-- 💡 思想点拨 callout -->
      <div style="padding: 10px 12px; border-radius: 10px; background: rgba(245, 158, 11, 0.08); border: 1px solid rgba(245, 158, 11, 0.25); color: #fbbf24; font-size: 11px; line-height: 1.5;">
        <strong style="color: #f59e0b; display: block; margin-bottom: 2px;">💡 核心思想点拨：</strong>
        <span style="color: #e2e8f0;">${thoughtText}</span>
      </div>

      <!-- 📐 强迫邻居数学准则 / 判定提示 -->
      <div style="padding: 10px 12px; border-radius: 10px; background: rgba(99, 102, 241, 0.08); border: 1px solid rgba(99, 102, 241, 0.25); font-size: 11px; line-height: 1.5;">
        <strong style="color: #a5b4fc; display: block; margin-bottom: 2px;">📐 强迫邻居数学准则：</strong>
        <span style="color: #94a3b8;">对于水平直行探测，若上方 <code style="color: #e2e8f0; background: #0c1427; padding: 1px 4px; border-radius: 3px;">(x, y+1)</code> 是障碍物，但右上方 <code style="color: #c084fc; background: #0c1427; padding: 1px 4px; border-radius: 3px;">(x+1, y+1)</code> 是空地，则从前驱直接绕行被墙切断，必须经由当前格转弯达到最优，<code style="color: #c084fc;">(x+1, y+1)</code> 即为强迫邻居！</span>
      </div>
    </div>
  `;
}

// ==========================================
// 注册声明式算法演化模型 (带顶栏四阶段 Tab 导航)
// ==========================================
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
  defaultStage: 'stage-3',
  stages: [
    {
      id: 'stage-1',
      name: '阶段 1: A* 传统泛洪对比',
      shortName: 'A*泛洪',
      num: 1,
      timeBadge: 'O(bᵈ) 堆膨胀',
      theme: 'bg-amber',
      badge: {
        mode: '传统 8-向 A* 搜索',
        complexity: '大量等价对称路径冗余入堆',
      },
      card1Title: '🧭 传统 8-向 A* 网格泛洪沙盘',
      card2Title: '📊 A* 状态空间与 Open 堆规模监视器',
      codeLanguages: STAGE1_ASTAR_CODE,
      buildSteps: (inputs) => {
        const presetKey = (inputs?.preset as string) || 'diagonal';
        return buildStage1Steps(presetKey);
      },
      renderCanvas: (container, step) => renderJumpPointSearchCanvas(container, step as JpsStep),
      renderCustomMetrics: (container, step) => renderJumpPointSearchCard2(container, step as JpsStep),
    },
    {
      id: 'stage-2',
      name: '阶段 2: 邻居对称性剪枝',
      shortName: '邻居剪枝',
      num: 2,
      timeBadge: 'O(1) 几何剪枝',
      theme: 'bg-emerald',
      badge: {
        mode: '几何对称性剪枝 & 强迫邻居',
        complexity: '直行保留1邻居 / 斜向保留3邻居',
      },
      card1Title: '🔬 自然邻居 (NN) 与强迫邻居 (FN) 几何剪枝沙盘',
      card2Title: '📐 对称性剪枝几何证明与拐角约束',
      codeLanguages: STAGE2_PRUNING_CODE,
      buildSteps: (inputs) => {
        const presetKey = (inputs?.preset as string) || 'diagonal';
        return buildStage2Steps(presetKey);
      },
      renderCanvas: (container, step) => renderJumpPointSearchCanvas(container, step as JpsStep),
      renderCustomMetrics: (container, step) => renderJumpPointSearchCard2(container, step as JpsStep),
    },
    {
      id: 'stage-3',
      name: '阶段 3: 递归射线跳跃探测',
      shortName: '射线跳跃',
      num: 3,
      timeBadge: 'O(k) 沿途零入堆',
      theme: 'bg-blue',
      badge: {
        mode: '直行 & 对角线复合射线跳跃',
        complexity: '沿途零入堆 / 递归正交子探测',
      },
      card1Title: '🚀 递归光束射线探测与正交子跳跃沙盘',
      card2Title: '⚡ jump() 递归栈与正交子跳跃监视器',
      codeLanguages: STAGE3_RAY_CODE,
      buildSteps: (inputs) => {
        const presetKey = (inputs?.preset as string) || 'diagonal';
        return buildStage3Steps(presetKey);
      },
      renderCanvas: (container, step) => renderJumpPointSearchCanvas(container, step as JpsStep),
      renderCustomMetrics: (container, step) => renderJumpPointSearchCard2(container, step as JpsStep),
    },
    {
      id: 'stage-4',
      name: '阶段 4: JPS 完整跳点搜索',
      shortName: 'JPS终局',
      num: 4,
      timeBadge: 'O(J log J) 极致压缩',
      theme: 'bg-purple',
      badge: {
        mode: 'JPS (Jump Point Search) 极速寻路',
        complexity: '节点访问减少 80%~95%',
      },
      card1Title: '⚡ JPS 跳点极速寻路沙盘',
      card2Title: '🏆 JPS 状态空间与终局跳点路径监视器',
      codeLanguages: STAGE4_JPS_CODE,
      buildSteps: (inputs) => {
        const presetKey = (inputs?.preset as string) || 'diagonal';
        return buildStage4Steps(presetKey);
      },
      renderCanvas: (container, step) => renderJumpPointSearchCanvas(container, step as JpsStep),
      renderCustomMetrics: (container, step) => renderJumpPointSearchCard2(container, step as JpsStep),
    },
  ],
  inputs: [
    {
      id: 'preset',
      label: '地图预设',
      type: 'select',
      defaultValue: 'diagonal',
      options: [
        { label: '对角线侦察原理 (8×8 经典)', value: 'diagonal' },
        { label: '经典拐角 (8×10)', value: 'corner' },
        { label: '开阔平原 (10×14)', value: 'plain' },
        { label: '迷宫障碍 (12×16)', value: 'maze' },
      ],
    },
  ],
  presets: [
    { label: '对角线侦察原理 (8×8 经典)', values: { preset: 'diagonal' } },
    { label: '经典拐角 (8×10 地图)', values: { preset: 'corner' } },
    { label: '开阔平原 (10×14 地图)', values: { preset: 'plain' } },
    { label: '迷宫障碍 (12×16 地图)', values: { preset: 'maze' } },
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
    { label: '障碍物', color: '#111a2e' },
    { label: '跳点 (JP)', color: '#8b5cf6' },
    { label: '强迫邻居 (FN)', color: '#f59e0b' },
    { label: '自然邻居 (NN)', color: '#14b8a6' },
    { label: '跳跃射线', color: '#38bdf8' },
    { label: '最优路径', state: 'discovered' },
  ],
  codeLanguages: STAGE4_JPS_CODE,
  problemHtml: JUMP_POINT_SEARCH_PROBLEM_HTML,
  analysisHtml: JUMP_POINT_SEARCH_ANALYSIS_HTML,
  generateSteps: (inputs) => {
    const presetKey = (inputs?.preset as string) || 'diagonal';
    return buildStage3Steps(presetKey);
  },
  renderCanvas: (container, step) => renderJumpPointSearchCanvas(container, step as JpsStep),
  renderCustomMetrics: (container, step) => renderJumpPointSearchCard2(container, step as JpsStep),
});
