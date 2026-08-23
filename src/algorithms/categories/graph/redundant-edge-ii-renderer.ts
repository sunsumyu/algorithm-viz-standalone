/**
 * 多余的边 II 可视化器 (LeetCode 685)
 * 有向图中找出多余的边，使图变为有根树
 */

import { StepVisualizer } from '../../../core/step-visualizer';
import { registerAlgorithm } from '../../../core/registry';
import template from './redundant-edge-ii.html?raw';

interface RE2Step {
  nodes: number[];
  allEdges: [number, number][];
  indegree: number[];
  currentEdgeIdx: number;
  redundantEdge: [number, number] | null;
  conflictNode: number;
  issueType: string;
  statusLabel: string;
  message: string;
  log: string;
  codeLine: number | number[];
}

// Directed graph: edges = [[1,2],[1,3],[2,3],[3,4],[4,2]]
// Node 2 has indegree 2 (from 1 and 4), and there's a cycle 2->3->4->2
// The redundant edge is [1,2] because removing it makes 4->2 the only parent of 2
// Actually let's use a simpler example: [[1,2],[2,3],[3,4],[4,1],[1,3]]
// Node 3 has two parents: 2 and 1. There's also a cycle 1->2->3->4->1
// Removing [1,3] fixes the conflict, but cycle remains. Removing [4,1] fixes cycle.
// Let's use: [[1,2],[2,3],[3,1],[1,4]] - cycle 1->2->3->1, node 1 has indegree 2 (from 3 and itself? no)
// Better example: [[2,1],[3,1],[4,2],[1,4]] - node 1 has parents 2 and 3
// Cycle: 1->4->2->1, so [2,1] is in the cycle and [3,1] is the conflict edge
// Remove [3,1] -> tree with root 3? No, root should be 3.
// Let's use a cleaner example:
// edges = [[1,2],[2,3],[3,4],[4,2]] - cycle 2->3->4->2, no conflict node
// Actually for the demo, let's use: edges = [[1,2],[1,3],[2,4],[3,4]]
// Node 4 has two parents: 2 and 3. No cycle. Remove [3,4].
// Or with cycle: edges = [[1,2],[2,3],[3,1],[4,1]]
// Node 1 has parents 3 and 4. Cycle: 1->2->3->1.
// Remove [3,1] to break cycle and fix conflict.

const RE2_NODES = [1, 2, 3, 4];
const RE2_EDGES: [number, number][] = [[1, 2], [2, 3], [3, 1], [4, 1]];
const RE2_NODE_POSITIONS = [
  { x: 120, y: 60 },   // node 1
  { x: 320, y: 60 },   // node 2
  { x: 320, y: 190 },  // node 3
  { x: 120, y: 190 },  // node 4
];

function buildRE2Steps(): RE2Step[] {
  const steps: RE2Step[] = [];
  const n = 4;
  const nodes = [...RE2_NODES];
  const allEdges = RE2_EDGES.map(e => [...e] as [number, number]);
  let indegree = new Array(n + 1).fill(0);

  // Calculate indegrees
  for (const [u, v] of allEdges) {
    indegree[v]++;
  }

  const snap = (action: RE2Step['issueType'] | 'init' | 'done', edgeIdx: number, conflict: number, issue: string, status: string, redundant: [number, number] | null, msg: string, log: string, code: number | number[]) => {
    steps.push({
      nodes: [...nodes],
      allEdges: allEdges.map(e => [...e] as [number, number]),
      indegree: [...indegree],
      currentEdgeIdx: edgeIdx,
      redundantEdge: redundant,
      conflictNode: conflict,
      issueType: issue,
      statusLabel: status,
      message: msg,
      log,
      codeLine: code,
    });
  };

  // Step 0: init
  snap('init', -1, 0, '分析中', '初始化', null,
    `有向图有 ${n} 个节点和 ${allEdges.length} 条边。一棵有根树应有 n-1=${n - 1} 条边，多了 1 条。分析入度和环。`,
    '初始化: 4节点4边', 0);

  // Step 1: Calculate indegrees
  snap('init', -1, 0, '分析中', '计算入度', null,
    `计算各节点入度: 节点1入度=${indegree[1]}(来自3和4), 节点2入度=${indegree[2]}(来自1), 节点3入度=${indegree[3]}(来自2), 节点4入度=${indegree[4]}(无)。`,
    '计算入度: [0,2,1,1,0]', [1]);

  // Step 2: Find conflict node (indegree=2)
  snap('init', -1, 1, '冲突检测', '发现冲突', null,
    `节点 1 的入度为 2（来自节点 3 和节点 4），存在冲突！需要判断删除哪条入边。`,
    '冲突: 节点1入度=2', [2, 3]);

  // Step 3: Show edges to node 1
  // Edges pointing to node 1: [3,1] and [4,1]
  snap('init', 2, 1, '冲突检测', '分析入边', null,
    `节点 1 的两条入边: [3→1] 和 [4→1]。需要判断删除哪一条。检查是否存在包含其中一条的环。`,
    '分析节点1的入边: [3,1],[4,1]', [4]);

  // Step 4: Detect cycle
  // Cycle: 1->2->3->1 (edges [1,2],[2,3],[3,1])
  snap('init', -1, 1, '环检测', '发现环', null,
    `检测到环: 1→2→3→1（边 [1,2], [2,3], [3,1]）。环中包含边 [3,1]。`,
    '环: 1→2→3→1', [5, 6]);

  // Step 5: Determine redundant edge
  snap('init', -1, 1, '决策', '确定多余边', [3, 1],
    `边 [3,1] 既在冲突中又在环中。删除 [3,1] 可同时解决冲突和环。删除后图变为有根树（根为4）。`,
    '多余边: [3,1]', [7, 8]);

  // Step 6: Show result
  snap('done', -1, 1, '完成', '完成', [3, 1],
    `多余边为 [3, 1]。删除后：4→1→2→3，形成以 4 为根的有根树。算法处理了冲突节点和环两种情况。`,
    '完成: 多余边=[3,1]', 9);

  return steps;
}

