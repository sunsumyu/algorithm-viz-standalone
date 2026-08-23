/**
 * 沉没孤岛可视化器
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './sink-islands.html?raw';

type CellState = 'water' | 'land' | 'sinking' | 'sunk' | 'visited';

interface SinkIslandsStep {
  grid: number[][];
  states: CellState[][];
  current: [number, number] | null;
  sunkCount: number;
  islandCount: number;
  currentIsland: number;
  remainingLand: number;
  sunkCells: string[];
  action: 'init' | 'count' | 'found' | 'sink' | 'island-done' | 'done';
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

function buildSinkIslandsSteps(grid: number[][]): SinkIslandsStep[] {
  const steps: SinkIslandsStep[] = [];
  const m = grid.length;
  if (m === 0) return steps;
  const n = grid[0].length;

  // Deep copy for mutation
  const workGrid = grid.map((r) => [...r]);
  const states: CellState[][] = workGrid.map((row) =>
    row.map((v) => (v === 1 ? 'land' : 'water'))
  );

  // Count islands first
  let islandCount = 0;
  let totalLand = 0;
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (workGrid[i][j] === 1) totalLand++;
    }
  }
  const tempVisited = new Set<string>();
  const dirs: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (workGrid[i][j] === 1 && !tempVisited.has(`${i},${j}`)) {
        islandCount++;
        const q: [number, number][] = [[i, j]];
        tempVisited.add(`${i},${j}`);
        while (q.length > 0) {
          const [ci, cj] = q.shift()!;
          for (const [di, dj] of dirs) {
            const ni = ci + di;
            const nj = cj + dj;
            if (ni >= 0 && ni < m && nj >= 0 && nj < n && workGrid[ni][nj] === 1 && !tempVisited.has(`${ni},${nj}`)) {
              tempVisited.add(`${ni},${nj}`);
              q.push([ni, nj]);
            }
          }
        }
      }
    }
  }

  let sunkCount = 0;
  let currentIsland = 0;
  let remainingLand = totalLand;
  const sunkCells: string[] = [];

  const snapshot = (extra: Partial<SinkIslandsStep>): void => {
    steps.push({
      grid: workGrid,
      states: states.map((r) => [...r]),
      current: extra.current ?? null,
      sunkCount,
      islandCount,
      currentIsland,
      remainingLand,
      sunkCells: [...sunkCells],
      action: extra.action ?? 'init',
      message: extra.message ?? '',
      log: extra.log ?? '',
      codeLine: extra.codeLine ?? 1,
    });
  };

  snapshot({
    action: 'init',
    message: `网格 ${m}x${n}，共 ${totalLand} 格陆地，${islandCount} 座岛屿。逐一 DFS 将所有陆地沉没。`,
    log: `初始化 ${m}x${n} 网格，陆地 = ${totalLand}，岛屿 = ${islandCount}。`,
    codeLine: [1, 2],
  });

  snapshot({
    action: 'count',
    message: `共有 ${islandCount} 座岛屿需要沉没，${totalLand} 格陆地待处理。`,
    log: `准备沉没 ${islandCount} 座岛屿。`,
    codeLine: 3,
  });

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (workGrid[i][j] === 1) {
        currentIsland++;

        snapshot({
          current: [i, j],
          action: 'found',
          message: `发现岛屿 #${currentIsland} 起点 (${i},${j})，开始沉没！`,
          log: `开始沉没岛屿 #${currentIsland}。`,
          codeLine: [4, 5],
        });

        // DFS to sink
        const stack: [number, number][] = [[i, j]];
        workGrid[i][j] = 0;
        states[i][j] = 'sinking';
        sunkCount++;
        remainingLand--;
        sunkCells.push(`(${i},${j})`);

        snapshot({
          current: [i, j],
          action: 'sink',
          message: `沉没 (${i},${j})！陆地→水域。已沉没 ${sunkCount} 格，剩余 ${remainingLand} 格。`,
          log: `沉没 (${i},${j})，已沉 ${sunkCount}，剩余 ${remainingLand}。`,
          codeLine: [6, 7],
        });

        // Mark as sunk
        states[i][j] = 'sunk';

        // Find neighbors to sink
        while (stack.length > 0) {
          const [ci, cj] = stack[stack.length - 1];
          let found = false;

          for (const [di, dj] of dirs) {
            const ni = ci + di;
            const nj = cj + dj;
            if (ni >= 0 && ni < m && nj >= 0 && nj < n && workGrid[ni][nj] === 1) {
              // Mark as visited (will be sunk)
              states[ni][nj] = 'visited';

              snapshot({
                current: [ni, nj],
                action: 'sink',
                message: `发现 (${ni},${nj}) 为陆地，准备沉没...`,
                log: `定位 (${ni},${nj})，即将沉没。`,
                codeLine: [8],
              });

              // Sink it
              workGrid[ni][nj] = 0;
              states[ni][nj] = 'sinking';
              sunkCount++;
              remainingLand--;
              sunkCells.push(`(${ni},${nj})`);
              stack.push([ni, nj]);

              snapshot({
                current: [ni, nj],
                action: 'sink',
                message: `沉没 (${ni},${nj})！已沉没 ${sunkCount} 格，剩余 ${remainingLand} 格。`,
                log: `沉没 (${ni},${nj})，已沉 ${sunkCount}，剩余 ${remainingLand}。`,
                codeLine: [9, 10],
              });

              states[ni][nj] = 'sunk';
              found = true;
              break;
            }
          }

          if (!found) {
            stack.pop();
          }
        }

        snapshot({
          current: null,
          action: 'island-done',
          message: `岛屿 #${currentIsland} 全部沉没！已沉没 ${sunkCount} 格，剩余 ${remainingLand} 格。`,
          log: `岛屿 #${currentIsland} 沉没完成。`,
          codeLine: 11,
        });
      }
    }
  }

  snapshot({
    action: 'done',
    message: `所有 ${islandCount} 座岛屿已全部沉没！共沉没 ${sunkCount} 格陆地。`,
    log: `完成，共沉没 ${sunkCount} 格。`,
    codeLine: 12,
  });

  return steps;
}

export class SinkIslandsVisualizer extends StepVisualizer<SinkIslandsStep> {
  protected codeLines = [
    'public int sinkIslands(int[][] grid) {',
    '    int m = grid.length, n = grid[0].length;',
    '    int count = 0;',
    '    int[] dx = {0, 0, 1, -1}, dy = {1, -1, 0, 0};',
    '    for (int i = 0; i < m; i++)',
    '        for (int j = 0; j < n; j++)',
    '            if (grid[i][j] == 1) {',
    '                count++;',
    '                Deque<int[]> stack = new ArrayDeque<>();',
    '                stack.push(new int[]{i, j});',
    '                grid[i][j] = 0; // sink',
    '                while (!stack.isEmpty()) {',
    '                    int[] cell = stack.peek();',
    '                    for (int d = 0; d < 4; d++) {',
    '                        int ni = cell[0] + dx[d];',
    '                        int nj = cell[1] + dy[d];',
    '                        if (ni >= 0 && ni < m && nj >= 0 && nj < n',
    '                            && grid[ni][nj] == 1) {',
    '                            grid[ni][nj] = 0; // sink',
    '                            stack.push(new int[]{ni, nj});',
    '                        }',
    '                    }',
    '                }',
    '            }',
    '    return count;',
    '}',
  ];
  protected codePanelTitle = '沉没孤岛代码 (Java)';

  private inputEl: HTMLInputElement | null = null;
  private gridEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private sunkCountEl: HTMLElement | null = null;
  private islandCountEl: HTMLElement | null = null;
  private currentIslandEl: HTMLElement | null = null;
  private remainingEl: HTMLElement | null = null;
  private sinkVisEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#si-input');
    this.btnStart = this.root.querySelector('#si-start');
    this.gridEl = this.root.querySelector('#si-grid');
    this.logEl = this.root.querySelector('#si-log');
    this.sunkCountEl = this.root.querySelector('#si-sunk-count');
    this.islandCountEl = this.root.querySelector('#si-island-count');
    this.currentIslandEl = this.root.querySelector('#si-current-island');
    this.remainingEl = this.root.querySelector('#si-remaining');
    this.sinkVisEl = this.root.querySelector('#si-sink-vis');
    this.bindPlaybackControls({
      message: 'step-message',
      speed: 'si-speed',
      speedLabel: 'si-speed-label',
      counter: 'step-counter',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.root.querySelectorAll<HTMLButtonElement>('.si-example').forEach((btn) => {
      btn.onclick = () => {
        if (this.inputEl) this.inputEl.value = btn.dataset.val || '';
        this.start();
      };
    });
  }

  protected buildSteps(): SinkIslandsStep[] {
    const grid = parseGrid(this.inputEl?.value || '1,1,0,0;1,0,0,0;0,0,1,0;0,0,0,1');
    if (grid.length === 0 || grid[0].length === 0) {
      return buildSinkIslandsSteps([[1, 1, 0], [0, 0, 1], [0, 0, 0]]);
    }
    return buildSinkIslandsSteps(grid);
  }

  protected renderStep(step: SinkIslandsStep): void {
    if (this.sunkCountEl) this.sunkCountEl.textContent = String(step.sunkCount);
    if (this.islandCountEl) this.islandCountEl.textContent = String(step.islandCount);
    if (this.currentIslandEl) this.currentIslandEl.textContent = step.currentIsland > 0 ? `#${step.currentIsland}` : '-';
    if (this.remainingEl) this.remainingEl.textContent = String(step.remainingLand);

    if (this.sinkVisEl) {
      this.sinkVisEl.innerHTML = '';
      step.sunkCells.forEach((cell) => {
        const item = document.createElement('div');
        item.className = 'si-sink-item';
        item.textContent = cell;
        this.sinkVisEl?.appendChild(item);
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
          cell.className = `si-cell ${state}`;

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

  private renderLogLine(step: SinkIslandsStep): void {
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
  id: 'sink-islands',
  name: '沉没孤岛',
  viewId: 'algo-sink-islands-view',
  category: 'graph',
  description: 'DFS 遍历所有岛屿并逐一沉没（陆地→水域）',
  icon: '🌊',
  template,
  Visualizer: SinkIslandsVisualizer,
  difficulty: 2,
  levelOrder: 8,
  learningGoal: '掌握 DFS 遍历并修改网格的操作',
});
