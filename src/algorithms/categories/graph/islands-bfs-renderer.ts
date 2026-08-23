/**
 * 孤岛计数 · 广搜版（BFS）可视化器
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './islands-bfs.html?raw';

type CellState = 'water' | 'land' | 'visited' | 'island';

interface IslandsBfsStep {
  grid: number[][];
  states: CellState[][];
  current: [number, number] | null;
  queue: [number, number][];
  scan: [number, number] | null;
  count: number;
  visitedCount: number;
  action: 'init' | 'scan' | 'found' | 'dequeue' | 'explore' | 'skip' | 'done';
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

function buildIslandsBfsSteps(grid: number[][]): IslandsBfsStep[] {
  const steps: IslandsBfsStep[] = [];
  const m = grid.length;
  if (m === 0) return steps;
  const n = grid[0].length;
  const states: CellState[][] = grid.map((row) =>
    row.map((v) => (v === 1 ? 'land' : 'water'))
  );
  let count = 0;
  let visitedCount = 0;
  const dirs: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  const snapshot = (extra: Partial<IslandsBfsStep>): void => {
    steps.push({
      grid,
      states: states.map((r) => [...r]),
      current: extra.current ?? null,
      queue: extra.queue ? [...extra.queue] : [],
      scan: extra.scan ?? null,
      count,
      visitedCount,
      action: extra.action ?? 'scan',
      message: extra.message ?? '',
      log: extra.log ?? '',
      codeLine: extra.codeLine ?? 1,
    });
  };

  snapshot({
    action: 'init',
    message: `网格 ${m}x${n}，从左上角开始逐格扫描。遇到陆地即用 BFS 逐层探索整座岛屿。`,
    log: `初始化 ${m}x${n} 网格，BFS 准备就绪。`,
    codeLine: [1, 2],
  });

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (states[i][j] === 'land') {
        count++;
        snapshot({
          scan: [i, j],
          action: 'found',
          message: `扫描到 (${i},${j}) 为陆地！发现第 ${count} 个岛屿，启动 BFS。`,
          log: `发现岛屿 #${count} 于 (${i},${j})。`,
          codeLine: [3, 4],
        });

        const queue: [number, number][] = [[i, j]];
        states[i][j] = 'visited';
        visitedCount++;

        snapshot({
          current: [i, j],
          queue,
          scan: [i, j],
          action: 'dequeue',
          message: `将 (${i},${j}) 入队并标记已访问。BFS 队列: [(${i},${j})]。`,
          log: `BFS 起始 (${i},${j}) 入队。`,
          codeLine: [5, 6],
        });

        while (queue.length > 0) {
          const [ci, cj] = queue.shift()!;

          snapshot({
            current: [ci, cj],
            queue,
            action: 'explore',
            message: `出队 (${ci},${cj})，向四方向扩展探索。队列剩余 ${queue.length} 格。`,
            log: `出队 (${ci},${cj})，探索邻居。`,
            codeLine: [7, 8],
          });

          for (const [di, dj] of dirs) {
            const ni = ci + di;
            const nj = cj + dj;
            if (ni >= 0 && ni < m && nj >= 0 && nj < n && states[ni][nj] === 'land') {
              states[ni][nj] = 'visited';
              visitedCount++;
              queue.push([ni, nj]);

              snapshot({
                current: [ni, nj],
                queue,
                action: 'explore',
                message: `发现陆地 (${ni},${nj})，标记已访问并入队。队列大小: ${queue.length}。`,
                log: `入队 (${ni},${nj})，队列 [${queue.map(([a, b]) => `(${a},${b})`).join(', ')}]`,
                codeLine: [9, 10, 11],
              });
            }
          }
        }

        // Mark this island as fully explored
        for (let a = 0; a < m; a++) {
          for (let b = 0; b < n; b++) {
            if (states[a][b] === 'visited' && grid[a][b] === 1) {
              states[a][b] = 'island';
            }
          }
        }

        snapshot({
          current: null,
          queue: [],
          action: 'found',
          message: `BFS 完成！岛屿 #${count} 全部探索完毕。`,
          log: `岛屿 #${count} BFS 探索完成。`,
          codeLine: 12,
        });
      } else {
        snapshot({
          scan: [i, j],
          action: 'skip',
          message: `扫描 (${i},${j})：${states[i][j] === 'water' ? '水，跳过' : '已访问，跳过'}。`,
          log: `跳过 (${i},${j})。`,
          codeLine: 3,
        });
      }
    }
  }

  snapshot({
    action: 'done',
    message: `扫描完成！共发现 ${count} 个岛屿。`,
    log: `完成，岛屿数 = ${count}。`,
    codeLine: 13,
  });

  return steps;
}

export class IslandsBfsVisualizer extends StepVisualizer<IslandsBfsStep> {
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
    '                Queue<int[]> queue = new LinkedList<>();',
    '                queue.offer(new int[]{i, j});',
    '                visited[i][j] = true;',
    '                while (!queue.isEmpty()) {',
    '                    int[] cell = queue.poll();',
    '                    for (int d = 0; d < 4; d++) {',
    '                        int ni = cell[0] + dx[d];',
    '                        int nj = cell[1] + dy[d];',
    '                        if (ni >= 0 && ni < m && nj >= 0 && nj < n',
    '                            && grid[ni][nj] == 1 && !visited[ni][nj]) {',
    '                            visited[ni][nj] = true;',
    '                            queue.offer(new int[]{ni, nj});',
    '                        }',
    '                    }',
    '                }',
    '            }',
    '    return count;',
    '}',
  ];
  protected codePanelTitle = '孤岛计数 BFS 代码 (Java)';

  private inputEl: HTMLInputElement | null = null;
  private gridEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private scanEl: HTMLElement | null = null;
  private queueSizeEl: HTMLElement | null = null;
  private visitedEl: HTMLElement | null = null;
  private countEl: HTMLElement | null = null;
  private queueVisEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#ibfs-input');
    this.btnStart = this.root.querySelector('#ibfs-start');
    this.gridEl = this.root.querySelector('#ibfs-grid');
    this.logEl = this.root.querySelector('#ibfs-log');
    this.scanEl = this.root.querySelector('#ibfs-scan');
    this.queueSizeEl = this.root.querySelector('#ibfs-queue-size');
    this.visitedEl = this.root.querySelector('#ibfs-visited');
    this.countEl = this.root.querySelector('#ibfs-count');
    this.queueVisEl = this.root.querySelector('#ibfs-queue-vis');
    this.bindPlaybackControls({
      message: 'step-message',
      speed: 'ibfs-speed',
      speedLabel: 'ibfs-speed-label',
      counter: 'step-counter',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.root.querySelectorAll<HTMLButtonElement>('.ibfs-example').forEach((btn) => {
      btn.onclick = () => {
        if (this.inputEl) this.inputEl.value = btn.dataset.val || '';
        this.start();
      };
    });
  }

  protected buildSteps(): IslandsBfsStep[] {
    const grid = parseGrid(this.inputEl?.value || '1,1,0,0,0;1,1,0,0,0;0,0,1,0,0;0,0,0,1,1');
    if (grid.length === 0 || grid[0].length === 0) {
      return buildIslandsBfsSteps([[1, 1, 0], [1, 0, 0], [0, 0, 1]]);
    }
    return buildIslandsBfsSteps(grid);
  }

  protected renderStep(step: IslandsBfsStep): void {
    if (this.scanEl) this.scanEl.textContent = step.scan ? `(${step.scan[0]},${step.scan[1]})` : '-';
    if (this.queueSizeEl) this.queueSizeEl.textContent = String(step.queue.length);
    if (this.visitedEl) this.visitedEl.textContent = String(step.visitedCount);
    if (this.countEl) this.countEl.textContent = String(step.count);

    if (this.queueVisEl) {
      this.queueVisEl.innerHTML = '';
      step.queue.forEach(([r, c]) => {
        const item = document.createElement('div');
        item.className = 'ibfs-queue-item';
        item.textContent = `(${r},${c})`;
        this.queueVisEl?.appendChild(item);
      });
    }

    if (this.gridEl && step.grid.length > 0) {
      this.gridEl.innerHTML = '';
      const m = step.grid.length;
      const n = step.grid[0].length;
      this.gridEl.style.gridTemplateColumns = `repeat(${n}, 34px)`;

      const queueKey = new Set(step.queue.map(([i, j]) => `${i},${j}`));

      for (let i = 0; i < m; i++) {
        for (let j = 0; j < n; j++) {
          const cell = document.createElement('div');
          const state = step.states[i][j];
          cell.className = `ibfs-cell ${state}`;

          if (step.current && step.current[0] === i && step.current[1] === j) {
            cell.classList.add('current');
          } else if (queueKey.has(`${i},${j}`)) {
            cell.classList.add('queue');
          }

          cell.textContent = step.grid[i][j] === 1 ? '1' : '0';
          this.gridEl.appendChild(cell);
        }
      }
    }
    this.renderLogLine(step);
  }

  private renderLogLine(step: IslandsBfsStep): void {
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
  id: 'islands-bfs',
  name: '孤岛计数 · 广搜版（BFS）',
  viewId: 'algo-islands-bfs-view',
  category: 'graph',
  description: 'BFS 逐层扩展探索岛屿，统计连通分量数量',
  icon: '🔍',
  template,
  Visualizer: IslandsBfsVisualizer,
  difficulty: 2,
  levelOrder: 5,
  learningGoal: '掌握 BFS 遍历网格求连通分量',
});
