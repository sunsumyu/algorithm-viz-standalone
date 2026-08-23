/**
 * Bellman-Ford 判断负权回路可视化器
 * 运行 V-1 轮松弛，再检查第 V 轮是否仍能松弛
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './negative-cycle.html?raw';

interface NCStep {
  dist: number[];
  prevDist: number[];
  round: number;
  maxRounds: number;
  edgeIdx: number;
  relaxCount: number;
  cycleFound: boolean;
  cycleEdge: { u: number; v: number; w: number } | null;
  edgeStatus: ('normal' | 'current' | 'cycle')[];
  nodeHighlight: number[];
  message: string;
  log: string;
  codeLine: number | number[];
}

const NC_EDGES = [
  { u: 0, v: 1, w: 2 },
  { u: 1, v: 2, w: -3 },
  { u: 2, v: 3, w: 1 },
  { u: 3, v: 1, w: -1 },
  { u: 0, v: 3, w: 5 },
  { u: 3, v: 4, w: 2 },
];

const NC_NODES = [0, 1, 2, 3, 4];
const NC_NODE_POS = [
  { x: 60, y: 150 },
  { x: 180, y: 80 },
  { x: 320, y: 80 },
  { x: 280, y: 220 },
  { x: 420, y: 180 },
];

function buildNCSteps(): NCStep[] {
  const steps: NCStep[] = [];
  const n = NC_NODES.length;
  const INF = Infinity;
  let dist = new Array(n).fill(INF);
  dist[0] = 0;

  const edgeStatus: ('normal' | 'current' | 'cycle')[] = NC_EDGES.map(() => 'normal');

  const snap = (round: number, edgeIdx: number, relaxCount: number, cycleFound: boolean,
    cycleEdge: NCStep['cycleEdge'], nodeHL: number[], msg: string, log: string, code: number | number[]) => {
    steps.push({
      dist: [...dist],
      prevDist: [...dist],
      round,
      maxRounds: n,
      edgeIdx,
      relaxCount,
      cycleFound,
      cycleEdge,
      edgeStatus: [...edgeStatus],
      nodeHighlight: [...nodeHL],
      message: msg,
      log,
      codeLine: code,
    });
  };

  snap(0, -1, 0, false, null, [0],
    `初始化：V=${n} 个节点，${NC_EDGES.length} 条有向边。源点=0，dist[0]=0，其余=INF。`,
    '初始化: dist[0]=0, 其余=INF', 0);

  let totalRelax = 0;

  // V-1 iterations
  for (let round = 1; round <= n - 1; round++) {
    let relaxed = 0;

    for (let ei = 0; ei < NC_EDGES.length; ei++) {
      const e = NC_EDGES[ei];
      edgeStatus[ei] = 'current';

      if (dist[e.u] !== INF && dist[e.u] + e.w < dist[e.v]) {
        const oldDist = dist[e.v];
        dist[e.v] = dist[e.u] + e.w;
        relaxed++;
        totalRelax++;

        snap(round, ei, totalRelax, false, null, [e.u, e.v],
          `第 ${round} 轮，检查边 (${e.u})->(${e.v}) w=${e.w}: dist[${e.u}]=${dist[e.u] - e.w + e.w === dist[e.u] ? dist[e.u] : dist[e.u]}, dist[${e.u}]+${e.w}=${dist[e.v]} < 旧值${oldDist === INF ? 'INF' : oldDist}，松弛成功！`,
          `R${round}: (${e.u})->(${e.v}) w=${e.w}, dist[${e.v}]=${dist[e.v]}`, [2, 3]);
      } else {
        const reason = dist[e.u] === INF ? `dist[${e.u}]=INF，跳过` :
          `dist[${e.u}]+${e.w}=${dist[e.u] + e.w} >= dist[${e.v}]=${dist[e.v]}`;
        snap(round, ei, totalRelax, false, null, [],
          `第 ${round} 轮，检查边 (${e.u})->(${e.v}) w=${e.w}: ${reason}，不松弛。`,
          `R${round}: (${e.u})->(${e.v}) 不松弛`, [2]);
      }

      edgeStatus[ei] = 'normal';
    }

    if (relaxed === 0) {
      snap(round, -1, totalRelax, false, null, [],
        `第 ${round} 轮没有发生任何松弛，提前结束。不存在负权回路。`,
        `R${round}: 无松弛，提前结束`, [5]);
      snap(n, -1, totalRelax, false, null, [],
        `结论：图中不存在负权回路。`,
        '结果: 无负环', 6);
      return steps;
    }
  }

  // V-th iteration: check for negative cycle
  let cycleFound = false;
  let cycleEdge: NCStep['cycleEdge'] = null;
  for (let ei = 0; ei < NC_EDGES.length; ei++) {
    const e = NC_EDGES[ei];
    edgeStatus[ei] = 'current';

    if (dist[e.u] !== INF && dist[e.u] + e.w < dist[e.v]) {
      edgeStatus[ei] = 'cycle';
      cycleFound = true;
      cycleEdge = e;

      snap(n, ei, totalRelax, true, cycleEdge, [e.u, e.v],
        `第 V=${n} 轮检查！边 (${e.u})->(${e.v}) w=${e.w}: dist[${e.u}]+${e.w}=${dist[e.u] + e.w} < dist[${e.v}]=${dist[e.v]}。还能松弛！说明存在负权回路！`,
        `V轮: (${e.u})->(${e.v}) 仍可松弛 → 负环!`, [4]);
      break;
    }
    edgeStatus[ei] = 'normal';
  }

  if (!cycleFound) {
    snap(n, -1, totalRelax, false, null, [],
      `第 V=${n} 轮检查完毕，没有边能再松弛。不存在负权回路。`,
      'V轮: 无松弛 → 无负环', 6);
  }

  snap(n, -1, totalRelax, cycleFound, cycleEdge, [],
    cycleFound ? `结论：图中存在负权回路！路径 ${cycleEdge!.u}->${cycleEdge!.v}->...->${cycleEdge!.u} 的总权重为负。` : `结论：图中不存在负权回路。`,
    cycleFound ? '结果: 存在负环!' : '结果: 无负环', cycleFound ? 4 : 6);

  return steps;
}

export class NegativeCycleVisualizer extends StepVisualizer<NCStep> {
  protected codeLines = [
    'boolean bellmanFordNegCycle(int V, int[][] edges) {',
    '    int[] dist = new int[V]; Arrays.fill(dist, INF);',
    '    dist[0] = 0;',
    '    for (int round = 1; round <= V - 1; round++)',
    '        for (int[] e : edges)',
    '            if (dist[e[0]] + e[2] < dist[e[1]])',
    '                dist[e[1]] = dist[e[0]] + e[2];',
    '    for (int[] e : edges) // V-th round check',
    '        if (dist[e[0]] + e[2] < dist[e[1]]) return true;',
    '    return false; // no negative cycle',
    '}',
  ];
  protected codePanelTitle = 'Bellman-Ford 判负环 (Java)';

  private graphEl: HTMLElement | null = null;
  private distEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private roundEl: HTMLElement | null = null;
  private relaxEl: HTMLElement | null = null;
  private cycleEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.graphEl = this.root.querySelector('#nc-graph');
    this.distEl = this.root.querySelector('#nc-dist');
    this.logEl = this.root.querySelector('#nc-log');
    this.roundEl = this.root.querySelector('#nc-round');
    this.relaxEl = this.root.querySelector('#nc-relax-count');
    this.cycleEl = this.root.querySelector('#nc-cycle-found');
    this.resultEl = this.root.querySelector('#nc-result');
    this.btnStart = this.root.querySelector('#nc-start');
    this.bindPlaybackControls({
      speed: 'nc-speed',
      speedLabel: 'nc-speed-label',
      message: 'step-message',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
  }

  protected buildSteps(): NCStep[] {
    return buildNCSteps();
  }

  protected renderStep(step: NCStep): void {
    if (this.roundEl) this.roundEl.textContent = String(step.round);
    if (this.relaxEl) this.relaxEl.textContent = String(step.relaxCount);
    if (this.cycleEl) {
      if (step.cycleFound) {
        this.cycleEl.textContent = '存在!';
        (this.cycleEl as HTMLElement).style.color = '#ef4444';
      } else if (step.round >= step.maxRounds) {
        this.cycleEl.textContent = '不存在';
        (this.cycleEl as HTMLElement).style.color = '#22c55e';
      } else {
        this.cycleEl.textContent = '检测中';
        (this.cycleEl as HTMLElement).style.color = '#ef4444';
      }
    }

    if (this.resultEl) {
      if (step.cycleFound) {
        (this.resultEl as HTMLElement).style.display = '';
        this.resultEl.className = 'nc-result found';
        this.resultEl.textContent = `发现负权回路！边 (${step.cycleEdge!.u})->(${step.cycleEdge!.v}) 在第 V 轮仍可松弛。`;
      } else if (step.round >= step.maxRounds) {
        (this.resultEl as HTMLElement).style.display = '';
        this.resultEl.className = 'nc-result none';
        this.resultEl.textContent = '无负权回路，所有最短路径均存在。';
      } else {
        (this.resultEl as HTMLElement).style.display = 'none';
      }
    }

    this.renderGraph(step);
    this.renderDist(step);
    this.renderLogLine(step);
  }

  private renderGraph(step: NCStep): void {
    if (!this.graphEl) return;
    this.graphEl.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 480 280');
    svg.style.width = '100%';
    svg.style.maxWidth = '480px';
    svg.style.height = '280px';

    // Defs for arrows
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'nc-arrow');
    marker.setAttribute('viewBox', '0 0 10 10');
    marker.setAttribute('refX', '34');
    marker.setAttribute('refY', '5');
    marker.setAttribute('markerWidth', '8');
    marker.setAttribute('markerHeight', '8');
    marker.setAttribute('orient', 'auto-start-reverse');
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    path.setAttribute('fill', 'rgba(156, 163, 175, 0.5)');
    marker?.appendChild(path);
    defs?.appendChild(marker);

    const markerRed = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    markerRed.setAttribute('id', 'nc-arrow-red');
    markerRed.setAttribute('viewBox', '0 0 10 10');
    markerRed.setAttribute('refX', '34');
    markerRed.setAttribute('refY', '5');
    markerRed.setAttribute('markerWidth', '8');
    markerRed.setAttribute('markerHeight', '8');
    markerRed.setAttribute('orient', 'auto-start-reverse');
    const pathRed = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathRed.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    pathRed.setAttribute('fill', '#ef4444');
    markerRed?.appendChild(pathRed);
    defs?.appendChild(markerRed);

    const markerYellow = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    markerYellow.setAttribute('id', 'nc-arrow-yellow');
    markerYellow.setAttribute('viewBox', '0 0 10 10');
    markerYellow.setAttribute('refX', '34');
    markerYellow.setAttribute('refY', '5');
    markerYellow.setAttribute('markerWidth', '8');
    markerYellow.setAttribute('markerHeight', '8');
    markerYellow.setAttribute('orient', 'auto-start-reverse');
    const pathYellow = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathYellow.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z');
    pathYellow.setAttribute('fill', '#f59e0b');
    markerYellow?.appendChild(pathYellow);
    defs?.appendChild(markerYellow);

    svg?.appendChild(defs);

    // Draw edges
    NC_EDGES.forEach((edge, i) => {
      const p1 = NC_NODE_POS[edge.u];
      const p2 = NC_NODE_POS[edge.v];
      const status = step.edgeStatus[i];

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(p1.x));
      line.setAttribute('y1', String(p1.y));
      line.setAttribute('x2', String(p2.x));
      line.setAttribute('y2', String(p2.y));
      line.classList.add('nc-edge');

      if (status === 'cycle') {
        line.setAttribute('stroke', '#ef4444');
        line.setAttribute('stroke-width', '4');
        line.setAttribute('marker-end', 'url(#nc-arrow-red)');
        line.style.animation = 'cyclePulse 0.8s infinite';
      } else if (status === 'current') {
        line.setAttribute('stroke', '#f59e0b');
        line.setAttribute('stroke-width', '3');
        line.setAttribute('marker-end', 'url(#nc-arrow-yellow)');
      } else {
        line.setAttribute('stroke', edge.w < 0 ? 'rgba(239, 68, 68, 0.4)' : 'rgba(239, 68, 68, 0.2)');
        line.setAttribute('stroke-width', edge.w < 0 ? '2' : '1.5');
        line.setAttribute('marker-end', 'url(#nc-arrow)');
        if (edge.w < 0) line.setAttribute('stroke-dasharray', '6,3');
      }
      svg?.appendChild(line);

      // Weight label
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      const dx = p2.y - p1.y;
      const dy = -(p2.x - p1.x);
      const len = Math.sqrt(dx * dx + dy * dy) || 1;
      const ox = (dx / len) * 12;
      const oy = (dy / len) * 12;

      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('x', String(mx + ox - 14));
      bg.setAttribute('y', String(my + oy - 10));
      bg.setAttribute('width', '28');
      bg.setAttribute('height', '20');
      bg.setAttribute('rx', '4');
      bg.setAttribute('fill', status === 'current' ? 'rgba(245, 158, 11, 0.3)' : status === 'cycle' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(30, 30, 50, 0.8)');
      bg.setAttribute('stroke', status === 'current' ? '#f59e0b' : edge.w < 0 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(156, 163, 175, 0.4)');
      bg.setAttribute('stroke-width', '1');
      svg?.appendChild(bg);

      const wt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      wt.setAttribute('x', String(mx + ox));
      wt.setAttribute('y', String(my + oy + 5));
      wt.setAttribute('text-anchor', 'middle');
      wt.setAttribute('fill', edge.w < 0 ? '#ef4444' : status === 'current' ? '#f59e0b' : 'rgba(239, 68, 68, 0.7)');
      wt.setAttribute('font-size', '12');
      wt.setAttribute('font-weight', '700');
      wt.setAttribute('font-family', 'ui-monospace, monospace');
      wt.textContent = String(edge.w);
      svg?.appendChild(wt);
    });

    // Draw nodes
    const highlightSet = new Set(step.nodeHighlight);
    NC_NODES.forEach((node, i) => {
      const pos = NC_NODE_POS[i];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('nc-node');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(pos.x));
      circle.setAttribute('cy', String(pos.y));
      circle.setAttribute('r', '24');

      if (highlightSet.has(node)) {
        circle.setAttribute('fill', 'rgba(239, 68, 68, 0.4)');
        circle.setAttribute('stroke', '#ef4444');
        circle.setAttribute('stroke-width', '2.5');
      } else {
        circle.setAttribute('fill', 'rgba(239, 68, 68, 0.1)');
        circle.setAttribute('stroke', 'rgba(239, 68, 68, 0.4)');
        circle.setAttribute('stroke-width', '2');
      }
      g?.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(pos.x));
      text.setAttribute('y', String(pos.y + 6));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', highlightSet.has(node) ? '#ef4444' : 'rgba(239, 68, 68, 0.7)');
      text.setAttribute('font-size', '15');
      text.setAttribute('font-weight', '700');
      text.setAttribute('font-family', 'ui-monospace, monospace');
      text.textContent = String(node);
      g?.appendChild(text);

      svg?.appendChild(g);
    });

    this.graphEl?.appendChild(svg);
  }

  private renderDist(step: NCStep): void {
    if (!this.distEl) return;
    this.distEl.innerHTML = '';
    step.dist.forEach((val, i) => {
      const item = document.createElement('div');
      item.className = 'nc-dist-item';
      if (step.prevDist[i] !== val) item.classList.add('changed');
      const display = val === Infinity ? 'INF' : String(val);
      item.innerHTML = `<span class="nc-idx">${i}</span>${display}`;
      this.distEl?.appendChild(item);
    });
  }

  private renderLogLine(step: NCStep): void {
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
  id: 'negative-cycle',
  name: 'Bellman-Ford之判断负权回路',
  viewId: 'algo-negative-cycle-view',
  category: 'graph',
  description: '通过 V-1 轮松弛后检查第 V 轮是否仍能更新来判断负权环',
  icon: '⚠️',
  template,
  Visualizer: NegativeCycleVisualizer,
  difficulty: 3,
  levelOrder: 25,
  learningGoal: '理解 Bellman-Ford 算法检测负权回路的原理',
});

export {};
