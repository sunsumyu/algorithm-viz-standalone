/**
 * 海岸线计算 - Coastline Perimeter
 * 统计所有岛屿的总周长（暴露边数量）
 * 每个陆地格子检查4条边，暴露的边贡献1单位周长
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './coastline.html?raw';

interface CLStep {
  grid: number[][];
  rows: number;
  cols: number;
  currentCell: [number, number] | null;
  exposedEdges: Record<string, boolean[]>; // cell key -> [top, right, bottom, left]
  perimeter: number;
  landCount: number;
  cellEdges: number;
  phase: 'init' | 'counting' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

function parseGrid(input: string): number[][] {
  return input.split(';').map(row => row.split(',').map(v => parseInt(v.trim(), 10)));
}

const DIR_NAMES = ['上', '右', '下', '左'];
const DIRS = [[-1,0],[0,1],[1,0],[0,-1]];

function buildSteps(gridInput: string): CLStep[] {
  const steps: CLStep[] = [];
  const grid = parseGrid(gridInput);
  const R = grid.length;
  const C = grid[0].length;

  let landCount = 0;
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) if (grid[r][c] === 1) landCount++;

  steps.push({
    grid: grid.map(r => [...r]), rows: R, cols: C,
    currentCell: null, exposedEdges: {}, perimeter: 0, landCount, cellEdges: 0,
    phase: 'init',
    message: `初始化 ${R}×${C} 网格，共 ${landCount} 个陆地格子。开始逐格检查暴露边。`,
    log: `初始化: ${R}×${C}, 陆地=${landCount}`,
    codeLine: 0,
  });

  const exposedEdges: Record<string, boolean[]> = {};
  let perimeter = 0;

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < C; c++) {
      if (grid[r][c] !== 1) continue;

      const edges = [false, false, false, false]; // top, right, bottom, left
      let cellEdgeCount = 0;

      for (let d = 0; d < 4; d++) {
        const nr = r + DIRS[d][0], nc = c + DIRS[d][1];
        if (nr < 0 || nr >= R || nc < 0 || nc >= C || grid[nr][nc] === 0) {
          edges[d] = true;
          cellEdgeCount++;
          perimeter++;
        }
      }

      const key = `${r},${c}`;
      exposedEdges[key] = [...edges];

      const dirParts: string[] = [];
      for (let d = 0; d < 4; d++) if (edges[d]) dirParts.push(DIR_NAMES[d]);

      steps.push({
        grid: grid.map(r => [...r]), rows: R, cols: C,
        currentCell: [r, c],
        exposedEdges: { ...exposedEdges },
        perimeter, landCount, cellEdges: cellEdgeCount,
        phase: 'counting',
        message: `格子 (${r},${c}): 暴露边 [${dirParts.join(', ')}]，共 ${cellEdgeCount} 条。累计周长 = ${perimeter}。`,
        log: `(${r},${c}): ${cellEdgeCount} 边 [${dirParts.join(',')}] → 累计=${perimeter}`,
        codeLine: [2, 3, 4, 5],
      });
    }
  }

  steps.push({
    grid: grid.map(r => [...r]), rows: R, cols: C,
    currentCell: null, exposedEdges: { ...exposedEdges }, perimeter, landCount, cellEdges: 0,
    phase: 'done',
    message: `海岸线计算完成！总周长 = ${perimeter}。共 ${landCount} 个陆地格子，累计暴露边 ${perimeter} 条。`,
    log: `完成: 总周长=${perimeter}`,
    codeLine: 7,
  });

  return steps;
}

export class CoastlineVisualizer extends StepVisualizer<CLStep> {
  protected codeLines = [
    'public int coastline(int[][] grid) {',
    '    int R = grid.length, C = grid[0].length;',
    '    int perimeter = 0;',
    '    int[] dx = {0, 0, 1, -1}, dy = {1, -1, 0, 0};',
    '    for (int r = 0; r < R; r++)',
    '        for (int c = 0; c < C; c++)',
    '            if (grid[r][c] == 1) {',
    '                for (int d = 0; d < 4; d++) {',
    '                    int nr = r + dx[d], nc = c + dy[d];',
    '                    if (nr < 0 || nr >= R || nc < 0 || nc >= C',
    '                        || grid[nr][nc] == 0) {',
    '                        perimeter++;',
    '                    }',
    '                }',
    '            }',
    '    return perimeter;',
    '}',
  ];
  protected codePanelTitle = '海岸线算法代码 (Java)';

  private gridInput: HTMLInputElement | null = null;
  private gridEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private cellEl: HTMLElement | null = null;
  private curEdgesEl: HTMLElement | null = null;
  private perimeterEl: HTMLElement | null = null;
  private landCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.gridInput = this.root.querySelector('#cl-grid-input');
    this.gridEl = this.root.querySelector('#cl-grid');
    this.logEl = this.root.querySelector('#cl-log');
    this.cellEl = this.root.querySelector('#cl-cell');
    this.curEdgesEl = this.root.querySelector('#cl-cur-edges');
    this.perimeterEl = this.root.querySelector('#cl-perimeter');
    this.landCountEl = this.root.querySelector('#cl-land-count');

    const startBtn = this.root.querySelector('#cl-start') as HTMLButtonElement | null;
    if (startBtn) startBtn.onclick = () => this.start();

    this.root.querySelectorAll('.cl-example').forEach((btn) => {
      (btn as HTMLButtonElement).onclick = () => {
        if (this.gridInput) this.gridInput.value = (btn as HTMLElement).dataset.grid || '';
        this.start();
      };
    });

    this.bindPlaybackControls({ speed: 'cl-speed', speedLabel: 'cl-speed-label', message: 'step-message' });
  }

  protected buildSteps(): CLStep[] {
    const val = this.gridInput?.value || '1,1,0;0,1,0;1,1,1';
    return buildSteps(val);
  }

  protected renderStep(step: CLStep): void {
    if (this.cellEl) this.cellEl.textContent = step.currentCell ? `(${step.currentCell[0]},${step.currentCell[1]})` : '-';
    if (this.curEdgesEl) this.curEdgesEl.textContent = String(step.cellEdges);
    if (this.perimeterEl) this.perimeterEl.textContent = String(step.perimeter);
    if (this.landCountEl) this.landCountEl.textContent = String(step.landCount);

    this.renderGrid(step);
    this.renderLogLine(step);
  }

  private renderGrid(step: CLStep): void {
    if (!this.gridEl) return;
    this.gridEl.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'cl-grid';
    container.style.gridTemplateColumns = `repeat(${step.cols}, 56px)`;

    for (let r = 0; r < step.rows; r++) {
      for (let c = 0; c < step.cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'cl-cell';
        const key = `${r},${c}`;
        const isLand = step.grid[r][c] === 1;
        const isCurrent = step.currentCell && step.currentCell[0] === r && step.currentCell[1] === c;

        if (isLand) {
          cell.style.background = isCurrent ? 'rgba(56,189,248,0.6)' : 'rgba(56,189,248,0.3)';
          cell.style.borderColor = isCurrent ? '#7dd3fc' : 'rgba(56,189,248,0.4)';
          cell.style.color = '#e0f2fe';
        } else {
          cell.style.background = 'rgba(56,189,248,0.05)';
          cell.style.borderColor = 'rgba(255,255,255,0.06)';
          cell.style.color = 'rgba(204,214,244,0.3)';
        }

        cell.textContent = step.grid[r][c] === 1 ? '1' : '0';

        // Draw exposed edges
        const edges = step.exposedEdges[key];
        if (edges) {
          const edgeLabels = ['top', 'right', 'bottom', 'left'] as const;
          for (let d = 0; d < 4; d++) {
            if (edges[d]) {
              const edge = document.createElement('div');
              edge.className = `cl-edge ${edgeLabels[d]}`;
              if (isCurrent) edge.classList.add('active');
              cell?.appendChild(edge);
            }
          }
        }

        container?.appendChild(cell);
      }
    }

    this.gridEl?.appendChild(container);
  }

  private renderLogLine(step: CLStep): void {
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
  id: 'coastline',
  name: '海岸线计算',
  viewId: 'algo-coastline-view',
  category: 'graph',
  description: '统计所有岛屿的总周长（暴露边数量）',
  icon: '🌊',
  template,
  Visualizer: CoastlineVisualizer,
  difficulty: 3,
  levelOrder: 11,
  learningGoal: '掌握网格图逐边计数法',
});

export {};
