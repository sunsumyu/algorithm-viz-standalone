/**
 * Bellman-Ford 单源有限最短路可视化器
 * 限制最多经过 k 条边
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './limited-shortest-path.html?raw';

interface LSPStep {
  dist: number[];
  prevDist: number[];
  round: number;
  maxK: number;
  edgeIdx: number;
  edgeStatus: ('normal' | 'current')[];
  nodeHighlight: number[];
  source: number;
  target: number;
  relaxCount: number;
  message: string;
  log: string;
  codeLine: number | number[];
}

const LSP_EDGES = [
  { u: 0, v: 1, w: 3 },
  { u: 0, v: 2, w: 5 },
  { u: 1, v: 2, w: 1 },
  { u: 1, v: 3, w: 6 },
  { u: 2, v: 3, w: 2 },
  { u: 2, v: 4, w: 7 },
  { u: 3, v: 4, w: 2 },
];

const LSP_NODES = [0, 1, 2, 3, 4];
const LSP_NODE_POS = [
  { x: 60, y: 150 },
  { x: 180, y: 80 },
  { x: 180, y: 220 },
  { x: 330, y: 80 },
  { x: 420, y: 180 },
];

const LSP_SOURCE = 0;
const LSP_TARGET = 4;
const LSP_K = 3;

function buildLSPSteps(): LSPStep[] {
  const steps: LSPStep[] = [];
  const n = LSP_NODES.length;
  const INF = Infinity;
  let dist = new Array(n).fill(INF);
  dist[LSP_SOURCE] = 0;
  const edgeStatus: ('normal' | 'current')[] = LSP_EDGES.map(() => 'normal');
  let totalRelax = 0;

  const snap = (round: number, edgeIdx: number, nodeHL: number[], msg: string, log: string, code: number | number[]) => {
    steps.push({
      dist: [...dist],
      prevDist: [...dist],
      round,
      maxK: LSP_K,
      edgeIdx,
      edgeStatus: [...edgeStatus],
      nodeHighlight: [...nodeHL],
      source: LSP_SOURCE,
      target: LSP_TARGET,
      relaxCount: totalRelax,
      message: msg,
      log,
      codeLine: code,
    });
  };

  snap(0, -1, [LSP_SOURCE],
    `初始化：V=${n}，k=${LSP_K}，源点=${LSP_SOURCE}，终点=${LSP_TARGET}。dist[${LSP_SOURCE}]=0，其余=INF。每轮最多用 i 条边。`,
    '初始化: dist[source]=0', 0);

  for (let round = 1; round <= LSP_K; round++) {
    // Backup dist for this round (avoid chain updates)
    const backup = [...dist];

    for (let ei = 0; ei < LSP_EDGES.length; ei++) {
      const e = LSP_EDGES[ei];
      edgeStatus[ei] = 'current';

      if (backup[e.u] !== INF && backup[e.u] + e.w < dist[e.v]) {
        const oldVal = dist[e.v];
        dist[e.v] = backup[e.u] + e.w;
        totalRelax++;

        snap(round, ei, [e.u, e.v],
          `第 ${round} 轮，边 (${e.u})->(${e.v}) w=${e.w}: dist[${e.u}]+${e.w}=${backup[e.u] + e.w} < ${oldVal === INF ? 'INF' : oldVal}，松弛成功！dist[${e.v}]=${dist[e.v]}。`,
          `R${round}: (${e.u})->(${e.v}) w=${e.w}, dist[${e.v}]=${dist[e.v]}`, [2, 3]);
      } else {
        const reason = backup[e.u] === INF ? `dist[${e.u}]=INF` :
          `${backup[e.u]}+${e.w}=${backup[e.u] + e.w} >= dist[${e.v}]=${dist[e.v]}`;
        snap(round, ei, [],
          `第 ${round} 轮，边 (${e.u})->(${e.v}) w=${e.w}: ${reason}，不松弛。`,
          `R${round}: (${e.u})->(${e.v}) 不松弛`, [2]);
      }

      edgeStatus[ei] = 'normal';
    }

    const targetDist = dist[LSP_TARGET];
    snap(round, -1, [],
      `第 ${round} 轮结束。最多 ${round} 条边到达终点 ${LSP_TARGET} 的距离=${targetDist === INF ? 'INF' : targetDist}。`,
      `R${round} 完成: dist[target]=${targetDist === INF ? 'INF' : targetDist}`, [1]);
  }

  const finalDist = dist[LSP_TARGET];
  snap(LSP_K, -1, [],
    `完成！限制最多 ${LSP_K} 条边，从 ${LSP_SOURCE} 到 ${LSP_TARGET} 的最短距离=${finalDist === INF ? 'INF (不可达)' : finalDist}。`,
    '完成', 4);

  return steps;
}

export class LimitedShortestPathVisualizer extends StepVisualizer<LSPStep> {
  protected codeLines = [
    'int limitedBF(int[][] edges, int src, int target, int k) {',
    '    int[] dist = new int[V]; Arrays.fill(dist, INF);',
    '    dist[src] = 0;',
    '    for (int round = 1; round <= k; round++) {',
    '        int[] backup = dist.clone();',
    '        for (int[] e : edges) {',
    '            int u = e[0], v = e[1], w = e[2];',
    '            if (backup[u] != INF && backup[u] + w < dist[v])',
    '                dist[v] = backup[u] + w;',
    '        }',
    '    }',
    '    return dist[target];',
    '}',
  ];
  protected codePanelTitle = '有限边数 Bellman-Ford (Java)';

  private graphEl: HTMLElement | null = null;
  private distEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private roundEl: HTMLElement | null = null;
  private targetEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.graphEl = this.root.querySelector('#lsp-graph');
    this.distEl = this.root.querySelector('#lsp-dist');
    this.logEl = this.root.querySelector('#lsp-log');
    this.roundEl = this.root.querySelector('#lsp-round');
    this.targetEl = this.root.querySelector('#lsp-target');
    this.btnStart = this.root.querySelector('#lsp-start');
    this.bindPlaybackControls({
      speed: 'lsp-speed',
      speedLabel: 'lsp-speed-label',
      message: 'step-message',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
  }

  protected buildSteps(): LSPStep[] {
    return buildLSPSteps();
  }

  protected renderStep(step: LSPStep): void {
    if (this.roundEl) this.roundEl.textContent = `${step.round} / ${step.maxK}`;
    if (this.targetEl) {
      const v = step.dist[step.target];
      this.targetEl.textContent = v === Infinity ? 'INF' : String(v);
    }

    this.renderGraph(step);
    this.renderDist(step);
    this.renderLogLine(step);
  }

  private renderGraph(step: LSPStep): void {
    if (!this.graphEl) return;
    this.graphEl.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 480 280');
    svg.style.width = '100%';
    svg.style.maxWidth = '480px';
    svg.style.height = '280px';

    // Defs
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'lsp-arrow');
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '34');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '8');
    marker.setAttribute('markerHeight', '8');
    marker.setAttribute('orient', 'auto-start-reverse');
    const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    p.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    p.setAttribute('fill', 'rgba(156, 163, 175, 0.5)');
    marker?.appendChild(p);
    defs?.appendChild(marker);

    const markerY = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    markerY.setAttribute('id', 'lsp-arrow-y');
    markerY.setAttribute('viewBox', '0 0 10 10');
    markerY.setAttribute('refX', '34');
    markerY.setAttribute('refY', '5');
    markerY.setAttribute('markerWidth', '8');
    markerY.setAttribute('markerHeight', '8');
    markerY.setAttribute('orient', 'auto-start-reverse');
    const pY = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pY.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    pY.setAttribute('fill', '#f59e0b');
    markerY?.appendChild(pY);
    defs?.appendChild(markerY);

    svg?.appendChild(defs);

    const highlightSet = new Set(step.nodeHighlight);

    // Draw edges
    LSP_EDGES.forEach((edge, i) => {
      const p1 = LSP_NODE_POS[edge.u];
      const p2 = LSP_NODE_POS[edge.v];
      const status = step.edgeStatus[i];

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(p1.x));
      line.setAttribute('y1', String(p1.y));
      line.setAttribute('x2', String(p2.x));
      line.setAttribute('y2', String(p2.y));
      line.classList.add('lsp-edge');

      if (status === 'current') {
        line.setAttribute('stroke', '#f59e0b');
        line.setAttribute('stroke-width', '3');
        line.setAttribute('marker-end', 'url(#lsp-arrow-y)');
        line.style.animation = 'lsp-pulse 1s infinite';
      } else {
        line.setAttribute('stroke', 'rgba(6, 182, 212, 0.25)');
        line.setAttribute('stroke-width', '1.5');
        line.setAttribute('marker-end', 'url(#lsp-arrow)');
      }
      svg?.appendChild(line);

      // Weight label
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('x', String(mx - 12));
      bg.setAttribute('y', String(my - 10));
      bg.setAttribute('width', '24');
      bg.setAttribute('height', '20');
      bg.setAttribute('rx', '4');
      bg.setAttribute('fill', status === 'current' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(30, 30, 50, 0.8)');
      bg.setAttribute('stroke', status === 'current' ? '#f59e0b' : 'rgba(156, 163, 175, 0.4)');
      bg.setAttribute('stroke-width', '1');
      svg?.appendChild(bg);

      const wt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      wt.setAttribute('x', String(mx));
      wt.setAttribute('y', String(my + 5));
      wt.setAttribute('text-anchor', 'middle');
      wt.setAttribute('fill', status === 'current' ? '#f59e0b' : 'rgba(156, 163, 175, 0.7)');
      wt.setAttribute('font-size', '12');
      wt.setAttribute('font-weight', '700');
      wt.setAttribute('font-family', 'ui-monospace, monospace');
      wt.textContent = String(edge.w);
      svg?.appendChild(wt);
    });

    // Draw nodes
    LSP_NODES.forEach((node, i) => {
      const pos = LSP_NODE_POS[i];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('lsp-node');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(pos.x));
      circle.setAttribute('cy', String(pos.y));
      circle.setAttribute('r', '24');

      if (node === step.source) {
        circle.setAttribute('fill', 'rgba(34, 197, 94, 0.3)');
        circle.setAttribute('stroke', '#22c55e');
        circle.setAttribute('stroke-width', '2.5');
      } else if (node === step.target) {
        circle.setAttribute('fill', 'rgba(34, 197, 94, 0.15)');
        circle.setAttribute('stroke', '#22c55e');
        circle.setAttribute('stroke-width', '2');
        circle.setAttribute('stroke-dasharray', '4,2');
      } else if (highlightSet.has(node)) {
        circle.setAttribute('fill', 'rgba(6, 182, 212, 0.35)');
        circle.setAttribute('stroke', '#06b6d4');
        circle.setAttribute('stroke-width', '2.5');
      } else {
        circle.setAttribute('fill', 'rgba(6, 182, 212, 0.1)');
        circle.setAttribute('stroke', 'rgba(6, 182, 212, 0.4)');
        circle.setAttribute('stroke-width', '2');
      }
      g?.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(pos.x));
      text.setAttribute('y', String(pos.y + 6));
      text.setAttribute('text-anchor', 'middle');

      if (node === step.source || node === step.target) {
        text.setAttribute('fill', '#22c55e');
      } else if (highlightSet.has(node)) {
        text.setAttribute('fill', '#06b6d4');
      } else {
        text.setAttribute('fill', 'rgba(6, 182, 212, 0.7)');
      }
      text.setAttribute('font-size', '15');
      text.setAttribute('font-weight', '700');
      text.setAttribute('font-family', 'ui-monospace, monospace');
      text.textContent = node === step.source ? 'S' : node === step.target ? 'T' : String(node);
      g?.appendChild(text);

      svg?.appendChild(g);
    });

    this.graphEl?.appendChild(svg);
  }

  private renderDist(step: LSPStep): void {
    if (!this.distEl) return;
    this.distEl.innerHTML = '';
    step.dist.forEach((val, i) => {
      const item = document.createElement('div');
      item.className = 'lsp-dist-item';
      if (step.prevDist[i] !== val) item.classList.add('changed');
      const display = val === Infinity ? 'INF' : String(val);
      item.innerHTML = `<span class="lsp-idx">${i}</span>${display}`;
      this.distEl?.appendChild(item);
    });
  }

  private renderLogLine(step: LSPStep): void {
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
  id: 'limited-shortest-path',
  name: 'Bellman-Ford之单源有限最短路',
  viewId: 'algo-limited-shortest-path-view',
  category: 'graph',
  description: '限制最多经过 k 条边的单源最短路径',
  icon: '🔗',
  template,
  Visualizer: LimitedShortestPathVisualizer,
  difficulty: 3,
  levelOrder: 28,
  learningGoal: '理解 Bellman-Ford 迭代次数与边数限制的关系',
});

export {};
