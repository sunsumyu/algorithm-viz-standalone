/**
 * Dijkstra 朴素版 (O(V^2)) 可视化器
 * 数组-based min 提取的单源最短路径
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './dijkstra-basic.html?raw';

interface DJBStep extends StepBase {
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

const DJB_NODES = [0, 1, 2, 3, 4];
const DJB_EDGES = [
  { from: 0, to: 1, w: 4 },
  { from: 0, to: 2, w: 1 },
  { from: 2, to: 1, w: 2 },
  { from: 1, to: 3, w: 1 },
  { from: 2, to: 3, w: 5 },
  { from: 3, to: 4, w: 3 },
];

// Node positions for SVG layout
const DJB_NODE_POSITIONS: { x: number; y: number }[] = [
  { x: 80, y: 140 },
  { x: 240, y: 60 },
  { x: 240, y: 220 },
  { x: 380, y: 140 },
  { x: 460, y: 140 },
];

const INF = Infinity;

function buildDJBSteps(): DJBStep[] {
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

  const snap = (action: DJBStep['action'], currentNode: number | null, relaxEdge: DJBStep['relaxEdge'], statusText: string, msg: string, log: string, code: number | number[]) => {
    steps.push({
      nodes: [...DJB_NODES],
      edges: DJB_EDGES.map(e => ({ ...e })),
      dist: [...dist],
      prevDist: [...prevDistSnapshot],
      visited: new Set(visited),
      currentNode,
      relaxEdge,
      relaxCount,
      action,
      statusText,
      message: msg,
      log,
      codeLine: code,
    });
    prevDistSnapshot = [...dist];
  };

  // Init
  snap('init', null, null, '初始化',
    `初始化: 源点=${source}, dist[${source}]=0, 其余 dist=INF。`,
    `初始化: dist=0, 其余=INF`, [0, 1]);

  // Main loop
  for (let iter = 0; iter < n; iter++) {
    // Find unvisited node with min dist
    let minNode = -1;
    let minDist = INF;
    for (let i = 0; i < n; i++) {
      if (!visited.has(i) && dist[i] < minDist) {
        minDist = dist[i];
        minNode = i;
      }
    }
    if (minNode === -1) break;

    snap('select', minNode, null, '选择',
      `选择未访问中 dist 最小的节点 ${minNode}（dist=${minDist}），标记为已访问。`,
      `选最小: 节点${minNode}(dist=${minDist})`, [2, 3]);

    visited.add(minNode);

    // Relax edges from minNode
    for (const { to, w } of adj[minNode]) {
      const newDist = dist[minNode] + w;
      relaxCount++;

      if (newDist < dist[to]) {
        const oldDist = dist[to];
        dist[to] = newDist;
        snap('relax', minNode, { from: minNode, to }, '松弛成功',
          `松弛 ${minNode}->${to}: dist[${minNode}]+${w}=${newDist} < dist[${to}]=${oldDist === INF ? 'INF' : oldDist}，更新 dist[${to}]=${newDist}。`,
          `松弛成功: ${minNode}->${to}, dist=${oldDist === INF ? 'INF' : oldDist}->${newDist}`, [4, 5]);
      } else {
        snap('skip', minNode, { from: minNode, to }, '无需更新',
          `检查 ${minNode}->${to}: dist[${minNode}]+${w}=${newDist} >= dist[${to}]=${dist[to] === INF ? 'INF' : dist[to]}，无需更新。`,
          `无需更新: ${minNode}->${to}`, [4, 6]);
      }
    }
  }

  // Done
  snap('done', null, null, '完成',
    `Dijkstra 完成！最短距离: [${dist.map((d, i) => `${i}:${d === INF ? 'INF' : d}`).join(', ')}]`,
    `完成: 最短路径已求出`, [7]);

  return steps;
}

export class DijkstraBasicVisualizer extends StepVisualizer<DJBStep> {
  protected codeLines = [
    'int[] dijkstra(List<int[]>[] adj, int source) {',
    '    int[] dist = new int[V]; Arrays.fill(dist, INF);',
    '    dist[source] = 0; boolean[] visited = new boolean[V];',
    '    for (int i = 0; i < V; i++) {',
    '        int u = min dist among unvisited;',
    '        visited[u] = true;',
    '        for (int[] edge : adj[u]) {',
    '            int v = edge[0], w = edge[1];',
    '            if (dist[u] + w < dist[v])',
    '                dist[v] = dist[u] + w;',
    '        }',
    '    }',
    '    return dist;',
    '}',
  ];
  protected codePanelTitle = 'Dijkstra 朴素版代码 (Java)';
  protected logContainerId = 'djb-log';

  private graphEl: HTMLElement | null = null;
  private distEl: HTMLElement | null = null;
  private visitedEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private currentEl: HTMLElement | null = null;
  private visitedCountEl: HTMLElement | null = null;
  private relaxCountEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.graphEl = this.root.querySelector('#djb-graph');
    this.distEl = this.root.querySelector('#djb-dist');
    this.visitedEl = this.root.querySelector('#djb-visited');
    this.logEl = this.root.querySelector('#djb-log');
    this.currentEl = this.root.querySelector('#djb-current');
    this.visitedCountEl = this.root.querySelector('#djb-visited-count');
    this.relaxCountEl = this.root.querySelector('#djb-relax-count');
    this.statusEl = this.root.querySelector('#djb-status');
    this.btnStart = this.root.querySelector('#djb-start');
    this.bindPlaybackControls({
      speed: 'djb-speed',
      speedLabel: 'djb-speed-label',
      message: 'step-message',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
  }

  protected buildSteps(): DJBStep[] {
    return buildDJBSteps();
  }

  protected renderStep(step: DJBStep): void {
    if (this.currentEl) {
      this.currentEl.textContent = step.currentNode !== null ? String(step.currentNode) : '-';
    }
    if (this.visitedCountEl) this.visitedCountEl.textContent = String(step.visited.size);
    if (this.relaxCountEl) this.relaxCountEl.textContent = String(step.relaxCount);
    if (this.statusEl) {
      this.statusEl.textContent = step.statusText;
      if (step.action === 'relax') {
        (this.statusEl as HTMLElement).style.color = '#22c55e';
      } else if (step.action === 'skip') {
        (this.statusEl as HTMLElement).style.color = '#f59e0b';
      } else {
        (this.statusEl as HTMLElement).style.color = '#3b82f6';
      }
    }

    this.renderGraph(step);
    this.renderDist(step);
    this.renderVisited(step);
    this.updateLog(this.logEl);
  }

  private renderGraph(step: DJBStep): void {
    if (!this.graphEl) return;
    this.graphEl.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 540 280');
    svg.style.width = '100%';
    svg.style.maxWidth = '540px';
    svg.style.height = '280px';

    // Draw edges
    for (const edge of step.edges) {
      const p1 = DJB_NODE_POSITIONS[edge.from];
      const p2 = DJB_NODE_POSITIONS[edge.to];
      const isRelaxEdge = step.relaxEdge !== null &&
        step.relaxEdge.from === edge.from && step.relaxEdge.to === edge.to;
      const isFromCurrent = step.currentNode === edge.from;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('djb-edge');

      // Line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(p1.x));
      line.setAttribute('y1', String(p1.y));
      line.setAttribute('x2', String(p2.x));
      line.setAttribute('y2', String(p2.y));

      if (isRelaxEdge && step.action === 'relax') {
        line.setAttribute('stroke', '#22c55e');
        line.setAttribute('stroke-width', '3.5');
        line.style.animation = 'pathPulse 0.8s infinite';
      } else if (isRelaxEdge) {
        line.setAttribute('stroke', '#f59e0b');
        line.setAttribute('stroke-width', '3');
      } else if (isFromCurrent) {
        line.setAttribute('stroke', 'rgba(59, 130, 246, 0.5)');
        line.setAttribute('stroke-width', '2');
      } else {
        line.setAttribute('stroke', 'rgba(59, 130, 246, 0.2)');
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

      let strokeColor = 'rgba(59, 130, 246, 0.2)';
      if (isRelaxEdge && step.action === 'relax') strokeColor = '#22c55e';
      else if (isRelaxEdge) strokeColor = '#f59e0b';
      else if (isFromCurrent) strokeColor = 'rgba(59, 130, 246, 0.5)';

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
      bg.setAttribute('x', String(mx - 12));
      bg.setAttribute('y', String(my - 10));
      bg.setAttribute('width', '24');
      bg.setAttribute('height', '20');
      bg.setAttribute('rx', '4');
      bg.setAttribute('fill', isRelaxEdge && step.action === 'relax' ? 'rgba(34, 197, 94, 0.3)' : isRelaxEdge ? 'rgba(245, 158, 11, 0.3)' : 'rgba(30, 30, 50, 0.8)');
      bg.setAttribute('stroke', isRelaxEdge && step.action === 'relax' ? '#22c55e' : isRelaxEdge ? '#f59e0b' : 'rgba(156, 163, 175, 0.4)');
      bg.setAttribute('stroke-width', '1');
      g?.appendChild(bg);

      const wt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      wt.setAttribute('x', String(mx));
      wt.setAttribute('y', String(my + 5));
      wt.setAttribute('text-anchor', 'middle');
      wt.setAttribute('fill', isRelaxEdge && step.action === 'relax' ? '#22c55e' : isRelaxEdge ? '#f59e0b' : 'rgba(156, 163, 175, 0.7)');
      wt.setAttribute('font-size', '12');
      wt.setAttribute('font-weight', '700');
      wt.setAttribute('font-family', 'ui-monospace, monospace');
      wt.textContent = String(edge.w);
      g?.appendChild(wt);

      svg?.appendChild(g);
    }

    // Draw nodes
    for (let i = 0; i < step.nodes.length; i++) {
      const pos = DJB_NODE_POSITIONS[i];
      const isVisited = step.visited.has(i);
      const isCurrent = step.currentNode === i;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('djb-node');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(pos.x));
      circle.setAttribute('cy', String(pos.y));
      circle.setAttribute('r', '22');

      if (isCurrent) {
        circle.setAttribute('fill', 'rgba(245, 158, 11, 0.5)');
        circle.setAttribute('stroke', '#f59e0b');
        circle.setAttribute('stroke-width', '3');
        circle.style.animation = 'pulse 1s infinite';
      } else if (isVisited) {
        circle.setAttribute('fill', 'rgba(34, 197, 94, 0.3)');
        circle.setAttribute('stroke', '#22c55e');
        circle.setAttribute('stroke-width', '2');
      } else {
        circle.setAttribute('fill', 'rgba(59, 130, 246, 0.12)');
        circle.setAttribute('stroke', '#3b82f6');
        circle.setAttribute('stroke-width', '2');
      }
      g?.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(pos.x));
      text.setAttribute('y', String(pos.y + 6));
      text.setAttribute('text-anchor', 'middle');
      const textColor = isCurrent ? '#fff' : isVisited ? '#22c55e' : '#3b82f6';
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

  private renderDist(step: DJBStep): void {
    if (!this.distEl) return;
    this.distEl.innerHTML = '';
    step.nodes.forEach((node, i) => {
      const item = document.createElement('div');
      item.className = 'djb-dist-item';
      const d = step.dist[i];
      const isUpdated = step.prevDist[i] !== step.dist[i];
      if (isUpdated) item.classList.add('updated');
      if (step.visited.has(node)) item.classList.add('visited-node');
      item.innerHTML = `<span class="djb-idx">dist[${node}]</span>${d === INF ? 'INF' : d}`;
      this.distEl?.appendChild(item);
    });
  }

  private renderVisited(step: DJBStep): void {
    if (!this.visitedEl) return;
    this.visitedEl.innerHTML = '';
    if (step.visited.size === 0) {
      const empty = document.createElement('span');
      empty.style.color = 'rgba(204, 214, 244, 0.4)';
      empty.style.fontSize = '13px';
      empty.textContent = '（空）';
      this.visitedEl?.appendChild(empty);
      return;
    }
    step.visited.forEach((node) => {
      const item = document.createElement('div');
      item.className = 'djb-visited-item';
      item.textContent = String(node);
      this.visitedEl?.appendChild(item);
    });
  }

}

registerAlgorithm({
  id: 'dijkstra-basic',
  name: 'Dijkstra 朴素版',
  viewId: 'algo-dijkstra-basic-view',
  category: 'graph',
  description: '数组-based O(V^2) 单源最短路径，每次选 dist 最小未访问节点',
  icon: '📏',
  template,
  Visualizer: DijkstraBasicVisualizer,
  difficulty: 3,
  levelOrder: 21,
  learningGoal: '理解 Dijkstra 算法中贪心选最小距离节点和边松弛的过程',
});

export {};
