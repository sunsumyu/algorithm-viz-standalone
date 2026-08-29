/**
 * SPFA 队列优化最短路径可视化器 — 4-Card 标准现代架构
 * 队列按需触发松弛、在队标记防止重复进队与负权图高效求解
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  SPFA_PROBLEM_HTML,
  SPFA_ANALYSIS_HTML,
  SPFA_CODE_LANGUAGES,
} from './spfa-problem-content';
import { BF_NODES, BF_EDGES, BF_NODE_POSITIONS } from './bellman-ford-renderer';
import template from './spfa.html?raw';

export interface SPFAStep extends StepBase {
  nodes: number[];
  edges: { from: number; to: number; w: number }[];
  dist: number[];
  queue: number[];
  inQueue: boolean[];
  currentNode: number | null;
  relaxEdge: { from: number; to: number; w: number } | null;
  relaxCount: number;
  action: 'init' | 'poll' | 'relax' | 'skip' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
}

const INF = Infinity;

export function buildSPFASteps(): SPFAStep[] {
  const steps: SPFAStep[] = [];
  const n = BF_NODES.length;
  const source = 0;

  const dist = new Array(n).fill(INF);
  dist[source] = 0;
  const inQueue = new Array(n).fill(false);
  const queue: number[] = [source];
  inQueue[source] = true;
  let relaxCount = 0;

  // Build adjacency list
  const adj: { to: number; w: number }[][] = Array.from({ length: n }, () => []);
  for (const e of BF_EDGES) {
    adj[e.from].push({ to: e.to, w: e.w });
  }

  steps.push({
    nodes: BF_NODES,
    edges: BF_EDGES,
    dist: [...dist],
    queue: [...queue],
    inQueue: [...inQueue],
    currentNode: null,
    relaxEdge: null,
    relaxCount: 0,
    action: 'init',
    statusText: `初始化：源点 ${source} 入队，dist[${source}] = 0，inQueue[${source}] = true。`,
    log: `初始化 SPFA: 源点 0 入队`,
    codeLine: [4, 5, 6, 7, 8],
  });

  while (queue.length > 0) {
    const u = queue.shift()!;
    inQueue[u] = false;

    steps.push({
      nodes: BF_NODES,
      edges: BF_EDGES,
      dist: [...dist],
      queue: [...queue],
      inQueue: [...inQueue],
      currentNode: u,
      relaxEdge: null,
      relaxCount,
      action: 'poll',
      statusText: `出队节点 ${u}：清除在队标记 (inQueue[${u}] = false)，准备松弛其所有出边。`,
      log: `出队节点 ${u}`,
      codeLine: [9, 10, 11],
    });

    for (const edge of adj[u]) {
      const v = edge.to;
      const w = edge.w;

      if (dist[u] !== INF && dist[u] + w < dist[v]) {
        const oldDist = dist[v];
        dist[v] = dist[u] + w;
        relaxCount++;
        let enqueued = false;

        if (!inQueue[v]) {
          queue.push(v);
          inQueue[v] = true;
          enqueued = true;
        }

        steps.push({
          nodes: BF_NODES,
          edges: BF_EDGES,
          dist: [...dist],
          queue: [...queue],
          inQueue: [...inQueue],
          currentNode: u,
          relaxEdge: { from: u, to: v, w },
          relaxCount,
          action: 'relax',
          statusText: `成功松弛边 (${u} -> ${v}, w=${w})：dist[${v}] 从 ${
            oldDist === INF ? '∞' : oldDist
          } 缩短为 ${dist[v]}。${enqueued ? `节点 ${v} 不在队列中，推入队列！` : `节点 ${v} 已在队列中。`}`,
          log: `  松弛 (${u}->${v}, w=${w}): dist[${v}]=${dist[v]}${enqueued ? ' -> 入队' : ''}`,
          codeLine: [13, 14, 15, 16],
        });
      } else {
        steps.push({
          nodes: BF_NODES,
          edges: BF_EDGES,
          dist: [...dist],
          queue: [...queue],
          inQueue: [...inQueue],
          currentNode: u,
          relaxEdge: { from: u, to: v, w },
          relaxCount,
          action: 'skip',
          statusText: `检查边 (${u} -> ${v}, w=${w})：dist[${u}] + (${w}) >= dist[${v}] (${dist[v]})，无需松弛。`,
          log: `  跳过 (${u}->${v})`,
          codeLine: 13,
        });
      }
    }
  }

  steps.push({
    nodes: BF_NODES,
    edges: BF_EDGES,
    dist: [...dist],
    queue: [],
    inQueue: new Array(n).fill(false),
    currentNode: null,
    relaxEdge: null,
    relaxCount,
    action: 'done',
    statusText: `🎉 队列为空，SPFA 算法执行完成！单源最短路径全部求出。`,
    log: `✓ SPFA 求解完毕: dist=[${dist.join(', ')}]`,
    codeLine: 21,
  });

  return steps;
}

export class SPFAVisualizer extends StepVisualizer<SPFAStep> {
  protected codeLanguages = SPFA_CODE_LANGUAGES;
  protected codeLines = SPFA_CODE_LANGUAGES['java'];
  protected codePanelTitle = 'SPFA 队列优化最短路 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private svgCanvas: HTMLElement | null = null;
  private distPillsWrap: HTMLElement | null = null;
  private metricCurNodeEl: HTMLElement | null = null;
  private metricRelaxEdgeEl: HTMLElement | null = null;
  private metricInQCountEl: HTMLElement | null = null;
  private metricRelaxCountEl: HTMLElement | null = null;
  private queueElementsEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.svgCanvas = this.root.querySelector('#spfa-svg-canvas');
    this.distPillsWrap = this.root.querySelector('#dist-pills-wrap');
    this.metricCurNodeEl = this.root.querySelector('#metric-cur-node');
    this.metricRelaxEdgeEl = this.root.querySelector('#metric-relax-edge');
    this.metricInQCountEl = this.root.querySelector('#metric-in-q-count');
    this.metricRelaxCountEl = this.root.querySelector('#metric-relax-count');
    this.queueElementsEl = this.root.querySelector('#queue-elements');
    this.liveTextEl = this.root.querySelector('#spfa-live-text');
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
      problemHtml: SPFA_PROBLEM_HTML,
      analysisHtml: SPFA_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): SPFAStep[] {
    return buildSPFASteps();
  }

  protected renderStep(step: SPFAStep): void {
    const { dist, queue, inQueue, currentNode, relaxEdge, relaxCount, statusText, action } = step;

    // 1. 绘制 SVG 拓扑图
    if (this.svgCanvas) {
      let svgHtml = `<svg viewBox="0 0 520 260" style="width:100%; height:100%; max-height:240px;">
        <defs>
          <marker id="arrow-spfa" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
          <marker id="arrow-spfa-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
          </marker>
        </defs>`;

      // 绘制边
      for (const e of BF_EDGES) {
        const p1 = BF_NODE_POSITIONS[e.from];
        const p2 = BF_NODE_POSITIONS[e.to];
        const isActive = relaxEdge && relaxEdge.from === e.from && relaxEdge.to === e.to;
        const isNeg = e.w < 0;
        const strokeColor = isActive ? '#2563eb' : isNeg ? '#f87171' : '#cbd5e1';
        const strokeWidth = isActive ? 3.5 : 2;
        const marker = isActive ? 'url(#arrow-spfa-active)' : 'url(#arrow-spfa)';

        svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;

        const midX = (p1.x + p2.x) / 2 + (p1.y === p2.y ? 0 : p1.y > p2.y ? 12 : -12);
        const midY = (p1.y + p2.y) / 2 - 8;
        svgHtml += `<text x="${midX}" y="${midY}" fill="${isActive ? '#1d4ed8' : isNeg ? '#dc2626' : '#64748b'}" font-size="11" font-weight="800" text-anchor="middle">${e.w}</text>`;
      }

      // 绘制节点
      BF_NODES.forEach((node) => {
        const p = BF_NODE_POSITIONS[node];
        const isCurrent = currentNode === node;
        const isInQ = inQueue[node];
        const isSource = node === 0;

        let fill = '#ffffff';
        let stroke = '#cbd5e1';
        if (isCurrent) {
          fill = '#fef08a';
          stroke = '#eab308';
        } else if (isInQ) {
          fill = '#dbeafe';
          stroke = '#3b82f6';
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
        const isInQ = inQueue[node];
        const isCurrent = currentNode === node;

        let cls = 'spfa-dist-pill';
        if (isCurrent) cls += ' is-active';
        else if (isInQ) cls += ' is-in-q';

        return `<div class="${cls}">
          <span style="color:#64748b;">${node}:</span>
          <span>${d}</span>
        </div>`;
      }).join('');
    }

    // 3. 更新状态监视器
    if (this.metricCurNodeEl) this.metricCurNodeEl.textContent = currentNode != null ? `${currentNode}` : '—';
    if (this.metricRelaxEdgeEl) {
      this.metricRelaxEdgeEl.textContent = relaxEdge ? `(${relaxEdge.from} -> ${relaxEdge.to}, w=${relaxEdge.w})` : '—';
    }
    if (this.metricInQCountEl) this.metricInQCountEl.textContent = `${queue.length}`;
    if (this.metricRelaxCountEl) this.metricRelaxCountEl.textContent = `${relaxCount}`;

    if (this.queueElementsEl) {
      this.queueElementsEl.textContent =
        queue.length > 0 ? `[ ${queue.join(', ')} ]` : '[ (空) ]';
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
          : action === 'poll'
          ? '#fefce8'
          : '#f8fafc';
      logEntry.style.color =
        action === 'done'
          ? '#15803d'
          : action === 'relax'
          ? '#1d4ed8'
          : action === 'poll'
          ? '#854d0e'
          : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'done'
          ? '#bbf7d0'
          : action === 'relax'
          ? '#bfdbfe'
          : action === 'poll'
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
    const stepCurEl = this.root?.querySelector('#step-cur');
    const stepTotalEl = this.root?.querySelector('#step-total');
    if (stepCurEl) stepCurEl.textContent = String(this.currentStepIndex + 1);
    if (stepTotalEl) stepTotalEl.textContent = String(this.steps.length);

    const badgeQ = this.root?.querySelector('#badge-q-count');
    if (badgeQ) badgeQ.textContent = `队列长度: ${queue.length}`;
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
    if (this.terminalInstance) this.terminalInstance.highlightLine(0);
  }
}

registerAlgorithm({
  id: 'spfa',
  name: 'SPFA 队列优化最短路',
  viewId: 'algo-spfa-view',
  category: 'graph',
  description: '使用队列维护可能被松弛的顶点以优化 Bellman-Ford 算法的执行效率',
  icon: '🚀',
  difficulty: 2,
  levelOrder: 7,
  learningGoal: '掌握通过在队标记与队列驱动实现高效带负权图最短路',
  template,
  Visualizer: SPFAVisualizer,
});
