/**
 * 堆优化 Dijkstra (O(E log V)) 可视化器 — 4-Card 标准现代架构
 * 优先队列动态提取、惰性丢弃、邻接边松弛与拓扑高亮
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import {
  DIJKSTRA_HEAP_PROBLEM_HTML,
  DIJKSTRA_HEAP_ANALYSIS_HTML,
  DIJKSTRA_HEAP_CODE_LANGUAGES,
} from './dijkstra-heap-problem-content';
import { DJB_NODES, DJB_EDGES, DJB_NODE_POSITIONS } from './dijkstra-basic-renderer';
import template from './dijkstra-heap.html?raw';

export interface DJHStep extends StepBase {
  nodes: number[];
  edges: { from: number; to: number; w: number }[];
  dist: number[];
  pq: { d: number; u: number }[];
  currentNode: number | null;
  currentDist: number | null;
  relaxEdge: { from: number; to: number } | null;
  relaxCount: number;
  action: 'init' | 'poll' | 'skip-lazy' | 'relax' | 'skip' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
}

const INF = Infinity;

export function buildDJHSteps(): DJHStep[] {
  const steps: DJHStep[] = [];
  const n = DJB_NODES.length;
  const source = 0;

  const dist = new Array(n).fill(INF);
  dist[source] = 0;
  let relaxCount = 0;

  // Build adjacency list
  const adj: { to: number; w: number }[][] = Array.from({ length: n }, () => []);
  for (const e of DJB_EDGES) {
    adj[e.from].push({ to: e.to, w: e.w });
  }

  // Priority Queue: min-heap of {d, u}
  const pq: { d: number; u: number }[] = [{ d: 0, u: source }];

  steps.push({
    nodes: DJB_NODES,
    edges: DJB_EDGES,
    dist: [...dist],
    pq: [...pq],
    currentNode: null,
    currentDist: null,
    relaxEdge: null,
    relaxCount: 0,
    action: 'init',
    statusText: `初始化：源点为 ${source}，dist[${source}] = 0，将 (0, ${source}) 推入优先队列。`,
    log: `初始化: pq=[(0, ${source})]`,
    codeLine: [4, 5, 6, 7],
  });

  while (pq.length > 0) {
    // Sort to simulate min-heap
    pq.sort((a, b) => a.d - b.d);
    const { d, u } = pq.shift()!;

    if (d > dist[u]) {
      steps.push({
        nodes: DJB_NODES,
        edges: DJB_EDGES,
        dist: [...dist],
        pq: [...pq],
        currentNode: u,
        currentDist: d,
        relaxEdge: null,
        relaxCount,
        action: 'skip-lazy',
        statusText: `出队节点 (${d}, ${u})：发现 d (${d}) > dist[${u}] (${dist[u]})，为历史过期条目，惰性丢弃。`,
        log: `  丢弃过期条目: (${d}, ${u})`,
        codeLine: 10,
      });
      continue;
    }

    steps.push({
      nodes: DJB_NODES,
      edges: DJB_EDGES,
      dist: [...dist],
      pq: [...pq],
      currentNode: u,
      currentDist: d,
      relaxEdge: null,
      relaxCount,
      action: 'poll',
      statusText: `堆顶出队：提取当前距离最小的顶点 (${d}, ${u})，开始检查其所有出边。`,
      log: `堆顶出队 (${d}, ${u})`,
      codeLine: [8, 9],
    });

    for (const edge of adj[u]) {
      const v = edge.to;
      const w = edge.w;

      if (dist[u] + w < dist[v]) {
        const oldDist = dist[v];
        dist[v] = dist[u] + w;
        pq.push({ d: dist[v], u: v });
        relaxCount++;

        steps.push({
          nodes: DJB_NODES,
          edges: DJB_EDGES,
          dist: [...dist],
          pq: [...pq],
          currentNode: u,
          currentDist: d,
          relaxEdge: { from: u, to: v },
          relaxCount,
          action: 'relax',
          statusText: `松弛边 (${u} -> ${v}, w=${w})：dist[${v}] 从 ${
            oldDist === INF ? '∞' : oldDist
          } 缩短为 ${dist[v]}，将 (${dist[v]}, ${v}) 入堆。`,
          log: `  松弛 (${u}->${v}): dist[${v}]=${dist[v]} 入堆`,
          codeLine: [12, 13, 14],
        });
      } else {
        steps.push({
          nodes: DJB_NODES,
          edges: DJB_EDGES,
          dist: [...dist],
          pq: [...pq],
          currentNode: u,
          currentDist: d,
          relaxEdge: { from: u, to: v },
          relaxCount,
          action: 'skip',
          statusText: `检查边 (${u} -> ${v}, w=${w})：dist[${u}] + ${w} = ${
            dist[u] + w
          } >= dist[${v}] (${dist[v]})，无需入堆。`,
          log: `  检查 (${u}->${v}): 距离未缩短`,
          codeLine: 12,
        });
      }
    }
  }

  steps.push({
    nodes: DJB_NODES,
    edges: DJB_EDGES,
    dist: [...dist],
    pq: [],
    currentNode: null,
    currentDist: null,
    relaxEdge: null,
    relaxCount,
    action: 'done',
    statusText: `🎉 优先队列为空，堆优化 Dijkstra 算法执行完毕！`,
    log: `✓ Dijkstra 堆优化求解完毕: dist=[${dist.join(', ')}]`,
    codeLine: 18,
  });

  return steps;
}

export class DijkstraHeapVisualizer extends StepVisualizer<DJHStep> {
  protected codeLanguages = DIJKSTRA_HEAP_CODE_LANGUAGES;
  protected codeLines = DIJKSTRA_HEAP_CODE_LANGUAGES['java'];
  protected codePanelTitle = '堆优化 Dijkstra 最短路 代码调试';

  private svgCanvas: HTMLElement | null = null;
  private distPillsWrap: HTMLElement | null = null;
  private metricCurNodeEl: HTMLElement | null = null;
  private metricRelaxEdgeEl: HTMLElement | null = null;
  private metricPQSizeEl: HTMLElement | null = null;
  private metricRelaxCountEl: HTMLElement | null = null;
  private pqElementsEl: HTMLElement | null = null;
  private liveTextEl: HTMLElement | null = null;
  private logContainer: HTMLElement | null = null;
  private logCountEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;

    this.svgCanvas = this.root.querySelector('#djh-svg-canvas');
    this.distPillsWrap = this.root.querySelector('#dist-pills-wrap');
    this.metricCurNodeEl = this.root.querySelector('#metric-cur-node');
    this.metricRelaxEdgeEl = this.root.querySelector('#metric-relax-edge');
    this.metricPQSizeEl = this.root.querySelector('#metric-pq-size');
    this.metricRelaxCountEl = this.root.querySelector('#metric-relax-count');
    this.pqElementsEl = this.root.querySelector('#pq-elements');
    this.liveTextEl = this.root.querySelector('#djh-live-text');
    this.logContainer = this.root.querySelector('#log-container');
    this.logCountEl = this.root.querySelector('#log-count');

    // 智能绑定播放控制 (包括生成、重置、前进/后退、播放/暂停、进度条与速度选择)
    this.bindPlaybackControls();

    // 挂载暗色代码终端深模块
    this.mountTerminal({
      codeLanguages: this.codeLanguages,
      problemHtml: DIJKSTRA_HEAP_PROBLEM_HTML,
      analysisHtml: DIJKSTRA_HEAP_ANALYSIS_HTML,
      initialLang: 'java',
    });
  }

  protected buildSteps(): DJHStep[] {
    return buildDJHSteps();
  }

  protected renderStep(step: DJHStep): void {
    const { dist, pq, currentNode, relaxEdge, relaxCount, statusText, action } = step;

    // 1. 绘制 SVG 拓扑图
    if (this.svgCanvas) {
      let svgHtml = `<svg viewBox="0 0 520 260" style="width:100%; height:100%; max-height:240px;">
        <defs>
          <marker id="arrow-h" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
          <marker id="arrow-h-active" viewBox="0 0 10 10" refX="22" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
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
        const marker = isActive ? 'url(#arrow-h-active)' : 'url(#arrow-h)';

        svgHtml += `<line x1="${p1.x}" y1="${p1.y}" x2="${p2.x}" y2="${p2.y}" stroke="${strokeColor}" stroke-width="${strokeWidth}" marker-end="${marker}" />`;

        const midX = (p1.x + p2.x) / 2 + (p1.y === p2.y ? 0 : p1.y > p2.y ? 10 : -10);
        const midY = (p1.y + p2.y) / 2 - 8;
        svgHtml += `<text x="${midX}" y="${midY}" fill="${isActive ? '#1d4ed8' : '#64748b'}" font-size="11" font-weight="800" text-anchor="middle">${e.w}</text>`;
      }

      // 绘制节点
      DJB_NODES.forEach((node) => {
        const p = DJB_NODE_POSITIONS[node];
        const isCurrent = currentNode === node;
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
      this.distPillsWrap.innerHTML = DJB_NODES.map((node) => {
        const d = dist[node] === INF ? '∞' : `${dist[node]}`;
        const isCurrent = currentNode === node;

        let cls = 'djh-dist-pill';
        if (isCurrent) cls += ' is-active';

        return `<div class="${cls}">
          <span style="color:#64748b;">${node}:</span>
          <span>${d}</span>
        </div>`;
      }).join('');
    }

    // 3. 更新状态监视器
    if (this.metricCurNodeEl) {
      this.metricCurNodeEl.textContent = currentNode != null ? `(${step.currentDist}, ${currentNode})` : '—';
    }
    if (this.metricRelaxEdgeEl) {
      this.metricRelaxEdgeEl.textContent = relaxEdge ? `(${relaxEdge.from} -> ${relaxEdge.to})` : '—';
    }
    if (this.metricPQSizeEl) this.metricPQSizeEl.textContent = `${pq.length}`;
    if (this.metricRelaxCountEl) this.metricRelaxCountEl.textContent = `${relaxCount}`;

    if (this.pqElementsEl) {
      this.pqElementsEl.textContent =
        pq.length > 0 ? `[ ${pq.map((item) => `(d:${item.d}, u:${item.u})`).join(', ')} ]` : '[ (空) ]';
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
          : action === 'skip-lazy'
          ? '#fff1f2'
          : '#f8fafc';
      logEntry.style.color =
        action === 'done'
          ? '#15803d'
          : action === 'relax'
          ? '#1d4ed8'
          : action === 'skip-lazy'
          ? '#e11d48'
          : '#64748b';
      logEntry.style.border =
        '1px solid ' +
        (action === 'done'
          ? '#bbf7d0'
          : action === 'relax'
          ? '#bfdbfe'
          : action === 'skip-lazy'
          ? '#fecdd3'
          : '#e2e8f0');
      logEntry.innerHTML = `<span style="color:#94a3b8;">[Step ${stepIndex + 1}]</span> ${step.log}`;

      this.logContainer.appendChild(logEntry);
      this.logContainer.scrollTop = this.logContainer.scrollHeight;

      if (this.logCountEl) {
        this.logCountEl.textContent = `${this.logContainer.children.length} 条记录`;
      }
    }

    const badgeVisited = this.root?.querySelector('#badge-visited-count');
    if (badgeVisited) {
      const visitedCount = dist.filter((d) => d < 999).length;
      badgeVisited.textContent = `已确定: ${visitedCount} / ${DJB_NODES.length}`;
    }
  }

  public reset(): void {
    super.reset();
    if (this.logContainer) this.logContainer.innerHTML = '';
    if (this.logCountEl) this.logCountEl.textContent = '0 条记录';
  }
}

registerAlgorithm({
  id: 'dijkstra-heap',
  name: '堆优化 Dijkstra 最短路径',
  viewId: 'algo-dijkstra-heap-view',
  category: 'graph',
  description: '使用小顶堆（优先队列）加速带权图单源最短路径计算',
  icon: '⚡',
  difficulty: 2,
  levelOrder: 5,
  learningGoal: '掌握小顶堆加速单源最短路与惰性删除冗余节点的技巧',
  template,
  Visualizer: DijkstraHeapVisualizer,
});
