/**
 * Dijkstra 堆优化版 (O((V+E)logV)) 可视化器
 * 使用最小堆优先队列
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import { GraphTopologyPresenter } from './graph-topology-presenter';
import template from './dijkstra-heap.html?raw';

interface DJHHeapItem {
  node: number;
  dist: number;
}

interface DJHStep extends StepBase {
  nodes: number[];
  edges: { from: number; to: number; w: number }[];
  dist: number[];
  prevDist: number[];
  visited: Set<number>;
  currentNode: number | null;
  relaxEdge: { from: number; to: number } | null;
  heap: DJHHeapItem[];
  action: 'init' | 'extract' | 'relax' | 'push' | 'skip' | 'stale' | 'done';
  statusText: string;
  log: string;
  codeLine: number | number[];
}

const DJH_NODES = [0, 1, 2, 3, 4];
const DJH_EDGES = [
  { from: 0, to: 1, w: 4 },
  { from: 0, to: 2, w: 1 },
  { from: 2, to: 1, w: 2 },
  { from: 1, to: 3, w: 1 },
  { from: 2, to: 3, w: 5 },
  { from: 3, to: 4, w: 3 },
];

// Node positions for SVG layout
const DJH_NODE_POSITIONS: { x: number; y: number }[] = [
  { x: 80, y: 120 },
  { x: 240, y: 50 },
  { x: 240, y: 190 },
  { x: 380, y: 120 },
  { x: 460, y: 120 },
];

const INF = Infinity;

function buildDJHSteps(): DJHStep[] {
  const steps: DJHStep[] = [];
  const n = DJH_NODES.length;
  const source = 0;

  const dist = new Array(n).fill(INF);
  dist[source] = 0;
  const visited = new Set<number>();

  // Build adjacency list
  const adj: { to: number; w: number }[][] = Array.from({ length: n }, () => []);
  for (const e of DJH_EDGES) {
    adj[e.from].push({ to: e.to, w: e.w });
  }

  // Simple min-heap simulation
  let heap: DJHHeapItem[] = [{ node: source, dist: 0 }];
  let prevDistSnapshot = [...dist];

  const snap = (action: DJHStep['action'], currentNode: number | null, relaxEdge: DJHStep['relaxEdge'], heapSnapshot: DJHHeapItem[], statusText: string, msg: string, log: string, code: number | number[]) => {
    steps.push({
      nodes: [...DJH_NODES],
      edges: DJH_EDGES.map(e => ({ ...e })),
      dist: [...dist],
      prevDist: [...prevDistSnapshot],
      visited: new Set(visited),
      currentNode,
      relaxEdge,
      heap: heapSnapshot.map(h => ({ ...h })),
      action,
      statusText,
      message: msg,
      log,
      codeLine: code,
    });
    prevDistSnapshot = [...dist];
  };

  // Init
  snap('init', null, null, [...heap], '初始化',
    `初始化: 源点=${source}, dist[${source}]=0, 将 (node=${source}, dist=0) 入堆。`,
    `初始化: 源点入堆`, [0, 1]);

  while (heap.length > 0) {
    // Extract min from heap
    heap.sort((a, b) => a.dist - b.dist);
    const top = heap.shift()!;
    const { node: u, dist: topDist } = top;

    // Check if stale
    if (visited.has(u)) {
      snap('stale', null, null, [...heap], '跳过旧记录',
        `堆顶 (node=${u}, dist=${topDist}) 已访问，跳过。`,
        `跳过: node${u}已访问`, [3, 4]);
      continue;
    }

    snap('extract', u, null, [...heap], '出堆',
      `从堆中取出 (node=${u}, dist=${topDist})，标记为已访问。堆剩余 ${heap.length} 个元素。`,
      `出堆: node${u}(dist=${topDist})`, [2, 3]);

    visited.add(u);

    // Relax edges
    for (const { to, w } of adj[u]) {
      const newDist = dist[u] + w;
      if (newDist < dist[to]) {
        const oldDist = dist[to];
        dist[to] = newDist;
        heap.push({ node: to, dist: newDist });
        snap('relax', u, { from: u, to }, [...heap], '松弛成功',
          `松弛 ${u}->${to}: dist[${u}]+${w}=${newDist} < ${oldDist === INF ? 'INF' : oldDist}，更新 dist[${to}]=${newDist}，将 (node=${to}, dist=${newDist}) 入堆。`,
          `松弛成功: ${u}->${to}, dist=${oldDist === INF ? 'INF' : oldDist}->${newDist}`, [5, 6]);
      } else {
        snap('skip', u, { from: u, to }, [...heap], '无需更新',
          `检查 ${u}->${to}: dist[${u}]+${w}=${newDist} >= dist[${to}]=${dist[to] === INF ? 'INF' : dist[to]}，无需更新。`,
          `无需更新: ${u}->${to}`, [5, 7]);
      }
    }
  }

  // Done
  snap('done', null, null, [], '完成',
    `Dijkstra 堆优化版完成！最短距离: [${dist.map((d, i) => `${i}:${d === INF ? 'INF' : d}`).join(', ')}]`,
    `完成: 最短路径已求出`, [8]);

  return steps;
}

export class DijkstraHeapVisualizer extends StepVisualizer<DJHStep> {
  protected codeLines = [
    'int[] dijkstraHeap(List<int[]>[] adj, int source) {',
    '    int[] dist = new int[V]; Arrays.fill(dist, INF);',
    '    dist[source] = 0;',
    '    PriorityQueue<int[]> pq = new PriorityQueue<>((a, b) -> a[1] - b[1]);',
    '    pq.add(new int[]{source, 0});',
    '    boolean[] visited = new boolean[V];',
    '    while (!pq.isEmpty()) {',
    '        int[] top = pq.poll(); int u = top[0];',
    '        if (visited[u]) continue;',
    '        visited[u] = true;',
    '        for (int[] edge : adj[u]) {',
    '            int v = edge[0], w = edge[1];',
    '            if (dist[u] + w < dist[v]) {',
    '                dist[v] = dist[u] + w;',
    '                pq.add(new int[]{v, dist[v]});',
    '            }',
    '        }',
    '    }',
    '}',
  ];
  protected codePanelTitle = 'Dijkstra 堆优化版代码 (Java)';

  private graphEl: HTMLElement | null = null;
  private heapEl: HTMLElement | null = null;
  private distEl: HTMLElement | null = null;
  private visitedEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private currentEl: HTMLElement | null = null;
  private visitedCountEl: HTMLElement | null = null;
  private heapSizeEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.graphEl = this.root.querySelector('#djh-graph');
    this.heapEl = this.root.querySelector('#djh-heap');
    this.distEl = this.root.querySelector('#djh-dist');
    this.visitedEl = this.root.querySelector('#djh-visited');
    this.logEl = this.root.querySelector('#djh-log');
    this.currentEl = this.root.querySelector('#djh-current');
    this.visitedCountEl = this.root.querySelector('#djh-visited-count');
    this.heapSizeEl = this.root.querySelector('#djh-heap-size');
    this.statusEl = this.root.querySelector('#djh-status');
    this.btnStart = this.root.querySelector('#djh-start');
    this.bindPlaybackControls({
      speed: 'djh-speed',
      speedLabel: 'djh-speed-label',
      message: 'step-message',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
  }

  protected buildSteps(): DJHStep[] {
    return buildDJHSteps();
  }

  protected renderStep(step: DJHStep): void {
    if (this.currentEl) {
      this.currentEl.textContent = step.currentNode !== null ? String(step.currentNode) : '-';
    }
    if (this.visitedCountEl) this.visitedCountEl.textContent = String(step.visited.size);
    if (this.heapSizeEl) this.heapSizeEl.textContent = String(step.heap.length);
    if (this.statusEl) {
      this.statusEl.textContent = step.statusText;
      if (step.action === 'relax') {
        (this.statusEl as HTMLElement).style.color = '#22c55e';
      } else if (step.action === 'skip' || step.action === 'stale') {
        (this.statusEl as HTMLElement).style.color = '#f59e0b';
      } else {
        (this.statusEl as HTMLElement).style.color = '#6366f1';
      }
    }

    this.renderGraph(step);
    this.renderHeap(step);
    this.renderDist(step);
    this.renderVisited(step);
    this.renderLogLine(step);
  }

  private renderGraph(step: DJHStep): void {
    if (!this.graphEl) return;

    const visualNodes = step.nodes.map((nodeId) => {
      const pos = DJH_NODE_POSITIONS[nodeId];
      return {
        id: nodeId,
        x: pos.x,
        y: pos.y,
        isVisited: step.visited.has(nodeId),
        isCurrent: step.currentNode === nodeId
      };
    });

    const visualEdges = step.edges.map((edge) => {
      const isRelaxEdge =
        step.relaxEdge !== null &&
        step.relaxEdge.from === edge.from &&
        step.relaxEdge.to === edge.to;
      return {
        from: edge.from,
        to: edge.to,
        weight: edge.w,
        isDirected: true,
        isRelaxing: isRelaxEdge && step.action !== 'relax',
        isRelaxSuccess: isRelaxEdge && step.action === 'relax',
        isFromCurrent: step.currentNode === edge.from
      };
    });

    GraphTopologyPresenter.render(this.graphEl, visualNodes, visualEdges, {
      viewBox: '0 0 540 240',
      height: '240px',
      prefix: 'djh'
    });
  }

  private renderHeap(step: DJHStep): void {
    if (!this.heapEl) return;
    this.heapEl.innerHTML = '';
    if (step.heap.length === 0) {
      const empty = document.createElement('span');
      empty.style.color = 'rgba(204, 214, 244, 0.4)';
      empty.style.fontSize = '13px';
      empty.textContent = '（空堆）';
      this.heapEl?.appendChild(empty);
      return;
    }
    // Sort for display (min-heap order)
    const sorted = [...step.heap].sort((a, b) => a.dist - b.dist);
    sorted.forEach((item, i) => {
      const el = document.createElement('div');
      el.className = 'djh-heap-item';
      if (i === 0) el.classList.add('top');
      el.innerHTML = `<span class="djh-heap-node">node=${item.node}</span>d=${item.dist}`;
      this.heapEl?.appendChild(el);
    });
  }

  private renderDist(step: DJHStep): void {
    if (!this.distEl) return;
    this.distEl.innerHTML = '';
    step.nodes.forEach((node, i) => {
      const item = document.createElement('div');
      item.className = 'djh-dist-item';
      const d = step.dist[i];
      const isUpdated = step.prevDist[i] !== step.dist[i];
      if (isUpdated) item.classList.add('updated');
      if (step.visited.has(node)) item.classList.add('visited-node');
      item.innerHTML = `<span class="djh-idx">dist[${node}]</span>${d === INF ? 'INF' : d}`;
      this.distEl?.appendChild(item);
    });
  }

  private renderVisited(step: DJHStep): void {
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
      item.className = 'djh-visited-item';
      item.textContent = String(node);
      this.visitedEl?.appendChild(item);
    });
  }

  private renderLogLine(step: DJHStep): void {
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
  id: 'dijkstra-heap',
  name: 'Dijkstra 堆优化版',
  viewId: 'algo-dijkstra-heap-view',
  category: 'graph',
  description: '优先队列 O((V+E)logV) 单源最短路径',
  icon: '🔮',
  template,
  Visualizer: DijkstraHeapVisualizer,
  difficulty: 3,
  levelOrder: 22,
  learningGoal: '理解堆优化如何将选最小节点的操作从 O(V) 降到 O(logV)',
});

export {};
