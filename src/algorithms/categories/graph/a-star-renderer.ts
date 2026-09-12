/**
 * A* 启发式搜索可视化器 — 4-Card 标准现代架构
 * 评估函数 f(n) = g(n) + h(n)、Open/Closed 列表演变与最优路径重构
 */

import { registerDeclarativeAlgorithm } from '../../../core/declarative-algorithm-visualizer';
import { StepBase } from '../../../core/step-visualizer';
import {
  A_STAR_PROBLEM_HTML,
  A_STAR_ANALYSIS_HTML,
  A_STAR_CODE_LANGUAGES,
} from './a-star-problem-content';

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
  codeLine: number | number[];
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

export function buildAStarSteps(): AStarStep[] {
  const steps: AStarStep[] = [];
  const grid = ASTAR_GRID;
  const start = ASTAR_START;
  const goal = ASTAR_GOAL;
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
    log: `初始化: 起点 (0,0) -> 终点 (4,5), h=${h0}`,
    codeLine: [3, 4, 5],
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
        codeLine: 7,
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
      codeLine: [6, 8],
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
      codeLine: 18,
    });
  }

  return steps;
}

/** 附加指标卡快照（当前节点 / f 值 / g·h 值 / Closed 集合规模） */
function withMetrics(steps: AStarStep[]): AStarStep[] {
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

/** 主视觉：A* 网格沙盘（Open/Closed/路径着色 + f=g+h 公式条） */
export function renderAStarCanvas(container: HTMLElement, step: AStarStep): void {
  const { grid, start, goal, currentNode, g, h, f, openSet, closedSet, finalPath } = step;
  const m = grid.length;
  const n = grid[0].length;

  const openMap = new Set(openSet.map(([r, c]) => `${r},${c}`));
  const closedMap = new Set(closedSet.map(([r, c]) => `${r},${c}`));
  const pathMap = new Set(finalPath.map(([r, c]) => `${r},${c}`));

  const cellBase =
    'width: 38px; height: 38px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-family: \'JetBrains Mono\', monospace; font-size: 11px; font-weight: 800; border: 1.5px solid transparent; box-sizing: border-box;';

  let cellsHtml = '';
  for (let r = 0; r < m; r++) {
    for (let c = 0; c < n; c++) {
      const isStart = start[0] === r && start[1] === c;
      const isGoal = goal[0] === r && goal[1] === c;
      const isWall = grid[r][c] === 1;
      const isCurrent = currentNode && currentNode[0] === r && currentNode[1] === c;
      const isPath = pathMap.has(`${r},${c}`);
      const isOpen = openMap.has(`${r},${c}`);
      const isClosed = closedMap.has(`${r},${c}`);

      let style = cellBase;
      let label = '';
      if (isStart) {
        style += 'background: #dbeafe; color: #1d4ed8; border-color: #3b82f6;';
        label = 'S';
      } else if (isGoal) {
        style += 'background: #dcfce7; color: #15803d; border-color: #22c55e;';
        label = 'G';
      } else if (isWall) {
        style += 'background: #334155; color: #e2e8f0; border-color: #334155;';
        label = '■';
      } else if (isPath) {
        style += 'background: #10b981; color: #ffffff; border-color: #059669; font-weight: 900;';
        label = '★';
      } else if (isOpen) {
        style += 'background: #fef9c3; color: #a16207; border-color: #ca8a04;';
        label = 'o';
      } else if (isClosed) {
        style += 'background: #f1f5f9; color: #64748b; border-color: #cbd5e1;';
        label = '·';
      }

      if (isCurrent) {
        style += 'background: #fed7aa; color: #c2410c; border-color: #ea580c; transform: scale(1.06); box-shadow: 0 0 0 2px rgba(234, 88, 12, 0.4); z-index: 2;';
      }

      cellsHtml += `<div style="${style}"><span>${label}</span></div>`;
    }
  }

  container.innerHTML = `
    <div style="width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; padding: 8px; box-sizing: border-box;">
      <div style="display: inline-grid; grid-template-columns: repeat(${n}, 38px); gap: 6px; padding: 10px; background: #ffffff; border-radius: 12px; border: 1px solid #e2e8f0; user-select: none;">
        ${cellsHtml}
      </div>
      <div style="font-family: monospace; font-size: 11px; font-weight: 700; color: #475569;">f(n) = g(${g}) + h(${h}) = ${f}</div>
    </div>
  `;
}

registerDeclarativeAlgorithm({
  id: 'a-star',
  name: 'A* 启发式搜索',
  category: 'graph',
  description: '结合实际路径代价与曼哈顿启发距离在网格中快速寻找最优路径',
  icon: '⭐',
  difficulty: 2,
  levelOrder: 9,
  learningGoal: '掌握评估函数 f(n)=g(n)+h(n) 的设计与 Open/Closed 优先队列管理',
  inputs: [],
  presets: [
    { label: '默认网格 (5×6 含障碍)', values: {} },
  ],
  metrics: [
    { id: 'metric-as-cur', label: '当前考察节点', color: '#ea580c' },
    { id: 'metric-as-f', label: 'f 值 (估计总代价)', color: '#3b82f6' },
    { id: 'metric-as-gh', label: 'g / h 值', color: '#10b981' },
    { id: 'metric-as-closed', label: 'Closed 集合数', color: '#64748b' },
  ],
  legend: [
    { label: '起点', color: '#3b82f6' },
    { label: '终点', color: '#22c55e' },
    { label: '障碍物', color: '#334155' },
    { label: '待选 Open', color: '#fef08a' },
    { label: '当前考察', color: '#ea580c' },
    { label: '最优路径', color: '#10b981' },
  ],
  codeLanguages: A_STAR_CODE_LANGUAGES,
  problemHtml: A_STAR_PROBLEM_HTML,
  analysisHtml: A_STAR_ANALYSIS_HTML,
  generateSteps: (inputs) => withMetrics(buildAStarSteps()),
  renderCanvas: (container, step) => renderAStarCanvas(container, step as AStarStep),
});
