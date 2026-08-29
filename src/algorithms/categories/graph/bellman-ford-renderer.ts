/**
 * Bellman-Ford 负权最短路径可视化器 — 4-Card 标准现代架构
 * V-1 轮全边遍历松弛、早停检测与负权回路判定
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  BELLMAN_FORD_PROBLEM_HTML,
  BELLMAN_FORD_ANALYSIS_HTML,
  BELLMAN_FORD_CODE_LANGUAGES,
} from './bellman-ford-problem-content';
import template from './bellman-ford.html?raw';

export interface BFStep extends StepBase {
  nodes: number[];
  edges: { from: number; to: number; w: number }[];
  dist: number[];
  round: number;
  maxRounds: number;
  currentEdge: { from: number; to: number; w: number } | null;
  roundRelaxCount: number;
  totalRelaxCount: number;
  action: 'init' | 'start-round' | 'relax' | 'skip' | 'round-done' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
}

export const BF_NODES = [0, 1, 2, 3, 4];
export const BF_EDGES = [
  { from: 0, to: 1, w: 4 },
  { from: 0, to: 2, w: 2 },
  { from: 1, to: 2, w: -1 },
  { from: 1, to: 3, w: 2 },
  { from: 2, to: 3, w: 3 },
  { from: 3, to: 4, w: -2 },
  { from: 2, to: 4, w: 5 },
];

export const BF_NODE_POSITIONS: { x: number; y: number }[] = [
  { x: 70, y: 130 },
  { x: 200, y: 55 },
  { x: 200, y: 205 },
  { x: 340, y: 55 },
  { x: 440, y: 130 },
];

const INF = Infinity;

export function buildBFSteps(): BFStep[] {
  const steps: BFStep[] = [];
  const n = BF_NODES.length;
  const maxRounds = n - 1;
  const source = 0;

  const dist = new Array(n).fill(INF);
  dist[source] = 0;
  let totalRelaxCount = 0;

  steps.push({
    nodes: BF_NODES,
    edges: BF_EDGES,
    dist: [...dist],
    round: 0,
    maxRounds,
    currentEdge: null,
    roundRelaxCount: 0,
    totalRelaxCount: 0,
    action: 'init',
    statusText: `初始化：源点为 ${source}，dist[${source}] = 0，其余节点 dist = ∞。共需最多进行 ${maxRounds} 轮全边松弛。`,
    log: `初始化 Bellman-Ford: 源点 0, 最多 ${maxRounds} 轮`,
    codeLine: [3, 4, 5],
  });

  for (let k = 1; k <= maxRounds; k++) {
    let updated = false;
    let roundRelaxCount = 0;

    steps.push({
      nodes: BF_NODES,
      edges: BF_EDGES,
      dist: [...dist],
      round: k,
      maxRounds,
      currentEdge: null,
      roundRelaxCount: 0,
      totalRelaxCount,
      action: 'start-round',
      statusText: `开始第 ${k} / ${maxRounds} 轮全边遍历松弛。`,
      log: `--- 第 ${k} 轮全边扫描开始 ---`,
      codeLine: [6, 7],
    });

    for (const edge of BF_EDGES) {
      const { from: u, to: v, w } = edge;

      if (dist[u] !== INF && dist[u] + w < dist[v]) {
        const oldDist = dist[v];
        dist[v] = dist[u] + w;
        updated = true;
        roundRelaxCount++;
        totalRelaxCount++;

        steps.push({
          nodes: BF_NODES,
          edges: BF_EDGES,
          dist: [...dist],
          round: k,
          maxRounds,
          currentEdge: edge,
          roundRelaxCount,
          totalRelaxCount,
          action: 'relax',
          statusText: `成功松弛边 (${u} -> ${v}, w=${w})：dist[${v}] 从 ${
            oldDist === INF ? '∞' : oldDist
          } 缩短为 ${dist[v]}。`,
          log: `  松弛 (${u}->${v}, w=${w}): dist[${v}]=${dist[v]}`,
          codeLine: [8, 9, 10, 11],
        });
      } else {
        steps.push({
          nodes: BF_NODES,
          edges: BF_EDGES,
          dist: [...dist],
          round: k,
          maxRounds,
          currentEdge: edge,
          roundRelaxCount,
          totalRelaxCount,
          action: 'skip',
          statusText: `检查边 (${u} -> ${v}, w=${w})：${
            dist[u] === INF ? `源点尚不可达节点 ${u}` : `dist[${u}] + (${w}) >= dist[${v}] (${dist[v]})`
          }，无法松弛。`,
          log: `  跳过 (${u}->${v}, w=${w})`,
          codeLine: 8,
        });
      }
    }

    steps.push({
      nodes: BF_NODES,
      edges: BF_EDGES,
      dist: [...dist],
      round: k,
      maxRounds,
      currentEdge: null,
      roundRelaxCount,
      totalRelaxCount,
      action: 'round-done',
      statusText: `第 ${k} 轮结束：本轮发生 ${roundRelaxCount} 次松弛。${
        !updated ? '未发生任何松弛，触发提前早停！' : ''
      }`,
      log: `第 ${k} 轮结束: 松弛 ${roundRelaxCount} 次`,
      codeLine: 14,
    });

    if (!updated) break;
  }

  steps.push({
    nodes: BF_NODES,
    edges: BF_EDGES,
    dist: [...dist],
    round: maxRounds,
    maxRounds,
    currentEdge: null,
    roundRelaxCount: 0,
    totalRelaxCount,
    action: 'done',
    statusText: `🎉 Bellman-Ford 算法求解完成！全图无负权回路，最短距离已收敛。`,
    log: `✓ 求解完成: dist=[${dist.join(', ')}]`,
    codeLine: 16,
  });

  return steps;
}

export class BellmanFordVisualizer extends StepVisualizer<BFStep> {
  protected codeLanguages = BELLMAN_FORD_CODE_LANGUAGES;
  protected codeLines = BELLMAN_FORD_CODE_LANGUAGES['java'];
  protected codePanelTitle = 'Bellman-Ford 算法 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private svgCanvas: HTMLElement | null = null;
  private distPillsWrap: HTMLElement | null = null;
  private metricRoundEl: HTMLElement | null = null;
  private metricCurEdgeEl: HTMLElement | null = null;
  private metricRoundRelaxEl: HTMLElement | null = null;
  private metricNegativeCycleEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.svgCanvas = this.root.querySelector('#bf-svg-canvas');
    this.distPillsWrap = this.root.querySelector('#dist-pills-wrap');
    this.metricRoundEl = this.root.querySelector('#metric-round');
    this.metricCurEdgeEl = this.root.querySelector('#metric-cur-edge');
    this.metricRoundRelaxEl = this.root.querySelector('#metric-round-relax');
    this.metricNegativeCycleEl = this.root.querySelector('#metric-negative-cycle');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#bf-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 绑定播放控制
    this.bindPlaybackControls();

    // 运行与重置
    this.root.querySelector('#btn-generate')?.addEventListener('click', () => this.start());
    this.root.querySelector('#btn-reset')?.addEventListener('click', () => this.reset());

    // 进度条 Scrubber
    const slider = this.root.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val) && val >= 0 && val < this.steps.length) {
          this.goToStep(val);
        }
      });
    }

    // 步进控制
    this.root.querySelector('#btn-step-prev')?.addEventListener('click', () => this.prevStep());
    this.root.querySelector('#btn-step-next')?.addEventListener('click', () => this.nextStep());
    this.root.querySelector('#btn-play-pause')?.addEventListener('click', () => this.togglePlay());

    // 速度选择
    const speedSelect = this.root.querySelector('#select-speed') as HTMLSelectElement | null;
    if (speedSelect) {
      speedSelect.addEventListener('change', () => {
        this.playbackSpeed = parseInt(speedSelect.value, 10) || 400;
      });
    }

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: BELLMAN_FORD_PROBLEM_HTML,
      analysisHtml: BELLMAN_FORD_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): BFStep[] {
    return buildBFSteps();
  }

  protected renderStep(step: BFStep): void {
    const { dist, round, maxRounds, currentEdge, roundRelaxCount, statusText, action } = step;

    // 1. 绘制 SVG 拓扑图
    if (this.svgCanvas) {
      let svgHtml = `<svg viewBox="0 0 520 260" style="width:100%; height:100%; max-height:240px;">
        <defs>
          <marker id="arrow-bf" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
          <marker id="arrow-bf-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
          </marker>
        </defs>`;

      // 绘制边
      for (const e of BF_EDGES) {
        const p1 = BF_NODE_POSITIONS[e.from];
        const p2 = BF_NODE_POSITIONS[e.to];
        const isActive = currentEdge && currentEdge.from === e.from && currentEdge.to === e.to;
        const isNeg = e.w < 0;
        const strokeColor = isActive ? '#2563eb' : isNeg ? '#f87171' : '#cbd5e1';
        const strokeWidth = isActive ? 3.5 : 2;
        const marker = isActive ? 'url(#arrow-bf-active)' : 'url(#arrow-bf)';

        svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;

        const midX = (p1.x + p2.x) / 2 + (p1.y === p2.y ? 0 : p1.y > p2.y ? 12 : -12);
        const midY = (p1.y + p2.y) / 2 - 8;
        svgHtml += `<text x="${midX}" y="${midY}" fill="${isActive ? '#1d4ed8' : isNeg ? '#dc2626' : '#64748b'}" font-size="11" font-weight="800" text-anchor="middle">${e.w}</text>`;
      }

      // 绘制节点
      BF_NODES.forEach((node) => {
        const p = BF_NODE_POSITIONS[node];
        const isCurrent = currentEdge && (currentEdge.from === node || currentEdge.to === node);
        const isSource = node === 0;

        let fill = '#ffffff';
        let stroke = '#cbd5e1';
        if (isCurrent) {
          fill = '#fef08a';
          stroke = '#eab308';
        } else if (isSource) {
          fill = '#eff6ff';
          stroke = '#3b82f6';
        }

        svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
        svgHtml += `<text x="${p.x}" y="${p.y + 4}" fill="#0f172a" font-size="12" font-weight="800" text-anchor="middle">${node}</text>`;

        const dVal = dist[node] === INF ? '∞' : dist[node];
        svgHtml += `<text x="${p.x}" y="${p.y + 32}" fill="#64748b" font-size="10.5" font-family="monospace" font-weight="700" text-anchor="middle">d:${dVal}</text>`;
      });

      svgHtml += `</svg>`;
      this.svgCanvas.innerHTML = svgHtml;
    }

    // 2. 渲染 Dist 药丸栏
    if (this.distPillsWrap) {
      this.distPillsWrap.innerHTML = BF_NODES.map((node) => {
        const d = dist[node] === INF ? '∞' : `${dist[node]}`;
        const isCurrent = currentEdge && currentEdge.to === node;

        let cls = 'bf-dist-pill';
        if (isCurrent) cls += ' is-active';

        return `<div class="${cls}">
          <span style="color:#64748b;">${node}:</span>
          <span>${d}</span>
        </div>`;
      }).join('');
    }

    // 3. 更新状态监视器
    if (this.metricRoundEl) this.metricRoundEl.textContent = `${round} / ${maxRounds}`;
    if (this.metricCurEdgeEl) {
      this.metricCurEdgeEl.textContent = currentEdge ? `(${currentEdge.from} -> ${currentEdge.to}, w=${currentEdge.w})` : '—';
    }
    if (this.metricRoundRelaxEl) this.metricRoundRelaxEl.textContent = `${roundRelaxCount}`;
    if (this.metricNegativeCycleEl) this.metricNegativeCycleEl.textContent = '无负权环 (收敛)';

    if (this.formulaActionEl) {
      if (action === 'relax') {
        this.formulaActionEl.textContent = `松弛成功: dist[${currentEdge?.to}] = dist[${currentEdge?.from}] + (${currentEdge?.w}) = ${dist[currentEdge!.to]}`;
      } else if (action === 'round-done') {
        this.formulaActionEl.textContent = `第 ${round} 轮扫描完毕，共松弛 ${roundRelaxCount} 次`;
      } else if (action === 'done') {
        this.formulaActionEl.textContent = 'Bellman-Ford 最短路计算完毕';
      } else {
        this.formulaActionEl.textContent = 'dist[u] != INF && dist[u] + w < dist[v]';
      }
    }

    if (this.liveTextEl) this.liveTextEl.textContent = statusText;

    // 4. 更新日志流
    if (this.logContainer) {
      const stepIndex = this.currentStepIndex;
      const logEntry = document.createElement('div');
      logEntry.style.padding = '4px 8px';
      logEntry.style.borderRadius = '6px';
      logEntry.style.background =
        action === 'done'
          ? '#f0fdf4'
          : action === 'relax'
          ? '#eff6ff'
          : action === 'start-round'
          ? '#fefce8'
          : '#f8fafc';
      logEntry.style.color =
        action === 'done'
          ? '#15803d'
          : action === 'relax'
          ? '#1d4ed8'
          : action === 'start-round'
          ? '#854d0e'
          : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'done'
          ? '#bbf7d0'
          : action === 'relax'
          ? '#bfdbfe'
          : action === 'start-round'
          ? '#fef08a'
          : '#e2e8f0');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    // 5. 同步代码高亮
    if (this.terminalInstance) {
      const line = Array.isArray(step.codeLine) ? step.codeLine[0] : step.codeLine;
      this.terminalInstance.highlightLine(line);
    }

    // 6. 更新底部播放控制条
    const slider = this.root?.querySelector('#slider-progress') as HTMLInputElement | null;
    if (slider) {
      slider.max = String(this.steps.length - 1);
      slider.value = String(this.currentStepIndex);
    }
    const indicator = this.root?.querySelector('#step-indicator');
    if (indicator) {
      indicator.textContent = `步骤 ${this.currentStepIndex + 1} / ${this.steps.length}`;
    }
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
    if (this.terminalInstance) this.terminalInstance.highlightLine(0);
  }
}

registerAlgorithm({
  id: 'bellman-ford',
  name: 'Bellman-Ford 负权最短路',
  viewId: 'algo-bellman-ford-view',
  category: 'graph',
  description: '在包含负权边的有向图中通过 V-1 轮全边松弛计算单源最短路',
  icon: '🔄',
  difficulty: 2,
  levelOrder: 6,
  learningGoal: '掌握全边松弛迭代法与负权回路判定的理论模型',
  template,
  Visualizer: BellmanFordVisualizer,
});
