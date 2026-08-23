/**
 * A* 寻路算法可视化器
 * f(n) = g(n) + h(n)，曼哈顿距离启发
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './a-star.html?raw';

type CellType = 'empty' | 'obstacle' | 'start' | 'end';
type CellState = 'empty' | 'obstacle' | 'start' | 'end' | 'open' | 'closed' | 'current' | 'path';

interface AStarStep {
  grid: number[][];
  cellStates: CellState[][];
  gValues: number[][];
  hValues: number[][];
  fValues: number[][];
  openSet: Set<string>;
  closedSet: Set<string>;
  current: [number, number] | null;
  path: [number, number][];
  start: [number, number];
  end: [number, number];
  pathLength: number;
  phase: 'init' | 'expand' | 'found' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

function parseGrid(input: string): number[][] {
  const rows = input.split(/[;\n]+/).map(r => r.trim()).filter(r => r.length > 0);
  return rows.map(r =>
    r.split(',').map(c => parseInt(c.trim(), 10))
  ).filter(r => r.length > 0 && !r.some(isNaN));
}

function manhattan(r1: number, c1: number, r2: number, c2: number): number {
  return Math.abs(r1 - r2) + Math.abs(c1 - c2);
}

function buildAStarSteps(grid: number[][]): AStarStep[] {
  const steps: AStarStep[] = [];
  const m = grid.length;
  if (m === 0) return steps;
  const n = grid[0].length;

  const start: [number, number] = [0, 0];
  const end: [number, number] = [m - 1, n - 1];

  const cellStates: CellState[][] = grid.map((row, r) =>
    row.map((v, c) => {
      if (r === start[0] && c === start[1]) return 'start';
      if (r === end[0] && c === end[1]) return 'end';
      return v === 1 ? 'obstacle' : 'empty';
    })
  );

  const gValues: number[][] = Array.from({ length: m }, () => new Array(n).fill(Infinity));
  const hValues: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));
  const fValues: number[][] = Array.from({ length: m }, () => new Array(n).fill(Infinity));
  const openSet = new Set<string>();
  const closedSet = new Set<string>();
  const parent = new Map<string, string>();
  const dirs: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  gValues[start[0]][start[1]] = 0;
  hValues[start[0]][start[1]] = manhattan(start[0], start[1], end[0], end[1]);
  fValues[start[0]][start[1]] = hValues[start[0]][start[1]];
  openSet.add(`${start[0]},${start[1]}`);

  const key = (r: number, c: number) => `${r},${c}`;

  const snap = (current: [number, number] | null, path: [number, number][],
    phase: AStarStep['phase'], msg: string, log: string, code: number | number[]) => {
    steps.push({
      grid: grid.map(r => [...r]),
      cellStates: cellStates.map(r => [...r]),
      gValues: gValues.map(r => [...r]),
      hValues: hValues.map(r => [...r]),
      fValues: fValues.map(r => [...r]),
      openSet: new Set(openSet),
      closedSet: new Set(closedSet),
      current,
      path: [...path],
      start,
      end,
      pathLength: path.length,
      phase,
      message: msg,
      log,
      codeLine: code,
    });
  };

  // Init
  snap(null, [], 'init',
    `初始化：${m}x${n} 网格，起点 S=(${start[0]},${start[1]})，终点 E=(${end[0]},${end[1]})。将起点加入 Open Set。g=${gValues[start[0]][start[1]]}, h=${hValues[start[0]][start[1]]}, f=${fValues[start[0]][start[1]]}。`,
    '初始化: 起点入队', 0);

  let found = false;

  while (openSet.size > 0) {
    // Find node with min f in open set
    let minF = Infinity;
    let curR = -1, curC = -1;
    for (const k of openSet) {
      const [r, c] = k.split(',').map(Number);
      if (fValues[r][c] < minF) {
        minF = fValues[r][c];
        curR = r;
        curC = c;
      }
    }

    if (curR === -1) break;
    const cur: [number, number] = [curR, curC];

    // Mark current
    if (cellStates[curR][curC] !== 'start' && cellStates[curR][curC] !== 'end') {
      cellStates[curR][curC] = 'current';
    }

    snap(cur, [], 'expand',
      `从 Open Set 取出 f 最小的节点 (${curR},${curC})，f=${fValues[curR][curC]}, g=${gValues[curR][curC]}, h=${hValues[curR][curC]}。`,
      `展开 (${curR},${curC}) f=${fValues[curR][curC]}`, [1, 2]);

    // Check if reached end
    if (curR === end[0] && curC === end[1]) {
      // Reconstruct path
      const path: [number, number][] = [];
      let pk = key(end[0], end[1]);
      while (pk) {
        const [pr, pc] = pk.split(',').map(Number);
        path.unshift([pr, pc]);
        pk = parent.get(pk)!;
      }

      // Mark path cells
      for (const [pr, pc] of path) {
        if (cellStates[pr][pc] !== 'start' && cellStates[pr][pc] !== 'end') {
          cellStates[pr][pc] = 'path';
        }
      }

      found = true;
      snap(cur, path, 'found',
        `到达终点 (${end[0]},${end[1]})！路径长度=${path.length} 步。`,
        `找到路径! 长度=${path.length}`, [5, 6]);

      snap(null, path, 'done',
        `A* 完成！最短路径长度=${path.length} 步。`,
        '完成', 7);
      return steps;
    }

    // Move to closed
    openSet.delete(key(curR, curC));
    closedSet.add(key(curR, curC));
    if (cellStates[curR][curC] === 'current') {
      cellStates[curR][curC] = 'closed';
    }

    // Explore neighbors
    let expanded = 0;
    for (const [dr, dc] of dirs) {
      const nr = curR + dr;
      const nc = curC + dc;
      if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;
      if (grid[nr][nc] === 1) continue;
      if (closedSet.has(key(nr, nc))) continue;

      const newG = gValues[curR][curC] + 1;
      if (newG < gValues[nr][nc]) {
        gValues[nr][nc] = newG;
        hValues[nr][nc] = manhattan(nr, nc, end[0], end[1]);
        fValues[nr][nc] = newG + hValues[nr][nc];
        parent.set(key(nr, nc), key(curR, curC));

        if (!openSet.has(key(nr, nc))) {
          openSet.add(key(nr, nc));
          if (cellStates[nr][nc] !== 'start' && cellStates[nr][nc] !== 'end') {
            cellStates[nr][nc] = 'open';
          }
          expanded++;
        }
      }
    }

    snap(null, [], 'expand',
      `节点 (${curR},${curC}) 扩展了 ${expanded} 个邻居。Open=${openSet.size}, Closed=${closedSet.size}。`,
      `扩展${expanded}个邻居, Open=${openSet.size}`, [3, 4]);
  }

  if (!found) {
    snap(null, [], 'done',
      `Open Set 为空但未到达终点，不存在可行路径。`,
      '无路径', 7);
  }

  return steps;
}

export class AStarVisualizer extends StepVisualizer<AStarStep> {
  protected codeLines = [
    'List<int[]> aStar(int[][] grid, int[] start, int[] end) {',
    '    PriorityQueue<int[]> openSet = new PriorityQueue<>((a, b) -> a[2] - b[2]);',
    '    int[][] gValues = init(INF); gValues[start[0]][start[1]] = 0;',
    '    int[][] hValues = initManhattan(end);',
    '    for (int[] nb : neighbors(current)) {',
    '        int newG = gValues[r][c] + 1;',
    '        if (newG < gValues[nr][nc]) {',
    '            gValues[nr][nc] = newG;',
    '            fValues[nr][nc] = newG + hValues[nr][nc];',
    '            openSet.add(new int[]{nr, nc, fValues[nr][nc]});',
    '        }',
    '    }',
    '    return reconstructPath(parent, end);',
    '}',
  ];
  protected codePanelTitle = 'A* 算法代码 (Java)';

  private gridEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private openEl: HTMLElement | null = null;
  private closedEl: HTMLElement | null = null;
  private currentEl: HTMLElement | null = null;
  private pathLenEl: HTMLElement | null = null;
  private infoEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.gridEl = this.root.querySelector('#astar-grid');
    this.logEl = this.root.querySelector('#astar-log');
    this.openEl = this.root.querySelector('#astar-open');
    this.closedEl = this.root.querySelector('#astar-closed');
    this.currentEl = this.root.querySelector('#astar-current');
    this.pathLenEl = this.root.querySelector('#astar-path-len');
    this.infoEl = this.root.querySelector('#astar-info');
    this.btnStart = this.root.querySelector('#astar-start');
    this.bindPlaybackControls({
      speed: 'astar-speed',
      speedLabel: 'astar-speed-label',
      message: 'step-message',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
  }

  protected buildSteps(): AStarStep[] {
    const defaultGrid = [
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 1, 0],
      [0, 1, 0, 0, 0],
      [0, 0, 0, 0, 0],
    ];
    return buildAStarSteps(defaultGrid);
  }

  protected renderStep(step: AStarStep): void {
    if (this.openEl) this.openEl.textContent = String(step.openSet.size);
    if (this.closedEl) this.closedEl.textContent = String(step.closedSet.size);
    if (this.currentEl) {
      this.currentEl.textContent = step.current ? `(${step.current[0]},${step.current[1]})` : '-';
    }
    if (this.pathLenEl) {
      this.pathLenEl.textContent = step.pathLength > 0 ? String(step.pathLength) : '-';
    }

    if (this.infoEl) {
      if (step.current) {
        (this.infoEl as HTMLElement).style.display = '';
        const [r, c] = step.current;
        this.infoEl.innerHTML = `f(${r},${c}) = g(${step.gValues[r][c]}) + h(${step.hValues[r][c]}) = <strong>${step.fValues[r][c]}</strong>`;
      } else {
        (this.infoEl as HTMLElement).style.display = 'none';
      }
    }

    this.renderGrid(step);
    this.renderLogLine(step);
  }

  private renderGrid(step: AStarStep): void {
    if (!this.gridEl) return;
    this.gridEl.innerHTML = '';
    const m = step.grid.length;
    const n = step.grid[0].length;
    this.gridEl.style.gridTemplateColumns = `repeat(${n}, 56px)`;

    for (let r = 0; r < m; r++) {
      for (let c = 0; c < n; c++) {
        const cell = document.createElement('div');
        cell.className = `astar-cell ${step.cellStates[r][c]}`;

        const state = step.cellStates[r][c];
        if (state === 'start') {
          cell.textContent = 'S';
        } else if (state === 'end') {
          cell.textContent = 'E';
        } else if (state === 'obstacle') {
          cell.textContent = '#';
        } else if (state === 'open' || state === 'closed' || state === 'current' || state === 'path') {
          const g = step.gValues[r][c];
          const h = step.hValues[r][c];
          const f = step.fValues[r][c];
          if (f < Infinity) {
            cell.innerHTML = `<span class="astar-f-val">f=${f}</span><span class="astar-gh-val">g=${g} h=${h}</span>`;
          }
        }

        this.gridEl?.appendChild(cell);
      }
    }
  }

  private renderLogLine(step: AStarStep): void {
    if (!this.logEl) return;
    this.logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      if (i === this.currentIndex) line.className = 'active';
      line.textContent = `${String(i + 1).padStart(2, '0')}. ${s.log}`;
      this.logEl?.appendChild(line);
    });
    this.logEl.scrollTop = this.logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'a-star',
  name: 'A*算法',
  viewId: 'algo-a-star-view',
  category: 'graph',
  description: '启发式搜索 A* 寻路算法，f(n) = g(n) + h(n)',
  icon: '⭐',
  template,
  Visualizer: AStarVisualizer,
  difficulty: 3,
  levelOrder: 27,
  learningGoal: '理解 A* 算法的启发式搜索策略和最优性保证',
});

export {};