export class RedundantEdgeIIVisualizer extends StepVisualizer<RE2Step> {
  protected codeLines = [
    'int[] findRedundantDirectedEdge(int[][] edges) {',
    '    // 1. 计算入度，找冲突节点 (indegree==2)',
    '    // 2. 冲突节点有两条入边 e1, e2',
    '    // 3. 检查是否有环',
    '    // 4. 环中包含的入边为多余边',
    '    // 5. 若无环，删除后一条入边',
    '    return redundantEdge;',
    '}',
  ];
  protected codePanelTitle = '多余边II代码 (Java)';

  private graphEl: HTMLElement | null = null;
  private degreesEl: HTMLElement | null = null;
  private logEl: HTMLElement | null = null;
  private edgeEl: HTMLElement | null = null;
  private issueEl: HTMLElement | null = null;
  private maxinEl: HTMLElement | null = null;
  private statusEl: HTMLElement | null = null;

  protected initDOMElements(): void {
    if (!this.root) return;
    this.graphEl = this.root.querySelector('#re2-graph');
    this.degreesEl = this.root.querySelector('#re2-degrees');
    this.logEl = this.root.querySelector('#re2-log');
    this.edgeEl = this.root.querySelector('#re2-edge');
    this.issueEl = this.root.querySelector('#re2-issue');
    this.maxinEl = this.root.querySelector('#re2-maxin');
    this.statusEl = this.root.querySelector('#re2-status');
    this.btnStart = this.root.querySelector('#re2-start');
    this.bindPlaybackControls({
      speed: 're2-speed',
      speedLabel: 're2-speed-label',
      message: 'step-message',
    });
    if (this.btnStart) this.btnStart.onclick = () => this.start();
  }

  protected buildSteps(): RE2Step[] {
    return buildRE2Steps();
  }

  protected renderStep(step: RE2Step): void {
    if (this.edgeEl) this.edgeEl.textContent = step.currentEdgeIdx >= 0 ? `[${step.allEdges[step.currentEdgeIdx].join(',')}]` : '-';
    if (this.issueEl) this.issueEl.textContent = step.issueType;
    const maxIn = Math.max(...step.indegree);
    if (this.maxinEl) this.maxinEl.textContent = String(maxIn);
    if (this.statusEl) {
      this.statusEl.textContent = step.statusLabel;
      if (step.statusLabel === '完成') {
        (this.statusEl as HTMLElement).style.color = '#10b981';
      } else {
        (this.statusEl as HTMLElement).style.color = '#f59e0b';
      }
    }

    this.renderGraph(step);
    this.renderDegrees(step);
    this.renderLogLine(step);
  }

