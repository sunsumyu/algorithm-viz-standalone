/**
 * 拓扑排序 (Kahn 算法) 可视化器
 * 计算入度，反复移除入度为 0 的节点
 */

import { StepBase, StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './topological-sort.html?raw';

interface TSStep extends StepBase {
  nodes: number[];
  edges: { from: number; to: number }[];
  inDegree: number[];
  prevInDegree: number[];
  queue: number[];
  currentNode: number | null;
  sorted: number[];
  removed: Set<number>;
  action: 'init' | 'enqueue' | 'process' | 'reduce' | 'done';
  log: string;
  codeLine: number | number[];
}

const TS_NODES = [0, 1, 2, 3, 4];
const TS_EDGES = [
  { from: 0, to: 1 },
  { from: 0, to: 2 },
  { from: 1, to: 3 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
];

// Node positions for SVG layout
const TS_NODE_POSITIONS: { x: number; y: number }[] = [
  { x: 80, y: 140 },
  { x: 220, y: 60 },
  { x: 220, y: 220 },
  { x: 360, y: 140 },
  { x: 460, y: 140 },
];

function buildTSSteps(): TSStep[] {
  const steps: TSStep[] = [];
  const n = TS_NODES.length;

  // Build adjacency list and compute in-degrees
  const adj: number[][] = Array.from({ length: n }, () => []);
  const inDegree = new Array(n).fill(0);

  for (const edge of TS_EDGES) {
    adj[edge.from].push(edge.to);
    inDegree[edge.to]++;
  }

  const prevInDegree = [...inDegree];

  const snap = (action: TSStep['action'], currentNode: number | null, queue: number[], sorted: number[], removed: Set<number>, msg: string, log: string, code: number | number[]) => {
    steps.push({
      nodes: [...TS_NODES],
      edges: TS_EDGES.map(e => ({ ...e })),
      inDegree: [...inDegree],
      prevInDegree: [...prevInDegree],
      queue: [...queue],
      currentNode,
      sorted: [...sorted],
      removed: new Set(removed),
      action,
      message: msg,
      log,
      codeLine: code,
    });
  };

  // Init: compute in-degrees
  const queue: number[] = [];
  for (let i = 0; i < n; i++) {
    if (inDegree[i] === 0) {
      queue.push(i);
    }
  }
  snap('init', null, [...queue], [], new Set(),
    `初始化: 计算 ${n} 个节点的入度。入度为 0 的节点: [${queue.join(', ')}] 入队。`,
    `初始化: 计算入度，零入度节点入队`, [0, 1, 2]);

  const removed = new Set<number>();
  const sorted: number[] = [];

  // Process queue
  let stepNum = 3;
  while (queue.length > 0) {
    const node = queue.shift()!;
    snap('process', node, [...queue], [...sorted], new Set(removed),
      `取出节点 ${node}（入度为 0），加入拓扑序。`,
      `取出节点 ${node}`, stepNum);
    stepNum++;

    sorted.push(node);
    removed.add(node);

    for (const neighbor of adj[node]) {
      const prevDeg = inDegree[neighbor];
      inDegree[neighbor]--;
      snap('reduce', node, [...queue], [...sorted], new Set(removed),
        `节点 ${node} -> ${neighbor}：入度从 ${prevDeg} 减为 ${inDegree[neighbor]}。`,
        `减少邻接节点 ${neighbor} 入度: ${prevDeg}->${inDegree[neighbor]}`, stepNum);
      stepNum++;

      if (inDegree[neighbor] === 0) {
        queue.push(neighbor);
        snap('enqueue', null, [...queue], [...sorted], new Set(removed),
          `节点 ${neighbor} 入度变为 0，加入队列。`,
          `节点 ${neighbor} 入度为0，入队`, stepNum);
        stepNum++;
      }
    }
  }

  // Done
  snap('done', null, [], [...sorted], new Set(removed),
    `拓扑排序完成！结果: [${sorted.join(', ')}]`,
    `完成: 拓扑序 = [${sorted.join(', ')}]`, 7);

  return steps;
}

export class TopologicalSortVisualizer extends StepVisualizer<TSStep> {
  protected codeLines = [
    'int[] topologicalSort(List<List<Integer>> adj, int V) {',
    '    int[] inDegree = new int[V];',
    '    for (int u = 0; u < V; u++)',
    '        for (int v : adj.get(u)) inDegree[v]++;',
    '    Queue<Integer> queue = new LinkedList<>();',
    '    for (int i = 0; i < V; i++)',
    '        if (inDegree[i] == 0) queue.add(i);',
    '    List<Integer> sorted = new ArrayList<>();',
    '    while (!queue.isEmpty()) {',
    '        int node = queue.poll(); sorted.add(node);',
    '        for (int nb : adj.get(node)) {',
    '            if (--inDegree[nb] == 0) queue.add(nb);',
    '        }',
    '    }',
    '}',
  ];
  protected codePanelTitle = 'Kahn 拓扑排序代码 (Java)';

  private graphEl: HTMLElement | null = null;
  private inDegreeEl: HTMLElement | null = null;
  private queueEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private currentEl: HTMLElement | null = null;
  private sortedCountEl: HTMLElement | null = null;
  private queueSizeEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.graphEl = this.root.querySelector('#ts-graph');
    this.inDegreeEl = this.root.querySelector('#ts-indegree');
    this.queueEl = this.root.querySelector('#ts-queue');
    this.resultEl = this.root.querySelector('#ts-result');
    this.logEl = this.root.querySelector('#ts-log');
    this.currentEl = this.root.querySelector('#ts-current');
    this.sortedCountEl = this.root.querySelector('#ts-sorted-count');
    this.queueSizeEl = this.root.querySelector('#ts-queue-size');
    this.btnStart = this.root.querySelector('#ts-start');
    this.bindPlaybackControls({
      speed: 'ts-speed',
      speedLabel: 'ts-speed-label',
      message: 'step-message',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
  }

  protected buildSteps(): TSStep[] {
    return buildTSSteps();
  }

  protected renderStep(step: TSStep): void {
    if (this.currentEl) {
      this.currentEl.textContent = step.currentNode !== null ? String(step.currentNode) : '-';
    }
    if (this.sortedCountEl) this.sortedCountEl.textContent = String(step.sorted.length);
    if (this.queueSizeEl) this.queueSizeEl.textContent = String(step.queue.length);

    this.renderGraph(step);
    this.renderInDegree(step);
    this.renderQueue(step);
    this.renderResult(step);
    this.renderLogLine(step);
  }

  private renderGraph(step: TSStep): void {
    if (!this.graphEl) return;
    this.graphEl.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 540 280');
    svg.style.width = '100%';
    svg.style.maxWidth = '540px';
    svg.style.height = '280px';

    // Draw edges
    for (const edge of step.edges) {
      const p1 = TS_NODE_POSITIONS[edge.from];
      const p2 = TS_NODE_POSITIONS[edge.to];
      const isRemoved = step.removed.has(edge.from) || step.removed.has(edge.to);
      const isFromCurrent = step.currentNode === edge.from;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('ts-edge');

      // Line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(p1.x));
      line.setAttribute('y1', String(p1.y));
      line.setAttribute('x2', String(p2.x));
      line.setAttribute('y2', String(p2.y));

      if (isFromCurrent) {
        line.setAttribute('stroke', '#f59e0b');
        line.setAttribute('stroke-width', '3');
        line.style.animation = 'pathPulse 1s infinite';
      } else if (isRemoved) {
        line.setAttribute('stroke', 'rgba(100, 116, 139, 0.3)');
        line.setAttribute('stroke-width', '1.5');
      } else {
        line.setAttribute('stroke', 'rgba(245, 158, 11, 0.25)');
        line.setAttribute('stroke-width', '2');
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

      const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const strokeColor = isFromCurrent ? '#f59e0b' : isRemoved ? 'rgba(100, 116, 139, 0.3)' : 'rgba(245, 158, 11, 0.25)';
      arrow.setAttribute('points',
        `${ax},${ay} ${ax - ux * arrowSize + perpX * arrowSize * 0.4},${ay - uy * arrowSize + perpY * arrowSize * 0.4} ${ax - ux * arrowSize - perpX * arrowSize * 0.4},${ay - uy * arrowSize - perpY * arrowSize * 0.4}`
      );
      arrow.setAttribute('fill', strokeColor);
      g?.appendChild(arrow);

      svg?.appendChild(g);
    }

    // Draw nodes
    for (let i = 0; i < step.nodes.length; i++) {
      const pos = TS_NODE_POSITIONS[i];
      const isRemoved = step.removed.has(i);
      const isSorted = step.sorted.includes(i);
      const isCurrent = step.currentNode === i;

      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('ts-node');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(pos.x));
      circle.setAttribute('cy', String(pos.y));
      circle.setAttribute('r', '22');

      if (isCurrent) {
        circle.setAttribute('fill', 'rgba(245, 158, 11, 0.5)');
        circle.setAttribute('stroke', '#f59e0b');
        circle.setAttribute('stroke-width', '3');
        circle.style.animation = 'pulse 1s infinite';
      } else if (isRemoved) {
        circle.setAttribute('fill', 'rgba(100, 116, 139, 0.15)');
        circle.setAttribute('stroke', '#64748b');
        circle.setAttribute('stroke-width', '1.5');
        circle.setAttribute('stroke-dasharray', '4,4');
      } else if (isSorted) {
        circle.setAttribute('fill', 'rgba(34, 197, 94, 0.3)');
        circle.setAttribute('stroke', '#22c55e');
        circle.setAttribute('stroke-width', '2');
      } else {
        circle.setAttribute('fill', 'rgba(245, 158, 11, 0.12)');
        circle.setAttribute('stroke', '#f59e0b');
        circle.setAttribute('stroke-width', '2');
      }
      g?.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(pos.x));
      text.setAttribute('y', String(pos.y + 6));
      text.setAttribute('text-anchor', 'middle');
      const textColor = isCurrent ? '#fff' : isRemoved ? '#64748b' : isSorted ? '#22c55e' : '#f59e0b';
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

  private renderInDegree(step: TSStep): void {
    if (!this.inDegreeEl) return;
    this.inDegreeEl.innerHTML = '';
    step.nodes.forEach((node, i) => {
      const item = document.createElement('div');
      item.className = 'ts-indegree-item';
      const deg = step.inDegree[i];
      if (deg === 0 && !step.removed.has(node)) item.classList.add('zero');
      if (step.prevInDegree[i] !== step.inDegree[i]) item.classList.add('changed');
      item.innerHTML = `<span class="ts-idx">节点${node}</span>${deg}`;
      this.inDegreeEl?.appendChild(item);
    });
  }

  private renderQueue(step: TSStep): void {
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
      item.className = 'ts-queue-item';
      if (i === 0 && step.action !== 'init') item.classList.add('current');
      item.textContent = String(node);
      this.queueEl?.appendChild(item);
    });
  }

  private renderResult(step: TSStep): void {
    if (!this.resultEl) return;
    this.resultEl.innerHTML = '';
    if (step.sorted.length === 0) {
      const empty = document.createElement('span');
      empty.style.color = 'rgba(204, 214, 244, 0.4)';
      empty.style.fontSize = '13px';
      empty.textContent = '（等待排序...）';
      this.resultEl?.appendChild(empty);
      return;
    }
    step.sorted.forEach((node) => {
      const item = document.createElement('div');
      item.className = 'ts-result-item';
      item.textContent = String(node);
      this.resultEl?.appendChild(item);
    });
  }

  private renderLogLine(step: TSStep): void {
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
  id: 'topological-sort',
  name: '拓扑排序',
  viewId: 'algo-topological-sort-view',
  category: 'graph',
  description: 'Kahn 算法：计算入度，反复移除入度为 0 的节点得到 DAG 拓扑序',
  icon: '📐',
  template,
  Visualizer: TopologicalSortVisualizer,
  difficulty: 3,
  levelOrder: 20,
  learningGoal: '理解 Kahn 算法中入度计算和零入度节点队列的处理过程',
});

export {};
