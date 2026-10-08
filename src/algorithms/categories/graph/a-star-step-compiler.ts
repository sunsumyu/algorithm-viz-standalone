/**
 * A* 启发式搜索 (A* Pathfinding) 步进推演编译器
 * 评估函数 f(n) = g(n) + h(n)、Open/Closed 列表演变与最优路径重构
 */

import { StepBase } from '../../../core/step-visualizer';
import { HighlightTarget } from '../../../core/code-panel';

export const ASTAR_CODE_LINES: Record<string, Record<string, number | number[]>> = {
  init: { java: [3, 4, 5], cpp: [2, 3, 4], python: [2, 3], javascript: [2, 3] },
  reachgoal: { java: 8, cpp: 7, python: 6, javascript: 7 },
  poll: { java: [6, 7], cpp: [5, 6], python: [4, 5], javascript: [4, 5, 6] },
  expand: { java: [11, 12, 13, 14, 15], cpp: [11, 12, 13], python: [10, 11, 12], javascript: [10, 11, 12] },
  done: { java: 19, cpp: 16, python: 13, javascript: 17 },
};

export interface AStarNode {
  r: number;
  c: number;
  g: number;
  h: number;
  f: number;
  path: [number, number][];
}

export interface AStarStep extends StepBase {
  grid: number[][];
  start: [number, number];
  goal: [number, number];
  currentNode: [number, number] | null;
  g: number;
  h: number;
  f: number;
  openSet: [number, number][];
  closedSet: [number, number][];
  finalPath: [number, number][];
  action: 'init' | 'poll' | 'expand' | 'reach-goal' | 'done';
  statusText: string;
  log: string;
  codeLine: HighlightTarget;
  metrics?: Record<string, string | number>;
}

export const ASTAR_GRID = [
  [0, 0, 0, 0, 0, 0],
  [0, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 0, 0],
  [0, 1, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 0],
];

export const ASTAR_START: [number, number] = [0, 0];
export const ASTAR_GOAL: [number, number] = [4, 5];

function manhattan(r1: number, c1: number, r2: number, c2: number): number {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

export function buildAStarSteps(customGrid: number[][] = ASTAR_GRID): AStarStep[] {
  const steps: AStarStep[] = [];
  const grid = customGrid;
  const start = ASTAR_START;
  const goal: [number, number] = [grid.length - 1, grid[0].length - 1];
  const m = grid.length;
  const n = grid[0].length;

  const h0 = manhattan(start[0], start[1], goal[0], goal[1]);
  const startNode: AStarNode = {
    r: start[0],
    c: start[1],
    g: 0,
    h: h0,
    f: h0,
    path: [start],
  };

  const openList: AStarNode[] = [startNode];
  const closedSet = new Set<string>();
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  steps.push({
    grid,
    start,
    goal,
    currentNode: start,
    g: 0,
    h: h0,
    f: h0,
    openSet: [[start[0], start[1]]],
    closedSet: [],
    finalPath: [],
    action: 'init',
    statusText: `初始化 A* 寻路：起点 (${start[0]}, ${start[1]})，终点 (${goal[0]}, ${goal[1]})。起点启发距离 h=${h0}，推入 Open Set。`,
    log: `初始化: 起点 (0,0) -> 终点 (${goal[0]},${goal[1]}), h=${h0}`,
    codeLine: ASTAR_CODE_LINES.init,
  });

  let foundGoalNode: AStarNode | null = null;

  while (openList.length > 0) {
    openList.sort((a, b) => a.f - b.f);
    const cur = openList.shift()!;
    const key = `${cur.r},${cur.c}`;

    if (closedSet.has(key)) continue;
    closedSet.add(key);

    const closedArr: [number, number][] = Array.from(closedSet).map((k) => {
      const [r, c] = k.split(',').map(Number);
      return [r, c];
    });

    if (cur.r === goal[0] && cur.c === goal[1]) {
      foundGoalNode = cur;
      steps.push({
        grid,
        start,
        goal,
        currentNode: [cur.r, cur.c],
        g: cur.g,
        h: 0,
        f: cur.g,
        openSet: openList.map((node) => [node.r, node.c]),
        closedSet: closedArr,
        finalPath: cur.path,
        action: 'reach-goal',
        statusText: `🎯 成功到达目标终点 (${goal[0]}, ${goal[1]})！总实际代价 g=${cur.g}。开始重构最优路径。`,
        log: `到达终点 (${goal[0]}, ${goal[1]}): 步长 g=${cur.g}`,
        codeLine: ASTAR_CODE_LINES.reachgoal,
      });
      break;
    }

    steps.push({
      grid,
      start,
      goal,
      currentNode: [cur.r, cur.c],
      g: cur.g,
      h: cur.h,
      f: cur.f,
      openSet: openList.map((node) => [node.r, node.c]),
      closedSet: closedArr,
      finalPath: [],
      action: 'poll',
      statusText: `选取 Open Set 中 f 最小节点 (${cur.r}, ${cur.c})：g=${cur.g}, h=${cur.h} -> f=${cur.f}，移入 Closed Set 并拓展邻格。`,
      log: `考察格 (${cur.r}, ${cur.c}): f=${cur.f} (g=${cur.g}, h=${cur.h})`,
      codeLine: ASTAR_CODE_LINES.poll,
    });

    for (const [dr, dc] of dirs) {
      const nr = cur.r + dr;
      const nc = cur.c + dc;
      const nKey = `${nr},${nc}`;

      if (nr >= 0 && nr < m && nc >= 0 && nc < n && grid[nr][nc] === 0 && !closedSet.has(nKey)) {
        const nextG = cur.g + 1;
        const nextH = manhattan(nr, nc, goal[0], goal[1]);
        const nextF = nextG + nextH;

        openList.push({
          r: nr,
          c: nc,
          g: nextG,
          h: nextH,
          f: nextF,
          path: [...cur.path, [nr, nc]],
        });
      }
    }
  }

  if (foundGoalNode) {
    const closedArr: [number, number][] = Array.from(closedSet).map((k) => {
      const [r, c] = k.split(',').map(Number);
      return [r, c];
    });

    steps.push({
      grid,
      start,
      goal,
      currentNode: null,
      g: foundGoalNode.g,
      h: 0,
      f: foundGoalNode.g,
      openSet: [],
      closedSet: closedArr,
      finalPath: foundGoalNode.path,
      action: 'done',
      statusText: `🎉 A* 启发式最优路径探索完成！路径长度为 ${foundGoalNode.path.length} 格。`,
      log: `✓ 最优路径重构完成: 长度 ${foundGoalNode.path.length}`,
      codeLine: ASTAR_CODE_LINES.done,
    });
  }

  return steps;
}

export function withMetrics(steps: AStarStep[]): AStarStep[] {
  return steps.map((s) => ({
    ...s,
    metrics: {
      'metric-as-cur': s.currentNode ? `(${s.currentNode[0]}, ${s.currentNode[1]})` : '—',
      'metric-as-f': `${s.f}`,
      'metric-as-gh': `${s.g} / ${s.h}`,
      'metric-as-closed': `${s.closedSet.length}`,
    },
  }));
}
