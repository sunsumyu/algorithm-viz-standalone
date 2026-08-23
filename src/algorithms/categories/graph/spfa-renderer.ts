/**
 * SPFA (Shortest Path Faster Algorithm) 可视化器
 * Bellman-Ford 的队列优化版本
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './spfa.html?raw';

interface SPFStep extends StepBase {
  nodes: number[];
  edges: { from: number; to: number; w: number }[];
  dist: number[];
  prevDist: number[];
  queue: number[];
  inQueue: Set<number>;
  currentNode: number | null;
  relaxEdge: { from: number; to: number; w: number } | null;
  relaxSuccess: boolean;
  updateCount: number;
  action: 'init' | 'dequeue' | 'relax' | 'enqueue' | 'skip' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
}

const SPFA_NODES = [0, 1, 2, 3, 4];
const SPFA_EDGES = [
  { from: 0, to: 1, w: 4 },
  { from: 0, to: 2, w: 1 },
  { from: 2, to: 1, w: -2 },
  { from: 1, to: 3, w: 1 },
  { from: 2, to: 3, w: 5 },
  { from: 3, to: 4, w: 3 },
];

// Node positions for SVG layout
const SPFA_NODE_POSITIONS: { x: number; y: number }[] = [
  { x: 80, y: 140 },
  { x: 240, y: 60 },
  { x: 240, y: 220 },
  { x: 380, y: 140 },
  { x: 460, y: 140 },
];

const INF = Infinity;

function buildSPFASteps(): SPFStep[] {
  const steps: SPFStep[] = [];
  const n = SPFA_NODES.length;
  const source = 0;

  const dist = new Array(n).fill(INF);
  dist[source] = 0;
  const queue: number[] = [source];
  const inQueue = new Set<number>([source]);
  let updateCount = 0;
  let prevDistSnapshot = [...dist];

  // Build adjacency list
  const adj: { to: number; w: number }[][] = Array.from({ length: n }, () => []);
  for (const e of SPFA_EDGES) {
    adj[e.from].push({ to: e.to, w: e.w });
  }

  const snap = (action: SPFStep['action'], currentNode: number | null, queueSnapshot: number[], inQueueSnapshot: Set<number>, relaxEdge: SPFStep['relaxEdge'], relaxSuccess: boolean, statusText: string, msg: string, log: string, code: number | number[]) => {
    steps.push({
      nodes: [...SPFA_NODES],
      edges: SPFA_EDGES.map(e => ({ ...e })),
      dist: [...dist],
      prevDist: [...prevDistSnapshot],
      queue: [...queueSnapshot],
      inQueue: new Set(inQueueSnapshot),
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
  snap('init', null, [...queue], new Set(inQueue), null, false, '初始化',
    `初始化: 源点=${source}, dist[${source}]=0, 将其加入队列。其余 dist=INF。`,
    `初始化: dist[0]=0, 入队`, [0, 1, 2]);

  // Main loop
  while (queue.length > 0) {
    const u = queue.shift()!;
    inQueue.delete(u);

    snap('dequeue', u, [...queue], new Set(inQueue), null, false, '出队',
      `取出队首节点 ${u}，松弛其所有出边。`,
      `出队: 节点${u}`, [3, 4]);

    // Relax edges from u
    for (const { to, w } of adj[u]) {
      const newDist = dist[u] + w;
      if (newDist < dist[to]) {
        const oldDist = dist[to];
        dist[to] = newDist;
        updateCount++;

        snap('relax', u, [...queue], new Set(inQueue), { from: u, to, w }, true, '松弛成功',
          `松弛 ${u}->${to}(w=${w}): dist[${u}]+${w}=${newDist} < dist[${to}]=${oldDist === INF ? 'INF' : oldDist}，更新为 ${newDist}。`,
          `松弛成功: ${u}->${to}, ${oldDist === INF ? 'INF' : oldDist}->${newDist}`, [5, 6]);

        if (!inQueue.has(to)) {
          queue.push(to);
          inQueue.add(to);
          snap('enqueue', null, [...queue], new Set(inQueue), null, false, '入队',
            `节点 ${to} 不在队列中，将其加入队列。`,
            `节点${to}入队`, [7]);
        }
      } else {
        const distStr = dist[u] === INF ? 'INF' : String(dist[u]);
        snap('skip', u, [...queue], new Set(inQueue), { from: u, to, w }, false, '跳过',
          `检查 ${u}->${to}(w=${w}): dist[${u}]=${distStr}${dist[u] === INF ? '(不可达)' : `+${w}=${newDist}`} ${dist[u] === INF ? '' : (newDist < dist[to] ? '<' : '>=')} dist[${to}]=${dist[to] === INF ? 'INF' : dist[to]}${newDist >= dist[to] ? '，无需更新' : ''}。`,
          `跳过: ${u}->${to}`, [5, 8]);
      }
    }
  }

  // Done
  snap('done', null, [], new Set(), null, false, '完成',
    `SPFA 完成！共 ${updateCount} 次距离更新。最短距离: [${dist.map((d, i) => `${i}:${d === INF ? 'INF' : d}`).join(', ')}]`,
    `完成: ${updateCount}次更新, 最短路径已求出`, [9]);

  return steps;
}

export class SPFAVisualizer extends StepVisualizer<SPFStep> {
  protected codeLines = [
    'int[] SPFA(List<int[]>[] adj, int source) {',
    '    int[] dist = new int[V]; Arrays.fill(dist, INF);',
    '    dist[source] = 0;',
    '    Queue<Integer> queue = new LinkedList<>();',
    '    boolean[] inQueue = new boolean[V];',
    '    queue.add(source); inQueue[source] = true;',
    '    while (!queue.isEmpty()) {',
    '        int u = queue.poll(); inQueue[u] = false;',
    '        for (int[] edge : adj[u]) {',
    '            int v = edge[0], w = edge[1];',
    '            if (dist[u] + w < dist[v]) {',
    '                dist[v] = dist[u] + w;',
    '                if (!inQueue[v]) {',
    '                    queue.add(v); inQueue[v] = true;',
    '                }',
    '            }',
    '        }',
    '    }',
    '}',
  ];
  protected codePanelTitle = 'SPFA 算法代码 (Java)';

  private graphEl: HTMLElement | null = null;
  private queueEl: HTMLElement | null = null;
  private distEl: HTMLElement | null = null;
  private inQueueEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private currentEl: HTMLElement | null = null;
  private queueSizeEl: HTMLElement | null = null;
  private updateCountEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.graphEl = this.root.querySelector('#spfa-graph');
    this.queueEl = this.root.querySelector('#spfa-queue');
    this.distEl = this.root.querySelector('#spfa-dist');
    this.inQueueEl = this.root.querySelector('#spfa-inqueue');
    this.logEl = this.root.querySelector('#spfa-log');
    this.currentEl = this.root.querySelector('#spfa-current');
    this.queueSizeEl = this.root.querySelector('#spfa-queue-size');
    this.updateCountEl = this.root.querySelector('#spfa-update-count');
    this.statusEl = this.root.querySelector('#spfa-status');
    this.btnStart = this.root.querySelector('#spfa-start');
    this.bindPlaybackControls({
      speed: 'spfa-speed',
      speedLabel: 'spfa-speed-label',
      message: 'step-message',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
  }

  protected buildSteps(): SPFStep[] {
    return buildSPFASteps();
  }

  protected renderStep(step: SPFStep): void {
    if (this.currentEl) {
      this.currentEl.textContent = step.currentNode !== null ? String(step.currentNode) : '-';
    }
    if (this.queueSizeEl) this.queueSizeEl.textContent = String(step.queue.length);
    if (this.updateCountEl) this.updateCountEl.textContent = String(step.updateCount);
    if (this.statusEl) {
      this.statusEl.textContent = step.statusText;
      if (step.action === 'relax') {
        (this.statusEl as HTMLElement).style.color = '#22c55e';
      } else if (step.action === 'skip') {
        (this.statusEl as HTMLElement).style.color = '#f59e0b';
      } else {
        (this.statusEl as HTMLElement).style.color = '#14b8a6';
      }
    }

    this.renderGraph(step);
    this.renderQueue(step);
    this.renderDist(step);
    this.renderInQueue(step);
    this.renderLogLine(step);
  }

  private renderGraph(step: SPFStep): void {
    if (!this.graphEl) return;
    this.graphEl.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 540 280');
    svg.style.width = '100%';
    svg.style.maxWidth = '540px';
    svg.style.height = '280px';

    // Draw edges
    for (const edge of step.edges) {
      const p1 = SPFA_NODE_POSITIONS[edge.from];
      const p2 = SPFA_NODE_POSITIONS[edge.to];
      const isRelaxEdge = step.relaxEdge !== null &&
        step.relaxEdge.from === edge.from && step.relaxEdge.to === edge.to;
      const isFromCurrent = step.currentNode === edge.from;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('spfa-edge');

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
        line.setAttribute('stroke', 'rgba(20, 184, 166, 0.5)');
        line.setAttribute('stroke-width', '2');
      } else {
        line.setAttribute('stroke', 'rgba(20, 184, 166, 0.2)');
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

      let strokeColor = 'rgba(20, 184, 166, 0.2)';
      if (isRelaxEdge && step.relaxSuccess) strokeColor = '#22c55e';
      else if (isRelaxEdge) strokeColor = '#f59e0b';
      else if (isFromCurrent) strokeColor = 'rgba(20, 184, 166, 0.5)';

      const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      arrow.setAttribute('points',
        `${ax},${ay} ${ax - ux * arrowSize + perpX * arrowSize * 0.4},${ay - uy * arrowSize + perpY * arrowSize * 0.4} ${ax - ux * arrowSize - perpX * arrowSize * 0.4},${ay - uy * arrowSize - perpY * arrowSize * 0.4}`
      );
      arrow.setAttribute('fill', strokeColor);
      g?.appendChild(arrow);

      // Weight label
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
      const pos = SPFA_NODE_POSITIONS[i];
      const isInQueue = step.inQueue.has(i);
      const isCurrent = step.currentNode === i;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('spfa-node');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(pos.x));
      circle.setAttribute('cy', String(pos.y));
      circle.setAttribute('r', '22');

      if (isCurrent) {
        circle.setAttribute('fill', 'rgba(245, 158, 11, 0.5)');
        circle.setAttribute('stroke', '#f59e0b');
        circle.setAttribute('stroke-width', '3');
        circle.style.animation = 'pulse 1s infinite';
      } else if (isInQueue) {
        circle.setAttribute('fill', 'rgba(20, 184, 166, 0.4)');
        circle.setAttribute('stroke', '#14b8a6');
        circle.setAttribute('stroke-width', '3');
      } else {
        circle.setAttribute('fill', 'rgba(20, 184, 166, 0.12)');
        circle.setAttribute('stroke', '#14b8a6');
        circle.setAttribute('stroke-width', '2');
      }
      g?.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(pos.x));
      text.setAttribute('y', String(pos.y + 6));
      text.setAttribute('text-anchor', 'middle');
      const textColor = isCurrent ? '#fff' : isInQueue ? '#14b8a6' : '#14b8a6';
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

  private renderQueue(step: SPFStep): void {
    if (!this.queueEl) return;
    this.queueEl.innerHTML = '';
    if (step.queue.length === 0) {
      const empty = document.createElement('span');
      empty.style.color = 'rgba(204, 214, 244, 0.4)';
      empty.style.fontSize = '13px';
      empty.textContent = '（空队列）';
      this.queueEl?.appendChild(empty);
      return;
    }
    step.queue.forEach((node, i) => {
      const item = document.createElement('div');
      item.className = 'spfa-queue-item';
      if (i === 0 && step.action !== 'init') item.classList.add('current');
      item.textContent = String(node);
      this.queueEl?.appendChild(item);
    });
  }

  private renderDist(step: SPFStep): void {
    if (!this.distEl) return;
    this.distEl.innerHTML = '';
    step.nodes.forEach((node, i) => {
      const item = document.createElement('div');
      item.className = 'spfa-dist-item';
      const d = step.dist[i];
      const isUpdated = step.prevDist[i] !== step.dist[i];
      if (isUpdated) item.classList.add('updated');
      item.innerHTML = `<span class="spfa-idx">dist[${node}]</span>${d === INF ? 'INF' : d}`;
      this.distEl?.appendChild(item);
    });
  }

  private renderInQueue(step: SPFStep): void {
    if (!this.inQueueEl) return;
    this.inQueueEl.innerHTML = '';
    step.nodes.forEach((node, i) => {
      const item = document.createElement('div');
      item.className = 'spfa-inqueue-item';
      if (step.inQueue.has(node)) item.classList.add('in-queue');
      item.innerHTML = `<span class="spfa-idx">节点${node}</span>${step.inQueue.has(node) ? '✓' : '-'}`;
      this.inQueueEl?.appendChild(item);
    });
  }

  private renderLogLine(step: SPFStep): void {
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
  id: 'spfa',
  name: 'SPFA 算法',
  viewId: 'algo-spfa-view',
  category: 'graph',
  description: 'Bellman-Ford 的队列优化版本，仅松弛队列中节点的出边',
  icon: '⚡',
  template,
  Visualizer: SPFAVisualizer,
  difficulty: 3,
  levelOrder: 24,
  learningGoal: '理解 SPFA 中队列优化如何避免不必要的松弛操作',
});

export {};
