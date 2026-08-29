/**
 * 朴素 Dijkstra (O(V^2)) 可视化器 — 4-Card 标准现代架构
 * 贪心选点、邻接边松弛、距离数组实时追踪与拓扑高亮
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DarkCodeTerminalPresenter,
  DarkCodeTerminalInstance,
} from '../../../core/renderers/dark-code-terminal-presenter';
import {
  DIJKSTRA_BASIC_PROBLEM_HTML,
  DIJKSTRA_BASIC_ANALYSIS_HTML,
  DIJKSTRA_BASIC_CODE_LANGUAGES,
} from './dijkstra-basic-problem-content';
import template from './dijkstra-basic.html?raw';

export interface DJBStep extends StepBase {
  nodes: number[];
  edges: { from: number; to: number; w: number }[];
  dist: number[];
  prevDist: number[];
  visited: Set<number>;
  currentNode: number | null;
  relaxEdge: { from: number; to: number } | null;
  relaxCount: number;
  action: 'init' | 'select' | 'relax' | 'skip' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
}

export const DJB_NODES = [0, 1, 2, 3, 4];
export const DJB_EDGES = [
  { from: 0, to: 1, w: 4 },
  { from: 0, to: 2, w: 1 },
  { from: 2, to: 1, w: 2 },
  { from: 1, to: 3, w: 1 },
  { from: 2, to: 3, w: 5 },
  { from: 3, to: 4, w: 3 },
];

export const DJB_NODE_POSITIONS: { x: number; y: number }[] = [
  { x: 70, y: 130 },
  { x: 210, y: 55 },
  { x: 210, y: 205 },
  { x: 350, y: 130 },
  { x: 440, y: 130 },
];

const INF = Infinity;

export function buildDJBSteps(): DJBStep[] {
  const steps: DJBStep[] = [];
  const n = DJB_NODES.length;
  const source = 0;

  const dist = new Array(n).fill(INF);
  dist[source] = 0;
  const visited = new Set<number>();
  let relaxCount = 0;
  let prevDistSnapshot = [...dist];

  // Build adjacency list
  const adj: { to: number; w: number }[][] = Array.from({ length: n }, () => []);
  for (const e of DJB_EDGES) {
    adj[e.from].push({ to: e.to, w: e.w });
  }

  // Initial step
  steps.push({
    nodes: DJB_NODES,
    edges: DJB_EDGES,
    dist: [...dist],
    prevDist: [...prevDistSnapshot],
    visited: new Set(visited),
    currentNode: null,
    relaxEdge: null,
    relaxCount: 0,
    action: 'init',
    statusText: `初始化：源点为节点 ${source}，dist[${source}] = 0，其余节点 dist = ∞。`,
    log: `初始化 Dijkstra: 源点 0, dist=[0, ∞, ∞, ∞, ∞]`,
    codeLine: [3, 4, 5],
  });

  for (let i = 0; i < n; i++) {
    // Find unvisited node with min dist
    let u = -1;
    let minDist = INF;
    for (let j = 0; j < n; j++) {
      if (!visited.has(j) && dist[j] < minDist) {
        minDist = dist[j];
        u = j;
      }
    }

    if (u === -1 || dist[u] === INF) {
      break; // Remaining unreachable
    }

    visited.add(u);
    prevDistSnapshot = [...dist];

    steps.push({
      nodes: DJB_NODES,
      edges: DJB_EDGES,
      dist: [...dist],
      prevDist: [...prevDistSnapshot],
      visited: new Set(visited),
      currentNode: u,
      relaxEdge: null,
      relaxCount,
      action: 'select',
      statusText: `选择未访问顶点中 dist 最小的节点 ${u} (dist[${u}] = ${dist[u]})，将其锁定为已访问。`,
      log: `选定节点 ${u} (dist=${dist[u]}) 锁定已访问`,
      codeLine: [7, 8, 9, 10, 11],
    });

    // Relax neighbors
    for (const edge of adj[u]) {
      const v = edge.to;
      const w = edge.w;

      if (!visited.has(v)) {
        if (dist[u] + w < dist[v]) {
          const oldDist = dist[v];
          dist[v] = dist[u] + w;
          relaxCount++;

          steps.push({
            nodes: DJB_NODES,
            edges: DJB_EDGES,
            dist: [...dist],
            prevDist: [...prevDistSnapshot],
            visited: new Set(visited),
            currentNode: u,
            relaxEdge: { from: u, to: v },
            relaxCount,
            action: 'relax',
            statusText: `松弛边 (${u} -> ${v}, w=${w})：dist[${v}] 从 ${
              oldDist === INF ? '∞' : oldDist
            } 缩短为 ${dist[v]}。`,
            log: `  松弛 (${u}->${v}): dist[${v}] = ${dist[v]}`,
            codeLine: [12, 13, 14],
          });
          prevDistSnapshot = [...dist];
        } else {
          steps.push({
            nodes: DJB_NODES,
            edges: DJB_EDGES,
            dist: [...dist],
            prevDist: [...prevDistSnapshot],
            visited: new Set(visited),
            currentNode: u,
            relaxEdge: { from: u, to: v },
            relaxCount,
            action: 'skip',
            statusText: `检查边 (${u} -> ${v}, w=${w})：dist[${u}] + ${w} = ${
              dist[u] + w
            } >= dist[${v}] (${dist[v]})，无需更新。`,
            log: `  检查 (${u}->${v}): 无需松弛`,
            codeLine: 13,
          });
        }
      }
    }
  }

  // Done
  steps.push({
    nodes: DJB_NODES,
    edges: DJB_EDGES,
    dist: [...dist],
    prevDist: [...prevDistSnapshot],
    visited: new Set(visited),
    currentNode: null,
    relaxEdge: null,
    relaxCount,
    action: 'done',
    statusText: `🎉 算法结束！从源点 0 到所有顶点的最短路径已全部求出。`,
    log: `✓ Dijkstra 求解完毕: dist=[${dist.join(', ')}]`,
    codeLine: 17,
  });

  return steps;
}

export class DijkstraBasicVisualizer extends StepVisualizer<DJBStep> {
  protected codeLanguages = DIJKSTRA_BASIC_CODE_LANGUAGES;
  protected codeLines = DIJKSTRA_BASIC_CODE_LANGUAGES['java'];
  protected codePanelTitle = '朴素 Dijkstra 最短路 代码调试';

  private terminalInstance: DarkCodeTerminalInstance | null = null;
  private svgCanvas: HTMLElement | null = null;
  private distPillsWrap: HTMLElement | null = null;
  private metricCurNodeEl: HTMLElement | null = null;
  private metricRelaxEdgeEl: HTMLElement | null = null;
  private metricRelaxCountEl: HTMLElement | null = null;
  private metricVisitedCountEl: HTMLElement | null = null;
  private formulaActionEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.svgCanvas = this.root.querySelector('#djb-svg-canvas');
    this.distPillsWrap = this.root.querySelector('#dist-pills-wrap');
    this.metricCurNodeEl = this.root.querySelector('#metric-cur-node');
    this.metricRelaxEdgeEl = this.root.querySelector('#metric-relax-edge');
    this.metricRelaxCountEl = this.root.querySelector('#metric-relax-count');
    this.metricVisitedCountEl = this.root.querySelector('#metric-visited-count');
    this.formulaActionEl = this.root.querySelector('#formula-action');
    this.liveTextEl = this.root.querySelector('#djb-live-text');
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
        this.playbackSpeed = parseInt(speedSelect.value, 10) || 600;
      });
    }

    // 挂载暗色代码终端深模块
    this.terminalInstance = DarkCodeTerminalPresenter.mount(this.root, {
      codeLanguages: this.codeLanguages,
      problemHtml: DIJKSTRA_BASIC_PROBLEM_HTML,
      analysisHtml: DIJKSTRA_BASIC_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): DJBStep[] {
    return buildDJBSteps();
  }

  protected renderStep(step: DJBStep): void {
    const { dist, visited, currentNode, relaxEdge, relaxCount, statusText, action } = step;

    // 1. 绘制 SVG 拓扑图
    if (this.svgCanvas) {
      let svgHtml = `<svg viewBox="0 0 520 260" style="width:100%; height:100%; max-height:240px;">
        <defs>
          <marker id="arrow" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
          <marker id="arrow-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
          </marker>
        </defs>`;

      // 绘制边
      for (const e of DJB_EDGES) {
        const p1 = DJB_NODE_POSITIONS[e.from];
        const p2 = DJB_NODE_POSITIONS[e.to];
        const isActive = relaxEdge && relaxEdge.from === e.from && relaxEdge.to === e.to;
        const strokeColor = isActive ? '#2563eb' : '#cbd5e1';
        const strokeWidth = isActive ? 3.5 : 2;
        const marker = isActive ? 'url(#arrow-active)' : 'url(#arrow)';

        svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;

        const midX = (p1.x + p2.x) / 2 + (p1.y === p2.y ? 0 : p1.y > p2.y ? 10 : -10);
        const midY = (p1.y + p2.y) / 2 - 8;
        svgHtml += `<text x="${midX}" y="${midY}" fill="${isActive ? '#1d4ed8' : '#64748b'}" font-size="11" font-weight="800" text-anchor="middle">${e.w}</text>`;
      }

      // 绘制节点
      DJB_NODES.forEach((node) => {
        const p = DJB_NODE_POSITIONS[node];
        const isCurrent = currentNode === node;
        const isVisited = visited.has(node);
        const isSource = node === 0;

        let fill = '#ffffff';
        let stroke = '#cbd5e1';
        if (isCurrent) {
          fill = '#fef08a';
          stroke = '#eab308';
        } else if (isVisited) {
          fill = '#dcfce7';
          stroke = '#22c55e';
        } else if (isSource) {
          fill = '#eff6ff';
          stroke = '#3b82f6';
        }

        svgHtml += `<circle cx="${p.x}" cy="${p.y}" r="20" fill="${fill}" stroke="${stroke}" stroke-width="2.5" />`;
        svgHtml += `<text x="${p.x}" y="${p.y + 4}" fill="#0f172a" font-size="12" font-weight="800" text-anchor="middle">${node}</text>`;

        const dVal = dist[node] === INF ? '∞' : dist[node];
        svgHtml += `<text x="${p.x}" y="${p.y + 32}" fill="${isVisited ? '#15803d' : '#64748b'}" font-size="10.5" font-family="monospace" font-weight="700" text-anchor="middle">d:${dVal}</text>`;
      });

      svgHtml += `</svg>`;
      this.svgCanvas.innerHTML = svgHtml;
    }

    // 2. 渲染 Dist 药丸栏
    if (this.distPillsWrap) {
      this.distPillsWrap.innerHTML = DJB_NODES.map((node) => {
        const d = dist[node] === INF ? '∞' : `${dist[node]}`;
        const isLocked = visited.has(node);
        const isCurrent = currentNode === node;

        let cls = 'djb-dist-pill';
        if (isCurrent) cls += ' is-active';
        else if (isLocked) cls += ' is-locked';

        return `<div class="${cls}">
          <span style="color:#64748b;">${node}:</span>
          <span>${d}</span>
        </div>`;
      }).join('');
    }

    // 3. 更新状态监视器
    if (this.metricCurNodeEl) this.metricCurNodeEl.textContent = currentNode != null ? `${currentNode}` : '—';
    if (this.metricRelaxEdgeEl) {
      this.metricRelaxEdgeEl.textContent = relaxEdge ? `(${relaxEdge.from} -> ${relaxEdge.to})` : '—';
    }
    if (this.metricRelaxCountEl) this.metricRelaxCountEl.textContent = `${relaxCount}`;
    if (this.metricVisitedCountEl) this.metricVisitedCountEl.textContent = `${visited.size} / ${DJB_NODES.length}`;

    if (this.formulaActionEl) {
      if (action === 'relax') {
        this.formulaActionEl.textContent = `松弛成功: dist[${relaxEdge?.to}] = dist[${relaxEdge?.from}] + w = ${dist[relaxEdge!.to]}`;
      } else if (action === 'select') {
        this.formulaActionEl.textContent = `锁定节点: u = ${currentNode} (最小 dist=${dist[currentNode!]})`;
      } else if (action === 'done') {
        this.formulaActionEl.textContent = 'Dijkstra 最短路计算完毕';
      } else {
        this.formulaActionEl.textContent = 'dist[v] = min(dist[v], dist[u] + w)';
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
          : action === 'select'
          ? '#fefce8'
          : '#f8fafc';
      logEntry.style.color =
        action === 'done'
          ? '#15803d'
          : action === 'relax'
          ? '#1d4ed8'
          : action === 'select'
          ? '#854d0e'
          : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'done'
          ? '#bbf7d0'
          : action === 'relax'
          ? '#bfdbfe'
          : action === 'select'
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
  id: 'dijkstra-basic',
  name: '朴素 Dijkstra 最短路径',
  viewId: 'algo-dijkstra-basic-view',
  category: 'graph',
  description: '在带权无负边有向图中通过贪心选点与松弛计算单源最短路径',
  icon: '🧭',
  difficulty: 2,
  levelOrder: 4,
  learningGoal: '掌握基于数组线性查找最小顶点的朴素 Dijkstra 算法模板与松弛本质',
  template,
  Visualizer: DijkstraBasicVisualizer,
});
