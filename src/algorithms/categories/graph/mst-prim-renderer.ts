/**
 * 最小生成树 Prim 算法可视化器
 * 从起点开始贪心构建 MST
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './mst-prim.html?raw';

interface MSTPrimStep {
  nodes: number[];
  edges: { u: number; v: number; w: number }[];
  mstEdges: { u: number; v: number; w: number }[];
  inMST: boolean[];
  dist: number[];
  currentNode: number | null;
  totalWeight: number;
  minEdgeLabel: string;
  action: 'init' | 'select' | 'update' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

const MSTP_NODES = [0, 1, 2, 3];
const MSTP_EDGES = [
  { u: 0, v: 1, w: 4 },
  { u: 0, v: 2, w: 3 },
  { u: 1, v: 2, w: 1 },
  { u: 1, v: 3, w: 2 },
  { u: 2, v: 3, w: 4 },
];
const MSTP_NODE_POSITIONS = [
  { x: 100, y: 80 },
  { x: 350, y: 80 },
  { x: 100, y: 220 },
  { x: 350, y: 220 },
];

function buildMSTPrimSteps(): MSTPrimStep[] {
  const steps: MSTPrimStep[] = [];
  const n = MSTP_NODES.length;
  const edges = MSTP_EDGES.map(e => ({ ...e }));

  let inMST = new Array(n).fill(false);
  let dist = new Array(n).fill(Infinity);
  const mstEdges: { u: number; v: number; w: number }[] = [];
  let totalWeight = 0;

  const snap = (action: MSTPrimStep['action'], current: number | null, minLabel: string, msg: string, log: string, code: number | number[]) => {
    steps.push({
      nodes: [...MSTP_NODES],
      edges: edges.map(e => ({ ...e })),
      mstEdges: mstEdges.map(e => ({ ...e })),
      inMST: [...inMST],
      dist: [...dist],
      currentNode: current,
      totalWeight,
      minEdgeLabel: minLabel,
      action,
      message: msg,
      log,
      codeLine: code,
    });
  };

  // Init
  snap('init', null, '-', `初始化 ${n} 个节点的加权图。从节点 0 开始构建 MST。dist 全部设为无穷大。`, '初始化: 从节点0开始', 0);

  // Start from node 0
  dist[0] = 0;
  snap('init', 0, '-', `将起点 0 加入 MST。更新邻居的 dist 值。`, '起点: 0, dist[0]=0', [1, 2]);

  // Process node 0: update neighbors
  inMST[0] = true;
  // Neighbors: 1(w=4), 2(w=3)
  dist[1] = 4;
  dist[2] = 3;
  snap('update', 0, '-', `节点 0 加入 MST。更新邻居: dist[1]=4 (边0-1), dist[2]=3 (边0-2)。`, '加入0: dist[1]=4, dist[2]=3', [3, 4]);

  // Select node 2 (min dist=3)
  let minNode = 2;
  snap('select', minNode, '边(0,2)w=3', `选择 dist 最小的非 MST 节点: 节点 2 (dist=3)。添加 MST 边 (0,2), 权重 3。`, '选节点2: MST边(0,2) w=3', [5, 6]);
  mstEdges.push({ u: 0, v: 2, w: 3 });
  totalWeight += 3;
  inMST[2] = true;
  // Update neighbors of 2: 0(already in MST), 1(w=1, 1<4 update), 3(w=4)
  if (1 < dist[1]) dist[1] = 1;
  dist[3] = 4;
  snap('update', 2, '边(0,2)w=3', `节点 2 加入 MST, 总权重=${totalWeight}。更新邻居: dist[1]=min(4,1)=1 (经2), dist[3]=4。`, '加入2: dist[1]=1, dist[3]=4', [3, 4]);

  // Select node 1 (min dist=1)
  minNode = 1;
  snap('select', minNode, '边(2,1)w=1', `选择 dist 最小的非 MST 节点: 节点 1 (dist=1)。添加 MST 边 (2,1), 权重 1。`, '选节点1: MST边(2,1) w=1', [5, 6]);
  mstEdges.push({ u: 2, v: 1, w: 1 });
  totalWeight += 1;
  inMST[1] = true;
  // Update neighbors of 1: 0(MST), 2(MST), 3(w=2, 2<4 update)
  if (2 < dist[3]) dist[3] = 2;
  snap('update', 1, '边(2,1)w=1', `节点 1 加入 MST, 总权重=${totalWeight}。更新邻居: dist[3]=min(4,2)=2 (经1)。`, '加入1: dist[3]=2', [3, 4]);

  // Select node 3 (min dist=2)
  minNode = 3;
  snap('select', minNode, '边(1,3)w=2', `选择 dist 最小的非 MST 节点: 节点 3 (dist=2)。添加 MST 边 (1,3), 权重 2。`, '选节点3: MST边(1,3) w=2', [5, 6]);
  mstEdges.push({ u: 1, v: 3, w: 2 });
  totalWeight += 2;
  inMST[3] = true;
  snap('update', 3, '边(1,3)w=2', `节点 3 加入 MST, 总权重=${totalWeight}。所有节点已加入 MST。`, '加入3: 全部完成', [3, 4]);

  // Done
  snap('done', null, '-', `MST 构建完成！MST 边: (0,2)w=3, (2,1)w=1, (1,3)w=2。总权重 = ${totalWeight}。共 ${mstEdges.length} 条边。`, `完成: MST权重=${totalWeight}`, 7);

  return steps;
}

export class MSTPrimVisualizer extends StepVisualizer<MSTPrimStep> {
  protected codeLines = [
    'int prim(List<int[]>[] adj, int start) {',
    '    int[] dist = new int[n]; Arrays.fill(dist, INF);',
    '    dist[start] = 0; boolean[] inMST = new boolean[n];',
    '    inMST[start] = true;',
    '    for (int[] edge : adj[u]) dist[v] = Math.min(dist[v], w);',
    '    int u = argmin(dist) where not inMST;',
    '    mstEdges.add(edge); totalWeight += w;',
    '}',
  ];
  protected codePanelTitle = 'Prim 算法代码 (Java)';

  private graphEl: HTMLElement | null = null;
  private distEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private currentEl: HTMLElement | null = null;
  private edgesEl: HTMLElement | null = null;
  private weightEl: HTMLElement | null = null;
  private minedgeEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.graphEl = this.root.querySelector('#mstp-graph');
    this.distEl = this.root.querySelector('#mstp-dist');
    this.logEl = this.root.querySelector('#mstp-log');
    this.currentEl = this.root.querySelector('#mstp-current');
    this.edgesEl = this.root.querySelector('#mstp-edges');
    this.weightEl = this.root.querySelector('#mstp-weight');
    this.minedgeEl = this.root.querySelector('#mstp-minedge');
    this.btnStart = this.root.querySelector('#mstp-start');
    this.bindPlaybackControls({
      speed: 'mstp-speed',
      speedLabel: 'mstp-speed-label',
      message: 'step-message',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
  }

  protected buildSteps(): MSTPrimStep[] {
    return buildMSTPrimSteps();
  }

  protected renderStep(step: MSTPrimStep): void {
    if (this.currentEl) this.currentEl.textContent = step.currentNode !== null ? String(step.currentNode) : '-';
    if (this.edgesEl) this.edgesEl.textContent = String(step.mstEdges.length);
    if (this.weightEl) this.weightEl.textContent = String(step.totalWeight);
    if (this.minedgeEl) this.minedgeEl.textContent = step.minEdgeLabel;

    this.renderGraph(step);
    this.renderDist(step);
    this.renderLogLine(step);
  }

  private renderGraph(step: MSTPrimStep): void {
    if (!this.graphEl) return;
    this.graphEl.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 450 300');
    svg.style.width = '100%';
    svg.style.maxWidth = '450px';
    svg.style.height = '280px';

    const isMSTEdge = (u: number, v: number) =>
      step.mstEdges.some(e => (e.u === u && e.v === v) || (e.u === v && e.v === u));

    // Draw edges
    for (const edge of step.edges) {
      const p1 = MSTP_NODE_POSITIONS[edge.u];
      const p2 = MSTP_NODE_POSITIONS[edge.v];
      const isMST = isMSTEdge(edge.u, edge.v);
      const isCurrent = step.currentNode !== null &&
        (edge.u === step.currentNode || edge.v === step.currentNode) && isMST;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(p1.x));
      line.setAttribute('y1', String(p1.y));
      line.setAttribute('x2', String(p2.x));
      line.setAttribute('y2', String(p2.y));

      if (isMST) {
        line.setAttribute('stroke', '#22c55e');
        line.setAttribute('stroke-width', isCurrent ? '4' : '3');
        if (isCurrent) line.style.animation = 'pathPulse 1.5s infinite';
      } else {
        line.setAttribute('stroke', 'rgba(156, 163, 175, 0.3)');
        line.setAttribute('stroke-width', '2');
      }
      line.classList.add('mstp-edge');
      svg?.appendChild(line);

      // Weight label
      const mx = (p1.x + p2.x) / 2;
      const my = (p1.y + p2.y) / 2;
      const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bg.setAttribute('x', String(mx - 12));
      bg.setAttribute('y', String(my - 10));
      bg.setAttribute('width', '24');
      bg.setAttribute('height', '20');
      bg.setAttribute('rx', '4');
      bg.setAttribute('fill', isMST ? 'rgba(34, 197, 94, 0.3)' : 'rgba(30, 30, 50, 0.8)');
      bg.setAttribute('stroke', isMST ? '#22c55e' : 'rgba(156, 163, 175, 0.4)');
      bg.setAttribute('stroke-width', '1');
      svg?.appendChild(bg);

      const wt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      wt.setAttribute('x', String(mx));
      wt.setAttribute('y', String(my + 5));
      wt.setAttribute('text-anchor', 'middle');
      wt.setAttribute('fill', isMST ? '#22c55e' : 'rgba(156, 163, 175, 0.7)');
      wt.setAttribute('font-size', '12');
      wt.setAttribute('font-weight', '700');
      wt.setAttribute('font-family', 'ui-monospace, monospace');
      wt.textContent = String(edge.w);
      svg?.appendChild(wt);
    }

    // Draw nodes
    for (let i = 0; i < step.nodes.length; i++) {
      const pos = MSTP_NODE_POSITIONS[i];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('mstp-node');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(pos.x));
      circle.setAttribute('cy', String(pos.y));
      circle.setAttribute('r', '24');

      if (step.currentNode === i) {
        circle.setAttribute('fill', '#f59e0b');
        circle.setAttribute('stroke', '#f59e0b');
        circle.setAttribute('stroke-width', '3');
        circle.style.animation = 'pulse 0.8s infinite';
      } else if (step.inMST[i]) {
        circle.setAttribute('fill', 'rgba(34, 197, 94, 0.4)');
        circle.setAttribute('stroke', '#16a34a');
        circle.setAttribute('stroke-width', '2');
      } else {
        circle.setAttribute('fill', 'rgba(34, 197, 94, 0.1)');
        circle.setAttribute('stroke', '#22c55e');
        circle.setAttribute('stroke-width', '2');
      }
      g?.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(pos.x));
      text.setAttribute('y', String(pos.y + 6));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', step.currentNode === i ? '#000' : step.inMST[i] ? '#16a34a' : '#22c55e');
      text.setAttribute('font-size', '15');
      text.setAttribute('font-weight', '700');
      text.setAttribute('font-family', 'ui-monospace, monospace');
      text.textContent = String(i);
      g?.appendChild(text);

      svg?.appendChild(g);
    }

    this.graphEl?.appendChild(svg);
  }

  private renderDist(step: MSTPrimStep): void {
    if (!this.distEl) return;
    this.distEl.innerHTML = '';
    const prevStep = this.currentIndex > 0 ? this.steps[this.currentIndex - 1] : null;
    step.dist.forEach((d, i) => {
      const item = document.createElement('div');
      item.className = 'mstp-dist-item';
      if (prevStep && prevStep.dist[i] !== d) item.classList.add('updated');
      const label = d === Infinity ? 'inf' : String(d);
      item.innerHTML = `<span class="mstp-idx">${i}</span>${label}`;
      this.distEl?.appendChild(item);
    });
  }

  private renderLogLine(step: MSTPrimStep): void {
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
  id: 'mst-prim',
  name: '最小生成树之 Prim 算法',
  viewId: 'algo-mst-prim-view',
  category: 'graph',
  description: 'Prim 贪心构建最小生成树可视化',
  icon: '🌳',
  template,
  Visualizer: MSTPrimVisualizer,
  difficulty: 3,
  levelOrder: 18,
  learningGoal: '理解 Prim 算法的贪心策略和 dist 数组的作用',
});

export {};
