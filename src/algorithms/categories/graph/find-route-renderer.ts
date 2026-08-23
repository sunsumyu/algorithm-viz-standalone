/**
 * 寻找存在的路线可视化器
 * BFS 判断从 source 到 destination 是否存在路径
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './find-route.html?raw';

interface FRStep {
  nodes: number[];
  edges: [number, number][];
  adjList: number[][];
  visited: Set<number>;
  currentNode: number | null;
  queue: number[];
  source: number;
  dest: number;
  path: number[];
  parentMap: Map<number, number>;
  found: boolean | null;
  action: 'init' | 'explore' | 'found' | 'notfound' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

const FR_NODE_POSITIONS = [
  { x: 80, y: 60 },
  { x: 220, y: 40 },
  { x: 370, y: 60 },
  { x: 140, y: 170 },
  { x: 310, y: 170 },
  { x: 430, y: 170 },
];

function buildFRSteps(): FRStep[] {
  const steps: FRStep[] = [];
  const nodes = [0, 1, 2, 3, 4, 5];
  const edges: [number, number][] = [[0, 1], [1, 2], [0, 3], [3, 4], [2, 5], [4, 5]];
  const adjList: number[][] = [
    [1, 3],     // 0
    [0, 2],     // 1
    [1, 5],     // 2
    [0, 4],     // 3
    [3, 5],     // 4
    [2, 4],     // 5
  ];
  const source = 0;
  const dest = 4;

  const visited = new Set<number>();
  const queue: number[] = [];
  const parentMap = new Map<number, number>();

  const snap = (action: FRStep['action'], current: number | null, msg: string, log: string, code: number | number[], found: boolean | null = null, path: number[] = []) => {
    steps.push({
      nodes: [...nodes],
      edges: [...edges],
      adjList: adjList.map(r => [...r]),
      visited: new Set(visited),
      currentNode: current,
      queue: [...queue],
      source,
      dest,
      path: [...path],
      parentMap: new Map(parentMap),
      found,
      action,
      message: msg,
      log,
      codeLine: code,
    });
  };

  snap('init', null, `图有 ${nodes.length} 个节点和 ${edges.length} 条边。寻找从节点 ${source} 到节点 ${dest} 的路径。`, `初始化: source=${source}, dest=${dest}`, 0);

  // BFS
  visited.add(source);
  queue.push(source);
  snap('explore', source, `从源节点 ${source} 开始 BFS。将其标记为已访问并入队。`, `入队: ${source}`, [1, 2]);

  while (queue.length > 0) {
    const u = queue.shift()!;

    if (u === dest) {
      // Reconstruct path
      const path: number[] = [dest];
      let cur = dest;
      while (parentMap.has(cur)) {
        cur = parentMap.get(cur)!;
        path.unshift(cur);
      }
      snap('found', u, `找到目标节点 ${dest}！路径存在！`, `发现目标: ${dest}`, [3, 4], true, path);
      break;
    }

    for (const v of adjList[u]) {
      if (!visited.has(v)) {
        visited.add(v);
        queue.push(v);
        parentMap.set(v, u);
        snap('explore', u, `从节点 ${u} 发现未访问邻居 ${v}，标记已访问并入队。`, `探索 ${u}→${v}，入队`, [5, 6, 7]);
      }
    }
  }

  if (steps[steps.length - 1].action !== 'found') {
    snap('notfound', null, `BFS 遍历完成，未能到达节点 ${dest}。路径不存在！`, 'BFS 完成: 无路径', 8, false);
  } else {
    const finalPath = steps[steps.length - 1].path;
    snap('done', null, `BFS 搜索完成！从 ${source} 到 ${dest} 存在路径：${finalPath.join(' → ')}。路径长度为 ${finalPath.length - 1}。`, `完成: 路径=${finalPath.join('→')}`, 9, true, finalPath);
  }

  return steps;
}

export class FindRouteVisualizer extends StepVisualizer<FRStep> {
  protected codeLines = [
    'boolean hasPath(List<List<Integer>> graph, int src, int dest) {',
    '    boolean[] visited = new boolean[graph.size()];',
    '    Queue<Integer> queue = new LinkedList<>();',
    '    queue.add(src);',
    '    while (!queue.isEmpty()) {',
    '        int u = queue.poll();',
    '        for (int v : graph.get(u)) {',
    '            if (!visited[v]) {',
    '                visited[v] = true;',
    '                queue.add(v);',
    '            }',
    '        }',
    '    }',
    '}',
  ];
  protected codePanelTitle = '寻找路线代码 (Java)';

  private graphEl: HTMLElement | null = null;
  private queueEl: HTMLElement | null = null;
  private pathEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private currentEl: HTMLElement | null = null;
  private visitedEl: HTMLElement | null = null;
  private resultEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.graphEl = this.root.querySelector('#fr-graph');
    this.queueEl = this.root.querySelector('#fr-queue');
    this.pathEl = this.root.querySelector('#fr-path');
    this.logEl = this.root.querySelector('#fr-log');
    this.currentEl = this.root.querySelector('#fr-current');
    this.visitedEl = this.root.querySelector('#fr-visited');
    this.resultEl = this.root.querySelector('#fr-result');
    this.btnStart = this.root.querySelector('#fr-start');
    this.bindPlaybackControls({
      speed: 'fr-speed',
      speedLabel: 'fr-speed-label',
      message: 'step-message',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
  }

  protected buildSteps(): FRStep[] {
    return buildFRSteps();
  }

  protected renderStep(step: FRStep): void {
    if (this.currentEl) this.currentEl.textContent = step.currentNode !== null ? String(step.currentNode) : '-';
    if (this.visitedEl) this.visitedEl.textContent = String(step.visited.size);
    if (this.resultEl) {
      if (step.found === true) {
        this.resultEl.textContent = '存在';
        (this.resultEl as HTMLElement).style.color = '#10b981';
      } else if (step.found === false) {
        this.resultEl.textContent = '不存在';
        (this.resultEl as HTMLElement).style.color = '#ef4444';
      } else {
        this.resultEl.textContent = '-';
        (this.resultEl as HTMLElement).style.color = '#818cf8';
      }
    }

    this.renderGraph(step);
    this.renderQueue(step);
    this.renderPath(step);
    this.renderLogLine(step);
  }

  private renderGraph(step: FRStep): void {
    if (!this.graphEl) return;
    this.graphEl.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 500 240');
    svg.style.width = '100%';
    svg.style.maxWidth = '480px';
    svg.style.height = '240px';

    // Draw path edges first (if found)
    if (step.found && step.path.length > 1) {
      for (let i = 0; i < step.path.length - 1; i++) {
        const u = step.path[i];
        const v = step.path[i + 1];
        const p1 = FR_NODE_POSITIONS[u];
        const p2 = FR_NODE_POSITIONS[v];
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(p1.x));
        line.setAttribute('y1', String(p1.y));
        line.setAttribute('x2', String(p2.x));
        line.setAttribute('y2', String(p2.y));
        line.setAttribute('stroke', '#10b981');
        line.setAttribute('stroke-width', '4');
        line.style.animation = 'pathPulse 1.5s infinite';
        svg?.appendChild(line);
      }
    }

    // Draw all edges
    for (const [u, v] of step.edges) {
      const p1 = FR_NODE_POSITIONS[u];
      const p2 = FR_NODE_POSITIONS[v];
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(p1.x));
      line.setAttribute('y1', String(p1.y));
      line.setAttribute('x2', String(p2.x));
      line.setAttribute('y2', String(p2.y));

      const isPathEdge = step.found && step.path.length > 1 && step.path.includes(u) && step.path.includes(v);
      if (!isPathEdge) {
        line.setAttribute('stroke', 'rgba(129, 140, 248, 0.3)');
        line.setAttribute('stroke-width', '2');
      }
      line.classList.add('fr-edge');
      svg?.appendChild(line);
    }

    // Draw nodes
    step.nodes.forEach((node, i) => {
      const pos = FR_NODE_POSITIONS[i];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('fr-node');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(pos.x));
      circle.setAttribute('cy', String(pos.y));
      circle.setAttribute('r', '22');

      if (step.currentNode === node) {
        circle.setAttribute('fill', '#f59e0b');
        circle.setAttribute('stroke', '#f59e0b');
        circle.setAttribute('stroke-width', '3');
        circle.style.animation = 'pulse 0.8s infinite';
      } else if (node === step.source || node === step.dest) {
        circle.setAttribute('fill', 'rgba(239, 68, 68, 0.3)');
        circle.setAttribute('stroke', '#ef4444');
        circle.setAttribute('stroke-width', '3');
      } else if (step.visited.has(node)) {
        circle.setAttribute('fill', 'rgba(16, 185, 129, 0.3)');
        circle.setAttribute('stroke', '#10b981');
        circle.setAttribute('stroke-width', '2');
      } else {
        circle.setAttribute('fill', 'rgba(129, 140, 248, 0.2)');
        circle.setAttribute('stroke', '#818cf8');
        circle.setAttribute('stroke-width', '2');
      }
      g?.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(pos.x));
      text.setAttribute('y', String(pos.y + 6));
      text.setAttribute('text-anchor', 'middle');
      const isSpecial = step.currentNode === node || node === step.source || node === step.dest;
      text.setAttribute('fill', isSpecial ? (step.currentNode === node ? '#000' : '#fff') : step.visited.has(node) ? '#10b981' : '#818cf8');
      text.setAttribute('font-size', '15');
      text.setAttribute('font-weight', '700');
      text.setAttribute('font-family', 'ui-monospace, monospace');
      text.textContent = String(node);
      g?.appendChild(text);

      // Label source/dest
      if (node === step.source || node === step.dest) {
        const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        label.setAttribute('x', String(pos.x));
        label.setAttribute('y', String(pos.y - 30));
        label.setAttribute('text-anchor', 'middle');
        label.setAttribute('fill', '#ef4444');
        label.setAttribute('font-size', '11');
        label.setAttribute('font-weight', '600');
        label.textContent = node === step.source ? 'SRC' : 'DST';
        g?.appendChild(label);
      }

      svg?.appendChild(g);
    });

    this.graphEl?.appendChild(svg);
  }

  private renderQueue(step: FRStep): void {
    if (!this.queueEl) return;
    this.queueEl.innerHTML = '';
    step.queue.forEach((node, i) => {
      const item = document.createElement('div');
      item.className = 'fr-queue-item';
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

  private renderPath(step: FRStep): void {
    if (!this.pathEl) return;
    this.pathEl.innerHTML = '';
    if (step.path.length === 0) {
      const empty = document.createElement('span');
      empty.textContent = step.found === false ? '无路径' : '(搜索中...)';
      empty.style.color = 'rgba(204, 214, 244, 0.4)';
      empty.style.fontSize = '13px';
      this.pathEl?.appendChild(empty);
      return;
    }
    step.path.forEach((node, i) => {
      if (i > 0) {
        const arrow = document.createElement('span');
        arrow.className = 'fr-path-arrow';
        arrow.textContent = '→';
        this.pathEl?.appendChild(arrow);
      }
      const item = document.createElement('div');
      item.className = 'fr-path-item';
      if (i === step.path.length - 1 && step.found) item.classList.add('dest');
      item.textContent = String(node);
      this.pathEl?.appendChild(item);
    });
  }

  private renderLogLine(step: FRStep): void {
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
  id: 'find-route',
  name: '寻找存在的路线',
  viewId: 'algo-find-route-view',
  category: 'graph',
  description: 'BFS 判断图中两节点间是否存在路径',
  icon: '🛤️',
  template,
  Visualizer: FindRouteVisualizer,
  difficulty: 2,
  levelOrder: 15,
  learningGoal: '理解使用 BFS/DFS 判断图的连通性',
});

export {};