  private renderGraph(step: RE2Step): void {
    if (!this.graphEl) return;
    this.graphEl.innerHTML = '';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 440 260');
    svg.style.width = '100%';
    svg.style.maxWidth = '440px';
    svg.style.height = '250px';

    const nodeIdx = (n: number) => n - 1;

    // Draw edges
    for (let i = 0; i < step.allEdges.length; i++) {
      const [u, v] = step.allEdges[i];
      const p1 = RE2_NODE_POSITIONS[nodeIdx(u)];
      const p2 = RE2_NODE_POSITIONS[nodeIdx(v)];
      const isRedundant = step.redundantEdge && step.redundantEdge[0] === u && step.redundantEdge[1] === v;
      const isConflictEdge = step.conflictNode > 0 && v === step.conflictNode;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      // Offset line slightly for directed edges
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const len = Math.sqrt(dx * dx + dy * dy);
      const nx = dx / len;
      const ny = dy / len;
      const r = 24;
      line.setAttribute('x1', String(p1.x + nx * r));
      line.setAttribute('y1', String(p1.y + ny * r));
      line.setAttribute('x2', String(p2.x - nx * r));
      line.setAttribute('y2', String(p2.y - ny * r));

      if (isRedundant && step.statusLabel === '完成') {
        line.setAttribute('stroke', '#ef4444');
        line.setAttribute('stroke-width', '3');
        line.setAttribute('stroke-dasharray', '8,4');
        line.style.animation = 'pathPulse 1s infinite';
      } else if (isConflictEdge && step.conflictNode > 0) {
        line.setAttribute('stroke', '#f59e0b');
        line.setAttribute('stroke-width', '2.5');
      } else {
        line.setAttribute('stroke', 'rgba(245, 158, 11, 0.4)');
        line.setAttribute('stroke-width', '2');
      }
      line.classList.add('re2-edge');
      svg?.appendChild(line);

      // Arrowhead
      const angle = Math.atan2(dy, dx);
      const ax = p2.x - nx * (r + 2);
      const ay = p2.y - ny * (r + 2);
      const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const sz = 8;
      const pts = [
        `${ax + sz * Math.cos(angle)},${ay + sz * Math.sin(angle)}`,
        `${ax + sz * Math.cos(angle + 2.6)},${ay + sz * Math.sin(angle + 2.6)}`,
        `${ax + sz * Math.cos(angle - 2.6)},${ay + sz * Math.sin(angle - 2.6)}`,
      ].join(' ');
      arrow.setAttribute('points', pts);
      arrow.setAttribute('fill', isRedundant && step.statusLabel === '完成' ? '#ef4444' : isConflictEdge ? '#f59e0b' : 'rgba(245, 158, 11, 0.5)');
      svg?.appendChild(arrow);
    }

    // Draw nodes
    for (let i = 0; i < step.nodes.length; i++) {
      const node = step.nodes[i];
      const pos = RE2_NODE_POSITIONS[i];
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      g.classList.add('re2-node');

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', String(pos.x));
      circle.setAttribute('cy', String(pos.y));
      circle.setAttribute('r', '24');

      const isConflict = step.conflictNode === node;
      if (isConflict && step.conflictNode > 0) {
        circle.setAttribute('fill', 'rgba(239, 68, 68, 0.3)');
        circle.setAttribute('stroke', '#ef4444');
        circle.setAttribute('stroke-width', '3');
        circle.style.animation = 'pulse 0.8s infinite';
      } else {
        circle.setAttribute('fill', 'rgba(245, 158, 11, 0.2)');
        circle.setAttribute('stroke', '#f59e0b');
        circle.setAttribute('stroke-width', '2');
      }
      g?.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', String(pos.x));
      text.setAttribute('y', String(pos.y + 6));
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', isConflict ? '#ef4444' : '#f59e0b');
      text.setAttribute('font-size', '15');
      text.setAttribute('font-weight', '700');
      text.setAttribute('font-family', 'ui-monospace, monospace');
      text.textContent = String(node);
      g?.appendChild(text);

      svg?.appendChild(g);
    }

    this.graphEl?.appendChild(svg);
  }

  private renderDegrees(step: RE2Step): void {
    if (!this.degreesEl) return;
    this.degreesEl.innerHTML = '';
    step.nodes.forEach((node) => {
      const item = document.createElement('div');
      item.className = 're2-degree-item';
      if (step.indegree[node] >= 2) item.classList.add('high');
      item.innerHTML = `<span class="re2-idx">${node}</span>${step.indegree[node]}`;
      this.degreesEl?.appendChild(item);
    });
  }

  private renderLogLine(step: RE2Step): void {
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
  id: 'redundant-edge-ii',
  name: '多余的边 II',
  viewId: 'algo-redundant-edge-ii-view',
  category: 'graph',
  description: 'LeetCode 685: 有向图中找出多余的边',
  icon: '🔀',
  template,
  Visualizer: RedundantEdgeIIVisualizer,
  difficulty: 3,
  levelOrder: 17,
  learningGoal: '掌握有向图中检测冲突节点和环的方法',
});

export {};
