/**
 * Floyd-Warshall 全源最短路径可视化器 — 4-Card 标准现代架构
 * 动态规划阶段推进、全源距离矩阵实时更新与三重循环追踪
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  FLOYD_PROBLEM_HTML,
  FLOYD_ANALYSIS_HTML,
  FLOYD_CODE_LANGUAGES,
} from './floyd-problem-content';
import template from './floyd.html?raw';

export interface FloydStep extends StepBase {
  matrix: number[][];
  k: number | null;
  i: number | null;
  j: number | null;
  relaxCount: number;
  action: 'init' | 'check' | 'update' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
}

export const FLOYD_NODES = [0, 1, 2, 3];
export const FLOYD_EDGES = [
  { from: 0, to: 1, w: 5 },
  { from: 0, to: 3, w: 10 },
  { from: 1, to: 2, w: 3 },
  { from: 2, to: 3, w: 1 },
];

const INF = 999999;

export function buildFloydSteps(): FloydStep[] {
  const steps: FloydStep[] = [];
  const n = FLOYD_NODES.length;

  const dist: number[][] = Array.from({ length: n }, () => new Array(n).fill(INF));
  for (let i = 0; i < n; i++) dist[i][i] = 0;
  for (const e of FLOYD_EDGES) dist[e.from][e.to] = e.w;

  let relaxCount = 0;

  steps.push({
    matrix: dist.map((row) => [...row]),
    k: null,
    i: null,
    j: null,
    relaxCount: 0,
    action: 'init',
    statusText: `初始化 ${n}×${n} 距离矩阵。对角线设为 0，直连边设为边权，其余不可达节点设为 ∞。`,
    log: `初始化 ${n}x${n} 距离矩阵`,
    codeLine: [3, 4, 5],
  });

  for (let k = 0; k < n; k++) {
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (dist[i][k] !== INF && dist[k][j] !== INF && dist[i][k] + dist[k][j] < dist[i][j]) {
          const oldVal = dist[i][j];
          dist[i][j] = dist[i][k] + dist[k][j];
          relaxCount++;

          steps.push({
            matrix: dist.map((row) => [...row]),
            k,
            i,
            j,
            relaxCount,
            action: 'update',
            statusText: `中转点 k=${k}：经由 k 松弛路径 (${i} -> ${k} -> ${j})，dist[${i}][${j}] 从 ${
              oldVal === INF ? '∞' : oldVal
            } 缩短为 ${dist[i][j]}！`,
            log: `  松弛 dist[${i}][${j}]: 经由 k=${k} 更新为 ${dist[i][j]}`,
            codeLine: [9, 10],
          });
        }
      }
    }
  }

  steps.push({
    matrix: dist.map((row) => [...row]),
    k: n - 1,
    i: null,
    j: null,
    relaxCount,
    action: 'done',
    statusText: `🎉 Floyd-Warshall 算法执行完成！所有顶点对之间的最短距离已全部计算完毕。`,
    log: `✓ 全源最短路径求解完成: 共松弛 ${relaxCount} 次`,
    codeLine: 15,
  });

  return steps;
}

export class FloydVisualizer extends StepVisualizer<FloydStep> {
  protected codeLanguages = FLOYD_CODE_LANGUAGES;
  protected codeLines = FLOYD_CODE_LANGUAGES['java'];
  protected codePanelTitle = 'Floyd-Warshall 算法 代码调试';

  private matrixCanvas: HTMLElement | null = null;
  private metricKEl: HTMLElement | null = null;
  private metricIEl: HTMLElement | null = null;
  private metricJEl: HTMLElement | null = null;
  private metricRelaxCountEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.matrixCanvas = this.root.querySelector('#floyd-matrix-container');
    this.metricKEl = this.root.querySelector('#metric-k');
    this.metricIEl = this.root.querySelector('#metric-i');
    this.metricJEl = this.root.querySelector('#metric-j');
    this.metricRelaxCountEl = this.root.querySelector('#metric-update-count');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#fl-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: FLOYD_PROBLEM_HTML,
      analysisHtml: FLOYD_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): FloydStep[] {
    return buildFloydSteps();
  }

  protected renderStep(step: FloydStep): void {
    const { matrix, k, i, j, relaxCount, statusText, action } = step;
    const n = matrix.length;

    // 1. 渲染距离矩阵表格
    if (this.matrixCanvas) {
      let html = '<table class="fl-matrix-table"><thead><tr><th>i \\ j</th>';
      for (let c = 0; c < n; c++) {
        html += `<th>${c}</th>`;
      }
      html += '</tr></thead><tbody>';

      for (let r = 0; r < n; r++) {
        html += `<tr><th>${r}</th>`;
        for (let c = 0; c < n; c++) {
          const val = matrix[r][c];
          const isTarget = i === r && j === c;
          const isIK = k != null && i === r && k === c;
          const isKJ = k != null && k === r && j === c;

          let cls = '';
          if (isTarget) {
            cls = action === 'update' ? 'cell-updated' : 'cell-active-ij';
          } else if (isIK || isKJ) {
            cls = 'cell-mid-k';
          }

          const displayVal = val >= INF ? '∞' : `${val}`;
          html += `<td class="${cls}">${displayVal}</td>`;
        }
        html += '</tr>';
      }

      html += '</tbody></table>';
      this.matrixCanvas.innerHTML = html;
    }

    // 2. 更新状态监视器
    if (this.metricKEl) this.metricKEl.textContent = k != null ? `${k} / ${n - 1}` : '—';
    if (this.metricIEl) this.metricIEl.textContent = i != null ? `${i}` : '—';
    if (this.metricJEl) this.metricJEl.textContent = j != null ? `${j}` : '—';
    if (this.metricRelaxCountEl) this.metricRelaxCountEl.textContent = `${relaxCount}`;

    if (this.formulaActionEl) {
      if (action === 'update' && k != null && i != null && j != null) {
        this.formulaActionEl.textContent = `松弛: dist[${i}][${j}] = min(${matrix[i][j]}, ${matrix[i][k]} + ${matrix[k][j]}) -> ${matrix[i][j]}`;
      } else if (action === 'done') {
        this.formulaActionEl.textContent = 'Floyd-Warshall 求解完成';
      } else {
        this.formulaActionEl.textContent = 'dist[i][j] = min(dist[i][j], dist[i][k] + dist[k][j])';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = statusText;

    // 3. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        action === 'done'
          ? '#f0fdf4'
          : action === 'update'
          ? '#eff6ff'
          : '#f8fafc';
      logEntry.style.color =
        action === 'done'
          ? '#15803d'
          : action === 'update'
          ? '#1d4ed8'
          : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'done'
          ? '#bbf7d0'
          : action === 'update'
          ? '#bfdbfe'
          : '#e2e8f0');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    const badgeMidK = this.root?.querySelector('#badge-mid-k');
    if (badgeMidK) badgeMidK.textContent = `中继点 k: ${k != null ? k : '—'}`;
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
  }
}

registerAlgorithm({
  id: 'floyd',
  name: 'Floyd-Warshall 多源最短路',
  viewId: 'algo-floyd-view',
  category: 'graph',
  description: '使用动态规划阶段枚举中转点计算全源最短路径距离矩阵',
  icon: '🌐',
  difficulty: 2,
  levelOrder: 8,
  learningGoal: '掌握 Floyd-Warshall 动态规划状态转移与矩阵三层循环结构',
  template,
  Visualizer: FloydVisualizer,
});
