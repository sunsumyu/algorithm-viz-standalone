/**
 * A* 启发式搜索可视化器 — 4-Card 标准现代架构
 * 评估函数 f(n) = g(n) + h(n)、Open/Closed 列表演变与最优路径重构
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  A_STAR_PROBLEM_HTML,
  A_STAR_ANALYSIS_HTML,
  A_STAR_CODE_LANGUAGES,
} from './a-star-problem-content';
import template from './a-star.html?raw';

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

export class AStarVisualizer extends StepVisualizer<AStarStep> {
  protected codeLanguages = A_STAR_CODE_LANGUAGES;
  protected codeLines = A_STAR_CODE_LANGUAGES['java'];
  protected codePanelTitle = 'A* 启发式寻路 代码调试';

  private gridCanvas: HTMLElement | null = null;
  private metricCurNodeEl: HTMLElement | null = null;
  private metricGValEl: HTMLElement | null = null;
  private metricHValEl: HTMLElement | null = null;
  private metricFValEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.gridCanvas = this.root.querySelector('#a-star-grid-container');
    this.metricCurNodeEl = this.root.querySelector('#metric-current');
    this.metricFValEl = this.root.querySelector('#metric-f-cost');
    this.metricGValEl = this.root.querySelector('#metric-gh-cost');
    this.metricHValEl = this.root.querySelector('#metric-closed-count');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#as-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: A_STAR_PROBLEM_HTML,
      analysisHtml: A_STAR_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): AStarStep[] {
    return buildAStarSteps();
  }

  protected renderStep(step: AStarStep): void {
    const { grid, start, goal, currentNode, g, h, f, openSet, closedSet, finalPath, statusText, action } = step;
    const m = grid.length;
    const n = grid[0].length;

    // 1. 渲染网格矩阵
    if (this.gridCanvas) {
      this.gridCanvas.style.gridTemplateColumns = `repeat(${n}, 38px)`;
      const openMap = new Set(openSet.map(([r, c]) => `${r},${c}`));
      const closedMap = new Set(closedSet.map(([r, c]) => `${r},${c}`));
      const pathMap = new Set(finalPath.map(([r, c]) => `${r},${c}`));

      let html = '';
      for (let r = 0; r < m; r++) {
        for (let c = 0; c < n; c++) {
          const isStart = start[0] === r && start[1] === c;
          const isGoal = goal[0] === r && goal[1] === c;
          const isWall = grid[r][c] === 1;
          const isCurrent = currentNode && currentNode[0] === r && currentNode[1] === c;
          const isPath = pathMap.has(`${r},${c}`);
          const isOpen = openMap.has(`${r},${c}`);
          const isClosed = closedMap.has(`${r},${c}`);

          let cls = 'ast-cell';
          let label = '';
          if (isStart) {
            cls += ' is-start';
            label = 'S';
          } else if (isGoal) {
            cls += ' is-goal';
            label = 'G';
          } else if (isWall) {
            cls += ' is-wall';
            label = '■';
          } else if (isPath) {
            cls += ' is-path';
            label = '★';
          } else if (isOpen) {
            cls += ' is-open';
            label = 'o';
          } else if (isClosed) {
            cls += ' is-closed';
            label = '·';
          }

          if (isCurrent) cls += ' is-current';

          html += `<div class="${cls}"><span>${label}</span></div>`;
        }
      }
      this.gridCanvas.innerHTML = html;
    }

    // 2. 更新状态监视器
    if (this.metricCurNodeEl) this.metricCurNodeEl.textContent = currentNode ? `(${currentNode[0]}, ${currentNode[1]})` : '—';
    if (this.metricFValEl) this.metricFValEl.textContent = `${f}`;
    if (this.metricGValEl) this.metricGValEl.textContent = `${g} / ${h}`;
    if (this.metricHValEl) this.metricHValEl.textContent = `${step.closedSet.length}`;

    if (this.formulaActionEl) {
      this.formulaActionEl.textContent = `f(n) = g(${g}) + h(${h}) = ${f}`;
    }

    if (this.liveTextEl) this.liveTextEl.textContent = statusText;

    // 3. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        action === 'done' || action === 'reach-goal'
          ? '#f0fdf4'
          : action === 'poll'
          ? '#eff6ff'
          : '#f8fafc';
      logEntry.style.color =
        action === 'done' || action === 'reach-goal'
          ? '#15803d'
          : action === 'poll'
          ? '#1d4ed8'
          : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'done' || action === 'reach-goal'
          ? '#bbf7d0'
          : action === 'poll'
          ? '#bfdbfe'
          : '#e2e8f0');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    const badgeOpen = this.root?.querySelector('#badge-open-count');
    if (badgeOpen) badgeOpen.textContent = `Open 集合: ${step.openSet.length}`;
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
  }
}

registerAlgorithm({
  id: 'a-star',
  name: 'A* 启发式搜索',
  viewId: 'algo-a-star-view',
  category: 'graph',
  description: '结合实际路径代价与曼哈顿启发距离在网格中快速寻找最优路径',
  icon: '⭐',
  difficulty: 2,
  levelOrder: 9,
  learningGoal: '掌握评估函数 f(n)=g(n)+h(n) 的设计与 Open/Closed 优先队列管理',
  template,
  Visualizer: AStarVisualizer,
});
