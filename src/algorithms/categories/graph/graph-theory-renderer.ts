/**
 * 图论理论基础可视化器
 * 演示图的表示方法：邻接矩阵 vs 邻接表，支持添加/删除边
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './graph-theory.html?raw';

interface GTStep {
  nodes: number[];
  edges: [number, number][];
  adjMatrix: number[][];
  adjList: number[][];
  view: 'graph' | 'matrix' | 'list';
  highlightEdge: [number, number] | null;
  highlightAction: 'add' | 'remove' | null;
  vCount: number;
  eCount: number;
  graphType: string;
  message: string;
  log: string;
  codeLine: number | number[];
}

const NODE_POSITIONS = [
  { x: 250, y: 50 },
  { x: 420, y: 130 },
  { x: 370, y: 280 },
  { x: 130, y: 280 },
  { x: 80, y: 130 },
];

function buildAdjMatrix(nodes: number[], edges: [number, number][]): number[][] {
  const n = nodes.length;
  const mat = Array.from({ length: n }, () => Array(n).fill(0));
  for (const [u, v] of edges) {
    mat[u][v] = 1;
    mat[v][u] = 1;
  }
  return mat;
}

function buildAdjList(nodes: number[], edges: [number, number][]): number[][] {
  const list = nodes.map(() => [] as number[]);
  for (const [u, v] of edges) {
    list[u].push(v);
    list[v].push(u);
  }
  return list;
}

function buildInitialSteps(): GTStep[] {
  const steps: GTStep[] = [];
  const nodes = [0, 1, 2, 3, 4];
  const edges: [number, number][] = [[0, 1], [0, 4], [1, 2], [1, 3], [2, 3], [3, 4]];
  const adjMatrix = buildAdjMatrix(nodes, edges);
  const adjList = buildAdjList(nodes, edges);

  steps.push({
    nodes: [...nodes],
    edges: [...edges],
    adjMatrix: adjMatrix.map(r => [...r]),
    adjList: adjList.map(r => [...r]),
    view: 'graph',
    highlightEdge: null,
    highlightAction: null,
    vCount: nodes.length,
    eCount: edges.length,
    graphType: '无向无权',
    message: '这是一个包含 5 个节点、6 条边的无向无权图。可以通过按钮切换邻接矩阵或邻接表视图。',
    log: '初始化图: V=5, E=6',
    codeLine: 0,
  });

  steps.push({
    nodes: [...nodes],
    edges: [...edges],
    adjMatrix: adjMatrix.map(r => [...r]),
    adjList: adjList.map(r => [...r]),
    view: 'matrix',
    highlightEdge: null,
    highlightAction: null,
    vCount: nodes.length,
    eCount: edges.length,
    graphType: '无向无权',
    message: '邻接矩阵表示：matrix[i][j]=1 表示节点 i 和 j 之间有边。空间复杂度 O(V²)，适合稠密图。',
    log: '切换到邻接矩阵视图',
    codeLine: [1, 2],
  });

  steps.push({
    nodes: [...nodes],
    edges: [...edges],
    adjMatrix: adjMatrix.map(r => [...r]),
    adjList: adjList.map(r => [...r]),
    view: 'list',
    highlightEdge: null,
    highlightAction: null,
    vCount: nodes.length,
    eCount: edges.length,
    graphType: '无向无权',
    message: '邻接表表示：每个节点维护一个邻居列表。空间复杂度 O(V+E)，适合稀疏图。',
    log: '切换到邻接表视图',
    codeLine: [3, 4],
  });

  // Add edge 2->4
  const edges2: [number, number][] = [...edges, [2, 4]];
  const adjMatrix2 = buildAdjMatrix(nodes, edges2);
  const adjList2 = buildAdjList(nodes, edges2);
  steps.push({
    nodes: [...nodes],
    edges: edges2.map(e => [...e] as [number, number]),
    adjMatrix: adjMatrix2.map(r => [...r]),
    adjList: adjList2.map(r => [...r]),
    view: 'graph',
    highlightEdge: [2, 4],
    highlightAction: 'add',
    vCount: nodes.length,
    eCount: edges2.length,
    graphType: '无向无权',
    message: '添加边 (2, 4)：在邻接矩阵中设置 matrix[2][4]=matrix[4][2]=1；在邻接表中将 4 加入 2 的列表、2 加入 4 的列表。',
    log: '添加边 (2, 4), E=7',
    codeLine: [5, 6],
  });

  // Remove edge 1->3
  const edges3 = edges2.filter(([u, v]) => !(u === 1 && v === 3));
  const adjMatrix3 = buildAdjMatrix(nodes, edges3);
  const adjList3 = buildAdjList(nodes, edges3);
  steps.push({
    nodes: [...nodes],
    edges: edges3.map(e => [...e] as [number, number]),
    adjMatrix: adjMatrix3.map(r => [...r]),
    adjList: adjList3.map(r => [...r]),
    view: 'graph',
    highlightEdge: [1, 3],
    highlightAction: 'remove',
    vCount: nodes.length,
    eCount: edges3.length,
    graphType: '无向无权',
    message: '删除边 (1, 3)：在邻接矩阵中设置 matrix[1][3]=matrix[3][1]=0；在邻接表中移除对应项。',
    log: '删除边 (1, 3), E=6',
    codeLine: [7, 8],
  });

  steps.push({
    nodes: [...nodes],
    edges: edges3.map(e => [...e] as [number, number]),
    adjMatrix: adjMatrix3.map(r => [...r]),
    adjList: adjList3.map(r => [...r]),
    view: 'graph',
    highlightEdge: null,
    highlightAction: null,
    vCount: nodes.length,
    eCount: edges3.length,
    graphType: '无向无权',
    message: '图的基本操作总结：添加边 O(1)（矩阵）/ O(E)（表），删除边 O(1)（矩阵）/ O(E)（表），查询邻接 O(1)（矩阵）/ O(degree)（表）。',
    log: '演示完成',
    codeLine: 9,
  });

  return steps;
}

export class GraphTheoryVisualizer extends StepVisualizer<GTStep> {
  protected codeLines = [
    '// 图结构: V=节点, E=边',
    '// 邻接矩阵: int[][] matrix = new int[V][V]',
    '// 空间 O(V\u00b2), 查询 O(1)',
    '// 邻接表: List<List<Integer>> adj',
    '// 空间 O(V+E), 查询 O(degree)',
    '// 添加边 (u, v):',
    'matrix[u][v] = matrix[v][u] = 1;',
    'adj.get(u).add(v); adj.get(v).add(u);',
    '// 删除边 (u, v):',
    'matrix[u][v] = matrix[v][u] = 0;',
    'adj.get(u).remove(Integer.valueOf(v));',
    '// 总结: 稠密图用矩阵, 稀疏图用邻接表',
  ];
  protected codePanelTitle = '图论基础代码 (Java)';

  private graphViewEl: HTMLElement | null = null;
  private matrixViewEl: HTMLElement | null = null;
  private listViewEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private vCountEl: HTMLElement | null = null;
  private eCountEl: HTMLElement | null = null;
  private typeEl: HTMLElement | null = null;
  private btnMatrix: HTMLButtonElement | null = null;
  private btnList: HTMLButtonElement | null = null;
  private btnAddEdge: HTMLButtonElement | null = null;
  private btnRemoveEdge: HTMLButtonElement | null = null;
  private currentView: 'graph' | 'matrix' | 'list' = 'graph';
  private customSteps: GTStep[] | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.graphViewEl = this.root.querySelector('#gt-graph-view');
    this.matrixViewEl = this.root.querySelector('#gt-matrix-view');
    this.listViewEl = this.root.querySelector('#gt-list-view');
    this.logEl = this.root.querySelector('#gt-log');
    this.vCountEl = this.root.querySelector('#gt-v-count');
    this.eCountEl = this.root.querySelector('#gt-e-count');
    this.typeEl = this.root.querySelector('#gt-type');
    this.btnMatrix = this.root.querySelector('#gt-view-matrix');
    this.btnList = this.root.querySelector('#gt-view-list');
    this.btnAddEdge = this.root.querySelector('#gt-add-edge');
    this.btnRemoveEdge = this.root.querySelector('#gt-remove-edge');
    this.bindPlaybackControls({
      speed: 'gt-speed',
      speedLabel: 'gt-speed-label',
      message: 'step-message',
    });
    if (this.btnMatrix) this.btnMatrix.onclick = () => { this.currentView = 'matrix'; this.customSteps = null; this.start(); };
    if (this.btnList) this.btnList.onclick = () => { this.currentView = 'list'; this.customSteps = null; this.start(); };
    if (this.btnAddEdge) this.btnAddEdge.onclick = () => this.addEdgeInteractively();
    if (this.btnRemoveEdge) this.btnRemoveEdge.onclick = () => this.removeEdgeInteractively();
  }

  private addEdgeInteractively(): void {
    const lastStep = this.customSteps
      ? this.customSteps[this.customSteps.length - 1]
      : buildInitialSteps()[0];
    const edges = lastStep.edges;
    const n = lastStep.nodes.length;
    // Find a non-existing edge to add
    const existing = new Set(edges.map(([u, v]) => `${Math.min(u, v)},${Math.max(u, v)}`));
    let found = false;
    for (let i = 0; i < n && !found; i++) {
      for (let j = i + 1; n > j && !found; j++) {
        if (!existing.has(`${i},${j}`)) {
          const newEdges: [number, number][] = [...edges, [i, j]];
          this.pushCustomStep(lastStep, newEdges, [i, j], 'add', `添加边 (${i}, ${j})`);
          found = true;
        }
      }
    }
  }

  private removeEdgeInteractively(): void {
    const lastStep = this.customSteps
      ? this.customSteps[this.customSteps.length - 1]
      : buildInitialSteps()[0];
    const edges = lastStep.edges;
    if (edges.length === 0) return;
    const removed = edges[edges.length - 1];
    const newEdges = edges.filter(([u, v], idx) => idx !== edges.length - 1);
    this.pushCustomStep(lastStep, newEdges, removed, 'remove', `删除边 (${removed[0]}, ${removed[1]})`);
  }

  private pushCustomStep(prev: GTStep, newEdges: [number, number][], hlEdge: [number, number], action: 'add' | 'remove', logMsg: string): void {
    const adjMatrix = buildAdjMatrix(prev.nodes, newEdges);
    const adjList = buildAdjList(prev.nodes, newEdges);
    const step: GTStep = {
      nodes: [...prev.nodes],
      edges: newEdges.map(e => [...e] as [number, number]),
      adjMatrix: adjMatrix.map(r => [...r]),
      adjList: adjList.map(r => [...r]),
      view: this.currentView,
      highlightEdge: hlEdge,
      highlightAction: action,
      vCount: prev.nodes.length,
      eCount: newEdges.length,
      graphType: '无向无权',
      message: `${logMsg}：当前图有 ${prev.nodes.length} 个节点、${newEdges.length} 条边。`,
      log: logMsg,
      codeLine: action === 'add' ? [5, 6] : [7, 8],
    };
    if (!this.customSteps) {
      this.customSteps = buildInitialSteps();
    }
    this.customSteps.push(step);
    this.steps = this.customSteps;
    this.currentIndex = this.steps.length - 1;
    this.render();
    this.updateButtons();
  }

  protected buildSteps(): GTStep[] {
    if (this.customSteps) return this.customSteps;
    const steps = buildInitialSteps();
    // Apply current view
    const viewIdx = this.currentView === 'matrix' ? 1 : this.currentView === 'list' ? 2 : 0;
    if (viewIdx > 0 && steps.length > viewIdx) {
      this.currentIndex = viewIdx;
    }
    return steps;
  }

  protected renderStep(step: GTStep): void {
    if (this.vCountEl) this.vCountEl.textContent = String(step.vCount);
    if (this.eCountEl) this.eCountEl.textContent = String(step.eCount);
    if (this.typeEl) this.typeEl.textContent = step.graphType;

    // Toggle views
    const view = step.view;
    if (this.graphViewEl) this.graphViewEl.style.display = view === 'graph' ? '' : 'none';
    if (this.matrixViewEl) this.matrixViewEl.style.display = view === 'matrix' ? '' : 'none';
    if (this.listViewEl) this.listViewEl.style.display = view === 'list' ? '' : 'none';

    // Update toggle buttons
    if (this.btnMatrix) {
      this.btnMatrix.classList.toggle('active', view === 'matrix');
    }
    if (this.btnList) {
      this.btnList.classList.toggle('active', view === 'list');
    }

    if (view === 'graph') this.renderGraph(step);
    else if (view === 'matrix') this.renderMatrix(step);
    else this.renderList(step);

    this.renderLogLine(step);
  }

  private renderGraph(step: GTStep): void {
    if (!this.graphViewEl) return;
    this.graphViewEl.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 500 320');
    svg.style.width = '100%';
    svg.style.maxWidth = '500px';
    svg.style.height = '260px';

    // Draw edges
    for (const [u, v] of step.edges) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      const p1 = NODE_POSITIONS[u];
      const p2 = NODE_POSITIONS[v];
      line.setAttribute('x1', String(p1.x));
      line.setAttribute('y1', String(p1.y));
      line.setAttribute('x2', String(p2.x));
      line.setAttribute('y2', String(p2.y));
      const isHl = step.highlightEdge && (
        (step.highlightEdge[0] === u && step.highlightEdge[1] === v) ||
        (step.highlightEdge[0] === v && step.highlightEdge[1] === u)
      );
      line.setAttribute('stroke', isHl
        ? (step.highlightAction === 'add' ? '#10b981' : '#ef4444')
        : 'rgba(16, 185, 129, 0.4)');
      line.setAttribute('stroke-width', isHl ? '3' : '2');
      line.classList.add('gt-edge');
      if (isHl) line.style.animation = 'pulse 0.8s infinite';
      svg?.appendChild(line);
    }

    // Draw nodes
    step.nodes.forEach((node, i) => {
      const pos = NODE_POSITIONS[i];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('gt-node');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(pos.x));
      circle.setAttribute('cy', String(pos.y));
      circle.setAttribute('r', '22');
      circle.setAttribute('fill', 'rgba(16, 185, 129, 0.2)');
      circle.setAttribute('stroke', '#10b981');
      circle.setAttribute('stroke-width', '2');
      g?.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(pos.x));
      text.setAttribute('y', String(pos.y + 5));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#10b981');
      text.setAttribute('font-size', '16');
      text.setAttribute('font-weight', '700');
      text.setAttribute('font-family', 'ui-monospace, monospace');
      text.textContent = String(node);
      g?.appendChild(text);

      svg?.appendChild(g);
    });

    this.graphViewEl?.appendChild(svg);
  }

  private renderMatrix(step: GTStep): void {
    if (!this.matrixViewEl) return;
    this.matrixViewEl.innerHTML = '';
    const n = step.nodes.length;
    const mat = step.adjMatrix;
    const div = document.createElement('div');
    div.className = 'gt-matrix';
    div.style.gridTemplateColumns = `repeat(${n + 1}, 38px)`;

    // Header row
    const corner = document.createElement('div');
    corner.className = 'gt-matrix-cell header';
    corner.textContent = '';
    div?.appendChild(corner);
    for (let j = 0; j < n; j++) {
      const h = document.createElement('div');
      h.className = 'gt-matrix-cell header';
      h.textContent = String(j);
      div?.appendChild(h);
    }

    // Data rows
    for (let i = 0; i < n; i++) {
      const rowH = document.createElement('div');
      rowH.className = 'gt-matrix-cell header';
      rowH.textContent = String(i);
      div?.appendChild(rowH);
      for (let j = 0; j < n; j++) {
        const cell = document.createElement('div');
        const val = mat[i][j];
        cell.className = `gt-matrix-cell ${val === 1 ? 'one' : 'zero'}`;
        cell.textContent = String(val);
        const isHl = step.highlightEdge && (
          (step.highlightEdge[0] === i && step.highlightEdge[1] === j) ||
          (step.highlightEdge[0] === j && step.highlightEdge[1] === i)
        );
        if (isHl) {
          cell.style.background = step.highlightAction === 'add'
            ? 'rgba(16, 185, 129, 0.9)'
            : 'rgba(239, 68, 68, 0.6)';
          cell.style.color = step.highlightAction === 'add' ? '#022c22' : '#fff';
          cell.style.animation = 'pulse 0.8s infinite';
        }
        div?.appendChild(cell);
      }
    }
    this.matrixViewEl?.appendChild(div);
  }

  private renderList(step: GTStep): void {
    if (!this.listViewEl) return;
    this.listViewEl.innerHTML = '';
    const list = step.adjList;
    list.forEach((neighbors, i) => {
      const item = document.createElement('div');
      item.className = 'gt-list-item';

      const nodeDiv = document.createElement('div');
      nodeDiv.className = 'gt-list-node';
      nodeDiv.textContent = String(i);
      item?.appendChild(nodeDiv);

      const edgesDiv = document.createElement('div');
      edgesDiv.className = 'gt-list-edges';
      if (neighbors.length === 0) {
        const empty = document.createElement('span');
        empty.className = 'gt-list-edge';
        empty.textContent = '(无邻居)';
        empty.style.opacity = '0.4';
        edgesDiv?.appendChild(empty);
      } else {
        neighbors.forEach(n => {
          const edge = document.createElement('span');
          edge.className = 'gt-list-edge';
          const isHl = step.highlightEdge && (
            (step.highlightEdge[0] === i && step.highlightEdge[1] === n) ||
            (step.highlightEdge[0] === n && step.highlightEdge[1] === i)
          );
          if (isHl) {
            edge.style.background = step.highlightAction === 'add'
              ? 'rgba(16, 185, 129, 0.5)'
              : 'rgba(239, 68, 68, 0.4)';
            edge.style.animation = 'pulse 0.8s infinite';
          }
          edge.textContent = `\u2192 ${n}`;
          edgesDiv?.appendChild(edge);
        });
      }
      item?.appendChild(edgesDiv);
      this.listViewEl?.appendChild(item);
    });
  }

  private renderLogLine(step: GTStep): void {
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
  id: 'graph-theory',
  name: '图论理论基础',
  viewId: 'algo-graph-theory-view',
  category: 'graph',
  description: '图的表示方法：邻接矩阵、邻接表、有向/无向、加权/无权',
  icon: '🕸️',
  template,
  Visualizer: GraphTheoryVisualizer,
  difficulty: 1,
  levelOrder: 1,
  learningGoal: '掌握图的两种基本表示方法及适用场景',
});

export {};
