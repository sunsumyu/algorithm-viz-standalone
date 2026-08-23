/**
 * Floyd-Warshall 所有点对最短路可视化器
 * 动态规划三重循环
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './floyd.html?raw';

interface FloydStep {
  dist: number[][];
  prevDist: number[][];
  k: number;
  i: number;
  j: number;
  n: number;
  updateCount: number;
  updatedCell: { i: number; j: number } | null;
  oldVal: number;
  newVal: number;
  phase: 'init' | 'check' | 'update' | 'next-k' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

const INF = 999;
const FLOYD_INIT: number[][] = [
  [0, 3, INF, 7],
  [8, 0, 2, INF],
  [5, INF, 0, 1],
  [2, INF, INF, 0],
];
const FLOYD_N = 4;

function buildFloydSteps(): FloydStep[] {
  const steps: FloydStep[] = [];
  const n = FLOYD_N;
  let dist = FLOYD_INIT.map(row => [...row]);
  let updateCount = 0;
  let totalChecks = n * n * n;
  let checksSoFar = 0;

  const snap = (k: number, i: number, j: number, phase: FloydStep['phase'],
    updatedCell: FloydStep['updatedCell'], oldVal: number, newVal: number,
    msg: string, log: string, code: number | number[]) => {
    steps.push({
      dist: dist.map(r => [...r]),
      prevDist: dist.map(r => [...r]),
      k, i, j, n,
      updateCount,
      updatedCell,
      oldVal, newVal,
      phase,
      message: msg,
      log,
      codeLine: code,
    });
  };

  // Init
  snap(0, 0, 0, 'init', null, 0, 0,
    `初始化：${n}x${n} 距离矩阵。INF=${INF} 表示不可达。对角线为 0。共需遍历 k=0..${n-1}。`,
    '初始化: 距离矩阵', 0);

  for (let k = 0; k < n; k++) {
    snap(k, -1, -1, 'next-k', null, 0, 0,
      `开始中间点 k=${k}。检查所有 (i, j) 对：d[i][j] = min(d[i][j], d[i][${k}] + d[${k}][j])。`,
      `k=${k}: 开始检查`, 1);

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) continue;
        checksSoFar++;

        const oldD = dist[i][j];
        const viaK = dist[i][k] + dist[k][j];

        if (dist[i][k] < INF && dist[k][j] < INF && viaK < oldD) {
          dist[i][j] = viaK;
          updateCount++;
          const progress = Math.round((checksSoFar / totalChecks) * 100);

          snap(k, i, j, 'update', { i, j }, oldD, viaK,
            `d[${i}][${j}]: d[${i}][${k}]+d[${k}][${j}] = ${dist[i][k] === INF ? 'INF' : dist[i][k]}+${dist[k][j] === INF ? 'INF' : dist[k][j]} = ${viaK} < ${oldD === INF ? 'INF' : oldD}。更新！`,
            `k=${k}: d[${i}][${j}]: ${oldD === INF ? 'INF' : oldD} -> ${viaK}`, [2, 3]);
        } else {
          const reason = (dist[i][k] >= INF || dist[k][j] >= INF) ?
            `d[${i}][${k}]或d[${k}][${j}]为INF` :
            `${viaK} >= d[${i}][${j}]=${oldD}`;

          snap(k, i, j, 'check', null, oldD, oldD,
            `d[${i}][${j}]: d[${i}][${k}]+d[${k}][${j}] = ${dist[i][k] === INF ? 'INF' : dist[i][k]}+${dist[k][j] === INF ? 'INF' : dist[k][j]} = ${viaK >= INF ? 'INF' : viaK}。${reason}，不更新。`,
            `k=${k}: d[${i}][${j}] 不变`, [2]);
        }
      }
    }
  }

  snap(n - 1, -1, -1, 'done', null, 0, 0,
    `Floyd 完成！共更新 ${updateCount} 次。矩阵中 d[i][j] 即为 i 到 j 的最短距离。`,
    '完成', 4);

  return steps;
}

export class FloydVisualizer extends StepVisualizer<FloydStep> {
  protected codeLines = [
    'int[][] floyd(int[][] dist, int n) {',
    '    for (int k = 0; k < n; k++)',
    '        for (int i = 0; i < n; i++)',
    '            for (int j = 0; j < n; j++)',
    '                dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);',
    '    return dist; // all-pairs shortest paths',
    '}',
  ];
  protected codePanelTitle = 'Floyd-Warshall 代码 (Java)';

  private matrixEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private kEl: HTMLElement | null = null;
  private updatesEl: HTMLElement | null = null;
  private progressEl: HTMLElement | null = null;
  private updateInfoEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.matrixEl = this.root.querySelector('#floyd-matrix');
    this.logEl = this.root.querySelector('#floyd-log');
    this.kEl = this.root.querySelector('#floyd-k');
    this.updatesEl = this.root.querySelector('#floyd-updates');
    this.progressEl = this.root.querySelector('#floyd-progress');
    this.updateInfoEl = this.root.querySelector('#floyd-update-info');
    this.btnStart = this.root.querySelector('#floyd-start');
    this.bindPlaybackControls({
      speed: 'floyd-speed',
      speedLabel: 'floyd-speed-label',
      message: 'step-message',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
  }

  protected buildSteps(): FloydStep[] {
    return buildFloydSteps();
  }

  protected renderStep(step: FloydStep): void {
    if (this.kEl) this.kEl.textContent = step.k >= 0 ? String(step.k) : '-';
    if (this.updatesEl) this.updatesEl.textContent = String(step.updateCount);

    const totalSteps = this.steps.length;
    const progress = totalSteps > 1 ? Math.round((this.currentIndex / (totalSteps - 1)) * 100) : 100;
    if (this.progressEl) this.progressEl.textContent = `${progress}%`;

    if (this.updateInfoEl) {
      if (step.updatedCell && step.phase === 'update') {
        (this.updateInfoEl as HTMLElement).style.display = '';
        this.updateInfoEl.innerHTML = `<span class="floyd-formula">d[${step.updatedCell.i}][${step.updatedCell.j}]</span>: ${step.oldVal === INF ? 'INF' : step.oldVal} → <span class="floyd-formula">${step.newVal}</span> (via k=${step.k})`;
      } else {
        (this.updateInfoEl as HTMLElement).style.display = 'none';
      }
    }

    this.renderMatrix(step);
    this.renderLogLine(step);
  }

  private renderMatrix(step: FloydStep): void {
    if (!this.matrixEl) return;
    this.matrixEl.innerHTML = '';
    const n = step.n;
    this.matrixEl.style.gridTemplateColumns = `repeat(${n + 1}, 48px)`;

    // Header row
    const corner = document.createElement('div');
    corner.className = 'floyd-cell header';
    corner.textContent = '';
    this.matrixEl?.appendChild(corner);

    for (let j = 0; j < n; j++) {
      const h = document.createElement('div');
      h.className = 'floyd-cell header';
      h.textContent = `j=${j}`;
      this.matrixEl?.appendChild(h);
    }

    // Data rows
    for (let i = 0; i < n; i++) {
      const rowHeader = document.createElement('div');
      rowHeader.className = 'floyd-cell header';
      rowHeader.textContent = `i=${i}`;
      this.matrixEl?.appendChild(rowHeader);

      for (let j = 0; j < n; j++) {
        const cell = document.createElement('div');
        cell.className = 'floyd-cell neutral';

        const val = step.dist[i][j];
        const display = val >= INF ? 'INF' : String(val);

        // Highlight current k row/col
        if (step.k >= 0 && step.phase !== 'done') {
          if (i === step.k || j === step.k) {
            cell.classList.add('k-col');
          }
        }

        // Highlight updated cell
        if (step.updatedCell && step.updatedCell.i === i && step.updatedCell.j === j && step.phase === 'update') {
          cell.classList.remove('neutral', 'k-col');
          cell.classList.add('updated');
        }

        // Pivot: where i==k and j==k cross
        if (step.k >= 0 && i === step.k && j === step.k) {
          cell.classList.add('pivot');
        }

        if (step.updatedCell && step.updatedCell.i === i && step.updatedCell.j === j && step.phase === 'update') {
          cell.innerHTML = `<span class="floyd-old-val">${step.oldVal >= INF ? 'INF' : step.oldVal}</span><span>${display}</span>`;
        } else {
          cell.textContent = display;
        }

        this.matrixEl?.appendChild(cell);
      }
    }
  }

  private renderLogLine(step: FloydStep): void {
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
  id: 'floyd',
  name: 'Floyd算法',
  viewId: 'algo-floyd-view',
  category: 'graph',
  description: '动态规划求解所有节点对之间的最短路径',
  icon: '🔮',
  template,
  Visualizer: FloydVisualizer,
  difficulty: 3,
  levelOrder: 26,
  learningGoal: '理解 Floyd-Warshall 动态规划求解全源最短路',
});

export {};
