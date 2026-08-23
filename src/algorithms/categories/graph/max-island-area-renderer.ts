/**
 * 最大岛屿面积可视化器
 * LeetCode 695
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './max-island-area.html?raw';

type CellState = 'water' | 'land' | 'visited' | 'max-island' | 'prev-island';

interface MaxIslandAreaStep {
  grid: number[][];
  states: CellState[][];
  current: [number, number] | null;
  stack: [number, number][];
  currentArea: number;
  maxArea: number;
  islandCount: number;
  maxIslandCells: Set<string>;
  prevIslandCells: Set<string>;
  action: 'init' | 'scan' | 'found' | 'explore' | 'compare' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

function parseGrid(input: string): number[][] {
  const rows = input.split(/[;\n]+/).map((r) => r.trim()).filter((r) => r.length > 0);
  return rows.map((r) =>
    r.split(',').map((c) => parseInt(c.trim(), 10))
  ).filter((r) => r.length > 0 && !r.some(isNaN));
}

function buildMaxIslandAreaSteps(grid: number[][]): MaxIslandAreaStep[] {
  const steps: MaxIslandAreaStep[] = [];
  const m = grid.length;
  if (m === 0) return steps;
  const n = grid[0].length;
  const states: CellState[][] = grid.map((row) =>
    row.map((v) => (v === 1 ? 'land' : 'water'))
  );
  let maxArea = 0;
  let islandCount = 0;
  let currentArea = 0;
  const maxIslandCells = new Set<string>();
  let prevIslandCells = new Set<string>();
  const dirs: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  const snapshot = (extra: Partial<MaxIslandAreaStep>): void => {
    steps.push({
      grid,
      states: states.map((r) => [...r]),
      current: extra.current ?? null,
      stack: extra.stack ? [...extra.stack] : [],
      currentArea,
      maxArea,
      islandCount,
      maxIslandCells: new Set(maxIslandCells),
      prevIslandCells: new Set(prevIslandCells),
      action: extra.action ?? 'scan',
      message: extra.message ?? '',
      log: extra.log ?? '',
      codeLine: extra.codeLine ?? 1,
    });
  };

  snapshot({
    action: 'init',
    message: `网格 ${m}x${n}，逐格扫描寻找陆地。对每座岛屿用 DFS 计算面积，追踪最大面积。`,
    log: `初始化 ${m}x${n} 网格。`,
    codeLine: [1, 2],
  });

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (states[i][j] === 'land') {
        islandCount++;
        currentArea = 0;
        const thisIslandCells = new Set<string>();

        snapshot({
          current: [i, j],
          action: 'found',
          message: `扫描到 (${i},${j}) 为陆地！发现第 ${islandCount} 个岛屿，启动 DFS 计算面积。`,
          log: `发现岛屿 #${islandCount} 于 (${i},${j})，开始计算面积。`,
          codeLine: [3, 4],
        });

        const stack: [number, number][] = [[i, j]];
        states[i][j] = 'visited';
        currentArea = 1;
        thisIslandCells.add(`${i},${j}`);

        snapshot({
          current: [i, j],
          stack,
          action: 'explore',
          message: `将 (${i},${j}) 入栈，标记已访问。当前面积 = 1。`,
          log: `DFS 起点 (${i},${j})，面积 = 1。`,
          codeLine: [5, 6],
        });

        while (stack.length > 0) {
          const [ci, cj] = stack[stack.length - 1];
          let found = false;

          for (const [di, dj] of dirs) {
            const ni = ci + di;
            const nj = cj + dj;
            if (ni >= 0 && ni < m && nj >= 0 && nj < n && states[ni][nj] === 'land') {
              states[ni][nj] = 'visited';
              currentArea++;
              thisIslandCells.add(`${ni},${nj}`);
              stack.push([ni, nj]);

              snapshot({
                current: [ni, nj],
                stack,
                action: 'explore',
                message: `发现 (${ni},${nj}) 为陆地，入栈。当前面积 = ${currentArea}。`,
                log: `DFS 访问 (${ni},${nj})，面积 = ${currentArea}。`,
                codeLine: [7, 8, 9],
              });
              found = true;
              break;
            }
          }

          if (!found) {
            stack.pop();
          }
        }

        // Compare with max
        if (currentArea > maxArea) {
          // Previous max island becomes prev-island
          prevIslandCells = new Set(maxIslandCells);
          for (const key of prevIslandCells) {
            const [r, c] = key.split(',').map(Number);
            if (states[r][c] !== 'water') states[r][c] = 'prev-island';
          }
          maxArea = currentArea;
          maxIslandCells.clear();
          for (const key of thisIslandCells) {
            maxIslandCells.add(key);
          }
          // Mark current max island
          for (const key of maxIslandCells) {
            const [r, c] = key.split(',').map(Number);
            states[r][c] = 'max-island';
          }

          snapshot({
            current: null,
            stack: [],
            action: 'compare',
            message: `岛屿 #${islandCount} 面积 = ${currentArea}，超过当前最大值 ${maxArea === currentArea ? currentArea : '之前'}！更新最大面积 = ${maxArea}。`,
            log: `岛屿 #${islandCount} 面积 = ${currentArea}，最大面积更新为 ${maxArea}。`,
            codeLine: [10, 11],
          });
        } else {
          // Not new max - mark as prev
          for (const key of thisIslandCells) {
            const [r, c] = key.split(',').map(Number);
            states[r][c] = 'prev-island';
          }
          snapshot({
            current: null,
            stack: [],
            action: 'compare',
            message: `岛屿 #${islandCount} 面积 = ${currentArea}，未超过最大值 ${maxArea}。`,
            log: `岛屿 #${islandCount} 面积 = ${currentArea}，最大面积仍为 ${maxArea}。`,
            codeLine: 10,
          });
        }
      } else {
        snapshot({
          current: null,
          action: 'scan',
          message: `扫描 (${i},${j})：${states[i][j] === 'water' ? '水，跳过' : '已访问，跳过'}。`,
          log: `跳过 (${i},${j})。`,
          codeLine: 3,
        });
      }
    }
  }

  snapshot({
    action: 'done',
    message: `扫描完成！共 ${islandCount} 座岛屿，最大岛屿面积为 ${maxArea}。`,
    log: `完成，最大面积 = ${maxArea}。`,
    codeLine: 12,
  });

  return steps;
}

export class MaxIslandAreaVisualizer extends StepVisualizer<MaxIslandAreaStep> {
  protected codeLines = [
    'public int maxAreaOfIsland(int[][] grid) {',
    '    int m = grid.length, n = grid[0].length;',
    '    int maxArea = 0;',
    '    boolean[][] visited = new boolean[m][n];',
    '    int[] dx = {0, 0, 1, -1}, dy = {1, -1, 0, 0};',
    '    for (int i = 0; i < m; i++)',
    '        for (int j = 0; j < n; j++)',
    '            if (grid[i][j] == 1 && !visited[i][j]) {',
    '                int area = 0;',
    '                Deque<int[]> stack = new ArrayDeque<>();',
    '                stack.push(new int[]{i, j});',
    '                visited[i][j] = true;',
    '                while (!stack.isEmpty()) {',
    '                    int[] cell = stack.peek();',
    '                    for (int d = 0; d < 4; d++) {',
    '                        int ni = cell[0] + dx[d];',
    '                        int nj = cell[1] + dy[d];',
    '                        if (ni >= 0 && ni < m && nj >= 0 && nj < n',
    '                            && grid[ni][nj] == 1 && !visited[ni][nj]) {',
    '                            visited[ni][nj] = true;',
    '                            area++;',
    '                            stack.push(new int[]{ni, nj});',
    '                        }',
    '                    }',
    '                }',
    '                maxArea = Math.max(maxArea, area);',
    '            }',
    '    return maxArea;',
    '}',
  ];
  protected codePanelTitle = '最大岛屿面积代码 (Java)';

  private inputEl: HTMLInputElement | null = null;
  private gridEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private currentAreaEl: HTMLElement | null = null;
  private maxAreaEl: HTMLElement | null = null;
  private islandCountEl: HTMLElement | null = null;
  private depthEl: HTMLElement | null = null;
  private stackVisEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#mia-input');
    this.btnStart = this.root.querySelector('#mia-start');
    this.gridEl = this.root.querySelector('#mia-grid');
    this.logEl = this.root.querySelector('#mia-log');
    this.currentAreaEl = this.root.querySelector('#mia-current-area');
    this.maxAreaEl = this.root.querySelector('#mia-max-area');
    this.islandCountEl = this.root.querySelector('#mia-island-count');
    this.depthEl = this.root.querySelector('#mia-depth');
    this.stackVisEl = this.root.querySelector('#mia-stack-vis');
    this.bindPlaybackControls({
      message: 'step-message',
      speed: 'mia-speed',
      speedLabel: 'mia-speed-label',
      counter: 'step-counter',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.root.querySelectorAll<HTMLButtonElement>('.mia-example').forEach((btn) => {
      btn.onclick = () => {
        if (this.inputEl) this.inputEl.value = btn.dataset.val || '';
        this.start();
      };
    });
  }

  protected buildSteps(): MaxIslandAreaStep[] {
    const grid = parseGrid(this.inputEl?.value || '0,0,1,0;1,1,1,0;0,1,0,0;1,1,0,0');
    if (grid.length === 0 || grid[0].length === 0) {
      return buildMaxIslandAreaSteps([[0, 1, 0], [1, 1, 0], [0, 1, 0]]);
    }
    return buildMaxIslandAreaSteps(grid);
  }

  protected renderStep(step: MaxIslandAreaStep): void {
    if (this.currentAreaEl) this.currentAreaEl.textContent = String(step.currentArea);
    if (this.maxAreaEl) this.maxAreaEl.textContent = String(step.maxArea);
    if (this.islandCountEl) this.islandCountEl.textContent = String(step.islandCount);
    if (this.depthEl) this.depthEl.textContent = String(step.stack.length);

    if (this.stackVisEl) {
      this.stackVisEl.innerHTML = '';
      step.stack.forEach(([r, c]) => {
        const item = document.createElement('div');
        item.className = 'mia-stack-item';
        item.textContent = `(${r},${c})`;
        this.stackVisEl?.appendChild(item);
      });
    }

    if (this.gridEl && step.grid.length > 0) {
      this.gridEl.innerHTML = '';
      const m = step.grid.length;
      const n = step.grid[0].length;
      this.gridEl.style.gridTemplateColumns = `repeat(${n}, 34px)`;

      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          const cell = document.createElement('div');
          const state = step.states[i][j];
          cell.className = `mia-cell ${state}`;

          if (step.current && step.current[0] === i && step.current[1] === j) {
            cell.classList.add('current');
          }

          cell.textContent = step.grid[i][j] === 1 ? '1' : '0';
          this.gridEl.appendChild(cell);
        }
      }
    }
    this.renderLogLine(step);
  }

  private renderLogLine(step: MaxIslandAreaStep): void {
    const logEl = this.logEl;
    if (!logEl) return;
    logEl.innerHTML = '';
    this.steps.slice(0, this.currentIndex + 1).forEach((s, i) => {
      const line = document.createElement('div');
      if (i === this.currentIndex) line.className = 'active';
      line.textContent = `${String(i + 1).padStart(2, '0')}. ${s.log}`;
      logEl?.appendChild(line);
    });
    logEl.scrollTop = logEl.scrollHeight;
  }
}

registerAlgorithm({
  id: 'max-island-area',
  name: '最大岛屿面积',
  viewId: 'algo-max-island-area-view',
  category: 'graph',
  description: 'DFS 计算每座岛屿面积，追踪最大值',
  icon: '📐',
  template,
  Visualizer: MaxIslandAreaVisualizer,
  difficulty: 2,
  levelOrder: 6,
  learningGoal: '掌握 DFS 计算连通分量大小并追踪极值',
});
