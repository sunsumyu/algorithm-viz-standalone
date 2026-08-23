/**
 * 高山流水 - Water Flow Simulation
 * 找出所有能从左上和右下两个方向流到的格子
 * 水从高往低（或等高）流，等价于从边界向高处搜索
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './water-flow.html?raw';

interface WFStep {
  grid: number[][];
  rows: number;
  cols: number;
  tlReachable: boolean[][];
  brReachable: boolean[][];
  currentCells: [number, number][];
  phase: 'init' | 'tl-bfs' | 'br-bfs' | 'merge' | 'done';
  dualCells: [number, number][];
  message: string;
  log: string;
  codeLine: number | number[];
}

function parseGrid(input: string): number[][] {
  return input.split(';').map(row => row.split(',').map(v => parseInt(v.trim(), 10)));
}

function heightColor(val: number, maxVal: number): string {
  const t = maxVal > 0 ? val / maxVal : 0;
  const r = Math.round(30 + t * 40);
  const g = Math.round(50 + t * 60);
  const b = Math.round(100 + t * 100);
  return `rgb(${r},${g},${b})`;
}

function buildSteps(gridInput: string): WFStep[] {
  const steps: WFStep[] = [];
  const grid = parseGrid(gridInput);
  const R = grid.length;
  const C = grid[0].length;
  let maxVal = 0;
  for (const row of grid) for (const v of row) if (v > maxVal) maxVal = v;

  const dirs = [[-1,0],[1,0],[0,-1],[0,1]];

  // Phase 0: Init
  steps.push({
    grid: grid.map(r => [...r]), rows: R, cols: C,
    tlReachable: Array.from({length: R}, () => Array(C).fill(false)),
    brReachable: Array.from({length: R}, () => Array(C).fill(false)),
    currentCells: [], phase: 'init', dualCells: [],
    message: `初始化 ${R}×${C} 高度网格。最大值=${maxVal}。水从高往低流，从边界反向搜索。`,
    log: `初始化: ${R}×${C}, max=${maxVal}`,
    codeLine: 0,
  });

  // BFS from a set of starting cells, flowing uphill
  function bfs(starts: [number, number][]): boolean[][] {
    const visited = Array.from({length: R}, () => Array(C).fill(false));
    const queue: [number, number][] = [...starts];
    for (const [r, c] of starts) visited[r][c] = true;

    steps.push({
      grid: grid.map(r => [...r]), rows: R, cols: C,
      tlReachable: visited.map(r => [...r]),
      brReachable: Array.from({length: R}, () => Array(C).fill(false)),
      currentCells: [...starts], phase: 'tl-bfs', dualCells: [],
      message: `BFS 从 ${starts.length} 个边界格子开始反向搜索（从低往高）。`,
      log: `BFS 起点: ${starts.map(([r,c]) => `(${r},${c})`).join(', ')}`,
      codeLine: [2, 3, 4],
    });

    let head = 0;
    while (head < queue.length) {
      const [r, c] = queue[head++];

      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= R || nc < 0 || nc >= C || visited[nr][nc]) continue;
        if (grid[nr][nc] < grid[r][c]) continue;

        visited[nr][nc] = true;
        queue.push([nr, nc]);

        steps.push({
          grid: grid.map(r => [...r]), rows: R, cols: C,
          tlReachable: visited.map(r => [...r]),
          brReachable: Array.from({length: R}, () => Array(C).fill(false)),
          currentCells: [[nr, nc]], phase: 'tl-bfs', dualCells: [],
          message: `(${r},${c}) 高度 ${grid[r][c]} → (${nr},${nc}) 高度 ${grid[nr][nc]}：水可以反向流动，标记可达。`,
          log: `(${r},${c})[${grid[r][c]}] → (${nr},${nc})[${grid[nr][nc]}]`,
          codeLine: [5, 6],
        });
      }
    }

    return visited;
  }

  function bfsBR(starts: [number, number][]): boolean[][] {
    const visited = Array.from({length: R}, () => Array(C).fill(false));
    const queue: [number, number][] = [...starts];
    for (const [r, c] of starts) visited[r][c] = true;

    const tlFinal = steps[steps.length - 1].tlReachable;

    steps.push({
      grid: grid.map(r => [...r]), rows: R, cols: C,
      tlReachable: tlFinal.map(r => [...r]),
      brReachable: visited.map(r => [...r]),
      currentCells: [...starts], phase: 'br-bfs', dualCells: [],
      message: `开始右下方向 BFS：从右/下边界 ${starts.length} 个格子出发。`,
      log: `BFS-右下 起点: ${starts.length} 个格子`,
      codeLine: [2, 3, 4],
    });

    let head = 0;
    while (head < queue.length) {
      const [r, c] = queue[head++];

      for (const [dr, dc] of dirs) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= R || nc < 0 || nc >= C || visited[nr][nc]) continue;
        if (grid[nr][nc] < grid[r][c]) continue;

        visited[nr][nc] = true;
        queue.push([nr, nc]);

        steps.push({
          grid: grid.map(r => [...r]), rows: R, cols: C,
          tlReachable: tlFinal.map(r => [...r]),
          brReachable: visited.map(r => [...r]),
          currentCells: [[nr, nc]], phase: 'br-bfs', dualCells: [],
          message: `(${r},${c}) 高度 ${grid[r][c]} → (${nr},${nc}) 高度 ${grid[nr][nc]}：右下可达。`,
          log: `右下: (${r},${c}) → (${nr},${nc})`,
          codeLine: [5, 6],
        });
      }
    }

    return visited;
  }

  // Top-left BFS from top and left edges
  const tlStarts: [number, number][] = [];
  for (let r = 0; r < R; r++) tlStarts.push([r, 0]);
  for (let c = 0; c < C; c++) tlStarts.push([0, c]);
  // Deduplicate (0,0)
  const tlSet = new Set(tlStarts.map(([r,c]) => `${r},${c}`));
  const tlUnique = [...tlSet].map(s => s.split(',').map(Number) as [number, number]);

  const tlReachable = bfs(tlUnique);

  // Bottom-right BFS from bottom and right edges
  const brStarts: [number, number][] = [];
  for (let r = 0; r < R; r++) brStarts.push([r, C - 1]);
  for (let c = 0; c < C; c++) brStarts.push([R - 1, c]);
  const brSet = new Set(brStarts.map(([r,c]) => `${r},${c}`));
  const brUnique = [...brSet].map(s => s.split(',').map(Number) as [number, number]);

  const brReachable = bfsBR(brUnique);

  // Merge
  const dualCells: [number, number][] = [];
  for (let r = 0; r < R; r++)
    for (let c = 0; c < C; c++)
      if (tlReachable[r][c] && brReachable[r][c])
        dualCells.push([r, c]);

  steps.push({
    grid: grid.map(r => [...r]), rows: R, cols: C,
    tlReachable: tlReachable.map(r => [...r]),
    brReachable: brReachable.map(r => [...r]),
    currentCells: [...dualCells], phase: 'merge', dualCells: [...dualCells],
    message: `合并：两个方向都能到达的格子有 ${dualCells.length} 个：${dualCells.map(([r,c]) => `(${r},${c})`).join(', ') || '无'}`,
    log: `结果: ${dualCells.length} 个双达格子: ${dualCells.map(([r,c]) => `(${r},${c})`).join(', ') || '无'}`,
    codeLine: 8,
  });

  steps.push({
    grid: grid.map(r => [...r]), rows: R, cols: C,
    tlReachable: tlReachable.map(r => [...r]),
    brReachable: brReachable.map(r => [...r]),
    currentCells: [], phase: 'done', dualCells: [...dualCells],
    message: `分析完成！共 ${dualCells.length} 个格子满足：水流既能到达左上边界，也能到达右下边界。`,
    log: `完成`,
    codeLine: 9,
  });

  return steps;
}

export class WaterFlowVisualizer extends StepVisualizer<WFStep> {
  protected codeLines = [
    'public List<int[]> waterFlow(int[][] heights) {',
    '    int R = heights.length, C = heights[0].length;',
    '    boolean[][] tlReach = bfs(heights, topEdge + leftEdge);',
    '    boolean[][] brReach = bfs(heights, bottomEdge + rightEdge);',
    '    // BFS: if heights[nr][nc] >= heights[r][c], visit(nr, nc)',
    '    Queue<int[]> queue = new LinkedList<>();',
    '    for each start cell: queue.offer, visited[r][c] = true;',
    '    List<int[]> result = intersect(tlReach, brReach);',
    '    return result;',
    '}',
  ];
  protected codePanelTitle = '高山流水 BFS 代码 (Java)';

  private gridInput: HTMLInputElement | null = null;
  private gridEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private phaseEl: HTMLElement | null = null;
  private tlCountEl: HTMLElement | null = null;
  private brCountEl: HTMLElement | null = null;
  private dualCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.gridInput = this.root.querySelector('#wf-grid-input');
    this.gridEl = this.root.querySelector('#wf-grid');
    this.logEl = this.root.querySelector('#wf-log');
    this.phaseEl = this.root.querySelector('#wf-phase');
    this.tlCountEl = this.root.querySelector('#wf-tl-count');
    this.brCountEl = this.root.querySelector('#wf-br-count');
    this.dualCountEl = this.root.querySelector('#wf-dual-count');

    const startBtn = this.root.querySelector('#wf-start') as HTMLButtonElement | null;
    if (startBtn) startBtn.onclick = () => this.start();

    this.root.querySelectorAll('.wf-example').forEach((btn) => {
      (btn as HTMLButtonElement).onclick = () => {
        if (this.gridInput) this.gridInput.value = (btn as HTMLElement).dataset.grid || '';
        this.start();
      };
    });

    this.bindPlaybackControls({ speed: 'wf-speed', speedLabel: 'wf-speed-label', message: 'step-message' });
  }

  protected buildSteps(): WFStep[] {
    const val = this.gridInput?.value || '3,4,2,1;2,1,3,4;1,2,4,3;4,3,2,1';
    return buildSteps(val);
  }

  protected renderStep(step: WFStep): void {
    if (this.phaseEl) {
      const phaseLabels: Record<string, string> = { init: '初始化', 'tl-bfs': '左上 BFS', 'br-bfs': '右下 BFS', merge: '合并', done: '完成' };
      this.phaseEl.textContent = phaseLabels[step.phase] || '-';
    }

    let tlCount = 0, brCount = 0;
    for (let r = 0; r < step.rows; r++)
      for (let c = 0; c < step.cols; c++) {
        if (step.tlReachable[r]?.[c]) tlCount++;
        if (step.brReachable[r]?.[c]) brCount++;
      }
    if (this.tlCountEl) this.tlCountEl.textContent = String(tlCount);
    if (this.brCountEl) this.brCountEl.textContent = String(brCount);
    if (this.dualCountEl) this.dualCountEl.textContent = String(step.dualCells.length);

    this.renderGrid(step);
    this.renderLogLine(step);
  }

  private renderGrid(step: WFStep): void {
    if (!this.gridEl) return;
    this.gridEl.innerHTML = '';

    let maxVal = 0;
    for (const row of step.grid) for (const v of row) if (v > maxVal) maxVal = v;

    const dualSet = new Set(step.dualCells.map(([r,c]) => `${r},${c}`));
    const currentSet = new Set(step.currentCells.map(([r,c]) => `${r},${c}`));

    const container = document.createElement('div');
    container.className = 'wf-grid';
    container.style.gridTemplateColumns = `repeat(${step.cols}, 56px)`;

    for (let r = 0; r < step.rows; r++) {
      for (let c = 0; c < step.cols; c++) {
        const cell = document.createElement('div');
        cell.className = 'wf-cell';
        const key = `${r},${c}`;
        const val = step.grid[r]?.[c] ?? 0;

        if (dualSet.has(key)) {
          cell.classList.add('dual');
          cell.style.background = 'rgba(59,130,246,0.5)';
          cell.style.borderColor = '#6366f1';
          cell.style.color = '#93c5fd';
        } else if (currentSet.has(key)) {
          cell.style.background = 'rgba(99,102,241,0.6)';
          cell.style.borderColor = '#818cf8';
          cell.style.color = '#c7d2fe';
          cell.style.animation = 'wf-glow 0.6s';
        } else if (step.tlReachable[r]?.[c] && step.brReachable[r]?.[c]) {
          cell.style.background = 'rgba(59,130,246,0.4)';
          cell.style.borderColor = 'rgba(99,102,241,0.5)';
          cell.style.color = '#93c5fd';
        } else if (step.tlReachable[r]?.[c]) {
          cell.style.background = 'rgba(59,130,246,0.2)';
          cell.style.borderColor = 'rgba(59,130,246,0.4)';
          cell.style.color = '#93c5fd';
        } else if (step.brReachable[r]?.[c]) {
          cell.style.background = 'rgba(99,102,241,0.2)';
          cell.style.borderColor = 'rgba(99,102,241,0.4)';
          cell.style.color = '#c4b5fd';
        } else {
          cell.style.background = heightColor(val, maxVal);
          cell.style.borderColor = 'rgba(255,255,255,0.08)';
          cell.style.color = '#94a3b8';
        }

        cell.textContent = String(val);
        container?.appendChild(cell);
      }
    }

    this.gridEl?.appendChild(container);
  }

  private renderLogLine(step: WFStep): void {
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
  id: 'water-flow',
  name: '高山流水',
  viewId: 'algo-water-flow-view',
  category: 'graph',
  description: '找出所有水流能同时到达左上和右下水域的格子',
  icon: '💧',
  template,
  Visualizer: WaterFlowVisualizer,
  difficulty: 3,
  levelOrder: 9,
  learningGoal: '掌握反向 BFS 求解水流可达性问题',
});

export {};
