/**
 * 建造最大人工岛
 * 改变一个水域(0)为陆地(1)，使岛屿面积最大
 * 先用 BFS 标记岛屿 ID，再对每个水域统计相邻岛屿面积
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './make-largest-island.html?raw';

interface MLIStep {
  grid: number[][];
  rows: number;
  cols: number;
  islandId: number[][];
  islandArea: Map<number, number>;
  tryCell: [number, number] | null;
  tryArea: number;
  maxArea: number;
  maxCell: [number, number] | null;
  phase: 'init' | 'label' | 'try' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

function parseGrid(input: string): number[][] {
  return input.split(';').map(row => row.split(',').map(v => parseInt(v.trim(), 10)));
}

function buildSteps(gridInput: string): MLIStep[] {
  const steps: MLIStep[] = [];
  const grid = parseGrid(gridInput);
  const R = grid.length;
  const C = grid[0].length;
  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];

  steps.push({
    grid: grid.map(r => [...r]), rows: R, cols: C,
    islandId: Array.from({length: R}, () => Array(C).fill(-1)),
    islandArea: new Map(), tryCell: null, tryArea: 0, maxArea: 0, maxCell: null,
    phase: 'init',
    message: `初始化 ${R}×${C} 网格，0=水域，1=陆地。`,
    log: `初始化: ${R}×${C}`,
    codeLine: 0,
  });

  // Label islands with BFS
  const islandId = Array.from({length: R}, () => Array(C).fill(-1));
  const islandArea = new Map<number, number>();
  let nextId = 0;

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === 1 && islandId[r][c] === -1) {
        const id = nextId++;
        const queue: [number, number][] = [[r, c]];
        islandId[r][c] = id;
        let head = 0, area = 0;
        while (head < queue.length) {
          const [cr, cc] = queue[head++];
          area++;
          for (const [dr, dc] of dirs) {
            const nr = cr + dr, nc = cc + dc;
            if (nr < 0 || nr >= R || nc < 0 || nc >= C || islandId[nr][nc] !== -1 || grid[nr][nc] === 0) continue;
            islandId[nr][nc] = id;
            queue.push([nr, nc]);
          }
        }
        islandArea.set(id, area);

        steps.push({
          grid: grid.map(r => [...r]), rows: R, cols: C,
          islandId: islandId.map(r => [...r]),
          islandArea: new Map(islandArea),
          tryCell: null, tryArea: 0, maxArea: 0, maxCell: null,
          phase: 'label',
          message: `发现岛屿 ID=${id}，从 (${r},${c}) 出发，面积=${area}。`,
          log: `岛屿 ${id}: (${r},${c}) 面积=${area}`,
          codeLine: [1, 2, 3],
        });
      }
    }
  }

  let maxArea = 0;
  let maxCell: [number, number] | null = null;

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] === 0) {
        const neighborIds = new Set<number>();
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          if (nr >= 0 && nr < R && nc >= 0 && nc < C && islandId[nr][nc] !== -1) {
            neighborIds.add(islandId[nr][nc]);
          }
        }
        let tryArea = 1;
        for (const id of neighborIds) {
          tryArea += islandArea.get(id) || 0;
        }

        if (tryArea > maxArea) {
          maxArea = tryArea;
          maxCell = [r, c];
        }

        steps.push({
          grid: grid.map(r => [...r]), rows: R, cols: C,
          islandId: islandId.map(r => [...r]),
          islandArea: new Map(islandArea),
          tryCell: [r, c], tryArea, maxArea, maxCell: maxCell ? [...maxCell] as [number, number] : null,
          phase: 'try',
          message: `尝试将 (${r},${c}) 改为陆地。相邻岛屿 {${[...neighborIds].join(',')}} 面积和 +1 = ${tryArea}。${tryArea >= maxArea ? ' 新最大值！' : ''}`,
          log: `(${r},${c}): 邻岛 {${[...neighborIds].join(',')}} → 面积=${tryArea}`,
          codeLine: [5, 6, 7],
        });
      }
    }
  }

  steps.push({
    grid: grid.map(r => [...r]), rows: R, cols: C,
    islandId: islandId.map(r => [...r]),
    islandArea: new Map(islandArea),
    tryCell: null, tryArea: maxArea, maxArea, maxCell,
    phase: 'done',
    message: maxCell ? `完成！最大人工岛面积 = ${maxArea}，最佳位置: (${maxCell[0]},${maxCell[1]})。` : `完成！网格全为陆地，面积 = ${R * C}。`,
    log: `结果: 最大面积=${maxArea}, 位置=${maxCell ? `(${maxCell[0]},${maxCell[1]})` : '-'}`,
    codeLine: 9,
  });

  return steps;
}

export class MakeLargestIslandVisualizer extends StepVisualizer<MLIStep> {
  protected codeLines = [
    'public int largestIsland(int[][] grid) {',
    '    int R = grid.length, C = grid[0].length;',
    '    int[][] islandId = new int[R][C];',
    '    Map<Integer, Integer> islandArea = new HashMap<>();',
    '    int id = 0;',
    '    for each land cell: BFS label islandId[r][c] = id++;',
    '    int maxArea = 0;',
    '    int[] dx = {0, 0, 1, -1}, dy = {1, -1, 0, 0};',
    '    for each water cell (r, c):',
    '        Set<Integer> neighbors = unique island IDs around;',
    '        int area = 1 + sum(islandArea.getOrDefault(id, 0));',
    '        maxArea = Math.max(maxArea, area);',
    '    return maxArea;',
    '}',
  ];
  protected codePanelTitle = '最大人工岛算法代码 (Java)';

  private gridInput: HTMLInputElement | null = null;
  private gridEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private tryEl: HTMLElement | null = null;
  private islandsEl: HTMLElement | null = null;
  private tryAreaEl: HTMLElement | null = null;
  private maxAreaEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.gridInput = this.root.querySelector('#mli-grid-input');
    this.gridEl = this.root.querySelector('#mli-grid');
    this.logEl = this.root.querySelector('#mli-log');
    this.tryEl = this.root.querySelector('#mli-try');
    this.islandsEl = this.root.querySelector('#mli-islands');
    this.tryAreaEl = this.root.querySelector('#mli-try-area');
    this.maxAreaEl = this.root.querySelector('#mli-max-area');

    const startBtn = this.root.querySelector('#mli-start') as HTMLButtonElement | null;
    if (startBtn) startBtn.onclick = () => this.start();

    this.root.querySelectorAll('.mli-example').forEach((btn) => {
      (btn as HTMLButtonElement).onclick = () => {
        if (this.gridInput) this.gridInput.value = (btn as HTMLElement).dataset.grid || '';
        this.start();
      };
    });

    this.bindPlaybackControls({ speed: 'mli-speed', speedLabel: 'mli-speed-label', message: 'step-message' });
  }

  protected buildSteps(): MLIStep[] {
    const val = this.gridInput?.value || '1,0,1;0,0,0;1,0,1';
    return buildSteps(val);
  }

  protected renderStep(step: MLIStep): void {
    if (this.tryEl) this.tryEl.textContent = step.tryCell ? `(${step.tryCell[0]},${step.tryCell[1]})` : '-';
    if (this.islandsEl) this.islandsEl.textContent = String(step.islandArea.size);
    if (this.tryAreaEl) this.tryAreaEl.textContent = String(step.tryArea);
    if (this.maxAreaEl) this.maxAreaEl.textContent = String(step.maxArea);

    this.renderGrid(step);
    this.renderLogLine(step);
  }

  private renderGrid(step: MLIStep): void {
    if (!this.gridEl) return;
    this.gridEl.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'mli-grid';
    container.style.gridTemplateColumns = `repeat(${step.cols}, 56px)`;

    const islandColors = [
      'rgba(20,184,166,0.5)',
      'rgba(59,130,246,0.5)',
      'rgba(234,179,8,0.5)',
      'rgba(139,92,246,0.5)',
      'rgba(244,63,94,0.5)',
    ];

    for (let r = 0; r < step.rows; r++) {
      for (let c = 0; c < step.cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'mli-cell';
        const key = `${r},${c}`;
        const id = step.islandId[r]?.[c] ?? -1;

        if (step.tryCell && step.tryCell[0] === r && step.tryCell[1] === c) {
          cell.classList.add('candidate');
          cell.style.background = '#f59e0b';
          cell.style.borderColor = '#fbbf24';
          cell.style.color = '#000';
        } else if (step.grid[r][c] === 1 && id !== -1) {
          cell.style.background = islandColors[id % islandColors.length];
          cell.style.borderColor = 'rgba(255,255,255,0.2)';
          cell.style.color = '#fff';
        } else {
          cell.style.background = 'rgba(20,184,166,0.05)';
          cell.style.borderColor = 'rgba(255,255,255,0.08)';
          cell.style.color = 'rgba(204,214,244,0.4)';
        }

        cell.textContent = step.grid[r][c] === 1 ? '1' : '0';
        container?.appendChild(cell);
      }
    }

    this.gridEl?.appendChild(container);
  }

  private renderLogLine(step: MLIStep): void {
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
  id: 'make-largest-island',
  name: '建造最大人工岛',
  viewId: 'algo-make-largest-island-view',
  category: 'graph',
  description: '改变一个水域为陆地，使岛屿面积最大化',
  icon: '🏝️',
  template,
  Visualizer: MakeLargestIslandVisualizer,
  difficulty: 3,
  levelOrder: 10,
  learningGoal: '掌握岛屿标记与枚举优化算法',
});

export {};
