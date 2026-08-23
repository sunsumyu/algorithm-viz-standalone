/**
 * 广度优先搜索理论基础可视化器
 * 演示 BFS 层序遍历过程：队列驱动、逐层扩展
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './bfs-theory.html?raw';

interface BFSStep {
  nodes: number[];
  edges: [number, number][];
  adjList: number[][];
  visited: Set<number>;
  currentNode: number | null;
  queue: number[];
  traversalOrder: number[];
  levelMarkers: number[];  // indices in traversalOrder where new levels start
  level: number;
  action: 'init' | 'enqueue' | 'dequeue' | 'explore' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

const BFS_NODE_POSITIONS = [
  { x: 240, y: 40 },
  { x: 100, y: 130 },
  { x: 380, y: 130 },
  { x: 60, y: 240 },
  { x: 180, y: 240 },
  { x: 340, y: 240 },
];

function buildBFSSteps(): BFSStep[] {
  const steps: BFSStep[] = [];
  const nodes = [0, 1, 2, 3, 4, 5];
  const edges: [number, number][] = [[0, 1], [0, 2], [1, 3], [1, 4], [2, 5]];
  const adjList: number[][] = [
    [1, 2],     // 0 -> 1, 2
    [0, 3, 4],  // 1 -> 0, 3, 4
    [0, 5],     // 2 -> 0, 5
    [1],        // 3 -> 1
    [1],        // 4 -> 1
    [2],        // 5 -> 2
  ];

  const visited = new Set<number>();
  const queue: number[] = [];
  const traversalOrder: number[] = [];
  const levelMarkers: number[] = [];

  steps.push({
    nodes: [...nodes],
    edges: [...edges],
    adjList: adjList.map(r => [...r]),
    visited: new Set(visited),
    currentNode: null,
    queue: [...queue],
    traversalOrder: [...traversalOrder],
    levelMarkers: [...levelMarkers],
    level: 0,
    action: 'init',
    message: '初始化图：6 个节点、5 条边的无向图。从节点 0 开始 BFS 层序遍历。',
    log: '初始化图，起点 = 0',
    codeLine: 0,
  });

  // Enqueue start node
  visited.add(0);
  queue.push(0);
  levelMarkers.push(0);
  steps.push({
    nodes: [...nodes],
    edges: [...edges],
    adjList: adjList.map(r => [...r]),
    visited: new Set(visited),
    currentNode: 0,
    queue: [...queue],
    traversalOrder: [...traversalOrder],
    levelMarkers: [...levelMarkers],
    level: 0,
    action: 'enqueue',
    message: '将起点 0 标记为已访问并入队。队列: [0]',
    log: '入队: 0',
    codeLine: [1, 2],
  });

  let currentLevel = 0;
  let levelSize = 1; // nodes at current level

  while (queue.length > 0) {
    const u = queue.shift()!;
    traversalOrder.push(u);

    steps.push({
      nodes: [...nodes],
      edges: [...edges],
      adjList: adjList.map(r => [...r]),
      visited: new Set(visited),
      currentNode: u,
      queue: [...queue],
      traversalOrder: [...traversalOrder],
      levelMarkers: [...levelMarkers],
      level: currentLevel,
      action: 'dequeue',
      message: `出队节点 ${u}（第 ${currentLevel} 层），准备探索其所有未访问邻居。`,
      log: `出队: ${u} (第 ${currentLevel} 层)`,
      codeLine: [3, 4],
    });

    levelSize--;

    for (const v of adjList[u]) {
      if (!visited.has(v)) {
        visited.add(v);
        queue.push(v);
        steps.push({
          nodes: [...nodes],
          edges: [...edges],
          adjList: adjList.map(r => [...r]),
          visited: new Set(visited),
          currentNode: u,
          queue: [...queue],
          traversalOrder: [...traversalOrder],
          levelMarkers: [...levelMarkers],
          level: currentLevel,
          action: 'explore',
          message: `发现未访问邻居 ${v}，标记已访问并入队。队列: [${queue.join(', ')}]`,
          log: `探索邻居 ${v}，入队`,
          codeLine: [5, 6, 7],
        });
      } else {
        steps.push({
          nodes: [...nodes],
          edges: [...edges],
          adjList: adjList.map(r => [...r]),
          visited: new Set(visited),
          currentNode: u,
          queue: [...queue],
          traversalOrder: [...traversalOrder],
          levelMarkers: [...levelMarkers],
          level: currentLevel,
          action: 'explore',
          message: `邻居 ${v} 已访问过，跳过。`,
          log: `跳过已访问的 ${v}`,
          codeLine: [5, 8],
        });
      }
    }

    if (levelSize === 0 && queue.length > 0) {
      currentLevel++;
      levelSize = queue.length;
      levelMarkers.push(traversalOrder.length);
      steps.push({
        nodes: [...nodes],
        edges: [...edges],
        adjList: adjList.map(r => [...r]),
        visited: new Set(visited),
        currentNode: queue[0],
        queue: [...queue],
        traversalOrder: [...traversalOrder],
        levelMarkers: [...levelMarkers],
        level: currentLevel,
        action: 'enqueue',
        message: `第 ${currentLevel - 1} 层处理完毕，进入第 ${currentLevel} 层。队列中还有 ${queue.length} 个节点。`,
        log: `进入第 ${currentLevel} 层`,
        codeLine: 9,
      });
    }
  }

  steps.push({
    nodes: [...nodes],
    edges: [...edges],
    adjList: adjList.map(r => [...r]),
    visited: new Set(visited),
    currentNode: null,
    queue: [],
    traversalOrder: [...traversalOrder],
    levelMarkers: [...levelMarkers],
    level: currentLevel,
    action: 'done',
    message: `BFS 遍历完成！遍历顺序: [${traversalOrder.join(', ')}]。共 ${currentLevel + 1} 层，所有 ${visited.size} 个节点均已访问。BFS 保证层序遍历，可求无权图最短路径。`,
    log: `BFS 完成，顺序: [${traversalOrder.join(', ')}]`,
    codeLine: 10,
  });

  return steps;
}

export class BFSTheoryVisualizer extends StepVisualizer<BFSStep> {
  protected codeLines = [
    'public void bfs(List<List<Integer>> graph, int start) {',
    '    boolean[] visited = new boolean[graph.size()];',
    '    Queue<Integer> queue = new LinkedList<>();',
    '    visited[start] = true;',
    '    queue.offer(start);',
    '    while (!queue.isEmpty()) {',
    '        int u = queue.poll();',
    '        for (int v : graph.get(u)) {',
    '            if (!visited[v]) {',
    '                visited[v] = true;',
    '                queue.offer(v);',
    '            }',
    '        }',
    '    }',
    '}',
  ];
  protected codePanelTitle = 'BFS 队列代码 (Java)';

  private graphEl: HTMLElement | null = null;
  private queueEl: HTMLElement | null = null;
  private orderEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private currentEl: HTMLElement | null = null;
  private levelEl: HTMLElement | null = null;
  private visitedEl: HTMLElement | null = null;
  private qsizeEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.graphEl = this.root.querySelector('#bfs-graph');
    this.queueEl = this.root.querySelector('#bfs-queue');
    this.orderEl = this.root.querySelector('#bfs-order');
    this.logEl = this.root.querySelector('#bfs-log');
    this.currentEl = this.root.querySelector('#bfs-current');
    this.levelEl = this.root.querySelector('#bfs-level');
    this.visitedEl = this.root.querySelector('#bfs-visited');
    this.qsizeEl = this.root.querySelector('#bfs-qsize');
    this.btnStart = this.root.querySelector('#bfs-start');
    this.bindPlaybackControls({
      speed: 'bfs-speed',
      speedLabel: 'bfs-speed-label',
      message: 'step-message',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
  }

  protected buildSteps(): BFSStep[] {
    return buildBFSSteps();
  }

  protected renderStep(step: BFSStep): void {
    if (this.currentEl) this.currentEl.textContent = step.currentNode !== null ? String(step.currentNode) : '-';
    if (this.levelEl) this.levelEl.textContent = String(step.level);
    if (this.visitedEl) this.visitedEl.textContent = String(step.visited.size);
    if (this.qsizeEl) this.qsizeEl.textContent = String(step.queue.length);

    this.renderGraph(step);
    this.renderQueue(step);
    this.renderOrder(step);
    this.renderLogLine(step);
  }

  private renderGraph(step: BFSStep): void {
    if (!this.graphEl) return;
    this.graphEl.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 480 280');
    svg.style.width = '100%';
    svg.style.maxWidth = '480px';
    svg.style.height = '240px';

    // Draw edges
    for (const [u, v] of step.edges) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      const p1 = BFS_NODE_POSITIONS[u];
      const p2 = BFS_NODE_POSITIONS[v];
      line.setAttribute('x1', String(p1.x));
      line.setAttribute('y1', String(p1.y));
      line.setAttribute('x2', String(p2.x));
      line.setAttribute('y2', String(p2.y));
      line.setAttribute('stroke', 'rgba(6, 182, 212, 0.3)');
      line.setAttribute('stroke-width', '2');
      line.classList.add('bfs-edge');
      svg?.appendChild(line);
    }

    // Draw nodes
    step.nodes.forEach((node, i) => {
      const pos = BFS_NODE_POSITIONS[i];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('bfs-node');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(pos.x));
      circle.setAttribute('cy', String(pos.y));
      circle.setAttribute('r', '24');

      if (step.currentNode === node) {
        circle.setAttribute('fill', '#f59e0b');
        circle.setAttribute('stroke', '#f59e0b');
        circle.setAttribute('stroke-width', '3');
        circle.style.animation = 'pulse 0.8s infinite';
      } else if (step.visited.has(node)) {
        circle.setAttribute('fill', 'rgba(16, 185, 129, 0.3)');
        circle.setAttribute('stroke', '#10b981');
        circle.setAttribute('stroke-width', '2');
      } else {
        circle.setAttribute('fill', 'rgba(6, 182, 212, 0.2)');
        circle.setAttribute('stroke', '#06b6d4');
        circle.setAttribute('stroke-width', '2');
      }
      g?.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(pos.x));
      text.setAttribute('y', String(pos.y + 6));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', step.currentNode === node ? '#000' : step.visited.has(node) ? '#10b981' : '#06b6d4');
      text.setAttribute('font-size', '16');
      text.setAttribute('font-weight', '700');
      text.setAttribute('font-family', 'ui-monospace, monospace');
      text.textContent = String(node);
      g?.appendChild(text);

      svg?.appendChild(g);
    });

    this.graphEl?.appendChild(svg);
  }

  private renderQueue(step: BFSStep): void {
    if (!this.queueEl) return;
    this.queueEl.innerHTML = '';
    step.queue.forEach((node, i) => {
      const item = document.createElement('div');
      item.className = 'bfs-queue-item';
      if (i === 0) item.classList.add('front');
      item.textContent = String(node);
      this.queueEl?.appendChild(item);
    });
    if (step.queue.length === 0) {
      const empty = document.createElement('span');
      empty.textContent = '(空)';
      empty.style.color = 'rgba(204, 214, 244, 0.4)';
      empty.style.fontSize = '13px';
      this.queueEl?.appendChild(empty);
    }
  }

  private renderOrder(step: BFSStep): void {
    if (!this.orderEl) return;
    this.orderEl.innerHTML = '';

    const levelSet = new Set(step.levelMarkers);
    step.traversalOrder.forEach((node, i) => {
      if (levelSet.has(i) && i > 0) {
        const sep = document.createElement('div');
        sep.className = 'bfs-order-item level-sep';
        sep.textContent = '|';
        this.orderEl?.appendChild(sep);
      }
      const item = document.createElement('div');
      item.className = 'bfs-order-item';
      item.textContent = String(node);
      this.orderEl?.appendChild(item);
    });

    if (step.traversalOrder.length === 0) {
      const empty = document.createElement('span');
      empty.textContent = '(无)';
      empty.style.color = 'rgba(204, 214, 244, 0.4)';
      empty.style.fontSize = '13px';
      this.orderEl?.appendChild(empty);
    }
  }

  private renderLogLine(step: BFSStep): void {
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
  id: 'bfs-theory',
  name: '广度优先搜索理论基础',
  viewId: 'algo-bfs-theory-view',
  category: 'graph',
  description: 'BFS 层序遍历图，队列驱动与逐层扩展可视化',
  icon: '🌊',
  template,
  Visualizer: BFSTheoryVisualizer,
  difficulty: 1,
  levelOrder: 4,
  learningGoal: '理解 BFS 的队列机制和层序遍历特性',
});

export {};
