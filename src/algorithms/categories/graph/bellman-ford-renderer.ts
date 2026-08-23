/**
 * Bellman-Ford 算法可视化器
 * 松弛所有边 V-1 轮，支持负权边
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './bellman-ford.html?raw';

interface BFStep extends StepBase {
  nodes: number[];
  edges: { from: number; to: number; w: number }[];
  dist: number[];
  prevDist: number[];
  currentRound: number;
  currentEdgeIdx: number;
  currentNode: number | null;
  relaxEdge: { from: number; to: number; w: number } | null;
  relaxSuccess: boolean;
  updateCount: number;
  action: 'init' | 'round-start' | 'relax' | 'skip' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
}

const BF_NODES = [0, 1, 2, 3, 4];
const BF_EDGES = [
  { from: 0, to: 1, w: 4 },
  { from: 0, to: 2, w: 1 },
  { from: 2, to: 1, w: -2 },
  { from: 1, to: 3, w: 1 },
  { from: 2, to: 3, w: 5 },
  { from: 3, to: 4, w: 3 },
];

// Node positions for SVG layout
const BF_NODE_POSITIONS: { x: number; y: number }[] = [
  { x: 80, y: 140 },
  { x: 240, y: 60 },
  { x: 240, y: 220 },
  { x: 380, y: 140 },
  { x: 460, y: 140 },
];

const INF = Infinity;

function buildBFSteps(): BFStep[] {
  const steps: BFStep[] = [];
  const n = BF_NODES.length;
  const source = 0;
  const totalRounds = n - 1;

  const dist = new Array(n).fill(INF);
  dist[source] = 0;
  let updateCount = 0;
  let prevDistSnapshot = [...dist];

  const snap = (action: BFStep['action'], currentRound: number, currentEdgeIdx: number, currentNode: number | null, relaxEdge: BFStep['relaxEdge'], relaxSuccess: boolean, statusText: string, msg: string, log: string, code: number | number[]) => {
    steps.push({
      nodes: [...BF_NODES],
      edges: BF_EDGES.map(e => ({ ...e })),
      dist: [...dist],
      prevDist: [...prevDistSnapshot],
      currentRound,
      currentEdgeIdx,
      currentNode,
      relaxEdge,
      relaxSuccess,
      updateCount,
      action,
      statusText,
      message: msg,
      log,
      codeLine: code,
    });
    prevDistSnapshot = [...dist];
  };

  // Init
  snap('init', 0, -1, null, null, false, '初始化',
    `初始化: 源点=${source}, dist[${source}]=0, 其余 dist=INF。共 ${n} 个节点，需 ${totalRounds} 轮松弛。`,
    `初始化: dist[0]=0, 其余=INF`, [0, 1]);

  // Main loop: V-1 rounds
  for (let round = 1; round <= totalRounds; round++) {
    let updatedThisRound = false;

    snap('round-start', round, -1, null, null, false, `第${round}轮`,
      `第 ${round}/${totalRounds} 轮松弛开始：遍历所有 ${BF_EDGES.length} 条边。`,
      `第${round}轮开始`, [2, 3]);

    for (let ei = 0; ei < BF_EDGES.length; ei++) {
      const edge = BF_EDGES[ei];
      const newDist = dist[edge.from] + edge.w;

      if (dist[edge.from] !== INF && newDist < dist[edge.to]) {
        const oldDist = dist[edge.to];
        dist[edge.to] = newDist;
        updateCount++;
        updatedThisRound = true;
        snap('relax', round, ei, edge.from, { ...edge }, true, '更新',
          `第${round}轮: 松弛边 ${edge.from}->${edge.to}(w=${edge.w}): dist[${edge.from}]+${edge.w}=${newDist} < dist[${edge.to}]=${oldDist === INF ? 'INF' : oldDist}，更新为 ${newDist}。`,
          `第${round}轮: ${edge.from}->${edge.to} w=${edge.w}, ${oldDist === INF ? 'INF' : oldDist}->${newDist}`, [4, 5]);
      } else {
        const distStr = dist[edge.from] === INF ? 'INF' : String(dist[edge.from]);
        snap('skip', round, ei, dist[edge.from] === INF ? null : edge.from, { ...edge }, false, '跳过',
          `第${round}轮: 检查边 ${edge.from}->${edge.to}(w=${edge.w}): dist[${edge.from}]=${distStr}${dist[edge.from] === INF ? '(不可达)' : `+${edge.w}=${newDist}`} ${dist[edge.from] === INF ? '' : (newDist < dist[edge.to] ? '<' : '>=')} dist[${edge.to}]=${dist[edge.to] === INF ? 'INF' : dist[edge.to]}${newDist >= dist[edge.to] ? '，无需更新' : ''}。`,
          `第${round}轮: ${edge.from}->${edge.to} w=${edge.w}, 跳过`, [4, 6]);
      }
    }

    // Early termination if no updates this round
    if (!updatedThisRound) {
      snap('done', round, -1, null, null, false, '提前结束',
        `第 ${round} 轮无更新，提前结束！`,
        `第${round}轮无更新，提前结束`, [7]);
      return steps;
    }
  }

  // Done
  snap('done', totalRounds, -1, null, null, false, '完成',
    `Bellman-Ford 完成！共 ${totalRounds} 轮松弛，${updateCount} 次更新。最短距离: [${dist.map((d, i) => `${i}:${d === INF ? 'INF' : d}`).join(', ')}]`,
    `完成: ${updateCount}次更新, 最短路径已求出`, [7]);

  return steps;
}

export class BellmanFordVisualizer extends StepVisualizer<BFStep> {
  protected codeLines = [
    'int[] bellmanFord(int[][] edges, int V, int source) {',
    '    int[] dist = new int[V]; Arrays.fill(dist, INF);',
    '    dist[source] = 0;',
    '    for (int round = 1; round <= V - 1; round++) {',
    '        for (int[] e : edges) {',
    '            int u = e[0], v = e[1], w = e[2];',
    '            if (dist[u] + w < dist[v]) {',
    '                dist[v] = dist[u] + w;',
    '            }',
    '        }',
    '    }',
    '    return dist;',
    '}',
  ];
  protected codePanelTitle = 'Bellman-Ford 代码 (Java)';

  private graphEl: HTMLElement | null = null;
  private distEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private roundEl: HTMLElement | null = null;
  private edgeEl: HTMLElement | null = null;
  private updateCountEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.graphEl = this.root.querySelector('#bf-graph');
    this.distEl = this.root.querySelector('#bf-dist');
    this.logEl = this.root.querySelector('#bf-log');
    this.roundEl = this.root.querySelector('#bf-round');
    this.edgeEl = this.root.querySelector('#bf-edge');
    this.updateCountEl = this.root.querySelector('#bf-update-count');
    this.statusEl = this.root.querySelector('#bf-status');
    this.btnStart = this.root.querySelector('#bf-start');
    this.bindPlaybackControls({
      speed: 'bf-speed',
      speedLabel: 'bf-speed-label',
      message: 'step-message',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
  }

  protected buildSteps(): BFStep[] {
    return buildBFSteps();
  }

  protected renderStep(step: BFStep): void {
    if (this.roundEl) this.roundEl.textContent = step.currentRound > 0 ? `${step.currentRound}/4` : '-';
    if (this.edgeEl) {
      if (step.currentEdgeIdx >= 0) {
        const e = step.edges[step.currentEdgeIdx];
        this.edgeEl.textContent = `${e.from}->${e.to}`;
      } else {
        this.edgeEl.textContent = '-';
      }
    }
    if (this.updateCountEl) this.updateCountEl.textContent = String(step.updateCount);
    if (this.statusEl) {
      this.statusEl.textContent = step.statusText;
      if (step.action === 'relax') {
        (this.statusEl as HTMLElement).style.color = '#22c55e';
      } else if (step.action === 'skip') {
        (this.statusEl as HTMLElement).style.color = '#f59e0b';
      } else {
        (this.statusEl as HTMLElement).style.color = '#f97316';
      }
    }

    this.renderGraph(step);
    this.renderDist(step);
    this.renderLogLine(step);
  }

  private renderGraph(step: BFStep): void {
    if (!this.graphEl) return;
    this.graphEl.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 540 280');
    svg.style.width = '100%';
    svg.style.maxWidth = '540px';
    svg.style.height = '280px';

    // Draw edges
    for (let i = 0; i < step.edges.length; i++) {
      const edge = step.edges[i];
      const p1 = BF_NODE_POSITIONS[edge.from];
      const p2 = BF_NODE_POSITIONS[edge.to];
      const isRelaxEdge = step.relaxEdge !== null &&
        step.relaxEdge.from === edge.from && step.relaxEdge.to === edge.to &&
        i === step.currentEdgeIdx;
      const isFromCurrent = step.currentNode === edge.from;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('bf-edge');

      // Line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(p1.x));
      line.setAttribute('y1', String(p1.y));
      line.setAttribute('x2', String(p2.x));
      line.setAttribute('y2', String(p2.y));

      if (isRelaxEdge && step.relaxSuccess) {
        line.setAttribute('stroke', '#22c55e');
        line.setAttribute('stroke-width', '3.5');
        line.style.animation = 'pathPulse 0.8s infinite';
      } else if (isRelaxEdge) {
        line.setAttribute('stroke', '#f59e0b');
        line.setAttribute('stroke-width', '3');
      } else if (isFromCurrent) {
        line.setAttribute('stroke', 'rgba(249, 115, 22, 0.5)');
        line.setAttribute('stroke-width', '2');
      } else {
        line.setAttribute('stroke', 'rgba(249, 115, 22, 0.2)');
        line.setAttribute('stroke-width', '1.5');
      }
      g?.appendChild(line);

      // Arrow head
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const ux = dx / len;
      const uy = dy / len;
      const nodeR = 22;
      const ax = p2.x - ux * (nodeR + 4);
      const ay = p2.y - uy * (nodeR + 4);
      const arrowSize = 10;
      const perpX = -uy;
      const perpY = ux;

      let strokeColor = 'rgba(249, 115, 22, 0.2)';
      if (isRelaxEdge && step.relaxSuccess) strokeColor = '#22c55e';
      else if (isRelaxEdge) strokeColor = '#f59e0b';
      else if (isFromCurrent) strokeColor = 'rgba(249, 115, 22, 0.5)';

      const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      arrow.setAttribute('points',
        `${ax},${ay} ${ax - ux * arrowSize + perpX * arrowSize * 0.4},${ay - uy * arrowSize + perpY * arrowSize * 0.4} ${ax - ux * arrowSize - perpX * arrowSize * 0.4},${ay - uy * arrowSize - perpY * arrowSize * 0.4}`
      );
      arrow.setAttribute('fill', strokeColor);
      g?.appendChild(arrow);

      // Weight label (negative in red)
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('x', String(mx - 14));
      bg.setAttribute('y', String(my - 10));
      bg.setAttribute('width', '28');
      bg.setAttribute('height', '20');
      bg.setAttribute('rx', '4');
      bg.setAttribute('fill', isRelaxEdge && step.relaxSuccess ? 'rgba(34, 197, 94, 0.3)' : isRelaxEdge ? 'rgba(245, 158, 11, 0.3)' : 'rgba(30, 30, 50, 0.8)');
      bg.setAttribute('stroke', isRelaxEdge && step.relaxSuccess ? '#22c55e' : isRelaxEdge ? '#f59e0b' : edge.w < 0 ? 'rgba(239, 68, 68, 0.5)' : 'rgba(156, 163, 175, 0.4)');
      bg.setAttribute('stroke-width', '1');
      g?.appendChild(bg);

      const wt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      wt.setAttribute('x', String(mx));
      wt.setAttribute('y', String(my + 5));
      wt.setAttribute('text-anchor', 'middle');
      let weightColor = 'rgba(156, 163, 175, 0.7)';
      if (edge.w < 0) weightColor = '#ef4444';
      if (isRelaxEdge && step.relaxSuccess) weightColor = '#22c55e';
      else if (isRelaxEdge) weightColor = '#f59e0b';
      wt.setAttribute('fill', weightColor);
      wt.setAttribute('font-size', '12');
      wt.setAttribute('font-weight', '700');
      wt.setAttribute('font-family', 'ui-monospace, monospace');
      wt.textContent = String(edge.w);
      g?.appendChild(wt);

      svg?.appendChild(g);
    }

    // Draw nodes
    for (let i = 0; i < step.nodes.length; i++) {
      const pos = BF_NODE_POSITIONS[i];
      const isCurrent = step.currentNode === i;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('bf-node');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(pos.x));
      circle.setAttribute('cy', String(pos.y));
      circle.setAttribute('r', '22');

      if (isCurrent) {
        circle.setAttribute('fill', 'rgba(245, 158, 11, 0.5)');
        circle.setAttribute('stroke', '#f59e0b');
        circle.setAttribute('stroke-width', '3');
        circle.style.animation = 'pulse 1s infinite';
      } else {
        circle.setAttribute('fill', 'rgba(249, 115, 22, 0.12)');
        circle.setAttribute('stroke', '#f97316');
        circle.setAttribute('stroke-width', '2');
      }
      g?.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(pos.x));
      text.setAttribute('y', String(pos.y + 6));
      text.setAttribute('text-anchor', 'middle');
      const textColor = isCurrent ? '#fff' : '#f97316';
      text.setAttribute('fill', textColor);
      text.setAttribute('font-size', '15');
      text.setAttribute('font-weight', '700');
      text.setAttribute('font-family', 'ui-monospace, monospace');
      text.textContent = String(i);
      g?.appendChild(text);

      svg?.appendChild(g);
    }

    this.graphEl?.appendChild(svg);
  }

  private renderDist(step: BFStep): void {
    if (!this.distEl) return;
    this.distEl.innerHTML = '';
    step.nodes.forEach((node, i) => {
      const item = document.createElement('div');
      item.className = 'bf-dist-item';
      const d = step.dist[i];
      const isUpdated = step.prevDist[i] !== step.dist[i];
      if (isUpdated) item.classList.add('updated');
      item.innerHTML = `<span class="bf-idx">dist[${node}]</span>${d === INF ? 'INF' : d}`;
      this.distEl?.appendChild(item);
    });
  }

  private renderLogLine(step: BFStep): void {
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
  id: 'bellman-ford',
  name: 'Bellman-Ford 算法',
  viewId: 'algo-bellman-ford-view',
  category: 'graph',
  description: '松弛所有边 V-1 轮，支持负权边的单源最短路径',
  icon: '🔄',
  template,
  Visualizer: BellmanFordVisualizer,
  difficulty: 3,
  levelOrder: 23,
  learningGoal: '理解 Bellman-Ford 的逐轮松弛思想和负权边处理能力',
});

export {};
