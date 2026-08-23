/**
 * 孤岛总面积可视化器
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './total-island-area.html?raw';

type CellState = 'water' | 'land' | 'visited' | 'explored';

interface TotalIslandAreaStep {
  grid: number[][];
  states: CellState[][];
  current: [number, number] | null;
  scan: [number, number] | null;
  currentArea: number;
  totalArea: number;
  islandCount: number;
  islandAreas: number[];
  action: 'init' | 'scan' | 'found' | 'explore' | 'island-done' | 'done';
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

function buildTotalIslandAreaSteps(grid: number[][]): TotalIslandAreaStep[] {
  const steps: TotalIslandAreaStep[] = [];
  const m = grid.length;
  if (m === 0) return steps;
  const n = grid[0].length;
  const states: CellState[][] = grid.map((row) =>
    row.map((v) => (v === 1 ? 'land' : 'water'))
  );
  let totalArea = 0;
  let islandCount = 0;
  let currentArea = 0;
  const islandAreas: number[] = [];
  const dirs: [number, number][] = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  const snapshot = (extra: Partial<TotalIslandAreaStep>): void => {
    steps.push({
      grid,
      states: states.map((r) => [...r]),
      current: extra.current ?? null,
      scan: extra.scan ?? null,
      currentArea,
      totalArea,
      islandCount,
      islandAreas: [...islandAreas],
      action: extra.action ?? 'scan',
      message: extra.message ?? '',
      log: extra.log ?? '',
      codeLine: extra.codeLine ?? 1,
    });
  };

  snapshot({
    action: 'init',
    message: `网格 ${m}x${n}，找出所有岛屿并累计面积，计算总面积。`,
    log: `初始化 ${m}x${n} 网格。`,
    codeLine: [1, 2],
  });

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (states[i][j] === 'land') {
        islandCount++;
        currentArea = 0;

        snapshot({
          scan: [i, j],
          current: [i, j],
          action: 'found',
          message: `扫描到 (${i},${j}) 为陆地！发现第 ${islandCount} 个岛屿，启动 DFS 计算面积。`,
          log: `发现岛屿 #${islandCount} 于 (${i},${j})。`,
          codeLine: [3, 4],
        });

        const stack: [number, number][] = [[i, j]];
        states[i][j] = 'visited';
        currentArea = 1;

        snapshot({
          current: [i, j],
          action: 'explore',
          message: `将 (${i},${j}) 标记已访问并入栈。当前面积 = 1。`,
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
              stack.push([ni, nj]);

              snapshot({
                current: [ni, nj],
                action: 'explore',
                message: `发现 (${ni},${nj}) 为陆地，入栈。当前岛屿面积 = ${currentArea}。`,
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

        // Island done - add to total
        totalArea += currentArea;
        islandAreas.push(currentArea);

        // Mark explored
        for (let a = 0; a < m; a++) {
          for (let b = 0; b < n; b++) {
            if (states[a][b] === 'visited') {
              states[a][b] = 'explored';
            }
          }
        }

        snapshot({
          current: null,
          action: 'island-done',
          message: `岛屿 #${islandCount} 面积 = ${currentArea}。总面积累加: ${totalArea - currentArea} + ${currentArea} = ${totalArea}。`,
          log: `岛屿 #${islandCount} 面积 = ${currentArea}，总面积 = ${totalArea}。`,
          codeLine: [10, 11],
        });
      } else {
        snapshot({
          scan: [i, j],
          action: 'scan',
          message: `扫描 (${i},${j})：${states[i][j] === 'water' ? '水，跳过' : '已探索，跳过'}。`,
          log: `跳过 (${i},${j})。`,
          codeLine: 3,
        });
      }
    }
  }

  snapshot({
    action: 'done',
    message: `扫描完成！共 ${islandCount} 座岛屿，总面积 = ${totalArea}。`,
    log: `完成，岛屿数 = ${islandCount}，总面积 = ${totalArea}。`,
    codeLine: 12,
  });

  return steps;
}

export class TotalIslandAreaVisualizer extends StepVisualizer<TotalIslandAreaStep> {
  protected codeLines = [
    'public int totalIslandArea(int[][] grid) {',
    '    int m = grid.length, n = grid[0].length;',
    '    int totalArea = 0;',
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
    '                totalArea += area;',
    '            }',
    '    return totalArea;',
    '}',
  ];
  protected codePanelTitle = '孤岛总面积代码 (Java)';

  private inputEl: HTMLInputElement | null = null;
  private gridEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private currentAreaEl: HTMLElement | null = null;
  private totalAreaEl: HTMLElement | null = null;
  private islandCountEl: HTMLElement | null = null;
  private scanEl: HTMLElement | null = null;
  private areaVisEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.inputEl = this.root.querySelector('#tia-input');
    this.btnStart = this.root.querySelector('#tia-start');
    this.gridEl = this.root.querySelector('#tia-grid');
    this.logEl = this.root.querySelector('#tia-log');
    this.currentAreaEl = this.root.querySelector('#tia-current-area');
    this.totalAreaEl = this.root.querySelector('#tia-total-area');
    this.islandCountEl = this.root.querySelector('#tia-island-count');
    this.scanEl = this.root.querySelector('#tia-scan');
    this.areaVisEl = this.root.querySelector('#tia-area-vis');
    this.bindPlaybackControls({
      message: 'step-message',
      speed: 'tia-speed',
      speedLabel: 'tia-speed-label',
      counter: 'step-counter',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
    this.root.querySelectorAll<HTMLButtonElement>('.tia-example').forEach((btn) => {
      btn.onclick = () => {
        if (this.inputEl) this.inputEl.value = btn.dataset.val || '';
        this.start();
      };
    });
  }

  protected buildSteps(): TotalIslandAreaStep[] {
    const grid = parseGrid(this.inputEl?.value || '1,1,0,0,0;1,0,0,0,0;0,0,1,0,0;0,0,0,1,1');
    if (grid.length === 0 || grid[0].length === 0) {
      return buildTotalIslandAreaSteps([[1, 1, 0], [0, 0, 1], [0, 0, 0]]);
    }
    return buildTotalIslandAreaSteps(grid);
  }

  protected renderStep(step: TotalIslandAreaStep): void {
    if (this.currentAreaEl) this.currentAreaEl.textContent = String(step.currentArea);
    if (this.totalAreaEl) this.totalAreaEl.textContent = String(step.totalArea);
    if (this.islandCountEl) this.islandCountEl.textContent = String(step.islandCount);
    if (this.scanEl) this.scanEl.textContent = step.scan ? `(${step.scan[0]},${step.scan[1]})` : '-';

    if (this.areaVisEl) {
      this.areaVisEl.innerHTML = '';
      step.islandAreas.forEach((area, idx) => {
        const item = document.createElement('div');
        item.className = 'tia-area-item';
        item.textContent = `#${idx + 1}: ${area}`;
        this.areaVisEl?.appendChild(item);
      });
      if (step.islandAreas.length > 0) {
        const total = document.createElement('div');
        total.className = 'tia-area-total';
        total.textContent = `= ${step.totalArea}`;
        this.areaVisEl?.appendChild(total);
      }
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
          cell.className = `tia-cell ${state}`;

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

  private renderLogLine(step: TotalIslandAreaStep): void {
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
  id: 'total-island-area',
  name: '孤岛总面积',
  viewId: 'algo-total-island-area-view',
  category: 'graph',
  description: 'DFS/BFS 找出所有岛屿并累计总面积',
  icon: '📊',
  template,
  Visualizer: TotalIslandAreaVisualizer,
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握遍历网格累计各连通分量大小的技巧',
});
