/**
 * 深度优先搜索理论基础可视化器
 * 演示 DFS 遍历过程：递归深入、回溯、访问顺序
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './dfs-theory.html?raw';

interface DFSStep {
  nodes: number[];
  edges: [number, number][];
  adjList: number[][];
  visited: Set<number>;
  currentNode: number | null;
  stack: number[];
  traversalOrder: number[];
  depth: number;
  action: 'init' | 'visit' | 'explore' | 'backtrack' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

const DFS_NODE_POSITIONS = [
  { x: 240, y: 40 },
  { x: 100, y: 130 },
  { x: 380, y: 130 },
  { x: 60, y: 240 },
  { x: 180, y: 240 },
  { x: 340, y: 240 },
];

function buildDFSSteps(): DFSStep[] {
  const steps: DFSStep[] = [];
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
  const stack: number[] = [];
  const traversalOrder: number[] = [];

  steps.push({
    nodes: [...nodes],
    edges: [...edges],
    adjList: adjList.map(r => [...r]),
    visited: new Set(visited),
    currentNode: null,
    stack: [...stack],
    traversalOrder: [...traversalOrder],
    depth: 0,
    action: 'init',
    message: '初始化图：6 个节点、5 条边的无向图。从节点 0 开始 DFS 遍历。',
    log: '初始化图，起点 = 0',
    codeLine: 0,
  });

  const dfs = (u: number, parent: number): void => {
    visited.add(u);
    stack.push(u);
    traversalOrder.push(u);
    steps.push({
      nodes: [...nodes],
      edges: [...edges],
      adjList: adjList.map(r => [...r]),
      visited: new Set(visited),
      currentNode: u,
      stack: [...stack],
      traversalOrder: [...traversalOrder],
      depth: stack.length,
      action: 'visit',
      message: `访问节点 ${u}，标记为已访问，加入递归栈（深度 ${stack.length}）。`,
      log: `DFS(${u}): 访问并标记`,
      codeLine: [1, 2, 3],
    });

    for (const v of adjList[u]) {
      if (v === parent) continue;
      if (!visited.has(v)) {
        steps.push({
          nodes: [...nodes],
          edges: [...edges],
          adjList: adjList.map(r => [...r]),
          visited: new Set(visited),
          currentNode: u,
          stack: [...stack],
          traversalOrder: [...traversalOrder],
          depth: stack.length,
          action: 'explore',
          message: `发现未访问邻居 ${v}，递归深入 DFS(${v})。`,
          log: `DFS(${u}): 探索邻居 ${v}`,
          codeLine: [4, 5],
        });
        dfs(v, u);
      } else {
        steps.push({
          nodes: [...nodes],
          edges: [...edges],
          adjList: adjList.map(r => [...r]),
          visited: new Set(visited),
          currentNode: u,
          stack: [...stack],
          traversalOrder: [...traversalOrder],
          depth: stack.length,
          action: 'explore',
          message: `邻居 ${v} 已访问过，跳过。`,
          log: `DFS(${u}): 跳过已访问的 ${v}`,
          codeLine: [4, 6],
        });
      }
    }

    stack.pop();
    steps.push({
      nodes: [...nodes],
      edges: [...edges],
      adjList: adjList.map(r => [...r]),
      visited: new Set(visited),
      currentNode: stack.length > 0 ? stack[stack.length - 1] : null,
      stack: [...stack],
      traversalOrder: [...traversalOrder],
      depth: stack.length,
      action: 'backtrack',
      message: `节点 ${u} 所有邻居处理完毕，回溯到${stack.length > 0 ? `节点 ${stack[stack.length - 1]}` : '起点（栈空）'}。`,
      log: `DFS(${u}): 回溯`,
      codeLine: 7,
    });
  };

  dfs(0, -1);

  steps.push({
    nodes: [...nodes],
    edges: [...edges],
    adjList: adjList.map(r => [...r]),
    visited: new Set(visited),
    currentNode: null,
    stack: [],
    traversalOrder: [...traversalOrder],
    depth: 0,
    action: 'done',
    message: `DFS 遍历完成！遍历顺序: [${traversalOrder.join(', ')}]。所有 ${visited.size} 个节点均已访问。`,
    log: `DFS 完成，顺序: [${traversalOrder.join(', ')}]`,
    codeLine: 8,
  });

  return steps;
}

export class DFSTheoryVisualizer extends StepVisualizer<DFSStep> {
  protected codeLines = [
    'public void dfs(List<List<Integer>> graph) {',
    '    boolean[] visited = new boolean[graph.size()];',
    '    Deque<Integer> stack = new ArrayDeque<>();',
    '    dfsUtil(0, graph, visited, stack);',
    '}',
    'private void dfsUtil(int u, List<List<Integer>> graph,',
    '        boolean[] visited, Deque<Integer> stack) {',
    '    visited[u] = true;',
    '    stack.push(u);',
    '    for (int v : graph.get(u)) {',
    '        if (!visited[v]) {',
    '            dfsUtil(v, graph, visited, stack);',
    '        }',
    '    }',
    '    stack.pop(); // 回溯',
    '}',
  ];
  protected codePanelTitle = 'DFS 递归代码 (Java)';

  private graphEl: HTMLElement | null = null;
  private stackEl: HTMLElement | null = null;
  private orderEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private currentEl: HTMLElement | null = null;
  private depthEl: HTMLElement | null = null;
  private visitedEl: HTMLElement | null = null;
  private stepNumEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.graphEl = this.root.querySelector('#dfs-graph');
    this.stackEl = this.root.querySelector('#dfs-stack');
    this.orderEl = this.root.querySelector('#dfs-order');
    this.logEl = this.root.querySelector('#dfs-log');
    this.currentEl = this.root.querySelector('#dfs-current');
    this.depthEl = this.root.querySelector('#dfs-depth');
    this.visitedEl = this.root.querySelector('#dfs-visited');
    this.stepNumEl = this.root.querySelector('#dfs-step-num');
    this.btnStart = this.root.querySelector('#dfs-start');
    this.bindPlaybackControls({
      speed: 'dfs-speed',
      speedLabel: 'dfs-speed-label',
      message: 'step-message',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
  }

  protected buildSteps(): DFSStep[] {
    return buildDFSSteps();
  }

  protected renderStep(step: DFSStep): void {
    if (this.currentEl) this.currentEl.textContent = step.currentNode !== null ? String(step.currentNode) : '-';
    if (this.depthEl) this.depthEl.textContent = String(step.depth);
    if (this.visitedEl) this.visitedEl.textContent = String(step.visited.size);
    if (this.stepNumEl) this.stepNumEl.textContent = String(this.currentIndex + 1);

    this.renderGraph(step);
    this.renderStack(step);
    this.renderOrder(step);
    this.renderLogLine(step);
  }

  private renderGraph(step: DFSStep): void {
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
      const p1 = DFS_NODE_POSITIONS[u];
      const p2 = DFS_NODE_POSITIONS[v];
      line.setAttribute('x1', String(p1.x));
      line.setAttribute('y1', String(p1.y));
      line.setAttribute('x2', String(p2.x));
      line.setAttribute('y2', String(p2.y));
      line.setAttribute('stroke', 'rgba(139, 92, 246, 0.3)');
      line.setAttribute('stroke-width', '2');
      line.classList.add('dfs-edge');
      svg?.appendChild(line);
    }

    // Draw nodes
    step.nodes.forEach((node, i) => {
      const pos = DFS_NODE_POSITIONS[i];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('dfs-node');

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
        circle.setAttribute('fill', 'rgba(139, 92, 246, 0.2)');
        circle.setAttribute('stroke', '#8b5cf6');
        circle.setAttribute('stroke-width', '2');
      }
      g?.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(pos.x));
      text.setAttribute('y', String(pos.y + 6));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', step.currentNode === node ? '#000' : step.visited.has(node) ? '#10b981' : '#8b5cf6');
      text.setAttribute('font-size', '16');
      text.setAttribute('font-weight', '700');
      text.setAttribute('font-family', 'ui-monospace, monospace');
      text.textContent = String(node);
      g?.appendChild(text);

      svg?.appendChild(g);
    });

    this.graphEl?.appendChild(svg);
  }

  private renderStack(step: DFSStep): void {
    if (!this.stackEl) return;
    this.stackEl.innerHTML = '';
    step.stack.forEach((node, i) => {
      const item = document.createElement('div');
      item.className = 'dfs-stack-item';
      if (i === step.stack.length - 1) item.classList.add('top');
      item.textContent = String(node);
      this.stackEl?.appendChild(item);
    });
    if (step.stack.length === 0) {
      const empty = document.createElement('span');
      empty.textContent = '(空)';
      empty.style.color = 'rgba(204, 214, 244, 0.4)';
      empty.style.fontSize = '13px';
      this.stackEl?.appendChild(empty);
    }
  }

  private renderOrder(step: DFSStep): void {
    if (!this.orderEl) return;
    this.orderEl.innerHTML = '';
    step.traversalOrder.forEach((node) => {
      const item = document.createElement('div');
      item.className = 'dfs-order-item';
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

  private renderLogLine(step: DFSStep): void {
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
  id: 'dfs-theory',
  name: '深度优先搜索理论基础',
  viewId: 'algo-dfs-theory-view',
  category: 'graph',
  description: 'DFS 递归遍历图，递归栈与回溯过程可视化',
  icon: '🔍',
  template,
  Visualizer: DFSTheoryVisualizer,
  difficulty: 1,
  levelOrder: 2,
  learningGoal: '理解 DFS 的递归深入与回溯机制',
});

export {};
