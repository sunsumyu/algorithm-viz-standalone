/**
 * 多余的边可视化器 (LeetCode 684)
 * 使用并查集检测环，找到多余的边
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './redundant-edge.html?raw';

interface REStep {
  nodes: number[];
  allEdges: [number, number][];
  acceptedEdges: [number, number][];
  currentEdgeIdx: number;
  redundantEdge: [number, number] | null;
  parent: number[];
  rank: number[];
  findU: number;
  findV: number;
  action: 'init' | 'check' | 'union' | 'redundant' | 'done';
  statusLabel: string;
  edgeLog: { edge: [number, number]; status: 'accepted' | 'redundant' | 'pending' }[];
  message: string;
  log: string;
  codeLine: number | number[];
}

const RE_NODE_POSITIONS = [
  { x: 100, y: 60 },
  { x: 240, y: 40 },
  { x: 380, y: 60 },
  { x: 310, y: 170 },
  { x: 160, y: 170 },
];

function buildRESteps(): REStep[] {
  const steps: REStep[] = [];
  const allEdges: [number, number][] = [[1, 2], [1, 3], [2, 3], [3, 4], [1, 5]];
  const n = 5;
  const nodes = Array.from({ length: n }, (_, i) => i + 1);

  let parent = Array.from({ length: n + 1 }, (_, i) => i);
  let rank = new Array(n + 1).fill(0);
  const acceptedEdges: [number, number][] = [];
  const edgeLog: { edge: [number, number]; status: 'accepted' | 'redundant' | 'pending' }[] = allEdges.map(e => ({ edge: [...e] as [number, number], status: 'pending' as const }));

  const find = (x: number, p: number[]): number => {
    while (p[x] !== x) x = p[x];
    return x;
  };

  const snap = (action: REStep['action'], edgeIdx: number, findU: number, findV: number, redundant: [number, number] | null, statusLabel: string, msg: string, log: string, code: number | number[]) => {
    steps.push({
      nodes: [...nodes],
      allEdges: allEdges.map(e => [...e] as [number, number]),
      acceptedEdges: acceptedEdges.map(e => [...e] as [number, number]),
      currentEdgeIdx: edgeIdx,
      redundantEdge: redundant,
      parent: [...parent],
      rank: [...rank],
      findU,
      findV,
      action,
      statusLabel,
      edgeLog: edgeLog.map(e => ({ ...e })),
      message: msg,
      log,
      codeLine: code,
    });
  };

  snap('init', -1, -1, -1, null, '初始化', `图有 ${nodes.length} 个节点和 ${allEdges.length} 条边。一棵树有 n-1=${n - 1} 条边，多了 1 条边形成环。用并查集逐条检测。`, '初始化: 5节点5边', 0);

  // Process edges: [1,2], [1,3], [2,3], [3,4], [1,5]
  // Edge [1,2]: find(1)=1, find(2)=2, different -> union
  {
    const u = 1, v = 2;
    const ru = find(u, parent), rv = find(v, parent);
    snap('check', 0, ru, rv, null, '检查', `处理边 [${u},${v}]：find(${u})=${ru}，find(${v})=${rv}。根不同，不会形成环。`, `检查边[1,2]: find(1)=1, find(2)=2`, [1, 2]);
    // union
    parent[ru] = rv;
    rank[rv] = Math.max(rank[rv], rank[ru] + 1);
    acceptedEdges.push([u, v]);
    edgeLog[0].status = 'accepted';
    snap('union', 0, ru, rv, null, '合并', `合并集合 ${ru} 和 ${rv}。parent[${ru}]=${rv}。边 [${u},${v}] 被接受。`, `union(1,2): 接受`, [3, 4]);
  }

  // Edge [1,3]: find(1)=2, find(3)=3, different -> union
  {
    const u = 1, v = 3;
    const ru = find(u, parent), rv = find(v, parent);
    snap('check', 1, ru, rv, null, '检查', `处理边 [${u},${v}]：find(${u})=${ru}，find(${v})=${rv}。根不同，不会形成环。`, `检查边[1,3]: find(1)=2, find(3)=3`, [1, 2]);
    parent[ru] = rv;
    rank[rv] = Math.max(rank[rv], rank[ru] + 1);
    acceptedEdges.push([u, v]);
    edgeLog[1].status = 'accepted';
    snap('union', 1, ru, rv, null, '合并', `合并集合 ${ru} 和 ${rv}。parent[${ru}]=${rv}。边 [${u},${v}] 被接受。`, `union(1,3): 接受`, [3, 4]);
  }

  // Edge [2,3]: find(2)=3, find(3)=3, SAME -> REDUNDANT!
  {
    const u = 2, v = 3;
    const ru = find(u, parent), rv = find(v, parent);
    snap('check', 2, ru, rv, null, '检查', `处理边 [${u},${v}]：find(${u})=${ru}，find(${v})=${rv}。`, `检查边[2,3]: find(2)=3, find(3)=3`, [1, 2]);
    edgeLog[2].status = 'redundant';
    snap('redundant', 2, ru, rv, [u, v], '多余!', `find(${u}) = find(${v}) = ${ru}！两端属于同一集合！边 [${u},${v}] 构成环，为多余边！`, `发现多余边: [2,3]!`, [5, 6]);
  }

  snap('done', 4, -1, -1, [2, 3], '完成', `多余边为 [2, 3]。移除该边后图变为一棵树（无环）。算法使用并查集，时间复杂度接近 O(n)。`, `完成: 多余边=[2,3]`, 7);

  return steps;
}

export class RedundantEdgeVisualizer extends StepVisualizer<REStep> {
  protected codeLines = [
    'int[] findRedundantEdge(int[][] edges) {',
    '    int[] parent = {0,1,2,3,4,5};',
    '    for (int[] edge : edges) {',
    '        int ru = find(edge[0]), rv = find(edge[1]);',
    '        if (ru != rv) union(ru, rv);',
    '        else return edge; // cycle!',
    '    }',
    '}',
  ];
  protected codePanelTitle = '多余边检测代码 (Java)';

  private graphEl: HTMLElement | null = null;
  private edgeListEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private edgeEl: HTMLElement | null = null;
  private findUEl: HTMLElement | null = null;
  private findVEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.graphEl = this.root.querySelector('#re-graph');
    this.edgeListEl = this.root.querySelector('#re-edge-list');
    this.logEl = this.root.querySelector('#re-log');
    this.edgeEl = this.root.querySelector('#re-edge');
    this.findUEl = this.root.querySelector('#re-findu');
    this.findVEl = this.root.querySelector('#re-findv');
    this.statusEl = this.root.querySelector('#re-status');
    this.btnStart = this.root.querySelector('#re-start');
    this.bindPlaybackControls({
      speed: 're-speed',
      speedLabel: 're-speed-label',
      message: 'step-message',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
  }

  protected buildSteps(): REStep[] {
    return buildRESteps();
  }

  protected renderStep(step: REStep): void {
    if (this.edgeEl) this.edgeEl.textContent = step.currentEdgeIdx >= 0 ? `[${step.allEdges[step.currentEdgeIdx].join(',')}]` : '-';
    if (this.findUEl) this.findUEl.textContent = step.findU >= 0 ? String(step.findU) : '-';
    if (this.findVEl) this.findVEl.textContent = step.findV >= 0 ? String(step.findV) : '-';
    if (this.statusEl) {
      this.statusEl.textContent = step.statusLabel;
      if (step.action === 'redundant') {
        (this.statusEl as HTMLElement).style.color = '#ef4444';
      } else if (step.action === 'done') {
        (this.statusEl as HTMLElement).style.color = '#10b981';
      } else {
        (this.statusEl as HTMLElement).style.color = '#f43f5e';
      }
    }

    this.renderGraph(step);
    this.renderEdgeLog(step);
    this.renderLogLine(step);
  }

  private renderGraph(step: REStep): void {
    if (!this.graphEl) return;
    this.graphEl.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 460 240');
    svg.style.width = '100%';
    svg.style.maxWidth = '460px';
    svg.style.height = '240px';

    const nodeIdx = (n: number) => n - 1;

    // Draw accepted edges
    for (const [u, v] of step.acceptedEdges) {
      const p1 = RE_NODE_POSITIONS[nodeIdx(u)];
      const p2 = RE_NODE_POSITIONS[nodeIdx(v)];
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(p1.x));
      line.setAttribute('y1', String(p1.y));
      line.setAttribute('x2', String(p2.x));
      line.setAttribute('y2', String(p2.y));
      line.setAttribute('stroke', '#10b981');
      line.setAttribute('stroke-width', '3');
      line.classList.add('re-edge');
      svg?.appendChild(line);
    }

    // Draw current or redundant edge
    if (step.currentEdgeIdx >= 0) {
      const [u, v] = step.allEdges[step.currentEdgeIdx];
      const p1 = RE_NODE_POSITIONS[nodeIdx(u)];
      const p2 = RE_NODE_POSITIONS[nodeIdx(v)];
      const isAccepted = step.acceptedEdges.some(e => (e[0] === u && e[1] === v) || (e[0] === v && e[1] === u));
      if (!isAccepted) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(p1.x));
        line.setAttribute('y1', String(p1.y));
        line.setAttribute('x2', String(p2.x));
        line.setAttribute('y2', String(p2.y));
        if (step.redundantEdge && step.redundantEdge[0] === u && step.redundantEdge[1] === v) {
          line.setAttribute('stroke', '#ef4444');
          line.setAttribute('stroke-width', '4');
          line.setAttribute('stroke-dasharray', '8,4');
          line.style.animation = 'pathPulse 1s infinite';
        } else {
          line.setAttribute('stroke', '#f43f5e');
          line.setAttribute('stroke-width', '2');
          line.setAttribute('stroke-dasharray', '6,3');
        }
        line.classList.add('re-edge');
        svg?.appendChild(line);
      }
    }

    // Draw pending edges (dimmed)
    for (let i = 0; i < step.allEdges.length; i++) {
      const [u, v] = step.allEdges[i];
      const isProcessed = i <= step.currentEdgeIdx || step.acceptedEdges.some(e => (e[0] === u && e[1] === v) || (e[0] === v && e[1] === u));
      if (!isProcessed) {
        const p1 = RE_NODE_POSITIONS[nodeIdx(u)];
        const p2 = RE_NODE_POSITIONS[nodeIdx(v)];
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', String(p1.x));
        line.setAttribute('y1', String(p1.y));
        line.setAttribute('x2', String(p2.x));
        line.setAttribute('y2', String(p2.y));
        line.setAttribute('stroke', 'rgba(244, 63, 94, 0.15)');
        line.setAttribute('stroke-width', '1.5');
        line.classList.add('re-edge');
        svg?.appendChild(line);
      }
    }

    // Draw nodes
    for (let i = 0; i < step.nodes.length; i++) {
      const node = step.nodes[i];
      const pos = RE_NODE_POSITIONS[i];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('re-node');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(pos.x));
      circle.setAttribute('cy', String(pos.y));
      circle.setAttribute('r', '22');

      const isRedundantNode = step.redundantEdge && (step.redundantEdge[0] === node || step.redundantEdge[1] === node);
      const isCurrentEdge = step.currentEdgeIdx >= 0 && !step.redundantEdge &&
        (step.allEdges[step.currentEdgeIdx][0] === node || step.allEdges[step.currentEdgeIdx][1] === node);

      if (isRedundantNode && step.action === 'redundant') {
        circle.setAttribute('fill', 'rgba(239, 68, 68, 0.3)');
        circle.setAttribute('stroke', '#ef4444');
        circle.setAttribute('stroke-width', '3');
        circle.style.animation = 'pulse 0.8s infinite';
      } else if (isCurrentEdge) {
        circle.setAttribute('fill', '#f59e0b');
        circle.setAttribute('stroke', '#f59e0b');
        circle.setAttribute('stroke-width', '3');
        circle.style.animation = 'pulse 0.8s infinite';
      } else {
        circle.setAttribute('fill', 'rgba(244, 63, 94, 0.2)');
        circle.setAttribute('stroke', '#f43f5e');
        circle.setAttribute('stroke-width', '2');
      }
      g?.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(pos.x));
      text.setAttribute('y', String(pos.y + 6));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', isRedundantNode && step.action === 'redundant' ? '#ef4444' : isCurrentEdge ? '#000' : '#f43f5e');
      text.setAttribute('font-size', '15');
      text.setAttribute('font-weight', '700');
      text.setAttribute('font-family', 'ui-monospace, monospace');
      text.textContent = String(node);
      g?.appendChild(text);

      svg?.appendChild(g);
    }

    this.graphEl?.appendChild(svg);
  }

  private renderEdgeLog(step: REStep): void {
    if (!this.edgeListEl) return;
    this.edgeListEl.innerHTML = '';
    step.edgeLog.forEach(({ edge, status }) => {
      const item = document.createElement('div');
      item.className = 're-edge-item';
      if (status === 'accepted') item.classList.add('accepted');
      if (status === 'redundant') item.classList.add('redundant');
      item.textContent = `[${edge.join(',')}]`;
      this.edgeListEl?.appendChild(item);
    });
  }

  private renderLogLine(step: REStep): void {
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
  id: 'redundant-edge',
  name: '多余的边',
  viewId: 'algo-redundant-edge-view',
  category: 'graph',
  description: 'LeetCode 684: 用并查集检测环，找到多余的边',
  icon: '✂️',
  template,
  Visualizer: RedundantEdgeVisualizer,
  difficulty: 2,
  levelOrder: 16,
  learningGoal: '掌握用并查集检测图中的环',
});

export {};
