/**
 * 最小生成树 Kruskal 算法可视化器
 * 按权重排序边，使用并查集避免环
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './mst-kruskal.html?raw';

interface MSTKStep {
  nodes: number[];
  edges: { u: number; v: number; w: number }[];
  sortedEdges: { u: number; v: number; w: number }[];
  mstEdges: { u: number; v: number; w: number }[];
  currentEdgeIdx: number;
  totalWeight: number;
  parent: number[];
  rank: number[];
  decision: string;
  edgeStatus: ('pending' | 'current' | 'accepted' | 'rejected')[];
  action: 'init' | 'check' | 'accept' | 'reject' | 'done';
  message: string;
  log: string;
  codeLine: number | number[];
}

const MSTK_NODES = [0, 1, 2, 3, 4];
const MSTK_EDGES = [
  { u: 0, v: 1, w: 4 },
  { u: 0, v: 2, w: 3 },
  { u: 1, v: 2, w: 1 },
  { u: 1, v: 3, w: 2 },
  { u: 2, v: 3, w: 4 },
  { u: 2, v: 4, w: 5 },
  { u: 3, v: 4, w: 2 },
];
const MSTK_NODE_POSITIONS = [
  { x: 100, y: 80 },
  { x: 350, y: 80 },
  { x: 100, y: 220 },
  { x: 350, y: 220 },
  { x: 225, y: 300 },
];

function buildMSTKruskalSteps(): MSTKStep[] {
  const steps: MSTKStep[] = [];
  const n = MSTK_NODES.length;

  // Sort edges by weight
  const sortedEdges = [...MSTK_EDGES].sort((a, b) => a.w - b.w);
  const edges = MSTK_EDGES.map(e => ({ ...e }));

  let parent = Array.from({ length: n }, (_, i) => i);
  let rank = new Array(n).fill(0);
  const mstEdges: { u: number; v: number; w: number }[] = [];
  let totalWeight = 0;

  const edgeStatus: ('pending' | 'current' | 'accepted' | 'rejected')[] = sortedEdges.map(() => 'pending');

  const find = (x: number, p: number[]): number => {
    while (p[x] !== x) x = p[x];
    return x;
  };

  const snap = (action: MSTKStep['action'], edgeIdx: number, decision: string, msg: string, log: string, code: number | number[]) => {
    steps.push({
      nodes: [...MSTK_NODES],
      edges: edges.map(e => ({ ...e })),
      sortedEdges: sortedEdges.map(e => ({ ...e })),
      mstEdges: mstEdges.map(e => ({ ...e })),
      currentEdgeIdx: edgeIdx,
      totalWeight,
      parent: [...parent],
      rank: [...rank],
      decision,
      edgeStatus: [...edgeStatus],
      action,
      message: msg,
      log,
      codeLine: code,
    });
  };

  // Init
  snap('init', -1, '-', `初始化 ${n} 个节点的加权图，共 ${sortedEdges.length} 条边。按权重排序后依次检查。`, '初始化: 排序边列表', 0);

  // Process each edge in sorted order
  for (let i = 0; i < sortedEdges.length; i++) {
    const edge = sortedEdges[i];
    edgeStatus[i] = 'current';

    const ru = find(edge.u, parent);
    const rv = find(edge.v, parent);

    if (ru !== rv) {
      // Accept edge
      snap('check', i, '检查', `检查边 (${edge.u},${edge.v}) w=${edge.w}: find(${edge.u})=${ru}, find(${edge.v})=${rv}。根不同，不会成环。`, `检查边[${edge.u},${edge.v}]w=${edge.w}: 根不同`, [1, 2]);

      // Union
      if (rank[ru] < rank[rv]) {
        parent[ru] = rv;
      } else if (rank[ru] > rank[rv]) {
        parent[rv] = ru;
      } else {
        parent[ru] = rv;
        rank[rv]++;
      }

      mstEdges.push(edge);
      totalWeight += edge.w;
      edgeStatus[i] = 'accepted';
      snap('accept', i, '接受', `接受边 (${edge.u},${edge.v}) w=${edge.w}，加入 MST。合并集合 ${ru} 和 ${rv}。当前 MST 权重=${totalWeight}。`, `接受[${edge.u},${edge.v}]w=${edge.w}, MST权重=${totalWeight}`, [3, 4]);
    } else {
      // Reject edge (would form cycle)
      snap('check', i, '检查', `检查边 (${edge.u},${edge.v}) w=${edge.w}: find(${edge.u})=${ru}, find(${edge.v})=${rv}。根相同，会形成环！`, `检查边[${edge.u},${edge.v}]w=${edge.w}: 根相同`, [1, 2]);
      edgeStatus[i] = 'rejected';
      snap('reject', i, '拒绝', `拒绝边 (${edge.u},${edge.v}) w=${edge.w}，因为两端在同一集合，加入会形成环。`, `拒绝[${edge.u},${edge.v}]w=${edge.w}: 成环`, [5, 6]);
    }
  }

  // Done
  snap('done', -1, '完成', `Kruskal 算法完成！MST 包含 ${mstEdges.length} 条边，总权重=${totalWeight}。`, `完成: MST权重=${totalWeight}`, 7);

  return steps;
}

export class MSTKruskalVisualizer extends StepVisualizer<MSTKStep> {
  protected codeLines = [
    'int kruskal(int[][] edges, int n) {',
    '    Arrays.sort(edges, (a, b) -> a[2] - b[2]);',
    '    int[] parent = new int[n]; // init: parent[i]=i',
    '    for (int[] edge : edges) {',
    '        if (find(u) != find(v)) {',
    '            union(u, v); mstEdges.add(edge);',
    '        } else {',
    '            continue; // would form cycle',
    '        }',
    '    }',
    '}',
  ];
  protected codePanelTitle = 'Kruskal 算法代码 (Java)';

  private graphEl: HTMLElement | null = null;
  private edgeListEl: HTMLElement | null = null;
  private parentEl: HTMLElement | null = null;
  private rankEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private currentEl: HTMLElement | null = null;
  private edgesEl: HTMLElement | null = null;
  private weightEl: HTMLElement | null = null;
  private decisionEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.graphEl = this.root.querySelector('#mstk-graph');
    this.edgeListEl = this.root.querySelector('#mstk-edge-list');
    this.parentEl = this.root.querySelector('#mstk-parent');
    this.rankEl = this.root.querySelector('#mstk-rank');
    this.logEl = this.root.querySelector('#mstk-log');
    this.currentEl = this.root.querySelector('#mstk-current');
    this.edgesEl = this.root.querySelector('#mstk-edges');
    this.weightEl = this.root.querySelector('#mstk-weight');
    this.decisionEl = this.root.querySelector('#mstk-decision');
    this.btnStart = this.root.querySelector('#mstk-start');
    this.bindPlaybackControls({
      speed: 'mstk-speed',
      speedLabel: 'mstk-speed-label',
      message: 'step-message',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
  }

  protected buildSteps(): MSTKStep[] {
    return buildMSTKruskalSteps();
  }

  protected renderStep(step: MSTKStep): void {
    if (this.currentEl) {
      if (step.currentEdgeIdx >= 0) {
        const e = step.sortedEdges[step.currentEdgeIdx];
        this.currentEl.textContent = `(${e.u},${e.v})w=${e.w}`;
      } else {
        this.currentEl.textContent = '-';
      }
    }
    if (this.edgesEl) this.edgesEl.textContent = String(step.mstEdges.length);
    if (this.weightEl) this.weightEl.textContent = String(step.totalWeight);
    if (this.decisionEl) {
      this.decisionEl.textContent = step.decision;
      if (step.action === 'accept') {
        (this.decisionEl as HTMLElement).style.color = '#22c55e';
      } else if (step.action === 'reject') {
        (this.decisionEl as HTMLElement).style.color = '#ef4444';
      } else {
        (this.decisionEl as HTMLElement).style.color = '#14b8a6';
      }
    }

    this.renderGraph(step);
    this.renderEdgeList(step);
    this.renderUF(step);
    this.renderLogLine(step);
  }

  private renderGraph(step: MSTKStep): void {
    if (!this.graphEl) return;
    this.graphEl.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 450 340');
    svg.style.width = '100%';
    svg.style.maxWidth = '450px';
    svg.style.height = '320px';

    const isMSTEdge = (u: number, v: number) =>
      step.mstEdges.some(e => (e.u === u && e.v === v) || (e.u === v && e.v === u));

    const isCurrentEdge = (u: number, v: number) =>
      step.currentEdgeIdx >= 0 &&
      step.sortedEdges[step.currentEdgeIdx].u === u &&
      step.sortedEdges[step.currentEdgeIdx].v === v;

    // Draw edges
    for (const edge of step.edges) {
      const p1 = MSTK_NODE_POSITIONS[edge.u];
      const p2 = MSTK_NODE_POSITIONS[edge.v];
      const isMST = isMSTEdge(edge.u, edge.v);
      const isCurrent = isCurrentEdge(edge.u, edge.v);
      const isRejected = step.edgeStatus.some((s, i) =>
        s === 'rejected' &&
        step.sortedEdges[i].u === edge.u &&
        step.sortedEdges[i].v === edge.v
      );

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(p1.x));
      line.setAttribute('y1', String(p1.y));
      line.setAttribute('x2', String(p2.x));
      line.setAttribute('y2', String(p2.y));

      if (isCurrent) {
        line.setAttribute('stroke', '#f59e0b');
        line.setAttribute('stroke-width', '4');
        line.style.animation = 'pathPulse 1s infinite';
      } else if (isMST) {
        line.setAttribute('stroke', '#22c55e');
        line.setAttribute('stroke-width', '3');
      } else if (isRejected) {
        line.setAttribute('stroke', 'rgba(239, 68, 68, 0.3)');
        line.setAttribute('stroke-width', '2');
        line.setAttribute('stroke-dasharray', '4,4');
      } else {
        line.setAttribute('stroke', 'rgba(20, 184, 166, 0.2)');
        line.setAttribute('stroke-width', '1.5');
      }
      line.classList.add('mstk-edge');
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
      bg.setAttribute('fill', isCurrent ? 'rgba(245, 158, 11, 0.3)' : isMST ? 'rgba(34, 197, 94, 0.3)' : 'rgba(30, 30, 50, 0.8)');
      bg.setAttribute('stroke', isCurrent ? '#f59e0b' : isMST ? '#22c55e' : 'rgba(156, 163, 175, 0.4)');
      bg.setAttribute('stroke-width', '1');
      svg?.appendChild(bg);

      const wt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      wt.setAttribute('x', String(mx));
      wt.setAttribute('y', String(my + 5));
      wt.setAttribute('text-anchor', 'middle');
      wt.setAttribute('fill', isCurrent ? '#f59e0b' : isMST ? '#22c55e' : 'rgba(156, 163, 175, 0.7)');
      wt.setAttribute('font-size', '12');
      wt.setAttribute('font-weight', '700');
      wt.setAttribute('font-family', 'ui-monospace, monospace');
      wt.textContent = String(edge.w);
      svg?.appendChild(wt);
    }

    // Draw nodes
    const mstNodes = new Set<number>();
    step.mstEdges.forEach(e => {
      mstNodes.add(e.u);
      mstNodes.add(e.v);
    });

    for (let i = 0; i < step.nodes.length; i++) {
      const pos = MSTK_NODE_POSITIONS[i];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('mstk-node');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(pos.x));
      circle.setAttribute('cy', String(pos.y));
      circle.setAttribute('r', '24');

      if (mstNodes.has(i)) {
        circle.setAttribute('fill', 'rgba(34, 197, 94, 0.4)');
        circle.setAttribute('stroke', '#22c55e');
        circle.setAttribute('stroke-width', '2');
      } else {
        circle.setAttribute('fill', 'rgba(20, 184, 166, 0.15)');
        circle.setAttribute('stroke', '#14b8a6');
        circle.setAttribute('stroke-width', '2');
      }
      g?.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(pos.x));
      text.setAttribute('y', String(pos.y + 6));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', mstNodes.has(i) ? '#22c55e' : '#14b8a6');
      text.setAttribute('font-size', '15');
      text.setAttribute('font-weight', '700');
      text.setAttribute('font-family', 'ui-monospace, monospace');
      text.textContent = String(i);
      g?.appendChild(text);

      svg?.appendChild(g);
    }

    this.graphEl?.appendChild(svg);
  }

  private renderEdgeList(step: MSTKStep): void {
    if (!this.edgeListEl) return;
    this.edgeListEl.innerHTML = '';
    step.sortedEdges.forEach((edge, i) => {
      const item = document.createElement('div');
      item.className = 'mstk-edge-item';
      const status = step.edgeStatus[i];
      if (status === 'current') item.classList.add('current');
      else if (status === 'accepted') item.classList.add('accepted');
      else if (status === 'rejected') item.classList.add('rejected');
      item.textContent = `(${edge.u},${edge.v})w=${edge.w}`;
      this.edgeListEl?.appendChild(item);
    });
  }

  private renderUF(step: MSTKStep): void {
    if (!this.parentEl) return;
    this.parentEl.innerHTML = '';
    const prevStep = this.currentIndex > 0 ? this.steps[this.currentIndex - 1] : null;
    step.parent.forEach((val, i) => {
      const item = document.createElement('div');
      item.className = 'mstk-uf-item';
      if (prevStep && prevStep.parent[i] !== val) item.classList.add('changed');
      item.innerHTML = `<span class="mstk-idx">${i}</span>${val}`;
      this.parentEl?.appendChild(item);
    });

    if (!this.rankEl) return;
    this.rankEl.innerHTML = '';
    step.rank.forEach((val, i) => {
      const item = document.createElement('div');
      item.className = 'mstk-uf-item';
      if (prevStep && prevStep.rank[i] !== val) item.classList.add('changed');
      item.innerHTML = `<span class="mstk-idx">${i}</span>${val}`;
      this.rankEl?.appendChild(item);
    });
  }

  private renderLogLine(step: MSTKStep): void {
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
  id: 'mst-kruskal',
  name: '最小生成树之 Kruskal 算法',
  viewId: 'algo-mst-kruskal-view',
  category: 'graph',
  description: 'Kruskal 贪心构建最小生成树，使用并查集判环',
  icon: '🌲',
  template,
  Visualizer: MSTKruskalVisualizer,
  difficulty: 3,
  levelOrder: 19,
  learningGoal: '理解 Kruskal 算法的贪心策略和并查集在判环中的应用',
});

export {};
