/**
 * 岛屿数量可视化器（DFS 网格搜索）
 * LeetCode 200
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './islands.html?raw';

type CellState = 'water' | 'land' | 'visited';

export interface IslandsStep {
  grid: number[][];                 // 原始网格
  states: CellState[][];            // 每格状态
  current: [number, number] | null; // 当前 DFS 访问格
  stack: [number, number][];        // 当前 DFS 栈
  scan: [number, number] | null;    // 外层扫描到的位置
  count: number;                    // 岛屿数
  visitedLand: number;              // 已访问陆地数
  action: 'init' | 'scan' | 'found' | 'enter' | 'mark' | 'backtrack' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

function parseGrid(input: string): number[][] {
  const rows = input.split(/[;\n]+/).map((r) => r.trim()).filter((r) => r.length > 0);
  const grid = rows.map((r) => r.split('').filter((c) => c === '0' || c === '1').map((c) => parseInt(c, 10)));
  // 过滤空行
  return grid.filter((r) => r.length > 0);
}

export function buildIslandsSteps(grid: number[][]): IslandsStep[] {
  const steps: IslandsStep[] = [];
  const m = grid.length;
  if (m === 0) return steps;
  const n = grid[0].length;
  const states: CellState[][] = grid.map((row) => row.map((v) => (v === 1 ? 'land' : 'water')));
  let count = 0;
  let visitedLand = 0;
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  const snapshot = (extra: Partial<IslandsStep>): void => {
    steps.push({
      grid,
      states: states.map((r) => [...r]),
      current: extra.current ?? null,
      stack: extra.stack ? [...extra.stack] : [],
      scan: extra.scan ?? null,
      count,
      visitedLand,
      action: extra.action ?? 'scan',
      message: extra.message ?? '',
      log: extra.log ?? '',
      codeLine: extra.codeLine ?? 1,
    });
  };

  snapshot({
    action: 'init',
    message: `网格 ${m}×${n}，从左上角开始逐格扫描。遇到陆地（'1'）即为新岛屿，启动 DFS 标记整片连通陆地。`,
    log: `初始化 ${m}×${n} 网格。`,
    codeLine: [1, 2],
  });

  const dfs = (i: number, j: number, stack: [number, number][]): void => {
    if (i < 0 || i >= m || j < 0 || j >= n) return;
    if (states[i][j] !== 'land') return;
    states[i][j] = 'visited';
    visitedLand++;
    stack.push([i, j]);
    snapshot({
      current: [i, j], stack, action: 'enter',
      message: `进入 (${i},${j})，标记为已访问，加入 DFS 栈（深度 ${stack.length}）。向四个方向继续搜索。`,
      log: `DFS 访问 (${i},${j})。`,
      codeLine: [3, 4, 5],
    });
    for (const [di, dj] of dirs) {
      dfs(i + di, j + dj, stack);
    }
    stack.pop();
    if (stack.length === 0) {
      snapshot({
        current: null, stack, action: 'backtrack',
        message: `DFS 回溯完成，本岛屿所有连通陆地已标记。`,
        log: `岛屿 DFS 完成。`,
        codeLine: 6,
      });
    }
  };

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (states[i][j] === 'land') {
        count++;
        snapshot({
          scan: [i, j], action: 'found',
          message: `扫描到 (${i},${j}) 为陆地，发现第 ${count} 个岛屿！count++，启动 DFS。`,
          log: `发现岛屿 #${count} 于 (${i},${j})。`,
          codeLine: [7, 8],
        });
        dfs(i, j, []);
      } else {
        snapshot({
          scan: [i, j], action: 'scan',
          message: `扫描 (${i},${j})：${states[i][j] === 'water' ? '水，跳过' : '已访问，跳过'}。`,
          log: `跳过 (${i},${j})。`,
          codeLine: 7,
        });
      }
    }
  }

  snapshot({
    action: 'done',
    message: `扫描完成。共发现 ${count} 个岛屿。`,
    log: `完成，岛屿数 = ${count}。`,
    codeLine: 9,
  });
  return steps;
}

export class IslandsVisualizer extends StepVisualizer<IslandsStep> {
  protected codeLines = [
    'public int numIslands(int[][] grid) {',
    '    int m = grid.length, n = grid[0].length;',
    '    int count = 0;',
    '    boolean[][] visited = new boolean[m][n];',
    '    int[] dx = {0, 0, 1, -1}, dy = {1, -1, 0, 0};',
    '    for (int i = 0; i < m; i++)',
    '        for (int j = 0; j < n; j++)',
    '            if (grid[i][j] == 1 && !visited[i][j]) {',
    '                count++;',
    '                dfs(grid, i, j, visited, dx, dy);',
    '            }',
    '    return count;',
    '}',
    '// dfs: mark visited, recurse in 4 directions',
  ];
  protected codePanelTitle = '岛屿数量代码 (Java)';

  private inputEl: HTMLInputElement | null = null;
  private exampleButtons: NodeListOf<HTMLButtonElement> | null = null;
  private gridEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private scanEl: HTMLElement | null = null;
  private depthEl: HTMLElement | null = null;
  private visitedEl: HTMLElement | null = null;
  private countEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#isl-input');
    this.btnStart = this.root.querySelector('#isl-start');
    this.exampleButtons = this.root.querySelectorAll('.isl-example');
    this.gridEl = this.root.querySelector('#isl-grid');
    this.logEl = this.root.querySelector('#isl-log');
    this.scanEl = this.root.querySelector('#isl-scan');
    this.depthEl = this.root.querySelector('#isl-depth');
    this.visitedEl = this.root.querySelector('#isl-visited');
    this.countEl = this.root.querySelector('#isl-count');
    this.bindPlaybackControls({ message: 'step-message' });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.exampleButtons?.forEach((btn) => {
      btn.onclick = () => { if (this.inputEl) this.inputEl.value = btn.dataset.val || ''; this.start(); };
    });
  }

  protected buildSteps(): IslandsStep[] {
    const grid = parseGrid(this.inputEl?.value || '111;101;111');
    if (grid.length === 0 || grid[0].length === 0) {
      return buildIslandsSteps([[1, 1, 1], [1, 0, 1], [1, 1, 1]]);
    }
    return buildIslandsSteps(grid);
  }

  protected renderStep(step: IslandsStep): void {
    if (this.scanEl) this.scanEl.textContent = step.scan ? `(${step.scan[0]},${step.scan[1]})` : '-';
    if (this.depthEl) this.depthEl.textContent = String(step.stack.length);
    if (this.visitedEl) this.visitedEl.textContent = String(step.visitedLand);
    if (this.countEl) this.countEl.textContent = String(step.count);

    if (this.gridEl && step.grid.length > 0) {
      this.gridEl.innerHTML = '';
      const m = step.grid.length;
      const n = step.grid[0].length;
      this.gridEl.style.gridTemplateColumns = `repeat(${n}, 34px)`;
      const stackKey = new Set(step.stack.map(([i, j]) => `${i},${j}`));
      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          const cell = document.createElement('div');
          const state = step.states[i][j];
          cell.className = `isl-cell ${state}`;
          if (step.current && step.current[0] === i && step.current[1] === j) {
            cell.classList.add('current');
          } else if (stackKey.has(`${i},${j}`)) {
            cell.classList.add('stack');
          }
          cell.textContent = step.grid[i][j] === 1 ? '1' : '0';
          this.gridEl.appendChild(cell);
        }
      }
    }
    this.renderLogLine(step);
  }

  private renderLogLine(step: IslandsStep): void {
    const logEl = this.logEl;
    if (!logEl) return;
    logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      if (i === this.currentIndex) line.className = 'active';
      line.textContent = `${String(i + 1).padStart(2, '0')}. ${s.log}`;
      logEl.appendChild(line);
    });
    logEl.scrollTop = logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'islands',
  name: '岛屿数量（DFS 网格）',
  viewId: 'algo-islands-view',
  category: 'graph',
  description: 'DFS 遍历网格标记连通陆地，统计岛屿数量',
  icon: '🏝️',
  template,
  Visualizer: IslandsVisualizer,
  difficulty: 2,
  levelOrder: 1,
  learningGoal: '掌握 DFS/BFS 遍历网格求连通分量',
});
